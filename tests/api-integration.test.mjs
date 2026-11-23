import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createApi } from '../lib/server/api.mjs';
import { initialConfig,initialProducts } from '../lib/seed.mjs';
const origin='http://127.0.0.1:8871';
test('API con PostgreSQL: permisos, precios, transacciones, historial y PDF',{skip:!process.env.TEST_DATABASE_URL},async t=>{
  const admin=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL,max:1}),name='rpm_test_'+randomUUID().replaceAll('-','');
  await admin.query(`CREATE DATABASE "${name}"`);
  const url=new URL(process.env.TEST_DATABASE_URL);url.pathname='/'+name;
  const db=new pg.Pool({connectionString:url.href,max:5});
  t.after(async()=>{await db.end();await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);await admin.end()});
  const setup=await readFile(new URL('../supabase/setup.sql',import.meta.url),'utf8');
  await db.query(setup);
  await db.query(setup);
  const owner={userId:'verified-owner',email:'owner@example.com',displayName:'Owner'},customer={userId:'verified-customer',email:'customer@example.com',displayName:'Customer'};
  let user=null,uploads=0;
  const api=createApi({db,getUser:async()=>user,ownerEmail:owner.email,putImage:async()=>{uploads++}});
  const call=(path,data,headers={})=>api(new Request(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(data!==undefined?{'Content-Type':'application/json',Origin:origin}:{}),...headers},...(data!==undefined?{body:JSON.stringify(data)}:{})}));
  await t.test('Visitante no obtiene permisos aunque falsifique encabezados',async()=>{assert.equal((await call('admin/catalog',undefined,{'x-user-email':owner.email,'x-user-id':owner.userId})).status,401);assert.deepEqual(await (await call('session')).json(),{user:null,role:null});});
  await t.test('Rechaza solicitudes de otro origen y acceso al historial sin sesión',async()=>{assert.equal((await call('quotes',{},{Origin:'https://otro.example'})).status,403);assert.equal((await call('history')).status,401);});
  let catalog;
  await t.test('Catálogo público y administración verificada',async()=>{catalog=await (await call('catalog')).json();assert.equal(catalog.products.length,10);user=owner;assert.equal((await call('admin/catalog')).status,200);});
  await t.test('Escalas y precios se calculan desde el servidor',async()=>{
    const p=structuredClone(catalog.products.find(p=>p.id===1));p.inventory[initialConfig.branches[0].id].tiers=[{min:6,priceCents:5000}];
    assert.equal((await call('admin/product',{product:p,version:p.version})).status,200);
    const q=await (await call('calculate',{branchId:initialConfig.branches[0].id,items:[{id:1,qty:6,priceCents:1}]})).json();assert.equal(q.lines[0].unitCents,5000);assert.equal(q.totalCents,30000);await db.query(setup);const after=await (await call('catalog')).json();assert.equal(after.products.find(x=>x.id===1).inventory[initialConfig.branches[0].id].tiers[0].priceCents,5000);
  });
  await t.test('Dos ediciones simultáneas no se sobrescriben',async()=>{
    const c=await (await call('admin/catalog')).json(),p=c.products.find(p=>p.id===2),before=c.config.version;
    const results=await Promise.all([call('admin/product',{product:{...p,name:'Edición A'},version:p.version}),call('admin/product',{product:{...p,name:'Edición B'},version:p.version})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
    const after=await (await call('admin/catalog')).json();assert.equal(after.config.version,before+1);assert.equal(after.products.find(x=>x.id===2).version,p.version+1);
  });
  await t.test('Una importación con conflicto revierte todas sus filas',async()=>{
    const c=await (await call('admin/catalog')).json(),first=structuredClone(c.products.find(p=>p.id===1)),second=structuredClone(c.products.find(p=>p.id===2));first.name='No debe guardarse';second.version=0;
    assert.equal((await call('admin/import',{products:[first,second]})).status,409);const after=await (await call('admin/catalog')).json();assert.equal(after.config.version,c.config.version);assert.equal(after.products.find(p=>p.id===1).name,c.products.find(p=>p.id===1).name);
  });
  await t.test('Importación nueva conserva secuencia y se ve entre equipos',async()=>{
    const p=structuredClone(initialProducts[0]);delete p.id;p.sku='RPM-REAL-001';p.name='Artículo importado';assert.equal((await call('admin/import',{products:[p]})).status,200);const c=await (await call('catalog')).json();assert(c.products.find(x=>x.sku===p.sku).id>10);
  });
  let saved;
  await t.test('Cotización, token de acceso y PDF',async()=>{
    user=null;saved=await (await call('quotes',{branchId:initialConfig.branches[0].id,items:[{id:1,qty:6}]})).json();assert.equal(saved.totalCents,30000);assert.match(saved.whatsappUrl,/^https:\/\/wa\.me\//);
    assert.equal((await call('quotes/'+saved.id)).status,403);assert.equal((await call('quotes/'+saved.id,undefined,{'X-Quote-Token':saved.token})).status,200);
    const response=await call('quotes/'+saved.id+'/pdf',{}, {'X-Quote-Token':saved.token});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,4).toString(),'%PDF');
  });
  await t.test('Historial propio y cotizaciones ajenas protegidas',async()=>{
    user=customer;const q=await (await call('quotes',{branchId:initialConfig.branches[0].id,items:[{id:2,qty:1}]})).json();assert.equal((await (await call('history')).json()).length,1);user={...customer,userId:'another-customer'};assert.equal((await call('quotes/'+q.id)).status,403);assert.equal((await (await call('history')).json()).length,0);
  });
  await t.test('Personal autorizado por correo verificado y sin permiso de cambiar accesos',async()=>{
    user=owner;assert.equal((await call('admin/members',{email:customer.email,role:'staff',active:true})).status,200);user=customer;assert.equal((await call('admin/catalog')).status,200);assert.equal((await call('admin/members',{email:'third@example.com',role:'owner',active:true})).status,403);
    user=owner;await call('admin/members',{email:customer.email,role:'staff',active:false});user=customer;assert.equal((await call('admin/catalog')).status,403);
  });
  await t.test('Rechaza fotos inválidas antes de tocar almacenamiento',async()=>{
    user=owner;const response=await api(new Request(origin+'/api/admin/upload',{method:'POST',headers:{Origin:origin,'Content-Type':'image/png'},body:'this is not an image'}));assert.equal(response.status,400);assert.equal(uploads,0);
  });
  await t.test('El historial migrado solo se vincula después de verificar su correo',async()=>{
    await db.query('INSERT INTO rpm.owner_mappings(legacy_id,email) VALUES($1,$2)',['legacy-customer',customer.email]);await db.query('UPDATE rpm.quotes SET owner_id=$1 WHERE id=$2',['legacy-customer',saved.id]);user=customer;const history=await (await call('history')).json();assert(history.some(q=>q.id===saved.id));
  });
});
