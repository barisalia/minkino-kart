import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  A1, A1_EK, A1_ASAMA, KINO_GOGUS, kinoUzanmasi, defterKadraji, defterDuzeni, DEFTER_DIK, A1_BASTAN, A1_DOSYALAR, A1_EFEKTLER, A1_SAHNE, A1_SOZLER, A1_TUVAL, CIKARTMA_SAYISI, DEFTER, DINLEME_MS, GIRIS, GOGUS, KURU_ALAN, KURU_SATIR, KURU_SUTUN, LAVABO, LAVABO_ADIMLARI, LAVABO_ZORLUK, PAMUK, PAMUK_HEDEF,
  KOPUK_SEVIYE, KOPUK_YERLERI, kopukDegistir, kopukToplami, BANT_DUZLEME, KOPURME, A1_KIRP_SETLERI, kirpKutusu, kinoMasaKaresi, kinoYakinKaresi, mikropKaresi, yuzKaresi, bekleEki, gerginKaresi, kareAnahtarlari, kinoDansKaresi, DIKEN_KOKU, GERGIN_BOY, KOPMA_KARE_MS, YILDIZ_KUYRUK,
  asamaAcik, atisArasi, damgaOturur, islananPati, dinlemeAdimi, dizidekiKare, dongudekiKare, kalpYakinligi, kasede, kuruHucre, kuruOrani, pamukHucre, pamukKiri, pamukOrani, patiUstunde, ruloKaresi,
  sargiKati, soyulmaKaresi, suAltinda, vurusAdimi, vurusBaslangici, yuvaBul, zipDuragi,
} from '../../doktor/src/vaka/a1';
import { HUB, SAHNE, SECMELI, SECMELI_DOSYALAR, VAKA_DOSYALAR, YAKIN } from '../../doktor/src/vaka/veri';

// Minik Doktor · Paket Doktor-A1 (23 Kasım 2026 00:34): "Dikenli Pati"yi baştan sona elit yapan 192 kare.
// Adlar ve tuval ölçüleri Astra'ya yazılan brief'le karşılaştırılır; yeni aşamaların saf hesabı sınanır.

const tum = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
const bas = tum.lastIndexOf('Paket Doktor-A1 (BÜYÜK');
const brief = tum.slice(bas, tum.indexOf('\n## ', bas + 10) > 0 ? tum.indexOf('\n## ', bas + 10) : undefined);

