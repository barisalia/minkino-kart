import { h } from '../../src/ui/dom';
import { parcalariKur } from './kesim-geometri';
import { kesikResmi } from './kesim-resmi';
import { resim } from './gorsel';
import {siparisBaslat,type CorbaKivami,type MalzemeId,type Siparis} from './tarif';
import './kap-ici.css';

// Coordinates lie inside the painted mouth of each vessel, on its surface plane.
type Parca = readonly [x: number, y: number, en: number, aci: number];
const corba: Record<MalzemeId, readonly Parca[]> = {
  patates: [[28,51,19,-10],[60,29,17,22],[76,57,15,-36],[40,39,14,18],[48,69,14,29]],
  domates: [[37,29,22,16],[59,60,18,-27],[28,68,15,14],[68,44,16,8],[53,74,14,-31]],
  havuc: [[68,43,18,-14],[47,69,16,12],[24,45,13,23],[59,74,14,13],[42,31,12,-16]],
  marul: [[39,25,19,-15],[70,64,18,20],[22,59,16,28],[54,33,16,15],[48,72,14,-25]],
  salatalik: [[64,28,18,16],[42,62,16,-28],[70,64,15,-14],[24,39,14,20],[51,46,14,33]],
};
export function kapIci(s: Siparis) {
  if(s.tarifId==='salata') return salataIci(s);
  const kap = h('div.kap-ic.sef-kap', {
    'aria-hidden': 'true', 'data-yemek': s.tarifId, 'data-tur': String(s.karistirma),
  });
  for (const [malzeme, dizilim] of Object.entries(corba)) {
    if (!s.aktarilan.includes(malzeme as MalzemeId) || s.ezilen.includes(malzeme as MalzemeId)) continue;
    const id = malzeme as MalzemeId;
    const kesikler = parcalariKur(id, s.kesimler[id], s.kesitler[id]);
    for (const [i,kesik] of kesikler.entries()) {
      const [x,y,en,aci] = dizilim[i] ?? (i===5?[35,57,14,5]:[65,51,13,-27]);
      // Every turn moves the same cut pieces along an ellipse on the liquid surface.
      const a = s.karistirma * .55;
      const dx = x - 50, dy = (y - 50) * .78;
      const px = 50 + dx * Math.cos(a) - dy * Math.sin(a);
      const py = 50 + (dx * Math.sin(a) + dy * Math.cos(a)) / .78;
      // Pişen parçaların kesit yüzü yukarı döner.
      const pisti=s.karistirma===3;
      const parca = pisti?resim(yuzAdi[id],'corba-pismis-lokma'):kesikResmi(id,[kesik]);
      parca.classList.add('sef-kap-parcasi');
      parca.dataset.malzeme = malzeme;
      parca.style.left=px+'%';
      parca.style.top=py+'%';
      parca.style.width=en*Math.sqrt(3/kesikler.length)+'%';
      parca.style.rotate=(aci+s.karistirma*(i%2?10:-9))+'deg';
      kap.append(parca);
    }
  }
  return kap;
}

type Yuva = readonly [x:number, y:number, aci:number];
const yuvalar: Record<MalzemeId,readonly Yuva[]> = {
  marul: [[21,33,-22],[39,21,-48],[60,20,-15],[77,33,12],[49,54,-32]],
  salatalik: [[26,56,-13],[42,35,-19],[68,37,16],[76,57,-13],[49,73,16]],
  domates: [[20,52,-13],[38,53,2],[58,44,18],[67,68,-6],[44,70,12]],
  patates:[[24,34,18],[38,51,-8],[58,25,-16],[70,54,12],[49,68,-17]],
  havuc:[[28,48,-10],[46,28,13],[71,35,-20],[37,68,-22],[64,64,8]],
};
const yuzAdi = { marul:'marul-parca', salatalik:'salatalik-dilim', domates:'domates-dilim', patates:'patates-dilim',havuc:'havuc-dilim' };

