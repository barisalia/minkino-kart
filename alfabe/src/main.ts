import { erisimVarMi, kilitGoster } from '../../src/abonelik/kilit';
import { harfKutusuKur } from './harf-kutusu';
import { resimdeBulKur } from './resimde-bul';
import { sahneyiYukle } from './resimde-bul-sahne';
import { hayvanOyunuKur } from './harf-hayvan';
import { hecePanoKur } from './hece-pano';
import { kucukGrup, tamDers, yasGrubu } from './yas-grubu';
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import dersler from './harfler.json';
import { IKON } from '../../src/ui/ikonlar';
import { sayfaAdresi } from '../../src/kabuk/sayfa';
import { geriDinle } from '../../src/kabuk/yon';
import { cerenKaydiVar, cerenKonus, cerenSustur, cerenYuzu, sesDersiKur } from './konusma-dersi';
import { kurulYazma } from './yazma';
import { miknatisKur } from './miknatis';
import { resim } from './resimler';
import { albumKur } from './album';
import { harfYazisi, kalemNo, type Kalemler } from './kartlar';
import { harfiKesfetKur } from './harfi-kesfet';
import { sesBalonlariKur } from './ses-balonlari';
import { sesBalonuAcik } from './h14-cizimler';
import { gunlukAdim } from './gunluk';
import { albumeYapistirAni, sayaciBekletme } from './ders-sonu-ani';
import { rafAni } from './raf-ani';
import { eskiUcretsizAcik } from './harf-erisim';
import { SES_GRUPLARI, HARF_SIRASI, siraNo, siradakiHarf, sonrakiHarf } from './harf-sirasi';
import './raf-gruplar.css';
import { kutlamaHazirMi, kutlamaKur } from './kutlama';
import { cumleRafKarti } from './cumle-karti';
import { cumleOkumaKur } from './cumle-okuma';
import { heceKoprusuKur, kopruHazirMi, kopruKarti, kopruSozcukSayisi } from './hece-koprusu';
import { postaHazirMi, postaKarti, postaKutusuKur, postaSozcukSayisi } from './posta-kutusu';
import { kurabiyeAcik, kurabiyeDugmesi, kurabiyeKur } from './kurabiye';
import { sozlukKur } from './resimli-sozluk';
import { TEST_MODU } from '../../src/ui/dom';
// Kartı albüme yapıştırılan harf: rafa dönülünce onay rozeti damga gibi basılır (raf-ani.ts).
let yeniBiten: string | undefined;
import { harfBoyamaKur } from './harf-boyama';
import { boyamaResmiHazir, boyamaResmiKur } from './boyama-resmi';
import { turBitti, yeniIcerikSirasi } from './ikinci-tur';
import { heceOyunuKur } from './hece-oyunu';
import { heceEvleriKarti, heceEvleriKur, UNSUZLER } from './hece-evleri';
import './stil.css';
import { oyunSesi } from './oyun-sesi';
import { pariltiNokta } from './cila';
import { cerenTepkisi } from './ceren-tepki';

const alan = document.querySelector<HTMLElement>('#atolye')!;
const depo = 'minkino-alfabe-v1';
// Kayıtlı derslerde basamak kimlikleri sıralamadan bağımsızdır.
const tumAdimlar = [
  {id:5, ad:'Harfi keşfet'}, {id:0, ad:'Dinle ve söyle'},
  {id:1, ad:'Büyük harf'}, {id:6, ad:'Harfi boya'}, {id:2, ad:'Küçük harf'},
  {id:7, ad:'Yaz ve hayvanı çağır'}, {id:4, ad:'Mıknatıslar'}, {id:8, ad:'Resimde bul'}, {id:3, ad:'Obur’un tabağı'},
];
/**
 * Bir harf dersinin adımları (18 Kasım 2026, Barış: "çok sıkıcı ve tekrarcı, gereksiz şeyleri azalt").
 * Önceden 5+ yaşta her harfte 9 adım vardı: harfin şekli dört kez çiziliyordu (büyük, küçük, boyama, hayvan çağırma),
 * "bu harfle başlayan şeyi bul" üç kez soruluyordu (Keşfet, Resimde Bul, Obur). Artık bir derste hiçbir iş iki kez yok:
 *   2–3 yaş: harfi boya · bul (2 adım). Bul: tek harflerde Resimde Bul, çift harflerde Obur'un Tabağı (sırayla, çeşit).
 *   4 yaş:   keşfet · dinle ve söyle · yaz ve hayvanı çağır (Ceren yazılışı gösterir) · Resimde Bul (4 adım)
 *   5+ yaş:  keşfet · dinle ve söyle · büyük harf · mıknatıslar · küçük harf · Resimde Bul (6 adım; iki yazma yan yana değil)
 * Keşfet ile Obur aynı iki sözcüğü kullandığı için Keşfet'li derslerde bulma oyunu hep Resimde Bul'dur (başka sözcükler).
 * Her yaşta 29 harfin içeriği kullanılır: boyama 2–3, hayvan çağırma 4, yazma ve mıknatıs 5+ yaşta.
 */
