import { calculate, validateProduct, validateConfig, fail, whatsapp } from '../pricing.mjs';
import { transaction } from './database.mjs';
import { sameOrigin } from './config.mjs';
import { pdf } from './pdf.mjs';
const json = (data, status=200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const conflict = () => fail('Otro usuario modificó el catálogo. Actualiza y vuelve a revisar los cambios.',409);
export async function readBody(request) {
  if (!request.headers.get('content-type')?.includes('application/json')) fail('Se requiere JSON.',415);
  const text=await request.text(); if(text.length>2000000)fail('Carga demasiado grande.',413);
  try{return JSON.parse(text)}catch{fail('JSON inválido.')}
}
export const hashToken=async token=>Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))).toString('hex');
export function createApi({ db, getUser, ownerEmail, putImage }) {
  const audit=(client,user,action)=>client.query('INSERT INTO rpm.audit(actor,action) VALUES($1,$2)',[user.userId,action]);
  async function identity() {
    const user=await getUser();if(!user)return {user:null,role:null};
    const email=user.email.toLowerCase();
    const found=await db.query('SELECT * FROM rpm.members WHERE email=$1 AND active=true',[email]);
    let member=found.rows[0];
    if(member&&!member.user_id){await db.query('UPDATE rpm.members SET user_id=$1 WHERE email=$2 AND user_id IS NULL',[user.userId,email]);member=(await db.query('SELECT * FROM rpm.members WHERE email=$1 AND active=true',[email])).rows[0];}
    await db.query('UPDATE rpm.quotes SET owner_id=$1 WHERE owner_id IN (SELECT legacy_id FROM rpm.owner_mappings WHERE email=$2)',[user.userId,email]);
    return {user,role:ownerEmail&&email===ownerEmail?'owner':member?.user_id===user.userId?member.role:null};
  }
  async function admin(owner=false){const i=await identity();if(!i.user)fail('Inicia sesión para continuar.',401);if(!i.role||(owner&&i.role!=='owner'))fail('No tienes permiso para esta operación.',403);return i;}
  async function catalog(all=false,client=db){const settings=(await client.query("SELECT * FROM rpm.settings WHERE id='store'")).rows[0];if(!settings)fail('Prepara la base de datos antes de usar el catálogo.',503);const rows=(await client.query('SELECT * FROM rpm.products ORDER BY id DESC')).rows;return {config:{...settings.data,version:settings.version},products:rows.map(r=>({...r.data,id:r.id,version:r.version})).filter(p=>all||p.active),initialized:true};}
  async function bump(client,version){if(!(await client.query("UPDATE rpm.settings SET version=version+1 WHERE id='store' AND version=$1",[version])).rowCount)conflict();}
  async function storedQuote(id,request){const row=(await db.query('SELECT * FROM rpm.quotes WHERE id=$1',[id])).rows[0];if(!row)fail('Cotización no encontrada.',404);const token=request.headers.get('x-quote-token'),i=await identity();if(!(token&&await hashToken(token)===row.token_hash)&&!i.role&&!(i.user&&row.owner_id===i.user.userId))fail('Acceso denegado.',403);return {...row.data,status:row.status};}
  return async function handle(request) {
    try {
      const path=new URL(request.url).pathname.replace(/^\/api\//,'');
      if(request.method!=='GET')sameOrigin(request);
      if(path==='session'&&request.method==='GET')return json(await identity());
      if(path==='catalog'&&request.method==='GET')return json(await catalog());
      if(path==='calculate'&&request.method==='POST'){const c=await catalog();return json(calculate(c.products,c.config,await readBody(request)));}
      if(path==='quotes'&&request.method==='POST'){
        const c=await catalog(),q=calculate(c.products,c.config,await readBody(request));if(!q.valid)fail(q.issues[0]?.message||'Agrega productos.');
        const i=await identity(),token=crypto.randomUUID(),id=crypto.randomUUID(),saved={...q,id,createdAt:new Date().toISOString()};
        await db.query('INSERT INTO rpm.quotes(id,owner_id,token_hash,data,created_at) VALUES($1,$2,$3,$4::jsonb,$5)',[id,i.user?.userId||null,await hashToken(token),JSON.stringify(saved),saved.createdAt]);
        return json({...saved,token,whatsappUrl:'https://wa.me/'+q.branch.phone+'?text='+encodeURIComponent(whatsapp(saved))},201);
      }
      const match=path.match(/^quotes\/([a-f\d-]+)(\/pdf)?$/);
      if(match&&['GET','POST'].includes(request.method)){const q=await storedQuote(match[1],request);return match[2]?pdf(q):json(q);}
      if(path==='history'&&request.method==='GET'){const i=await identity();if(!i.user)fail('Inicia sesión.',401);return json((await db.query('SELECT data,status FROM rpm.quotes WHERE owner_id=$1 ORDER BY created_at DESC LIMIT 50',[i.user.userId])).rows.map(q=>({...q.data,status:q.status})));}
      if(!path.startsWith('admin/'))fail('Ruta no encontrada.',404);
      const i=await admin();
      if(path==='admin/catalog'&&request.method==='GET'){const c=await catalog(true);return json({...c,members:(await db.query('SELECT email,role,active FROM rpm.members ORDER BY email')).rows,ownerEmail});}
      if(path==='admin/initialize'&&request.method==='POST')fail('El catálogo ya está preparado.',409);
      if(path==='admin/product'&&request.method==='POST'){
        const c=await catalog(true),body=await readBody(request),p=validateProduct(body.product,c.config);
        await transaction(db,async tx=>{
          await bump(tx,c.config.version);
          if(p.id){const old=c.products.find(x=>x.id===p.id);if(!old||old.version!==body.version)conflict();const r=await tx.query('UPDATE rpm.products SET sku=$1,data=$2::jsonb,version=version+1 WHERE id=$3 AND version=$4',[p.sku,JSON.stringify(p),p.id,body.version]);if(!r.rowCount)conflict();}
          else await tx.query('INSERT INTO rpm.products(sku,data) VALUES($1,$2::jsonb)',[p.sku,JSON.stringify(p)]);
          await audit(tx,i.user,'Guardó artículo '+p.sku);
        });return json({ok:true});
      }
      if(path==='admin/config'&&request.method==='POST'){
        await admin(true);const b=await readBody(request),c=validateConfig(b.config),old=await catalog(true);for(const p of old.products)validateProduct(p,c);
        await transaction(db,async tx=>{if(!(await tx.query("UPDATE rpm.settings SET data=$1::jsonb,version=version+1 WHERE id='store' AND version=$2",[JSON.stringify(c),b.version])).rowCount)conflict();await audit(tx,i.user,'Cambió configuración comercial');});return json({ok:true});
      }
      if(path==='admin/members'&&request.method==='POST'){
        await admin(true);const b=await readBody(request),email=String(b.email||'').toLowerCase().trim();
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!['staff','owner'].includes(b.role)||typeof b.active!=='boolean')fail('Revisa correo y rol.');if(email===ownerEmail)fail('El administrador principal permanece activo.');
        await transaction(db,async tx=>{await tx.query('INSERT INTO rpm.members(email,role,active) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET role=EXCLUDED.role,active=EXCLUDED.active',[email,b.role,b.active]);await audit(tx,i.user,'Cambió acceso de '+email);});return json({ok:true});
      }
      if(path==='admin/quotes'&&request.method==='GET')return json((await db.query('SELECT data,status FROM rpm.quotes ORDER BY created_at DESC LIMIT 200')).rows.map(q=>({...q.data,status:q.status})));
      if(path==='admin/quote-status'&&request.method==='POST'){
        const b=await readBody(request);if(!['solicitud','en revisión','contactado','cerrado'].includes(b.status))fail('Estado inválido.');
        await transaction(db,async tx=>{if(!(await tx.query('UPDATE rpm.quotes SET status=$1 WHERE id=$2',[b.status,b.id])).rowCount)fail('Cotización no encontrada.',404);await audit(tx,i.user,'Actualizó cotización '+b.id);});return json({ok:true});
      }
      if(path==='admin/import'&&request.method==='POST'){
        const c=await catalog(true),b=await readBody(request);if(!Array.isArray(b.products)||!b.products.length||b.products.length>500)fail('Importa de 1 a 500 filas por lote.');
        const seen=new Set(),ps=b.products.map(p=>{validateProduct(p,c.config);if(seen.has(p.sku))fail('Código repetido: '+p.sku);seen.add(p.sku);return p;});
        await transaction(db,async tx=>{
          await bump(tx,c.config.version);
          for(const p of ps){const old=c.products.find(x=>x.sku===p.sku);if(old){if(old.version!==p.version)conflict();const r=await tx.query('UPDATE rpm.products SET data=$1::jsonb,version=version+1 WHERE id=$2 AND version=$3',[JSON.stringify({...p,id:old.id}),old.id,p.version]);if(!r.rowCount)conflict();}else await tx.query('INSERT INTO rpm.products(sku,data) VALUES($1,$2::jsonb)',[p.sku,JSON.stringify(p)]);}
          await audit(tx,i.user,'Importó '+ps.length+' artículos');
        });return json({count:ps.length});
      }
      if(path==='admin/upload'&&request.method==='POST'){
        const type=request.headers.get('content-type')||'',ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[type];if(!ext)fail('Usa imágenes JPG, PNG o WEBP.');
        const bytes=await request.arrayBuffer();if(bytes.byteLength>4*1024*1024||bytes.byteLength<12)fail('La imagen debe pesar menos de 4 MB.');
        const x=new Uint8Array(bytes),valid=ext==='jpg'?x[0]===255&&x[1]===216&&x[2]===255:ext==='png'?x[0]===137&&x[1]===80&&x[2]===78&&x[3]===71:String.fromCharCode(...x.slice(0,4))==='RIFF'&&String.fromCharCode(...x.slice(8,12))==='WEBP';if(!valid)fail('El contenido del archivo no corresponde a una imagen válida.');
        const key=crypto.randomUUID()+'.'+ext;await putImage(key,bytes,type);await audit(db,i.user,'Subió fotografía');return json({url:'/media/'+key});
      }
      fail('Ruta no encontrada.',404);
    } catch(error) {
      if(error.code==='23505')return json({error:'Ya existe un artículo con ese código. Actualiza el catálogo.'},409);
      console.error('RPM API',error.status||500,error.status?error.message:'internal-error');
      return json({error:error.status?error.message:'No fue posible completar la operación. Revisa la conexión e intenta de nuevo.'},error.status||500);
    }
  };
}
