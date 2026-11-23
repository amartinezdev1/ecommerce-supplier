const demo=[
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
export const initialConfig={demo:true,branches:[{id:"obaldía",name:"Av. Obaldía",phone:"50769259368",address:"Av. Obaldía, David",hours:"Lunes a sábado, 9:00 a.m. a 7:00 p.m."},{id:"calle4",name:"Calle 4ta",phone:"50765818939",address:"Calle 4ta, David",hours:"Lunes a sábado, 9:00 a.m. a 7:00 p.m. · Domingo, 10:00 a.m. a 4:30 p.m."},{id:"puerto",name:"Puerto Armuelles",phone:"50766218966",address:"Puerto Armuelles, Chiriquí",hours:"Lunes a sábado, 9:00 a.m. a 7:00 p.m."}],taxBps:null,rules:[]};
export const initialProducts=demo.map(p=>({...p,sku:"DEMO-"+String(p.id).padStart(3,"0"),active:true,inventory:Object.fromEntries(initialConfig.branches.map(b=>[b.id,{priceCents:Math.round(p.price*100),stock:null,enabled:true,tiers:[]}]))}));
