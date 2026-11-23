// Independent, high-resolution demo photographs; real catalog uploads keep their own URLs.
const photoAssets={
  hero:{width:2400,height:1800,position:'65% 50%'},
  p1:{width:1600,height:2400,position:'50% 57%'},
  p2:{width:1600,height:2400,position:'50% 62%'},
  p3:{width:1600,height:2399,position:'55% 56%'},
  p4:{width:1600,height:2400,position:'50% 62%'},
  p5:{width:1600,height:1067,position:'50% 60%'},
  p6:{width:1600,height:900,position:'50% 50%'},
  p7:{width:1600,height:2400,position:'50% 65%'},
  p8:{width:1600,height:1067,position:'50% 50%'},
  p9:{width:1600,height:1201,position:'50% 45%'},
  p10:{width:1600,height:2221,position:'45% 53%'}
};
function photo(key,label,extra=''){
  const asset=photoAssets[key];
  const external=typeof key==='string'&&(key.startsWith('/media/')||key.startsWith('https://'));
  if(asset||external){
    const src=asset?`/images/rpm/${key}.webp`:key;
    const width=asset?.width||1200,height=asset?.height||1200;
    return `<div class="r5-photo rpm-image ${extra}" style="aspect-ratio:${width}/${height};--photo-position:${asset?.position||'50% 50%'}"><img src="${esc(src)}" alt="${esc(label)}" width="${width}" height="${height}" loading="${key==='hero'?'eager':'lazy'}" decoding="async"></div>`;
  }
  const [x,y,w,h]=crops[key]||crops.p1;
  return `<div class="r5-photo ${extra}" role="img" aria-label="${esc(label)}" style="aspect-ratio:${w}/${h};background-size:${736/w*100}% ${1307/h*100}%;background-position:${x/(736-w)*100}% ${y/(1307-h)*100}%"></div>`;
}
