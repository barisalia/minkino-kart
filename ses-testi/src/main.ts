import '@fontsource/fredoka/latin-ext-500.css';
import '@fontsource/fredoka/latin-ext-600.css';
import '@fontsource/fredoka/latin-ext-700.css';
import '../../src/styles/ana.css';
import './ses.css';
import {
  AlkisSayaci, egriAdi, egri, hayvanSesi, hecele, OrtamOlcer, PerdeIzci, ritimKalibi, SesSekli, SessizlikSayaci, seviye, UflemeBulucu,
  type Ayar, type Ozellik,
} from './analiz';
import { Mikrofon, type Istek } from './mikrofon';
import { h } from '../../src/ui/dom';

/**
 * Uyuyan Orman — mikrofon testi prototipi.
 * Beş ölçüm: üfleme, ince-kalın ses, alkış sayma, ses şekli, sessizlik. Ses kaydedilmez.
 */
const kok = document.getElementById('ses-testi')!;
kok.classList.add('mk-kok', 'st-kok');

const mik = new Mikrofon();
const istek: Istek = { yankiIptal: false, gurultuBastir: false, otoSeviye: false };
const ayar: Ayar = { taban: -65, duyarlilik: 0, kare: 1024 / 48000 };
const gunluk: { t: string; test: string; olay: string }[] = [];
const sonuclar: Record<string, unknown[]> = { ufleme: [], perde: [], alkis: [], sekil: [], sessizlik: [] };
type TestAdi = 'ufleme' | 'perde' | 'alkis' | 'sekil' | 'sessizlik';
let sekme: TestAdi = 'ufleme' as TestAdi;
let kalibrasyon: OrtamOlcer | null = null;
/** Çocuğun normal sesinin perdesi (ince-kalın referansı; ses şeklinde de kullanılır) */
let referansHz: number | null = null;

function kaydet(test: string, olay: string, veri?: unknown) {
  const t = new Date().toLocaleTimeString('tr-TR');
  gunluk.unshift({ t, test, olay });
  if (gunluk.length > 40) gunluk.pop();
  if (veri !== undefined) sonuclar[test]?.push(veri);
  gunlukEl.replaceChildren(...gunluk.map((g) => h('li', {}, h('b', {}, `${g.t} · ${g.test}`), ` ${g.olay}`)));
}

// ---------------------------------------------------------------- iskelet
const gunlukEl = h('ol.st-gunluk');
const baslat = h('button.dugme.st-baslat', { type: 'button' }, 'Mikrofonu aç');
const giris = h(
  'section.st-giris',
  {},
  h('h1', {}, 'Mikrofon Testi'),
  h('p.st-alt', {}, 'Uyuyan Orman ön denemesi: üfleme, ince-kalın ses, alkış, ses şekli ve sessizlik.'),
  baslat,
  h('p.st-not', {}, 'Ses kaydedilmez ve telefondan dışarı çıkmaz; her an işlenip silinir.'),
);
const durum = h('div.st-durum', {}, 'Mikrofon kapalı');
const sekmeler = h('nav.st-sekmeler', { role: 'tablist' });
const panel = h('section.st-panel');
const olcum = h('section.st-olcum');
const uygulama = h('main.st-uygulama', { hidden: true }, durum, sekmeler, panel, olcum, h('h3', {}, 'Olaylar'), gunlukEl);
kok.append(h('div.zemin'), h('div.st-sayfa', {}, giris, uygulama));

// ---------------------------------------------------------------- canlı ölçüm paneli
const dbCubuk = h('div.st-cubuk-dolu');
const tabanCizgi = h('i.st-taban');
const esikCizgi = h('i.st-esik');
const sayilar = h('div.st-sayilar');
const cizim = h('canvas.st-grafik', { width: 600, height: 90 });
const ayarlarEl = h('div.st-ayarlar');
const dbYuzde = (d: number) => Math.max(0, Math.min(100, ((d + 90) / 90) * 100));

