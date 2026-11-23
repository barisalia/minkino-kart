/**
 * Ovala, Bul (Oyuncaklar · Köpüklü Küvet, Meyve · Lokum'un Bahçesi, Doğa · Sisli Vadi). Veri: ovala-veri.ts.
 *
 * Sahnenin üstünde bir örtü durur (köpük, toprak, sis). Polly "Where is the robot?" diye sorar; çocuk parmağıyla örtüyü
 * OVALAR, parmağın geçtiği yer silinir. Bir şeyin kutusu yeterince açılınca o şey ortaya çıkar ve adını duyar; sorulan
 * çıkınca Polly "Yes!" der, cümlesini söyler, örtü yeniden kapanır ve sıradaki soru gelir. Yanlış bir şeyi açmak hata
 * sayılmaz: keşfetmenin parçasıdır (adını duyar).
 *
 * Dokunma: parmağı kaydırmadan dokunmak da örtüde büyükçe bir delik açar (küçükler takılmaz). Klavyeyle her saklanma
 * yeri bir düğmedir (yalnız odakta görünür).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { cizim, dugme, hareket, ipucuKur, kutla } from '../kit';
import { tik } from '../ses';
import { resim } from '../varlik';
import { oyunDuzeni, yasam, type AdimKurucu } from './ortak';
import { ACILMA_ORANI, OVALA_SAHNELERI, OV_TUVAL, ovYolu, type Kutu } from './ovala-veri';
import './ovala.css';

/** Örtü tuvalinin iç çözünürlüğü (ekranda büyütülür; silme ve ölçme hızlı kalsın) */
const EN = 800, BOY = 500;
const OLCEK = EN / OV_TUVAL.en;
const yuzde = (k: Kutu) => ({ left: `${(k[0] / OV_TUVAL.en) * 100}%`, top: `${(k[1] / OV_TUVAL.boy) * 100}%`, width: `${(k[2] / OV_TUVAL.en) * 100}%`, height: `${(k[3] / OV_TUVAL.boy) * 100}%` });

