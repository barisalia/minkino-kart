import { h } from '../../src/ui/dom';
import { resim, dugme, ikon } from './gorsel';
import { boy, parcalariKur } from './kesim-geometri';
import { kesikResmi, parcaCiz, svgOge } from './kesim-resmi';
import { jest, hareket, icinde, merkez } from './hareket';
import { dograndi, type MalzemeId, type Siparis } from './tarif';

export function hazirlikTabagi(s: Siparis) {
  const tabak = s.tahtadaki ? dugme('Parçaları tabağa al','dograma-tabagi',resim('hazirlik-tabagi'))
    : h('div.dograma-tabagi',{'aria-label':'Hazırlık tabağı'},resim('hazirlik-tabagi'));
  for(const id of s.alinan) {
    if(id===s.tahtadaki || !dograndi(s,id) || s.aktarilan.includes(id)) continue;
    const porsiyon=kesikResmi(id,parcalariKur(id,s.kesimler[id],s.kesitler[id]));
    porsiyon.classList.add('tabakta-porsiyon');
    tabak.append(porsiyon);
  }
  return tabak;
}

export function tahtayiTopla(s: Siparis, id: MalzemeId, tabak: HTMLElement, bitti: () => void) {
  const b=dugme('Doğranan parçaları tabağa sıyır','kesim-alani topla-alani');
  b.dataset.topla=id;
  const h=boy(id);
  const resimler=svgOge('svg',{class:'kesim-govde',viewBox:`-80 -80 800 ${h+160}`,'aria-hidden':'true'});
  resimler.style.width='min(89cqw, '+(98*800/(h+160))+'cqh)';
  const parcalar=parcalariKur(id,s.kesimler[id],s.kesitler[id]);
  resimler.append(...parcalar.map(p=>parcaCiz(id,p)));
  const yon=ikon('ileri');
  yon.classList.add('siyirma-yonu');
  b.append(resimler,yon);
  tabak.classList.add('tabak-bekliyor');
  let alindi=false, dx=0, dy=0;
  function surukle(x: number,y: number) {
    dx=x; dy=y;
    resimler.style.transform=`translate(${dx}px,${dy}px)`;
  }
  async function yerlestir() {
    if(alindi || !b.isConnected) return;
    alindi=true;
    yon.hidden=true;
    const hedef=merkez(tabak), sahan=merkez(b);
    await hareket(resimler,[
      {transform:`translate(${dx}px,${dy}px) scale(1)`},
      {transform:`translate(${hedef.x-sahan.x}px,${hedef.y-sahan.y}px) scale(.36)`},
    ],260);
    if(b.isConnected) bitti();
  }
  tabak.addEventListener('click', () => void yerlestir());
  jest(b,{
    tasi:(yer,ilk)=>{if(!alindi) surukle(yer.x-ilk.x,yer.y-ilk.y);},
    birak:(yer,ilk,tik)=>{
      if(alindi) return;
      const yana=yer.x-ilk.x;
      if(tik || icinde(tabak,yer,18) || yana>b.clientWidth*.28 && Math.abs(yer.y-ilk.y)<yana*.8) void yerlestir();
      else surukle(0,0);
    },
    iptal:()=>{if(!alindi) surukle(0,0);},klavye:()=>void yerlestir(),
  });
  return b;
}
