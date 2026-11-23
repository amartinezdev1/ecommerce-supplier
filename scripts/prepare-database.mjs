import { readFile, writeFile } from 'node:fs/promises';
import { initialConfig, initialProducts } from '../lib/seed.mjs';
const quote=value=>"'"+JSON.stringify(value).replaceAll("'","''")+"'::jsonb";
const schema=await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8');
const seed=`DO $rpm_seed$ BEGIN\nIF NOT EXISTS(SELECT 1 FROM rpm.settings WHERE id='store') THEN\nINSERT INTO rpm.settings(id,data) VALUES('store',${quote(initialConfig)});\n${initialProducts.map(p=>`INSERT INTO rpm.products(id,sku,data) VALUES(${p.id},'${p.sku}',${quote(p)});`).join('\n')}\nEND IF;\nEND $rpm_seed$;\nSELECT setval(pg_get_serial_sequence('rpm.products','id'),COALESCE((SELECT MAX(id) FROM rpm.products),1),EXISTS(SELECT 1 FROM rpm.products));`;
const storage=`DO $rpm_storage$ BEGIN\nIF to_regclass('storage.buckets') IS NOT NULL THEN\nINSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('rpm-products','rpm-products',false,4194304,ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT(id) DO NOTHING;\nEND IF;\nEND $rpm_storage$;`;
await writeFile(new URL('../supabase/setup.sql',import.meta.url),`-- RPM: paste into the project's SQL editor, or use npm run db:migrate.\nBEGIN;\n${schema}\n${seed}\n${storage}\nCOMMIT;\n`);
