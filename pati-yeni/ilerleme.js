import {dolapta} from './dolap.js';
import {donanimUygun, pantry, urunler} from './urunler.js';
import {cesitler} from './cesitler.js';

const KAYIT = 'pati-yeni-ilerleme-v1';
const BASLANGIC_JETONU = 7;
const puanlar = {oksama: 4, mama: 10, oyun: 10, su: 5, firca: 5, uyku: 5, temizlik: 5, frizbi: 10, sampuan: 10};

const fircalanabilen = ['kopek', 'kedi', 'tavsan', 'hamster'];

function uygunBakim(id, eylem) {
  const model=cesitler[id];
  if (!model) return false;
  if (!Object.hasOwn(puanlar, eylem)) return false;
  if (eylem === 'su' || eylem === 'temizlik') return model.ortam !== 'golet';
  if (eylem === 'firca' || eylem === 'sampuan') return fircalanabilen.includes(model.tur);
  if (eylem === 'frizbi') return model.tur === 'kopek';
  return true;
}

function bugun() {
  const tarih = new Date();
  return [tarih.getFullYear(), tarih.getMonth() + 1, tarih.getDate()].join('-');
}

function sayi(deger, yedek = 0) {
  return Number.isSafeInteger(deger) && deger >= 0 ? deger : yedek;
}

function hayvanKaydi(id, eski = {}, gun = 1) {
  const etkin = eski.gun === gun || eski.gun === bugun();
  const temiz = liste => Array.isArray(liste) ? [...new Set(liste.filter(e => uygunBakim(id,e)))] : [];
  const bakimlar = etkin ? temiz(eski.bakimlar) : [];
  const ortam=cesitler[id].ortam;
  const satinAlinan=(liste,tip)=>Array.isArray(liste)
    ? [...new Set(liste.filter(k=>Object.hasOwn(urunler,k) && urunler[k].tip===tip && donanimUygun(k,ortam)))] : [];
  const kiyafetler=satinAlinan(eski.kiyafetler,'kiyafet').filter(key=>dolapta(cesitler[id],key,eski.kiyafetler));
  const dekorlar=satinAlinan(eski.dekorlar,'dekor');
  const yataklar=satinAlinan(eski.yataklar ?? (eski.yuva ? ['yuva'] : []),'yuva');
  const secili=eski.yatak ?? (eski.yuva ? 'yuva' : '');
  return {
    dekorlar,dekor:dekorlar.includes(eski.dekor)?eski.dekor:'',dekorX:Math.max(12,Math.min(88,sayi(eski.dekorX,76))),
    kiyafetler,kiyafet:kiyafetler.includes(eski.kiyafet)?eski.kiyafet:'',
    yataklar,yatak:yataklar.includes(secili)?secili:'',
    hastaGun: Math.min(gun,sayi(eski.hastaGun)),
    acGun: sayi(eski.acGun), susuzGun: sayi(eski.susuzGun), kirGun: cesitler[id].ortam==='golet'?0:sayi(eski.kirGun),
    kurdele: eski?.kurdele === true,
    saniye: sayi(eski?.saniye),
    gun,
    bakimlar,
    ogrenilen: temiz(eski.ogrenilen ?? eski.bakimlar),
    sonZaman: sayi(eski?.sonZaman)
  };
}

const sabahBaslangici=Date.now();
export function gunIsigi(kayit,simdi=Date.now()){
 const saniye=(simdi-kayit.sabah)/1000;
 if(saniye>=180)return 'gece';
 if(saniye>=130)return 'aksam';
 return 'gunduz';
}

export function aksamOl(gun){
 return degistir(kayit=>{
  if(kayit.gun!==gun)return {ok:false};
  kayit.sabah=Math.min(kayit.sabah,Date.now()-180000);
  return {ok:true};
 });
}