function salataIci(s:Siparis,porsiyon=2) {
  const ici=h('div.kap-ic.sef-kap',{'data-yemek':'salata','data-tur':String(s.karistirma),'aria-hidden':'true'});
  const malzemeler: readonly MalzemeId[]=['marul','salatalik','domates','havuc','patates'];
  for(const [tur,id] of malzemeler.entries()) {
    if(!s.aktarilan.includes(id) || porsiyon===0)continue;
    const kesikler=parcalariKur(id,s.kesimler[id],s.kesitler[id]);
    const olculer=kesikler.map(p=>{
      const alan=Math.abs(p.kontur.reduce((a,n,i)=>{const k=p.kontur[(i+1)%p.kontur.length];return a+n.x*k.y-n.y*k.x;},0))/2;
      const yuz=p.yuzler.at(-1);
      const yon=yuz?Math.atan2(yuz.b.y-yuz.a.y,yuz.b.x-yuz.a.x)*180/Math.PI:0;
      const xler=p.kontur.map(n=>n.x), yler=p.kontur.map(n=>n.y);
      const boy=Math.max(...yler)-Math.min(...yler), en=Math.max(...xler)-Math.min(...xler);
      return {alan,yon,uzunluk:Math.max(en,boy)};
    });
    const ortalama=olculer.reduce((a,p)=>a+p.alan,0)/olculer.length;
    const ortaBoy=olculer.reduce((a,p)=>a+p.uzunluk,0)/olculer.length;
    for(const [i,o] of olculer.entries()) {
      const ilkMasada=(i+tur)%2===0;
      if(porsiyon===1 && !ilkMasada)continue;
      // The tongs turn each piece face-up. Its area and longest edge determine
      // its size at the table; the angle of the child's last cut turns its face.
      const oran=Math.max(.63,Math.min(1.26,.7*Math.sqrt(o.alan/ortalama)+.3*o.uzunluk/ortaBoy));
      const en=oran*(id==='marul'?34:id==='salatalik'?23:25)*Math.sqrt(5/kesikler.length);
      const yerler=kesikler.length>5?[...yuvalar[id],[32,65,-12],[60,58,14]]:yuvalar[id];
      const [x,y,aci]=yerler[(i+s.karistirma)%yerler.length];
      const parca=resim(yuzAdi[id],'sef-kap-parcasi salata-lokmasi');
      parca.dataset.malzeme=id;
      parca.dataset.kesik=String(i);
      parca.dataset.masa=ilkMasada?'1':'2';
      Object.assign(parca.style,{
        width:en+'%', left:x+'%',top:(porsiyon===1?13+y*.9:y)+'%',
        rotate:(aci+o.yon*.11+(s.karistirma%2?3:-3))+'deg',
        zIndex:String(Math.floor(y/6)+(id==='marul'?0:1)),
      });
      ici.append(parca);
    }
  }
  return ici;
}

/** Ön dudak, çocuk hangi yönde keserse kessin kabın arkasındaki lokmayı örter. */
export function salataKasesi(s:Siparis,porsiyon:number) {
  const kase=h('span.salata-porsiyonu',{'data-doluluk':String(porsiyon)});
  const govde=h('span.salata-kase-govdesi');
  const ici=salataIci(s,porsiyon); ici.className='salata-kucuk-ic';
  govde.append(resim('salata-kasesi','salata-kase-taban'),ici,resim('salata-kase-on','salata-kase-on'));
  kase.append(govde);
  return kase;
}

/** Kâsenin mavi ağzının içindeki sıvı ve yüzeye çıkan gerçek sebzeler. */
export function corbaKasesi(s:Siparis,porsiyon:number) {
  const kase=h('span.corba-porsiyonu',{'data-doluluk':String(porsiyon)});
  const govde=h('span.corba-kase-govdesi',{},resim('corba-kasesi','corba-kase-taban'));
  if(porsiyon){
    const sivi=h('span.corba-yuzeyi');
    sivi.style.backgroundColor=corbaRengi(s);
    const konumlar=[[27,52],[53,26],[72,57]];
    s.aktarilan.forEach((id,i)=>{
      if(s.ezilen.includes(id))return;
      const lokma=resim(yuzAdi[id],'corba-lokmasi');
      lokma.dataset.malzeme=id;
      const secim=s.kesimBoylari?.[id];
      if(secim){
        const oran=Math.sqrt(5/(secim+1));
        lokma.style.width=20*oran+'%';lokma.style.height=33*oran+'%';
      }
      lokma.style.left=konumlar[i][0]+'%';lokma.style.top=konumlar[i][1]+'%';
      sivi.append(lokma);
    });
    govde.append(sivi,resim('corba-kasesi','corba-kase-on'));
  }
  kase.append(govde);return kase;
}

export function corbaRengi(s:Siparis) {
  const temel=s.aktarilan.includes('domates')?[241,122,58]:s.aktarilan.includes('havuc')?[243,171,69]:[173,199,107];
  if(!s.ezilen.length)return 'rgb('+temel.join(',')+')';
  const pure:Record<MalzemeId,readonly number[]>={domates:[232,98,49],havuc:[255,156,58],patates:[252,208,121],marul:[154,191,86],salatalik:[174,206,125]};
  // Ezilen sebzenin rengi aynı anda tencerede, kepçede ve tabakta görülür.
  const renk=temel.map((deger,i)=>Math.round((2*deger+s.ezilen.reduce((toplam,id)=>toplam+pure[id][i],0))/(2+s.ezilen.length)));
  return 'rgb('+renk.join(',')+')';
}

export function corbaKivamOrnegi(kivam:CorbaKivami) {
  const sebzeler:MalzemeId[]=['domates','havuc','patates'];
  return corbaKasesi({...siparisBaslat('corba'),aktarilan:sebzeler,ezilen:kivam==='puruzsuz'?sebzeler:kivam==='patates'?['patates']:[]},2);
}
