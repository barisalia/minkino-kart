// "Dikenli Pati" · göğüs sahnesi: stetoskopla kalp dinlenir. Başlık göğüste gezdirilir; kalbe yaklaştıkça "güm güm"
// büyür (sıcak-soğuk), kalbin üstünde tutulunca atışlar sayılır; Zıpzıp'ın korkusu geçer, kalbi sakinleşir.
// Çizimler: Paket Doktor-A1, D grubu. Biri eksikse sahne oyunda yoktur.
import { A1, A1_EK, DINLEME_MS, GOGUS, atisArasi, dinlemeAdimi, kalpYakinligi, kinoUzanmasi } from './a1';
import { KareDizisi, Pozlar, Surukle, el, hop, koy, ortala, uzak, type AltSahne, type Ortam } from './parca';
import type { Nokta } from './veri';

type Govde = 'korkulu' | 'merak' | 'kikir' | 'sakin' | 'kirp' | 'nefes0' | 'nefes1';
type KinoPoz = 'bekle' | 'uzan' | 'dinle0' | 'dinle1' | 'bekleKirp' | 'uzanKirp';
/** stetoskopun kutusu ve başlığın kutudaki yeri (çizimden ölçüldü) */
const KUTU = GOGUS.stetoskopBoyu, BASLIK: readonly [number, number] = [GOGUS.baslik.x / 600, GOGUS.baslik.y / 600];