function ilkKayit() {
  return {sabah:sabahBaslangici,gun:1, para: BASLANGIC_JETONU, hayvanlar: {kopek: hayvanKaydi('kopek')}, canta: {}, defter: {}};
}

// Defter hayvan envanterinden bağımsızdır: satış ve aynı gün geri alış,
// puanı silmez ve tamamlanmış bir eyleme ikinci ödül açmaz.
function defteriOku(kaynak, hayvanlar) {
  const defter = {};
  if (kaynak.defter && typeof kaynak.defter === 'object') {
    for (const [id, satir] of Object.entries(kaynak.defter)) {
      if (!Object.hasOwn(cesitler,id) || !satir || typeof satir !== 'object') continue;
      const kayit = {};
      for (const [eylem, puan] of Object.entries(satir)) {
        const gecerliBakim = uygunBakim(id, eylem) && Number.isInteger(puan) && puan >= 0 && puan <= puanlar[eylem];
        if (gecerliBakim || (eylem === 'yanlis' && puan === -5)) {
          kayit[eylem] = puan;
        }
      }
      if (Object.keys(kayit).length) defter[id] = kayit;
    }
  } else {
    // Önceki sürüm o oyun gününde hangi bakımların yapıldığını saklıyordu.
    for (const [id, pet] of Object.entries(hayvanlar)) {
      if (pet.bakimlar.length) defter[id] = Object.fromEntries(pet.bakimlar.map(eylem => [eylem, eylem === 'mama' ? 5 : puanlar[eylem]]));
    }
  }
  return defter;
}

let oturumKaydi;
let geciciDepo = false;

function oku() {
  let kaynak = oturumKaydi;
  if (!geciciDepo) {
    try {
      const ham = globalThis.localStorage?.getItem(KAYIT);
      kaynak = ham ? JSON.parse(ham) : undefined;
    } catch { /* Bellekteki son tam kayıt kullanılabilir. */ }
  }
  if (!kaynak?.hayvanlar) return ilkKayit();
  const gun = Math.max(1,sayi(kaynak.gun,1));
  const hayvanlar = {};
  for (const [id, kayit] of Object.entries(kaynak.hayvanlar)) {
    if (Object.hasOwn(cesitler,id)) hayvanlar[id] = hayvanKaydi(id, kayit ?? {}, gun);
  }
  const canta = {};
  for (const [id, urun] of Object.entries(urunler)) {
    const adet = sayi(kaynak.canta?.[id]);
    if (adet > 0) canta[id] = urun.tip === 'esya' ? 1 : adet;
  }
  const onceUyumus=Object.values(hayvanlar).some(p=>p.bakimlar.includes('uyku'));
  const sabah=sayi(kaynak.sabah,sabahBaslangici-(onceUyumus?180000:0));
  return {sabah,sonSofra:sayi(kaynak.sonSofra),gun, para: sayi(kaynak.para, BASLANGIC_JETONU), hayvanlar, canta, defter: defteriOku(kaynak, hayvanlar)};
}

function yaz(kayit) {
  oturumKaydi = kayit;
  if (geciciDepo) return;
  try {
    globalThis.localStorage.setItem(KAYIT, JSON.stringify(kayit));
  } catch {
    geciciDepo = true;
  }
}

// Aynı anda açık iki sekmede de bakiye ve hayvan tek işlemde güncellenir.
async function degistir(islem) {
  function uygula() {
    const kayit = oku();
    const sonuc = islem(kayit);
    yaz(kayit);
    return {...sonuc, para: kayit.para};
  }
  return globalThis.navigator?.locks
    ? navigator.locks.request(KAYIT, uygula)
    : uygula();
}

export function durum() {
  const kayit = oku();
  return {...kayit, sahipler: Object.keys(kayit.hayvanlar)};
}

export function sahipMi(id) {
  return Object.hasOwn(oku().hayvanlar, id);
}