describe('Paket Doktor-A1: adlar ve ölçüler brief\'le birebir', () => {
  it('192 kare, hepsi bir kez; Y1 adlarıyla çakışmaz', () => {
    expect(bas).toBeGreaterThan(0);
    expect(A1_DOSYALAR).toHaveLength(192);
    expect(new Set(A1_DOSYALAR).size).toBe(192);
    for (const ad of A1_DOSYALAR) expect([...VAKA_DOSYALAR, ...SECMELI_DOSYALAR], ad).not.toContain(ad);
    expect(brief).toContain('**195 çizim.**');
  });
  it('koddaki her ad brief\'te geçer (dizi adları "ad-0…N" ya da tek tek)', () => {
    const gecer = (ad: string): boolean => {
      if (brief.includes('`' + ad + '`')) return true;
      // dizi: `onek-0…5` ya da `onek-0`, `onek-1`; mikroplarda `mikrop-0-k0…k3` ve "aynısı mikrop-1-…"
      const m = /^(.*?)-(k?)(\d+)$/.exec(ad);
      if (m) {
        const [, onek, k, n] = m;
        const aralik = new RegExp('`' + onek.replace(/[-]/g, '\\-') + '\\-' + k + '0…' + k + '(\\d+)`').exec(brief);
        if (aralik && Number(n) <= Number(aralik[1])) return true;
      }
      const mk = /^mikrop-[12]-(.*)$/.exec(ad);
      if (mk) return gecer('mikrop-0-' + mk[1]) && brief.includes('`mikrop-1-…`') && brief.includes('`mikrop-2-…`');
      // ortak önekli sıralamalar: `cikartma-yildiz`, `-kalp`, … ve `zipzip-gogus-korkulu`, `-merak`, …
      for (let i = ad.indexOf('-'); i > 0; i = ad.indexOf('-', i + 1)) if (brief.includes('`' + ad.slice(i) + '`') && brief.includes('`' + ad.slice(0, i) + '-')) return true;
      return false;
    };
    const eksik = A1_DOSYALAR.filter(ad => !gecer(ad));
    expect(eksik).toEqual([]);
  });
  it('her karenin tuvali tanımlı; brief\'teki boylarla aynı', () => {
    for (const ad of A1_DOSYALAR) expect(A1_TUVAL[ad], ad).toBeDefined();
    const bekle = (ad: string, g: number, y: number) => { expect(A1_TUVAL[ad]).toEqual([g, y]); expect(brief).toMatch(new RegExp(`${g} × ${y}`)); };
    bekle('zipzip-topal-0', 1000, 940); bekle('kino-ups', 640, 620); bekle('musluk-kol-1', 240, 240); bekle('patiler-temiz', 900, 700); bekle('ovma-7', 900, 700);
    bekle('kino-ayna-kopuk', 480, 480); bekle('sabun-2', 600, 600); bekle('su-akis-3', 140, 520); bekle('su-sicrama-0', 400, 260); bekle('su-damla-1', 160, 200);
    bekle('kopurme-5', 420, 320); bekle('kabarcik-3', 200, 200); bekle('kabarcik-pat-2', 240, 240); bekle('kopuk-akan-0', 360, 200); bekle('mikrop-2-kopukte', 300, 300);
    bekle('kopuk-fiskirma-1', 300, 200); bekle('zipzip-gogus-nefes-1', 2048, 1152); bekle('kalp-2', 300, 300); bekle('diken-kopma-2', 300, 200); bekle('diken-izi', 120, 120);
    bekle('kase-dalga-1', 520, 380); bekle('pamuk-kir-3', 400, 400); bekle('sargi-serit', 400, 100); bekle('sargi-kat-4', 2048, 1152); bekle('bant-kagit-2', 360, 150);
    bekle('zipzip-yakin-gozkisik', 640, 460); bekle('parilti-3', 200, 200); bekle('konfeti-5', 120, 120); bekle('yildiz-kuyruk', 400, 200); bekle('cikartma-gunes', 300, 300);
    bekle('damga', 600, 600); bekle('zipzip-dans-7', 1000, 940);
  });
  it('aşamalar: bir aşamanın bütün çizimleri gelmeden o aşama açılmaz', () => {
    for (const [ad, liste] of Object.entries(A1_ASAMA)) {
      for (const d of liste) expect([...A1_DOSYALAR, ...Object.values(A1_EK)], ad + ': ' + d).toContain(d);
      expect(asamaAcik(ad as keyof typeof A1_ASAMA, () => true)).toBe(true);
      expect(asamaAcik(ad as keyof typeof A1_ASAMA, x => x !== liste[liste.length - 1])).toBe(false);
    }
    expect(asamaAcik('lavabo', () => false)).toBe(false);
  });
  it('bellek: kendi görünümü olan sahnelerin çizimleri baştan yüklenmez; her kare ya baştan ya da tek bir sahneyle yüklenir', () => {
    const sahneler = Object.values(A1_SAHNE).flat();
    expect(new Set(sahneler).size).toBe(sahneler.length);                                                 // bir kare iki sahnede olmaz
    // ek kareler (gülen portre, göğsün iri Kino'su) sahneleriyle yüklenir; eski küçük `kino-dinle` kareleri artık hiç yüklenmez
    expect([...A1_BASTAN, ...sahneler, ...A1.kinoDinle].sort()).toEqual([...A1_DOSYALAR, ...Object.values(A1_EK)].sort());
    for (const d of KINO_GOGUS) { expect(A1_SAHNE.gogus).toContain(d); expect(A1_ASAMA.gogus).toContain(d); expect(A1_TUVAL[d]).toEqual([1200, 1420]); }
    for (const ad of ['lavabo', 'gogus', 'defter', 'dans'] as const) for (const d of A1_ASAMA[ad]) expect(A1_SAHNE[ad], d).toContain(d);
    for (const d of [...A1_ASAMA.giris, ...A1_ASAMA.pamuk]) expect(A1_BASTAN).toContain(d);
    // baştan yüklenenlerde tam sahne boyunda yalnız kat kat sargı var
    expect(A1_BASTAN.filter(ad => A1_TUVAL[ad][0] === 2048)).toEqual([...A1.sargiKat]);
  });
});