function olcumPaneli() {
  const kutu = (ad: keyof Istek, etiket: string) => {
    const k = h('input', { type: 'checkbox', id: `st-${ad}` }) as HTMLInputElement;
    k.checked = istek[ad];
    k.addEventListener('change', async () => {
      istek[ad] = k.checked;
      await mikrofonuAc();
    });
    return h('label', { for: `st-${ad}` }, k, ` ${etiket}`);
  };
  const duyarlilik = h('input', { type: 'range', min: -12, max: 12, step: 1, value: 0, id: 'st-duyarlilik' }) as HTMLInputElement;
  const dyYazi = h('span', {}, '0 dB');
  duyarlilik.addEventListener('input', () => {
    ayar.duyarlilik = Number(duyarlilik.value);
    dyYazi.textContent = `${ayar.duyarlilik > 0 ? '+' : ''}${ayar.duyarlilik} dB`;
  });
  const yeniden = h('button.ince-dugme', { type: 'button' }, 'Ortamı yeniden ölç');
  yeniden.addEventListener('click', () => ortamOlc());
  const rapor = h('button.ince-dugme', { type: 'button' }, 'Raporu kopyala');
  rapor.addEventListener('click', async () => {
    const r = JSON.stringify({ cihaz: navigator.userAgent, ornekHizi: mik.ornekHizi, istek, gercekAyarlar: mik.ayarlar, taban: +ayar.taban.toFixed(1), duyarlilik: ayar.duyarlilik, sonuclar }, null, 1);
    try {
      await navigator.clipboard.writeText(r);
      rapor.textContent = 'Kopyalandı';
    } catch {
      const t = h('textarea.st-rapor', {}, r) as HTMLTextAreaElement;
      olcum.append(t);
      t.select();
    }
  });
  olcum.replaceChildren(
    h('h3', {}, 'Canlı ölçüm'),
    h('div.st-cubuk', {}, dbCubuk, tabanCizgi, esikCizgi),
    cizim,
    sayilar,
    h('h3', {}, 'Telefonun ses işlemesi'),
    h('div.st-kutular', {}, kutu('gurultuBastir', 'Gürültü bastırma'), kutu('otoSeviye', 'Otomatik ses seviyesi'), kutu('yankiIptal', 'Yankı iptali')),
    ayarlarEl,
    h('label.st-duyarlilik', { for: 'st-duyarlilik' }, 'Duyarlılık ', duyarlilik, ' ', dyYazi),
    h('div.st-dugmeler', {}, yeniden, rapor),
  );
}

function ayarlariGoster() {
  const a = mik.ayarlar as MediaTrackSettings & Record<string, unknown>;
  const yaz = (v: unknown) => (v === undefined ? 'bilinmiyor' : v ? 'AÇIK' : 'kapalı');
  ayarlarEl.textContent = `Gerçekte: gürültü bastırma ${yaz(a.noiseSuppression)} · otomatik seviye ${yaz(a.autoGainControl)} · yankı iptali ${yaz(a.echoCancellation)} · ${Math.round(mik.ornekHizi / 100) / 10} kHz`;
}

function canliGuncelle(o: Ozellik) {
  dbCubuk.style.width = `${dbYuzde(o.db)}%`;
  tabanCizgi.style.left = `${dbYuzde(ayar.taban)}%`;
  esikCizgi.style.left = `${dbYuzde(ayar.taban + 12 - ayar.duyarlilik)}%`;
  sayilar.textContent = `ses ${o.db.toFixed(0)} dB · ortam ${ayar.taban.toFixed(0)} dB · perde ${o.perde ? `${Math.round(o.perde)} Hz` : '—'} · gürültülük ${o.duzluk.toFixed(2)} · kalın oran ${o.kalinOran.toFixed(2)} · ${seviye(o, ayar)}`;
}

function grafikCiz() {
  const c = cizim.getContext('2d')!;
  const { width: W, height: H } = cizim;
  c.clearRect(0, 0, W, H);
  c.fillStyle = 'rgba(90,54,23,0.08)';
  c.fillRect(0, 0, W, H);
  const y = (d: number) => H - (dbYuzde(d) / 100) * H;
  c.strokeStyle = '#3E9DF2';
  c.setLineDash([4, 4]);
  c.beginPath();
  c.moveTo(0, y(ayar.taban));
  c.lineTo(W, y(ayar.taban));
  c.stroke();
  c.setLineDash([]);
  c.strokeStyle = '#F0413F';
  c.lineWidth = 2;
  c.beginPath();
  const n = Math.max(1, Math.round(3 / ayar.kare));
  mik.gecmis.forEach((d, i) => (i ? c.lineTo((i / n) * W, y(d)) : c.moveTo(0, y(d))));
  c.stroke();
  requestAnimationFrame(grafikCiz);
}