export function bakimYapildi(id, eylem) {
  return oku().hayvanlar[id]?.bakimlar?.includes(eylem) ?? false;
}

export function satinAl(id,etiket) {
  return degistir(kayit => {
    if (!Object.hasOwn(cesitler, id)) return {ok: false, neden: 'gecersiz'};
    if (Object.hasOwn(kayit.hayvanlar, id)) return {ok: false, neden: 'sahip'};
    const fiyat=alisFiyati(id,kayit);
    if (etiket!==undefined && etiket!==fiyat) return {ok:false,neden:'fiyat'};
    if (kayit.para < fiyat) return {ok: false, neden: 'yetersiz'};
    kayit.para -= fiyat;
    kayit.hayvanlar[id] = hayvanKaydi(id,{},kayit.gun);
    return {ok: true};
  });
}

export function haftalikFiyat(taban,gun){
  return taban + Math.floor(Math.max(0,gun-1)/7);
}

export function alisFiyati(id,kayit){
  const fiyat=haftalikFiyat(cesitler[id].fiyat,kayit.gun);
  if(id==='kopek'&&!Object.keys(kayit.hayvanlar).length&&kayit.para<fiyat)return 0;
  return fiyat;
}

export function hayvanSat(id){
  return degistir(kayit=>{
    const pet=kayit.hayvanlar[id];
    if(!pet||pet.ogrenilen.length<2)return {ok:false};
    if(pet.hastaGun)delete kayit.defter[id];
    delete kayit.hayvanlar[id];
    const kazanc=haftalikFiyat(cesitler[id].satis,kayit.gun);
    kayit.para+=kazanc;
    return {ok:true,kazanc};
  });
}

function tedavisizKaldi(pet, gun){
  return Boolean(pet?.hastaGun && gun - pet.hastaGun >= 2);
}

export function gunGelirleri(kayit){
  const ids=new Set([...Object.keys(kayit.hayvanlar),...Object.keys(kayit.defter)]);
  return [...ids].map(id=>{
    const pet=kayit.hayvanlar[id];
    const veda=tedavisizKaldi(pet,kayit.gun);
    const bakim=Object.values(kayit.defter[id]||{}).reduce((sum,n)=>sum+n,0);
    const yasam=pet && !veda && pet.kirGun<2 ? Math.min(10,Math.floor(Math.max(0,bakim)/2)) : 0;
    // Pahalı bir hayvanın ek getirisi de yalnız yapılan bakım kadar açılır.
    const turGetirisi=Math.round(cesitler[id].gelir*yasam/10);
    const hasta=Boolean(pet?.hastaGun);
    const bonus=(urunler[pet?.kiyafet]?.bonus||0)+(urunler[pet?.yatak]?.bonus||0);
    const bakimBonusu=Math.round(bonus*yasam/10);
    const uyudu=pet ? pet.bakimlar.includes('uyku') : (kayit.defter[id]?.uyku||0)>0;
    return {id,veda,hasta,uyudu,gelir:hasta||!uyudu?0:Math.max(0,yasam+turGetirisi+bakimBonusu+Math.round(bakim/2))};
  });
}

export function gunPuani(kayit,id){
  return gunGelirleri(kayit).reduce((sum,row)=>sum+(!id||id===row.id?row.gelir:0),0);
}

function puanYaz(kayit, id, eylem, puan) {
  const satir = kayit.defter[id] ??= {};
  const once = satir[eylem] ?? 0;
  const hedef = eylem === 'yanlis' ? puan : Math.max(once, puan);
  satir[eylem] = hedef;
  return {puan: hedef - once, gunPuani: gunPuani(kayit), kazanc: 0};
}

