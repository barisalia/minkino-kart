// Ton tabloları çizilmiş parçaların saydamlığını, mürekkebini ve beyazlarını korur.
const tonlar={
 1:['855342','c28d69'],2:['ac8b6d','f2dab2'],3:['65788c','b2c4cd'],4:['aa7156','edb28c'],
 5:['5d6570','a0a1ae'],6:['6a514c','b28a79'],7:['a07943','e5bd73'],8:['494963','89819e']
};
function tonFiltresi([id,[koyu,acik]]){
 const channels=['R','G','B'].map((harf,i)=>{
  const kanal=renk=>(parseInt(renk.slice(i*2,i*2+2),16)/255).toFixed(4);
  return `<feFunc${harf} type="table" tableValues="0 .12 ${kanal(koyu)} ${kanal(acik)} .995"/>`;
 }).join('');
 return `<filter id="pati-post-${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values=".12"/><feComponentTransfer>${channels}</feComponentTransfer></filter>`;
}
export const renkTablolari=`<svg aria-hidden="true" width="0" height="0" style="position:absolute;pointer-events:none"><defs>${Object.entries(tonlar).map(tonFiltresi).join('')}</defs></svg>`;
export function postFiltresi(model){
 const ton=model.madalya ? 0 : model.seri;
 return ton?'url(#pati-post-'+ton+')':'none';
}
export function gorunum(model){
 return `data-metal="${model.madalya}" style="--post:${postFiltresi(model)}"`;
}
