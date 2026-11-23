const required=['APP_URL','RPM_ADMIN_EMAIL','DATABASE_URL','SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY'];
let failed=false;
for(const name of required){const value=process.env[name];const valid=!!value&&!/REPLACE_ME|PROJECT|POOLER_HOST|example\.com|ENCODED_PASSWORD/.test(value);console.log(`${valid?'OK':'FALTA'} ${name}`);if(!valid)failed=true;}
for(const name of ['APP_URL','SUPABASE_URL'])if(process.env[name]){try{const url=new URL(process.env[name]);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw Error();}catch{console.error(`Revisa ${name}: usa una URL HTTPS válida.`);failed=true;}}
if(process.env.DATABASE_URL&&!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL)){console.error('DATABASE_URL debe ser una conexión PostgreSQL.');failed=true;}
process.exitCode=failed?1:0;
