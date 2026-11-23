// Minik Doktor · "Kuzu'nun Sökük Dikişi" (sekiz adım; veri.ts başındaki senaryo). Oyuncak tamiri: iğne, iplik, dikiş yok.
// İskelet (masa, kamera, aletler, kapanış) vaka-kit'te; burada yakın planın katmanları, el hareketleri ve Kuzu'nun tepkileri.
// Çizimler Astra'dan (Paket Doktor-Y8, assets/doktor/kuzu/); biri eksikse ekranda hiçbir görüntü olmaz, yer tutucu yok.
import './kuzu.css';
import { ortalamaHiz } from '../vaka-kit/ortak';
import { eksikCizimleri, el, hop, koy, ortala, pop, sure, titret, vakaBaslat, ziplat, type Iskelet, type Nokta, type Tutulan, type Yas } from '../vaka-kit/iskelet';
import {
  ALETLER, CIRT_TAMAM, DUGME_BOYU, EFEKTLER, FIYONK_CEK, GOZ, KAPANIS, KARE_MS, KOSELER, KOSE_DUGMESI, KULAK_YIRTIK, KURDELE, KURDELE_DUGMESI, KUZU, KUZU_DOSYALAR, MASA, PAMUKLAR, PAMUK_BOYU,
  SEC_DUGMESI, SEPET, SEPET_PAMUGU, SOKUK, SOKUK_DUGMESI, SOZLER, YAMA_BOYU, YAMA_TURLERI, YAMA_YERLERI, YUNLER, YUN_YARICAPI, YUZ, ZORLUK, aciFarki, cevirAdimi, cevirBaslangici,
  cirtAdimi, cirtBaslangici, cirtOrani, dolguKademesi, firladiMi, sagGecti, sokuktaMi, solGecti, sonrakiAsama, uzak, yamaYeri, yarimTur, yirtikta, yunBul, yuzPozu,
  type Asama, type SozAdi, type YamaTuru, type YuzPozu,
} from './veri';

/** bekleme odası için: çizimi gelmemiş vaka sıraya girmez */
export const eksikCizimler = (): string[] => eksikCizimleri('kuzu', KUZU_DOSYALAR);

export function baslat(kok: HTMLElement, yas: Yas, secenek: { bitince?: () => void } = {}): void {
  vakaBaslat(kok, yas, secenek, {
    oyun: 'kuzu', klasor: 'kuzu', dosyalar: KUZU_DOSYALAR,
    hasta: { ad: 'Kuzu\'nun söküğü', kutu: MASA.kuzu, bekleme: [KUZU.uzgun[0], KUZU.uzgun[1]], kirp: KUZU.uzgunKirp, sevinc: [KUZU.sevinc[0], KUZU.sevinc[1]], son: [KUZU.son[0], KUZU.son[0], KUZU.son[1], KUZU.son[1]],
      dokunma: MASA.sokuk, dugme: SOKUK_DUGMESI, gogus: MASA.gogus, yaklasma: MASA.yaklasma },
    cantaAletleri: [KUZU.yama.kalp, KUZU.cirt, KUZU.dugme, KUZU.firca], seritAletleri: [KUZU.cirt, KUZU.dugme, KUZU.firca],
    yakinFon: KUZU.fon,
    sesler: [...Object.keys(SOZLER), ...EFEKTLER],
    // Lokum'un klonu yok: girişte Kuzu'nun "mee"si; kapanışta "Mee!" ve dışarıdan Lokum'un "Kuzu'm!"u (yazılı)
    sozler: { giris: 'kz-mee', canta: 'lk-canta', son: 'kz-mee', sonSonra: 'lk-son' },
    kapanis: KAPANIS,
  }, I => kurKuzu(I));
}