export function gogusKur(o: Ortam): AltSahne & { ust: HTMLElement; ipucu(): void } {
  const hedef = DINLEME_MS[o.yas];
  const gorunum = el('div', 'vk-gorunum vk-gogus vk-altta');
  const ust = el('div', 'vk-katman vk-ust');
  let dinlenen = 0, atis = 0, atisSayisi = 0, kikirKalan = 0, gidik = 0, degdi = false, tamam = false;
  let bitti: (() => void) | null = null;
  /** Kino'nun o anki kayması (başlığın peşinden yumuşakça gider) */
  const kay = { x: 0, y: 0 };

  const nefesVar = A1.gogus.nefes.every(o.varMi);       // soluk kareleri gelmediyse sakin poz
  const govde = new Pozlar<Govde>(o, { korkulu: A1.gogus.korkulu, merak: A1.gogus.merak, kikir: A1.gogus.kikir, sakin: A1.gogus.sakin, kirp: A1.gogus.kirp, nefes0: nefesVar ? A1.gogus.nefes[0] : A1.gogus.sakin, nefes1: nefesVar ? A1.gogus.nefes[1] : A1.gogus.sakin }, 'vk-fon gg-govde');
  koy(govde.kutu, o.kutu(A1.gogus.sakin));
  const kalp = new KareDizisi(o, A1.kalp, 'vk-katman gg-kalp'); ortala(kalp.kutu, GOGUS.kalpGoster, 240, 240);
  // Kino sağda, iri (onaylı anahtar karedeki kadraj). Başlık patilerinin arasında bekler; çocuk alınca kolu başlıkla
  // birlikte Zıpzıp'a uzanır, kalbi duyunca gözlerini kapatıp dinler. Oyundaki başlık Kino'nun ALTINDA durur:
  // evdeyken çizili başlığın altında gizlidir, çekilince manşetin ucundan çıkar, hortumu manşetin içinde kalır.
  const kino = new Pozlar<KinoPoz>(o, { bekle: A1_EK.gogusBekle, uzan: A1_EK.gogusUzan, dinle0: A1_EK.gogusDinle0, dinle1: A1_EK.gogusDinle1,
    // göz kırpma kareleri isteğe bağlı: yoksa aynı kare kalır
    bekleKirp: o.varMi(A1_EK.gogusBekleKirp) ? A1_EK.gogusBekleKirp : A1_EK.gogusBekle, uzanKirp: o.varMi(A1_EK.gogusUzanKirp) ? A1_EK.gogusUzanKirp : A1_EK.gogusUzan }, 'vk-katman gg-kino');
  koy(kino.kutu, GOGUS.kino);
  const ev = { sol: GOGUS.ev.x - BASLIK[0] * KUTU, ust: GOGUS.ev.y - BASLIK[1] * KUTU, g: KUTU, y: KUTU };
  const stKare = new KareDizisi(o, [A1.stetoskop, A1.stetoskopBasili], 'vk-katman gg-stetoskop');
  const baslik = (): Nokta => ({ x: st.sol + BASLIK[0] * KUTU, y: st.ust + BASLIK[1] * KUTU });
  const gogusta = (p: Nokta) => p.x >= GOGUS.alan.sol && p.x <= GOGUS.alan.sol + GOGUS.alan.g && p.y >= GOGUS.alan.ust && p.y <= GOGUS.alan.ust + GOGUS.alan.y;
  const st = new Surukle(o, stKare.kutu, ev, {
    izin: () => !tamam, kaldir: 40, egim: false,
    sinir: { sol: GOGUS.gezme.sol - BASLIK[0] * KUTU, ust: GOGUS.gezme.ust - BASLIK[1] * KUTU, g: GOGUS.gezme.g, y: GOGUS.gezme.y },
    basladi: () => { o.ses('e-tik', 0.7, 1.2); kino.kutu.classList.remove('vk-sirada'); },
    birakildi: () => { stKare.goster(0); o.ses('e-tik', 0.4, 0.9); if (!tamam) kino.kutu.classList.add('vk-sirada'); },
  });
  kino.kutu.classList.add('vk-sirada');
  gorunum.append(o.resim(A1.gogusFon, 'vk-fon'), govde.kutu, stKare.kutu, kino.kutu, kalp.kutu, ust);
  kalp.kutu.classList.add('gg-gizli');
  const yildizlar = o.yildizHavuzu(ust, 10);

  function nabizHalkasi() {
    const h = el('div', 'vk-katman gg-halka'); ortala(h, GOGUS.kalp, 260, 260); ust.append(h);
    const sil = () => h.remove();
    void h.animate([{ transform: 'scale(.4)', opacity: 0.8 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: o.sure(520), easing: 'ease-out' }).finished.then(sil, sil);
  }
  async function bitir() {
    tamam = true;
    st.birak();
    kino.kutu.classList.remove('vk-sirada');
    o.ses('e-cin', 0.7, 1.2); o.soyle('z-kalp');
    hop(o, kino.kutu, 26);
    o.yildizSac(yildizlar, GOGUS.kalp, 9, 260, 64);
    await o.bekle(560);
    bitti?.(); bitti = null;
  }

  function kare(an: number, dt: number) {
    st.kare(dt);
    kikirKalan = Math.max(0, kikirKalan - dt);
    const b = baslik(), uzaklik = st.tutuluyor ? uzak(b, GOGUS.kalp) : 9999, ustunde = st.tutuluyor && gogusta(b);
    const yakin = st.tutuluyor ? kalpYakinligi(uzaklik) : 0, duyuyor = uzaklik <= GOGUS.duyma;
    stKare.goster(ustunde ? 1 : 0);
    if (ustunde && !degdi) { degdi = true; kikirKalan = 800; o.soyle('z-soguk'); hop(o, govde.kutu, 8, 200); }
    // yanlış yer: başlık gömleğin üstünde ama kalpten uzakta gezerse Zıpzıp gıdıklanıp kıkırdar (kalbi aramaya yöneltir)
    if (!tamam && ustunde && yakin < 0.7) {
      gidik += dt;
      if (gidik > 1400) { gidik = 0; kikirKalan = 650; o.ses('e-hihi', 0.6, 1.15); hop(o, govde.kutu, 10, 200); }
    } else gidik = Math.max(0, gidik - dt * 0.5);
    if (!tamam) {
      const once = dinlenen;
      dinlenen = dinlemeAdimi(dinlenen, uzaklik, dt, hedef);
      // atış: yaklaştıkça güçlü; kalbin üstünde sayılır
      if (yakin > 0) {
        atis -= dt;
        if (atis <= 0) {
          atis = atisArasi(dinlenen, hedef);
          o.ses('g-gum', 0.15 + 0.85 * yakin * yakin, 0.92 + 0.1 * yakin);
          kalp.kutu.animate([{ scale: '1' }, { scale: '1.28', offset: 0.3 }, { scale: '1' }], { duration: o.sure(300), easing: 'ease-out' });
          if (duyuyor) { atisSayisi++; nabizHalkasi(); hop(o, kino.kutu, 8, 180); try { navigator.vibrate?.(12); } catch { /* titreşim yoksa yalnız görüntü */ } }
        }
      } else atis = 0;
      if (once < hedef && dinlenen >= hedef) void bitir();
    }
    // kalp: yaklaştıkça belirir ve büyür
    kalp.kutu.classList.toggle('gg-gizli', !tamam && yakin < 0.25);
    kalp.kutu.style.opacity = tamam ? '1' : String(Math.min(1, 0.25 + yakin));
    kalp.goster(tamam ? 1 : yakin > 0.9 ? 2 : yakin > 0.55 ? 1 : 0);
    // Zıpzıp: korkulu → (ilk değişte) kıkır → merak → dinlendikçe sakin; sakinken soluk alır, göz kırpar
    const sakinlik = dinlenen / hedef;
    const poz: Govde = kikirKalan > 0 ? 'kikir' : tamam || sakinlik > 0.55 ? (an % 3200 < 140 ? 'kirp' : an % 1800 < 900 ? 'nefes0' : 'nefes1') : ustunde ? 'merak' : degdi ? 'merak' : 'korkulu';
    govde.goster(poz);
    govde.kutu.classList.toggle('gg-titrek', poz === 'korkulu');      // korkarken arada titrer (boşta kıpırtı)
    // Kino: başlık elde değilken patilerinde bekler; eldeyken kolu başlığın peşinden uzanır, kalbi duyunca dinler.
    // Bırakılınca başlık Kino'nun altından patilerine döner; Kino da yerine çekilir.
    const evde = !st.tutuluyor && uzak(b, GOGUS.ev) < 6;
    const hedefKay = st.tutuluyor ? kinoUzanmasi(b) : { x: 0, y: 0 }, oran = Math.min(1, dt / (st.tutuluyor ? 70 : 160));
    kay.x += (hedefKay.x - kay.x) * oran; kay.y += (hedefKay.y - kay.y) * oran;
    if (evde && Math.abs(kay.x) + Math.abs(kay.y) < 1) { kay.x = 0; kay.y = 0; }
    kino.kutu.style.transform = `translate3d(${kay.x.toFixed(1)}px, ${kay.y.toFixed(1)}px, 0)`;
    const kirp = an % 3400 < 140;       // boşta kıpırtı: arada göz kırpar
    kino.goster(st.tutuluyor ? (duyuyor ? (atisSayisi % 2 ? 'dinle1' : 'dinle0') : kirp ? 'uzanKirp' : 'uzan') : evde && kay.x === 0 ? (kirp ? 'bekleKirp' : 'bekle') : 'uzan');
  }

  return {
    gorunum, ust, kare,
    ipucu: () => { if (!tamam && !st.tutuluyor) hop(o, kino.kutu, 24, 320); },
    oyna: () => new Promise<void>(r => { bitti = r; o.asamaYaz('gogus'); o.soyle('k-kalp'); }),
    nokta: (ad: string): Nokta | null => (ad === 'stetoskop' ? baslik() : ad === 'baslik' ? baslik() : ad === 'kalp' ? GOGUS.kalp : ad === 'gogus-kenari' ? { x: GOGUS.alan.sol + 80, y: GOGUS.alan.ust + 120 } : null),
    sayim: () => ({ dinlenen: Math.round(dinlenen), hedef, atis: atisSayisi, tamam, poz: govde.simdi, kino: kino.simdi, kay: { x: Math.round(kay.x), y: Math.round(kay.y) } }),
  };
}