describe('lavabo: doktorun el yıkaması', () => {
  it('yerleşim brief\'teki ölçülerle; patiler lavabonun içinde, sabun ve havlu dışında', () => {
    expect(brief).toContain('Lavabonun içi x 520…1480, y 300…1010'); expect(LAVABO.ic).toEqual({ sol: 520, ust: 300, g: 960, y: 710 });
    expect(brief).toContain('**ağzının ucu (1000, 330)**'); expect(LAVABO.agiz).toEqual({ x: 1000, y: 330 });
    expect(brief).toContain('merkezi (1740, 470)'); expect(brief).toContain('merkezi (260, 800)'); expect(brief).toContain('camın merkezi (300, 280), yarıçapı 210');
    expect(brief).toContain('**sol patinin merkezi (300, 300), sağ patinin merkezi (600, 300)**');
    const p = LAVABO.patiYeri;
    for (const m of LAVABO.patiMerkezleri) { expect(p.sol + m.x).toBeGreaterThan(LAVABO.ic.sol); expect(p.sol + m.x).toBeLessThan(LAVABO.ic.sol + LAVABO.ic.g); expect(p.ust + m.y).toBeGreaterThan(LAVABO.ic.ust); expect(p.ust + m.y).toBeLessThan(LAVABO.ic.ust + LAVABO.ic.y); }
    expect(LAVABO.sabunluk.x).toBeGreaterThan(LAVABO.ic.sol + LAVABO.ic.g); expect(LAVABO.havluYeri.x).toBeLessThan(LAVABO.ic.sol);
    // sürüklenirken patilerin bilekleri hep alt kenarda kalır: tuvalin altı sahnenin altına iner
    expect(LAVABO.patiSiniri.ust + 700).toBeGreaterThanOrEqual(SAHNE.y - 160);
  });
  it('adımlar sırayla; küçük yaşta daha kısa', () => {
    expect(LAVABO_ADIMLARI).toEqual(['ac', 'islat', 'sabun', 'ov', 'durula', 'kapat', 'kurula', 'bitti']);
    for (const k of ['islat', 'sabun', 'ov', 'durula', 'kurula'] as const) { expect(LAVABO_ZORLUK['2-3'][k]).toBeLessThan(LAVABO_ZORLUK['4'][k]); expect(LAVABO_ZORLUK['4'][k]).toBeLessThanOrEqual(LAVABO_ZORLUK['5+'][k]); }
    expect(LAVABO_ZORLUK['5+'].ov).toBeGreaterThanOrEqual(A1.ovma.length);                                 // 5+ yaşta dizinin bütün adımları görülür
  });
  it('dinlenirken su iki patinin arasından akar; patiler sağa ya da sola götürülünce biri ıslanır', () => {
    const u = LAVABO.patiYeri.ust;
    expect(suAltinda(LAVABO.patiYeri.sol, u)).toBe(false);                                                 // orta: sol pati x 850, sağ 1150; ağız 1000
    expect(islananPati(LAVABO.patiYeri.sol, u)).toBeNull();
    expect(suAltinda(LAVABO.agiz.x - 300, u)).toBe(true);                                                  // sol pati tam ağzın altında
    expect(islananPati(LAVABO.agiz.x - 300, u)).toEqual({ x: 1000, y: u + 300 });
    expect(suAltinda(LAVABO.agiz.x - 600, u)).toBe(true);                                                  // sağ pati ağzın altında
    // iki pati de sürükleme sınırının içinde akışın altına gelebilir
    const s = LAVABO.patiSiniri; expect(s.sol).toBeLessThanOrEqual(LAVABO.agiz.x - 600); expect(s.sol + s.g).toBeGreaterThanOrEqual(LAVABO.agiz.x - 300);
    expect(patiUstunde({ x: LAVABO.patiYeri.sol + 300, y: LAVABO.patiYeri.ust + 300 }, LAVABO.patiYeri.sol, LAVABO.patiYeri.ust)).toBe(true);
    expect(patiUstunde(LAVABO.sabunluk, LAVABO.patiYeri.sol, LAVABO.patiYeri.ust)).toBe(false);
  });
  it('vuruş sayacı: ileri geri her dönüş bir vuruş; titreme sayılmaz', () => {
    let v = vurusBaslangici();
    for (const x of [500, 520, 560, 600]) v = vurusAdimi(v, x);
    expect(v.sayi).toBe(1); expect(v.yon).toBe(1);
    for (const x of [590, 610, 595, 605]) v = vurusAdimi(v, x);                                            // titreme
    expect(v.sayi).toBe(1);
    for (const x of [560, 520, 480]) v = vurusAdimi(v, x);
    expect(v.sayi).toBe(2); expect(v.yon).toBe(-1);
    for (let i = 0; i < 6; i++) for (const x of i % 2 ? [460, 400] : [540, 600]) v = vurusAdimi(v, x);
    expect(v.sayi).toBe(8);
  });
  it('köpük yuvaları: sabun geçtiği yeri, ovuşturma hepsini kabartır; su değdiği yeri söndürür', () => {
    expect(KOPUK_YERLERI).toHaveLength(12);
    const s = KOPUK_YERLERI.map(() => 0);
    expect(kopukDegistir(s, LAVABO.patiMerkezleri[0], 130, 1)).toBe(6);                                    // sol patinin altı yuvası
    expect(kopukToplami(s)).toBe(6);
    expect(kopukDegistir(s, { x: 450, y: 300 }, 2000, 1)).toBe(12);                                        // ovuşturma: hepsi
    for (let i = 0; i < 20; i++) kopukDegistir(s, { x: 450, y: 300 }, 2000, 1);
    expect(Math.max(...s)).toBe(KOPUK_SEVIYE); expect(kopukToplami(s)).toBe(12 * KOPUK_SEVIYE);
    expect(kopukDegistir(s, LAVABO.patiMerkezleri[1], 130, -2)).toBe(6);
    expect(kopukToplami(s)).toBe(12 * KOPUK_SEVIYE - 12);
    for (let i = 0; i < 20; i++) kopukDegistir(s, { x: 450, y: 300 }, 2000, -1);
    expect(kopukToplami(s)).toBe(0);
  });
  it('kurulama: havlunun geçtiği hücreler kurur; patilerin dışı sayılmaz', () => {
    const s = LAVABO.patiYeri.sol, u = LAVABO.patiYeri.ust, kuru = new Set<number>();
    expect(kuruHucre({ x: s + 10, y: u + 10 }, s, u)).toBe(-1);
    for (let x = KURU_ALAN.sol + 5; x < KURU_ALAN.sol + KURU_ALAN.g; x += 20) for (let y = KURU_ALAN.ust + 5; y < KURU_ALAN.ust + KURU_ALAN.y / 2; y += 20) { const h = kuruHucre({ x: s + x, y: u + y }, s, u); if (h >= 0) kuru.add(h); }
    expect(kuruOrani(kuru)).toBeCloseTo(0.5);
    expect(KURU_SUTUN * KURU_SATIR).toBe(32);
  });
});

