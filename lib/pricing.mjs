export function fail(message,status=400){throw Object.assign(new Error(message),{status})}
export function int(n,min=0,max=100000000){if(!Number.isSafeInteger(n)||n<min||n>max)fail('Número fuera de rango.');return n}
export function validateConfig(c){
 if(!c||!Array.isArray(c.branches)||c.branches.length<1||c.branches.length>20)fail('Agrega entre 1 y 20 sucursales.');
 const seen=new Set();for(const b of c.branches){if(!/^[\wáéíóúñ-]{1,40}$/u.test(b.id)||seen.has(b.id)||!b.name?.trim()||b.name.length>100||!/^\d{8,15}$/.test(b.phone))fail('Revisa nombre, identificador y teléfono de las sucursales.');seen.add(b.id);if(String(b.address||'').length>300||String(b.hours||'').length>300)fail('Información de sucursal demasiado larga.');}
 if(c.taxBps!==null)int(c.taxBps,0,10000);
 if(!Array.isArray(c.rules)||c.rules.length>30)fail('Revisa las reglas comerciales.');
 for(const r of c.rules){if(!['units','mixed','spend'].includes(r.type)||typeof r.enabled!=='boolean'||!r.name||r.name.length>120)fail('Regla comercial inválida.');int(r.threshold,1,100000000);int(r.discountBps,1,10000);if(r.branchId&& !seen.has(r.branchId))fail('Sucursal de regla inválida.');}
 c.demo=!!c.demo;return c;
}
export function validateProduct(p,c){
 if(!p||!p.sku||!p.name||!p.cat||!/^[-\w. /]{1,60}$/u.test(p.sku)||p.name.length>160||p.cat.length>80||String(p.description||'').length>4000)fail('Revisa código, nombre, categoría y descripción.');
 if(p.photo&&!/^p(?:10|[1-9])$/.test(p.photo)&&!/^\/media\/[a-f\d-]+\.(jpg|png|webp)$/.test(p.photo)&&!/^https:\/\/[^\s<>"']{1,2000}$/.test(p.photo))fail('Fotografía inválida.');
 for(const b of c.branches){const v=p.inventory?.[b.id];if(!v)fail('Falta información por sucursal.');int(v.priceCents);if(v.stock!==null)int(v.stock,0,999999);if(typeof v.enabled!=='boolean'||!Array.isArray(v.tiers)||v.tiers.length>30)fail('Disponibilidad o escalas inválidas.');let last=0,price=v.priceCents;for(const t of [...v.tiers].sort((a,b)=>a.min-b.min)){int(t.min,2,999999);int(t.priceCents);if(t.min<=last||t.priceCents>price)fail('Las escalas deben tener cantidades únicas y precios descendentes.');last=t.min;price=t.priceCents;}v.tiers.sort((a,b)=>a.min-b.min);}
 p.active=p.active!==false;return p;
}
export function calculate(products,config,input){
 const branch=config.branches.find(b=>b.id===input.branchId);if(!branch)fail('Selecciona una sucursal válida.');
 if(!Array.isArray(input.items)||input.items.length>200)fail('La cotización admite hasta 200 productos distintos.');
 const seen=new Set(),issues=[],lines=[];let units=0;
 for(const item of input.items){int(item.id,1);int(item.qty,1,999999);if(seen.has(item.id))fail('Hay productos repetidos.');seen.add(item.id);
  const p=products.find(p=>p.id===item.id),v=p?.inventory?.[branch.id];
  if(!p||!p.active||!v?.enabled){issues.push({id:item.id,message:'Producto no disponible en esta sucursal.'});continue;}
  if(v.stock!==null&&item.qty>v.stock)issues.push({id:p.id,message:`${p.name}: quedan ${v.stock} unidades.`});
  let price=v.priceCents,tier=null;for(const t of v.tiers)if(item.qty>=t.min){price=t.priceCents;tier=t;}
  const next=v.tiers.find(t=>t.min>item.qty);
  units+=item.qty;lines.push({id:p.id,sku:p.sku,name:p.name,qty:item.qty,photo:p.photo,baseCents:v.priceCents,unitCents:price,lineCents:price*item.qty,tier: tier?.min||null,next:next?{...next,remaining:next.min-item.qty}:null,stock:v.stock});
 }
 const subtotal=lines.reduce((s,l)=>s+l.lineCents,0),baseTotal=lines.reduce((s,l)=>s+l.baseCents*l.qty,0);
 // No stacking: choose the largest eligible general discount after quantity tiers.
 const eligible=config.rules.filter(r=>r.enabled&&(!r.branchId||r.branchId===branch.id)&&((r.type==='units'&&units>=r.threshold)||(r.type==='mixed'&&lines.length>=2&&units>=r.threshold)||(r.type==='spend'&&subtotal>=r.threshold)));
 const rule=eligible.sort((a,b)=>b.discountBps-a.discountBps)[0]||null;
 if(!Number.isSafeInteger(subtotal)||!Number.isSafeInteger(baseTotal))fail('El importe excede el límite de la cotización.');
 const discountCents=rule?Math.round(subtotal*rule.discountBps/10000):0,netCents=subtotal-discountCents;
 const taxCents=config.taxBps===null?null:Math.round(netCents*config.taxBps/10000);
 return {branch,lines,issues,units,baseCents:baseTotal,subtotalCents:subtotal,discountCents,savingsCents:baseTotal-subtotal+discountCents,netCents,taxCents,totalCents:netCents+(taxCents||0),rule:rule?rule.name:null,demo:config.demo,taxBps:config.taxBps,valid:issues.length===0&&lines.length>0};
}
export const currency=n=>'$'+(n/100).toFixed(2);
export function whatsapp(q){return [q.demo?'CATÁLOGO DE MUESTRA — NO ES UN PEDIDO REAL':'Solicitud de cotización RPM',`Referencia: ${q.id}`,`Sucursal: ${q.branch.name}`,...q.lines.map(l=>`${l.qty} x ${l.sku} · ${l.name}\n  ${currency(l.unitCents)} c/u = ${currency(l.lineCents)}`),`Subtotal: ${currency(q.subtotalCents)}`,q.discountCents?`Descuento: ${currency(q.discountCents)}`:'',q.savingsCents?`Ahorro total: ${currency(q.savingsCents)}`:'',q.taxCents===null?'Impuestos: por confirmar':`Impuestos: ${currency(q.taxCents)}`,`Total${q.taxCents===null?' estimado':''}: ${currency(q.totalCents)}`,'Retiro en tienda. Precios y disponibilidad sujetos a confirmación; esta solicitud no reserva inventario.'].filter(Boolean).join('\n');}
