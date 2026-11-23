/**
 * Adanın Şarkısı: çiftlik sahnesinde Polly şarkı söyler. Her satırda bir hayvan selamlanır ("Hello, cow!"): hayvan
 * adı geçtiği anda sahnenin ortasına zıplar, sesini söylediği anda üstünde kocaman bir konuşma balonu çıkar ("Moo!")
 * ve dans eder; sonraki hayvan gelince arka sıraya geçer. Sözler altta büyük ve renkli durur: söylenen sözcük büyür
 * ve parlar, hayvan adları kendi renginde, sesler balon yazısıyla. "I love the animals!" denince bütün hayvanlar
 * birlikte zıplar. Çocuk bir hayvana dokununca o hayvan dans eder.
 * Katılım (kalite denetimi, 23 Kasım: "60 sn'den uzun ve katılımsız"): sahneye çıkan hayvan parlar ve dokunulmayı bekler
 * (bir buçuk saniyede el ipucu gelir); çocuk dokununca hayvan kendi sesini çıkarır, balonu hemen açılır, yıldızı köşedeki
 * sayaca uçar. Şarkı "I love the animals!" toplu zıplamasından kısa süre sonra yumuşakça kapanır (uzun veda kesilir).
 *
 * Çizimler: `sarki/sahne-<ada>` ve `kisi/polly-sarki-0…3` (Astra, Paket 14); hayvanlar dersin kelime çizimleri.
 * Ses: `assets/ingilizce/sarki/<id>.mp3` (Barış'ın Gemini şarkısı; yoksa adım hiç açılmaz: ders.ts → hazirAdimlar).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { efektKimligi, kelimeBul, type Kelime } from '../icerik';
import { cikartmaResmi, ipucuKur, kisi, kutla, pozBirak, pozTut } from '../kit';
import type { SarkiSatiri } from '../sarkilar';
import { efektCal, sus, tik } from '../ses';
import { resim, sarkiAdresi } from '../varlik';
import { yasam, type AdimKurucu } from './ortak';

export const sarkiKur: AdimKurucu<'sarki'> = (b, a) => {
  const y = yasam();
  const s = a.sarki;
  const sahne = h('div.ing-sarki-sahne');
  const fon = resim(`sarki/sahne-${s.uniteId}`);
  if (fon) sahne.style.backgroundImage = `url("${fon}")`;
  const polly = kisi('polly', 'ing-sarki-polly');
  const sira = h('div.ing-sarki-sira');
  const balon = h('div.ing-sarki-balon', { 'aria-hidden': 'true' });
  const satir = h('p.ing-sarki-satir', { lang: 'en-US' });
  const baslik = h('h2.ing-sarki-baslik', {}, h('span', { lang: 'en-US' }, s.en), h('small', {}, s.tr));
  // katılım sayacı: çocuğun yakaladığı hayvanların yıldızları
  const toplanan = h('div.ing-sarki-toplanan', { 'aria-label': 'Yakalanan hayvanlar' });
  sahne.append(sira, polly, balon, toplanan);
  b.alan.replaceChildren(h('div.ing-sarki', {}, baslik, sahne, satir));

  // ---- hayvanlar: sahne ortasında kahraman, öncekiler arka sırada
  const hayvanlar = new Map<string, HTMLButtonElement>();
  let kahraman: HTMLButtonElement | undefined;
  /** dokunulmayı bekleyen (sırası gelen) hayvan; çocuk dokununca ya da sırası geçince boşalır */
  let davetli: HTMLButtonElement | undefined;
  let yakalanan = 0;
  const davetBitir = () => { davetli?.classList.remove('ing-davet'); davetli = undefined; ipucuKur(undefined); };
  const dans = (d: HTMLElement) => { d.classList.remove('ing-dans'); void d.offsetWidth; d.classList.add('ing-dans'); };
  const siraya = (d: HTMLButtonElement) => { if (d === davetli) davetBitir(); d.classList.remove('ing-kahraman'); d.classList.add('ing-sirada'); sira.append(d); };
  /** çocuk sırası gelen hayvanı yakaladı: kendi sesi, balon, yıldız sayaca */
  function yakala(d: HTMLButtonElement, w: Kelime, l: SarkiSatiri) {
    davetBitir();
    d.classList.add('ing-yakalandi');
    kutla(d);
    dans(d);
    if (w.efekt) void efektCal(efektKimligi(w)); else tik.sec();
    if (l.ses) { balon.textContent = l.ses; balon.style.setProperty('--renk', l.renk ?? '#e76f51'); balon.classList.remove('ing-gorunur'); void balon.offsetWidth; balon.classList.add('ing-gorunur'); }
    yakalanan++;
    toplanan.append(h('i', { style: `--renk:${l.renk ?? '#e76f51'}` }));
    toplanan.dataset.sayi = String(yakalanan);
  }
  function hayvanGelsin(l: SarkiSatiri) {
    // şarkıdaki hayvanların bazıları henüz ders kelimesi değil (keçi, fare, eşek, tavşan): Astra'nın kelime çizimi varsa o gelir
    const w: Kelime | undefined = !l.hayvan ? undefined : kelimeBul(l.hayvan) ?? (resim(`kelime/${l.hayvan}`) ? { id: l.hayvan, en: l.hayvan, tr: l.hayvan, tur: 'tekil' } as Kelime : undefined);
    if (!w || hayvanlar.has(w.id)) return;
    if (kahraman) siraya(kahraman);
    // önceki hayvanın balonu yeni hayvan gelince kalkar ("Hello, mouse!" denirken keçinin "Maa!"sı kalmasın)
    balon.classList.remove('ing-gorunur');
    const d = h('button.ing-sarki-hayvan.ing-kahraman', { type: 'button', 'aria-label': w.en }, cikartmaResmi(w)) as HTMLButtonElement;
    d.style.setProperty('--renk', l.renk ?? '#0f5a4e');
    d.dataset.kelime = w.id;
    d.addEventListener('click', () => { if (d === davetli) yakala(d, w, l); else { tik.dokun(); dans(d); } });
    sahne.append(d);
    hayvanlar.set(w.id, d);
    kahraman = d;
    kutla(d);
    // sırası gelen hayvan parlar ve dokunulmayı bekler
    davetBitir();
    davetli = d;
    d.classList.add('ing-davet');
    ipucuKur(() => (davetli === d ? d : null), 1500);
  }
  function sesSoylesin(l: SarkiSatiri) {
    if (!l.ses) return;
    balon.textContent = l.ses;
    balon.style.setProperty('--renk', l.renk ?? '#e76f51');
    balon.classList.remove('ing-gorunur'); void balon.offsetWidth; balon.classList.add('ing-gorunur');
    if (kahraman) dans(kahraman);
  }
  function hepsiZiplasin() {
    davetBitir();
    balon.classList.remove('ing-gorunur');
    if (kahraman) { siraya(kahraman); kahraman = undefined; }
    sira.classList.add('ing-hepsi');
    [...hayvanlar.values()].forEach((d, i) => { d.style.setProperty('--gecikme', `${i * 60}ms`); dans(d); });
  }

  // ---- sözler: satır büyük ve renkli; söylenen sözcük büyür, söylenmişler renkli kalır
  let satirNo = -1;
  let kelimeler: HTMLElement[] = [];
  function satirGoster(no: number) {
    satirNo = no;
    const l = s.satirlar[no];
    kelimeler = l.sozler.map(([metin, , rol]) => {
      const k = h(`span.ing-soz-${rol}`, {}, metin);
      if ((rol === 'hayvan' || rol === 'ses') && l.renk) k.style.setProperty('--renk', l.renk);
      return k;
    });
    satir.replaceChildren(...kelimeler.flatMap((k, i) => (i ? [' ', k] : [k])));
    satir.classList.remove('ing-geldi'); void satir.offsetWidth; satir.classList.add('ing-geldi');
  }

  let sesNo = 0, gelNo = 0, hepsiOldu = false;
  function zamanla(ms: number) {
    let no = satirNo;
    while (no + 1 < s.satirlar.length && s.satirlar[no + 1].t - 300 <= ms) no++;
    if (no !== satirNo && no >= 0) satirGoster(no);
    if (satirNo >= 0) {
      const sozler = s.satirlar[satirNo].sozler;
      let simdi = -1;
      sozler.forEach(([, t], i) => { const yandi = ms >= t; kelimeler[i]?.classList.toggle('ing-yandi', yandi); if (yandi) simdi = i; });
      kelimeler.forEach((k, i) => k.classList.toggle('ing-simdi', i === simdi && ms - sozler[i][1] < 900));
    }
    // hayvan adı (satırın 2. sözcüğü) geçince sahneye çıkar; ses sözcüğünde balon
    while (gelNo < s.satirlar.length && (s.satirlar[gelNo].sozler[1]?.[1] ?? Infinity) <= ms) hayvanGelsin(s.satirlar[gelNo++]);
    while (sesNo < s.satirlar.length) {
      const l = s.satirlar[sesNo];
      const sesSozu = l.sozler.find(([, , rol]) => rol === 'ses');
      if (!sesSozu) { sesNo++; continue; }
      if (sesSozu[1] > ms) break;
      sesSoylesin(l); sesNo++;
    }
    if (!hepsiOldu && s.hepsi !== undefined && ms >= s.hepsi) { hepsiOldu = true; hepsiZiplasin(); }
  }

  // ---- Polly'nin dans döngüsü (kisi/polly-sarki-0…3)
  let kare = 0;
  const dansDongusu = window.setInterval(() => { if (resim('kisi/polly-sarki-0')) pozTut('polly', `sarki-${kare++ % 4}`); }, 420);

  const muzik = new Audio();
  muzik.preload = 'auto';
  muzik.setAttribute('playsinline', '');
  let cerceve = 0;
  const izle = () => {
    const ms = muzik.currentTime * 1000;
    zamanla(ms);
    if (s.hepsi !== undefined && ms >= s.hepsi + KAPANIS_MS) { kapan(); return; }
    cerceve = requestAnimationFrame(izle);
  };
  y.kapaninca(() => { muzik.pause(); muzik.src = ''; cancelAnimationFrame(cerceve); window.clearInterval(dansDongusu); pozBirak('polly'); ipucuKur(undefined); });
  /** toplu zıplamadan bu kadar sonra şarkı yumuşakça kapanır (uzun veda kesilir; adım 60 sn'yi geçmesin) */
  const KAPANIS_MS = 3200, SONMA_MS = 900;
  let kapaniyor = false;
  function kapan() {
    if (kapaniyor || !y.acik) return;
    kapaniyor = true;
    cancelAnimationFrame(cerceve);
    zamanla(Number.MAX_SAFE_INTEGER);
    const bas = muzik.volume, t0 = performance.now();
    const son = () => {
      const k = Math.min(1, (performance.now() - t0) / SONMA_MS);
      muzik.volume = Math.max(0, bas * (1 - k));
      if (k < 1 && y.acik) { requestAnimationFrame(son); return; }
      muzik.pause();
      if (y.acik) b.bitti();
    };
    requestAnimationFrame(son);
  }

  void (async () => {
    sus();
    // test kipinde şarkı çalınmaz: an `?sarki-an=<ms>` ile seçilir (yoksa sonu); sahne bir buçuk saniye kalır
    // (bekle() test kipinde 20 ms'ye iner; görüntü alınabilsin diye gerçek süre beklenir)
    if (TEST_MODU) {
      const an = Number(new URLSearchParams(location.search).get('sarki-an') ?? Number.MAX_SAFE_INTEGER);
      zamanla(an);
      // ?sarki-dur: adım kendiliğinden geçmez (katılım ve yerleşim spec'i için)
      if (!new URLSearchParams(location.search).has('sarki-dur')) window.setTimeout(() => { if (y.acik) b.bitti(); }, 1500);
      return;
    }
    const adres = sarkiAdresi(s.id);
    if (!adres) { b.bitti(); return; }
    muzik.src = adres;
    muzik.addEventListener('ended', () => {
      if (!y.acik || kapaniyor) return;
      cancelAnimationFrame(cerceve);
      zamanla(Number.MAX_SAFE_INTEGER);
      // son poz kısa bir an görünür, ders hemen sürer (1,2 sn bekleme ölçümde 1,4 sn boşluk yapıyordu)
      void (async () => { if (await y.dur(400)) b.bitti(); })();
    }, { once: true });
    try { await muzik.play(); } catch { b.bitti(); return; }
    cerceve = requestAnimationFrame(izle);
  })();
  b.tekrarla(() => { /* şarkı sürerken yeniden dinle yoktur */ });
  return () => y.kapat();
};