describe('göğüs: stetoskop', () => {
  it('kalbin yeri ve alan brief\'te; kalp alanın içinde', () => {
    // brief'teki yer (1120, 640) taslaktı; gelen çizimde gömlek x 481…1152, y 552…847: kalp oradan ölçüldü
    expect(GOGUS.kalp.x).toBeGreaterThan(481); expect(GOGUS.kalp.x).toBeLessThan(1152); expect(GOGUS.kalp.y).toBeGreaterThan(552); expect(GOGUS.kalp.y).toBeLessThan(847);
    expect(Math.hypot(GOGUS.ev.x - GOGUS.kalp.x, GOGUS.ev.y - GOGUS.kalp.y)).toBeGreaterThan(GOGUS.duyma * 3);    // başlık Kino'nun patisindeyken kalbe uzak (ses yalnız başlık eldeyken çalar)
    // Kino başlığın peşinden uzanır: kalbin üstünde manşet başlığa oturur, sınırın ötesinde durur
    expect(kinoUzanmasi(GOGUS.manset)).toEqual({ x: 0, y: 0 });
    expect(kinoUzanmasi({ x: GOGUS.kalp.x, y: GOGUS.kalp.y })).toEqual({ x: 0, y: GOGUS.kalp.y - GOGUS.manset.y });
    expect(kinoUzanmasi({ x: 0, y: 0 })).toEqual({ x: GOGUS.uzanma.sol, y: GOGUS.uzanma.yukari }); expect(kinoUzanmasi({ x: 2048, y: 1152 })).toEqual({ x: GOGUS.uzanma.sag, y: GOGUS.uzanma.asagi });
    expect(GOGUS.uzanma.yukari).toBeGreaterThan(1152 - 1326);                                                        // yukarı uzanınca ayaklar (çizimde y 1326) telefonda ekranın altında kalır
    const z = GOGUS.gezme; expect(GOGUS.kalp.x).toBeGreaterThan(z.sol); expect(GOGUS.kalp.x).toBeLessThan(z.sol + z.g); expect(GOGUS.kalp.y).toBeGreaterThan(z.ust); expect(GOGUS.kalp.y).toBeLessThan(z.ust + z.y);
    expect(GOGUS.ev.x).toBeLessThan(z.sol + z.g); expect(GOGUS.ev.y).toBeGreaterThan(z.ust); expect(GOGUS.manset.y + GOGUS.uzanma.yukari - z.ust).toBeLessThan(60);
    expect(GOGUS.kino).toEqual({ sol: 890, ust: 0, g: 1200, y: 1420 });                                             // tuval sahnenin tabanına oturur (dinle kareleri alt kenara değer)
    const a = GOGUS.alan; expect(GOGUS.kalp.x).toBeGreaterThan(a.sol); expect(GOGUS.kalp.x).toBeLessThan(a.sol + a.g); expect(GOGUS.kalp.y).toBeGreaterThan(a.ust); expect(GOGUS.kalp.y).toBeLessThan(a.ust + a.y);
  });
  it('sıcak-soğuk: yaklaştıkça artar; kalbin üstünde tutunca süre birikir, uzaklaşınca yavaşça azalır', () => {
    expect(kalpYakinligi(GOGUS.menzil + 50)).toBe(0); expect(kalpYakinligi(GOGUS.duyma)).toBe(1); expect(kalpYakinligi(0)).toBe(1);
    expect(kalpYakinligi(300)).toBeGreaterThan(kalpYakinligi(500));
    let b = 0; for (let i = 0; i < 50; i++) b = dinlemeAdimi(b, 40, 16, DINLEME_MS['4']);
    expect(b).toBe(800);
    b = dinlemeAdimi(b, 400, 100, DINLEME_MS['4']); expect(b).toBe(750);
    for (let i = 0; i < 400; i++) b = dinlemeAdimi(b, 40, 16, DINLEME_MS['4']);
    expect(b).toBe(DINLEME_MS['4']);
    expect(DINLEME_MS['2-3']).toBeLessThan(DINLEME_MS['4']); expect(DINLEME_MS['4']).toBeLessThan(DINLEME_MS['5+']);
    expect(atisArasi(0, 2400)).toBeLessThan(atisArasi(2400, 2400));                                        // dinlendikçe kalp sakinleşir
  });
});

