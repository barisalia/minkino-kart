import {restoranKarakterleri} from './restoran-karakterleri';
import {dekorRafiniEkle} from './dekor-magazasi';
import {bitisAdi,bitisIstegi,bitisResmi,corbaBitisiMi} from './corba-bitisi';
import {bahceGirisi,bostan} from './bostan';
import {sebzeLavabosu,yikamaIsareti} from './sebze-lavabosu';
import {citirSalata} from './tarif';
import { masayiCiz, masaGeri, restoranKapisi, siparisFisindenAc } from './tepsi-masasi';
import type { ServisKaydi } from './kayit';
import {sosMu,sosAd,sosIstegi,sosResmi,sosKatmani,yildizlar,type SosNoktasi} from './salata-sosu';
import {dilimUyuyor} from './tarif';
import {dilimIstegi,salatalikOrnegi,sebzeReplik} from './sebze-tercihi';
import {aktifMenu,bosMasa,menuBul} from './tepsi-fisleri';
import { salonSaatiniIlerlet } from './salon-saati';
import {kapidanSalon} from './restoran-salonu';
import {kilitAc} from './tatli-ekonomi';
import {tatliDukkan,jetonSimge} from './tatli-dukkan';
import {tatliResmi} from './tatli-gorsel';
import {tatliHazirla,type TatliId} from './tatli-atolyesi';
import {vitrineKoy} from './pastane-kaydi';
import {dekoruKoy} from './restoran-ustaligi';
import {pulDefteriDugmesi} from './pul-defteri';
import {pastaneSesleri} from './pastane-ses';
import './jeton.css';
import { atolyeTaslaginiSil, eskiAcikMasayiTasi, masaAnahtari } from './atolye-kaydi';
import './salata-servis.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-ext-600.css';
import { h } from '../../src/ui/dom';
import { anaMenuyeDon } from '../../src/uygulama';
import { geriDinle, ARKA_PLAN_OLAYI } from '../../src/kabuk/yon';
import { efekt } from '../../src/audio/efekt';
import { konus, sus } from '../../src/audio/konusma';
import { sesKokuAyarla, kayitlariHazirla } from '../../src/audio/kayit';
import { efektCikisi, sesMotorunuAc, seviyeleriUygula } from '../../src/audio/motor';
import { DosyaMuzik } from '../../src/audio/dosya-muzik';
import sabahMuzigi from '../../music/The_Morning_Whisk.mp3?url';
import { plopSesi } from '../../pazar/src/meyvesuyu-ses';
import { parcalariKur } from './kesim-geometri';
import { kesikResmi } from './kesim-resmi';
import { hazirlikTabagi, tahtayiTopla } from './hazirlik-tabagi';
import { kesimTahtasi } from './kesim';
import { kesmeSesi, karistirmaSesi, tezgahiSustur } from './mutfak-ses';
import {
  TARIFLER, SEBZELER, KESIM_BOYLARI, kesimHedefi, dograndi, KARISTIRMA_HEDEFI, rafaKoy, sebzeFarki, sebzeyiEz, kivamUyuyor, tabakTadimi, siparisBaslat, siradakiIstasyon,
  malzemeAl, kes, sonKesimiGeriAl, aktar, karistir, servisEt, type Siparis, type MalzemeId, type TarifId,
} from './tarif';
import { defteriAc, kaydet, susSecenekleri, yeniOzelIstek, tezgahSec,tezgahSiparisi,sebzeTaslaginiSil, type Susleme, type SusId, type Ekran } from './kayit';
import { ikon, resim, kaynak, dugme, type Simge } from './gorsel';
import { hareket, jest, merkez, icinde, malzemeTasi, zaman, type Nokta } from './hareket';
import { misafirResmi, misafirKonus, misafirCumlesi,misafirOzelKonus, sefKonus, restoranSiparisiniSoyle } from './misafir';
import { pizzaAc, pizzaDevamEdiyor, pizzaDurumu, pizzaResmi, pizzaTabakResmi, pizzaTaslaginiSil } from './firin';
import { kapIci,salataKasesi,corbaKasesi,corbaRengi,corbaKivamOrnegi } from './kap-ici';
import {blenderTezgahi} from './corba-blender';
import {blenderSesi} from './mutfak-ses';
import { mutfakRehberi } from './rehber';
import { porsiyonTezgahi } from './porsiyon';
import replikler from './replikler.json';
import { kapak, adlar, yeniTarifler, yeniTarifMi, fotografAc, fotografMi, fotografGecerli, type AtolyeAyar, type YeniTarif, type Yemek } from './yemekler';
import { tezgahlar, type TarifTezgahi } from './tarif-tezgahlari';
import './style.css';
import './siparisler.css';
import './kumandalar.css';