// ---------------------------------------------------------------- testler
type Test = { ad: string; kare(o: Ozellik): void; el: HTMLElement; sifirla?: () => void };
let testler: Record<TestAdi, Test>;

function uflemeTesti(): Test {
  const u = new UflemeBulucu(ayar);
  const alev = h('div.st-alev');
  const mum = h('div.st-mum', {}, alev, h('div.st-mum-govde'));
  const sure = h('div.st-sure-dolu');
  const yazi = h('p.st-sonuc', {}, 'Muma üfle. Yarım saniye üflersen söner.');
  const hedef = h('p.st-kucuk', {}, '5 yaş görevi: tam 3 saniye üfle (çubuk dolacak).');
  let sondu = false;
  const yak = h('button.ince-dugme', { type: 'button' }, 'Mumu yak');
  yak.addEventListener('click', () => {
    sondu = false;
    mum.classList.remove('sondu');
    yazi.textContent = 'Muma üfle.';
  });
  return {
    ad: 'Üfleme',
    el: h('div.st-test', {}, mum, h('div.st-sure', {}, sure, h('i.st-sure-hedef')), yazi, hedef, yak),
    kare(o) {
      const r = u.kare(o);
      alev.style.setProperty('--g', String(u.guc));
      sure.style.width = `${Math.min(100, (u.sure / 4) * 100)}%`;
      if (u.aktif && u.sure > 0.5 && !sondu) {
        sondu = true;
        mum.classList.add('sondu');
        yazi.textContent = 'Söndü!';
        kaydet('ufleme', 'mum söndü');
      }
      if (r.bitti) {
        const s = +r.bitti.toFixed(2);
        const uc = Math.abs(s - 3) <= 0.4 ? ' — 3 saniye tuttu!' : '';
        yazi.textContent = `Üfleme bitti: ${s} saniye${uc}${sondu ? ' (mum söndü)' : ''}`;
        kaydet('ufleme', `${s} sn üfleme${uc}`, { sure: s });
      }
    },
  };
}

function perdeTesti(): Test {
  const p = new PerdeIzci(ayar);
  const kus = h('div.st-kus', {}, 'kuş');
  const alan = h('div.st-gok', {}, h('i.st-orta-cizgi'), kus);
  const yazi = h('p.st-sonuc', {}, 'Önce normal sesinle "aaa" de (Referans düğmesi). Sonra ince sesle kuşu uçur, kalın sesle indir.');
  const ref = h('button.ince-dugme', { type: 'button' }, 'Referans: 2 sn "aaa" de');
  let refKaydi = false;
  ref.addEventListener('click', () => {
    refKaydi = true;
    ref.textContent = 'Dinliyorum…';
    setTimeout(() => {
      refKaydi = false;
      const r = p.referansBitir();
      if (r) referansHz = r;
      ref.textContent = r ? `Referans: ${Math.round(r)} Hz (yenile)` : 'Ses duyulmadı, tekrar dene';
      kaydet('perde', r ? `referans ${Math.round(r)} Hz` : 'referans alınamadı', r ? { referans: Math.round(r) } : undefined);
    }, 2000);
  });
  let sonSinif = '';
  return {
    ad: 'İnce-Kalın',
    el: h('div.st-test', {}, alan, yazi, ref),
    kare(o) {
      if (refKaydi) return p.referansEkle(o);
      const r = p.kare(o);
      if (r.fark === null) {
        kus.classList.remove('ince', 'kalin');
        return;
      }
      const y = Math.max(-12, Math.min(12, r.fark));
      kus.style.setProperty('--y', String(-y / 12));
      kus.classList.toggle('ince', r.sinif === 'ince');
      kus.classList.toggle('kalin', r.sinif === 'kalin');
      yazi.textContent = `${Math.round(r.perde!)} Hz · ${r.fark > 0 ? '+' : ''}${r.fark.toFixed(1)} yarım ton → ${r.sinif === 'ince' ? 'İNCE (kuş yükselir)' : r.sinif === 'kalin' ? 'KALIN (ayı homurdanır)' : 'normal'}`;
      if (r.sinif && r.sinif !== sonSinif && r.sinif !== 'orta') kaydet('perde', `${r.sinif} ses (${Math.round(r.perde!)} Hz)`, { sinif: r.sinif, hz: Math.round(r.perde!) });
      sonSinif = r.sinif ?? '';
    },
  };
}