describe('kol: ıslak pamuk ve kat kat sargı', () => {
  it('pamuk sildikçe kirlenir; dolunca kâsede çalkalanır; silinen pay hedefe ulaşınca biter', () => {
    expect(pamukKiri(0)).toBe(0); expect(pamukKiri(3)).toBe(1); expect(pamukKiri(PAMUK.kapasite * 0.6)).toBe(2); expect(pamukKiri(PAMUK.kapasite)).toBe(3);
    const silinen = new Set<number>();
    for (let x = PAMUK.alan.sol + 5; x < PAMUK.alan.sol + PAMUK.alan.g; x += 30) { const h = pamukHucre({ x, y: PAMUK.alan.ust + 20 }); if (h >= 0) silinen.add(h); }
    expect(pamukOrani(silinen)).toBeCloseTo(1 / 3);
    expect(pamukHucre({ x: PAMUK.alan.sol - 10, y: PAMUK.alan.ust + 20 })).toBe(-1);
    expect(kasede({ x: PAMUK.kaseAgzi.x + 20, y: PAMUK.kaseAgzi.y - 30 })).toBe(true); expect(kasede(PAMUK.yer)).toBe(false);
    // 5+ yaşta hedef, bir daldırışla silinebilecekten fazladır: pamuk en az bir kez çalkalanır
    expect(PAMUK_HEDEF['5+'] * PAMUK.sutun * PAMUK.satir).toBeGreaterThan(PAMUK.kapasite);
    expect(PAMUK_HEDEF['2-3']).toBeLessThan(PAMUK_HEDEF['4']);
    // kâse tepsinin yerinde, Kino'nun köşesinin üstünde; alet şeridine girmez
    expect(PAMUK.kase.ust + PAMUK.kase.y).toBeLessThan(YAKIN.kino.ust + 40); expect(PAMUK.yer.y).toBeLessThan(YAKIN.serit.ust);
  });
  it('sargı kat kat: tur ilerledikçe kat ve rulo karesi artar', () => {
    expect(sargiKati(0)).toBe(-1); expect(sargiKati(0.1)).toBe(0); expect(sargiKati(0.5)).toBe(2); expect(sargiKati(0.99)).toBe(4); expect(sargiKati(1)).toBe(4);
    expect(ruloKaresi(0)).toBe(0); expect(ruloKaresi(0.5)).toBe(2); expect(ruloKaresi(1)).toBe(3);
    expect(A1.sargiKat).toHaveLength(5); expect(A1.sargiRulo).toHaveLength(4);
  });
});