const kok = document.querySelector<HTMLElement>('#sef')!;
const canliDuyuru = document.querySelector<HTMLElement>('#sef-duyuru')!;
const defter = defteriAc();
const muzik = new DosyaMuzik(sabahMuzigi, .2);
let ilkDokunus = false;
let pismeSaati: number | undefined;
const pismeKalani = () => defter.secili === 'corba' ? Math.max(0, defter.pismeAni - Date.now()) : 0;
const porsiyonIstegi = () => defter.secili === 'corba' ? 'Kepçeyi tencereden küçük kâseye götür.' : 'Salatayı maşayla küçük kâseye koy.';
const sip = () => defter.siparisler[defter.secili]!;
const kivamIstegi=(s:Siparis)=>s.istenenKivam==='patates'?sebzeReplik['corba-patates']:s.istenenKivam==='puruzsuz'?'Çorbam pürüzsüz olsun. Sebzeleri ezebilir misin?':'Sebzelerin taneleri kâsemde kalsın, olur mu?';
const ocakIstegi=()=>sip().istenenKivam&&!defter.porsiyonlar.corba.adet&&!defter.porsiyonlar.corba.yuklu&&sip().ezilen.length<3&&!kivamUyuyor(sip())?kivamIstegi(sip()):porsiyonIstegi();
const tarif = () => TARIFLER[defter.secili];
const mutfak = h('section.mutfak-sahnesi', { 'aria-label': 'Mutfak' });
const dekor = h('img.dekor', { alt: '', draggable: 'false' });
const sahne = h('div.oyun-alani');
const ust = h('header.ust');
mutfak.append(dekor, sahne, ust);
kok.append(mutfak);
const rehberiPlanla = mutfakRehberi(mutfak, () => TARIFLER[defter.secili].malzemeler);
const isim: Record<MalzemeId, string> = {
  domates: 'Domates', havuc: 'Havuç', patates: 'Patates', salatalik: 'Salatalık', marul: 'Marul',
};
const istasyonAdlari: Record<Ekran, string> = {
  siparis: 'Siparişler', mutfak: 'Mutfak', dolap: 'Buzdolabı', tahta: 'Kesme tahtası',
  ocak: 'Çorba tenceresi', kase: 'Salata kâsesi', servis: 'Servis tezgâhı',
};
const dilim = (id: MalzemeId) => id + (id === 'marul' ? '-parca' : '-dilim');
function tikla(b: HTMLButtonElement, fn: () => void) {
  jest(b, { birak: (yer, _ilk, tik) => { if (tik && icinde(b, yer, 7)) fn(); }, klavye: fn });
}
const eylem = (ad: string, simge: Simge, fn: () => void, sinif = '') => {
  const b = dugme(ad, 'dugme ' + sinif, ikon(simge));
  tikla(b, fn);
  return b;
};
const ses = (fn: () => void) => { if (!defter.sessiz) fn(); };
let sonCumle = '';
function soyle(cumle: string) {
  sonCumle = cumle;
  canliDuyuru.textContent = cumle;
  if (!defter.sessiz) void sefKonus(cumle);
}
function tercihiDinlet(cumle:string,id:TarifId='corba') {
  sonCumle=cumle;canliDuyuru.textContent=cumle;
  const musteri=t.oynanan===id?menuBul(t.secili)?.misafir:undefined;
  if(!defter.sessiz)void misafirCumlesi(musteri??id,cumle,sip().servisEdildi?'tesekkur':'istek');
}
function misafirSoyle(id: TarifId, poz: 'istek' | 'tesekkur') {
  sonCumle = replikler[`${id === 'corba' ? 'lokum' : 'mino'}-${poz}`];
  canliDuyuru.textContent = sonCumle;
  if (!defter.sessiz) void misafirKonus(id, poz);
}
const sonDokunusResmi=(id:SusId,sinif='')=>corbaBitisiMi(id)?bitisResmi(id,sinif):sosMu(id)?sosResmi(id,sinif):resim(dilim(id),sinif);
function ozelSoyle(istek: SusId) {
  if(corbaBitisiMi(istek)){tercihiDinlet(bitisIstegi(istek));return;}
  if(sosMu(istek)){soyle(sosIstegi[istek]);return;}
  const id = defter.secili;
  const anahtar = id === 'corba' ? (istek === 'domates' ? 'lokum-domates' : 'lokum-havuc')
    : (istek === 'domates' ? 'mino-domates' : 'mino-salatalik');
  sonCumle = replikler[anahtar];
  canliDuyuru.textContent = sonCumle;
  if (!defter.sessiz) void misafirOzelKonus(id, istek);
}
function yonlendir(): string {
  if (defter.ekran === 'siparis') return 'Bugün hangi siparişi hazırlayalım?';
  const s = sip();
  switch (defter.ekran) {
    case 'mutfak': return s.alinan.length === 0 ? 'Sipariş fişindeki sebzeleri buzdolabında bul.' : istasyonCumlesi(sonraki());
    case 'dolap': return s.alinan.length === 3 ? 'Sebzeler sepette. Şimdi kesme tahtasına gidelim.' : 'Sebzeleri sepete koy.';
    case 'tahta': return s.tahtadaki ? 'Doğranan parçaları tabağa sıyır.' : s.alinan.some(i => !dograndi(s,i)) ? 'Tahtadaki sebzeyi lokmalık parçalara kes.' : istasyonCumlesi(sonraki());
    case 'ocak':
    case 'kase':
      if (pismeKalani()) return 'Çorba pişiyor.';
      if (defter.ekran !== tarif().istasyon) return istasyonCumlesi(sonraki());
      if (s.karistirma === KARISTIRMA_HEDEFI) return defter.porsiyonlar[s.tarifId].adet < 2 ? (s.tarifId==='corba'?ocakIstegi():porsiyonIstegi()) : istasyonCumlesi('servis');
      if (s.aktarilan.length === 3) return 'Kaşığı çevirerek karıştır.';
      if (s.alinan.some(i => dograndi(s,i) && !s.aktarilan.includes(i))) return 'Hazırladığın sebzeleri içine koy.';
      return istasyonCumlesi(siradakiIstasyon(s));
    case 'servis':
      if (s.servisEdildi) return 'Afiyet olsun!';
      if (s.karistirma < KARISTIRMA_HEDEFI || defter.porsiyonlar[s.tarifId].adet < 2) return istasyonCumlesi(sonraki());
      return defter.susler[s.tarifId] ? replikler.zil : s.tarifId==='salata'?'Bir sos seç ve salatanın üstüne dök.':replikler.susle;
  }
}
function istasyonCumlesi(id: string) {
  return ({ dolap: 'Buzdolabından eksik sebzeleri al.', tahta: 'Sebzeleri kesme tahtasına götür.',
    ocak: 'Sebzeleri tencereye götür.', kase: 'Sebzeleri salata kâsesine götür.', servis: 'Yemeğin hazır. Servis edelim.',
    tamam: 'Afiyet olsun!' } as Record<string,string>)[id];
}
let tarifRafi=0;
let acilanAtolye: YeniTarif | undefined;
let seciliSebze: MalzemeId | undefined;
let bekliyor = false;
let seciliSus: SusId | undefined;
let blenderSecili=false;
import { tabakGeldi } from './tepsi-hareket';
let masaTemizle:(()=>void)|undefined;
const t=defter.tepsiler;
const ayrilmaSesleri=import.meta.glob<string>('../../assets/sef/salon/*-ayril.mp3',{eager:true,query:'?url',import:'default'});
const sabirSaati=window.setInterval(()=>{
  if(document.hidden||t.gun.kapandi||t.pastane.acik||
    (t.ekran==='kapali'&&!t.oynanan))return;
  const salon=salonSaatiniIlerlet(t);
  for(const id of salon.ayrildi)yeniMasaTezgahi(id);
  if(salon.gelen||salon.ayrildi.length)window.dispatchEvent(new CustomEvent('sef-salon-degisti',{detail:{gelen:salon.gelen}}));
  for(const {id,sure} of salon.bekleyen){
    const yer=kok.querySelector<HTMLButtonElement>('.yan-salon-masa[data-menu="'+id+'"]');
    if(!yer)continue;
    if(sure>=90)yer.dataset.sabir=sure>=120?'gec':'az';
    if(sure===120){
      yer.dataset.ayriliyor='';yer.disabled=true;
      const kim=menuBul(id)!.misafir;
      const karakter=restoranKarakterleri[kim];
      const ses=ayrilmaSesleri['../../assets/sef/salon/'+karakter+'-ayril.mp3'];
      if(ses&&!defter.sessiz)void konus(ses);
    }
  }
  let kayitZamani=salon.kaydet;
  for(const [id,masa] of Object.entries(t.masalar)){
    if(masa.sunuldu||masa.beklemeSn===undefined||masa.beklemeSn>=300)continue;
    masa.beklemeSn=Math.min(300,masa.beklemeSn+5);
    if(masa.beklemeSn%30===0)kayitZamani=true;
    if(masa.beklemeSn>=240){
      for(const el of kok.querySelectorAll<HTMLElement>('[data-bekleyen]')){
        if(el.dataset.bekleyen===id)el.dataset.sabir=masa.beklemeSn>=300?'gec':'az';
      }
    }
  }
  if(kayitZamani)kaydet(defter);
},5000);
if(import.meta.hot)import.meta.hot.dispose(()=>clearInterval(sabirSaati));
function pastaneAc(){
  t.pastane.acik=true;kaydet(defter);sus();ciz();
}
function tepsiKaydet(servis:ServisKaydi){
  if(!t.oynanan){
    const pizzaMusterisi=servis.tarifId==='pizza'&&(servis.misafir==='salata'||servis.misafir==='corba')?servis.misafir:undefined;
    t.secili='raf-'+servis.tarifId+(pizzaMusterisi?'-'+pizzaMusterisi:'');
    t.masalar[t.secili]=bosMasa();
    t.oynanan=servis.tarifId;t.restoranda=false;
    delete t.yanMasadan;delete t.servisSalonu;
  }
  const masa=t.masalar[t.secili];
  if(masa&&!masa.sunuldu&&t.oynanan===servis.tarifId){
    masa.tabaklar[servis.tarifId]=servis;
    tabakGeldi(masa,servis.tarifId);
  }
}
function git(hedef: Ekran, anlat = true) {
  bostanAcik=false;
  tezgahiSustur();
  document.querySelectorAll('.tasinan,.elde-alet').forEach(el => el.remove());
  bekliyor = false;
  seciliSebze = undefined;
  seciliSus = undefined;
  blenderSecili=false;
  if(hedef==='siparis'&&t.oynanan){delete t.oynanan;t.ekran='masa';anlat=false;}
  defter.ekran = hedef;
  kaydet(defter);
  ciz();
  if (anlat) soyle(yonlendir());
}
function geri() {
  const pencere=document.querySelector<HTMLDialogElement>('dialog:modal');
  if(pencere){
    pencere.dispatchEvent(new Event('cancel',{cancelable:true}));
    return;
  }
  if(sahne.querySelector('.araba-geri:disabled,.sirali-geri:disabled,.aile-geri:disabled'))return;
  if(bostanAcik){bostanAcik=false;ciz();return;}
  if(t.pastane.tezgah){delete t.pastane.tezgah;kaydet(defter);ciz();return;}
  if(t.pastane.acik){t.pastane.acik=false;kaydet(defter);ciz();return;}
  if(t.ekran!=='kapali'){sus();masaGeri(t);kaydet(defter);ciz();return;}
  if (defter.ekran === 'siparis') { anaMenuyeDon(); return; }
  git(defter.ekran === 'mutfak' || sip().servisEdildi ? 'siparis' : 'mutfak');
}
geriDinle(() => {
  if (acilanAtolye || kok.querySelector('.firin-oyunu')) return false;
  geri(); return true;
});
document.addEventListener('keydown', e => {
  if (acilanAtolye || kok.querySelector('.firin-oyunu')) return;
  if (e.key === 'Escape' && !e.repeat) { e.preventDefault(); geri(); }
});
function arkaPlan(arkada: boolean) {
  if (arkada) { tezgahiSustur();sus(); muzik.durdur(); }
  else if (ilkDokunus && !defter.sessiz) muzik.baslat();
}
document.addEventListener('visibilitychange', () => arkaPlan(document.hidden));
window.addEventListener(ARKA_PLAN_OLAYI, e => arkaPlan((e as CustomEvent<{arkada: boolean}>).detail.arkada));
window.addEventListener('pagehide', () => arkaPlan(true));
sesKokuAyarla('../ses/');
void kayitlariHazirla();
const sesiUyandir = () => { ilkDokunus = true; if (!defter.sessiz) { sesMotorunuAc(); muzik.baslat(); } };
document.addEventListener('pointerdown', sesiUyandir, { passive: true });
document.addEventListener('keydown', sesiUyandir);