function alkisTesti(): Test {
  const a = new AlkisSayaci(ayar);
  const sayi = h('div.st-sayi', {}, '0');
  const noktalar = h('div.st-noktalar');
  const yazi = h('p.st-sonuc', {}, 'Alkışla. 1,5 saniye durunca sayar ve ritmi yazar.');
  let hedef = 3;
  const hedefYazi = h('b', {}, '3');
  const eksi = h('button.ince-dugme', { type: 'button' }, '−');
  const arti = h('button.ince-dugme', { type: 'button' }, '+');
  eksi.addEventListener('click', () => (hedefYazi.textContent = String((hedef = Math.max(1, hedef - 1)))));
  arti.addEventListener('click', () => (hedefYazi.textContent = String((hedef = Math.min(8, hedef + 1)))));
  let seri = 0;
  return {
    ad: 'Alkış',
    el: h('div.st-test', {}, sayi, noktalar, yazi, h('div.st-hedef', {}, 'Hedef: ', eksi, hedefYazi, arti, ' alkış'), h('p.st-kucuk', {}, 'Ritim denemesi: "uzun – kısa – kısa" için alkışla, bekle, üç hızlı alkış.')),
    kare(o) {
      const r = a.kare(o);
      if (r.alkis) {
        seri++;
        sayi.textContent = String(seri);
        sayi.classList.remove('vur');
        void sayi.offsetWidth;
        sayi.classList.add('vur');
        noktalar.append(h('i'));
      }
      if (r.seriBitti) {
        const kalip = ritimKalibi(r.seriBitti);
        const tuttu = r.seriBitti.length === hedef;
        yazi.textContent = `${r.seriBitti.length} alkış${tuttu ? ' — hedef tuttu!' : ` (hedef ${hedef})`}${kalip.length ? ` · ritim: ${kalip.map((k) => (k === 'uzun' ? 'uzun' : 'kısa')).join(' – ')}` : ''}`;
        kaydet('alkis', yazi.textContent, { sayi: r.seriBitti.length, kalip });
        seri = 0;
        setTimeout(() => {
          if (seri === 0) {
            sayi.textContent = '0';
            noktalar.replaceChildren();
          }
        }, 2500);
      }
    },
  };
}

function sekilTesti(): Test {
  const s = new SesSekli(ayar);
  const canli = h('div.st-parcalar');
  const yazi = h('p.st-sonuc', {}, '"Hav hav" (iki kısa), "Möööö" (bir uzun, kalın) ya da "Miyaav" (yükselip alçalan) de.');
  const hayvan = h('div.st-hayvan', {}, '?');
  let parcaEl: HTMLElement | null = null;
  return {
    ad: 'Ses şekli',
    el: h('div.st-test', {}, hayvan, canli, yazi),
    kare(o) {
      const r = s.kare(o);
      if (r.sesVar) {
        if (!parcaEl) {
          parcaEl = h('i');
          canli.append(parcaEl);
        }
        parcaEl.style.width = `${Math.min(100, (parseFloat(parcaEl.style.width) || 0) + 2.2)}px`;
      } else parcaEl = null;
      if (r.dizi) {
        const sonuc = hayvanSesi(r.dizi, referansHz);
        hayvan.textContent = sonuc.hayvan === 'kopek' ? 'Köpek: hav hav' : sonuc.hayvan === 'inek' ? 'İnek: möö' : sonuc.hayvan === 'kedi' ? 'Kedi: miyav' : '?';
        hayvan.classList.toggle('tanindi', !!sonuc.hayvan);
        yazi.textContent = sonuc.aciklama;
        kaydet('sekil', sonuc.aciklama, { hayvan: sonuc.hayvan, parcalar: r.dizi.map((p) => ({ ms: Math.round(p.sure * 1000), egri: egriAdi(egri(p.perdeler)) })) });
        setTimeout(() => canli.replaceChildren(), 1500);
      }
    },
  };
}

