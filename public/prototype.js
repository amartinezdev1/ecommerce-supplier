
(()=>{
const root=document.getElementById('rpm-reference-home');
const branches=['Av. Obaldía','Calle 4ta','Puerto Armuelles'];
const crops={hero:[389,114,315,233],cat0:[40,392,57,57],cat1:[125,392,57,57],cat2:[209,392,57,57],cat3:[293,392,57,57],cat4:[378,392,57,57],cat5:[462,392,57,57],cat6:[546,392,57,57],cat7:[630,392,57,57],watch:[146,490,99,107],sneaker:[356,501,115,96],discount:[608,493,94,104],p1:[34,648,123,114],p2:[170,648,123,114],p3:[306,648,123,114],p4:[442,648,123,114],p5:[578,648,123,114],p6:[34,943,123,89],p7:[170,943,123,89],p8:[306,943,123,89],p9:[442,943,123,89],p10:[578,943,123,89],envelope:[49,1098,105,60],google:[564,1215,77,25],apple:[564,1245,77,24]};
const categories=['Electrónica','Moda','Hogar','Belleza','Bebés y niños','Deportes','Libros','Supermercado'];
const categoryStyles=[{icon:'headphones',color:'#DDEBFF'},{icon:'shirt',color:'#F8DFE8'},{icon:'armchair',color:'#F5E7D3'},{icon:'sparkles',color:'#EBE1F7'},{icon:'baby',color:'#FFF0C7'},{icon:'dumbbell',color:'#DDEEE7'},{icon:'book-open',color:'#E8E3DB'},{icon:'shopping-basket',color:'#E8F5CE'}];
const products=[
{id:1,name:'Audífonos inalámbricos Pro',cat:'Electrónica',price:59.99,old:89.99,photo:'p1',reviews:'1.2k',description:'Audífonos inalámbricos con estuche de carga. Producto ilustrativo para explorar tu próxima compra.'},
{id:2,name:'Mochila minimalista',cat:'Moda',price:34.99,old:69.99,photo:'p2',reviews:'845',description:'Mochila negra con compartimentos para acompañar tus actividades diarias.'},
{id:3,name:'Vela aromática',cat:'Hogar',price:18.99,old:29.99,photo:'p3',reviews:'632',description:'Un detalle de aroma y calidez para tus espacios. Presentación de muestra.'},
{id:4,name:'Reloj inteligente Serie 8',cat:'Electrónica',price:129.99,old:189.99,photo:'p4',reviews:'973',description:'Reloj inteligente de diseño negro. Agrega las cantidades que te interesan a tu lista.'},
{id:5,name:'Set de cuidado facial',cat:'Belleza',price:24.99,old:39.99,photo:'p5',reviews:'1.1k',description:'Una selección de artículos para tu rutina de cuidado personal.'},
{id:6,name:'Parlante Bluetooth',cat:'Electrónica',price:39.99,old:69.99,photo:'p6',description:'Parlante portátil de acabado negro para escuchar tus favoritos.'},
{id:7,name:'Sudadera oversize',cat:'Moda',price:29.99,old:49.99,photo:'p7',description:'Sudadera con capucha de corte amplio. Fotografía y presentación ilustrativas.'},
{id:8,name:'Cafetera',cat:'Hogar',price:49.99,old:89.99,photo:'p8',description:'Cafetera de filtro para acompañar tus mañanas y momentos de descanso.'},
{id:9,name:'Kit de maquillaje',cat:'Belleza',price:19.99,old:34.99,photo:'p9',description:'Kit de maquillaje en una presentación compacta para tu colección.'},
{id:10,name:'Coche para bebé',cat:'Bebés y niños',price:99.99,old:159.99,photo:'p10',description:'Coche para bebé de color negro. Consulta los detalles con tu sucursal.'}
];
const state={view:'home',filter:'all',search:'',branch:0,cart:{1:1,2:1},favorites:[],qty:1,selected:1,featuredTab:'destacados',featuredPage:0,quoteIndex:0,blogPage:0};
function restore(s){if(!s||s.version!==5)return;if(['destacados','novedades','vendidos'].includes(s.featuredTab))state.featuredTab=s.featuredTab;if([0,1,2].includes(s.featuredPage))state.featuredPage=s.featuredPage;if([0,1,2].includes(s.quoteIndex))state.quoteIndex=s.quoteIndex;if([0,1].includes(s.blogPage))state.blogPage=s.blogPage;if([0,1,2].includes(s.branch))state.branch=s.branch;if(s.cart&&typeof s.cart==='object'){state.cart={};products.forEach(p=>{const q=Number(s.cart[p.id]);if(Number.isInteger(q)&&q>0&&q<=999)state.cart[p.id]=q})}if(Array.isArray(s.favorites))state.favorites=s.favorites.filter(id=>products.some(p=>p.id===id))}
restore(window.openai?.widgetState?.privateContent);
const money=n=>'$'+n.toFixed(2);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<i data-lucide="${n}" aria-hidden="true"></i>`;
function photo(key,label,extra=''){const [x,y,w,h]=crops[key];return `<div class="r5-photo ${extra}" role="img" aria-label="${esc(label)}" style="aspect-ratio:${w}/${h};background-size:${736/w*100}% ${1307/h*100}%;background-position:${x/(736-w)*100}% ${y/(1307-h)*100}%"></div>`}
function logo(){return `<button class="r5-logo" data-action="home" aria-label="RPM, ir al inicio"><span class="r5-logo-mark"><b>RPM</b><small>DISTRIBUIDORA</small></span><span class="r5-logo-name">REBAJAS<br>POR<br>MINUTO</span></button>`}
const cartProducts=()=>products.filter(p=>state.cart[p.id]);
const total=()=>cartProducts().reduce((sum,p)=>sum+p.price*state.cart[p.id],0);
function icons(){if(globalThis.lucide)globalThis.lucide.createIcons({attrs:{width:16,height:16}})}
function persist(){if(window.openai?.setWidgetState)window.openai.setWidgetState({modelContent:{diseño:'Portada RPM con ocho secciones según la referencia',vista:state.view,sucursal:branches[state.branch],favoritos:state.favorites,cotizacion:cartProducts().map(p=>({producto:p.name,cantidad:state.cart[p.id]})),datos:'Contenido de muestra; fotografías de la referencia visual'},privateContent:{version:5,branch:state.branch,cart:state.cart,favorites:state.favorites,featuredTab:state.featuredTab,featuredPage:state.featuredPage,quoteIndex:state.quoteIndex,blogPage:state.blogPage}}).catch(()=>{})}
let toastTimer;
function toast(text){const el=root.querySelector('#r5-toast');el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},4000)}
function card(p,compact=false){const liked=state.favorites.includes(p.id);return `<article class="r5-product ${compact?'compact':''}"><div class="r5-product-photo"><button class="r5-product-open" data-product="${p.id}" aria-label="Ver ${esc(p.name)}">${photo(p.photo,p.name)}</button><button class="r5-heart" data-favorite="${p.id}" aria-label="${liked?'Quitar de':'Agregar a'} favoritos: ${esc(p.name)}" aria-pressed="${liked}">${icon('heart')}</button></div><div class="r5-product-body"><button class="r5-product-title" data-product="${p.id}">${p.name}</button><p class="r5-product-category">${p.cat}</p>${!compact?`<div class="r5-rating" aria-label="Valoración ilustrativa: 4.8 de 5"><span aria-hidden="true">★★★★★</span><span>(${p.reviews||'128'})</span></div>`:''}<div class="r5-product-price"><span>${money(p.price)}</span><del>${money(p.old)}</del></div>${!compact?`<button class="r5-add-cart" data-add="${p.id}" aria-label="Agregar a la cotización: ${esc(p.name)}">${icon('shopping-cart')}</button>`:''}</div></article>`}
function heading(title,label,filter){return `<div class="r5-section-heading"><h2>${title}</h2><button data-filter="${filter}">${label} ${icon('arrow-right')}</button></div>`}
const featuredGroups = {
  destacados: [1, 2, 3, 4, 5, 6, 8, 9, 10],
  novedades: [8, 9, 10, 6, 7, 5, 1, 2, 3],
  vendidos: [4, 1, 8, 2, 5, 6, 3, 7, 10]
};
const sampleOpinions = [
  'Me ayuda a saber cuánto voy a invertir y a organizar los productos antes de ir a la tienda.',
  'Puedo preparar una sola lista con los artículos que necesito para mi casa y para mi negocio.',
  'Es práctico revisar cantidades y precios antes de coordinar el retiro con la sucursal.'
];
const rpmArticles = [
  {title:'Cómo preparar tu primera cotización', photo:'p2', intro:'Una lista clara hace más fácil tu próxima compra.', body:'Empieza por los artículos que necesitas y anota las cantidades. Revisa cada producto, agrégalo a tu cotización y compara el total con lo que tienes previsto invertir. Antes de retirar, confirma disponibilidad y precios con la sucursal.'},
  {title:'Compra al mayor con una lista clara', photo:'p1', intro:'Organiza productos y cantidades para tu negocio.', body:'Agrupa los artículos por uso y revisa cuántas unidades necesitas de cada uno. La cotización te ayuda a reunir la información en una sola lista. Consulta con la tienda las condiciones de precio por cantidad antes de confirmar.'},
  {title:'Pequeños cambios para tu hogar', photo:'p3', intro:'Encuentra detalles útiles para tus espacios.', body:'Piensa en el espacio que quieres organizar y en los objetos que usas cada día. Prepara una selección de artículos útiles y revisa sus características antes de agregarlos a tu lista. Puedes cotizar diferentes cantidades para decidir cómo organizar tu compra.'},
  {title:'Lo esencial para tu día a día', photo:'p8', intro:'Prepara una selección que se ajuste a tu rutina.', body:'Haz una lista con lo que necesitas reponer o renovar. Separa los artículos prioritarios y consulta sus detalles. Revisa el desglose de tu cotización para elegir los productos y las cantidades que te convienen.'},
  {title:'Antes de retirar en tienda', photo:'p7', intro:'Ten a mano los detalles de tu cotización.', body:'Confirma la sucursal, la disponibilidad y el precio de los productos. Comparte tu lista con el personal de la tienda y coordina los detalles del retiro. La solicitud permite revisar tu compra antes de confirmarla.'},
  {title:'Tu inversión, producto por producto', photo:'p6', intro:'Revisa el desglose antes de decidir.', body:'Una cotización clara muestra el producto, su cantidad y el importe correspondiente. Revisa cada línea y ajusta las unidades que necesitas. El personal de la tienda confirmará las condiciones finales antes de la compra.'}
];
function r6Product(p) {
  return `<article class="r6-product">
    <button class="r6-product-photo" data-product="${p.id}" aria-label="Ver ${esc(p.name)}">${photo(p.photo,p.name)}</button>
    <div class="r6-product-copy"><h3><button data-product="${p.id}">${esc(p.name)}</button></h3><p>${esc(p.cat)} · Consulta disponibilidad</p>
      <div class="r6-product-bottom"><strong>${money(p.price)}</strong><button class="r6-mini-button" data-product="${p.id}">Ver</button></div>
    </div>
  </article>`;
}
function r6Article(a, index) {
  return `<article class="r6-article"><button class="r6-article-photo" data-r6-article="${index}" aria-label="Leer ${esc(a.title)}">${photo(a.photo,a.title)}</button><div class="r6-article-copy"><h3>${esc(a.title)}</h3><p>${esc(a.intro)}</p><div><span>Ideas RPM</span><button class="r6-mini-button" data-r6-article="${index}">Leer</button></div></div></article>`;
}
function home() {
  const list=featuredGroups[state.featuredTab].slice(state.featuredPage*3,state.featuredPage*3+3).map(id=>products.find(p=>p.id===id));
  const articles=state.blogPage===0?[0,1,2,3]:[2,3,4,5];
  return `<div class="r6-home r5-container">
    <section class="r6-hero" aria-labelledby="r6-hero-title">
      <div class="r6-hero-copy"><p class="r6-kicker">Bienvenido a Rebajas por Minuto</p><h1 id="r6-hero-title">Todo lo que buscas.<br><span>A tu manera.</span></h1><p>Descubre artículos para tu casa y tu negocio. Prepara tu cotización y conoce tu inversión.</p><div class="r6-hero-buttons"><button class="r6-button" data-filter="all">Explorar productos</button><button class="r6-outline-button" data-action="help">Cómo comprar</button></div></div>
      <div class="r6-hero-visual">${photo('hero','Artículos y detalles para un hogar acogedor')}</div>
    </section>

    <section class="r6-benefits" aria-label="Beneficios de comprar en RPM">
      <div><span class="r6-benefit-icon">${icon('clipboard-list')}</span><span><h2>Cotización clara</h2><p>Conoce tu inversión antes de comprar.</p></span></div>
      <div><span class="r6-benefit-icon">${icon('boxes')}</span><span><h2>Al mayor y al detal</h2><p>Elige los productos y las cantidades.</p></span></div>
      <div><span class="r6-benefit-icon">${icon('store')}</span><span><h2>Retiro en tienda</h2><p>Coordina tu compra con tu sucursal.</p></span></div>
    </section>

    <section class="r6-featured r6-panel" aria-label="Selección de productos">
      <div class="r6-featured-top"><div class="r6-tabs" role="tablist" aria-label="Selecciones de productos">${[['destacados','Destacados'],['novedades','Novedades'],['vendidos','Más vendidos']].map(([key,label])=>`<button type="button" role="tab" id="r6-tab-${key}" aria-controls="r6-feature-results" aria-selected="${state.featuredTab===key}" data-r6-tab="${key}">${label}</button>`).join('')}</div><div class="r6-arrows"><button data-r6-slide="-1" aria-label="Productos anteriores">${icon('chevron-left')}</button><button class="r6-arrow-dark" data-r6-slide="1" aria-label="Siguientes productos">${icon('chevron-right')}</button></div></div>
      <div class="r6-feature-grid" id="r6-feature-results" role="tabpanel" aria-labelledby="r6-tab-${state.featuredTab}" aria-live="polite">${list.map(r6Product).join('')}</div>
      <div class="r6-dots" aria-label="Páginas de productos">${[0,1,2].map(i=>`<button data-r6-page="${i}" aria-label="Página ${i+1} de productos" aria-pressed="${i===state.featuredPage}"></button>`).join('')}</div><button class="r6-see-all" data-filter="all">Ver todos los productos</button>
      <span class="r6-stripes" aria-hidden="true"><span></span><span></span><span></span></span>
    </section>

    <section class="r6-guide r6-panel" aria-labelledby="r6-guide-title"><span class="r6-stripes" aria-hidden="true"><span></span><span></span><span></span></span><h2 id="r6-guide-title">Guía para tu<br>primera compra</h2><ol>
      <li><h3>Paso 1</h3><p>Explora los productos que necesitas para tu casa o tu negocio.</p></li>
      <li><h3>Paso 2</h3><p>Elige los artículos y las cantidades que quieres cotizar.</p></li>
      <li><h3>Paso 3</h3><p>Revisa el desglose y conoce el total de tu inversión.</p></li>
      <li><h3>Paso 4</h3><p>Comparte tu cotización y coordina el retiro en tienda.</p></li>
    </ol></section>

    <section class="r6-testimonials r6-panel" aria-labelledby="r6-testimonials-title"><h2 id="r6-testimonials-title">Lo que dicen nuestros clientes</h2><div class="r6-testimonials-body"><div class="r6-testimonial-images">${photo('hero','Detalles para tu hogar','r6-testimonial-image-back')}${photo('p8','Una cafetera para el día a día','r6-testimonial-image-front')}</div><div class="r6-testimonial-right"><figure><figcaption><span class="r6-avatar">${icon('user-round')}</span><span><b>Cliente de RPM</b><small>Testimonio de muestra</small></span></figcaption><div class="r6-quote-stars" aria-label="Valoración ilustrativa de cinco estrellas">★★★★★</div><blockquote>${esc(sampleOpinions[state.quoteIndex])}</blockquote></figure><button class="r6-button" data-r6-quote="next">Ver otra opinión ${icon('circle-arrow-right')}</button></div></div></section>

    <section class="r6-story r6-panel" aria-labelledby="r6-story-title"><div class="r6-metrics"><div><strong>2 modalidades</strong><p>Compra al por mayor o al detal, según lo que necesites.</p></div><div><strong>1 cotización</strong><p>Reúne tus productos y cantidades en una sola lista.</p></div><div><strong>100% a tu ritmo</strong><p>Consulta tu inversión y decide cómo organizar tu compra.</p></div></div><div class="r6-story-photo">${photo('p8','Cafetera y artículos para tu día a día')}</div><div class="r6-story-copy"><h2 id="r6-story-title">Para tu casa, tu negocio<br>y tu día a día.</h2><p>En RPM encuentras artículos para distintos momentos de tu vida.</p><p>Explora, compara y prepara una cotización con lo que te interesa. Nuestro equipo te acompaña para confirmar los detalles de tu compra y coordinar tu retiro.</p></div></section>

    <section class="r6-blog r6-panel" aria-labelledby="r6-blog-title"><div class="r6-blog-heading"><h2 id="r6-blog-title">Ideas y novedades</h2><div class="r6-arrows"><button data-r6-blog="-1" aria-label="Artículos anteriores">${icon('chevron-left')}</button><button class="r6-arrow-dark" data-r6-blog="1" aria-label="Siguientes artículos">${icon('chevron-right')}</button></div></div><div class="r6-blog-grid">${articles.map(i=>r6Article(rpmArticles[i],i)).join('')}</div></section>

    <section class="r6-services r6-panel" aria-labelledby="r6-services-title"><h2 id="r6-services-title">Así te acompañamos</h2><div class="r6-services-grid"><button class="r6-service r6-service-dark" data-action="help"><span class="r6-service-number">01</span><h3>Compra<br>al mayor</h3><p>Prepara tu selección para el negocio. Consulta cantidades, precios y disponibilidad con tu sucursal.</p></button><button class="r6-service" data-filter="all"><span class="r6-service-number">02</span><h3>Compra<br>al detal</h3><p>Encuentra los artículos que necesitas para tu casa y tu rutina. Elige cada producto a tu ritmo.</p></button><button class="r6-service" data-action="quote"><span class="r6-service-number">03</span><h3>Cotiza por<br>WhatsApp</h3><p>Reúne tu lista en línea, revisa tu inversión y comparte los detalles para coordinar tu compra.</p></button></div></section>
  </div>`;
}

function catalog(){let list=products;let title='Todos los productos';if(categories.includes(state.filter)){list=list.filter(p=>p.cat===state.filter);title=state.filter}else if(state.filter==='new'){list=products.slice(5);title='Novedades'}else if(state.filter==='recommended'){list=products.slice(5);title='Recomendados para ti'}else if(state.filter==='offers'){title='Ofertas'}else if(state.filter==='best'){list=products.slice(0,5);title='Más vendidos'}else if(state.filter==='favorites'){list=products.filter(p=>state.favorites.includes(p.id));title='Tus favoritos'}if(state.search){const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();list=list.filter(p=>norm(p.name+' '+p.cat).includes(norm(state.search)));title='Resultados de búsqueda'}return `<div class="r5-catalog r5-container"><div class="r5-catalog-top"><h1>${title}</h1><button data-action="home">Volver al inicio</button></div><p class="r5-catalog-description">${state.search?'“'+esc(state.search)+'” · ':''}${list.length} producto${list.length===1?'':'s'} de muestra · ${branches[state.branch]}</p>${list.length?`<div class="r5-products">${list.map(p=>card(p)).join('')}</div>`:'<p class="r5-empty">Aún no hay productos en esta selección.</p>'}</div>`}
function footer(){const links=(items)=>items.map(([label,value])=>`<button ${value.startsWith('action:')?`data-action="${value.slice(7)}"`:`data-filter="${value}"`}>${label}</button>`).join('');return `<div class="r5-container r5-footer-main"><div class="r5-footer-brand">${logo()}<p>Variedad y buenos precios para cada parte de tu vida.<br>Compra a tu ritmo. Compra RPM.</p><div class="r5-socials"><button data-action="social" aria-label="Facebook">${icon('facebook')}</button><button data-action="social" aria-label="Instagram">${icon('instagram')}</button><button data-action="social" aria-label="X">𝕏</button><button data-action="social" aria-label="Pinterest">p</button><button data-action="social" aria-label="YouTube">${icon('youtube')}</button></div></div><div class="r5-footer-links"><h3>Tienda</h3>${links([['Todas las categorías','all'],['Ofertas','offers'],['Novedades','new'],['Más vendidos','best'],['Liquidación','offers']])}</div><div class="r5-footer-links"><h3>Servicio al cliente</h3>${links([['Centro de ayuda','action:help'],['Mi cotización','action:quote'],['Cambios y devoluciones','action:help'],['Cómo comprar','action:help'],['Contáctanos','action:help']])}</div><div class="r5-footer-links"><h3>Sobre RPM</h3>${links([['Quiénes somos','action:about'],['Sucursales','action:branches'],['Mayoristas','action:help'],['Métodos de pago','action:help'],['Trabaja con nosotros','action:about']])}</div><div class="r5-download"><h3>Descarga nuestra app</h3><p>Compra desde tu dispositivo móvil</p><button data-action="download" aria-label="Descargar desde Google Play">${photo('google','Google Play')}</button><button data-action="download" aria-label="Descargar desde App Store">${photo('apple','App Store')}</button></div></div><div class="r5-container r5-footer-bottom"><span>© 2026 RPM Rebajas por Minuto. Todos los derechos reservados.</span><div><button data-action="privacy">Privacidad</button><span>|</span><button data-action="privacy">Términos de uso</button><span>|</span><button data-action="privacy">Cookies</button></div></div>`}
function setSearchOpen(open){root.querySelector('#r5-search-panel').hidden=!open;root.querySelector('[data-action="toggle-search"]').setAttribute('aria-expanded',String(open));if(open)root.querySelector('#r5-search-input').focus()}
function updateHeader(){const homeLink=root.querySelector('.r5-nav-home');if(state.view==='home')homeLink.setAttribute('aria-current','page');else homeLink.removeAttribute('aria-current');root.querySelector('#r5-cart-count').textContent=Object.values(state.cart).reduce((a,b)=>a+b,0);root.querySelector('#r5-branch-trigger').textContent=branches[state.branch];root.querySelectorAll('#r5-branch-panel [data-branch]').forEach(b=>{if(Number(b.dataset.branch)===state.branch)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current')})}
function renderMain(){root.querySelector('#r5-main').innerHTML=state.view==='home'?home():catalog();updateHeader();icons()}
function closeBranch(){root.querySelector('#r5-branch-panel').hidden=true;root.querySelector('#r5-branch-trigger').setAttribute('aria-expanded','false')}
let dialogFocus=null;
let dialogPageOverflow=null;
function closeDialog(){const host=root.querySelector('#r5-dialog-host'),layer=host.querySelector('dialog');if(layer?.open)layer.close();host.replaceChildren();if(dialogPageOverflow!==null){document.documentElement.style.overflow=dialogPageOverflow;dialogPageOverflow=null;}if(dialogFocus?.isConnected)dialogFocus.focus({preventScroll:true});dialogFocus=null;}
function dialog(title,body,subtitle='',narrow=false){const host=root.querySelector('#r5-dialog-host');if(!host.querySelector('dialog[open]'))dialogFocus=document.activeElement;const previous=host.querySelector('dialog');if(previous?.open)previous.close();closeBranch();host.innerHTML=`<dialog class="r5-dialog-shade" aria-labelledby="r5-dialog-title"><section class="r5-dialog ${narrow?'narrow':''}" tabindex="-1" aria-labelledby="r5-dialog-title"><header><div><h2 id="r5-dialog-title">${title}</h2>${subtitle?`<p>${subtitle}</p>`:''}</div><button class="r5-close" data-action="close" aria-label="Cerrar">${icon('x')}</button></header><div class="rpm-modal-content">${body}</div></section></dialog>`;const layer=host.querySelector('dialog');layer.addEventListener('cancel',e=>{e.preventDefault();closeDialog()});if(dialogPageOverflow===null){dialogPageOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';}icons();layer.showModal();host.querySelector('.r5-dialog').focus({preventScroll:true});}

function account(){dialog('Inicia sesión',`<label for="r5-login-email">Correo electrónico</label><input id="r5-login-email" type="email" autocomplete="off" placeholder="tu@correo.com"><label for="r5-login-password">Contraseña</label><input id="r5-login-password" type="password" autocomplete="off" placeholder="Tu contraseña"><button class="r5-primary r5-login-button" data-action="login-demo">Iniciar sesión ${icon('arrow-right')}</button><p id="r5-login-status" class="r5-dialog-status" role="status" hidden>Vista previa de diseño. El acceso a cuentas aún no está conectado.</p>`,'Bienvenido a tu cuenta RPM.',true)}
function quote(){const list=cartProducts();dialog('Mi cotización',list.length?`${list.map(p=>`<article class="r5-quote-line">${photo(p.photo,p.name)}<div><h3>${p.name}</h3><p>${money(p.price)} por unidad</p><div class="r5-quantity"><button data-quantity-step="-1" data-item="${p.id}" aria-label="Reducir cantidad de ${esc(p.name)}">−</button><span>${state.cart[p.id]}</span><button data-quantity-step="1" data-item="${p.id}" aria-label="Aumentar cantidad de ${esc(p.name)}">+</button></div></div><strong>${money(p.price*state.cart[p.id])}</strong></article>`).join('')}<div class="r5-quote-total"><span>Total de productos</span><strong>${money(total())}</strong></div><p class="r5-quote-notice">Impuestos y disponibilidad por confirmar con ${branches[state.branch]}.</p><button class="r5-whatsapp" data-action="request">${icon('message-circle')} Enviar por WhatsApp</button>`:'<p class="r5-empty">Agrega productos para preparar tu próxima compra.</p>',branches[state.branch]+' · Retiro en tienda')}
function product(id){state.selected=id;state.qty=1;const p=products.find(p=>p.id===id);dialog(p.name,`${photo(p.photo,p.name,'r5-detail-dialog-photo')}<p class="r5-detail-description">${p.description}</p><div class="r5-detail-price">${money(p.price)} <small>por unidad</small></div><div class="r5-detail-actions"><div class="r5-quantity"><button data-detail-step="-1" aria-label="Reducir cantidad">−</button><input id="r5-detail-qty" type="number" min="1" max="999" value="1" aria-label="Cantidad"><button data-detail-step="1" aria-label="Aumentar cantidad">+</button></div><button class="r5-primary" data-detail-add="${p.id}">Agregar a mi cotización ${icon('shopping-cart')}</button></div>`,p.cat+' · '+branches[state.branch],true)}
function add(id,qty=1){state.cart[id]=Math.min(999,(state.cart[id]||0)+qty);updateHeader();persist();toast('Producto agregado a tu cotización.')}
function filter(value){state.filter=value;state.view='catalog';state.search='';closeDialog();closeBranch();renderMain();persist()}
function help(){dialog('Cómo comprar en RPM','<p class="r5-detail-description"><b>1. Explora.</b> Elige productos de tu sucursal.<br><br><b>2. Cotiza.</b> Agrega artículos y cantidades para conocer tu inversión.<br><br><b>3. Coordina.</b> Envía tu lista por WhatsApp y confirma los detalles antes de retirar.</p>','Al por mayor y al detal.')}
root.addEventListener('click',e=>{
const b=e.target.closest('button');if(!b)return;
root.querySelectorAll('.r5-primary-nav details[open]').forEach(d=>d.open=false);
if(b.dataset.r6Tab){state.featuredTab=b.dataset.r6Tab;state.featuredPage=0;renderMain();root.querySelector('#r6-tab-'+state.featuredTab).focus();persist();return}
if(b.dataset.r6Slide){state.featuredPage=(state.featuredPage+Number(b.dataset.r6Slide)+3)%3;renderMain();persist();return}
if(b.dataset.r6Page!==undefined){state.featuredPage=Number(b.dataset.r6Page);renderMain();persist();return}
if(b.dataset.r6Quote){state.quoteIndex=(state.quoteIndex+1)%sampleOpinions.length;renderMain();persist();return}
if(b.dataset.r6Blog){state.blogPage=(state.blogPage+1)%2;renderMain();persist();return}
if(b.dataset.r6Article!==undefined){const article=rpmArticles[Number(b.dataset.r6Article)];if(article)dialog(article.title,'<p class="r5-detail-description">'+esc(article.body)+'</p>','Ideas RPM');return}

if(b.id==='r5-branch-trigger'){const p=root.querySelector('#r5-branch-panel');p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));return}
if(b.dataset.branch!==undefined){state.branch=Number(b.dataset.branch);closeBranch();renderMain();persist();return}
if(b.dataset.favorite){const id=Number(b.dataset.favorite);state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];renderMain();persist();return}
if(b.dataset.add){add(Number(b.dataset.add));return}
if(b.dataset.product){product(Number(b.dataset.product));return}
if(b.dataset.detailStep){state.qty=Math.max(1,Math.min(999,state.qty+Number(b.dataset.detailStep)));root.querySelector('#r5-detail-qty').value=state.qty;return}
if(b.dataset.detailAdd){add(Number(b.dataset.detailAdd),state.qty);closeDialog();return}
if(b.dataset.quantityStep){const id=Number(b.dataset.item);const next=state.cart[id]+Number(b.dataset.quantityStep);if(next<=0)delete state.cart[id];else state.cart[id]=Math.min(999,next);updateHeader();persist();quote();return}
if(b.dataset.filter){filter(b.dataset.filter);return}
const action=b.dataset.action;
if(action==='home'){state.view='home';state.search='';closeDialog();closeBranch();root.querySelector('#r5-search-input').value='';renderMain();persist()}
else if(action==='toggle-search')setSearchOpen(root.querySelector('#r5-search-panel').hidden);
else if(action==='account')account();
else if(action==='favorites')filter('favorites');
else if(action==='quote')quote();
else if(action==='close')closeDialog();
else if(action==='help')help();
else if(action==='categories')dialog('Explora por categoría',`<div class="r5-categories" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:20px 12px">${categories.map((c,i)=>`<button class="r5-category" style="font-size:12px;gap:8px" data-filter="${c}">${photo('cat'+i,c)}<span>${c}</span></button>`).join('')}</div>`);
else if(action==='branches'){closeDialog();const p=root.querySelector('#r5-branch-panel');p.hidden=false;root.querySelector('#r5-branch-trigger').setAttribute('aria-expanded','true')}
else if(action==='search'){setSearchOpen(false);state.search=root.querySelector('#r5-search-input').value.trim().slice(0,80);state.filter='all';state.view='catalog';closeDialog();renderMain();persist()}
else if(action==='login-demo')root.querySelector('#r5-login-status').hidden=false;
else if(action==='request'){const text=[`Hola, RPM ${branches[state.branch]}. Me interesa cotizar:`,...cartProducts().map(p=>`${state.cart[p.id]} × ${p.name}: ${money(p.price*state.cart[p.id])}`),'',`Total de productos: ${money(total())}`,'Impuestos y disponibilidad: por confirmar.','Retiro en tienda.'].join('\n');dialog('Solicitud por WhatsApp',`<div class="r5-message">${esc(text)}</div><p class="r5-dialog-status">Vista previa. No se envían mensajes desde esta demostración.</p>`)}
else if(action==='subscribe'){const email=root.querySelector('#r5-newsletter-email');if(!email.value||!email.checkValidity()){email.reportValidity();if(!email.value){email.focus();toast('Escribe tu correo electrónico.')}return}toast('Vista previa: la suscripción se configurará para la tienda.');email.value=''}
else if(action==='about')dialog('Rebajas por Minuto','<p class="r5-detail-description">Artículos para tu hogar, tu día a día y tu negocio. RPM vende al por mayor y al detal y cuenta con sucursales en Av. Obaldía, Calle 4ta y Puerto Armuelles.</p>');
else if(['download','social','privacy'].includes(action))toast('Enlace de muestra para esta propuesta de diseño.');
});
root.querySelector('#r5-search-input').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();root.querySelector('[data-action="search"]').click()}});
root.addEventListener('input',e=>{if(e.target.id==='r5-detail-qty'&&e.target.value!=='')state.qty=Math.max(1,Math.min(999,Math.floor(Number(e.target.value)||1)))});
root.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialog();closeBranch();setSearchOpen(false);root.querySelectorAll('.r5-primary-nav details[open]').forEach(d=>d.open=false)}if(e.key==='Tab'){const dialogEl=root.querySelector('.r5-dialog');if(!dialogEl)return;const controls=[...dialogEl.querySelectorAll('button,input')].filter(x=>!x.disabled);const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
root.addEventListener('click',e=>{if(e.target.classList.contains('r5-dialog-shade'))closeDialog();if(!e.target.closest('#r5-branch-panel')&&!e.target.closest('#r5-branch-trigger')&&!e.target.closest('[data-action="branches"]'))closeBranch()});
window.addEventListener('openai:set_globals',e=>{const s=e.detail?.globals?.widgetState?.privateContent;if(s?.version===5){restore(s);renderMain()}});
root.querySelector('#r5-footer').innerHTML=footer();renderMain();

})();
