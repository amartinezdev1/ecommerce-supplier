import { readFile } from 'node:fs/promises';
import { database, transaction, closeDatabase } from '../lib/server/database.mjs';
import { initialConfig, initialProducts } from '../lib/seed.mjs';
try {
  await transaction(database(),async tx=>{
    await tx.query(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));
    const added=await tx.query("INSERT INTO rpm.settings(id,data) VALUES('store',$1::jsonb) ON CONFLICT(id) DO NOTHING RETURNING id",[JSON.stringify(initialConfig)]);
    if(added.rowCount)for(const p of initialProducts)await tx.query('INSERT INTO rpm.products(id,sku,data) VALUES($1,$2,$3::jsonb)',[p.id,p.sku,JSON.stringify(p)]);
    await tx.query("SELECT setval(pg_get_serial_sequence('rpm.products','id'),COALESCE((SELECT MAX(id) FROM rpm.products),1),EXISTS(SELECT 1 FROM rpm.products))");
  });
  console.log('Base de datos preparada. Los datos existentes se conservaron.');
}finally{await closeDatabase()}
