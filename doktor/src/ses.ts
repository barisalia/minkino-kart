// Minik Doktor sesleri: Kino ve Zıpzıp'ın ElevenLabs kayıtları, kısa efektler (assets/doktor/ses/, Scribe ile denetli)
// ve projenin ortak efektlerinden yıldız. Hepsi tek AudioContext'ten çalar; müzik yok.
// Konuşma tek kanaldan: yeni cümle eskisini keser. Efektler üst üste binebilir.
import { TEST_MODU } from '../../src/ui/dom';

const dosyalar = import.meta.glob<string>('../../assets/doktor/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Zıpzıp'ın Dizi" sahnelerinin kayıtları (kanıt sahnesi "Önce Kuzu" ve sonrası)
const sahneSesleri = import.meta.glob<string>('../../assets/doktor/zipzip-diz/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Zıpzıp'ın Dikenli Patisi" (vaka/) kayıtları ve efektleri
const vakaSesleri = import.meta.glob<string>('../../assets/doktor/vaka/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Mino'nun Kurabiyeli Dişleri" (dis/) kayıtları ve efektleri
const disSesleri = import.meta.glob<string>('../../assets/doktor/dis/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Bulut'un Ateşi" (vaka-ates/) kayıtları ve efektleri
const atesSesleri = import.meta.glob<string>('../../assets/doktor/ates/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Mila'nın Boya Lekeleri" (vaka-boya/) kayıtları ve efektleri
const boyaSesleri = import.meta.glob<string>('../../assets/doktor/boya/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Pamuk'un Hapşırığı" (vaka-hapsu/) ve "Polly'nin Karışık Kanadı" (vaka-kanat/) kayıtları ve efektleri
const hapsuSesleri = import.meta.glob<string>('../../assets/doktor/hapsu/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const kanatSesleri = import.meta.glob<string>('../../assets/doktor/kanat/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Lokum'un Guruldayan Karnı" (vaka-karin/) ve "Bulut'un Uğur Böceği" (vaka-bocek/) efektleri ve sözleri
const karinSesleri = import.meta.glob<string>('../../assets/doktor/karin/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const bocekSesleri = import.meta.glob<string>('../../assets/doktor/bocek/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// "Kuzu'nun Sökük Dikişi" (vaka-kuzu/) ve "Mino'nun Kayıp Çıngırağı" (vaka-cingirak/)
const kuzuSesleri = import.meta.glob<string>('../../assets/doktor/kuzu/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const cingirakSesleri = import.meta.glob<string>('../../assets/doktor/cingirak/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
// bekleme odası (klinik/): Kino'nun sözleri ve odanın efektleri
const klinikSesleri = import.meta.glob<string>('../../assets/doktor/klinik/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const ORTAK: Record<string, string> = { yildiz: '../ses/efekt/yildiz.mp3' };
/** Test kipinde sesler sessiz geçer (akış beklemez); ?sesli ile test kipinde de çalar. */
const SESSIZ = TEST_MODU && !new URLSearchParams(location.search).has('sesli');

let ctx: AudioContext | null = null;
let ana: GainNode | null = null;
function baglam(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    ana = ctx.createGain();
    // Tepe sınırlayıcı: söz ve efektler üst üste binince toplam 0 dB'yi aşıp cızırdamaz. Sınırlayıcının kendi kazancı
    // (yaklaşık +2 dB) ana kazançla dengelenir; sessiz bölümlerin düzeyi değişmez.
    const sinir = ctx.createDynamicsCompressor();
    sinir.threshold.value = -4; sinir.knee.value = 4; sinir.ratio.value = 14; sinir.attack.value = 0.002; sinir.release.value = 0.12;
    ana.gain.value = 0.8;
    ana.connect(sinir).connect(ctx.destination);
  }
  return ctx;
}
export function sesiUyandir() {
  const c = baglam();
  if (c.state === 'suspended') void c.resume().catch(() => undefined);
}
document.addEventListener('pointerdown', sesiUyandir, { capture: true });
document.addEventListener('keydown', sesiUyandir, { capture: true });
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) void ctx.suspend().catch(() => undefined);
  else void ctx.resume().catch(() => undefined);
});

const tampon = new Map<string, Promise<AudioBuffer | null>>();
function adres(ad: string): string | undefined {
  const d = klinikSesleri['../../assets/doktor/klinik/ses/' + ad + '.mp3'] ?? karinSesleri['../../assets/doktor/karin/ses/' + ad + '.mp3'] ?? bocekSesleri['../../assets/doktor/bocek/ses/' + ad + '.mp3'] ?? kuzuSesleri['../../assets/doktor/kuzu/ses/' + ad + '.mp3'] ?? cingirakSesleri['../../assets/doktor/cingirak/ses/' + ad + '.mp3'] ?? hapsuSesleri['../../assets/doktor/hapsu/ses/' + ad + '.mp3'] ?? kanatSesleri['../../assets/doktor/kanat/ses/' + ad + '.mp3'] ?? atesSesleri['../../assets/doktor/ates/ses/' + ad + '.mp3'] ?? boyaSesleri['../../assets/doktor/boya/ses/' + ad + '.mp3'] ?? disSesleri['../../assets/doktor/dis/ses/' + ad + '.mp3'] ?? vakaSesleri['../../assets/doktor/vaka/ses/' + ad + '.mp3'] ?? sahneSesleri['../../assets/doktor/zipzip-diz/ses/' + ad + '.mp3'] ?? dosyalar['../../assets/doktor/ses/' + ad + '.mp3'];
  if (d) return d;
  return ORTAK[ad] ? new URL(ORTAK[ad], location.href).href : undefined;
}
export function sesYukle(ad: string): Promise<AudioBuffer | null> {
  let p = tampon.get(ad);
  if (!p) {
    const u = adres(ad);
    p = u ? fetch(u).then(r => r.arrayBuffer()).then(b => baglam().decodeAudioData(b)).catch(() => null) : Promise.resolve(null);
    tampon.set(ad, p);
  }
  return p;
}
export const sesleriYukle = (adlar: string[]) => Promise.all(adlar.map(sesYukle));

function calisinca(c: AudioContext): Promise<void> {
  if (c.state === 'running') return Promise.resolve();
  return new Promise(r => {
    const bak = () => { if (c.state === 'running') { c.removeEventListener('statechange', bak); r(); } };
    c.addEventListener('statechange', bak);
  });
}

let konusan: { kaynak: AudioBufferSourceNode; bitti: () => void } | null = null;
export const konusuyor = () => konusan !== null;
/** Cümleyi çalar; bitince (ya da yeni bir cümle onu kesince) çözülür. basladi: ses gerçekten çalmaya başladığı anda çağrılır
 *  (ağız zamanlaması buradan sayılır; ses bağlamı dokunuş beklerken sahne ilerlemez). */
export async function konus(ad: string, basladi?: () => void): Promise<void> {
  if (SESSIZ) { basladi?.(); await new Promise(r => setTimeout(r, 20)); return; }
  const b = await sesYukle(ad);
  if (!b) { basladi?.(); return; }
  const c = baglam();
  await calisinca(c);
  sus();
  const kaynak = c.createBufferSource();
  kaynak.buffer = b;
  kaynak.connect(ana!);
  await new Promise<void>(r => {
    const kayit = { kaynak, bitti: r };
    konusan = kayit;
    kaynak.onended = () => { if (konusan === kayit) konusan = null; r(); };
    kaynak.start();
    basladi?.();
  });
}
export function sus() {
  const k = konusan;
  konusan = null;
  if (k) { try { k.kaynak.stop(); } catch { /* zaten bitti */ } k.bitti(); }
}
/** Efekt: kazanç 0–1.5, hız (playbackRate) isteğe bağlı. */
export function efekt(ad: string, kazanc = 1, hiz = 1) {
  if (SESSIZ) return;
  void sesYukle(ad).then(b => {
    if (!b) return;
    const c = baglam();
    if (c.state !== 'running') return;
    const k = c.createBufferSource();
    k.buffer = b;
    k.playbackRate.value = hiz;
    const g = c.createGain();
    g.gain.value = kazanc;
    k.connect(g).connect(ana!);
    k.start();
  });
}