export function gunuBitir(beklenenGun){
  return degistir(kayit=>{
    if(kayit.gun!==beklenenGun||gunIsigi(kayit)!=='gece')return {ok:false};
    const puan=gunPuani(kayit);
    const kazanc=Math.max(0,puan);
    kayit.para+=kazanc;
    kayit.gun++;
    kayit.sabah=Date.now();
    kayit.defter={};
    const ayrilanlar=[];
    for(const [id,pet] of Object.entries(kayit.hayvanlar)){
      if(!pet.bakimlar.includes('mama'))pet.acGun++;
      if(tedavisizKaldi(pet,beklenenGun)){ayrilanlar.push(id);delete kayit.hayvanlar[id];continue;}
      if(cesitler[id].ortam!=='golet'&&!pet.bakimlar.includes('su'))pet.susuzGun++;
      if(cesitler[id].ortam!=='golet'&&!pet.bakimlar.some(e=>['firca','sampuan','temizlik'].includes(e)))pet.kirGun++;
      if(pet.acGun>=4 && !pet.hastaGun)pet.hastaGun=kayit.gun;
      if(!pet.hastaGun && Math.random()<usumeIhtimali(pet,id))pet.hastaGun=kayit.gun;
      pet.gun=kayit.gun;pet.bakimlar=[];pet.sonZaman=Date.now();
    }
    return {ok:true,kazanc,puan,gun:kayit.gun,ayrilanlar};
  });
}

export function usumeIhtimali(pet,id){
  return .065*(1-(cesitler[id]?.sogukDirenci||0))*(1-(urunler[pet.kiyafet]?.koruma||0))*(1-(urunler[pet.yatak]?.koruma||0));
}

export function haftaSofrasi(kayit){
 const hafta=1+Math.floor((kayit.gun-1)/7);
 const ac=Object.keys(kayit.hayvanlar).filter(id=>!kayit.hayvanlar[id].bakimlar.some(a=>a==='mama'||a==='uyku'));
 const bedava=kayit.sonSofra!==hafta;
 const stok={...kayit.canta},porsiyonlar={};
 const menusu=id=>pantry[cesitler[id].tur].filter(y=>stok[y]>0);
 if(!bedava){
  ac.sort((a,b)=>menusu(a).length-menusu(b).length);
  for(const id of ac){
   const yemek=menusu(id).sort((a,b)=>stok[b]-stok[a])[0];
   if(yemek){porsiyonlar[id]=yemek;stok[yemek]--;}
  }
 }
 const ids=bedava?ac:Object.keys(porsiyonlar);
 return {hafta,ids,porsiyonlar,bedava,hazir:ids.length>0};
}

export function topluBesle(gun,beklenenBedava){
 return degistir(kayit=>{
  const {hafta,ids,porsiyonlar,bedava,hazir}=haftaSofrasi(kayit);
  if(!hazir||kayit.gun!==gun||(beklenenBedava!==undefined&&bedava!==beklenenBedava))return {ok:false};
  if(bedava)kayit.sonSofra=hafta;
  for(const id of ids){
   if(!bedava)kayit.canta[porsiyonlar[id]]--;
   const pet=kayit.hayvanlar[id];
   pet.acGun=0;bakimiIsaretle(pet,'mama');puanYaz(kayit,id,'mama',bedava?10:5);
  }
  return {ok:true,ids};
 });
}

export function giysiCikar(id,esya){
 return degistir(kayit=>{
  const pet=kayit.hayvanlar[id];
  if(!pet||pet.kiyafet!==esya)return {ok:false};
  pet.kiyafet='';
  return {ok:true};
 });
}

export function donat(id,esya,etiket){
 return degistir(kayit=>{
  const pet=kayit.hayvanlar[id],urun=urunler[esya];
  if(!pet||!donanimUygun(esya,cesitler[id].ortam))return {ok:false};
  const yatak=urun.tip==='yuva';
  if(urun.tip==='kiyafet'&&!dolapta(cesitler[id],esya,pet.kiyafetler))return {ok:false};
  const koleksiyon=urun.tip==='dekor'?pet.dekorlar:yatak?pet.yataklar:pet.kiyafetler;
  if(!koleksiyon.includes(esya)){
   const fiyat=haftalikFiyat(urun.fiyat,kayit.gun);
   if(etiket!==fiyat||kayit.para<fiyat)return {ok:false};
   kayit.para-=fiyat;
   koleksiyon.push(esya);
  }
  if(urun.tip==='dekor')pet.dekor=esya;
  else if(yatak)pet.yatak=esya;
  else pet.kiyafet=esya;
  return {ok:true};
 });
}