describe('ödül: çıkartma defteri; giriş; kare dizileri', () => {
  it('defter yerleşimi brief\'te; çıkartma soyulur, en yakın boş yuvaya oturur', () => {
    expect(brief).toContain('merkezleri (410, 780), (590, 780), (770, 780), çapları 170');
    expect(brief).toContain('x 1220, 1380, 1540, 1700; y 400, 640');
    // brief'teki yerler taslaktı; koddakiler gelen `defter-fon` çiziminden ölçüldü
    expect(DEFTER.tabaka).toHaveLength(8);
    // kadraj: 16:9'da ve telefonda kitap bütünüyle sığıp boyu doldurur; iPad'de kapak yanlardan taşar, içerik ekranda kalır
    const kt = DEFTER.kitap, orta = kt.sol + kt.g / 2;
    expect(defterKadraji(2048, 1152)).toBeCloseTo(2048 / kt.g, 3); expect(defterKadraji(2493, 1152)).toBeCloseTo(1152 / kt.y, 3);
    const ipad = defterKadraji(2048, 1536);
    expect(ipad).toBeCloseTo(2048 / DEFTER.guvenliEn, 3); expect(ipad).toBeGreaterThan(1.1);
    const solKenar = orta - 1024 / ipad, sagKenar = orta + 1024 / ipad;          // ekranın kenarları, defterin iç ölçüsünde
    expect(solKenar).toBeLessThan(DEFTER.yuvalar[0].x - DEFTER.yuvaCapi / 2); expect(sagKenar).toBeGreaterThan(Math.max(...DEFTER.tabaka.map(t => t.x)) + DEFTER.hucre / 2);
    expect(defterKadraji(0, 0)).toBe(1);
    // dik yerleşim (iPad): dik fon varsa 4:3 ve 3:2 ekranda o seçilir, telefonda ve 16:9'da yatay; kitap ekranı doldurur
    expect(defterDuzeni(2048, 1536, true)).toBe(DEFTER_DIK); expect(defterDuzeni(2048, 1365, true)).toBe(DEFTER_DIK);
    expect(defterDuzeni(2048, 1152, true)).toBe(DEFTER); expect(defterDuzeni(2493, 1152, true)).toBe(DEFTER); expect(defterDuzeni(2048, 1536, false)).toBe(DEFTER);
    const kd = defterKadraji(2048, 1536, DEFTER_DIK), D = DEFTER_DIK;
    expect(D.kitap.g * kd).toBeGreaterThan(2048 * 0.98); expect(D.kitap.y * kd).toBeGreaterThan(1536 * 0.9);
    expect(D.fonKutu).toEqual({ sol: 0, ust: -192, g: 2048, y: 1536 }); expect(A1_TUVAL[A1_EK.defterFonDik]).toEqual([2048, 1536]); expect(A1_SAHNE.defter).toContain(A1_EK.defterFonDik);
    expect(D.tabaka).toHaveLength(8); expect(D.yuvalar).toHaveLength(3);
    for (const t of D.tabaka) { expect(t.x - D.hucre / 2).toBeGreaterThan(1065); expect(t.x + D.hucre / 2).toBeLessThan(1925); expect(t.y + D.hucre / 2).toBeLessThan(967 - 192); expect(t.y - D.hucre / 2).toBeGreaterThan(201 - 192); }
    expect(D.yuvalar[1].x - D.yuvalar[0].x).toBeGreaterThan(D.yuvaCapi); expect(D.yuvaCapi).toBeGreaterThan(DEFTER.yuvaCapi * 1.25); expect(D.portreBoyu).toBeGreaterThan(DEFTER.portreBoyu * 1.25);
    expect(damgaOturur(D.damgaHedefi, D)).toBe(true); expect(damgaOturur(D.damgaYeri, D)).toBe(false);
    expect(yuvaBul({ x: D.yuvalar[2].x + 40, y: D.yuvalar[2].y - 30 }, [false, false, false], D)).toBe(2); expect(yuvaBul(D.tabaka[0], [false, false, false], D)).toBe(-1);
    const yari = DEFTER.hucre / 2;
    for (const t of DEFTER.tabaka) {
      expect(t.x - yari).toBeGreaterThan(1062); expect(t.x + yari).toBeLessThan(1930); expect(t.y - yari).toBeGreaterThan(150);      // sağ sayfanın çerçevesi içinde
      expect(t.y + yari).toBeLessThan(702);                                                                                        // damga yastığının üstünde
    }
    for (const y of DEFTER.yuvalar) { expect(y.y).toBe(826); expect(y.x - DEFTER.yuvaCapi / 2).toBeGreaterThan(118); expect(y.x + DEFTER.yuvaCapi / 2).toBeLessThan(985); }
    expect(DEFTER.yuvalar[1].x - DEFTER.yuvalar[0].x).toBeGreaterThan(DEFTER.yuvaCapi);                                          // yuvalar üst üste binmez
    // damga izi portreye ve yuvalara değmez
    expect(DEFTER.damgaHedefi.x - 105).toBeGreaterThan(DEFTER.portre.x + 202); expect(DEFTER.damgaHedefi.y + 105).toBeLessThan(826 - 105);
    expect(A1.cikartma).toHaveLength(8);
    expect(soyulmaKaresi(0)).toBe(-1); expect(soyulmaKaresi(30)).toBe(0); expect(soyulmaKaresi(DEFTER.soyma * 0.6)).toBe(1); expect(soyulmaKaresi(DEFTER.soyma)).toBe(2);
    expect(yuvaBul({ x: 560, y: 800 }, [false, false, false])).toBe(1);
    expect(yuvaBul({ x: 540, y: 826 }, [false, true, false])).toBe(-1);                                    // en yakını dolu, öbürleri 120'den uzak
    expect(yuvaBul({ x: 400, y: 800 }, [false, true, false])).toBe(0);
    expect(yuvaBul({ x: 1400, y: 500 }, [false, false, false])).toBe(-1);
    expect(damgaOturur(DEFTER.damgaHedefi)).toBe(true); expect(damgaOturur(DEFTER.damgaYeri)).toBe(false);
    expect(CIKARTMA_SAYISI).toEqual({ '2-3': 1, '4': 2, '5+': 3 });
  });
  it('giriş: Zıpzıp soldan gelir, üç zıplayışta sedyedeki yerine varır', () => {
    expect(GIRIS.baslangic).toBeLessThan(-700);
    expect(zipDuragi(0, HUB.zipzip.sol)).toBe(GIRIS.durak);
    expect(zipDuragi(1, HUB.zipzip.sol)).toBeGreaterThan(GIRIS.durak); expect(zipDuragi(2, HUB.zipzip.sol)).toBeLessThan(HUB.zipzip.sol);
    expect(zipDuragi(3, HUB.zipzip.sol)).toBe(HUB.zipzip.sol); expect(zipDuragi(9, HUB.zipzip.sol)).toBe(HUB.zipzip.sol);
  });
  it('kare dizileri: döngü başa döner, tek seferlik dizi son karede kalır', () => {
    expect(dongudekiKare(0, 6, 110)).toBe(0); expect(dongudekiKare(115, 6, 110)).toBe(1); expect(dongudekiKare(660, 6, 110)).toBe(0); expect(dongudekiKare(-5, 6, 110)).toBe(0);
    expect(dizidekiKare(0, 3, 90)).toBe(0); expect(dizidekiKare(200, 3, 90)).toBe(2); expect(dizidekiKare(9000, 3, 90)).toBe(2);
  });
});

describe('sesler: yeni replikler ve efektler', () => {
  it('her sözün ve efektin kaydı var; sözlerde emir yok', () => {
    for (const ad of [...Object.keys(A1_SOZLER), ...A1_EFEKTLER]) expect(existsSync(`assets/doktor/vaka/ses/${ad}.mp3`), ad).toBe(true);
    for (const s of Object.values(A1_SOZLER)) expect(s).not.toMatch(/(?<!\p{L})(dokun|tıkla|bas|sürükle|şimdi şunu)(?!\p{L})/iu);
    expect(Object.keys(A1_SOZLER).filter(a => a.startsWith('k-')).length).toBeGreaterThanOrEqual(4);       // Kino da konuşur
  });
});

