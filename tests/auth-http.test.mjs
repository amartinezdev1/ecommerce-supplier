import test from 'node:test';import assert from 'node:assert/strict';
import {createServer} from 'node:http';import {spawn,spawnSync} from 'node:child_process';import {once} from 'node:events';import {setTimeout as pause} from 'node:timers/promises';import {randomUUID} from 'node:crypto';import pg from 'pg';
async function port(){const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const value=server.address().port;await new Promise(r=>server.close(r));return value;}
test('Acceso HTTP: código, cookies verificadas, permisos, límites y cierre',{skip:!process.env.TEST_DATABASE_URL,timeout:45000},async t=>{
 const admin=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL,max:1}),name='rpm_auth_'+randomUUID().replaceAll('-','');await admin.query(`CREATE DATABASE "${name}"`);const url=new URL(process.env.TEST_DATABASE_URL);url.pathname='/'+name;
 const user={id:randomUUID(),email:'owner@example.com',email_confirmed_at:new Date().toISOString(),aud:'authenticated',role:'authenticated',app_metadata:{provider:'email'},user_metadata:{},created_at:new Date().toISOString()};let active=false,sends=0;
 const jwt=[{alg:'HS256',typ:'JWT'},{sub:user.id,email:user.email,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.fixture-signature';
 const fixture=createServer(async(req,res)=>{let raw='';for await(const chunk of req)raw+=chunk;const body=raw?JSON.parse(raw):{};res.setHeader('Content-Type','application/json');
  if(req.url==='/auth/v1/otp'&&req.method==='POST'){sends++;res.end('{}');return;}
  if(req.url==='/auth/v1/verify'&&body.token==='123456'){active=true;res.end(JSON.stringify({access_token:jwt,refresh_token:'fixture-refresh',token_type:'bearer',expires_in:3600,user}));return;}
  if(req.url==='/auth/v1/user'&&req.headers.authorization==='Bearer '+jwt&&active){res.end(JSON.stringify(user));return;}
  if(req.url?.startsWith('/auth/v1/logout')){active=false;res.end('{}');return;}
  res.statusCode=401;res.end(JSON.stringify({error_code:'invalid_credentials',msg:'Invalid test credentials'}));
 });fixture.listen(0,'127.0.0.1');await once(fixture,'listening');
 const appPort=await port(),base='http://127.0.0.1:'+appPort,env={...process.env,APP_URL:base,DATABASE_URL:url.href,RPM_ADMIN_EMAIL:user.email,SUPABASE_URL:'http://127.0.0.1:'+fixture.address().port,SUPABASE_PUBLISHABLE_KEY:'fixture-publishable',SUPABASE_SECRET_KEY:'fixture-secret',PORT:String(appPort)};
 const migrate=spawnSync(process.execPath,['scripts/migrate.mjs'],{env,encoding:'utf8'});assert.equal(migrate.status,0,migrate.stderr);
 let logs='';const app=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(appPort)],{env,stdio:['ignore','pipe','pipe']});app.stdout.on('data',x=>logs+=x);app.stderr.on('data',x=>logs+=x);
 t.after(async()=>{app.kill('SIGTERM');await Promise.race([once(app,'exit'),pause(3000)]);fixture.closeAllConnections();await new Promise(r=>fixture.close(r));await admin.query(`DROP DATABASE "${name}" WITH (FORCE)`);await admin.end();});
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/session')).ok){ready=true;break}}catch{}await pause(100);}assert(ready,logs);
 const jar=new Map();const call=async(path,data,extra={})=>{const r=await fetch(base+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{Origin:base,'Content-Type':'application/json'}),Cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),...extra},...(data===undefined?{}:{body:JSON.stringify(data)})});for(const h of r.headers.getSetCookie()){const pair=h.split(';')[0],index=pair.indexOf('=');jar.set(pair.slice(0,index),pair.slice(index+1));}return r;};
 assert.equal((await call('/api/admin/catalog',undefined,{'x-user-email':user.email})).status,401);
 const page=await (await call('/acceso')).text();assert(!/chatgpt|openai/i.test(page));
 assert.equal((await call('/auth/request-code',{email:user.email},{Origin:'https://wrong.example'})).status,403);
 assert.equal((await call('/auth/request-code',{email:user.email})).status,200);assert.equal(sends,1);
 assert.equal((await call('/auth/verify-code',{email:user.email,code:'000000'})).status,401);
 const verified=await call('/auth/verify-code',{email:user.email,code:'123456',returnTo:'//wrong.example'});assert.equal(verified.status,200);assert.equal((await verified.json()).returnTo,'/?cuenta=1');assert(verified.headers.getSetCookie().some(x=>/HttpOnly/i.test(x)));
 const session=await (await call('/api/session')).json();assert.equal(session.role,'owner');assert.equal(session.user.email,user.email);assert.equal((await call('/api/admin/catalog')).status,200);
 assert.equal((await call('/auth/request-code',{email:user.email})).status,200);assert.equal((await call('/auth/request-code',{email:user.email})).status,200);assert.equal((await call('/auth/request-code',{email:user.email})).status,429);
 assert.equal((await call('/auth/signout',{})).status,200);assert.equal((await (await call('/api/session')).json()).user,null);assert.equal((await call('/api/admin/catalog')).status,401);
});
