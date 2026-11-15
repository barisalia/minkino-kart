import { erisimVarMi, kilitGoster } from '../../src/abonelik/kilit';
import { kilitli } from '../../src/engine/erisim';
import { sayiKulesi, boncuklariCal, boncukSesiniKes } from './sayi-oyuncaklari';
import { durum as uygulamaDurumu, yukle } from '../../src/engine/ilerleme';
import { MENU_YASLARI, menuYasiOku, menuYasiniSec } from '../../src/engine/menu-yas';
import sozler from './sozler.json';
import { koseler, adlar, durum, kaydet, sifirla, son, minik, dortYas, seviyeyiYukle, turNumarasi, type Kose } from './kayit';
import { calgiSesi } from '../../src/audio/bando';
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { konus, sus, sesiAc } from '../../src/audio/ses';
import { geriDinle, arkaPlanDinle } from '../../src/kabuk/yon';
import { anaMenuyeDon } from '../../src/uygulama';
import { rakamAtolyesi } from './rakam';
import { misketParkuru } from './misket';
import './stil.css';
import { gezginOyna } from './tangram';
import './tangram.css';
const kok = document.querySelector<HTMLElement>('#sahne')!;
const dikTelefon = matchMedia('(orientation: portrait) and (width < 600px)');
const kaynak = import.meta.glob<string>(
  [
    '../../assets/matematik/*.webp',
    '!../../assets/matematik/{dere,misket-kutu,misket-cark}.webp',
    '../../assets/hazirlik/kres/{tekne-govde,tekne-direk,tekne-yelken}.webp',
    '../../assets/sef/{piknik/sepet,arabali-servis/araba}.webp',
    '../../assets/canlan/{kelebek,balik,tavsan,ev}.webp',
    '../../assets/hazirlik/dugmeler/{ev,beste-oynat,oda-sol,oda-sag,dinle,tamam,tekrar,ileri}.webp',
    '../../assets/canlan/ev.webp',
    '../../assets/hazirlik/etkinlik/tohum-*.webp',
    '../../assets/hazirlik/kres/siir-tusu-*.webp',
  ],
  { eager: true, import: 'default', query: '?url' },
);
const url = (s: string) => kaynak['../../assets/' + s + '.webp'];
const meyve = ['elma', 'armut', 'cilek'].map((ad) => 'matematik/' + ad);
const sekil = ['tas', 'ucgen', 'daire'].map((ad) => 'matematik/' + ad);
const yeniBloklar = ['matematik/kare-sari', 'matematik/ucgen-yesil', sekil[2], 'matematik/dikdortgen'];
const lamba = ['gunes', 'ay', 'yildiz', 'zil'].map((s) => 'hazirlik/kres/siir-tusu-' + s);
const fenerAdlari = ['Güneş', 'Ay', 'Yıldız', 'Zil'];
const fenerSesi = (i: number, vurgu = .85) => calgiSesi([3, 4, 3, 5][i], [72, 76, 79, 84][i], vurgu);
const renkler = ['#ff8b70', '#ffcf64', '#79cba8', '#8dc6ff'];
const img = (id: string) => '<img draggable="false" alt="" src="' + url(id) + '">';
const dugmeler = {
  home: 'ev',
  play: 'beste-oynat',
  back: 'oda-sol',
  sound: 'dinle',
  ok: 'tamam',
  again: 'tekrar',
};
const glyph = (name: keyof typeof dugmeler) => img('hazirlik/dugmeler/' + dugmeler[name]);
let k: Kose = 'sayi',
  sahne = 'menu',
  metin = '',
  kilit = false,
  timer = 0,
  oturum = 0;