describe('tepki pozları', () => {
  const y = { asama: 'cimbiz' as const, kilitli: false, buyutecElde: false, an: 1000, ohKalan: 0, pofKalan: 0 };
  it('Zıpzıp\'ın yüzü: çekilirken dişini sıkar, çıkınca "ay", sonra "oh"; pofta kahkaha; bantta utangaç; endişeliyken göz kırpar', () => {
    expect(yuzKaresi('ayy', { ...y, kilitli: true })).toBe(A1.yuz.gozkisik);
    expect(yuzKaresi('ayy', y)).toBe(SECMELI.yuz.ayy);
    expect(yuzKaresi('endise', { ...y, ohKalan: 300 })).toBe(A1.yuz.oh);
    expect(yuzKaresi('kikir', { ...y, asama: 'sprey', pofKalan: 200 })).toBe(A1.yuz.gulme);
    expect(yuzKaresi('kikir', { ...y, asama: 'sprey' })).toBe(SECMELI.yuz.kikir);
    expect(yuzKaresi('rahat', { ...y, asama: 'bant' })).toBe(A1.yuz.utangac);
    expect(yuzKaresi('rahat', { ...y, asama: 'sargi' })).toBe(SECMELI.yuz.rahat);
    expect(yuzKaresi('endise', { ...y, asama: 'buyutec', buyutecElde: true })).toBe(A1.yuz.merak);
    expect(yuzKaresi('endise', { ...y, asama: 'buyutec', an: 3250 })).toBe(A1.yuz.kirp);
    expect(yuzKaresi('endise', { ...y, asama: 'buyutec' })).toBe(SECMELI.yuz.endise);
  });
  it('Kino: yakın planda bakar ve göz kırpar, sevinince başparmak ya da coşkulu alkış; masada karşılar, güler, düşünür, kutlar', () => {
    expect(kinoYakinKaresi('izler', 1000, false)).toBe(A1.kinoYakin.bak[0]); expect(kinoYakinKaresi('izler', 3050, false)).toBe(A1.kinoYakin.bak[1]);
    expect(kinoYakinKaresi('sevin', 0, false)).toBe(A1.kinoYakin.basparmak); expect(kinoYakinKaresi('sevin', 0, true)).toBe(A1.kinoYakin.alkisHizli);
    expect(kinoYakinKaresi('sasir', 0, true)).toBe(SECMELI.kino.sasir);
    const k = { asama: 'giris' as const, an: 1000, t: 0, sasirdi: false, ups: false, kahkaha: false, karsiliyor: false, bos: false };
    expect(kinoMasaKaresi(k)).toBe(SECMELI.kino.goster);
    expect(kinoMasaKaresi({ ...k, an: 3450 })).toBe(A1.kinoMasa.kirp);
    expect(kinoMasaKaresi({ ...k, bos: true })).toBe(A1.kinoMasa.dusun);
    expect(kinoMasaKaresi({ ...k, asama: 'gelis', karsiliyor: true })).toBe(A1.kinoMasa.karsila[0]);
    expect(kinoMasaKaresi({ ...k, asama: 'gelis', karsiliyor: true, an: 1220 })).toBe(A1.kinoMasa.karsila[1]);
    expect(kinoMasaKaresi({ ...k, ups: true, kahkaha: true })).toBe(A1.kinoMasa.ups);
    expect(kinoMasaKaresi({ ...k, kahkaha: true })).toBe(A1.kinoMasa.kahkaha);
    expect(kinoMasaKaresi({ ...k, asama: 'kutlama', t: 160 })).toBe(A1.kinoMasa.yasasin[1]);
  });
  it('mikrop: kıpırdar, büyüteçten kaçarken korkar, köpükte gömülür; bant yaşa göre bir üç vuruşta düzelir', () => {
    expect(A1.mikrop[0].kipir).toContain(mikropKaresi(0, { an: 0, kaciyor: false, kopukte: false }));
    expect(new Set([0, 130, 250, 370].map(an => mikropKaresi(1, { an, kaciyor: false, kopukte: false }))).size).toBe(4);   // döngünün dört karesi
    expect(mikropKaresi(2, { an: 0, kaciyor: true, kopukte: false })).toBe('mikrop-2-kork');
    expect(mikropKaresi(2, { an: 0, kaciyor: true, kopukte: true })).toBe('mikrop-2-kopukte');
    expect(BANT_DUZLEME).toEqual({ '2-3': 1, '4': 2, '5+': 3 });
  });
});