function durumYaz(s: Siparis) {
  defter.siparisler[defter.secili] = s;
  kaydet(defter);
}
function sonraki(): Ekran {
  if (pismeKalani()) return 'ocak';
  const ist = siradakiIstasyon(sip());
  if (ist === 'servis' && defter.porsiyonlar[defter.secili].adet < 2) return tarif().istasyon;
  return ist === 'tamam' ? 'siparis' : ist;
}
function ilerle(hedef = sonraki()) {
  const b = eylem(istasyonAdlari[hedef] + ' bölümüne git', 'ileri', () => git(hedef), 'ileri');
  b.prepend(ikon(hedef === 'siparis' ? 'tekrar' : hedef === 'mutfak' ? 'ev' : hedef));
  b.dataset.git = hedef;
  sahne.append(b);
}
function fis() {
  const s = sip();
  const yemek=s.istenenKivam?h('span.fis-kivam',{'data-istenen-kivam':s.istenenKivam},corbaKivamOrnegi(s.istenenKivam)):resim(s.tarifId,'fis-yemek');
  const b = dugme('Sipariş fişini dinle', 'fis', yemek, h('i.fis-ayir'));
  for (const id of tarif().malzemeler) {
    const alindi = s.alinan.includes(id);
    const durum = h('span.fis-sira', { 'data-alindi': String(alindi) }, id==='salatalik'&&s.salatalikBoyu?salatalikOrnegi(s.salatalikBoyu):resim(id));
    if (alindi) durum.append(h('i.fis-tik', {}, ikon('onay')));
    b.append(durum);
  }
  const istek = defter.ozelIstekler[s.tarifId];
  if (istek) b.append(h('span.fis-ozel', { 'aria-label': corbaBitisiMi(istek)?bitisIstegi(istek):sosMu(istek)?sosIstegi[istek]:isim[istek] + ' ile süsle' }, sonDokunusResmi(istek), ikon('yildiz')));
  tikla(b, () => {
    if(s.salatalikBoyu&&defter.ekran!=='servis')tercihiDinlet(dilimIstegi(s.salatalikBoyu),'salata');
    else if (s.istenenKivam && (defter.ekran==='ocak'||s.istenenKivam==='patates'&&defter.ekran!=='servis')) tercihiDinlet(kivamIstegi(s));
    else if (istek && (defter.ekran === 'servis'||sosMu(istek))) ozelSoyle(istek);
    else soyle(`${tarif().ad}. ${tarif().malzemeler.map(i => isim[i]).join(', ')}.`);
  });
  return b;
}
function sesDegistir() {
  defter.sessiz = !defter.sessiz;
  if (defter.sessiz) {
    tezgahiSustur();sus();muzik.durdur();
    const kanal=efektCikisi();
    if(kanal){
      const simdi=kanal.context.currentTime;
      kanal.gain.cancelScheduledValues(simdi);
      kanal.gain.setTargetAtTime(0,simdi,.006);
    }
  }
  else {
    sesiUyandir();
    seviyeleriUygula();
    if (!acilanAtolye && !kok.querySelector('.firin-oyunu')) {
      if(defter.ekran!=='siparis'&&Object.values(sebzeReplik).includes(sonCumle))tercihiDinlet(sonCumle,defter.secili);
      else soyle(sonCumle || yonlendir());
    }
  }
  kaydet(defter);
  ustCiz();
}
function ustCiz() {
  const geriDugmesi = eylem(defter.ekran === 'siparis' ? 'Oyun menüsüne dön' : 'Geri', 'geri', geri);
  const sesDugmesi = eylem(defter.sessiz ? 'Sesi aç' : 'Sesi kapat', defter.sessiz ? 'sessiz' : 'hoparlor', sesDegistir, 'ses-dugmesi');
  sesDugmesi.setAttribute('aria-pressed', String(!defter.sessiz));
  ust.replaceChildren(geriDugmesi);
  if(t.oynanan===defter.secili&&defter.ekran!=='siparis'&&defter.ekran!=='mutfak'&&!sip().servisEdildi){
    const tepsi=eylem('Hazırlığı sakla ve tepsiye dön','servis',()=>{
      const durak=defter.ekran;
      if(durak==='dolap'||durak==='tahta'||durak==='servis'||durak===tarif().istasyon){
        defter.siparisler[defter.secili]={...sip(),bekleyenIstasyon:durak};
      }
      git('siparis',false);
    },'istasyondan-tepsiye');
    ust.append(tepsi);
  }
  if (defter.ekran !== 'siparis') ust.append(fis());
  else{
    const vitrin=dugme('Tatlı atölyesini aç, '+t.jeton+' jeton','musteri-giris tatli-giris',tatliResmi('minik-kek'),jetonSimge(),h('span',{},String(t.jeton)));
    tikla(vitrin,pastaneAc);
    ust.append(h('div.restoran-girisleri',{},vitrin));
  }
  ust.append(sesDugmesi);
}

const siparisKapaklari=import.meta.glob<string>('../../assets/sef/ikon-atolyesi/tarif/*.webp',{eager:true,query:'?url&no-inline',import:'default'});
function siparisKapagi(id:Yemek|TarifTezgahi){
  return h('img.yemek-fotografi',{alt:'',src:siparisKapaklari['../../assets/sef/ikon-atolyesi/tarif/'+id+'.webp'],draggable:false});
}
function tarifTezgahiniAc(tarif:TarifTezgahi,id:string){
  sus();
  const masa=t.masalar[id];if(!masa||masa.sunuldu)t.masalar[id]=bosMasa();
  t.ekran='masa';t.secili=id;t.oynanan=tarif;t.restoranda=false;kaydet(defter);ciz();
  // Raftan açılan tezgâh sessiz başlıyordu: müşteri siparişini kendi kaydıyla bir kez söyler (birinci raftaki kartlar gibi).
  // Tavuk tavası açılışta kendi yönergesini söylüyor; sipariş onu kesmesin.
  const menu=menuBul(id);
  if(menu&&tarif!=='tavuk'&&!defter.sessiz)void restoranSiparisiniSoyle(menu.misafir,id);
}
function siparisler() {
  const fon=h('div.tarif-dukkan-fonu',{'aria-hidden':'true'},
    h('div.tarif-tentesi',{},...Array.from({length:14},()=>h('i'))),
    h('div.tarif-bankosu'));
  sahne.append(fon);
  const menu=aktifMenu(t),masa=t.masalar[menu.id];
  const siparisSuruyor=t.restoran?.evre==='mutfak'&&!masa?.sunuldu&&!t.gun.kapandi;
  const hazir=menu.parcalar.filter(p=>masa?.tabaklar[p]).length;
  const kapi=dugme(siparisSuruyor?'Yarım kalan sipariş tepsisine dön, '+hazir+' tabak hazır':'Restoranı aç','sef-restoran-kapisi',
    kapidanSalon(menu.misafir),
    h('span.kapi-gun',{},ikon('ebeveyn'),String(t.gun.no)),
    h('span.kapi-tabela',{},siparisSuruyor?'Devam':'Restoran',ikon(siparisSuruyor?'oyna':'ileri')));
  if(siparisSuruyor){
    const fis=h('span.kapi-yarim-fis',{'aria-hidden':'true'});
    for(const p of menu.parcalar){
      const yer=h('i',{},ikon(masa?.tabaklar[p]?'onay':'servis'));
      yer.dataset.hazir=String(!!masa?.tabaklar[p]);fis.append(yer);
    }
    kapi.append(fis);
  }
  tikla(kapi,()=>{restoranKapisi(t,yeniMasaTezgahi);kaydet(defter);sus();ciz();});
  const kartlar = h('div.siparisler');
  if(tarifRafi===0){
    for (const id of ['corba', 'salata'] as const) {
      const masa=t.oynanan===id?t.secili:'';
      const ilerleme = tezgahSiparisi(defter,id,masa);
      const suruyor = !!ilerleme && !ilerleme.servisEdildi;
      const b = dugme(TARIFLER[id].ad + ' siparişi', 'siparis-karti ' + id,
        h('i.mandal'), h('span.kart-misafir', {}, misafirResmi(id, 'istek')), siparisKapagi(id), h('span.kart-ad', {}, TARIFLER[id].ad));
      b.dataset.tarif = id;
      if (suruyor) {
        b.append(h('span.kart-devam', { 'aria-label': 'Devam eden sipariş' }, ikon('oyna')));
      } else if (defter.tabaklar[id]) {
        b.append(h('span.kart-yildiz', { 'aria-label': 'Hazırlandı' }, ikon('onay')));
      }
      tikla(b, () => {
        defter.secili = id;
        tezgahSec(defter,id,masa);
        if (!ilerleme || ilerleme.servisEdildi) {
          delete defter.susler[id];
          const onceki=t.oynanan===id?t.masalar[t.secili]?.tabaklar[id]:undefined;
          if(id==='corba'&&onceki&&onceki!==true&&onceki.tarifId==='corba'&&onceki.corba&&corbaBitisiMi(onceki.istenenSus)&&onceki.sus.id!==onceki.istenenSus&&tabakTadimi(onceki.corba,true)===3){
            defter.ozelIstekler.corba=onceki.istenenSus;defter.porsiyonlar.corba={adet:2,yuklu:false};
            defter.susler.corba=onceki.sus;durumYaz({...onceki.corba,servisEdildi:false});
            git('servis',false);ozelSoyle(onceki.istenenSus);return;
          }
          defter.ozelIstekler[id] = (onceki&&onceki!==true&&onceki.tarifId===id?onceki.istenenSus:undefined)??yeniOzelIstek(id, defter.tabaklar[id]);
          defter.porsiyonlar[id] = { adet: 0, yuklu: false };
          if (id === 'corba') defter.pismeAni = 0;
          const tekrarKivam=onceki&&onceki!==true&&onceki.tarifId==='corba'?onceki.corba?.istenenKivam:undefined;
          const kivam=tekrarKivam??(['taneli','puruzsuz','patates'] as const)[(defter.tabaklar.corba+(t.oynanan==='corba'?1:0))%3];
          if(id==='corba'&&!(onceki&&onceki!==true&&onceki.tarifId===id&&onceki.istenenSus)){
            defter.ozelIstekler.corba=kivam==='puruzsuz'?'sade':kivam==='taneli'?'kruton':'nane';
          }
          const istek=siparisBaslat(id,kivam);
          const salatalikBoyu=id==='salata'?(onceki&&onceki!==true&&onceki.tarifId==='salata'?onceki.salata?.salatalikBoyu:([undefined,6,2] as const)[defter.tabaklar.salata%3]):undefined;
          durumYaz(salatalikBoyu?{...istek,salatalikBoyu}:istek);
        }
        ses(efekt.tink);
        const bekleyen=suruyor&&t.oynanan===id?ilerleme?.bekleyenIstasyon:undefined;
        if(bekleyen)defter.siparisler[id]={...sip(),bekleyenIstasyon:undefined};
        git(bekleyen??'mutfak', suruyor);
        if (!suruyor) {
          const istek = defter.ozelIstekler[id];
          const s=sip();
          if(s.salatalikBoyu)tercihiDinlet(dilimIstegi(s.salatalikBoyu),'salata');
          else if(s.istenenKivam==='patates')tercihiDinlet(kivamIstegi(s));
          else if (istek) ozelSoyle(istek);
          else misafirSoyle(id, 'istek');
        }
      });
      kartlar.append(b);
    }
    const pizza = pizzaDurumu();
    const pizzaKart = dugme('Mini Pizza siparişi', 'siparis-karti pizza',
      h('i.mandal'), h('span.kart-misafir', {}, h('img', { alt: 'Dede Hasan', src: new URL('../../assets/sef/misafir/dede-istek.webp', import.meta.url).href })),
      siparisKapagi('pizza'), h('span.kart-ad', {}, 'Mini Pizza'));
    pizzaKart.dataset.tarif = 'pizza';
    if (pizza.suruyor) pizzaKart.append(h('span.kart-devam', { 'aria-label': 'Devam eden sipariş' }, ikon('oyna')));
    else if (pizza.servis) pizzaKart.append(h('span.kart-yildiz', { 'aria-label': 'Hazırlandı' }, ikon('onay')));
    tikla(pizzaKart, firiniAc);
    kartlar.append(pizzaKart);
    for (const id of yeniTarifler) {
      const b = dugme(adlar[id] + ' siparişi','siparis-karti '+id,
        h('i.mandal'),siparisKapagi(id),h('span.kart-ad',{},adlar[id]));
      b.dataset.tarif=id;
      const durum = atolyeOzet(id);
      if(durum.suruyor) b.append(h('span.kart-devam',{'aria-label':'Devam eden sipariş'},ikon('oyna')));
      else if(durum.servis) b.append(h('span.kart-yildiz',{'aria-label':'Hazırlandı'},ikon('onay')));
      tikla(b,()=>void atolyeyiAc(id));
      kartlar.append(b);
    }
  }
  if(tarifRafi===1){
    kartlar.dataset.raf='2';
    for(const tarif of Object.keys(tezgahlar) as TarifTezgahi[]){
      const tezgah=tezgahlar[tarif];
      const kart=dugme(tezgah.ad+' tezgâhını aç','siparis-karti',
        h('span.raf-gorseli',{},siparisKapagi(tarif)),h('span.kart-ad',{},tezgah.ad));
      kart.dataset.tezgah=tarif;
      tikla(kart,()=>tarifTezgahiniAc(tarif,tezgah.menu));kartlar.append(kart);
    }
  }
  const rafGez=dugme(tarifRafi?'Önceki tarif rafı':'Sonraki tarif rafı','tarif-raf-oku',
    h('span.raf-noktalari',{'aria-hidden':true},h('i'),h('i')),ikon(tarifRafi?'geri':'ileri'));
  rafGez.dataset.raf=String(tarifRafi+1);
  tikla(rafGez,()=>{tarifRafi=1-tarifRafi;ciz();sahne.querySelector<HTMLButtonElement>('.tarif-raf-oku')?.focus({preventScroll:true});});
  sahne.append(rafGez);
  sahne.append(kapi,kartlar);
}
function yemekResmi(id:Yemek) {
  if(yeniTarifMi(id)) return kapak(id);
  return id==='pizza'?pizzaResmi('pizza'):kaynak('nesneler',id);
}

