import { readFile } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { database,transaction,closeDatabase } from '../lib/server/database.mjs';
import { validateConfig,validateProduct } from '../lib/pricing.mjs';
import { createClient } from '@supabase/supabase-js';
const file=process.argv[2];if(!file)throw Error('Uso: npm run db:import -- /ruta/export.json [--replace-demo]');
const data=JSON.parse(await readFile(file,'utf8')),config=validateConfig(data.config);
if(!Array.isArray(data.products)||!data.products.length)throw Error('Falta la lista de productos.');
const ids=new Set(),skus=new Set();for(const p of data.products){validateProduct(p,config);if(!Number.isSafeInteger(p.id)||p.id<1||ids.has(p.id)||skus.has(p.sku))throw Error('Identificadores o códigos repetidos.');ids.add(p.id);skus.add(p.sku);}
const quotes=data.quotes||[],members=data.members||[],mappings=data.ownerMappings||[];
for(const q of quotes)if(!/^[a-f\d-]{36}$/.test(q.id)||!/^[a-f\d]{64}$/.test(q.tokenHash)||!q.data?.createdAt)throw Error('Cotización inválida. Conserva id, tokenHash y data en la exportación.');
for(const m of [...members,...mappings])if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))throw Error('Correo de migración inválido.');
for(const m of members)if(!['owner','staff'].includes(m.role))throw Error('Permiso de personal inválido.');
// The destination must be empty, or contain only untouched starter examples explicitly replaceable.
async function destination(tx){const count=Number((await tx.query('SELECT count(*) FROM rpm.quotes')).rows[0].count),old=(await tx.query('SELECT sku,version FROM rpm.products')).rows;if(count||old.length&&!(process.argv.includes('--replace-demo')&&old.every(p=>/^DEMO-\d{3}$/.test(p.sku)&&p.version===1)))throw Error('La base de destino contiene datos. Usa una base vacía; --replace-demo solo permite sustituir ejemplos intactos.');}
try{
  const db=database();await destination(db);
  let storage;
  for(const p of data.products){if(!p.photo?.startsWith('/media/'))continue;const name=p.photo.split('/').pop();if(!/^[a-f\d-]+\.(jpg|png|webp)$/.test(name)||!data.mediaDirectory)throw Error('Falta mediaDirectory para migrar las fotografías cargadas.');
    if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SECRET_KEY)throw Error('Configura el almacenamiento antes de migrar fotografías.');storage||=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false}});
    const bytes=await readFile(join(resolve(data.mediaDirectory),name)),type=name.endsWith('.png')?'image/png':name.endsWith('.webp')?'image/webp':'image/jpeg';
    const {error}=await storage.storage.from(process.env.SUPABASE_STORAGE_BUCKET||'rpm-products').upload(name,bytes,{contentType:type,upsert:false});if(error&&error.statusCode!=='409')throw error;
  }
  await transaction(db,async tx=>{
    await tx.query("SELECT pg_advisory_xact_lock(hashtext('rpm-import'))");await destination(tx);
    await tx.query('DELETE FROM rpm.products');
    await tx.query("INSERT INTO rpm.settings(id,data) VALUES('store',$1::jsonb) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,version=rpm.settings.version+1",[JSON.stringify(config)]);
    for(const p of data.products)await tx.query('INSERT INTO rpm.products(id,sku,data,version) VALUES($1,$2,$3::jsonb,$4)',[p.id,p.sku,JSON.stringify(p),p.version||1]);
    for(const q of quotes)await tx.query('INSERT INTO rpm.quotes(id,owner_id,token_hash,data,status,created_at) VALUES($1,$2,$3,$4::jsonb,$5,$6)',[q.id,q.ownerId||null,q.tokenHash,JSON.stringify(q.data),q.status||'solicitud',q.data.createdAt]);
    for(const m of members)await tx.query('INSERT INTO rpm.members(email,role,active) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET role=EXCLUDED.role,active=EXCLUDED.active',[m.email.toLowerCase(),m.role,m.active!==false]);
    for(const m of mappings)await tx.query('INSERT INTO rpm.owner_mappings(legacy_id,email) VALUES($1,$2) ON CONFLICT(legacy_id) DO UPDATE SET email=EXCLUDED.email',[m.legacyId,m.email.toLowerCase()]);
    await tx.query("SELECT setval(pg_get_serial_sequence('rpm.products','id'),COALESCE((SELECT MAX(id) FROM rpm.products),1),true)");
  });console.log(`Migrados: ${data.products.length} artículos y ${quotes.length} cotizaciones. No se imprimieron datos personales.`);
}finally{await closeDatabase()}