export function urunAl(id,etiket) {
  return degistir(kayit => {
    if (!Object.hasOwn(urunler, id) || ['kiyafet','yuva','dekor'].includes(urunler[id].tip) || urunler[id].rafta === false) return {ok: false, neden: 'gecersiz', adet: 0};
    const urun = urunler[id];
    const adet = kayit.canta[id] ?? 0;
    if (urun.tip === 'esya' && adet) return {ok: false, neden: 'sahip', adet};
    const fiyat=haftalikFiyat(urun.fiyat,kayit.gun);
    if (etiket!==undefined && etiket!==fiyat) return {ok:false,neden:'fiyat'};
    if (kayit.para < fiyat) return {ok: false, neden: 'yetersiz', adet};
    kayit.para -= fiyat;
    kayit.canta[id] = adet + 1;
    return {ok: true, adet: adet + 1};
  });
}

export function kurdeleTak(id, tak) {
  return degistir(kayit => {
    if (!Object.hasOwn(kayit.hayvanlar, id)) return {ok: false, neden: 'kilitli'};
    if (kayit.hayvanlar[id].bakimlar.includes('uyku')) return {ok:false,neden:'uyuyor'};
    if (!kayit.canta.kurdele) return {ok: false, neden: 'stok'};
    kayit.hayvanlar[id].kurdele = Boolean(tak);
    return {ok: true};
  });
}

function bakimiIsaretle(hayvan, eylem) {
  if (!hayvan.bakimlar.includes(eylem)) hayvan.bakimlar.push(eylem);
  if (!hayvan.ogrenilen.includes(eylem)) hayvan.ogrenilen.push(eylem);
}

export function ogunTamamla(id, yiyecek, istenen) {
  return degistir(kayit => {
    const adet = Object.hasOwn(urunler, yiyecek) ? kayit.canta[yiyecek] ?? 0 : 0;
    if (!Object.hasOwn(kayit.hayvanlar, id)) return {ok: false, neden: 'kilitli', kazanc: 0, adet};
    if (kayit.hayvanlar[id].bakimlar.includes('uyku')) return {ok:false,neden:'uyuyor',adet};
    if (!adet || urunler[yiyecek]?.tip !== 'yiyecek') return {ok: false, neden: 'stok', kazanc: 0, puan: 0, adet};
    const pet = kayit.hayvanlar[id];
    kayit.canta[yiyecek] = adet - 1;
    pet.acGun = 0;
    bakimiIsaretle(pet,'mama');
    if (!pantry[cesitler[id].tur].includes(yiyecek)) {
      pet.hastaGun ||= kayit.gun;
      return {ok:true, hasta:true, adet:adet-1, ...puanYaz(kayit,id,'yanlis',-5)};
    }
    const puan = istenen === yiyecek || istenen === true ? 10 : 5;
    return {ok: true, adet: adet - 1, ...puanYaz(kayit,id,'mama',puan)};
  });
}