export const ovalaKur: AdimKurucu<'ovala'> = (b, a) => {
  const y = yasam();
  const s = OVALA_SAHNELERI.find((x) => x.ad === a.plan.sahne)!;
  let no = 0, kilit = true, acilanlar = new Set<string>();
  const hedef = () => a.plan.hedefler[no];
  const { masa } = oyunDuzeni(b.alan, `ing-ov ing-ov-${s.ad}`, () => { if (no < a.plan.hedefler.length) void y.soyle(`en/q-${hedef().id}`); });

  // ---- sahne: fon (her şey açıkta), üstünde örtü tuvali; çizimi yoksa (taslak) düz renk ve adlı kutular
  const sahne = h('div.ing-ov-sahne', { 'data-sahne': s.ad });
  const fon = cizim(ovYolu(s, 'fon'), 'ing-ov-fon');
  if (fon) sahne.append(fon);
  else {
    sahne.style.background = s.fonRengi;
    for (const [id, k] of Object.entries(s.yerler)) { const yt = h('span.ing-ov-yer-tutucu', {}, id); Object.assign(yt.style, yuzde(k)); sahne.append(yt); }
  }
  const tuval = h('canvas.ing-ov-ortu', { width: EN, height: BOY, 'aria-hidden': 'true' }) as HTMLCanvasElement;
  const g = tuval.getContext('2d', { willReadFrequently: true })!;
  const ortuAdresi = resim(ovYolu(s, 'ortu'));
  let ortuResmi: HTMLImageElement | null = null;
  function ortuyuKapat() {
    g.globalCompositeOperation = 'source-over';
    g.clearRect(0, 0, EN, BOY);
    if (ortuResmi?.complete && ortuResmi.naturalWidth) g.drawImage(ortuResmi, 0, 0, EN, BOY);
    else { g.fillStyle = s.ortuRengi; g.globalAlpha = 0.94; g.fillRect(0, 0, EN, BOY); g.globalAlpha = 1; }
    tuval.classList.remove('ing-ov-kapandi'); void tuval.offsetWidth; tuval.classList.add('ing-ov-kapandi');
  }
  if (ortuAdresi) { ortuResmi = new Image(); ortuResmi.onload = () => { if (y.acik && !acilanlar.size) ortuyuKapat(); }; ortuResmi.src = ortuAdresi; }
  ortuyuKapat();
  sahne.append(tuval);

  // klavye için saklanma yerleri (yalnız odakta görünür); test kipinde hedef burada okunur
  const yerler = new Map<string, HTMLButtonElement>();
  for (const [id, k] of Object.entries(s.yerler)) {
    const d = dugme('ing-ov-yer', 'Örtüyü sil', () => { if (!kilit) { sil(k, true); void bak(); } });
    Object.assign(d.style, yuzde(k));
    d.dataset.kelime = id;
    sahne.append(d);
    yerler.set(id, d);
  }
  masa.append(h('div.ing-ov-duzen', {}, sahne));

  // ---- ovalama: parmağın yolu silinir; kaydırmadan dokunmak büyükçe bir delik açar
  const firca = () => Math.round(EN * 0.055);
  let son: { x: number; y: number } | null = null, kaydi = false, olcZamani = 0;
  const nokta = (e: PointerEvent) => { const r = tuval.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * EN, y: ((e.clientY - r.top) / r.height) * BOY }; };
  function cizgi(p: { x: number; y: number }, q: { x: number; y: number }, r: number) {
    g.globalCompositeOperation = 'destination-out';
    g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = r * 2;
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x + 0.01, q.y); g.stroke();
  }
  function sil(k: Kutu, hepsi = false) {
    g.globalCompositeOperation = 'destination-out';
    if (hepsi) g.fillRect(k[0] * OLCEK, k[1] * OLCEK, k[2] * OLCEK, k[3] * OLCEK);
  }
  tuval.addEventListener('pointerdown', (e) => {
    if (kilit) return;
    son = nokta(e); kaydi = false;
    tuval.setPointerCapture?.(e.pointerId);
    tik.dokun();
  });
  tuval.addEventListener('pointermove', (e) => {
    if (!son || kilit) return;
    const p = nokta(e);
    if (!kaydi && Math.hypot(p.x - son.x, p.y - son.y) < 3) return;
    kaydi = true;
    cizgi(son, p, firca());
    son = p;
    const simdi = performance.now();
    if (simdi - olcZamani > 120) { olcZamani = simdi; void bak(); }
  });
  const birak = () => {
    if (!son) return;
    if (!kaydi && !kilit) cizgi(son, son, firca() * 1.6);
    son = null;
    void bak();
  };
  tuval.addEventListener('pointerup', birak);
  tuval.addEventListener('pointercancel', birak);

  /** Kutunun ne kadarı açıldı (örtünün saydam kalan payı) */
  function acik(k: Kutu): number {
    const x = Math.round(k[0] * OLCEK), yy = Math.round(k[1] * OLCEK), w = Math.round(k[2] * OLCEK), hh = Math.round(k[3] * OLCEK);
    const d = g.getImageData(x, yy, w, hh).data;
    let bos = 0, n = 0;
    for (let i = 3; i < d.length; i += 16) { n++; if (d[i] < 60) bos++; }
    return n ? bos / n : 0;
  }

  /** Yeterince açılan şeyleri ortaya çıkarır; sorulan çıktıysa tur biter */
  let bakiyor = false;
  async function bak() {
    if (kilit || bakiyor) return;
    bakiyor = true;
    try {
      for (const [id, k] of Object.entries(s.yerler)) {
        if (acilanlar.has(id) || acik(k) < ACILMA_ORANI) continue;
        acilanlar.add(id);
        sil(k, true);
        const isaret = h('span.ing-ov-cikti', { 'aria-hidden': 'true' });
        Object.assign(isaret.style, yuzde(k));
        sahne.append(isaret);
        y.sonra(() => isaret.remove(), 1200);
        if (id === hedef().id) { await bulundu(isaret); return; }
        tik.dokun();
        void y.soyle(`en/w-${id}`);
      }
    } finally { bakiyor = false; }
  }

  async function bulundu(isaret: HTMLElement) {
    kilit = true;
    ipucuKur(undefined);
    const w = hedef();
    b.cevap(w.id, true);
    tik.yapis();
    kutla(isaret);
    if (no % 2 === 1) void hareket('polly', 'sevin');
    if (!(await y.soyle('en/g-yes', `en/c-${w.id}`))) return;
    no++;
    if (no < a.plan.hedefler.length) { await y.dur(250); acilanlar = new Set(); ortuyuKapat(); void sor(); return; }
    // hepsi bulundu: örtü tamamen kalkar, sahne açıkta kalır
    tuval.classList.add('ing-ov-kalkti');
    sahne.classList.add('ing-ov-tamam');
    kutla(sahne);
    if (!(await y.soyle(s.son.id))) return;
    if (!(await y.dur(700))) return;
    b.bitti();
  }

  async function sor() {
    kilit = true;
    if (TEST_MODU) sahne.dataset.hedef = hedef().id;
    if (!(await y.soyle(`en/q-${hedef().id}`))) return;
    kilit = false;
    // bir süre dokunmazsa el, sorulanın yerini gösterir (ovalaması için)
    ipucuKur(() => yerler.get(hedef().id), 7000);
  }

  b.tekrarla(() => { if (no < a.plan.hedefler.length) void y.soyle(`en/q-${hedef().id}`); });
  void (async () => {
    if (!(await y.soyle(s.giris.id))) return;
    await sor();
  })();
  return () => y.kapat();
};