function kurKuzu(I: Iskelet) {
  const Z = ZORLUK[I.yas];
  const { resim, yigin, ses, kinoTepki, oynat, parilti } = I;
  const soyle = (ad: SozAdi) => I.soyle(ad);
  // ——————————————————————————— durum
  const pamukYerinde = PAMUKLAR.map(() => false);
  let itilen = 0, pamukHizi = 0, sepettenAlindi = false, secilen: YamaTuru | null = null, yamaKondu = false, yapisik = KOSELER.map(() => false);
  let cirt = cirtBaslangici(), cirtHizi = 0, kivrik = false, cevir = cevirBaslangici(), dugmeTakili = false, cevirTut: { id: number } | null = null, sonYarim = 0, dugmeBitti = false;
  let solTamam = false, sagTamam = false, kurdeleTut: { id: number; uc: 'sol' | 'sag' | 'fiyonk'; y: number } | null = null, bagli = false;
  const yunBitti = YUNLER.map(() => false), yunOv = YUNLER.map(() => 0), yunAci: (number | null)[] = YUNLER.map(() => null);
  let meeKalan = 0, sasirKalan = 0, kikirKalan = 0, utanKalan = 0, gidikKalan = 0, merakKalan = 0, mutluKalan = 0, sesAni = 0, tozAni = 0, yuzSimdi: YuzPozu = 'uzgun';
  let geriCikti = false, firladi = false, kaydi = false, kivrildi = false;
  const bekle = (ms: number) => new Promise<void>(r => setTimeout(r, sure(ms)));
  const mee = (kazanc = 1) => { ses('kz-mee', kazanc, 0.95 + Math.random() * 0.1); meeKalan = 700; void oynat(KUZU.mee, { x: YUZ.x - 120, y: YUZ.y - 160 }, 400, 300, KARE_MS.mee); hop(govdeY.kutu, 10, 220); };

  // ——————————————————————————— yakın plan katmanları (fonun üstünde, alttan üste)
  const y = I.yakin;
  const govdeY = yigin([...KUZU.govde, KUZU.govdePof, KUZU.govdeMee], 'vk-fon vk-tam vk-soluk');
  const yuzY = yigin(Object.values(KUZU.yuz), 'vk-katman kz-yuz'); ortala(yuzY.kutu, YUZ, 400, 400);
  const sokukR = resim(KUZU.sokuk, 'vk-katman kz-sokuk'); ortala(sokukR, SOKUK, 360, 300);
  const kulakSokuk = resim(KUZU.kulakSokuk, 'vk-katman kz-kulak-sokuk'); ortala(kulakSokuk, { x: (KULAK_YIRTIK.bas.x + KULAK_YIRTIK.son.x) / 2, y: (KULAK_YIRTIK.bas.y + KULAK_YIRTIK.son.y) / 2 }, 400, 200);
  const cirtR = resim(KUZU.cirtYarim, 'vk-katman kz-cirt-bant'); ortala(cirtR, { x: (KULAK_YIRTIK.bas.x + KULAK_YIRTIK.son.x) / 2, y: (KULAK_YIRTIK.bas.y + KULAK_YIRTIK.son.y) / 2 }, 400, 200); cirtR.hidden = true;
  const kurdeleY = yigin([KUZU.kurdeleCozuk, KUZU.kurdeleBagli], 'vk-fon vk-tam kz-kurdele-kati');
  const yunler = YUNLER.map(p => { const r = yigin(KUZU.yun, 'vk-katman kz-yun'); ortala(r.kutu, p, 260, 260); return r; });
  const yamaYer = yigin([...Object.values(KUZU.yamaYerinde), ...Object.values(KUZU.yamaYapisik)], 'vk-katman kz-yama-yer'); ortala(yamaYer.kutu, SOKUK, 300, 300); yamaYer.kutu.hidden = true;
  const koseler = KOSELER.map((p, i) => { const b = el('button', 'vk-katman kz-kose'); b.type = 'button'; b.setAttribute('aria-label', 'Yamanın köşesi ' + (i + 1)); ortala(b, p, KOSE_DUGMESI, KOSE_DUGMESI); b.hidden = true; return b; });
  const gozR = el('button', 'vk-katman kz-goz'); gozR.type = 'button'; gozR.setAttribute('aria-label', 'Düğme göz'); ortala(gozR, GOZ, 240, 240); gozR.hidden = true;
  const gozY = yigin(KUZU.dugmeYerinde, 'kz-dolu kz-goz-resmi'); gozR.append(gozY.kutu);
  const pamuklar = PAMUKLAR.map((p, i) => { const b = el('button', 'vk-katman kz-pamuk'); b.type = 'button'; b.setAttribute('aria-label', 'Pamuk ' + (i + 1)); ortala(b, p, 210, 210); b.append(resim(KUZU.pamuk[i], 'kz-dolu')); return b; });
  const sepet = el('button', 'vk-katman kz-sepet'); sepet.type = 'button'; sepet.setAttribute('aria-label', 'Pamuk sepeti'); koy(sepet, SEPET);
  const sepetY = yigin([KUZU.sepet, KUZU.sepetBos], 'kz-dolu'); sepet.append(sepetY.kutu);
  const yamaButonlari = Object.fromEntries(YAMA_TURLERI.map(t => { const b = el('button', 'vk-katman kz-yama'); b.type = 'button'; b.setAttribute('aria-label', 'Yama: ' + t); ortala(b, YAMA_YERLERI[t], SEC_DUGMESI, SEC_DUGMESI); b.append(resim(KUZU.yama[t], 'kz-dolu')); return [t, b]; })) as Record<YamaTuru, HTMLButtonElement>;
  const isik = resim(KUZU.yamaIsik, 'vk-katman kz-isik'); isik.hidden = true;
  const kurdeleSol = el('button', 'vk-katman kz-kurdele'); kurdeleSol.type = 'button'; kurdeleSol.setAttribute('aria-label', 'Kurdelenin sol ucu'); kurdeleSol.append(resim(KUZU.kurdeleSol, 'kz-dolu'));
  const kurdeleSag = el('button', 'vk-katman kz-kurdele'); kurdeleSag.type = 'button'; kurdeleSag.setAttribute('aria-label', 'Kurdelenin sağ ucu'); kurdeleSag.append(resim(KUZU.kurdeleSag, 'kz-dolu'));
  const capraz = resim(KUZU.kurdeleCapraz, 'vk-katman kz-capraz'); ortala(capraz, KURDELE.boyun, 400, 300); capraz.hidden = true;
  const fiyonk = el('button', 'vk-katman kz-fiyonk'); fiyonk.type = 'button'; fiyonk.setAttribute('aria-label', 'Fiyonk'); ortala(fiyonk, KURDELE.boyun, 260, 200); fiyonk.hidden = true;
  const fiyonkY = yigin(KUZU.kurdeleFiyonk, 'kz-dolu'); fiyonk.append(fiyonkY.kutu);
  ortala(kurdeleSol, KURDELE.sol, KURDELE_DUGMESI, KURDELE_DUGMESI); ortala(kurdeleSag, KURDELE.sag, KURDELE_DUGMESI, KURDELE_DUGMESI);
  y.append(govdeY.kutu, kurdeleY.kutu, sokukR, kulakSokuk, cirtR, ...yunler.map(r => r.kutu), yuzY.kutu, yamaYer.kutu, isik, sepet, ...Object.values(yamaButonlari), ...pamuklar, ...koseler, gozR, capraz, kurdeleSol, kurdeleSag, fiyonk);
  // şerit: cırt cırt bant, düğme göz, fırça
  const dokCirt = I.dokDugmesi(0, KUZU.cirt, 'Cırt cırt bant');
  const dokDugme = I.dokDugmesi(1, KUZU.dugme, 'Düğme göz');
  const dokFirca = I.dokDugmesi(2, KUZU.firca, 'Yumuşak fırça');
  // eldeki aletler
  const pamukElY = yigin([...KUZU.pamuk, KUZU.sepetPamuk], 'vk-alet-yigin');
  const yamaElY = yigin(Object.values(KUZU.yama), 'vk-alet-yigin');
  const cirtElY = yigin([KUZU.cirt, KUZU.cirtKivrik], 'vk-alet-yigin');
  I.aletEkle('pamuk', ALETLER.pamuk, [pamukElY.kutu], KUZU.pamuk[0]);
  I.aletEkle('yama', ALETLER.yama, [yamaElY.kutu], KUZU.yama.kalp);
  I.aletEkle('cirt', ALETLER.cirt, [cirtElY.kutu], KUZU.cirt);
  I.aletEkle('dugme', ALETLER.dugme, [resim(KUZU.dugme)], KUZU.dugme);
  I.aletEkle('firca', ALETLER.firca, [resim(KUZU.firca)], KUZU.firca);

  const asama = () => I.asama() as Asama;
  const gec = (a: Asama) => {
    I.asamaGec(a);
    kurdeleSol.hidden = kurdeleSag.hidden = a !== 'kurdele' || bagli;
    dokCirt.hidden = !(['giris', 'canta', 'tikistir', 'sec', 'yama', 'kose', 'cirt'].includes(a));
    dokDugme.hidden = !(['giris', 'canta', 'tikistir', 'sec', 'yama', 'kose', 'cirt', 'dugme'].includes(a)) || dugmeTakili;
  };
  const ilerle = () => gec(sonrakiAsama(asama()));
  const dolgu = () => { const k = dolguKademesi(itilen, Z.pamuk); govdeY.goster(KUZU.govde[k]); };

  // ——————————————————————————— 1 · pamukları söküğe tıkıştır (aletDugmesi ile ele alınır; kalkınca yerine mi diye bakılır)
  let tutulanPamuk = -1;
  pamuklar.forEach((b, i) => I.aletDugmesi(b, 'pamuk', () => asama() === 'tikistir' && !pamukYerinde[i], () => { tutulanPamuk = i; pamukElY.goster(KUZU.pamuk[i]); pamukHizi = 0; }));
  I.aletDugmesi(sepet, 'pamuk', () => asama() === 'tikistir' && Z.pamuk > PAMUKLAR.length && !sepettenAlindi && pamukYerinde.every(Boolean), () => { tutulanPamuk = -2; pamukElY.goster(KUZU.sepetPamuk); pamukHizi = 0; });
  function pamukGeriCiksin() {
    // hızlı itildi: yerine giren bir pamuk karşı taraftan "pof" diye geri çıkar
    const i = pamukYerinde.findIndex(Boolean);
    if (i < 0) return;
    geriCikti = true;
    pamukYerinde[i] = false; itilen--; dolgu();
    pamuklar[i].hidden = false; pamuklar[i].animate([{ transform: 'scale(.3)' }, { transform: 'scale(1.25)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: sure(320), easing: 'ease-out' });
    void oynat(KUZU.pof, PAMUKLAR[i], 240, 240, KARE_MS.pof); ses('kz-pof');
    govdeY.goster(KUZU.govdePof); setTimeout(dolgu, sure(300));
    sasirKalan = 900; mee(0.8); kinoTepki('sasir', 700, 18);
  }

  // ——————————————————————————— 2 · yama seç
  YAMA_TURLERI.forEach(t => yamaButonlari[t].addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan()) return;
    if (asama() === 'sec') {
      secilen = t; ortala(isik, YAMA_YERLERI[t], 360, 360); isik.hidden = false; pop(yamaButonlari[t], 260); ses('kz-yama', 0.7, 1.1); mutluKalan = 700; kinoTepki('sevin', 500, 14);
      yamaElY.goster(KUZU.yama[t]); yamaYer.goster(KUZU.yamaYerinde[t]);
      ilerle(); ziplat(yamaButonlari[t]);
      return;
    }
    if (asama() !== 'yama') { titret(yamaButonlari[t]); ses('kz-yama', 0.3, 1.3); }
  }));
  YAMA_TURLERI.forEach(t => I.aletDugmesi(yamaButonlari[t], 'yama', () => asama() === 'yama' && secilen === t));

  // ——————————————————————————— 4 · yamanın köşelerine bas
  koseler.forEach((b, i) => b.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'kose' || yapisik[i]) return;
    yapisik[i] = true; b.hidden = true;
    ses('kz-pit', 0.9, 0.9 + yapisik.filter(Boolean).length * 0.1);
    void oynat(KUZU.kosePit, KOSELER[i], 160, 160, KARE_MS.pit);
    yamaYer.kutu.animate([{ transform: 'scale(1)' }, { transform: 'scale(.95)' }, { transform: 'scale(1)' }], { duration: sure(160) });
    hop(govdeY.kutu, 6, 180); mutluKalan = 500; kinoTepki('sevin', 400, 10);
    if (yapisik.every(Boolean)) {
      yamaYer.goster(KUZU.yamaYapisik[secilen!]); pop(yamaYer.kutu, 260); parilti(SOKUK, 240);
      ses('e-cin', 0.6); soyle('lk-yama'); mee();
      ilerle(); ziplat(dokCirt);
    }
  }));

  // ——————————————————————————— 6 · düğmeyi saat yönünde çevir
  gozR.addEventListener('pointerdown', e => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'dugme' || !dugmeTakili || dugmeBitti) return;
    cevirTut = { id: e.pointerId };
    cevir = { ...cevir, aci: null };
    try { gozR.setPointerCapture(e.pointerId); } catch { /* */ }
    ses('kz-vida', 0.4, 1.3);
  });
  addEventListener('pointermove', e => {
    if (!cevirTut || e.pointerId !== cevirTut.id) return;
    cevir = cevirAdimi(cevir, I.noktaya(e));
    gozY.kutu.style.rotate = `${((cevir.toplam * 180) / Math.PI).toFixed(1)}deg`;
    const yt = yarimTur(cevir.toplam);
    if (yt > sonYarim) { sonYarim = yt; ses('kz-vida', 0.8, 0.9 + yt * 0.06); void oynat(KUZU.vida, GOZ, 300, 300, KARE_MS.vida); gozY.goster(KUZU.dugmeYerinde[yt % 2]); kikirKalan = 400; }
    if (firladiMi(cevir)) { cevirTut = null; void dugmeFirladi(); return; }
    if (cevir.toplam >= Z.dugme) {
      cevirTut = null; dugmeBitti = true;
      parilti(GOZ, 220); ses('e-cin', 0.6); soyle('lk-goz'); mee(); mutluKalan = 1200; kinoTepki('sevin', 800, 24);
      ilerle(); ziplat(kurdeleSol);
    }
  }, { signal: I.iptal });
  const cevirBirak = (e: PointerEvent) => { if (cevirTut && e.pointerId === cevirTut.id) cevirTut = null; };
  addEventListener('pointerup', cevirBirak, { signal: I.iptal });
  addEventListener('pointercancel', cevirBirak, { signal: I.iptal });
  async function dugmeFirladi() {
    // ters çevrildi: düğme "pıt" diye fırlar, yuvarlanıp şeride döner
    dugmeTakili = false; firladi = true; gozR.hidden = true; gozY.kutu.style.rotate = '';
    ses('kz-firla'); void oynat([KUZU.dugmePit], GOZ, 300, 300, 260);
    void oynat([KUZU.dugmeYuvarlan], { x: GOZ.x + 60, y: GOZ.y + 80 }, 240, 240, 600, { kayX: -420, kay: -380, don: -720 });
    sasirKalan = 1000; mee(0.7); kinoTepki('sasir', 800, 22);
    cevir = cevirBaslangici(); sonYarim = 0;
    await bekle(500);
    gec('dugme'); dokDugme.hidden = false; ziplat(dokDugme);
  }

  // ——————————————————————————— 7 · kurdele: uçları çaprazla, fiyonku çek
  const kurdeleBas = (uc: 'sol' | 'sag' | 'fiyonk') => (e: PointerEvent) => {
    if (e.button !== 0 || I.tutulan() || asama() !== 'kurdele' || bagli) return;
    kurdeleTut = { id: e.pointerId, uc, y: I.noktaya(e).y };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* */ }
    ses('kz-kurdele', 0.4, 1.3);
  };
  kurdeleSol.addEventListener('pointerdown', kurdeleBas('sol'));
  kurdeleSag.addEventListener('pointerdown', kurdeleBas('sag'));
  fiyonk.addEventListener('pointerdown', kurdeleBas('fiyonk'));
  addEventListener('pointermove', e => {
    if (!kurdeleTut || e.pointerId !== kurdeleTut.id) return;
    const p = I.noktaya(e);
    if (kurdeleTut.uc === 'fiyonk') {
      const c = kurdeleTut.y - p.y;
      fiyonk.style.transform = `translateY(${-Math.max(0, Math.min(c, FIYONK_CEK))}px)`;
      if (c >= FIYONK_CEK) { kurdeleTut = null; void bagla(); }
      return;
    }
    const b = kurdeleTut.uc === 'sol' ? kurdeleSol : kurdeleSag;
    ortala(b, { x: p.x, y: KURDELE.sol.y + Math.min(60, Math.max(-60, p.y - KURDELE.sol.y)) }, KURDELE_DUGMESI, KURDELE_DUGMESI);
    if (kurdeleTut.uc === 'sol' && !solTamam && solGecti(p.x)) { solTamam = true; kurdeleTut = null; ses('kz-kurdele', 0.8); pop(b, 200); fiyonkHazir(); }
    else if (kurdeleTut.uc === 'sag' && !sagTamam && sagGecti(p.x)) { sagTamam = true; kurdeleTut = null; ses('kz-kurdele', 0.8, 1.1); pop(b, 200); fiyonkHazir(); }
  }, { signal: I.iptal });
  const kurdeleBirak = (e: PointerEvent) => {
    if (!kurdeleTut || e.pointerId !== kurdeleTut.id) return;
    const uc = kurdeleTut.uc; kurdeleTut = null;
    if (uc === 'sol' && !solTamam) { ortala(kurdeleSol, KURDELE.sol, KURDELE_DUGMESI, KURDELE_DUGMESI); kikirKalan = 500; ses('kz-kurdele', 0.4, 0.8); }
    if (uc === 'sag' && !sagTamam) { ortala(kurdeleSag, KURDELE.sag, KURDELE_DUGMESI, KURDELE_DUGMESI); kikirKalan = 500; ses('kz-kurdele', 0.4, 0.8); }
    if (uc === 'fiyonk') { fiyonk.style.transform = ''; ziplat(fiyonk); }
  };
  addEventListener('pointerup', kurdeleBirak, { signal: I.iptal });
  addEventListener('pointercancel', kurdeleBirak, { signal: I.iptal });
  function fiyonkHazir() {
    kinoTepki('sevin', 400, 12); utanKalan = 500;
    if (!solTamam || !sagTamam) return;
    kurdeleSol.hidden = kurdeleSag.hidden = true;
    capraz.hidden = false; pop(capraz, 220);
    fiyonk.hidden = false; fiyonkY.goster(KUZU.kurdeleFiyonk[0]); pop(fiyonk, 240); ziplat(fiyonk);
    I.asamaGec('kurdele');
  }
  async function bagla() {
    bagli = true;
    fiyonkY.goster(KUZU.kurdeleFiyonk[1]); ses('kz-kurdele', 1, 1.1);
    await bekle(KARE_MS.fiyonk * 2);
    capraz.hidden = true; fiyonk.hidden = true;
    kurdeleY.goster(KUZU.kurdeleBagli); pop(kurdeleY.kutu, 240); parilti(KURDELE.boyun, 220);
    ses('e-cin', 0.6); soyle('lk-kurdele'); mee(); mutluKalan = 1000; kinoTepki('sevin', 700, 22);
    ilerle(); ziplat(dokFirca);
  }

  // ——————————————————————————— aletleri ele alma
  I.aletDugmesi(dokCirt, 'cirt', () => asama() === 'cirt', () => { cirtElY.goster(KUZU.cirt); kivrik = false; cirtHizi = 0; });
  I.aletDugmesi(dokDugme, 'dugme', () => asama() === 'dugme' && !dugmeTakili);
  I.aletDugmesi(dokFirca, 'firca', () => asama() === 'kabart');

  const siradaki = (): HTMLElement[] => {
    const a = asama();
    if (a === 'tikistir') { const kalan = pamuklar.filter((_, i) => !pamukYerinde[i]); return kalan.length ? kalan : (Z.pamuk > PAMUKLAR.length && !sepettenAlindi ? [sepet] : []); }
    if (a === 'sec') return Object.values(yamaButonlari);
    if (a === 'yama') return secilen ? [yamaButonlari[secilen]] : [];
    if (a === 'kose') return koseler.filter((_, i) => !yapisik[i]);
    if (a === 'cirt') return [dokCirt];
    if (a === 'dugme') return dugmeTakili ? [gozR] : [dokDugme];
    if (a === 'kurdele') return !solTamam ? [kurdeleSol] : !sagTamam ? [kurdeleSag] : [fiyonk];
    if (a === 'kabart') return [dokFirca];
    return [];
  };

  return {
    yaklasinca: () => { gec('tikistir'); pamuklar.forEach(ziplat); },
    kutlamaYeri: { x: 900, y: 480 },
    siradaki,
    kinoSasirsin: () => sasirKalan > 0,
    bosDokunus: (p: Nokta) => { if (uzak(p, YUZ) < 200 || sokuktaMi(p)) mee(0.6); },
    kalkinca: (t: Tutulan) => {
      const uc = I.ucNoktasi(t);
      if (t.ad === 'pamuk' && asama() === 'tikistir') {
        if (!sokuktaMi(uc)) { ses('kz-pof', 0.4, 1.3); kikirKalan = 400; return false; }
        const i = tutulanPamuk;
        void I.yerineKoy(t, SOKUK, 0.3, 160).then(() => {
          if (i >= 0) { pamukYerinde[i] = true; pamuklar[i].hidden = true; } else { sepettenAlindi = true; sepetY.goster(KUZU.sepetBos); }
          itilen++; dolgu();
          ses('kz-it', 0.9, 0.9 + itilen * 0.08); void oynat(KUZU.pamukParca, SOKUK, 300, 300, KARE_MS.parca, { kay: 60 });
          utanKalan = 500; kinoTepki('sevin', 400, 12);
          if (itilen >= Z.pamuk) {
            sokukR.classList.add('kz-kapandi'); ses('e-cin', 0.5); soyle('lk-pamuk'); mee();
            ilerle(); Object.values(yamaButonlari).forEach(ziplat);
          } else if (itilen >= PAMUKLAR.length) ziplat(sepet);
        });
        return true;
      }
      if (t.ad === 'yama' && asama() === 'yama') {
        const yer = yamaYeri(uc);
        if (yer === 'tam') {
          void I.yerineKoy(t, SOKUK, 1, 180).then(() => {
            yamaKondu = true; yamaButonlari[secilen!].hidden = true; isik.hidden = true;
            yamaYer.kutu.hidden = false; pop(yamaYer.kutu, 220); ses('kz-yama');
            koseler.forEach(b => { b.hidden = false; }); kinoTepki('sevin', 500, 14);
            ilerle(); koseler.forEach(ziplat);
          });
          return true;
        }
        if (yer === 'kayar') {
          // kaymış yama: kayıp düşer, yerine döner
          void oynat(KUZU.kayma, uc, 300, 300, KARE_MS.kayma * 2, { kay: -220, don: 40 });
          kaydi = true; ses('kz-kay'); kikirKalan = 700; kinoTepki('sasir', 500, 14);
        }
        return false;
      }
      if (t.ad === 'dugme' && asama() === 'dugme') {
        if (uzak(uc, GOZ) > 110) { ses('kz-pit', 0.4, 0.8); return false; }
        void I.yerineKoy(t, GOZ, 1, 160).then(() => {
          dugmeTakili = true; gozR.hidden = false; gozY.goster(KUZU.dugmeYerinde[0]); gozY.kutu.style.rotate = '0deg'; pop(gozR, 220);
          dokDugme.hidden = true; ses('kz-pit', 0.8); merakKalan = 800; kinoTepki('sevin', 400, 12);
          I.asamaGec('dugme'); ziplat(gozR);
        });
        return true;
      }
      return false;
    },
    kare: (dt: number, an: number, h: Tutulan | null, uc: Nokta | null, yol: number) => {
      meeKalan = Math.max(0, meeKalan - dt); sasirKalan = Math.max(0, sasirKalan - dt); kikirKalan = Math.max(0, kikirKalan - dt); utanKalan = Math.max(0, utanKalan - dt);
      gidikKalan = Math.max(0, gidikKalan - dt); merakKalan = Math.max(0, merakKalan - dt); mutluKalan = Math.max(0, mutluKalan - dt);
      const a = asama();
      const poz = yuzPozu({ asama: a, meeKalan, sasirKalan, kikirKalan, utanKalan, gidikKalan, merakKalan, mutluKalan, an });
      if (poz !== yuzSimdi) { yuzSimdi = poz; yuzY.goster(KUZU.yuz[poz]); yuzY.kutu.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: sure(160) }); }
      if (!h || !uc) return;
      // ——— 1 · pamuk: hızlı itince karşı taraftan biri geri çıkar
      if (h.ad === 'pamuk' && a === 'tikistir') {
        pamukHizi = ortalamaHiz(pamukHizi, yol / Math.max(1, dt), dt);
        if (sokuktaMi(uc) && pamukHizi > Z.itHiz && pamukYerinde.some(Boolean) && an - sesAni > 1200) { sesAni = an; pamukGeriCiksin(); }
        if (sokuktaMi(uc)) merakKalan = 200;
        return;
      }
      // ——— 5 · cırt cırt: kulağın yırtığı boyunca; hızlıysa bant kıvrılır
      if (h.ad === 'cirt' && a === 'cirt') {
        cirtHizi = ortalamaHiz(cirtHizi, yol / Math.max(1, dt), dt);
        if (kivrik) { if (!yirtikta(uc)) { kivrik = false; cirtElY.goster(KUZU.cirt); cirt = cirtBaslangici(); cirtR.hidden = true; } return; }
        if (!yirtikta(uc)) return;
        if (cirtHizi > Z.cirtHiz && cirtOrani(cirt) > 0.1) {
          kivrik = true; kivrildi = true; cirtElY.goster(KUZU.cirtKivrik); ses('kz-kivril'); kikirKalan = 800; kinoTepki('sasir', 600, 16);
          cirtR.hidden = true;
          return;
        }
        cirt = cirtAdimi(cirt, uc);
        const o = cirtOrani(cirt);
        cirtR.hidden = o <= 0; cirtR.style.clipPath = `inset(0 ${((1 - o) * 100).toFixed(1)}% 0 0)`;
        if (yol > 3 && an - sesAni > 160) { sesAni = an; ses('kz-cirt', 0.7, 0.9 + o * 0.3); void oynat(KUZU.cirtIz, uc, 300, 200, KARE_MS.iz); gidikKalan = 300; }
        if (o >= CIRT_TAMAM) {
          cirtR.style.clipPath = ''; cirtR.src = I.adres(KUZU.cirtTamam) ?? ''; cirtR.hidden = false; kulakSokuk.classList.add('kz-kapandi');
          void oynat(KUZU.kulakSallan, { x: 600, y: 280 }, 500, 400, KARE_MS.sallan);
          ses('e-cin', 0.6); soyle('lk-kulak'); mee(); kinoTepki('sevin', 700, 20);
          void I.yerineKoy(h, { x: (KULAK_YIRTIK.bas.x + KULAK_YIRTIK.son.x) / 2, y: KULAK_YIRTIK.bas.y }, 0.3, 160);
          dokCirt.hidden = true;
          ilerle(); ziplat(dokDugme);
        }
        return;
      }
      // ——— 8 · kabart: yün kıvrımlarında küçük daireler
      if (h.ad === 'firca' && a === 'kabart') {
        const i = yunBul(uc, yunBitti, Z.yun);
        if (i < 0) return;
        const aci = Math.atan2(uc.y - YUNLER[i].y, uc.x - YUNLER[i].x);
        if (uzak(uc, YUNLER[i]) < 25) return;
        const once = yunAci[i]; yunAci[i] = aci;
        if (once === null) return;
        const f = Math.abs(Math.max(-0.6, Math.min(0.6, aciFarki(once, aci))));
        yunOv[i] += f;
        if (an - tozAni > 160 && f > 0.02) { tozAni = an; void oynat(KUZU.toz, uc, 300, 300, KARE_MS.toz, { kay: 80 }); ses('kz-firca', 0.6, 0.9 + Math.random() * 0.2); gidikKalan = 400; }
        if (yunOv[i] >= Z.yunOv) {
          yunBitti[i] = true; yunler[i].goster(KUZU.yun[1]); pop(yunler[i].kutu, 240);
          void oynat([KUZU.yunParilti], YUNLER[i], 300, 300, 400); ses('kz-toz', 0.7); kikirKalan = 600; kinoTepki('sevin', 400, 12);
          if (yunBitti.slice(0, Z.yun).every(Boolean)) {
            I.birak(h); mee(); ses('e-cin', 0.6);
            for (let k = 0; k < 3; k++) setTimeout(() => void oynat(KUZU.kalp, { x: YUZ.x + 200 + k * 120, y: YUZ.y - 200 }, 160, 160, KARE_MS.kalp, { kay: 160 }), sure(k * 160));
            setTimeout(() => { if (I.calisiyor()) { gec('kutlama'); void I.kutla(); } }, sure(900));
          }
        }
      }
    },
    test: {
      nokta: (ad: string) => {
        const p: Record<string, Nokta> = {
          sokuk: SOKUK, sepet: SEPET_PAMUGU, goz: GOZ, yuz: YUZ, boyun: KURDELE.boyun, kurdeleSol: KURDELE.sol, kurdeleSag: KURDELE.sag, kulakBas: KULAK_YIRTIK.bas, kulakSon: KULAK_YIRTIK.son,
          ...Object.fromEntries(PAMUKLAR.map((q, i) => ['pamuk' + i, q])), ...Object.fromEntries(KOSELER.map((q, i) => ['kose' + i, q])), ...Object.fromEntries(YUNLER.map((q, i) => ['yun' + i, q])),
          ...Object.fromEntries(YAMA_TURLERI.map(t => ['yama-' + t, YAMA_YERLERI[t]])),
        };
        return p[ad] ? I.ekrana(p[ad]) : null;
      },
      yuz: () => yuzSimdi,
      sayim: () => ({ itilen, hedefPamuk: Z.pamuk, sepettenAlindi, secilen, yamaKondu, yapisik: yapisik.filter(Boolean).length, cirt: cirtOrani(cirt), kivrik, dugmeTakili, cevir: cevir.toplam, hedefDugme: Z.dugme, dugmeBitti, solTamam, sagTamam, bagli, yun: yunBitti.filter(Boolean).length, hedefYun: Z.yun, geriCikti, firladi, kaydi, kivrildi }),
      cizimler: () => ({ pamukBoyu: PAMUK_BOYU, yamaBoyu: YAMA_BOYU, dugmeBoyu: DUGME_BOYU, yunYaricapi: YUN_YARICAPI }),
    },
  };
}