function sessizlikTesti(): Test {
  const s = new SessizlikSayaci(ayar);
  const halka = h('div.st-halka', {}, h('span', {}, '0'));
  const seviyeEl = h('p.st-seviye', {}, 'sessiz');
  const yazi = h('p.st-sonuc', {}, 'Dev uyuyor. 5 saniye hiç ses çıkarma.');
  let basardi = false;
  return {
    ad: 'Sessizlik',
    el: h('div.st-test', {}, halka, seviyeEl, yazi),
    kare(o) {
      const r = s.kare(o);
      const sv = seviye(o, ayar);
      seviyeEl.textContent = { sessiz: 'sessiz', fisilti: 'fısıltı', konusma: 'konuşma', bagirma: 'BAĞIRMA' }[sv];
      seviyeEl.dataset.seviye = sv;
      halka.style.setProperty('--p', String(Math.min(1, r.gecen / 5)));
      halka.querySelector('span')!.textContent = String(Math.floor(r.gecen));
      if (r.bozuldu) {
        yazi.textContent = 'Dev kıpırdadı! Baştan.';
        kaydet('sessizlik', `bozuldu (${seviyeEl.textContent})`, { bozuldu: true });
        basardi = false;
      }
      if (r.gecen >= 5 && !basardi) {
        basardi = true;
        yazi.textContent = '5 saniye sessiz kaldın — dev uyumaya devam ediyor!';
        kaydet('sessizlik', '5 sn başarıldı', { basari: true });
      }
    },
  };
}

function sekmeleriKur() {
  testler = { ufleme: uflemeTesti(), perde: perdeTesti(), alkis: alkisTesti(), sekil: sekilTesti(), sessizlik: sessizlikTesti() };
  sekmeler.replaceChildren(
    ...(Object.keys(testler) as (TestAdi)[]).map((k) => {
      const b = h(`button.st-sekme${k === sekme ? '.secili' : ''}`, { type: 'button', role: 'tab', 'data-test': k }, testler[k].ad);
      b.addEventListener('click', () => {
        sekme = k;
        sekmeler.querySelectorAll('.secili').forEach((x) => x.classList.remove('secili'));
        b.classList.add('secili');
        panel.replaceChildren(testler[k].el);
      });
      return b;
    }),
  );
  panel.replaceChildren(testler[sekme].el);
}

// ---------------------------------------------------------------- akış
function ortamOlc() {
  kalibrasyon = new OrtamOlcer();
  durum.textContent = 'Sessiz ol: ortam sesini ölçüyorum…';
  durum.className = 'st-durum olcuyor';
}

async function mikrofonuAc() {
  try {
    await mik.ac(istek);
  } catch (e) {
    durum.textContent = `Mikrofon açılamadı: ${(e as Error).message}. Tarayıcı ayarlarından mikrofon iznini ver.`;
    durum.className = 'st-durum hata';
    return false;
  }
  ayar.kare = mik.kareSuresi;
  ayarlariGoster();
  mik.onKare = (o) => {
    canliGuncelle(o);
    if (kalibrasyon) {
      kalibrasyon.ekle(o);
      if (kalibrasyon.hazir && mik.gecmis.length * ayar.kare > 1.2) {
        ayar.taban = kalibrasyon.taban;
        kalibrasyon = null;
        durum.textContent = `Hazır · ortam sesi ${ayar.taban.toFixed(0)} dB`;
        durum.className = 'st-durum hazir';
        kaydet('ortam', `ortam ${ayar.taban.toFixed(0)} dB`);
      }
      return;
    }
    testler[sekme].kare(o);
  };
  ortamOlc();
  return true;
}

baslat.addEventListener('click', async () => {
  baslat.setAttribute('disabled', '');
  if (!navigator.mediaDevices?.getUserMedia) {
    durum.textContent = 'Bu tarayıcı mikrofonu desteklemiyor (https gerekli).';
    return;
  }
  giris.hidden = true;
  uygulama.hidden = false;
  sekmeleriKur();
  olcumPaneli();
  if (await mikrofonuAc()) requestAnimationFrame(grafikCiz);
});

// Hece bölücü (Hece Mağarası için): test sayfasında küçük bir deneme kutusu
const heceGirdi = h('input', { type: 'text', value: 'Barış', id: 'st-hece', 'aria-label': 'İsim' }) as HTMLInputElement;
const heceSonuc = h('b', {}, '');
const heceGoster = () => {
  const hc = hecele(heceGirdi.value);
  heceSonuc.textContent = `${hc.join(' – ')} (${hc.length} alkış)`;
};
heceGirdi.addEventListener('input', heceGoster);
heceGoster();
kok.querySelector('.st-sayfa')!.append(h('div.st-hece', {}, h('label', { for: 'st-hece' }, 'Hece Mağarası denemesi · hece bölücü: '), heceGirdi, ' → ', heceSonuc));
