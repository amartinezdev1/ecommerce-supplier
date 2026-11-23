import assert from 'node:assert/strict';
const base='http://127.0.0.1:8871';let cookie='';
async function call(path,data,extra={}){return fetch(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{...(data!==undefined?{'Content-Type':'application/json','Origin':base}:{}),...(cookie?{Cookie:cookie}:{}),...extra},...(data!==undefined?{body:JSON.stringify(data)}:{})})}
assert.equal((await call('admin/catalog')).status,401);
assert.equal((await fetch(base+'/api/admin/initialize',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
const login=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert(cookie);
assert.equal((await (await call('session')).json()).role,'owner');
const cat=await (await call('admin/catalog')).json();assert(cat.initialized);const p=cat.products.find(p=>p.id===1);
assert.equal((await call('admin/product',{product:p,version:p.version-1})).status,409);
const q=await (await call('quotes',{branchId:cat.config.branches[0].id,items:[{id:1,qty:6}]})).json();assert.equal(q.lines[0].unitCents,5000);assert.equal(q.totalCents,30000);assert.match(q.whatsappUrl,/https:\/\/wa.me\/50769259368/);
const pdf=await fetch(base+'/api/quotes/'+q.id+'/pdf',{method:'POST',headers:{Origin:base,'X-Quote-Token':q.token}});assert.equal(pdf.status,200);assert.equal(pdf.headers.get('content-type'),'application/pdf');const bytes=new Uint8Array(await pdf.arrayBuffer());assert.equal(new TextDecoder().decode(bytes.slice(0,4)),'%PDF');await import('node:fs/promises').then(fs=>fs.writeFile('outputs/local-quote-test.pdf',bytes));
assert.equal((await fetch(base+'/api/quotes/'+q.id)).status,403);
assert.equal((await fetch(base+'/api/quotes/'+q.id,{headers:{'X-Quote-Token':q.token}})).status,200);
const stale=structuredClone(p);stale.version=0;assert.equal((await call('admin/import',{products:[stale]})).status,409);
const bad=structuredClone(p);bad.inventory[cat.config.branches[0].id].priceCents=-1;assert.equal((await call('admin/product',{product:bad,version:p.version})).status,400);
const fake=await fetch(base+'/api/admin/upload',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'image/png'},body:'this is not a real image'});assert.equal(fake.status,400);
console.log('API checks passed: authorization, CSRF, stale writes, import conflict, quantity pricing, WhatsApp draft, PDF and quote access.');
