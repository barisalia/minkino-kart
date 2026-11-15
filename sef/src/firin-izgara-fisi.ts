import replik from './firin-izgara-siparisleri.json';

const mucver=['mucver-altin-yogurt','mucver-citir-dereotu','mucver-altin-limon','mucver-citir-yogurt','mucver-altin-dereotu','mucver-citir-limon'] as const;
const sis=['sis-fis-bahce','sis-fis-ananas','sis-fis-mantar','sis-fis-yaz'] as const;
export const mucverIstegi=(tur:number)=>replik[mucver[tur]];
export const sisIstegi=(tur:number)=>replik[sis[tur]];
export const firinIzgaraTadimi=replik;