function dersAdimlari(id: string) {
  // 2–3 yaşta "bul" adımı öğrenme sırasındaki yere göre sırayla Resimde Bul / Obur: art arda iki harf aynı oyunu görmez.
  const n = siraNo(id) + 1 || Number(id) || 1;
  const sira = kucukGrup ? [6, n % 2 ? 8 : 3] : tamDers ? [5, 0, 1, 4, 2, 8] : [5, 0, 7, 8];
  return sira.map(i => tumAdimlar.find(a => a.id === i)!);
}
const renkler = ['#f7c964', '#f4ab97', '#a9d8c4', '#a5d2e7', '#c8bbe1'];
type Ilerleme = { akisSurumu: number; biten: string[]; son: string; adimlar: Record<string,number>; renkler: Record<string,Kalemler>; bekleyen: string[] };
const gecerli = (id: string) => dersler.some(h => h.id === id);
const adimMi = (i: unknown): i is number => tumAdimlar.some(a => a.id === i);
function kaydiOku(): Ilerleme {
  const kayit: Ilerleme = { akisSurumu:2, biten:[], son:'01', adimlar:{}, renkler:{}, bekleyen:[] };
  try {
    const eski = JSON.parse(dersKaydiniOku(depo) || 'null');
    if (!eski) return kayit;
    if (Array.isArray(eski.biten)) kayit.biten = [...new Set<string>(eski.biten.filter(gecerli))];
    if (gecerli(eski.son)) kayit.son = eski.son;
    if (Array.isArray(eski.bekleyen)) kayit.bekleyen = kayit.biten.filter(id => eski.bekleyen.includes(id));
    const basamaklar = { [kayit.son]: eski.adim, ...eski.adimlar };
    for (const [id, i] of Object.entries(basamaklar)) {
      if (!gecerli(id)) continue;
      // Önceki tam derste Obur’a gelmiş çocuk mıknatısları henüz oynamamıştı.
      if (adimMi(i)) kayit.adimlar[id] = tamDers && eski.akisSurumu !== 2 && i === 3 ? 4 : i;
    }
    // Eski sürüm bu işareti ancak mıknatısları tamamlayınca yazıyordu.
    let aktarildi = false;
    for (const [id, yarim] of Object.entries(eski.yarimAlistirma || {})) {
      if (!gecerli(id) || yarim !== true || kayit.adimlar[id] !== 4) continue;
      if (!kayit.biten.includes(id)) kayit.biten.push(id);
      if (!kayit.bekleyen.includes(id)) kayit.bekleyen.push(id);
      delete kayit.adimlar[id];
      aktarildi = true;
    }
    for (const [id, c] of Object.entries(eski.renkler || {})) {
      if (!gecerli(id) || !c || typeof c !== 'object') continue;
      kayit.renkler[id] = {buyuk:kalemNo('buyuk' in c && c.buyuk), kucuk:kalemNo('kucuk' in c && c.kucuk)};
    }
    if (aktarildi) dersKaydiniYaz(depo, JSON.stringify(kayit));
  } catch { /* Depolama kapalıysa ders bu oturumda çalışır. */ }
  return kayit;
}
const kayit = kaydiOku();
function sakla() { dersKaydiniYaz(depo, JSON.stringify(kayit)); }
let ders = dersler[0], adim = 0, birak: (() => void) | undefined;
let ekran: 'raf' | 'ders' | 'son' | 'album' | 'hece' | 'trambolin' | 'pano' | 'kopru' | 'posta' | 'kurabiye' | 'sozluk' | 'evler' | 'cumle' = 'raf';
function temizle() { birak?.(); birak = undefined; cerenSustur(); }
function isaretle() {
  alan.dataset.yas=yasGrubu;
  alan.dataset.ekran = ekran;
  alan.dataset.adim = String(adim);
  alan.dataset.harf = ders.upper;
}
function odak() {
  alan.querySelector<HTMLElement>('.at-ust-baslik')?.focus({preventScroll:true});
  window.scrollTo(0, 0);
}
const dosyada = location.protocol === 'file:';
/** Rafın geri düğmesi, çocuğun geldiği menü bölümünün adını taşır (uygulama/src/yatay-menu.ts → minkino-menu-bolum). */
function menuBolumuAdi() {
  try { return sessionStorage.getItem('minkino-menu-bolum') === 'ders' ? 'Dersler' : 'Etkinlikler'; } catch { return 'Etkinlikler'; }
}
function ust(baslik: string, durum: string) {
  const geri = ekran === 'raf'
    ? dosyada ? '' : '<a class="at-geri" href="' + sayfaAdresi('../') + '">' + IKON.geri + '<span>' + menuBolumuAdi() + '</span></a>'
    : '<button type="button" class="at-geri" aria-label="Harflere dön">' + IKON.geri + '<span>Harfler</span></button>';
  return '<header class="at-ust"><div class="at-yon">' + geri + '</div><strong class="at-ust-baslik" tabindex="-1">' + baslik +
    '</strong><div class="at-ilerleme">' + durum + '</div></header>';
}
const rafSayaci = () => '<span aria-label="' + kayit.biten.length + ' harf tamamlandı">' + kayit.biten.length + ' / 29</span>';
let rafKarsilandi = false;
function rafGoster() {
  const onceki = ekran;
  temizle(); ekran = 'raf'; isaretle();
  let onerilen = dersler.find(h => h.id === kayit.son)!;
  if (kayit.biten.includes(onerilen.id) && !kayit.bekleyen.includes(onerilen.id) && kayit.adimlar[onerilen.id] === undefined) {
    // Öğrenme sırasıyla (harf-sirasi.ts): bekleyen kart, yarım ders, sonra bitmemiş ilk harf.
    const sirali = HARF_SIRASI.map(id => dersler.find(d => d.id === id)!);
    const siradaki = siradakiHarf(kayit.biten);
    onerilen = sirali.find(h=>kayit.bekleyen.includes(h.id)) ?? sirali.find(h=>kayit.adimlar[h.id]!==undefined) ?? sirali.find(h=>h.id===siradaki) ?? sirali[0];
  }
  const suruyor = kayit.adimlar[onerilen.id] !== undefined;
  const kartBekliyor=kayit.bekleyen.includes(onerilen.id);
  const bitmisRaf=kayit.biten.length===dersler.length;
  alan.innerHTML = ust('Türkçe', rafSayaci()) +
    '<section class="at-raf"><div class="at-karsila"><div class="at-portre">' + cerenYuzu() + '</div>' +
    '<div class="at-karsila-metin"><h1>'+(bitmisRaf?'29 harfi tamamladın!':'Bir harf seç!')+'</h1><p>'+
    (kartBekliyor?onerilen.upper+' kartın albümünü bekliyor.':suruyor?onerilen.upper+' dersinde '+tumAdimlar.find(a=>a.id===kayit.adimlar[onerilen.id])!.ad.toLocaleLowerCase('tr')+' bölümündesin.':bitmisRaf?'Bugün hangi harfi tekrarlayalım?':'Bugün hangi sesi öğrenelim?')+'</p>' +
    '<button type="button" class="at-basla">' + (kartBekliyor ? 'Kartımı yapıştır' : suruyor ? onerilen.upper + ' dersine devam et' : bitmisRaf ? onerilen.upper+' ile tekrar et' : onerilen.upper + ' ile başla') +
    ' ' + IKON.oyna + '</button></div><button class="at-ses at-tanitim" type="button" aria-label="Ceren Öğretmen’i dinle">' + IKON.hoparlor +
    '</button></div><div class="at-album-sira"><h2>Harfler</h2><button type="button" class="at-album-ac" aria-label="Harf albümümü aç"><img src="' + resim('album-dugmesi') + '" alt="" draggable="false"></button></div><div class="at-harfler at-gruplu" role="group" aria-label="Harfler, öğrenme sırasıyla beş ses grubu">' +
    // Ses grupları (harf-sirasi.ts): her grup kendi renginde bir pano.
    SES_GRUPLARI.map((grup, g) => '<div class="at-grup" role="group" style="--grup:' + renkler[g] + '" aria-label="' + (g + 1) + '. grup: ' +
      grup.map(id => dersler.find(d => d.id === id)!.upper).join(', ') + '">' + grup.map(id => {
      const h = dersler.find(d => d.id === id)!;
      const bitmis = kayit.biten.includes(h.id);
      const yarim = kayit.adimlar[h.id] !== undefined;
      return '<button type="button" class="at-harf" data-id="' + h.id + '" style="--renk:' + renkler[g] +
        '" aria-label="' + h.upper + ' harfi' + (bitmis ? ', tamamlandı' : yarim ? ', devam et' : '') +
        '"><b>' + h.upper + '</b><span>' + h.lower + '</span>' + (bitmis ? '<i class="at-biten" aria-hidden="true">' + IKON.onay + '</i>' : yarim ? '<i class="at-yarim" aria-hidden="true"></i>' : '') + '</button>';
    }).join('') + '</div>').join('') + '</div><div class="at-hece-karti"><button type="button" class="at-oyun-karti at-hece-ac">' +
      '<span class="at-hece-ornek" aria-hidden="true"><img src="' + resim('06') + '" alt=""><span><b>el</b><b>ma</b></span></span>' +
      '<span class="at-hece-yazi"><strong>Hece Oyunu</strong><small>'+(kucukGrup?'Dinle, her hecede bir kez zıpla.':'Trambolinde zıpla, heceleri panoya tak.')+'</small></span>' +
      '<span class="at-hece-oyna" aria-hidden="true">' + IKON.oyna + '</span></button>' +
      '<button type="button" class="at-hece-dinle at-ses" aria-label="Ceren’den Hece Oyunu’nu dinle">' + IKON.hoparlor +
      '</button></div>' + heceEvleriKarti() + cumleRafKarti(kayit.biten, yasGrubu, cerenKaydiVar('cumle-kart')) + '</section>';
  alan.querySelector<HTMLButtonElement>('.at-basla')!.onclick = () => dersAc(onerilen.id);
  alan.querySelector<HTMLButtonElement>('.at-tanitim')!.onclick = () => cerenKonus('sinif-giris');
  alan.querySelector<HTMLButtonElement>('.at-hece-ac')!.onclick = heceGoster;
  alan.querySelector<HTMLButtonElement>('.at-hece-dinle')!.onclick = () => cerenKonus('hece-kart-tanitim');
  const evlerKarti = alan.querySelector<HTMLButtonElement>('.at-evler-ac');
  if (evlerKarti) {
    evlerKarti.onclick = heceEvleriGoster;
    alan.querySelector<HTMLButtonElement>('.at-evler-dinle')!.onclick = () => cerenKonus('ev-kart');
  }
  alan.querySelector<HTMLButtonElement>('.at-album-ac')!.onclick = () => albumGoster();
  // Ceren'le oku (bağlantı noktası A, cumle-karti.ts / cumle-okuma.ts)
  const cumleKarti = alan.querySelector<HTMLButtonElement>('.at-cumle-ac');
  if (cumleKarti) {
    cumleKarti.onclick = cumleGoster;
    const bos = alan.querySelector('.at-cumle-karti')!.getAttribute('data-durum') === 'bos';
    const dinle = alan.querySelector<HTMLButtonElement>('.at-cumle-dinle');
    if (dinle) dinle.onclick = () => cerenKonus(bos && cerenKaydiVar('cumle-kart-bos') ? 'cumle-kart-bos' : 'cumle-kart');
  }
  alan.querySelectorAll<HTMLButtonElement>('.at-harf').forEach(b => b.onclick = () => dersAc(b.dataset.id!));
  // ses grubu sırasındaki ilk 4 harf (A, N, E, T) ücretsiz, diğerleri premium (src/engine/erisim.ts → alfabe/harf-NN): kilit rozeti
  // Bu cihazda başlanmış eski ücretsiz B, C, Ç açık kalır, rozet de görünmez (harf-erisim.ts).
  alan.querySelectorAll<HTMLButtonElement>('.at-harf').forEach(b => { if (!harfAcikKaldi(b.dataset.id!)) kilitGoster(b, 'alfabe/harf-' + b.dataset.id); });
  // Sıradaki harf parlar; az önce biten harfin rozeti basılır, sıradaki uyanır.
  const yeni = yeniBiten; yeniBiten = undefined;
  birak = rafAni(alan, kayit.biten.includes(onerilen.id) && !kartBekliyor ? undefined : onerilen.id, yeni);
  // Açılışta sessizlik yok (kalite denetimi 22 Kasım, kural 6): sayfa ilk açıldığında Ceren rafı bir cümleyle karşılar
  // ("Hoş geldin! Bugün hangi sesi öğrenelim? Bir harfe dokun."). Dersten rafa dönüşte yinelenmez.
  // Karşılama: Ceren konuşur, bitince el sallar ("el-salla" pozu, Paket Harf-A1; kare yoksa değişmez).
  if (!rafKarsilandi && !yeni) { rafKarsilandi = true; cerenKonus('sinif-giris', () => cerenTepkisi(alan.querySelector<HTMLElement>('.at-raf .alf-ceren') ?? undefined, 'el-salla', 1500)); }
  if(dosyada){
    const sec=document.createElement('select');
    sec.className='at-yas-sec';sec.setAttribute('aria-label','Yaş grubu');
    for(const grup of ['2-3','4','5+']){
      const option=new Option((grup==='2-3'?'2–3':grup)+' yaş',grup);
      option.selected=grup===yasGrubu;sec.add(option);
    }
    sec.onchange=()=>{
      const yeni=new URL(location.href);
      try{
        localStorage.setItem('minkino-atolye-dosya-yasi',sec.value);
        yeni.searchParams.delete('yas');
      }catch{yeni.searchParams.set('yas',sec.value);}
      if(yeni.href===location.href)location.reload();else location.replace(yeni.href);
    };
    alan.querySelector('.at-yon')!.append(sec);
  }
  if (onceki === 'raf') odak();
  else {
    const secici = onceki === 'evler' ? '.at-evler-ac' : onceki === 'cumle' ? '.at-cumle-ac' : ['hece','pano','trambolin','kopru','posta'].includes(onceki) ? '.at-hece-ac' : onceki === 'album' || onceki === 'kurabiye' || onceki === 'sozluk' ? '.at-album-ac' : '[data-id="' + ders.id + '"]';
    const donus = alan.querySelector<HTMLButtonElement>(secici);
    donus?.focus({preventScroll:true});
    donus?.scrollIntoView({block:'nearest'});
  }
}
/** Eski ücretsiz harf (B, C, Ç) bu cihazda başlanmışsa kilit sorulmaz (harf-erisim.ts; erisim.ts değişmez). */
const harfAcikKaldi = (id: string) => eskiUcretsizAcik(id, kayit.biten, kayit.adimlar);
const harfeErisim = (id: string) => harfAcikKaldi(id) || erisimVarMi('alfabe/harf-' + id, document.body);
function dersAc(id: string) {
  if (!harfeErisim(id)) return;
  yeniBiten = undefined;
  ders = dersler.find(h => h.id === id)!;
  kayit.son = id;
  if (kayit.bekleyen.includes(id)) { sonucGoster(); return; }
  // kayıtlı adım bu harfin dersinde yoksa (ders kısaldı, 18 Kasım) dersin başından açılır
  const adimlar = dersAdimlari(id);
  const kayitli = kayit.adimlar[id];
  adim = kayitli !== undefined && adimlar.some(a => a.id === kayitli) ? kayitli : adimlar[0].id;
  // Resimde Bul sahnesi kendi parçasıdır (resimde-bul-sahne.ts): bu dersin akışında varsa şimdiden indir,
  // çocuk o adıma geldiğinde resim beklemeden çizilsin.
  if (adimlar.some(a => a.id === 8)) void sahneyiYukle(id).catch(() => {});
  dersGoster();
}
// Adımdan adıma geçiş bir "ilerledin" anıdır (madde 0, 23 Kasım): yeni dolan nokta yıldızla parlar, kısa zil, yeni sahne
// yana kayarak gelir. İlk açılışta ve rafa dönüşte olmaz.
let adimGecisi = false;
function ilerle() {
  gunlukAdim();
  adimGecisi = true;
  const adimlar = dersAdimlari(ders.id);
  const sonraki = adimlar[adimlar.findIndex(a => a.id === adim) + 1];
  if (sonraki) { adim = sonraki.id; dersGoster(); }
  else dersiBitir();
}
function dersiBitir() {
  if (!kayit.biten.includes(ders.id)) kayit.biten.push(ders.id);
  if (!kayit.bekleyen.includes(ders.id)) kayit.bekleyen.push(ders.id);
  delete kayit.adimlar[ders.id];
  sakla(); sonucGoster();
}
function dersGoster() {
  temizle(); ekran = 'ders'; isaretle();
  kayit.adimlar[ders.id] = adim; sakla();
  const adimlar = dersAdimlari(ders.id);
  const sira = adimlar.findIndex(a => a.id === adim);
  const gosterge = '<span class="at-adim" aria-label="' + (sira+1) + '. adım, ' + adimlar[sira].ad + '">' +
    adimlar.map((_,i) => '<i class="' + (i < sira ? 'at-dolu' : i === sira ? 'at-dolu at-simdi' : '') + '"></i>').join('') + '</span>';
  const yazma = adim === 1 || adim === 2;
  // Adımların "devam" düğmesi sonraki adımın adını taşır; son adımda albüm kartına gider (akış değişse de doğru kalır).
  const sonAdim = !adimlar[sira + 1];
  const sonrakiYazi = sonAdim ? 'Albüm kartımı gör' : adimlar[sira + 1].ad + ' bölümüne geç';
  alan.innerHTML = ust(ders.upper + ' ' + ders.lower, gosterge) +
    '<section class="at-sahne at-sahne-' + (adim === 5 ? 'kesif' : adim) + '">' +
    '<div class="at-oyun"></div></section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick = rafGoster;
  const oyun = alan.querySelector<HTMLElement>('.at-oyun')!;
  if (adim === 7) birak = hayvanOyunuKur(oyun, cerenKonus, {harf:ders.upper, ilerle, sonraki:sonrakiYazi});
  // Paket Harf-H15: çizimler gelince Keşfet → Ses Balonları (ses-balonlari.ts); gelmeden eski Keşfet.
  else if (adim === 5) birak = (sesBalonuAcik() ? sesBalonlariKur : harfiKesfetKur)(oyun, ders, cerenKonus, ilerle);
  else if (adim === 0) birak = sesDersiKur(oyun, ders, cerenKonus, ilerle);
  // 2–3 yaş: harf ikinci kez açılınca (Astra'nın resmi geldiyse) harfin yerine o harfle başlayan resim boyanır; sırayla döner.
  else if (adim === 6) birak = yeniIcerikSirasi('boya', ders.id) && boyamaResmiHazir(ders.id)
    ? boyamaResmiKur(oyun, ders, cerenKonus, ilerle)
    : harfBoyamaKur(oyun, ders, cerenKonus, () => { turBitti('boya', ders.id); ilerle(); }, kayit.renkler[ders.id]?.buyuk);
  else if (yazma) {
    const renk = kayit.renkler[ders.id] ??= {buyuk:0,kucuk:0};
    const boy = adim === 2 ? 'kucuk' : 'buyuk';
    birak = kurulYazma(oyun, ders, adim === 2, cerenKonus, ilerle, renk[boy], i=>{renk[boy]=i;sakla();},()=>{
      kayit.adimlar[ders.id]=adimlar[sira+1].id;
      sakla();
    });
  }
  else if (adim === 3) birak = harfKutusuKur(oyun, ders, cerenKonus, ilerle, sonrakiYazi, sonAdim);
  else if (adim === 8) birak = resimdeBulKur(oyun, ders, ilerle, sonrakiYazi);
  else birak = miknatisKur(oyun, ders, cerenKonus, ilerle, sonrakiYazi);
  if (adimGecisi) {
    adimGecisi = false;
    alan.querySelector('.at-sahne')?.classList.add('at-gecis');
    oyunSesi('zil');
    requestAnimationFrame(() => {
      const nokta = alan.querySelector('.at-adim .at-simdi')?.getBoundingClientRect();
      if (nokta?.width) pariltiNokta(nokta.left + nokta.width / 2, nokta.top + nokta.height / 2, 7, 38);
    });
  }
  odak();
}
function heceGoster() {
  if(kucukGrup){heceDali('trambolin');return;}
  temizle();ekran='hece';isaretle();
  alan.innerHTML=ust('Hece Oyunu','')+'<section class="hm-menu"><button type="button" data-dal="trambolin" aria-label="Hece Trambolini"><img src="'+resim('hece-trambolin-kart')+'" alt=""></button><button type="button" data-dal="pano" aria-label="Manyetik Hece Bulmacası"><img src="'+resim('hece-pano-kart')+'" alt=""></button>'+
    // Lokum'un Hece Köprüsü: çizimler gelince ve oynanacak en az 3 sözcük varken (test kipinde hep).
    (kopruAcik()?'<button type="button" data-dal="kopru" aria-label="Lokum’un Hece Köprüsü"><img src="'+kopruKarti()+'" alt=""></button>':'')+
    // Dede'nin Posta Kutusu (5+): çizimler gelince ve yazılacak en az 3 sözcük varken (test kipinde hep).
    (postaAcik()?'<button type="button" data-dal="posta" aria-label="Dede’nin Posta Kutusu"><img src="'+postaKarti()+'" alt=""></button>':'')+'</section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  alan.querySelector<HTMLButtonElement>('[data-dal=trambolin]')!.onclick=()=>heceDali('trambolin');
  alan.querySelector<HTMLButtonElement>('[data-dal=pano]')!.onclick=()=>heceDali('pano');
  kilitGoster(alan.querySelector<HTMLButtonElement>('[data-dal=pano]')!, 'alfabe/hece-pano');
  const kopru=alan.querySelector<HTMLButtonElement>('[data-dal=kopru]');
  if(kopru){kopru.onclick=()=>heceDali('kopru');kilitGoster(kopru,'alfabe/hece-kopru');}
  const posta=alan.querySelector<HTMLButtonElement>('[data-dal=posta]');
  if(posta){posta.onclick=()=>heceDali('posta');kilitGoster(posta,'alfabe/hece-posta');}
  odak();
}
const kopruYasi=()=>(tamDers?'5+':'4') as '4'|'5+';
const kopruAcik=()=>!kucukGrup&&kopruHazirMi()&&(TEST_MODU||kopruSozcukSayisi(kayit.biten,kopruYasi())>=3);
const postaAcik=()=>tamDers&&postaHazirMi()&&(TEST_MODU||postaSozcukSayisi(kayit.biten)>=3);
function heceDali(dal:'pano'|'trambolin'|'kopru'|'posta'){
  if(!erisimVarMi('alfabe/hece-'+dal,document.body))return;
  temizle();ekran=dal;isaretle();
  alan.innerHTML=ust(dal==='pano'?'Manyetik Hece Bulmacası':dal==='kopru'?'Lokum’un Hece Köprüsü':dal==='posta'?'Dede’nin Posta Kutusu':'Hece Trambolini','')+'<section class="at-hece-oyun-alani"></section>';
  const don=kucukGrup?rafGoster:heceGoster;
  const geri=alan.querySelector<HTMLButtonElement>('.at-geri')!;
  if(!kucukGrup){geri.setAttribute('aria-label','Hece Oyunu’na dön');geri.querySelector('span')!.textContent='Hece Oyunu';}
  geri.onclick=don;
  const hedef=alan.querySelector<HTMLElement>('.at-hece-oyun-alani')!;
  birak=dal==='pano'?hecePanoKur(hedef,cerenKonus,don):dal==='kopru'?heceKoprusuKur(hedef,cerenKonus,kayit.biten,kopruYasi(),don):dal==='posta'?postaKutusuKur(hedef,cerenKonus,kayit.biten,don):heceOyunuKur(hedef,cerenKonus,don);
  odak();
}
function cumleGoster(){
  temizle();ekran='cumle';isaretle();
  alan.innerHTML=ust('Ceren’le oku','')+'<section class="at-sahne at-sahne-cumle"></section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  birak=cumleOkumaKur(alan.querySelector<HTMLElement>('.at-sahne-cumle')!,{
    oku:cerenKonus,sustur:cerenSustur,cikis:rafGoster,
    geri:alan.querySelector<HTMLButtonElement>('.at-geri')!,
    baslik:alan.querySelector<HTMLElement>('.at-ust-baslik')!,
    ilerleme:alan.querySelector<HTMLElement>('.at-ilerleme')!,
    bitenHarfler:kayit.biten,yas:yasGrubu,
  });
  odak();
}
function heceEvleriGoster(){
  temizle();ekran='evler';isaretle();
  alan.innerHTML=ust('Hece Evleri','')+'<div class="he-alan"></div>';
  birak=heceEvleriKur(alan.querySelector<HTMLElement>('.he-alan')!,{
    oku:cerenKonus,sustur:cerenSustur,cikis:rafGoster,
    geri:alan.querySelector<HTMLButtonElement>('.at-geri')!,
    baslik:alan.querySelector<HTMLElement>('.at-ust-baslik')!,
    ilerleme:alan.querySelector<HTMLElement>('.at-ilerleme')!,
  });
  odak();
}
function albumGoster(id = '') {
  temizle(); ekran = 'album'; isaretle();
  alan.innerHTML = ust('Türkçe', rafSayaci()) + '<div class="at-album-icerik"></div>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick = rafGoster;
  const gorunen = kayit.biten.filter(d => !kayit.bekleyen.includes(d));
  // Mino'nun Harf Kurabiyesi (2–3 ve 4 yaş): albümün kumanda sırasında isteğe bağlı küçük oyun; ders akışına girmez.
  const kurabiye = !tamDers && kurabiyeAcik(kayit.biten) ? { resim: kurabiyeDugmesi()!, ad: 'Mino’nun Harf Kurabiyesi', ac: kurabiyeGoster } : undefined;
  birak = albumKur(alan.querySelector('.at-album-icerik')!, gorunen, kayit.renkler, id, cerenKonus, cerenSustur, rafGoster, kurabiye, sozlukGoster);
  odak();
}
/** Resimli Sözlük: albümdeki kartın "Sözlük" düğmesinden açılır; geri, albümde o harfin sayfasına döner. */
let sozlukHarfi = '';
function sozlukGoster(id: string) {
  temizle(); ekran = 'sozluk'; isaretle(); sozlukHarfi = id;
  alan.innerHTML = ust('Türkçe', rafSayaci()) + '<div class="at-sozluk-icerik"></div>';
  const geri = alan.querySelector<HTMLButtonElement>('.at-geri')!;
  geri.setAttribute('aria-label', 'Albüme dön'); geri.querySelector('span')!.textContent = 'Albüm';
  geri.onclick = () => albumGoster(sozlukHarfi);
  birak = sozlukKur(alan.querySelector<HTMLElement>('.at-sozluk-icerik')!, id, kayit.biten, kayit.renkler, cerenKonus, cerenSustur);
  odak();
}
function kurabiyeGoster() {
  temizle(); ekran = 'kurabiye'; isaretle();
  alan.innerHTML = ust('Mino’nun Harf Kurabiyesi', '') + '<section class="at-hece-oyun-alani"></section>';
  const geri = alan.querySelector<HTMLButtonElement>('.at-geri')!;
  geri.setAttribute('aria-label', 'Albüme dön'); geri.querySelector('span')!.textContent = 'Albüm';
  geri.onclick = () => albumGoster();
  birak = kurabiyeKur(alan.querySelector<HTMLElement>('.at-hece-oyun-alani')!, cerenKonus, kayit.biten, kucukGrup ? '2-3' : '4', () => albumGoster());
  odak();
}
function sonucGoster() {
  temizle(); ekran = 'son'; isaretle();
  // Öğrenme sırasında bu harften sonraki bitmemiş harf (harf-sirasi.ts).
  const sonraki = sonrakiHarf(ders.id, kayit.biten);
  const siradaki = sonraki ? dersler.find(h => h.id === sonraki) : undefined;
  alan.innerHTML = ust('Türkçe', rafSayaci()) +
    '<section class="ka-son"><h1>' + ders.upper + ' harfini tamamladın!</h1>' +
    '<div class="ka-kitap"><div class="ka-sayfalar"><button type="button" class="ka-cikartma" aria-label="' + ders.example + ' kartını yapıştır">' +
    harfYazisi(ders,kayit.renkler[ders.id]) + '<img src="' + resim(ders.id) + '" alt="" draggable="false"><span>' + ders.example +
    '</span></button><button type="button" class="ka-yer">' + IKON.resim + 'Buraya yapıştır</button></div></div>' +
    '<div class="ka-kumanda" hidden><button type="button" class="at-sec">Albümümü aç</button>' +
    (siradaki ? '<button type="button" class="at-basla">' + siradaki.upper + ' harfine geç ' + IKON.oyna + '</button>' : '') + '</div></section>';
  const kart = alan.querySelector<HTMLButtonElement>('.ka-cikartma')!;
  const yer = alan.querySelector<HTMLButtonElement>('.ka-yer')!;
  // Sayaç kart yapışınca bir artar (ders-sonu-ani.ts); o ana kadar bir eksik görünür.
  sayaciBekletme(alan, kayit.biten.length);
  let aniDurdur: (() => void) | undefined, kutlamaDurdur: (() => void) | undefined, kutlamaZamani = 0;
  let hareket: Animation | undefined, parmak: {id:number;x:number;y:number} | undefined, suruklendi=false, yapisti=false;
  let yerDokunusuIptal=false;
  const olaylar=new AbortController();
  function vazgec(){
    if(!parmak)return;
    const id=parmak.id;parmak=undefined;suruklendi=true;kart.style.translate='';
    if(kart.hasPointerCapture(id))kart.releasePointerCapture(id);
  }
  window.addEventListener('resize',vazgec,{signal:olaylar.signal});
  document.addEventListener('pointerdown',e=>{if(!e.isPrimary)vazgec();},{capture:true,signal:olaylar.signal});
  function yerlestir() {
    if (yapisti) return;
    yapisti=true;
    const a = kart.getBoundingClientRect();
    kart.style.translate='';
    kart.style.gridColumn='2'; kart.style.gridRow='1'; yer.style.gridColumn='1'; yer.style.gridRow='1';
    yer.disabled=true; yer.textContent=''; yer.append(Object.assign(document.createElement('strong'),{textContent:ders.upper+' '+ders.lower}));
    yer.append(Object.assign(document.createElement('span'),{textContent:'Albümümde!'}));
    alan.querySelector('.ka-sayfalar')!.classList.add('yapisti');
    const hedef=kart.getBoundingClientRect();
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hareket=kart.animate([{transform:'translate('+(a.left-hedef.left)+'px,'+(a.top-hedef.top)+'px) rotate(-3deg)'},{transform:'translate(0,0) rotate(0)'}],{duration:340,easing:'ease-out'});
    }
    aniDurdur=albumeYapistirAni(alan,kart,kayit.biten.length);
    // 29 harfin sonuncusu: albüm anından sonra kutlama açılır (Astra Harf-H5 çizimleri gelince; kutlama.ts).
    if (kayit.biten.length === dersler.length && kutlamaHazirMi()) kutlamaZamani = window.setTimeout(() => { kutlamaDurdur = kutlamaGoster(() => albumGoster(ders.id)); }, 2300);
    kayit.bekleyen=kayit.bekleyen.filter(d => d!==ders.id); sakla(); yeniBiten=ders.id;
    if (kayit.biten.length === dersler.length) alan.querySelector('.ka-son h1')!.textContent='29 harfi de tamamladın!';
    const kumanda=alan.querySelector<HTMLElement>('.ka-kumanda')!;
    kumanda.hidden=false;
    kumanda.querySelector<HTMLButtonElement>('.at-sec')!.onclick=()=>albumGoster(ders.id);
    if (siradaki) kumanda.querySelector<HTMLButtonElement>('.at-basla')!.onclick=()=>dersAc(siradaki.id);
    kart.setAttribute('aria-label',ders.example+' kelimesini dinle');
    kart.onclick=()=>cerenKonus(ders.id+'-label');
    cerenKonus(ders.id+'-label');
  }
  yer.onpointerdown=e=>{yerDokunusuIptal=!e.isPrimary;};
  yer.onclick=e=>{if(e.detail===0||!yerDokunusuIptal)yerlestir();};
  kart.onclick=e=>{if(!suruklendi || e.detail===0)yerlestir();};
  kart.onpointerdown=e=>{
    if(!e.isPrimary){suruklendi=true;return;}
    if(yapisti||e.button!==0||parmak)return;
    suruklendi=false;parmak={id:e.pointerId,x:e.clientX,y:e.clientY};kart.setPointerCapture(e.pointerId);
  };
  kart.onpointermove=e=>{
    if(parmak?.id!==e.pointerId)return;
    const x=e.clientX-parmak.x,y=e.clientY-parmak.y;
    if(Math.hypot(x,y)<7 && !suruklendi)return;
    suruklendi=true;kart.style.translate=x+'px '+y+'px';
  };
  kart.onpointerup=e=>{
    if(parmak?.id!==e.pointerId)return;
    parmak=undefined;
    if(!suruklendi)return;
    const r=yer.getBoundingClientRect();
    if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom)yerlestir();
    else kart.style.translate='';
  };
  kart.onlostpointercapture=kart.onpointercancel=e=>{if(parmak?.id===e.pointerId)vazgec();};
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  birak=()=>{olaylar.abort();vazgec();hareket?.cancel();aniDurdur?.();clearTimeout(kutlamaZamani);kutlamaDurdur?.();}; odak(); cerenKonus('album-done');
}