export function bakimOdulu(id, eylem, yildiz, yuzde) {
  return degistir(kayit => {
    if (!Object.hasOwn(kayit.hayvanlar, id)) return {ok: false, neden: 'kilitli', kazanc: 0};
    if (kayit.hayvanlar[id].bakimlar.includes('uyku')) return {ok:false,neden:'uyuyor'};
    if (eylem === 'uyku' && gunIsigi(kayit)!=='gece')return {ok:false,neden:'gunduz'};
    if (eylem === 'mama' || !uygunBakim(id, eylem)) return {ok: false, neden: 'gecersiz', kazanc: 0};
    if (eylem === 'frizbi' && !kayit.canta.frizbi) {
      return {ok: false, neden: 'stok', kazanc: 0};
    }
    const puan = Number.isFinite(yuzde)
      ? Math.round(puanlar[eylem] * Math.min(100, Math.max(0,yuzde)) / 100)
      : sayi(yildiz) > 0 ? puanlar[eylem] : 0;
    if (puan>0 && eylem==='su') kayit.hayvanlar[id].susuzGun=0;
    if (puan>0 && ['firca','sampuan','temizlik'].includes(eylem)) kayit.hayvanlar[id].kirGun=0;
    if (puan > 0) bakimiIsaretle(kayit.hayvanlar[id], eylem);
    return {ok: true, bakimPuani:puan, ...puanYaz(kayit,id,eylem,puan)};
  });
}

export function birlikteYasa(id, saniye) {
  return degistir(kayit => {
    if (!Object.hasOwn(kayit.hayvanlar, id) || globalThis.document?.hidden) return {kazanc: 0};
    const pet = kayit.hayvanlar[id];
    // Çağıran yalnız görünür odada geçen süreyi iletir. Arka plandan dönen ve
    // birbiriyle örtüşen zamanlayıcılar aynı saniyeyi iki defa yazamaz.
    const simdi = Date.now();
    const gecen = Math.min(sayi(Math.floor(saniye)), 30);
    const eklenebilir = Math.min(gecen, Math.max(0, Math.floor((simdi - pet.sonZaman) / 1000)));
    if (eklenebilir === 0) return {kazanc: 0};
    pet.sonZaman = simdi;
    pet.saniye += eklenebilir;
    return {kazanc: 0};
  });
}

export function tedaviEt(id, satinAlarak, etiket) {
  return degistir(kayit => {
    const pet = kayit.hayvanlar[id];
    if (!pet?.hastaGun || pet.bakimlar.includes('uyku')) return {ok:false};
    if (kayit.canta.ilac) kayit.canta.ilac--;
    else {
      const fiyat=haftalikFiyat(urunler.ilac.fiyat,kayit.gun);
      if (!satinAlarak || (etiket!==undefined && etiket!==fiyat) || kayit.para < fiyat) return {ok:false};
      kayit.para -= fiyat;
    }
    pet.hastaGun = 0;
    return {ok:true};
  });
}

export function yikanacaklar(kayit){
  return Object.entries(kayit.hayvanlar).filter(([id,pet])=>
    cesitler[id].ortam!=='golet' && !pet.bakimlar.some(a=>['uyku','sampuan','temizlik'].includes(a))
  ).map(([id])=>id);
}

export function topluYika(gun){
  return degistir(kayit=>{
    const ids=yikanacaklar(kayit), fiyat=haftalikFiyat(10,kayit.gun);
    if(kayit.gun!==gun || !ids.length || kayit.para<fiyat)return {ok:false};
    kayit.para-=fiyat;
    for(const id of ids){
      const pet=kayit.hayvanlar[id];
      const tur=cesitler[id].tur;
      const eylem=fircalanabilen.includes(tur)?'sampuan':'temizlik';
      pet.kirGun=0;
      bakimiIsaretle(pet,eylem);
      puanYaz(kayit,id,eylem,puanlar[eylem]);
    }
    return {ok:true,ids};
  });
}

export function saatiBaslat(){return degistir(()=>({ok:true}));}

export function dekorTasi(id,esya,x){
 return degistir(kayit=>{
  const pet=kayit.hayvanlar[id];
  if(!pet||pet.dekor!==esya||!Number.isFinite(x))return {ok:false};
  pet.dekorX=Math.round(Math.max(12,Math.min(88,x)));
  return {ok:true};
 });
}