describe('ikinci geçiş: kare dizileri, dikenin gerilmesi, bekleme ekleri', () => {
  it('kare anahtarları: sırayla, her an yalnız bir kare görünür; ofsetler azalmaz', () => {
    for (const adet of [3, 4, 6]) {
      const hepsi = Array.from({ length: adet }, (_, i) => kareAnahtarlari(i, adet));
      for (const k of hepsi) {
        expect(k[0].offset).toBe(0); expect(k[k.length - 1].offset).toBe(1);
        for (let j = 1; j < k.length; j++) expect(k[j].offset).toBeGreaterThanOrEqual(k[j - 1].offset);
      }
      // i. kare [i/adet, (i+1)/adet) aralığında görünür
      hepsi.forEach((k, i) => { const gorunur = k.filter(a => a.opacity === 1).map(a => a.offset); expect(gorunur[0]).toBeCloseTo(i / adet); expect(gorunur[1]).toBeCloseTo((i + 1) / adet); });
    }
  });
  it('diken çekildikçe tüy daha çok kalkar; karedeki dikenin boyu ek notta yazılı', () => {
    expect([0, 30, 40, 60, 70, 89].map(c => gerginKaresi(c, 90))).toEqual([0, 0, 1, 1, 2, 2]);
    expect(GERGIN_BOY).toEqual([200, 215, 230]); expect(DIKEN_KOKU).toEqual({ x: 40, y: 100 }); expect(KOPMA_KARE_MS).toBeLessThanOrEqual(80);
    expect(brief).toContain('dikenin battığı yer tuvalde (40, 100)');
    expect(tum).toContain('dikenin ucu x = 240, 255, 270');
    expect(tum).toContain('yıldızın merkezi (300, 100)'); expect(YILDIZ_KUYRUK.merkez).toEqual({ x: 325, y: 97 });       // gelen çizimden ölçülen yer
  });
  it('Zıpzıp beklerken arada patisine bakar, uzun beklerse iç çeker; Kino kutlamada dans eder, yanlış alette "ups" der', () => {
    expect(bekleEki(100, false)).toBe(A1.bekle[0]); expect(bekleEki(5300, false)).toBe(A1.bekle[0]);
    expect(bekleEki(3000, false)).toBeNull(); expect(bekleEki(3000, true)).toBe(A1.bekle[1]); expect(bekleEki(4000, true)).toBeNull();
    expect(kinoDansKaresi(0)).toBe(A1.kinoDans[0]); expect(kinoDansKaresi(450)).toBe(A1.kinoDans[1]); expect(kinoDansKaresi(900)).toBe(A1.kinoDans[0]);
    expect(kinoYakinKaresi('sasir', 0, false, true)).toBe(A1.kinoMasa.ups);
    expect(A1_TUVAL[A1.kinoMasa.ups]).toEqual(A1_TUVAL[A1.kinoYakin.basparmak]);       // aynı tuval: yakın planda da kullanılır
  });
  it('köpürme karelerinin merkezi Astra\'ya yazılan yerde; ayna camı çerçevenin içinde', () => {
    expect(tum).toContain('**merkezi (210, 180)**'); expect(KOPURME.merkez).toEqual({ x: 210, y: 180 });
    expect(LAVABO.ayna.camX).toBeLessThan(LAVABO.ayna.yaricap); expect(LAVABO.ayna.camY).toBeLessThan(LAVABO.ayna.yaricap);
    expect(LAVABO.ayna.camX * 2).toBeLessThanOrEqual(480); expect(LAVABO.ayna.camY * 2).toBeLessThanOrEqual(480);      // Kino'nun tuvalinden büyük değil
  });
  it('bellek: tam sahne boyundaki saydam katman setleri ortak dolu alanlarına kırpılı; kutu sahnenin içinde', async () => {
    const sharp = (await import('sharp')).default;
    expect(A1_KIRP_SETLERI.flat()).toEqual([...A1.sargiKat, ...A1.lavaboSu, A1.gogus.korkulu, A1.gogus.merak, A1.gogus.kikir, A1.gogus.sakin, A1.gogus.kirp, ...A1.gogus.nefes]);
    for (const set of A1_KIRP_SETLERI) {
      const ilk = kirpKutusu(set[0]);
      if (!ilk) continue;                                                       // çizimler daha bağlanmadıysa
      for (const ad of set) {
        expect(kirpKutusu(ad), ad).toEqual(ilk);                                // setin kareleri aynı kutuda: üst üste değişirken oynamaz
        expect(A1_TUVAL[ad]).toEqual([2048, 1152]);
        const m2 = await sharp(`assets/doktor/vaka/${ad}.webp`).metadata();
        expect([m2.width, m2.height], ad).toEqual([ilk.g, ilk.y]);              // dosya gerçekten kırpılı
      }
      expect(ilk.sol).toBeGreaterThanOrEqual(0); expect(ilk.ust).toBeGreaterThanOrEqual(0); expect(ilk.sol + ilk.g).toBeLessThanOrEqual(SAHNE.g); expect(ilk.ust + ilk.y).toBeLessThanOrEqual(SAHNE.y);
    }
    expect(kirpKutusu(A1.sargiKat[0])!.g * kirpKutusu(A1.sargiKat[0])!.y).toBeLessThan(2048 * 1152 * 0.1);       // sargının katı sahnenin onda birinden küçük
    expect(kirpKutusu('hub-fon')).toBeNull();
  });
  it('onay notundaki ek kare: gülen portre defter sahnesiyle yüklenir, resmin merkezine oturur', () => {
    expect(tum).toContain('`defter-portre-mutlu`'); expect(A1_EK.defterPortre).toBe('defter-portre-mutlu');
    expect(A1_SAHNE.defter).toContain(A1_EK.defterPortre); expect(A1_DOSYALAR).not.toContain(A1_EK.defterPortre);
    expect(A1_TUVAL[A1_EK.defterPortre]).toEqual([400, 400]);
    expect(brief).toContain('merkez (590, 400), yarıçap 190'); expect(DEFTER.portre).toEqual({ x: 526, y: 441 }); expect(DEFTER.portreBoyu * 0.95).toBeGreaterThanOrEqual(408);       // çizimden ölçülen daire
  });
});
