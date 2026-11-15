export type IzgaraYuzu='az'|'tam'|'kavruk'|'yanik';
export type IzgaraPismesi=[IzgaraYuzu,IzgaraYuzu];
export const izgaraKivami=(ms:number):IzgaraYuzu=>ms<1850?'az':ms<8500?'tam':ms<15500?'kavruk':'yanik';
export const izgaraPuani=(yuz:IzgaraPismesi):1|2|3=>yuz.includes('yanik')?1:yuz.every(k=>k==='tam')?3:2;
export const kavurmaRengi=(yuz:IzgaraYuzu)=>yuz==='yanik'?'brightness(.48) saturate(.58)':yuz==='kavruk'?'sepia(.48) saturate(1.55) brightness(.79)':'none';
export const servisYuzu=(yuz:IzgaraPismesi)=>yuz.includes('yanik')?'yanik':yuz.includes('kavruk')?'kavruk':yuz.includes('az')?'az':'tam';
export const izgaraYuzleri=(v:unknown):IzgaraPismesi|undefined=>Array.isArray(v)&&v.length===2&&v.every(k=>['az','tam','kavruk','yanik'].includes(k))?[v[0],v[1]]:undefined;