geriDinle(() => { if (ekran === 'raf') return false; if(ekran==='evler'){alan.querySelector<HTMLButtonElement>('.at-geri')?.click();return true;} if(ekran==='kurabiye'){albumGoster();return true;} if(ekran==='sozluk'){albumGoster(sozlukHarfi);return true;} if(!kucukGrup&&(ekran==='pano'||ekran==='trambolin'||ekran==='kopru'||ekran==='posta'))heceGoster();else rafGoster(); return true; });
window.addEventListener('pagehide', temizle);
window.addEventListener('pageshow', e => {
  if(!e.persisted)return;
  if(ekran==='ders')dersAc(ders.id);
  else if(ekran==='pano'||ekran==='trambolin'||ekran==='kopru'||ekran==='posta')heceDali(ekran);
  else if(ekran==='hece')heceGoster();
  else if(ekran==='kurabiye')kurabiyeGoster();
  else if(ekran==='sozluk')sozlukGoster(sozlukHarfi);
  else if(ekran==='evler')heceEvleriGoster();
  else if(ekran==='son' && kayit.bekleyen.includes(ders.id))sonucGoster();
});
// Ortak önizlemede başka bir oyunun dosyaları değiştiğinde Vite sayfanın
// tamamını yenileyebilir. Yalnız bu durumda açık etkinliğe geri dön.
const onizlemeAnahtari='minkino-alfabe-onizleme-ekrani';
function onizlemeyiSurdur(){
  if(!import.meta.hot)return false;
  import.meta.hot.on('vite:beforeFullReload',olay=>{
    if(olay.path?.endsWith('.html')&&olay.path!=='/index.html'&&olay.path!=='/alfabe/index.html')return;
    try{sessionStorage.setItem(onizlemeAnahtari,JSON.stringify({ekran,id:ders.id,zaman:Date.now()}));}catch{}
  });
  try{
    const ham=sessionStorage.getItem(onizlemeAnahtari);
    sessionStorage.removeItem(onizlemeAnahtari);
    if(!ham)return false;
    const eski=JSON.parse(ham);
    if(!Number.isFinite(eski.zaman)||Date.now()-eski.zaman>15000)return false;
    if(eski.ekran==='pano'||eski.ekran==='trambolin'){heceDali(eski.ekran);return true;}
    if(eski.ekran==='hece'){heceGoster();return true;}
    if(eski.ekran==='evler'){heceEvleriGoster();return true;}
    if(eski.ekran==='album'){albumGoster();return true;}
    if((eski.ekran==='ders'||eski.ekran==='son')&&gecerli(eski.id)){
      if(eski.ekran==='son'&&!kayit.bekleyen.includes(eski.id)){albumGoster(eski.id);return true;}
      dersAc(eski.id);return true;
    }
  }catch{}
  return false;
}
/** Tamamlama kutlaması: çocuğun kendi yazdığı 29 harf panoya dizilir (kutlama.ts). Kapanınca sonra() çağrılır. */
function kutlamaGoster(sonra: () => void, tur: 'harfler' | 'anahtarlar' = 'harfler'): () => void {
  let kapat = () => {};
  const parcalar = tur === 'harfler' ? dersler.map(d => harfYazisi(d, kayit.renkler[d.id])) : UNSUZLER.map(u => u.toLocaleUpperCase('tr'));
  kapat = kutlamaKur(alan, { tur, parcalar, oku: cerenKonus,
    donusYazisi: tur === 'harfler' ? 'Albümüme dön' : 'Harflere dön', bitti: () => { kapat(); cerenSustur(); sonra(); } });
  return () => kapat();
}
// Test kipinde kutlama doğrudan açılabilir (?test=1&kutlama=harfler): çizimler gelmeden akış denetlensin.
function kutlamaBaglantisiniAc(){
  const tur=TEST_MODU?new URLSearchParams(location.search).get('kutlama'):null;
  if(tur!=='harfler'&&tur!=='anahtarlar')return false;
  rafGoster();
  birak=kutlamaGoster(rafGoster,tur);
  return true;
}
function resimBaglantisiniAc(){
  const id=new URLSearchParams(location.search).get('resimde-bul');
  const secilen=dersler.find(h=>h.id===id);
  if(!secilen)return false;
  rafGoster();
  if(!harfeErisim(secilen.id))return true;
  ders=secilen; adim=8; ekran='ders'; isaretle();
  alan.innerHTML=ust(ders.upper+' '+ders.lower,'')+'<section class="at-sahne at-sahne-8"><div class="at-oyun"></div></section>';
  alan.querySelector<HTMLButtonElement>('.at-geri')!.onclick=rafGoster;
  birak=resimdeBulKur(alan.querySelector<HTMLElement>('.at-oyun')!,ders,rafGoster,'Harflere dön');
  odak();
  return true;
}
if(!onizlemeyiSurdur() && !kutlamaBaglantisiniAc() && !resimBaglantisiniAc())rafGoster();