let ses: HTMLAudioElement | undefined;
let ipucunuTekrarla: (() => void) | undefined;
let yardimSaati = 0;
const recordings = import.meta.glob<string>('../../assets/matematik/ses/*.mp3', {
  eager: true,
  import: 'default',
  query: '?url',
});
function susArtik() {
  sus();
  ses?.pause();
  ses = undefined;
}
function soyle(m: string) {
  susArtik();
  if (document.hidden || dikTelefon.matches || !uygulamaDurumu.i.ayarlar.konusma) return;
  const id = sozler.indexOf(m);
  const yol = recordings['../../assets/matematik/ses/ses-' + id + '.mp3'];
  if (yol) {
    ses = new Audio(yol);
    ses.volume = Math.max(0, Math.min(1, uygulamaDurumu.i.ayarlar.seviye));
    void ses.play().catch(() => {});
  } else void konus(m);
}
function adediOku(n: number) {
  const ad = ['Sıfır.', 'Bir.', 'İki.', 'Üç.', 'Dört.', 'Beş.', 'Altı.', 'Yedi.', 'Sekiz.', 'Dokuz.', 'On.'][
    n
  ];
  if (ad) soyle(ad);
}
function buton(parent: Element, ad: string, ic: string, fn: () => void, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.setAttribute('aria-label', ad);
  b.innerHTML = ic;
  b.onclick = () => {
    sesiAc();
    fn();
  };
  parent.append(b);
  return b;
}
function alan(cls: string, ic = '') {
  const e = document.createElement('div');
  e.className = cls;
  e.innerHTML = ic;
  kok.append(e);
  return e;
}
let sahneyiKapat: (() => void) | undefined;
function temiz(s: string, bg: string | null, sesiKoru = false) {
  sahneyiKapat?.(); sahneyiKapat = undefined;
  clearTimeout(yardimSaati);
  delete kok.dataset.bitti;
  oturum++;
  ipucunuTekrarla = undefined;
  clearTimeout(timer);
  if (!sesiKoru) susArtik();
  kilit = false;
  sahne = s;
  kok.classList.remove('liman-sahnesi');
  kok.replaceChildren();
  kok.dataset.ekran = s;
  kok.style.backgroundImage = bg ? 'url("' + url('matematik/' + bg) + '")' : 'none';
}
function nav() {
  if (sahne !== 'menu' || location.protocol !== 'file:')
    buton(
      kok,
      sahne === 'menu' ? 'Ana menü' : 'Atölyeye dön',
      glyph('home'),
      () => (sahne === 'menu' ? anaMenuyeDon() : menu()),
      'nav ev',
    );
  buton(
    kok,
    'Tekrar dinle',
    glyph('sound'),
    () => (ipucunuTekrarla ? ipucunuTekrarla() : soyle(metin)),
    'nav ses',
  );
}
let parkurBaglantisi = new URLSearchParams(location.search).get('oyun') === 'misket';
function menu() {
  boncukSesiniKes();
  // Astra 2026-11-16: oyuncak seçme sahnesi (boş tezgâh + dört oyuncak, assets/matematik/atolye-*)
  temiz('menu', 'atolye-tezgah');
  nav();
  metin = 'Bir oyuncak seç. Birlikte oynayalım.';
  if (location.protocol === 'file:' || menuYasiOku() === null) {
    const yasSec = () => {
      temiz('yas', 'masa');
      const kartlar = alan('atolye-yas');
      kartlar.setAttribute('aria-label', 'Kaç yaşındasın?');
      MENU_YASLARI.forEach(y => buton(kartlar, y === 6 ? '6 yaş ve üzeri' : y + ' yaş',
        y === 6 ? '6+' : String(y), () => {
          menuYasiniSec(y);
          seviyeyiYukle();
          menu();
        }));
      buton(kok, 'Yaş sorusunu dinle', glyph('sound'), () => soyle(sozler[66]), 'nav ses');
      soyle(sozler[66]);
    };
    if (menuYasiOku() === null) { yasSec(); return; }
    buton(kok, 'Yaşı değiştir', menuYasiOku() === 6 ? '6+' : String(menuYasiOku()), yasSec, 'nav ev');
  }
  if (parkurBaglantisi) {
    parkurBaglantisi = false;
    if (parkurYasiUygun() && !kilitli('matematik/olcu')) {
      k = 'olcu';
      misketiAc();
      return;
    }
  }
  // Ana ekran: tezgâhta dört oyuncak (Astra yerleşimi: merkezler %13,5 / %38 / %62,5 / %87, altlık altı %81)
  const raf = alan('atolye-tezgahi');
  koseler.forEach((id, i) => {
    const tur = durum[id];
    const dugme = buton(raf, adlar[id],
      img('matematik/atolye-' + id) + '<b class="oyuncak-adi">' + adlar[id] + '</b>',
      () => {
        // Sayı masası ücretsiz; diğer köşeler premium (src/engine/erisim.ts → matematik/<köşe>)
        if (!erisimVarMi('matematik/' + id, document.body)) return;
        k = id;
        if (tur.adim === son) sifirla(k);
        oyna(true);
      }, 'kose tezgah-oyuncak k' + i);
    kilitGoster(dugme, 'matematik/' + id);
    if (tur.adim > 0) {
      const iz = document.createElement('span');
      iz.className = 'iz';
      iz.style.setProperty('--d', (100 * tur.adim / son) + '%');
      dugme.append(iz);
    }
    if (tur.hatira) dugme.insertAdjacentHTML('beforeend', '<span class="kart-yildiz" aria-hidden="true">★</span>');
  });
}
function hareketIpucu(kaynak: Element, hedef: Element) {
  clearTimeout(yardimSaati);
  const s = oturum;
  yardimSaati = window.setTimeout(() => {
    if (oturum !== s || kilit || document.hidden || !kaynak.isConnected || !hedef.isConnected) return;
    const a = kaynak.getBoundingClientRect(),
      b = hedef.getBoundingClientRect(),
      zemin = kok.getBoundingClientRect();
    const iz = alan('dokunma-izi', img('hazirlik/dugmeler/ileri'));
    iz.setAttribute('aria-hidden', 'true');
    iz.style.left = a.left + a.width / 2 - zemin.left + 'px';
    iz.style.top = a.top + a.height / 2 - zemin.top + 'px';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      iz.remove();
      hedef.classList.add('ipucu-hedef');
      return;
    }
    const dx = b.left + b.width / 2 - a.left - a.width / 2,
      dy = b.top + b.height / 2 - a.top - a.height / 2;
    const oku = iz.firstElementChild as HTMLElement;
    oku.style.rotate = Math.atan2(dy, dx) + 'rad';
    const anim = iz.animate(
      [
        { opacity: 0, translate: '0 0' },
        { opacity: 0.95, offset: 0.16 },
        { opacity: 0.95, offset: 0.78 },
        { opacity: 0, translate: dx + 'px ' + dy + 'px' },
      ],
      { duration: 1400, iterations: 2 },
    );
    anim.onfinish = () => iz.remove();
  }, 6500);
}
function ipucuHedefi(el: Element) {
  el.animate(
    [
      { outline: '3px solid #fdd757', outlineOffset: '3px' },
      { outline: '3px solid transparent', outlineOffset: '3px' },
    ],
    { duration: 900 },
  );
}
function kusSoyle(el: HTMLElement) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  el.getAnimations().forEach(a => a.cancel());
  el.animate([
    { backgroundPositionX: '0%', easing: 'steps(5, end)' },
    { backgroundPositionX: '100%', offset: .84 },
    { backgroundPositionX: '100%' },
  ], { duration: 535 });
}
function ipucu(el: Element, yardim?: string) {
  if (yardim) soyle(yardim);
  oyunSesi('geri');
  el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 280 });
}
function hatirayiGoster() {
  temiz('son', 'masa');
  metin = adlar[k] + ' tamamlandı. Başka bir oyuncak seçebilirsin.';
  nav();
  alan('hatira', img('matematik/hatira-' + k) + glyph('ok'));
  buton(kok, 'Atölyeye dön', glyph('back'), menu, 'bitir');
  soyle(metin);
}
function tamam(sonSoz?: string) {
  if (kilit) return;
  kilit = true;
  clearTimeout(yardimSaati);
  kok.querySelector('.dokunma-izi')?.remove();
  oyunSesi('birles');
  const t = durum[k];
  t.adim++;
  if (t.adim === son) t.hatira = true;
  delete t.tekne; delete t.siparis;
  delete t.araba;
  delete t.tarif;
  delete t.cizim;
  delete t.boncukHazir;
  delete t.oruntuGiris;
  t.yer = 0;
  t.secimler = [];
  kaydet(k);
  kok.dataset.bitti = '1';
  const m = alan('basari', glyph('ok'));
  m.setAttribute('role', 'status');
  m.setAttribute('aria-label', 'Tamamlandı');
  if (sonSoz) soyle(sonSoz);
  const gec = () => {
    delete kok.dataset.bitti;
    if (t.adim === son) hatirayiGoster();
    else oyna(true);
  };
  timer = window.setTimeout(gec, sonSoz ? 6000 : 1000);
  if (sonSoz && ses) {
    const token = oturum;
    ses.addEventListener(
      'ended',
      () => {
        if (oturum !== token || !kilit || document.hidden) return;
        clearTimeout(timer);
        timer = window.setTimeout(gec, 300);
      },
      { once: true },
    );
  } else if (sonSoz) {
    clearTimeout(timer);
    timer = window.setTimeout(gec, 1400);
  }
}
const birakilanKonum = new WeakMap<Element, DOMRect>();
function parcaninKonumu(b: Element) {
  return birakilanKonum.get(b) ?? (b.querySelector('img') ?? b).getBoundingClientRect();
}
function yerineOtur(bas: DOMRect, hedef: Element | null) {
  if (!hedef || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const son = hedef.getBoundingClientRect();
  if (!son.width || !son.height) return;
  const x = bas.left - son.left + (bas.width - son.width) / 2;
  const y = bas.top - son.top + (bas.height - son.height) / 2;
  hedef.animate([
    {translate: x + 'px ' + y + 'px', scale: String(Math.min(2, Math.max(.6, bas.width / son.width)))},
    {translate: '0 -2px', scale: '1', offset: .86},
    {translate: '0 0', scale: '1'},
  ], {duration: 360, easing: 'cubic-bezier(.23,.72,.33,1)'});
}
function surukle(
  b: HTMLButtonElement,
  hedef: (e: PointerEvent) => DOMRect | undefined,
  yap: () => void,
  eksen?: 'yatay',
  kayma?: (dx: number) => void,
) {
  let id = -1,
    x = 0,
    y = 0,
    oynadi = false,
    engelle = false;
  const klik = b.onclick;
  b.onclick = (e) => {
    if (engelle && e.detail) {
      engelle = false;
      return;
    }
    klik?.call(b, e);
  };
  b.onpointerdown = (e) => {
    if (id !== -1 || !e.isPrimary || e.button !== 0 || kilit) return;
    engelle = false;
    kayma?.(0);
    id = e.pointerId;
    x = e.clientX;
    y = e.clientY;
    oynadi = false;
    b.setPointerCapture(id);
  };
  b.onpointermove = (e) => {
    if (e.pointerId !== id) return;
    const dx = e.clientX - x,
      dy = e.clientY - y;
    if (Math.hypot(dx, dy) > 7) oynadi = true;
    if (oynadi) {
      kayma?.(dx);
      b.style.translate = dx + 'px ' + (eksen ? 0 : dy) + 'px';
      b.style.zIndex = '8';
    }
  };
  b.onpointerup = (e) => {
    if (e.pointerId !== id) return;
    id = -1;
    const birakma = oynadi ? (b.querySelector('img') ?? b).getBoundingClientRect() : undefined;
    b.style.translate = '';
    b.style.zIndex = '';
    if (!oynadi) return;
    engelle = true;
    const r = hedef(e);
    if (
      r &&
      e.clientX >= r.left - 10 &&
      e.clientX <= r.right + 10 &&
      e.clientY >= r.top - 10 &&
      e.clientY <= r.bottom + 10
    ) {
      sesiAc();
      if (birakma) birakilanKonum.set(b, birakma);
      try { yap(); } finally { birakilanKonum.delete(b); }
    } else ipucu(b);
  };
  b.onlostpointercapture = b.onpointercancel = (e) => {
    if (e.pointerId !== id) return;
    engelle = oynadi;
    id = -1;
    b.style.translate = '';
    b.style.zIndex = '';
  };
}
function kuleTuru() {
  boncukSesiniKes();
  temiz('kule', 'kule-masasi');
  nav();
  const s = { kok, img, anlat: soyle, say: adediOku,
    sonra: (ms: number, fn: () => void) => { clearTimeout(timer); timer = window.setTimeout(fn, ms); },
    dinle: (fn: () => void) => { ipucunuTekrarla = fn; },
  };
  sahneyiKapat = sayiKulesi(s, () => {
    durum.sayi.kuleTamam = true;
    kaydet('sayi');
    oyna(true);
  }, durum.sayi.tekrar ?? 0);
}
function gezginiAc() {
  temiz('tangram', 'ay-yuzeyi');
  nav();
  const t = durum.sekil;
  sahneyiKapat = gezginOyna(t.gezginBulunan ??= [], {
    kok, resim: img, ucgenleriAra: !minik && !dortYas, sesiAc,
    kaydet: () => kaydet('sekil'),
    anlat: i => soyle(sozler[i]),
    ses: dogru => oyunSesi(dogru ? 'miknatis' : 'geri'),
    tekrar: fn => { ipucunuTekrarla = fn; },
    bitir: () => { delete t.gezginBulunan; tamam(); },
  });
}
function parkurYasiUygun() {
  return (menuYasiOku() ?? 0) >= 5;
}
function misketiAc() {
  if (!parkurYasiUygun()) { menu(); return; }
  temiz('misket', null);
  nav();
  const oyun = misketParkuru({
    kok,
    ileri: img('hazirlik/dugmeler/oda-sag'),
    anlat: i => soyle(sozler[i]), sustur: susArtik,
    devam: basardi => {
      const t = durum.olcu;
      sahneyiKapat?.();
      sahneyiKapat = undefined;
      if (t.adim === son) { hatirayiGoster(); return; }
      t.misketiGecti = true;
      kaydet('olcu');
      if (basardi && t.adim === 0 && !t.secimler.length) tamam();
      else oyna(true);
    },
  });
  sahneyiKapat = oyun.kapat;
  ipucunuTekrarla = oyun.tekrarAnlat;
}
function oyna(sesli = false) {
  if (k === 'olcu' && parkurYasiUygun() && durum.olcu.adim === 0 && !durum.olcu.misketiGecti && !durum.olcu.secimler.length) {
    misketiAc();
    return;
  }
  if (k === 'sekil' && durum.sekil.adim === son - 1) {
    gezginiAc();
    return;
  }
  if (k === 'sayi' && !durum.sayi.kuleTamam) {
    kuleTuru();
    return;
  }
  temiz('oyun', k === 'fener' ? 'tiyatro' : 'masa', !sesli);
  const t = durum[k],
    n = turNumarasi(k, t.adim),
    asama = Math.floor(n / 4),
    tur = n % 4;
  nav();
  const pano = alan('pano'),
    masa = alan('tezgah');
  const bar = alan('ilerleme');
  if (k === 'olcu' && parkurYasiUygun()) buton(kok, 'Misket Şelalesi parkurunu aç', img('matematik/misket-zili'), misketiAc, 'mk-giris');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', adlar[k]);
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(son));
  bar.setAttribute('aria-valuenow', String(t.adim));
  for (let i = 0; i < 4; i++) {
    const pul = document.createElement('i');
    const bolum = Math.floor(t.adim / 4);
    pul.className = i < bolum ? 'dolu' : i === bolum ? 'simdi' : '';
    bar.append(pul);
  }
  const cesit = (t.tekrar ?? 0) + (minik || dortYas ? t.adim : 0);
  const meyveTuru = meyve[t.tarif ?? ((tur + cesit) % meyve.length)];
  const sec = (i: number) => {
    oyunSesi('miknatis');
    t.secimler.push(i);
    kaydet(k);
  };
  const yenile = () => oyna();
  const resimler = (id: string, sayi: number) => img(id).repeat(sayi);
  const hedef = () => (pano.querySelector('.sirada') ?? pano).getBoundingClientRect();
  function secenekler(ids: string[], beklenen: number, bitis: number) {
    ids.forEach((id, i) => {
      const yap = () => {
        if (kilit) return;
        if (i !== beklenen) {
          ipucu(b, asama >= 2 ? sozler[50] : undefined);
          return;
        }
        sec(i);
        if (t.secimler.length >= bitis) {
          const eslesme = pano.querySelector('.sirada');
          if (eslesme) {
            eslesme.className = 'yuva yerinde';
            eslesme.innerHTML = img(id);
          }
          tamam(asama === 0 ? sozler[42 + i] : undefined);
        } else yenile();
      };
      const b = buton(masa, ['Kare', 'Üçgen', 'Daire', 'Dikdörtgen'][i], img(id), yap, 'parca');
      surukle(b, hedef, yap);
    });
  }
  const onceSaySonraPaylas = n === 9 || n === 13;
  const paylasmayaHazir = t.boncukHazir ?? t.secimler.length > 0;
  if (k === 'sayi' && n === 4 && (t.siparis || !t.secimler.length)) {
    t.siparis = true;
    metin = sozler[72];
    const ilk = cesit % 3, ikinci = (ilk + 1) % 3;
    const liste = [ilk, ikinci];
    if (!minik) liste.push(ilk);
    if (!minik && !dortYas) liste.push(ikinci, (ilk + 2) % 3);
    pano.classList.add('piknik-pazar');
    pano.innerHTML = '<div class="pazar-fis">' + liste.map(i=>img(meyve[i])).join('') + '</div>';
    const sepet = document.createElement('div');
    sepet.className = 'siparis-sepet'; sepet.innerHTML = img('sef/piknik/sepet'); pano.append(sepet);
    t.secimler.forEach((i,j)=>buton(sepet,'Sepetten meyveyi al',img(meyve[i]),()=>{
      if(kilit)return;
      t.secimler.splice(j,1);kaydet(k);yenile();
    },'sepette-meyve'));
    meyve.forEach((id,i)=>{
      const ekle = () => {
        if(kilit)return;
        if(t.secimler.length >= liste.length + 1){soyle(sozler[73]);return;}
        const bas = parcaninKonumu(b);
        sec(i); yenile();
        yerineOtur(bas, kok.querySelector('.sepette-meyve:last-child img'));
      };
      const b=buton(masa,['Elma','Armut','Çilek'][i],img(id),ekle,'parca');
      surukle(b,()=>sepet.getBoundingClientRect(),ekle);
    });
    buton(kok,'Piknik sepetini gönder',glyph('ok'),()=>{
      if(kilit)return;
      const ayni = liste.length === t.secimler.length && meyve.every((_,i)=>
        liste.filter(v=>v===i).length === t.secimler.filter(v=>v===i).length);
      if(!ayni){soyle(sozler[73]);ipucuHedefi(pano.firstElementChild!);return;}
      sepet.classList.add('teslim-edildi');tamam();
    },'onay');
  } else if (k === 'sekil' && n === 0 && (t.tekne || !t.secimler.length)) {
    t.tekne = true;
    const parcalar = ['tekne-govde','tekne-direk','tekne-yelken'];
    const parcaResmi = (i:number)=>img('hazirlik/kres/'+parcalar[i]);
    kok.classList.add('liman-sahnesi');
    kok.style.backgroundImage='url("'+url('matematik/liman')+'")';
    pano.classList.add('tekne-denizi');
    const tekne = document.createElement('div');tekne.className='kurulan-tekne';pano.append(tekne);
    parcalar.forEach((ad,i)=>{
      const kat=document.createElement('span');kat.className=ad+(i<t.secimler.length?' takildi':'');
      kat.innerHTML=parcaResmi(i);tekne.append(kat);
    });
    if(t.secimler.length<3){
      metin=sozler[70];
      [2,0,1].filter(i=>i>=t.secimler.length).forEach(i=>{
        const tak=()=>{
          if(kilit)return;
          if(i!==t.secimler.length){ipucu(b);ipucuHedefi(tekne.children[t.secimler.length]);return;}
          const bas = parcaninKonumu(b);
          sec(i);oyna(t.secimler.length===3);
          yerineOtur(bas, kok.querySelector('.kurulan-tekne .' + parcalar[i] + ' img'));
        };
        const b=buton(masa,['Gövde','Direk','Üçgen yelken'][i],parcaResmi(i),tak,'parca');
        surukle(b,()=>tekne.getBoundingClientRect(),tak);
      });
    } else {
      metin=sozler[71];
      const liman=buton(pano,'Deniz fenerine yanaş',glyph('ok'),yuzdur,'tekne-limani');
      const yelken=buton(tekne,'Tekneyi yüzdür','',()=>ipucuHedefi(liman),'yelken-tut');
      function yuzdur(){
        if(kilit)return;
        const bas = tekne.getBoundingClientRect();
        tekne.style.transition='none';
        tekne.style.translate='';
        tekne.classList.add('limana-git');
        const son = tekne.getBoundingClientRect();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          tekne.animate([{translate:(bas.left-son.left)+'px '+(bas.top-son.top)+'px'},{translate:'0 0'}],{duration:650,easing:'ease-out'});
        }
        tamam();
      }
      let parmak = -1, basX = 0, basY = 0;
      yelken.onpointerdown = e => {
        if (!e.isPrimary || e.button !== 0 || kilit) return;
        parmak=e.pointerId; basX=e.clientX;basY=e.clientY;
        yelken.setPointerCapture(parmak); sesiAc();
      };
      yelken.onpointermove = e => {
        if(e.pointerId!==parmak)return;
        tekne.style.translate=Math.max(-pano.clientWidth*.1,Math.min(pano.clientWidth*.63,e.clientX-basX))+'px '+Math.max(-pano.clientHeight*.18,Math.min(pano.clientHeight*.18,e.clientY-basY))+'px';
      };
      yelken.onpointerup = e => {
        if(e.pointerId!==parmak)return;
        parmak=-1;
        const ulasti=tekne.getBoundingClientRect().right>=liman.getBoundingClientRect().left;
        if(ulasti)yuzdur(); else tekne.style.translate='';
      };
      yelken.onpointercancel=()=>{parmak=-1;tekne.style.translate='';};
    }
  } else if (k === 'sayi' && (n === 2 || n === 5 || (onceSaySonraPaylas && paylasmayaHazir))) {
    const pay = n < 5 ? 1 : n < 13 ? 2 : 3,
      kisi = n < 9 ? 2 : 3;
    metin = sozler[17];
    pano.classList.add('sofra');
    if (!t.secimler.length) {
      const tepsi = alan('piknik-secimi');
      meyve.forEach((id, i) => {
        const b = buton(tepsi, ['Elmalı piknik', 'Armutlu piknik', 'Çilekli piknik'][i], img(id), () => {
          t.tarif = i;
          kaydet(k);
          oyunSesi('kutu');
          yenile();
        });
        b.setAttribute('aria-pressed', String(id === meyveTuru));
      });
    }
    const tabaklar = Array.from({ length: kisi }, (_, i) => {
      const say = t.secimler.filter((x) => x === i).length;
      const b = buton(pano, 'Tabak ' + (i + 1), resimler(meyveTuru, say), () => ver(i), 'tabak');
      return b;
    });
    function ver(i: number) {
      if (kilit) return;
      const tabak = tabaklar[i];
      if (t.secimler.filter((x) => x === i).length >= pay) {
        ipucu(tabak, sozler[54]);
        return;
      }
      sec(i);
      if (t.secimler.length === pay * kisi) {
        tabak.insertAdjacentHTML('beforeend', img(meyveTuru));
        masa.replaceChildren();
        tamam();
      } else yenile();
    }
    const kalan = pay * kisi - t.secimler.length;
    const paylas = () => {
      tabaklar[0].focus();
      tabaklar.forEach(ipucuHedefi);
    };
    const sepet = document.createElement('div');
    sepet.className = 'sepet';
    masa.append(sepet);
    for (let j = 0; j < kalan; j++) {
      buton(sepet, 'Meyveyi tabağa taşı', img(meyveTuru), paylas, 'pay-meyvesi');
    }
    // Dokunarak tabak seçimi ve meyveyi istenen tabağa bırakma aynı işlemi kullanır.
    let secilen = -1;
    sepet.querySelectorAll('button').forEach((meyve) =>
      surukle(
        meyve,
        (e) => {
          secilen = tabaklar.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          });
          return tabaklar[secilen]?.getBoundingClientRect();
        },
        () => ver(secilen),
      ),
    );
  } else if (k === 'sayi' && [3, 7, 10, 14].includes(n)) {
    const hedefM = [
      [2, 4, 6, 8],
      [1, 3, 5, 7],
      [0, 2, 6, 9],
    ][(t.tekrar ?? 0) % 3][asama];
    metin = sozler[20];
    pano.innerHTML = '<strong>' + hedefM + '</strong>';
    if (t.secimler.length) {
      metin = 'Yeşil noktadan başla. Parmağınla rakamın yolunu izle.';
      pano.innerHTML = hedefM
        ? resimler(meyveTuru, hedefM)
        : '<span class="tabak bos-tabak" aria-label="Boş tabak"></span>';
      masa.classList.add('yazim');
      rakamAtolyesi(
        masa,
        hedefM,
        () => tamam(sozler[31 + hedefM]),
        t.cizim,
        (satir, nokta) => {
          t.cizim = { satir, nokta };
          kaydet(k);
        },
      );
    } else {
      const farklar = [-1, 0, 1];
      for (let i = 0; i < 3; i++) {
        const adet = hedefM === 0 ? (i + tur + asama + 2) % 3 : hedefM + farklar[(i + tur + asama) % 3];
        const b = buton(
          masa,
          'Tabak ' + (i + 1),
          resimler(meyveTuru, adet),
          () => {
            if (kilit) return;
            if (adet === hedefM) {
              sec(i);
              oyna(true);
            } else ipucu(b);
          },
          'tabak',
        );
      }
    }
  } else if (k === 'sekil' && (n === 1 || n === 9) && (!t.secimler.length || t.araba)) {
    metin = sozler[5];
    const parcalar = ['matematik/dikdortgen', 'matematik/daire', 'matematik/tas'];
    const ad = ['Gövde', 'Tekerlek', 'Kare kabin'];
    const yerler = ['govde', 'arka-teker', 'on-teker', 'kabin'];
    const yerinParcasi = [0, 1, 1, 2];
    const araba = document.createElement('div');
    araba.className = 'blok-araba';
    pano.append(araba);
    // Gövdesi hazır küçük araba, iki yaştaki oyuncuyu doğrudan tekerleklere getirir.
    const hazir = minik ? [0] : [];
    const takilan = [...hazir, ...t.secimler];
    const sira = takilan.length;
    if (sira >= yerler.length) { tamam(); return; }
    const gereken = yerinParcasi[sira];
    yerler.forEach((yer, i) => {
      const el = document.createElement('span');
      el.className = yer + (i < sira ? ' takildi' : i === sira ? ' sirada' : '');
      el.innerHTML = img(parcalar[yerinParcasi[i]]);
      araba.append(el);
    });
    const adaylar = minik && gereken === 1 ? [1, 2] : [0, 1, 2];
    adaylar.forEach(i => {
      const tak = () => {
        if (kilit) return;
        if (i !== gereken) {
          ipucu(b);
          ipucuHedefi(araba.children[sira]);
          return;
        }
        const bas = parcaninKonumu(b);
        sec(i);
        t.araba = true;
        kaydet(k);
        if (sira < 3) yenile();
        else {
          araba.children[sira].className = 'kabin takildi';
          araba.classList.add('yola-cik');
          tamam();
        }
        yerineOtur(bas, kok.querySelector('.blok-araba .' + yerler[sira] + ' img'));
      };
      const b = buton(masa, ad[i], img(parcalar[i]), tak, 'parca');
      surukle(b, () => araba.children[sira].getBoundingClientRect(), tak);
    });
  } else if (k === 'sekil' && [4, 5].includes(n)) {
    const kule = n === 4 ? [0, 1] : [3, 0, 1];
    const bloklar = n === 4 ? sekil : yeniBloklar;
    metin = sozler[21];
    pano.classList.add('insaat');
    const bina = (ornek: boolean) => {
      const el = document.createElement('div');
      el.className = 'bina';
      kule.forEach((v, i) => {
        const kat = document.createElement('span');
        kat.className =
          'yapi-kati' +
          (ornek || i < t.secimler.length ? ' yerinde' : ' golge') +
          (!ornek && i === t.secimler.length ? ' sirada' : '');
        kat.innerHTML = img(bloklar[v]);
        el.append(kat);
      });
      pano.append(el);
      return el;
    };
    bina(true);
    const yapi = bina(false);
    bloklar.forEach((id, i) => {
      const kat = yapi.children[t.secimler.length];
      const yerlestir = () => {
        if (kilit) return;
        if (i !== kule[t.secimler.length]) {
          ipucu(b, sozler[49]);
          return;
        }
        sec(i);
        kat.className = 'yapi-kati yerinde';
        if (t.secimler.length === kule.length) tamam();
        else yenile();
      };
      const b = buton(
        masa,
        ['Kare blok', 'Üçgen çatı', 'Daire', 'Dikdörtgen taban'][i],
        img(id),
        yerlestir,
        'parca',
      );
      surukle(b, () => yapi.getBoundingClientRect(), yerlestir);
    });
  } else if (k === 'sekil' && [2, 6, 10, 14].includes(n)) {
    const rotalar = [[0], [2], [1, 0], [2, 1, 0]],
      rota = rotalar[asama],
      konum = rota[t.secimler.length];
    const komut = ['Topu evin soluna koy.', 'Topu evin üstüne koy.', 'Topu evin sağına koy.'];
    metin = komut[konum];
    pano.classList.add('konum-masa');
    pano.innerHTML = '<div class="minik-ev">' + img('canlan/ev') + '</div>';
    const hedefler = komut.map((ad, i) => buton(pano, ad, '', () => birak(i), 'yer-hedef yer-' + i));
    function birak(i: number) {
      if (kilit) return;
      if (i !== konum) {
        ipucu(hedefler[i]);
        return;
      }
      sec(i);
      if (t.secimler.length === rota.length) {
        hedefler[i].innerHTML = img(sekil[2]);
        masa.replaceChildren();
        tamam();
      } else oyna(true);
    }
    if (t.secimler.length) hedefler[t.secimler.at(-1)!].innerHTML = img(sekil[2]);
    const top = buton(
      masa,
      'Topu taşı',
      img(sekil[2]),
      () => {
        hedefler[konum].focus();
        soyle(metin);
      },
      'parca',
    );
    let j = -1;
    surukle(
      top,
      (e) => {
        j = hedefler.findIndex((h) => {
          const r = h.getBoundingClientRect();
          return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
        return hedefler[j]?.getBoundingClientRect();
      },
      () => birak(j),
    );
  } else if (k === 'sekil' && [3, 7, 11, 15].includes(n)) {
    const dizi = asama < 2 ? [0, 1, 2] : [0, 3, 1, 2];
    metin = sozler[22];
    const secim = dizi[t.secimler.length];
    dizi.forEach((v, i) => {
      const el = document.createElement('span');
      el.className =
        'yuva ' + (i < t.secimler.length ? 'yerinde' : i === t.secimler.length ? 'bos sirada' : 'bos');
      if (i < t.secimler.length) el.innerHTML = img('hazirlik/etkinlik/tohum-' + v);
      pano.append(el);
    });
    [...dizi].reverse().forEach((v) => {
      if (t.secimler.includes(v)) return;
      const id = 'hazirlik/etkinlik/tohum-' + v;
      const yap = () => {
        if (kilit) return;
        if (v !== secim) {
          ipucu(b);
          return;
        }
        sec(v);
        if (t.secimler.length === dizi.length) {
          pano.lastElementChild!.innerHTML = img(id);
          tamam();
        } else yenile();
      };
      const b = buton(masa, 'Bitkinin gelişim resmi ' + v, img(id), yap, 'parca');
      surukle(b, hedef, yap);
    });
  } else if (k === 'olcu' && [2, 7, 11, 14].includes(n)) {
    const agirlik = [2, 3, 5, 6][asama];
    metin = 'İki kefeyi dengele. Sağ kefeye taş ekle ya da sağdaki taşı geri al.';
    pano.classList.add('terazi');
    pano.innerHTML =
      '<div class="ayak">' +
      img('matematik/terazi-taban') +
      '</div><div class="kol">' +
      img('matematik/terazi-kol') +
      '</div>';
    const kol = pano.querySelector<HTMLElement>('.kol')!;
    function kefeleriGoster() {
      const egim = Math.max(-8, Math.min(8, (t.yer - agirlik) * 2));
      kol.style.setProperty('--egim', egim + 'deg');
      sagTaslar.innerHTML = resimler(sekil[0], t.yer);
    }
    const kefe = (sagda: boolean) => {
      const el = document.createElement(sagda ? 'button' : 'div');
      el.className = 'kefe ' + (sagda ? 'sag' : 'sol');
      el.innerHTML = img('matematik/terazi-kefe') + '<span></span>';
      if (sagda) {
        el.setAttribute('aria-label', 'Sağ kefeden bir taş al');
        el.onclick = () => tasiDegistir(-1);
      } else el.lastElementChild!.innerHTML = resimler(sekil[0], agirlik);
      kol.append(el);
      return el;
    };
    kefe(false);
    const sagTaslar = kefe(true).lastElementChild!;
    kefeleriGoster();
    function tasiDegistir(fark: number) {
      const yeni = t.yer + fark;
      if (kilit || yeni < 0 || yeni > 8) return;
      t.yer = yeni;
      kaydet(k);
      oyunSesi('kutu');
      kefeleriGoster();
    }
    const ekle = () => {
      if (kilit || t.yer >= 8) return;
      const bas = parcaninKonumu(tas);
      tasiDegistir(1);
      yerineOtur(bas, sagTaslar.lastElementChild);
    };
    const tas = buton(masa, 'Sağ kefeye taş ekle', img(sekil[0]), ekle, 'parca');
    surukle(tas, () => pano.querySelector('.sag')?.getBoundingClientRect(), ekle);
    const ok = buton(
      kok,
      'Teraziyi kontrol et',
      glyph('ok'),
      () => {
        if (kilit) return;
        if (t.yer === agirlik) tamam(sozler[46]);
        else ipucu(ok, sozler[52]);
      },
      'onay',
    );
  } else if (k === 'olcu' && [3, 6, 9, 15].includes(n)) {
    const enAz = asama % 2 === 1;
    metin = sozler[enAz ? 24 : 23];
    const adetler = minik ? [1, 2, 3] : [2, 3 + asama, 5 + asama];
    kok.style.backgroundImage = 'url("' + url('matematik/manav-tezgahi') + '")';
    pano.classList.add('manav-raflari');
    masa.classList.add('manav-teslim');
    masa.innerHTML = '<span class="manav-sepeti" aria-hidden="true">' + img('sef/piknik/sepet') + '</span>';
    const ornek = enAz ? 0 : 2;
    // Son iki turda karşılaştırmadan önce üç rafın eksiğini çocuk tamamlar.
    const dagit = n >= 9 ? [1, 2, 0] : [];
    const bekleyen = dagit.slice(t.secimler.length);
    if (bekleyen.length) metin = sozler[51];
    const sutunlar: HTMLButtonElement[] = [];
    const meyveAdlari = ['Elma', 'Armut', 'Çilek'];
    const kapasite = Math.max(...adetler);
    pano.style.setProperty('--goz', String(kapasite));
    for (let i = 0; i < 3; i++) {
      const idx = (i + tur + asama) % 3;
      const eksik = Number(bekleyen.includes(i));
      const b = buton(
        pano,
        meyveAdlari[i] + ' rafı',
        '<span class="manav-gozleri">' + Array.from({length: kapasite}, (_, goz) =>
          '<span>' + (goz < adetler[idx] - eksik ? img(meyve[i]) : '') + '</span>'
        ).join('') + '</span>',
        () => {
          if (kilit) return;
          if (bekleyen.length) {
            yerlestir(i);
            return;
          }
          if (idx === ornek) {
            b.classList.add('manav-secildi');
            adediOku(adetler[idx]);
            tamam();
          } else ipucu(b, sozler[48]);
        },
        'sutun',
      );
      b.style.backgroundImage = 'url("' + url('matematik/manav-rafi') + '")';
      sutunlar.push(b);
    }
    function yerlestir(i: number) {
      if (kilit || !bekleyen.length) return;
      if (i !== bekleyen[0]) {
        ipucu(sutunlar[i]);
        return;
      }
      const kaynak = masa.querySelector('button');
      const bas = kaynak && parcaninKonumu(kaynak);
      sec(i);
      oyna(bekleyen.length === 1);
      const raf = kok.querySelectorAll('.sutun')[i];
      const meyveler = raf.querySelectorAll('img');
      if (bas) yerineOtur(bas, meyveler[meyveler.length - 1]);
    }
    if (bekleyen.length) {
      const tasinacak = bekleyen[0];
      const meyveDugmesi = buton(
        masa,
        meyveAdlari[tasinacak] + ' meyvesini rafa taşı',
        img(meyve[tasinacak]),
        () => { soyle(metin); hareketIpucu(meyveDugmesi, sutunlar[tasinacak]); },
        'manav-meyvesi',
      );
      let j = -1;
      surukle(
        meyveDugmesi,
        (e) => {
          j = sutunlar.findIndex((el) => {
            const r = el.getBoundingClientRect();
            return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          });
          return sutunlar[j]?.getBoundingClientRect();
        },
        () => yerlestir(j),
      );
    }
  } else if (k === 'fener' && (n === 10 || n === 14)) {
    const kus = alan('kukla-kusu besteci-kus');
    kus.setAttribute('aria-hidden', 'true');
    const uzunluk = n === 10 ? 2 : 3;
    const hazir = t.secimler.length >= uzunluk;
    metin = hazir ? sozler[59] : sozler[n === 10 ? 57 : 58];
    pano.classList.add('beste');
    const partisyon = document.createElement('div');
    partisyon.className = 'partisyon';
    pano.append(partisyon);
    for (let i = 0; i < uzunluk * 2; i++) {
      const yuva = document.createElement('span');
      yuva.className = 'nota-yeri' + (i === t.secimler.length ? ' sirada' : '');
      if (i < t.secimler.length) yuva.innerHTML = img(lamba[t.secimler[i]]);
      partisyon.append(yuva);
    }
    function nota(i: number, yuva: Element) {
      kusSoyle(kus);
      fenerSesi(i);
      yuva.animate([{ backgroundColor: '#ffed8a' }, { backgroundColor: '#fff3cd' }], { duration: 450 });
    }
    function dinlet() {
      if (kilit || !t.secimler.length) {
        if (!kilit) soyle(metin);
        return;
      }
      clearTimeout(timer);
      susArtik();
      masa.inert = true;
      const tok = oturum;
      let i = 0;
      function cal() {
        if (tok !== oturum || document.hidden || uygulamaArkada) return;
        if (i >= Math.min(uzunluk, t.secimler.length)) {
          masa.inert = false;
          return;
        }
        nota(t.secimler[i], partisyon.children[i]);
        i++;
        timer = window.setTimeout(cal, 650);
      }
      cal();
    }
    lamba.slice(0, minik ? 2 : dortYas ? 3 : 4).forEach((id, i) => {
      const b = buton(
        masa,
        'Fener ' + (i + 1),
        img(id),
        () => {
          if (kilit || masa.inert) return;
          if (!hazir && t.secimler.includes(i)) {
            ipucu(b, sozler[60]);
            return;
          }
          if (hazir && i !== t.secimler[t.secimler.length - uzunluk]) {
            ipucu(b);
            dinlet();
            return;
          }
          const yer = partisyon.children[t.secimler.length];
          t.secimler.push(i);
          kaydet(k);
          nota(i, yer);
          yer.innerHTML = img(id);
          if (t.secimler.length === 2 * uzunluk) {
            const dizi = [...t.secimler];
            kilit = true;
            masa.inert = true;
            let j = 0;
            const tok = oturum;
            const cal = () => {
              if (tok !== oturum || document.hidden || uygulamaArkada) return;
              if (j === dizi.length) {
                kilit = false;
                tamam(sozler[61]);
                return;
              }
              nota(dizi[j], partisyon.children[j]);
              j++;
              timer = window.setTimeout(cal, 420);
            };
            timer = window.setTimeout(cal, 550);
          } else oyna(t.secimler.length === uzunluk);
        },
        'parca',
      );
    });
    // Tamamlanan bestenin çalınışı sırasında sayfa kapanırsa ilerleme yine kaybolmaz.
    if (t.secimler.length >= 2 * uzunluk) {
      tamam(sozler[61]);
      return;
    }
    if (t.secimler.length) {
      buton(pano, 'Kendi sıranı dinle', glyph('play'), dinlet, 'beste-dinle');
    }
  } else if (k === 'fener' && ([3, 7, 11, 15].includes(n) || (t.adim === 0 && !t.tekrar && (!t.secimler.length || t.oruntuGiris)))) {
    const ilkOyun = t.adim === 0;
    if (ilkOyun) t.oruntuGiris = true;
    const motifler = [[0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 2]];
    const motif = motifler[asama];
    const cesitSayisi = ilkOyun || minik ? 2 : asama === 3 ? 4 : 3;
    const ilk = (t.tekrar ?? 0) + (minik || dortYas ? t.adim : asama);
    const sembol = (v: number) => (ilk + v) % lamba.length;
    const dizi = Array.from({length: motif.length * (minik || !asama ? 2 : 3)}, (_, i) => sembol(motif[i % motif.length]));
    const bosAdet = [1, 2, 2, 3][asama];
    const ilkBos = dizi.length - bosAdet;
    metin = sozler[ilkOyun ? 77 : bosAdet === 1 ? 75 : 76];
    pano.classList.add('kus-partisyonu');
    masa.classList.add('muzik-tuslari');
    const sahneKusu = alan('muzik-kuklasi', '<span class="kukla-kusu"></span><span class="asili-fener">' + img('matematik/hatira-fener') + '</span><span class="cubuklu-kukla"></span>');
    sahneKusu.setAttribute('aria-hidden', 'true');
    const kus = sahneKusu.firstElementChild as HTMLElement;
    const kukla = sahneKusu.lastElementChild as HTMLElement;
    kukla.innerHTML = img(lamba[dizi[0]]);
    const hucreler: HTMLElement[] = [];
    for (let i = 0; i < dizi.length; i += motif.length) {
      const olcu = document.createElement('div');
      olcu.className = 'nota-grubu';
      pano.append(olcu);
      for (let j = 0; j < motif.length; j++) {
        const hucre = document.createElement('span');
        hucre.className = 'ritim-yuvasi';
        const sira = i + j;
        if (sira < ilkBos + t.secimler.length) hucre.innerHTML = img(lamba[dizi[sira]]);
        else hucre.classList.add('bos-nota');
        olcu.append(hucre);
        hucreler.push(hucre);
      }
    }
    const token = oturum;
    let bekleyenSes: HTMLAudioElement | undefined;
    function vurus(i: number) {
      const nota = dizi[i];
      pano.querySelector('.vurus')?.classList.remove('vurus');
      hucreler[i].classList.add('vurus');
      kusSoyle(kus);
      sahneKusu.style.setProperty('--isik', renkler[nota]);
      kukla.innerHTML = img(lamba[nota]);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        kukla.getAnimations().forEach(a => a.cancel());
        kukla.animate([{translate:'0 65%', rotate:'-8deg'}, {translate:'0 -3%', offset:.7}, {translate:'0 0', rotate:'0deg'}], { duration:330 });
      }
      fenerSesi(nota, i % motif.length === 0 ? .95 : .75);
    }
    function akisiKes() {
      clearTimeout(timer);
      if (bekleyenSes) bekleyenSes.removeEventListener('ended', ornek);
      bekleyenSes = undefined;
      pano.querySelector('.vurus')?.classList.remove('vurus');
    }
    function dinlet(final: boolean) {
      akisiKes();
      susArtik();
      if (final) { kilit = true; masa.inert = true; sahneKusu.classList.add('konser'); }
      const adet = final ? dizi.length : ilkOyun ? ilkBos : motif.length;
      let sira = 0;
      function ilerle() {
        if (oturum !== token || document.hidden || uygulamaArkada) return;
        if (sira === adet) {
          pano.querySelector('.vurus')?.classList.remove('vurus');
          if (final) { kilit = false; tamam(sozler[61]); }
          return;
        }
        vurus(sira++);
        timer = window.setTimeout(ilerle, (minik ? 670 : 540) + (sira % motif.length === 0 ? 175 : 0));
      }
      ilerle();
    }
    function ornek() {
      if (oturum === token && !kilit && !document.hidden && !uygulamaArkada) dinlet(false);
    }
    function sirayiGoster() {
      pano.querySelector('.sirada')?.classList.remove('sirada');
      hucreler[ilkBos + t.secimler.length]?.classList.add('sirada');
    }
    sirayiGoster();
    const tuslar = Array.from({length: cesitSayisi}, (_, i) => sembol((i + 1) % cesitSayisi));
    tuslar.forEach(nota => {
      function yerlestir() {
        if (kilit) return;
        akisiKes();
        const i = ilkBos + t.secimler.length;
        if (nota !== dizi[i]) { ipucu(b); ornek(); return; }
        susArtik();
        const yer = hucreler[i];
        yer.innerHTML = img(lamba[nota]);
        yer.classList.remove('bos-nota');
        t.secimler.push(nota);
        kaydet(k);
        vurus(i);
        sirayiGoster();
        if (t.secimler.length === bosAdet) {
          kilit = true;
          timer = window.setTimeout(() => dinlet(true), 650);
        }
      }
      const b = buton(masa, fenerAdlari[nota], img(lamba[nota]), yerlestir, 'parca muzik-tusu');
      b.style.setProperty('--tus', renkler[nota]);
      surukle(b, () => pano.querySelector('.sirada')?.getBoundingClientRect(), yerlestir);
    });
    ipucunuTekrarla = ornek;
    if (t.secimler.length >= bosAdet) dinlet(true);
    else if (sesli) {
      soyle(metin);
      bekleyenSes = ses;
      bekleyenSes?.addEventListener('ended', ornek, {once: true});
      timer = window.setTimeout(ornek, bekleyenSes ? 12000 : 550);
    }
  } else if (k === 'sayi' && [8, 11, 12, 15].includes(n)) {
    const cikar = n >= 12,
      a = cikar ? (n === 15 ? 10 : 6) : n === 8 ? 2 : 4,
      b = n === 8 ? 2 : n === 11 ? 3 : n === 12 ? 2 : 4,
      istenen = cikar ? a - b : a + b;
    metin = sozler[cikar ? 19 : 18];
    const sag = t.secimler.length,
      sol = cikar ? a - sag : a + sag;
    const kutu = document.createElement('div');
    kutu.className = 'meyve-kasa';
    kutu.innerHTML = resimler(meyve[0], sol);
    pano.append(kutu);
    if (cikar) {
      const istek = document.createElement('span');
      istek.className = 'siparis';
      istek.textContent = String(istenen);
      kutu.prepend(istek);
    }
    const tasinacak = cikar ? sol : b - sag;
    const nesne = document.createElement('div');
    nesne.className = 'meyve-kasa ikinci';
    nesne.innerHTML = resimler(meyve[0], cikar ? sag : tasinacak);
    masa.append(nesne);
    const kaynakKasa = cikar ? kutu : nesne,
      hedefKasa = cikar ? nesne : kutu;
    const aktar = () => {
      if (kilit) return;
      sec(0);
      if (!cikar && t.secimler.length === b) {
        adediOku(istenen);
        hedefKasa.insertAdjacentHTML('beforeend', img(meyve[0]));
        kaynakKasa.replaceChildren();
        tamam();
      } else yenile();
    };
    kaynakKasa.querySelectorAll('img').forEach((el) => {
      const btn = buton(kaynakKasa, 'Bir elma taşı', el.outerHTML, aktar, 'meyve-tane');
      el.remove();
      surukle(btn, () => hedefKasa.getBoundingClientRect(), aktar);
    });
    if (cikar) {
      const geri = () => {
        if (kilit || !sag) return;
        t.secimler.pop();
        kaydet(k);
        yenile();
      };
      nesne.querySelectorAll('img').forEach((el) => {
        const dugme = buton(nesne, 'Bir elmayı geri taşı', el.outerHTML, geri, 'meyve-tane');
        surukle(dugme, () => kutu.getBoundingClientRect(), geri);
        el.remove();
      });
      const onay = buton(
        kok,
        'Kalanı kontrol et',
        glyph('ok'),
        () => {
          if (sol === istenen) {
            adediOku(sol);
            tamam();
          } else ipucu(onay, sozler[53]);
        },
        'onay',
      );
    }
  } else if (k === 'sayi') {
    const hedefSayi = [1, 2, 3, 2, 3, 4, 5, 4, 5, 6, 7, 8, 7, 9, 9, 10][n],
      hazir = asama === 2 ? hedefSayi - 2 : asama === 3 ? 10 : 0,
      adet = asama < 2 ? 5 : 10;
    const say = t.secimler.length ? t.yer : hazir;
    metin =
      asama === 2
        ? 'Boncukların bir kısmı hazır. Her meyveye bir boncuk olacak kadar ekle.'
        : asama === 3
          ? 'Fazla boncukları geri kaydır. Her meyve için bir boncuk kalsın.'
          : 'Her meyve için bir boncuğu sola kaydır. Bitince onayla.';
    pano.classList.add('say-kumesi');
    const sayilanlar = new Set<HTMLButtonElement>();
    for (let i = 0; i < hedefSayi; i++) {
      const meyveDugmesi = buton(pano, (i + 1) + '. meyveyi say', img(meyveTuru), () => {
        if (kilit) return;
        if (sayilanlar.size === hedefSayi) {
          sayilanlar.forEach(el => el.removeAttribute('data-sira'));
          sayilanlar.clear();
        }
        if (!sayilanlar.has(meyveDugmesi)) {
          sayilanlar.add(meyveDugmesi);
          meyveDugmesi.dataset.sira = String(sayilanlar.size);
        }
        adediOku(Number(meyveDugmesi.dataset.sira));
      }, 'say-meyvesi');
      if (i < say) meyveDugmesi.classList.add('sayildi');
    }
    masa.classList.add('abakus');
    // Her telde beş boncuk var. İtilen boncuk yanındakileri de birlikte taşır.
    const teller: HTMLDivElement[] = [];
    for (let tel = 0; tel < adet / 5; tel++) {
      const ray = document.createElement('div');
      ray.className = 'boncuk-teli';
      ray.innerHTML = '<div class="cubuk"></div>';
      masa.append(ray);
      teller.push(ray);
    }
    const dagilim =
      t.secimler.length === teller.length + 1 && t.secimler[0] === 0
        ? t.secimler.slice(1)
        : teller.map((_, j) => Math.max(0, Math.min(5, say - j * 5)));
    for (let i = 0; i < adet; i++) {
      const j = Math.floor(i / 5),
        sira = i % 5,
        sol = sira < dagilim[j],
        tel = teller[j];
      let duyulan = 0;
      const eski = dagilim[j], yeni = sol ? sira : sira + 1;
      const yap = () => {
        if (kilit) return;
        const konumlar = Array.from(
          masa.querySelectorAll('.boncuk'),
          (el) => el.getBoundingClientRect().left,
        );
        boncuklariCal(j, eski, yeni, duyulan);
        dagilim[j] = yeni;
        t.yer = dagilim.reduce((a, b) => a + b, 0);
        if (onceSaySonraPaylas) t.boncukHazir = false;
        t.secimler = [0, ...dagilim];
        kaydet(k);
        yenile();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          kok.querySelectorAll('.boncuk').forEach((el, idx) => {
            const dx = konumlar[idx] - el.getBoundingClientRect().left;
            if (dx)
              el.animate([{ translate: dx + 'px 0' }, { translate: '0 0' }], {
                duration: 200,
                easing: 'ease-out',
              });
          });
        }
        adediOku(t.yer);
      };
      const b = buton(
        tel,
        sol ? 'Bir boncuk geri al' : 'Bir boncuk sola kaydır',
        img('matematik/boncuk'),
        yap,
        'boncuk',
      );
      b.style.left = (sol ? 2 + sira * 12 : 38 + sira * 12) + '%';
      surukle(
        b,
        () => {
          const r = tel.getBoundingClientRect();
          return new DOMRect(sol ? r.left + r.width * 0.5 : r.left, r.top, r.width * 0.5, r.height);
        },
        yap,
        'yatay',
        dx => {
          if (!dx) { duyulan = 0; return; }
          const yol = (sol ? dx : -dx) / Math.max(1, tel.clientWidth * .36);
          const adet = Math.min(Math.abs(yeni-eski), Math.ceil(Math.max(0,yol) * Math.abs(yeni-eski)));
          if (adet > duyulan) {
            sesiAc(); boncuklariCal(j, eski, eski + Math.sign(yeni-eski)*adet, duyulan); duyulan = adet;
          }
        },
      );
    }
    const ok = buton(
      kok,
      'Boncukları kontrol et',
      glyph('ok'),
      () => {
        if (kilit) return;
        if (say === hedefSayi) {
          adediOku(say);
          pano.insertAdjacentHTML('afterbegin', '<strong>' + say + '</strong>');
          if (onceSaySonraPaylas) {
            t.boncukHazir = true;
            t.secimler = [];
            t.yer = 0;
            kaydet(k);
            kilit = true;
            timer = window.setTimeout(() => oyna(true), 1000);
          } else tamam();
        } else {
          const eksik = pano.querySelector('.say-meyvesi:not(.sayildi)');
          const fazla = masa.querySelectorAll('.boncuk[aria-label="Bir boncuk geri al"]');
          const hedef = say < hedefSayi ? eksik : fazla[hedefSayi];
          if (hedef) ipucuHedefi(hedef);
          ipucu(ok);
          soyle(
            say < hedefSayi
              ? 'Bir daha bak. Meyvelerin hepsine boncuk ayırdın mı?'
              : 'Boncuklar meyvelerden fazla. Bir kısmını geri kaydır.',
          );
        }
      },
      'onay',
    );
  } else if (k === 'sekil') {
    const parcalar = minik && t.adim < 4 ? sekil.slice(0, 2) : asama < 2 ? sekil : yeniBloklar;
    const ilk = (tur + cesit + (asama >= 2 ? 3 : 0)) % parcalar.length;
    const ikinci = (ilk + 1) % parcalar.length;
    const seq =
      asama === 0
        ? [ilk]
        : asama === 1
          ? [ilk, ikinci]
          : asama === 2
            ? [ilk, ikinci, ilk, ikinci]
            : [ilk, ilk, ikinci, ilk, ilk, ikinci];
    const sabit = asama < 2 ? 0 : asama === 2 ? 2 : 3,
      ind = sabit + t.secimler.length;
    metin = asama < 2 ? 'Şekli bul. Gölgesinin içine yerleştir.' : 'Diziye bak. Aynı düzeni devam ettir.';
    seq.forEach((v, j) => {
      const el = document.createElement('span');
      el.className =
        'yuva ' + (j < ind ? 'yerinde' : asama < 2 ? 'golge' : 'bos') + (j === ind ? ' sirada' : '');
      if (j < ind || asama < 2) el.innerHTML = img(parcalar[v]);
      pano.append(el);
    });
    secenekler(parcalar, seq[ind], seq.length - sabit);
  } else if (k === 'olcu') {
    const uzun = minik ? 3 : [2, 3, 2, 4, 3, 4, 5, 4, 4, 5, 4, 6, 5, 6, 7, 8][n];
    metin = asama === 3
      ? 'İki kurdeleyi uç uca ölç. Boşluk bırakmadan taşlarını diz.'
      : 'Kurdeleyi baştan sona eşit taşlarla ölç.';
    pano.classList.add('cetvel');
    const top = document.createElement('span');
    top.className = 'kopru-topu';
    top.innerHTML = img(sekil[2]);
    pano.style.setProperty('--n', String(uzun));
    pano.style.setProperty('--ek', (Math.floor(uzun / 2) * 100) / uzun + '%');
    pano.innerHTML =
      '<div class="serit ' +
      (asama === 3 ? 'cift' : '') +
      '"></div><div class="taslar">' +
      Array.from(
        { length: uzun },
        (_, i) =>
          '<i class="' +
          (i < t.secimler.length ? 'var' : '') +
          '">' +
          (i < t.secimler.length ? img(sekil[0]) : '') +
          '</i>',
      ).join('') +
      '</div>';
    const yap = () => {
      if (kilit) return;
      sec(0);
      if (t.secimler.length === uzun) {
        const sonTas = pano.querySelector('.taslar i:not(.var)');
        if (sonTas) {
          sonTas.classList.add('var');
          sonTas.innerHTML = img(sekil[0]);
        }
        pano.classList.add('kopru-tamam');
        tamam(sozler[45]);
      } else yenile();
    };
    const b = buton(masa, 'Bir ölçü taşı yerleştir', img(sekil[0]), yap, 'parca');
    pano.querySelector('.taslar')!.append(top);
    const siradaki = pano.querySelector<HTMLElement>('.taslar i:not(.var)')!;
    siradaki.classList.add('olcu-hedefi');
    surukle(b, () => siradaki.getBoundingClientRect(), yap);
  } else {
    const adet = minik ? (t.adim < 4 ? 1 : 2) : dortYas ? Math.min(3, 2 + asama) : 2 + asama,
      seq = Array.from(
        { length: adet },
        (_, i) => (tur + i + cesit + (asama >= 2 ? Math.floor(i / 2) : 0)) % Math.min(4, asama + 2),
      );
    metin = sozler[78];
    pano.classList.add('isiklar');
    const fenerler = lamba.slice(0, Math.min(4, asama + 2));
    let dinliyor = true;
    const token = oturum;
    const perde = alan('golge-perdesi');
    perde.setAttribute('aria-hidden','true');
    const anlatanKus = alan('kukla-kusu fener-anlatici');
    anlatanKus.setAttribute('aria-hidden', 'true');
    function yak(i: number) {
      perde.innerHTML = img(lamba[i]);
      kusSoyle(anlatanKus);
      perde.style.backgroundColor=['#ffe7a2','#c9e0fb','#acf0db','#ffd4b4'][i];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        perde.firstElementChild!.animate([{translate:'-16% 7%',rotate:'-5deg'},{translate:'8% -3%',rotate:'3deg'},{translate:'0 0',rotate:'0deg'}],{duration:580});
      const l = masa.children[i];
      l?.animate(
        [
          {
            background: '#ffe88b',
            scale: matchMedia('(prefers-reduced-motion: reduce)').matches ? '1' : '1.08',
          },
          { background: '#fff1ce', scale: '1' },
        ],
        { duration: 530 },
      );
      fenerSesi(i);
    }
    fenerler.forEach((id, i) => {
      const l = document.createElement('span');
      l.className = 'fener';
      l.innerHTML = img(id);
      pano.append(l);
      const yap = () => {
        if (dinliyor || kilit) return;
        if (seq[t.secimler.length] !== i) {
          ipucu(b);
          goster();
          return;
        }
        masa.querySelector('.yankila')?.classList.remove('yankila');
        yak(i);
        t.secimler.push(i);
        kaydet(k);
        gosterge();
        if (t.secimler.length === seq.length) tamam();
        else if (minik) masa.children[seq[t.secimler.length]]?.classList.add('yankila');
      };
      const b = buton(masa, fenerAdlari[i], img(id), yap, 'parca');
    });
    const sira = alan('fener-sira');
    function gosterge() {
      sira.innerHTML = seq
        .map((v, i) => (i < t.secimler.length ? '<i>' + img(lamba[v]) + '</i>' : '<i></i>'))
        .join('');
    }
    gosterge();
    let gosterim = 0;
    function goster(anlatim?: string) {
      const buGosterim = ++gosterim;
      clearTimeout(timer);
      gosterge();
      dinliyor = true;
      masa.inert = true;
      masa.classList.remove('sende');
      let i = 0;
      const kalan = seq.slice(t.secimler.length);
      const siradaki = () => {
        if (oturum !== token || buGosterim !== gosterim || document.hidden || uygulamaArkada) return;
        if (i === kalan.length) {
          dinliyor = false;
          perde.replaceChildren();
          masa.inert = false;
          masa.classList.add('sende');
          if (minik) masa.children[kalan[0]]?.classList.add('yankila');
          if (!t.secimler.length && n < 2) soyle(sozler[55]);
          return;
        }
        yak(kalan[i++]);
        timer = window.setTimeout(siradaki, minik ? 1050 : dortYas ? 900 : 800);
      };
      if (anlatim) soyle(anlatim);
      const kayit = anlatim ? ses : undefined;
      if (kayit) {
        let basladi = false;
        const baslat = () => {
          if (basladi || oturum !== token || buGosterim !== gosterim || document.hidden || uygulamaArkada)
            return;
          basladi = true;
          clearTimeout(timer);
          timer = window.setTimeout(siradaki, 350);
        };
        kayit.addEventListener('ended', baslat, { once: true });
        kayit.addEventListener('error', baslat, { once: true });
        timer = window.setTimeout(baslat, 6500);
      } else timer = window.setTimeout(siradaki, 450);
    }
    ipucunuTekrarla = () => {
      if (!kilit) {
        goster(sozler[56]);
      }
    };
    goster(sesli ? metin : undefined);
  }
  if (k !== 'fener' && n < 5 && !masa.classList.contains('yazim')) {
    const yuva = pano.querySelector('.sirada');
    const kalip = yuva?.querySelector('img')?.src;
    const eslesen =
      kalip &&
      Array.from(masa.querySelectorAll('.parca')).find((el) => el.querySelector('img')?.src === kalip);
    const tabak = Array.from(pano.querySelectorAll('.tabak')).sort(
      (a, b) => a.childElementCount - b.childElementCount,
    )[0];
    const nesne =
      eslesen ||
      masa.querySelector('.pay-meyvesi') ||
      (pano.classList.contains('terazi') && masa.querySelector('.parca'));
    const yer = yuva || tabak || pano.querySelector('.kefe.sag');
    if (nesne && yer) hareketIpucu(nesne, yer);
  }
  if (sesli && !ipucunuTekrarla) soyle(metin);
}
window.addEventListener('pagehide', () => {
  boncukSesiniKes();
  clearTimeout(timer);
  susArtik();
});
let uygulamaArkada = false;
let duraklatildi = false;
function duraklamayiGuncelle() {
  const bekle = document.hidden || uygulamaArkada || dikTelefon.matches;
  if (duraklatildi === bekle) return;
  duraklatildi = bekle;
  if (bekle) {
    oturum++;
    if (sahne === 'tangram' || sahne === 'misket') { sahneyiKapat?.(); sahneyiKapat=undefined; }
    boncukSesiniKes();
    clearTimeout(timer);
    clearTimeout(yardimSaati);
    susArtik();
  } else if (sahne === 'misket') {
    if (kok.dataset.bitti) oyna(true);
    else misketiAc();
  } else if (sahne === 'tangram') {
    if (durum.sekil.adim === son) hatirayiGoster();
    else gezginiAc();
  } else if (sahne === 'kule') {
    kuleTuru();
  } else if (sahne === 'oyun') {
    if (durum[k].adim === son) hatirayiGoster();
    else oyna(true);
  } else if (sahne === 'yas') {
    soyle(sozler[66]);
  }
}
document.addEventListener('visibilitychange', duraklamayiGuncelle);
dikTelefon.addEventListener('change', duraklamayiGuncelle);
arkaPlanDinle((arkada) => {
  uygulamaArkada = arkada;
  duraklamayiGuncelle();
});
geriDinle(() => {
  if (sahne === 'menu') return false;
  menu();
  return true;
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    uygulamaDurumu.i = yukle();
    seviyeyiYukle();
    menu();
  }
});

menu();
duraklamayiGuncelle();
