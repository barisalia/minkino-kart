const svg=(view:string,body:string)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+view+'" width="100%" height="100%" aria-hidden="true" fill="none" stroke="#19191b" stroke-linecap="round" stroke-linejoin="round">'+body+'</svg>';
const dugmeler=import.meta.glob<string>('../../assets/hazirlik/dugmeler/*.webp',{eager:true,query:'?url',import:'default'});
const oyuncaklar:Record<string,string>={ev:'ev',ses:'dinle',sessiz:'sessiz',yenile:'tekrar',ileri:'ileri'};
export function simge(id:string){
  const dosya=dugmeler['../../assets/hazirlik/dugmeler/'+oyuncaklar[id]+'.webp'];
  if(dosya)return '<img class="oyuncak-dugme" src="'+dosya+'" draggable="false" alt="">';
  return svg('40 40','<path d="m8 21 8 8 16-19" stroke="#fff8db" stroke-width="7" fill="none"/>');
}
export const ray=svg('430 355','<g stroke-width="3"><path d="m35 34-15 299 16 3L52 35m333-1 15 299 15-2-14-300" fill="#d79e69"/><rect x="15" y="22" width="400" height="15" rx="7" fill="#efba78"/><path d="M23 315h383v15H23z" fill="#c38354"/><path d="m16 331-7 11q7 6 35 0l-2-10m346-1-4 12q20 5 39-2l-6-11" fill="#b77f59"/></g>');
export const tahta=svg('500 318','<path d="M24 42q0-24 30-24h384q34 0 35 29l6 212q0 30-36 33H53q-33 0-33-30z" fill="#c2844d" stroke-width="3"/><path d="M24 34q0-23 30-23h384q32 0 34 27l6 213q0 28-36 30H53q-31-1-32-28z" fill="#f6ce8d" stroke-width="3"/><rect x="37" y="26" width="425" height="238" rx="23" stroke="#cd9b62" stroke-width="3"/><ellipse cx="64" cy="50" rx="9" ry="7" fill="#a5744f" stroke-width="2"/>');
export const tepsi=svg('400 272','<rect x="8" y="17" width="384" height="243" rx="45" fill="#529e99" stroke-width="3"/><rect x="8" y="10" width="384" height="241" rx="45" fill="#a9e4d9" stroke-width="3"/><rect x="22" y="23" width="356" height="214" rx="35" fill="#dcf3df" stroke="#76b8ac" stroke-width="2"/>');
export const tabak=svg('285 110','<ellipse cx="142" cy="58" rx="136" ry="44" fill="#a4c6d1" stroke-width="2.5"/><ellipse cx="142" cy="52" rx="136" ry="43" fill="#fff9dd" stroke-width="2.5"/><ellipse cx="142" cy="51" rx="111" ry="31" fill="#fff0c6" stroke="#decda4" stroke-width="2"/>');
export const katliPecete=svg('180 118',
  '<path d="m7 87 78-74 84 47-79 50Z" fill="#74b9ab" stroke-width="2.4"/>'+
  '<path d="m6 80 77-70 87 47-80 48Z" fill="#c5e8d5" stroke-width="2.4"/>'+
  '<path d="m6 80 83 9 80-32-80 47Z" fill="#8bc9bb" stroke-width="1.7"/>'+
  '<path d="m27 62 81 30m-73-37 81 32" stroke="#67a89d" stroke-width="3"/>'+
  '<path d="m83 10 15 30 24-9Z" fill="#ffdf83" stroke-width="1.6"/>');
export const acikPecete=svg('320 127',
  '<path d="m43 8 228 0q8 0 13 7l29 91q3 8-5 10H13q-9-1-6-9l29-91q2-7 7-8Z" fill="#bfe4cc" stroke-width="2.2"/>'+
  '<path d="M53 10 19 115m45-105L32 115m219-105 32 105m-20-105 32 105" stroke="#6eb9aa" stroke-width="3"/>'+
  '<path d="M90 112h153" stroke="#9dcbb4" stroke-width="1.5"/>');
export const askilik=svg('320 130','<rect x="8" y="21" width="302" height="80" rx="26" fill="#bf875d" stroke-width="3"/><rect x="8" y="14" width="302" height="78" rx="26" fill="#efc894" stroke-width="3"/><path d="m89 24 8 14 16 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2z" fill="#ffd33a" stroke-width="2"/><path d="M213 55q-1-27 32-28-2 31-32 28zm0 0 19-18" fill="#91c989" stroke-width="2"/><g fill="#6bb7b8" stroke-width="3"><path d="M80 78q10-10 16 1l-2 29q-6 14-18 3-8-8-2-13l7 4z"/><path d="M218 78q10-10 16 1l-2 29q-6 14-18 3-8-8-2-13l7 4z"/></g>');
