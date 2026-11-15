import { h, svg } from '../../src/ui/dom';
import { IKON } from '../../src/ui/ikonlar';

const kaynaklar = import.meta.glob<string>('../../assets/sef/{sahneler,nesneler}/*.webp', {
  eager: true, query: '?url', import: 'default',
});
export const kaynak = (grup: 'sahneler' | 'nesneler', id: string) =>
  kaynaklar[`../../assets/sef/${grup}/${id}.webp`];
export const resim = (id: string, sinif = '') => h('img', {
  class: sinif, src: kaynak('nesneler', id), alt: '', draggable: 'false',
});

const simgeResimleri=import.meta.glob<string>('../../assets/sef/ikon-atolyesi/simge/*.webp',{eager:true,query:'?url',import:'default'});
export type Simge = keyof typeof IKON | 'ileri' | 'asagi' | 'dolap' | 'tahta' | 'ocak' | 'ates' | 'katla' | 'kase' | 'servis' | 'sepet' | 'karistir' | 'sef';
export function ikon(ad: Simge) {
  const src=simgeResimleri['../../assets/sef/ikon-atolyesi/simge/'+ad+'.webp'];
  if(src)return h('span.ikon',{'aria-hidden':true,class:'ikon sef-simge sef-simge-'+ad},h('img',{src,alt:'',draggable:false}));
  return svg(IKON[ad as keyof typeof IKON], "sef-simge sef-simge-"+ad);
}
export function dugme(ad: string, sinif: string, ...cocuklar: Node[]) {
  return h('button', { type: 'button', class: sinif, 'aria-label': ad }, ...cocuklar);
}