function tezgahta(p:Yemek, masa:string):boolean {
  if (p === 'pizza') return pizzaDurumu(masa).suruyor;
  if (yeniTarifMi(p)) return atolyeOzet(p,masa).suruyor;
  const siparis = tezgahSiparisi(defter,p,masa);
  return !!siparis && !siparis.servisEdildi;
}

function yeniMasaTezgahi(masa:string) {
  const menu=menuBul(masa);
  if(!menu)return;
  for(const id of menu.parcalar){
    if(id==='corba'||id==='salata')sebzeTaslaginiSil(defter,id,masa);
    else if(id==='pizza')pizzaTaslaginiSil(masa);
    else if(yeniTarifMi(id)){
      const ozet=atolyeOzet(id,masa);
      if(ozet.suruyor){
        atolyeTaslaginiSil(id,masa);
        atolyeOzetiniYaz(id,masa,{suruyor:false,servis:ozet.servis});
      }
    }
  }
}
type AtolyeDurumu = {suruyor:boolean;servis:number};
type AtolyeModulu = Record<string, ((kok:HTMLElement,ayar:AtolyeAyar)=>void) | ((masa?:string)=>AtolyeDurumu) | ((masa?:string)=>boolean)>;
const atolyeDosyalari=import.meta.glob<AtolyeModulu>('./{makarna,krep,mucver,sis}.ts');
const ozetAnahtari=(id:YeniTarif,masa='')=>masaAnahtari('minkino-sef-ozet-'+id,masa);
const oturumOzetleri = new Map<string, AtolyeDurumu>();
const aktifAnahtar='minkino-sef-acik-atolye';
function atolyeOzet(id:YeniTarif,masa=''):AtolyeDurumu {
  const key=ozetAnahtari(id,masa);
  try {
    const ozet=JSON.parse(localStorage.getItem(key)??'null');
    if(ozet&&typeof ozet.suruyor==='boolean')return ozet;
  } catch { /* Oturum belleğinde de özet tutulur. */ }
  return oturumOzetleri.get(key)??{suruyor:false,servis:0};
}
function aktifKaydi(id?:YeniTarif,masa=''){
  try {
    if(id)localStorage.setItem(aktifAnahtar,masa ? id+'/'+masa : id);
    else localStorage.removeItem(aktifAnahtar);
  } catch { /* Kayıt olmadan bu oturum ilerler. */ }
}
function atolyeOzetiniYaz(id:YeniTarif,masa:string,ozet:AtolyeDurumu){
  const key=ozetAnahtari(id,masa);
  oturumOzetleri.set(key,ozet);
  try{localStorage.setItem(key,JSON.stringify(ozet));}catch{/* Oturum bellekte. */}
}
async function atolyeyiAc(id:YeniTarif,geriYukle=false) {
  if(acilanAtolye)return;
  acilanAtolye=id;
  const masa = t.oynanan===id ? t.secili : '';
  sus();
  const yukleniyor=h('div.atolye-yukleniyor',{'aria-label':'Mutfak açılıyor'},h('img',{src:kapak(id),alt:''}));
  mutfak.append(yukleniyor);
  try {
    const m=await atolyeDosyalari['./'+id+'.ts']();
    const ac=m[id+'Ac'] as (kok:HTMLElement,ayar:AtolyeAyar)=>void;
    const durum=m[id+'Durumu'] as (masa:string)=>AtolyeDurumu;
    const devam=m[id+'DevamEdiyor'] as (masa:string)=>boolean;
    if(geriYukle && !devam(masa)){aktifKaydi();acilanAtolye=undefined;if(masa)git('siparis',false);return;}
    aktifKaydi(id,masa);
    const ozetYaz=()=>atolyeOzetiniYaz(id,masa,durum(masa));
    const oncekiTabak=t.oynanan===id&&t.secili?t.masalar[t.secili]?.tabaklar[id]:undefined;
    const onceki=oncekiTabak&&oncekiTabak!==true&&fotografMi(oncekiTabak)?oncekiTabak:undefined;
    ac(kok,{
      masa,oncekiServis:atolyeOzet(id,masa).servis,
      tekrarMakarnaSosu:onceki?.makarna?.istenenSos,tekrarTercihi:onceki?.tercih,
      cikis:()=>{ozetYaz();aktifKaydi();acilanAtolye=undefined;git('siparis',false);},
      sesli:()=>!defter.sessiz,sesDegistir,soyle,
      teslim:(resim,puan,istekPuani,pisirmePuani,makarna,tercih)=>{
        defter.gecmis=[...defter.gecmis,{tarifId:id,resim:fotografGecerli(id,resim)?resim:id+'/'+id,puan,istekPuani,pisirmePuani,...(tercih?.tarifId===id?{tercih}:{}),...(id==='makarna'&&makarna?{makarna}:{})}].slice(-8);
        tepsiKaydet(defter.gecmis[defter.gecmis.length-1]);kaydet(defter);ozetYaz();
      },
    });
    ozetYaz();
  }catch(hata){
    acilanAtolye=undefined;aktifKaydi();
    console.error('Mutfak açılamadı',id,hata);
    soyle('Siparişi tekrar seç.');
  }finally{yukleniyor.remove();}
}
function firiniAc() {
  sus();
  const tepsiId=t.oynanan==='pizza'?t.secili:undefined;
  const onceki=tepsiId?t.masalar[tepsiId]?.tabaklar.pizza:undefined;
  const misafir=tepsiId?menuBul(tepsiId)?.misafir:undefined;
  pizzaAc(kok, {
    tepsiId,tekrarFisi:onceki&&onceki!==true&&onceki.tarifId==='pizza'?onceki.fis:tepsiId?menuBul(tepsiId)?.pizzaFisi:undefined,
    misafir:misafir==='corba'||misafir==='salata'||misafir==='pizza'||misafir==='baba'?misafir:undefined,
    cikis: () => git('siparis'), sesli: () => !defter.sessiz, sesDegistir, soyle,
    teslim: pizza => {
      if (defter.gecmis.some(v => v.tarifId === 'pizza' && v.no === pizza.no)) return;
      tepsiKaydet(pizza);
      defter.gecmis = [...defter.gecmis, pizza].slice(-8);
      kaydet(defter);
    },
  });
}
function istasyonlar() {
  const onerilen = sonraki();
  const duraklar: Array<'dolap'|'tahta'|'ocak'|'kase'|'servis'> = ['dolap', 'tahta', 'ocak', 'kase'];
  if (onerilen === 'servis') duraklar.push('servis');
  const nav = h('nav.istasyonlar', { 'aria-label': 'Mutfak istasyonları' });
  for (const ist of duraklar) {
    const b = dugme(istasyonAdlari[ist], 'istasyon', h('span.istasyon-rozeti', {}, ikon(ist)));
    tikla(b, () => { ses(efekt.secim); git(ist); });
    b.dataset.istasyon = ist;
    b.dataset.oneri = String(onerilen === ist);
    if (onerilen === ist) b.querySelector('.istasyon-rozeti')!.append(h('span.istasyon-belirt', {}, ikon('ileri')));
    nav.append(b);
  }
  sahne.append(nav);
}
function sepet() {
  const b = h('div.sepet.gorselli', { 'aria-label': 'Sebze sepeti' });
  const ic = h('div.sepet-ic');
  for (const id of sip().alinan) {
    const el=dugme(isim[id]+' rafa geri koy','sepette-sebze',resim(id));
    el.disabled=sip().kesimler[id]>0;
    tikla(el,()=>{
      const yeni=rafaKoy(sip(),id);
      if(yeni===sip())return;
      durumYaz(yeni);ses(efekt.secim);ciz();
    });
    ic.append(el);
  }
  b.append(resim('sepet', 'sepet-gorseli'), ic, resim('sepet', 'sepet-gorseli sepet-on-parca'));
  return b;
}
let bostanAcik=false,bostanSirasi=0;
function dolap() {
  if(bostanAcik){
    sahne.append(bostan(sip(),bostanSirasi,no=>{bostanSirasi=no;ciz();},id=>{
      const once=sip(),sonra=malzemeAl(once,id);
      if(once===sonra)return;
      durumYaz({...sonra,bahceden:[...new Set([...(once.bahceden??[]),id])]});ciz();
    },()=>{bostanAcik=false;ciz();},()=>git('tahta'),()=>!defter.sessiz,id=>{
      const s=sip();if(s.sulanan?.includes(id)||!s.bahceden?.includes(id))return;
      durumYaz({...s,sulanan:[...(s.sulanan??[]),id]});ses(plopSesi);ciz();
    }));
    return;
  }
  sahne.append(bahceGirisi(()=>{bostanSirasi=0;bostanAcik=true;ciz();}));
  const hedef = sepet();
  sahne.append(hedef);
  const raf = h('div.raflar', { 'aria-label': 'Sebze rafları' });
  for (const id of SEBZELER) {
    const alindi = sip().alinan.includes(id);
    if (alindi) continue;
    const b = dugme(isim[id] + ' al', 'sebze', resim(id));
    b.dataset.sebze = id;
    const yerVar=sip().alinan.length<3;
    malzemeTasi(b, hedef, () => {
      const s = malzemeAl(sip(), id);
      if (s === sip()) return;
      durumYaz(s);
      ses(plopSesi);
      soyle(s.alinan.length === 3 ? 'Sebzeler hazır!' : isim[id] + '!');
      ciz();
    }, () => {
      if(!yerVar){
        ses(efekt.kilitNazik);
        soyle('Sepet dolu. Değiştirmek istediğin sebzeye sepette dokun.');
      }
    }, yerVar);
    raf.append(b);
  }
  sahne.append(raf);
  if (sip().alinan.length > 0) ilerle('tahta');
}
function malzemeDiz(
  ids: readonly MalzemeId[], hazir: (id: MalzemeId) => boolean,
  sec: (id: MalzemeId, el: HTMLButtonElement) => void, secili?: MalzemeId,
) {
  const raf = h('div.tezgah-dizisi');
  for (const id of ids) {
    const s = sip();
    const gorsel = hazir(id) ? kesikResmi(id,parcalariKur(id,s.kesimler[id],s.kesitler[id])) : resim(id);
    const b = dugme(isim[id] + ' seç', 'tabak-malzeme', gorsel);
    b.dataset.malzeme = id;
    b.setAttribute('aria-pressed', String(id === secili));
    if(s.tarifId==='salata'&&s.yikama?.[id]===7)b.dataset.temiz='true';
    if (hazir(id)) b.append(h('i.kucuk-onay', {}, ikon('onay')));
    tikla(b, () => sec(id, b));
    raf.append(b);
  }
  sahne.append(raf);
  return raf;
}
function tahta() {
  const s = sip();
  const hazir = (id: MalzemeId) => dograndi(sip(),id);
  const kalan = s.alinan.filter(id => !hazir(id));
  if (!seciliSebze || !kalan.includes(seciliSebze)) seciliSebze = kalan[0];
  const id = seciliSebze;
  malzemeDiz(s.alinan, hazir, secilen => {
    if (bekliyor || s.tahtadaki || hazir(secilen)) return;
    seciliSebze = secilen;
    ciz();
  }, s.tahtadaki ?? id);
  const tabak = hazirlikTabagi(s);
  sahne.append(tabak);
  const tahtada=s.tahtadaki??id;
  if(tahtada&&s.kesimler[tahtada]>0){
    const geriAl=dugme('Son kesimi geri al','kesim-geri-al',ikon('tekrar'));
    tikla(geriAl,()=>{
      if(bekliyor)return;
      seciliSebze=tahtada;durumYaz(sonKesimiGeriAl(sip(),tahtada));ses(efekt.secim);ciz();
    });
    sahne.append(geriAl);
  }
  if (s.tahtadaki) {
    sahne.append(tahtayiTopla(s,s.tahtadaki,tabak,() => {
      durumYaz({...sip(),tahtadaki: undefined});
      ses(plopSesi);
      ciz();
    }));
    return;
  }
  if (!id) {
    tabak.classList.add('tahta-hazir');
    ilerle();
    return;
  }
  if(s.tarifId==='salata'&&s.kesimler[id]===0){
    const yika=dugme(isim[id]+' yıka','lavaboya-git',yikamaIsareti());
    yika.dataset.temiz=String(s.yikama?.[id]===7);
    tikla(yika,()=>{
      if(bekliyor)return;
      ust.hidden=true;ust.style.display='none';
      sahne.replaceChildren(sebzeLavabosu(id,sip().yikama?.[id]??0,bits=>{
        const guncel=sip();
        if(guncel.tarifId==='salata'&&guncel.alinan.includes(id)&&guncel.kesimler[id]===0)durumYaz({...guncel,yikama:{...guncel.yikama,[id]:bits}});
      },()=>{ciz();},()=>!defter.sessiz));
    });
    sahne.append(yika);
  }
  const hedef=kesimHedefi(s,id);
  const boylar=h('div.kesim-boylari',{role:'group','aria-label':'Parçaların büyüklüğü'});
  for(const boy of KESIM_BOYLARI){
    const ad={2:'İri parçalar',4:'Lokmalık parçalar',6:'Küçük parçalar'}[boy];
    const sec=dugme(ad,'kesim-boyu');
    sec.dataset.boy=String(boy);
    sec.setAttribute('aria-pressed',String(hedef===boy));
    for(let i=0;i<boy/2;i++)sec.append(resim(id==='marul'?'marul':id+'-kesit'));
    sec.disabled=s.kesimler[id]>=boy;
    tikla(sec,()=>{
      if(bekliyor||sec.disabled||hedef===boy)return;
      durumYaz({...sip(),kesimBoylari:{...sip().kesimBoylari,[id]:boy}});
      ses(efekt.secim);ciz();
    });
    boylar.append(sec);
  }
  sahne.append(boylar);
  const b = kesimTahtasi(id, isim[id], s.kesimler[id], s.kesitler[id], k => {
    bekliyor = true;
    ses(() => kesmeSesi(id));
    durumYaz(kes(sip(), id, k));
    window.setTimeout(() => {
      if (!b.isConnected) return;
      if (hazir(id)) {
        ses(efekt.tink);
        seciliSebze = undefined;
      }
      bekliyor = false;
      ciz();
    }, zaman(hazir(id) ? 760 : 380));
  }, s.tarifId==='salata',hedef);
  sahne.append(b);
}
function kaseVeyaOcak() {
  const s = sip();
  const ocak = defter.ekran === 'ocak';
  if(ocak)sahne.style.setProperty('--corba-renk',corbaRengi(s));
  if (defter.ekran !== tarif().istasyon) { ilerle(sonraki()); return; }
  const hazir = s.alinan.filter(id => dograndi(s,id) && !s.aktarilan.includes(id));
  const alan = h('div.kap-alani', { 'aria-label': ocak ? 'Tencerenin içi' : 'Kâsenin içi' });
  let icerik = kapIci(s);
  alan.append(icerik);
  sahne.append(alan);
  const tabaklar = h('div.aktar-tabaklari');
  for (const id of hazir) {
    const b = dugme(isim[id] + (ocak ? ' tencereye koy' : ' kâseye koy'), 'aktar-tabak', kesikResmi(id, parcalariKur(id,s.kesimler[id],s.kesitler[id])));
    b.dataset.aktar = id;
    malzemeTasi(b, alan, () => {
      durumYaz(aktar(sip(), id));
      ses(plopSesi);
      ciz();
    }, () => {});
    tabaklar.append(b);
  }
  sahne.append(tabaklar);
  if (s.aktarilan.length < 3) {
    if (!hazir.length) ilerle();
    return;
  }
  if (s.karistirma >= KARISTIRMA_HEDEFI) {
    if (ocak) alan.append(buhar());
    if (pismeKalani()) {
      alan.append(h('div.kaynama', { 'aria-label': 'Çorba pişiyor' }, h('i'), h('i'), h('i'), h('i')));
      return;
    }
    const p = defter.porsiyonlar[s.tarifId];
    mutfak.dataset.porsiyonlama = 'true';
    mutfak.dataset.porsiyon = String(p.adet);
    if(ocak&&p.adet===0&&!p.yuklu){
      blenderTezgahi(sahne,alan,s,blenderSecili,secili=>{blenderSecili=secili;ciz();},
        id=>{const yeni=sebzeyiEz(sip(),id);durumYaz(yeni);blenderSecili=yeni.ezilen.length<3&&!(yeni.istenenKivam==='patates'&&kivamUyuyor(yeni));ciz();
          if(!blenderSecili){ses(efekt.tink);soyle(porsiyonIstegi());}},
        id=>ses(()=>blenderSesi(id)));
    }
    porsiyonTezgahi(sahne, alan, s, p, {
      yukle: () => {
        if (defter.porsiyonlar[s.tarifId] !== p || p.yuklu) return;
        defter.porsiyonlar[s.tarifId] = { adet: p.adet, yuklu: true };
        blenderSecili=false;
        kaydet(defter);
        ses(efekt.secim);
        ciz();
      },
      aktar: () => {
        if (defter.porsiyonlar[s.tarifId] !== p || p.adet >= 2) return;
        defter.porsiyonlar[s.tarifId] = { adet: p.adet + 1, yuklu: false };
        blenderSecili=false;
        kaydet(defter);
        ses(plopSesi);
        ciz();
        soyle(p.adet === 0 ? 'Bir porsiyon daha.' : 'Yemeğin hazır. Servis edelim.');
      },
      yonlendir: () => soyle(porsiyonIstegi()),
    });
    if (p.adet === 2) ilerle('servis');
    return;
  }
  const b = dugme(ocak ? 'Çorbayı karıştır' : 'Salatayı karıştır', 'karistirma');
  const kasik = resim('kasik', 'kasik');
  const ok = h('span.karisim-yon', {}, ikon('karistir'));
  b.append(kasik, ok);
  alan.append(b);
  const tic = h('div.derece', { 'aria-label': 'Karıştırma ilerlemesi' });
  for (let i = 0; i < KARISTIRMA_HEDEFI; i++) tic.append(h('i', { 'data-dolu': String(i < s.karistirma) }));
  alan.append(tic);
  let yon = 0, sonAci: number | null = null, buJestteTur = false;
  let kasikYolu=0,sonHareket=0,sonHisirti=0;
  const aci = (yer: Nokta) => {
    const m = merkez(alan);
    return Math.atan2((yer.y - m.y) / alan.clientHeight, (yer.x - m.x) / alan.clientWidth);
  };
  function tamamla() {
    if (!b.isConnected) return;
    const yeni = karistir(sip());
    if (yeni === sip()) return;
    const bitti = yeni.karistirma === KARISTIRMA_HEDEFI;
    if (bitti && ocak) defter.pismeAni = Date.now() + zaman(2200);
    durumYaz(yeni);
    if(!ocak||performance.now()-sonHisirti>180)ses(() => karistirmaSesi(ocak));
    alan.classList.add('karisiyor');
    const oncekiIcerik = icerik;
    icerik = kapIci(yeni);
    oncekiIcerik.replaceWith(icerik);
    tic.querySelectorAll('i').forEach((nokta,i) => nokta.dataset.dolu = String(i < yeni.karistirma));
    void hareket(icerik, [{ transform: 'rotate(-8deg) scale(.96)' }, { transform: 'rotate(12deg) scale(1.04)' }, { transform: 'rotate(0deg) scale(1)' }], 300);
    if (sonAci === null) {
      void hareket(kasik, [{ translate: '0 0', rotate: '0deg' }, { translate: '-33% -3%', rotate: '-18deg' },
        { translate: '-11% 15%', rotate: '12deg' }, { translate: '0 0', rotate: '0deg' }], 360);
    }
    if (bitti) {
      if (!ocak) { ses(efekt.tink); soyle(porsiyonIstegi()); }
      ciz();
    }
  }
  function dur() {
    kasik.style.translate = '';
    kasik.style.rotate = '';
    icerik.style.rotate = '';
    sonAci = null;
  }
  jest(b, {
    basla: yer => { buJestteTur = false; yon = 0;kasikYolu=0;sonHareket=performance.now();sonAci = aci(yer); },
    tasi: yer => {
      const m = merkez(alan);
      if (Math.hypot(yer.x - m.x, yer.y - m.y) < 8) { sonAci = null; return; }
      const simdi = aci(yer);
      if (sonAci !== null) {
        const delta = Math.atan2(Math.sin(simdi - sonAci), Math.cos(simdi - sonAci));
        yon += delta;
        if(ocak){
          const an=performance.now();kasikYolu+=Math.abs(delta);
          if(kasikYolu>.65&&an-sonHisirti>125){
            const hiz=kasikYolu*135/Math.max(1,an-sonHareket);
            ses(()=>karistirmaSesi(true,hiz,true));
            sonHisirti=an;sonHareket=an;kasikYolu=0;
          }
        }
      }
      sonAci = simdi;
      kasik.style.translate = `${Math.cos(simdi) * 35}% ${Math.sin(simdi) * 15}%`;
      kasik.style.rotate = `${Math.sin(simdi) * 22}deg`;
      icerik.style.rotate = `${Math.sin(simdi) * 12}deg`;
      if (Math.abs(yon) >= Math.PI * 1.5) { yon = 0; buJestteTur = true; tamamla(); }
    },
    birak: (_yer, _ilk, tik) => {
      dur();
      if (tik || (!buJestteTur && Math.abs(yon) > Math.PI * .5)) tamamla();
    },
    iptal: dur, klavye: tamamla,
  });
}
function buhar() {
  return h('div.buhar', { 'aria-hidden': 'true' }, h('i'), h('i'), h('i'));
}
function hazirTabak(id: TarifId, sus?: Susleme, siparis?:Siparis) {
  const tabak = h('span.yemek-cizimi', {}, siparis?(id==='salata'?salataKasesi(siparis,2):corbaKasesi(siparis,2)):resim(id));
  tabak.dataset.tabak = id;
  if(sus && sosMu(sus.id)){
    const yuzey=tabak.querySelector('.salata-kucuk-ic')??tabak;
    for(const iz of sus.oncekiIzler??[])yuzey.append(sosKatmani(sus.id,sus.x,sus.y,iz));
    yuzey.append(sosKatmani(sus.id,sus.x,sus.y,sus.iz));
  }else if (sus && sus.id!=='sade'&&!sosMu(sus.id)) {
    const parca=sonDokunusResmi(sus.id,'yemek-susu');parca.dataset.bitis=sus.id;
    parca.style.left = (20 + sus.x * 60) + '%';
    parca.style.top = (18 + sus.y * 31) + '%';
    tabak.append(parca);
  }
  return tabak;
}
function servisGorseli(servis:ServisKaydi){
  const ad = adlar[servis.tarifId];
    let cizim:HTMLElement;
    if(fotografMi(servis)){
      const img=h('img.defter-fotograf',{alt:ad,src:kapak(servis.tarifId)});
      cizim=img;
      void fotografAc(servis).then(url=>{img.src=url;});
    }else cizim=servis.tarifId==='pizza'?pizzaTabakResmi(servis.ust,servis.kivam,servis.sosCesidi,servis.kesim):hazirTabak(servis.tarifId,servis.sus,servis[servis.tarifId]);
    return cizim;
}
function servis() {
  const s = sip();
  const ozel = defter.ozelIstekler[s.tarifId];
  const istekUymadi=!!ozel && defter.susler[s.tarifId]?.id!==ozel;
  const istekPuani=tabakTadimi(s,!istekUymadi);
  const masadaki=t.oynanan===s.tarifId?menuBul(t.secili)?.misafir:undefined;
  const misafir=h('div.servis-misafiri', {}, misafirResmi(masadaki??s.tarifId, s.servisEdildi?(istekPuani<3?'tadim':'tesekkur'):'istek'));
  sahne.append(misafir);
  const balon = ozel && !s.servisEdildi ? dugme('Özel isteği dinle', 'ozel-istek', sonDokunusResmi(ozel)) : undefined;
  if (ozel && balon) {
    balon.dataset.istek = ozel; tikla(balon, () => ozelSoyle(ozel)); sahne.append(balon);
  }
  if (s.karistirma < KARISTIRMA_HEDEFI || pismeKalani() || defter.porsiyonlar[s.tarifId].adet < 2) { ilerle(); return; }
  const sus = defter.susler[s.tarifId];
  const tabak = hazirTabak(s.tarifId, sus,s);
  const hedef = dugme(s.tarifId==='salata'?'Sosu salataya dök':'Süsü tabağa yerleştir', 'sunum', tabak);
  hedef.dataset.sun = s.tarifId;
  if (s.tarifId === 'corba') hedef.append(buhar());
  sahne.append(hedef);
  if (s.servisEdildi) {
    hedef.disabled = true;
    misafir.append(yildizlar(istekPuani));
    if(citirSalata(s))misafir.append(h('span.lavabo-taze',{'aria-label':'Taptaze salata'},yikamaIsareti(),ikon('onay')));
    const fark=sebzeFarki(s);
    if(fark.eksik.length || !kivamUyuyor(s) || !dilimUyuyor(s) || istekUymadi){
      const kart=h('div.sebze-tadim',{'aria-label':'Müşterinin istediği ve hazırlanan tabak'});
      const istenen=h('span',{'aria-label':'İstenen'},ikon('sepet'),...fark.eksik.map(id=>resim(id)));
      const sunulan=h('span',{'aria-label':'Sunulan'},ikon('servis'),...fark.fazla.map(id=>resim(id)));
      if(s.salatalikBoyu&&!dilimUyuyor(s)){istenen.append(salatalikOrnegi(s.salatalikBoyu));sunulan.append(salatalikOrnegi(kesimHedefi(s,'salatalik')));}
      if(s.istenenKivam&&!kivamUyuyor(s)){
        istenen.append(h('i.tadim-kasesi',{},corbaKivamOrnegi(s.istenenKivam)));
        sunulan.append(h('i.tadim-kasesi',{},corbaKasesi(s,2)));
      }
      if(istekUymadi&&ozel){
        const istekResmi=sonDokunusResmi;
        istenen.append(h('i.tadim-son-dokunus',{'data-sus':ozel},istekResmi(ozel)));
        if(sus)sunulan.append(h('i.tadim-son-dokunus',{'data-sus':sus.id},istekResmi(sus.id)));
      }
      kart.append(istenen,sunulan);
      sahne.append(kart);
    }
    ilerle('siparis');
    return;
  }
  const secenekler = susSecenekleri(s.tarifId).filter(id=>s.tarifId!=='corba'||corbaBitisiMi(id)||id===ozel||id===sus?.id);
  seciliSus ??= sus?.id ?? secenekler[0];
  let dokuluyor=false;
  let firca:SosNoktasi[]=[],onIz:SVGSVGElement|undefined;
  const sosDolu=(id:SusId)=>sus?.id===id&&(sus.oncekiIzler?.length??0)>=5;
  const yuzey=tabak.querySelector<HTMLElement>('.salata-kucuk-ic');
  function izTemizle(){firca=[];onIz?.remove();onIz=undefined;}
  function sosNoktasi(yer:Nokta):SosNoktasi{
    const r=yuzey!.getBoundingClientRect();
    let x=((yer.x-r.left)/r.width-.5)/.36,y=((yer.y-r.top)/r.height-.5)/.30;
    const oran=Math.max(1,Math.hypot(x,y));
    return {x:.5+.36*x/oran,y:.5+.30*y/oran};
  }
  function izSur(id:SusId,yer:Nokta){
    if(!sosMu(id)||!yuzey||dokuluyor||sosDolu(id)||!icinde(yuzey,yer,0))return;
    const n=sosNoktasi(yer),son=firca.at(-1);
    if(son&&Math.hypot(son.x-n.x,son.y-n.y)<.028)return;
    if(firca.length>=48)firca=firca.filter((_,i)=>i%2===0);
    firca.push(n);
    onIz?.remove();onIz=sosKatmani(id,0,0,firca);yuzey.append(onIz);
  }
  async function yerlestir(id: SusId, nokta?: Nokta) {
    if(dokuluyor||sosDolu(id))return;
    const r = tabak.getBoundingClientRect();
    let x = nokta ? ((nokta.x - r.left) / r.width - .5) / .30 : 0;
    let y = nokta ? ((nokta.y - r.top) / r.height - .335) / .155 : 0;
    // Dış kenara bırakılan parça çorbanın yüzeyi veya salata yaprakları üzerinde kalsın.
    const uzun = Math.hypot(x, y);
    if (uzun > 1) { x /= uzun; y /= uzun; }
    let iz:SosNoktasi[]|undefined,oncekiIzler:SosNoktasi[][]|undefined;
    if(sosMu(id)&&yuzey){
      if(nokta)izSur(id,nokta);
      const merkez=firca.at(-1)??{x:.5,y:.5};
      if(firca.length<2){
        iz=[{x:merkez.x-.04,y:merkez.y+.02},{x:merkez.x,y:merkez.y-.018},{x:merkez.x+.04,y:merkez.y}];
      }else iz=[...firca];
      izTemizle();
      if(sus?.id===id&&sus.iz)oncekiIzler=[...(sus.oncekiIzler??[]),sus.iz];
      else yuzey.querySelectorAll('.salata-sos-katmani').forEach(el=>el.remove());
      yuzey.append(sosKatmani(id,0,0,iz));
      dokuluyor=true;
      sahne.querySelector<HTMLButtonElement>('[data-zil]')?.setAttribute('disabled','');
      const alet=sosResmi(id,'salata-dok-aleti',true);
      const akim=h('span.salata-dok-akimi',{'data-sos':id});
      const dokum=h('span.salata-dok-noktasi',{},akim,alet);
      const yuz=yuzey.getBoundingClientRect();
      dokum.style.left=((yuz.left-r.left+yuz.width*merkez.x)/r.width*100)+'%';
      dokum.style.top=((yuz.top-r.top+yuz.height*merkez.y)/r.height*100)+'%';tabak.append(dokum);
      ses(plopSesi);
      await hareket(alet,[{rotate:'0deg',translate:'0 -12%'},{rotate:id==='limon'?'-18deg':'-38deg',offset:.4},{rotate:id==='limon'?'-16deg':'-40deg',offset:.8},{rotate:'0deg',translate:'0 -12%'}],700);
      if(!hedef.isConnected)return;
    }
    defter.susler[s.tarifId] = { id, x: (x + 1) / 2, y: (y + 1) / 2,...(iz?{iz}:{}),...(oncekiIzler?.length?{oncekiIzler}:{}) };
    kaydet(defter);
    ses(efekt.yapis);
    ciz();
    soyle(replikler.zil);
  }
  jest(hedef, {
    basla:yer=>{if(seciliSus){izTemizle();izSur(seciliSus,yer);}},
    tasi:yer=>{if(seciliSus)izSur(seciliSus,yer);},
    iptal:izTemizle,
    birak: yer => { if (seciliSus) yerlestir(seciliSus, yer); },
    klavye: () => { if (seciliSus) yerlestir(seciliSus); },
  });
  const secim = h('div.sus-tabaklari');
  for (const id of secenekler) {
    const b = dugme(corbaBitisiMi(id)?id==='sade'?'Çorbayı sade bırak':bitisAdi[id]+' ekle':sosMu(id)?sosAd[id]+' seç':isim[id] + ' ile süsle', 'sus-sec', sonDokunusResmi(id));
    b.dataset.sus = id;
    b.setAttribute('aria-pressed', String(id === seciliSus));
    let kopya: HTMLElement | undefined;
    const birak = () => { kopya?.remove(); kopya = undefined; b.classList.remove('elde'); };
    const sec = () => {
      seciliSus = id;
      if(id==='sade'){void yerlestir(id);return;}
      for (const el of secim.querySelectorAll('button')) el.setAttribute('aria-pressed', String(el === b));
      ses(efekt.secim);
      void hareket(hedef, [{ scale: '1' }, { scale: '1.04' }, { scale: '1' }], 270);
    };
    jest(b, {
      tasi: (yer, ilk) => {
        if (Math.hypot(yer.x - ilk.x, yer.y - ilk.y) < 7) return;
        if (!kopya) {
          kopya = sosMu(id)?sosResmi(id,'tasinan sus-tasinan',true):sonDokunusResmi(id, 'tasinan sus-tasinan');
          document.body.append(kopya);
          b.classList.add('elde');
        }
        izSur(id,yer);
        kopya.style.left = yer.x + 'px';
        kopya.style.top = yer.y + 'px';
      },
      birak: (yer, _ilk, tik) => {
        birak();
        if (tik) sec();
        else if (icinde(hedef, yer, 10)) { seciliSus = id; yerlestir(id, yer); }
        else izTemizle();
      }, iptal: ()=>{birak();izTemizle();}, klavye: sec,
    });
    secim.append(b);
  }
  sahne.append(secim);
  if (!sus) return;
  if(sosMu(sus.id)){
    const geriAl=dugme('Son sos izini geri al','salata-sos-geri',ikon('tekrar'));
    tikla(geriAl,()=>{
      if(dokuluyor)return;
      const onceki=[...(sus.oncekiIzler??[])],iz=onceki.pop();
      if(iz)defter.susler[s.tarifId]={id:sus.id,x:sus.x,y:sus.y,iz,...(onceki.length?{oncekiIzler:onceki}:{})};
      else delete defter.susler[s.tarifId];
      kaydet(defter);ses(efekt.secim);ciz();
    });
    secim.append(geriAl);
  }
  const zil = dugme('Servis zilini çal', 'servis-zili', h('span.zil-isaret', {}, ikon('onay')));
  zil.dataset.zil = '';
  tikla(zil, () => {
    const yeni = servisEt(sip());
    if (yeni === sip()) return;
    defter.tabaklar[yeni.tarifId]++;
    defter.gecmis = [...defter.gecmis, { tarifId: yeni.tarifId, sus, istenenSus:ozel,...(ozel && sus.id===ozel ? { ozel: true } : {}), puan:istekPuani,[yeni.tarifId]:yeni }].slice(-8);
    tepsiKaydet(defter.gecmis[defter.gecmis.length-1]);durumYaz(yeni);
    ses(efekt.tink);git('siparis',false);
  });
  sahne.append(zil);
}
function ciz() {
  masaTemizle?.();masaTemizle=undefined;
  window.clearTimeout(pismeSaati);
  const once = mutfak.dataset.ekran;
  const id = defter.ekran;
  mutfak.dataset.ekran = id;
  delete mutfak.dataset.porsiyonlama;
  delete mutfak.dataset.porsiyon;
  delete sahne.dataset.kaptanAlinan;
  mutfak.dataset.tarif = defter.secili;
  mutfak.setAttribute('aria-label', istasyonAdlari[id]);
  if (once !== id) {
    if(id==='siparis')dekor.removeAttribute('src');
    else {
      dekor.src = kaynak('sahneler', id === 'ocak' ? 'tencere' : id);
      if(once)void hareket(dekor,[{opacity:.65},{opacity:1}],230);
    }
  }
  const odak = document.activeElement instanceof HTMLButtonElement && document.activeElement.matches(':focus-visible')
    ? document.activeElement.getAttribute('aria-label') : null;
  sahne.replaceChildren();
  ustCiz();
  ust.hidden=t.ekran!=='kapali'||t.pastane.acik;
  ust.style.display=ust.hidden?'none':'';
  if(t.pastane.acik){
    const pastane=t.pastane;
    const tarif=pastane.tezgah;
    if(tarif)sahne.append(pastaneSesleri(tatliHazirla(tarif,(puan,renk,fazlaPisti,sus,tat,sekil,tart,kurabiye,kek,_temel,sutlac)=>{
      vitrineKoy(pastane,tarif,puan,renk,fazlaPisti,sus,tat,sekil,tart,kurabiye,kek,sutlac);kaydet(defter);ses(efekt.dogru);ciz();
    },geri,{taslak:pastane.taslaklar[tarif],kaydet:taslak=>{pastane.taslaklar[tarif]=taslak;kaydet(defter);},vitrin:true,sesli:()=>!defter.sessiz}),()=>!defter.sessiz));
    else{
      const stok:Partial<Record<TatliId,number>>={};
      for(const [id,tabaklar] of Object.entries(pastane.vitrin))stok[id as TatliId]=tabaklar.length;
      const dukkan=tatliDukkan(t.jeton,t.tatliSeviye,()=>{if(kilitAc(t)){kaydet(defter);ses(efekt.dogru);ciz();}},geri,id=>{
        pastane.tezgah=id;kaydet(defter);ciz();
      },stok,pastane.vitrin.kurabiye?.at(-1)?.sekil,pastane.vitrin['meyveli-tart']?.at(-1)?.tart,pastane.vitrin.kurabiye?.at(-1)?.kurabiye,pastane.vitrin['minik-kek']?.at(-1)?.kek,pastane.vitrin.dondurma?.at(-1)?.tat,pastane.vitrin['meyveli-tart']?.at(-1)?.fazlaPisti,pastane.vitrin.sutlac?.at(-1)?.sutlac);
      if(t.tatliSeviye>=0){
        dukkan.append(pulDefteriDugmesi(pastane));dekoruKoy(dukkan,t.ustalik,'rozet');
      }
      dekorRafiniEkle(dukkan,t,()=>kaydet(defter),ciz,()=>!defter.sessiz);
      sahne.append(dukkan);
    }
    return;
  }
  if(id==='siparis' && t.ekran!=='kapali'){
    masaTemizle=masayiCiz(sahne,{t,atolye:pastaneAc,tezgahta,yeniMasaTezgahi,yaz:()=>kaydet(defter),ciz,sesli:()=>!defter.sessiz,soyle,ses:sesDegistir,dogru:()=>ses(efekt.dogru),
      yemek:id=>{tarifRafi=0;ciz();sahne.querySelector<HTMLButtonElement>('[data-tarif="'+id+'"]')?.click();},resim:yemekResmi,servis:servisGorseli});
    return;
  }
  switch (id) {
    case 'siparis': siparisler(); break;
    case 'mutfak': istasyonlar(); break;
    case 'dolap': dolap(); break;
    case 'tahta': tahta(); break;
    case 'ocak':
    case 'kase': kaseVeyaOcak(); break;
    case 'servis': servis(); break;
  }
  const kalan = pismeKalani();
  if (kalan && id !== 'siparis') {
    pismeSaati = window.setTimeout(() => {
      if (id === 'ocak' && !document.hidden) {
        ses(efekt.tink);
        if(sip().istenenKivam)tercihiDinlet(kivamIstegi(sip()));else soyle(porsiyonIstegi());
      }
      ciz();
    }, kalan + 15);
  }
  if (odak) {
    const ayni = mutfak.querySelector<HTMLButtonElement>(`button[aria-label="${CSS.escape(odak)}"]`);
    (ayni ?? sahne.querySelector<HTMLButtonElement>('button'))?.focus({ preventScroll: true });
  }
  rehberiPlanla();
}
const girisUrl=new URL(location.href);
const giris=girisUrl.searchParams.get('giris');
if(giris==='restoran'||giris==='tepsiler'){
  t.pastane.acik=false;
  if(giris==='restoran')restoranKapisi(t,yeniMasaTezgahi);
  else{
    const id=girisUrl.searchParams.get('siparis');
    if(!id||!siparisFisindenAc(t,id,yeniMasaTezgahi)){
      restoranKapisi(t,yeniMasaTezgahi);
    }
    girisUrl.searchParams.delete('siparis');
  }
  kaydet(defter);
  girisUrl.searchParams.delete('giris');history.replaceState(history.state,'',girisUrl);
}
ciz();
if (!t.pastane.acik&&t.ekran==='kapali' && (!t.oynanan||t.oynanan==='pizza') && pizzaDevamEdiyor(t.oynanan==='pizza'?t.secili:undefined)) firiniAc();
else {
  try {
    const [aktif,masa] = (localStorage.getItem(aktifAnahtar)??'').split('/');
    if(!t.pastane.acik&&t.ekran==='kapali'&&yeniTarifMi(aktif)&&(!t.oynanan||t.oynanan===aktif)){
      const beklenenMasa=t.oynanan===aktif?t.secili:'';
      if(masa===undefined)eskiAcikMasayiTasi(aktif,beklenenMasa);
      if(masa===undefined||masa===beklenenMasa)void atolyeyiAc(aktif,true);
    }
  } catch { /* Yerel kayıt devre dışı. */ }
}
