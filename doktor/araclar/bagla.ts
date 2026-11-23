/**
 * Paket Doktor-K1 ("Önce Kuzu") çizimlerini bağlar: tek komutla temizlik, webp, boyut denetimi ve tam boy önizleme.
 *
 *   npx vite-node doktor/araclar/bagla.ts
 *   npx vite-node doktor/araclar/bagla.ts -- --zorla            # kaynaktaki her dosyayı yeniden işle
 *   npx vite-node doktor/araclar/bagla.ts -- --yalniz a1,stetoskop
 *   npx vite-node doktor/araclar/bagla.ts -- --kaynak <klasör> --hedef <klasör> --cikti <klasör>   (deneme için)
 *
 * 1. Kaynak klasöründeki (ekip/doktor/k1-kaynak) yeni dosyaları işler:
 *    - tek çizim (`zipzip-tirman-0.png`): macenta zemin temizlenir ya da şeffaf zemin korunur, kırıntı silinir, tuval
 *      boyutuna getirilir, `assets/doktor/zipzip-diz/<ad>.webp` yazılır;
 *    - sayfa (`a1.png`, `a1@3x2.png`, `zipzip-tirman.png`): pozlara bölünür, her poz tuvaline yerleştirilip yazılır.
 * 2. Hedef klasördeki bütün K1 çizimlerini denetler (Astra doğrudan oraya yazdıysa da): boyut, zemin, köşeler, kenar,
 *    macenta kalıntısı, "aynı poz" çiftleri.
 * 3. `output/doktor/k1-onizleme/index.html` sayfasını üretir: her çizim %100 boyda, diziler sahnedeki hızla.
 * Hiçbir dosyayı silmez; yalnız K1 adlarıyla `.webp` ve önizleme klasörünü yazar. Ayrıntı: doktor/araclar/OKU.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  altTemasX, bilesenler, boyutKarari, denetle, farkSay, hucreyeDagit, izgaraSec, kenarRenginiYay, kirintiSil, macentaTemizle, olc, pozKes, sinirKutusu, yerlestirme, zeminTuru,
  type Bulgu, type Kutu, type Olcum, type Resim,
} from './gorsel-mantik';
import { AYNI_POZ, CIZIMLER, CIZIM_KILAVUZLARI, ONIZLEME_AGIZLARI, ONIZLEME_DIZILERI, SAYFALAR, TUVALLER, altKlasorEsle, cizimBul, kaynakAdiCoz, sayfaBul, type Cizim, type Sayfa, type TuvalTuru } from './k1-paket';
import { onizlemeHtml, ozetle, type OnizlemeCizimi, type OnizlemeVerisi } from './onizleme';
import { PERDE, SAHNE, TUVAL, ekranOlcegi, kameraDonusumu, tuvalKutusu } from '../src/once-kuzu/yerlesim';

const BURASI = path.dirname(fileURLToPath(import.meta.url));
const KOK = path.resolve(BURASI, '..', '..');

// ---------- seçenekler
const arg = process.argv.slice(2);
const secenek = (ad: string): string | undefined => { const i = arg.indexOf('--' + ad); return i >= 0 && arg[i + 1] && !arg[i + 1].startsWith('--') ? arg[i + 1] : undefined; };
const bayrak = (ad: string): boolean => arg.includes('--' + ad);
const klasor = (ad: string, varsayilan: string) => path.resolve(KOK, secenek(ad) ?? varsayilan);
const KAYNAK = klasor('kaynak', 'ekip/doktor/k1-kaynak');
const HEDEF = klasor('hedef', 'assets/doktor/zipzip-diz');
const CIKTI = klasor('cikti', 'output/doktor/k1-onizleme');
const ZORLA = bayrak('zorla');
const YALNIZ = secenek('yalniz')?.split(',').map(s => s.trim().toLowerCase());
const goreli = (p: string) => path.relative(KOK, p).split(path.sep).join('/') || '.';

// ---------- resim giriş çıkışı
async function oku(yol: string): Promise<Resim> {
  const { data, info } = await sharp(yol).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { g: info.width, y: info.height, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
}
const ham = (r: Resim) => sharp(Buffer.from(r.d.buffer, r.d.byteOffset, r.d.length), { raw: { width: r.g, height: r.y, channels: 4 } });
async function olcekle(r: Resim, g: number, y: number): Promise<Resim> {
  const { data, info } = await ham(r).resize(g, y, { fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  return { g: info.width, y: info.height, d: new Uint8Array(data.buffer, data.byteOffset, data.length) };
}
async function yaz(r: Resim, ad: string, opak: boolean): Promise<void> {
  fs.mkdirSync(HEDEF, { recursive: true });
  const hedef = path.join(HEDEF, ad + '.webp');
  if (opak) await ham(r).removeAlpha().webp({ quality: 90, effort: 5 }).toFile(hedef);
  else { kenarRenginiYay(r); await ham(r).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(hedef); }
}
/** Sıkı kırpılmış pozu ölçekleyip saydam tuvale koyar (taşan kısım kesilir). */
async function tuvaleKoy(poz: Resim, olcek: number, capa: readonly [number, number], g: number, y: number, temas = false): Promise<{ resim: Resim; tasan: boolean }> {
  const k = sinirKutusu(poz, 8);
  if (!k) return { resim: { g, y, d: new Uint8Array(g * y * 4) }, tasan: false };
  let sikI: Resim = poz;
  if (k.x0 || k.y0 || k.x1 !== poz.g || k.y1 !== poz.y) {
    const sg = k.x1 - k.x0, sy = k.y1 - k.y0, d = new Uint8Array(sg * sy * 4);
    for (let yy = 0; yy < sy; yy++) d.set(poz.d.subarray(((yy + k.y0) * poz.g + k.x0) * 4, ((yy + k.y0) * poz.g + k.x1) * 4), yy * sg * 4);
    sikI = { g: sg, y: sy, d };
  }
  const yer = yerlestirme(sikI.g, sikI.y, olcek, capa, g, y, temas ? altTemasX(sikI) : undefined);
  const o = yer.g === sikI.g && yer.y === sikI.y ? sikI : await olcekle(sikI, yer.g, yer.y);
  const d = new Uint8Array(g * y * 4);
  for (let yy = 0; yy < o.y; yy++) {
    const ty = yy + yer.ust;
    if (ty < 0 || ty >= y) continue;
    const x0 = Math.max(0, -yer.sol), x1 = Math.min(o.g, g - yer.sol);
    if (x1 > x0) d.set(o.d.subarray((yy * o.g + x0) * 4, (yy * o.g + x1) * 4), (ty * g + yer.sol + x0) * 4);
  }
  return { resim: { g, y, d }, tasan: yer.tasan };
}

// ---------- yerlesim.json (kaynak klasöründe, isteğe bağlı): sayfadan kesilen pozların ölçeği ve yeri
interface Yerlesim {
  /** tuval türüne göre ortak ölçek (kaynak pikseli → tuval pikseli): { "zipzip": 2.26 } */
  olcek?: Partial<Record<TuvalTuru, number>>;
  sayfa?: Record<string, { olcek?: number }>;
  /** çizime göre: pozun alt-orta noktasının tuvalde oturacağı yer ve (istenirse) kendi ölçeği */
  cizim?: Record<string, { capa?: [number, number]; olcek?: number }>;
}
function yerlesimOku(): Yerlesim {
  const yol = path.join(KAYNAK, 'yerlesim.json');
  if (!fs.existsSync(yol)) return {};
  try { return JSON.parse(fs.readFileSync(yol, 'utf8')) as Yerlesim; } catch (e) { throw new Error(`yerlesim.json okunamadı: ${(e as Error).message}`); }
}
/** Çapa bilinmiyorsa: karakter ekseninde yere, yakın planda alt kenara; eşya tuvalin ortasına. */
function varsayilanCapa(tuval: TuvalTuru, olcekliBoy: number): [number, number] {
  const t = TUVALLER[tuval];
  if (tuval === 'zipzip' || tuval === 'kino' || tuval === 'masa') return [TUVAL[tuval].eksen, TUVAL[tuval].yer];
  if (tuval === 'yakin') return [TUVAL.yakin.eksen, t.y];
  return [t.g / 2, (t.y + olcekliBoy) / 2];
}

/** Karakterler ve masa yere basar: pozun x'i alt temasın ortasından hizalanır. Eşya ve yakın plan kutunun ortasından. */
const yereBasar = (t: TuvalTuru): boolean => t === 'zipzip' || t === 'kino' || t === 'masa';
/** Ayrı dosya olarak gelen çizimlerin kaynak yolu (ada göre) ve bu turda sayfa başına kullanılan ölçek. */
const kaynakYolu = new Map<string, string>();
const sayfaOlcegi = new Map<string, number>();
/** Kaynaktaki bir pozun temizlenmiş, kırpılmış boyu (px); ölçek referansı için. */
async function kaynakPozBoyu(ad: string): Promise<number | null> {
  const yol = kaynakYolu.get(ad);
  if (!yol) return null;
  const t = zeminTemizle(await oku(path.join(KAYNAK, yol)));
  if ('hata' in t) return null;
  const k = sinirKutusu(t.resim, 40);
  return k ? k.y1 - k.y0 : null;
}

interface KaynakSonucu { dosya: string; sonuc: string; seviye: 'tamam' | 'hata' | 'atlandi'; }
const koken = new Map<string, string>();
/** bu çalıştırmada sayfadan kesilip yazılan adlar: aynı adın tek çizimi varsa (düzeltme) o kazanır */
const sayfadanYazilan = new Set<string>();
const kullanilan: Yerlesim = { olcek: {}, sayfa: {}, cizim: {} };
const yuvarla = (n: number) => Math.round(n * 1000) / 1000;

function eskiMi(kaynakYolu: string, adlar: readonly string[]): boolean {
  if (ZORLA) return true;
  const k = fs.statSync(kaynakYolu).mtimeMs;
  return adlar.some(ad => { const h = path.join(HEDEF, ad + '.webp'); return !fs.existsSync(h) || fs.statSync(h).mtimeMs < k; });
}

/** Zemini temizler; temizlenemiyorsa hata metni döndürür. */
function zeminTemizle(r: Resim): { resim: Resim; not: string } | { hata: string } {
  const z = zeminTuru(r);
  if (z.tur === 'macenta') {
    const t = macentaTemizle(r);
    return { resim: t.resim, not: `macenta temizlendi (${t.kenar} kenar pikseli${t.yetim ? ', ' + t.yetim + ' komşusuz' : ''})` };
  }
  if (z.tur === 'seffaf') return { resim: r, not: 'şeffaf zemin' };
  return { hata: z.tur === 'duz' ? `zemin düz renk (rgb ${z.kenarRenk.join(', ')}); şeffaf ya da macenta olmalı` : 'zemin opak; şeffaf ya da macenta olmalı' };
}

async function tekIsle(dosya: string, c: Cizim, yer: Yerlesim): Promise<KaynakSonucu> {
  const yol = path.join(KAYNAK, dosya);
  if (!sayfadanYazilan.has(c.ad) && !eskiMi(yol, [c.ad])) return { dosya, sonuc: 'hedefteki çizim daha yeni, atlandı', seviye: 'atlandi' };
  let r = await oku(yol);
  const ilk = `${r.g} × ${r.y}`;
  const notlar: string[] = [];
  if (c.zemin === 'opak') {
    const b = boyutKarari(r.g, r.y, c.g, c.y);
    if (b.karar === 'farkli') return { dosya, sonuc: `fon ${ilk}; ${c.g} × ${c.y} ile oranı uyuşmuyor, yazılmadı`, seviye: 'hata' };
    if (b.karar === 'oran') { r = await olcekle(r, c.g, c.y); notlar.push(`${ilk} → ${c.g} × ${c.y} (×${b.olcek.toFixed(2)})` + (b.olcek > 1.25 ? ' BÜYÜTÜLDÜ' : '')); }
    await yaz(r, c.ad, true);
    koken.set(c.ad, ['kaynaktan · fon (opak)', ...notlar].join(' · '));
    return { dosya, sonuc: `${c.ad}.webp yazıldı · fon (opak)` + (notlar.length ? ' · ' + notlar.join(' · ') : ''), seviye: 'tamam' };
  }
  const t = zeminTemizle(r);
  if ('hata' in t) return { dosya, sonuc: t.hata + ', yazılmadı', seviye: 'hata' };
  r = t.resim; notlar.push(t.not);
  const kir = kirintiSil(r);
  if (kir) notlar.push(`${kir} px kırıntı silindi`);
  const b = boyutKarari(r.g, r.y, c.g, c.y);
  if (b.karar === 'oran') {
    r = await olcekle(r, c.g, c.y);
    notlar.push(`${ilk} → ${c.g} × ${c.y} (×${b.olcek.toFixed(2)})` + (b.olcek > 1.25 ? ' BÜYÜTÜLDÜ: bulanık olabilir' : ''));
  } else if (b.karar === 'farkli') {
    // kırpılmış ayrı poz: sayfadaki poz gibi yerleştirilir (ölçek sayfanın, yer çapanın; bilinmeyen tahmin edilip işaretlenir)
    const sf = sayfaBul(c.sayfa)!;
    const kendi = yer.cizim?.[c.ad];
    const kutu = sinirKutusu(r, 40);
    if (!kutu) return { dosya, sonuc: 'çizim boş, yazılmadı', seviye: 'hata' };
    let olcek = kendi?.olcek ?? yer.sayfa?.[sf.anahtar]?.olcek ?? yer.olcek?.[c.tuval] ?? sayfaOlcegi.get(sf.anahtar);
    let olcekNotu = 'yerlesim.json ya da sayfanın ölçeği', olcekTahmin = false;
    if (!olcek && sf.boyReferansi) {
      const refAd = sf.adlar[sf.boyReferansi.kare];
      const refBoy = refAd === c.ad ? kutu.y1 - kutu.y0 : await kaynakPozBoyu(refAd);
      if (refBoy) { olcek = sf.boyReferansi.boy / refBoy; olcekNotu = `${refAd} boyu ${sf.boyReferansi.boy} px`; kullanilan.olcek![c.tuval] ??= yuvarla(olcek); }
    }
    if (!olcek && kullanilan.olcek![c.tuval]) { olcek = kullanilan.olcek![c.tuval]!; olcekNotu = 'TAHMİN: aynı karakterin ölçeği bilinen sayfasından'; olcekTahmin = true; }
    if (!olcek) { olcek = Math.min((c.g * 0.9) / (kutu.x1 - kutu.x0), (c.y * 0.9) / (kutu.y1 - kutu.y0)); olcekNotu = 'TAHMİN: tuvale sığdırıldı'; olcekTahmin = true; }
    sayfaOlcegi.set(sf.anahtar, olcek);
    kullanilan.sayfa![sf.anahtar] = { olcek: yuvarla(olcek) };
    let capa: readonly [number, number] | undefined = kendi?.capa ?? sf.capa?.[c.ad];
    const yerTahmin = !capa;
    capa ??= varsayilanCapa(c.tuval, (kutu.y1 - kutu.y0) * olcek);
    const s = await tuvaleKoy(r, olcek, capa, c.g, c.y, yereBasar(c.tuval));
    r = s.resim;
    kullanilan.cizim![c.ad] = { capa: [Math.round(capa[0]), Math.round(capa[1])], ...(kendi?.olcek ? { olcek: kendi.olcek } : {}) };
    notlar.push(`kırpılmış poz ${ilk}, ×${olcek.toFixed(2)} (${olcekNotu}), çapa (${capa.map(Math.round).join(', ')})` + (olcek > 1.25 ? ' BÜYÜTÜLDÜ' : '') + (olcekTahmin && !kendi?.olcek ? ' · ÖLÇEĞİ TAHMİN' : '') + (yerTahmin ? ' · YERİ TAHMİN' : '') + (s.tasan ? ' TUVALDEN TAŞTI' : ''));
  }
  await yaz(r, c.ad, false);
  koken.set(c.ad, ['kaynaktan', ...notlar].join(' · '));
  return { dosya, sonuc: `${c.ad}.webp yazıldı · ` + notlar.join(' · '), seviye: 'tamam' };
}

async function sayfaIsle(dosya: string, s: Sayfa, izgara: { sutun: number; satir: number } | undefined, yer: Yerlesim): Promise<KaynakSonucu> {
  const yol = path.join(KAYNAK, dosya);
  if (!eskiMi(yol, s.adlar)) return { dosya, sonuc: 'hedefteki çizimler daha yeni, atlandı', seviye: 'atlandi' };
  const tt = TUVALLER[s.tuval];
  if (tt.zemin === 'opak') return { dosya, sonuc: 'fon sayfadan kesilmez; tek çizim olarak verin', seviye: 'hata' };
  const ilk = await oku(yol);
  const t = zeminTemizle(ilk);
  if ('hata' in t) return { dosya, sonuc: t.hata + ', yazılmadı', seviye: 'hata' };
  const r = t.resim;
  kirintiSil(r);
  const { etiket, liste } = bilesenler(r, 8);
  const iz = izgara ?? izgaraSec(liste, r.g, r.y, s.adlar.length);
  const dolu = hucreyeDagit(liste, r.g, r.y, iz.sutun, iz.satir).filter(h => h.length);
  if (dolu.length !== s.adlar.length) {
    return { dosya, sonuc: `sayfada ${dolu.length} poz bulundu, ${s.adlar.length} bekleniyordu (ızgara ${iz.sutun} × ${iz.satir}), yazılmadı. Izgarayı dosya adına yazın: ${s.anahtar}@SÜTUNxSATIR.png`, seviye: 'hata' };
  }
  const pozlar = dolu.map(h => pozKes(r, etiket, liste, h)!);
  let olcek = yer.sayfa?.[s.anahtar]?.olcek ?? yer.olcek?.[s.tuval];
  let olcekNotu = 'yerlesim.json';
  if (!olcek && s.boyReferansi) {
    olcek = s.boyReferansi.boy / pozlar[s.boyReferansi.kare].resim.y;
    olcekNotu = `${s.adlar[s.boyReferansi.kare]} boyu ${s.boyReferansi.boy} px`;
    kullanilan.olcek![s.tuval] ??= yuvarla(olcek);
  }
  // ayakta pozu olmayan sayfa (oturuş, yakın plan): aynı karakterin ölçeği bilinen sayfasından; o da yoksa tuvale sığdır
  let olcekTahmin = false;
  if (!olcek && kullanilan.olcek![s.tuval]) { olcek = kullanilan.olcek![s.tuval]!; olcekNotu = 'TAHMİN: aynı karakterin ölçeği bilinen sayfasından'; olcekTahmin = true; }
  if (!olcek) { olcek = Math.min(...pozlar.map(p => Math.min((tt.g * 0.9) / p.resim.g, (tt.y * 0.9) / p.resim.y))); olcekNotu = 'TAHMİN: tuvale sığdırıldı'; olcekTahmin = true; }
  kullanilan.sayfa![s.anahtar] = { olcek: yuvarla(olcek) };
  const tahmin: string[] = [], tasan: string[] = [];
  for (let i = 0; i < s.adlar.length; i++) {
    const ad = s.adlar[i], p = pozlar[i].resim;
    const kendi = yer.cizim?.[ad];
    const o = kendi?.olcek ?? olcek;
    let capa: readonly [number, number] | undefined = kendi?.capa ?? s.capa?.[ad];
    if (!capa) { capa = varsayilanCapa(s.tuval, p.y * o); tahmin.push(ad); }
    const k = await tuvaleKoy(p, o, capa, tt.g, tt.y, yereBasar(s.tuval));
    if (k.tasan) tasan.push(ad);
    await yaz(k.resim, ad, false);
    sayfadanYazilan.add(ad);
    kullanilan.cizim![ad] = { capa: [Math.round(capa[0]), Math.round(capa[1])], ...(kendi?.olcek ? { olcek: kendi.olcek } : {}) };
    koken.set(ad, `sayfadan (${dosya}, ${iz.sutun} × ${iz.satir}, ${i + 1}. poz ${p.g} × ${p.y}) · ${t.not} · ×${o.toFixed(2)}` + (o > 1.25 ? ' BÜYÜTÜLDÜ' : '') + (olcekTahmin && !kendi?.olcek ? ' · ÖLÇEĞİ TAHMİN' : '') + (tahmin.includes(ad) ? ' · YERİ TAHMİN' : ''));
  }
  const notlar = [`${s.adlar.length} poz yazıldı (ızgara ${iz.sutun} × ${iz.satir}${izgara ? '' : ', kendiliğinden'})`, t.not, `ölçek ×${olcek.toFixed(2)} (${olcekNotu})`];
  if (olcek > 1.25) notlar.push('BÜYÜTÜLDÜ: sayfadaki poz küçük, bulanık olabilir');
  if (tahmin.length) notlar.push(`yeri tahmin edilen ${tahmin.length} poz: ${tahmin.join(', ')} (önizlemede kılavuza bakıp yerlesim.json → cizim → capa yazın)`);
  if (tasan.length) notlar.push(`TUVALDEN TAŞAN: ${tasan.join(', ')}`);
  return { dosya, sonuc: notlar.join(' · '), seviye: tasan.length ? 'hata' : 'tamam' };
}

// ---------- akış
async function calistir(): Promise<number> {
  fs.mkdirSync(KAYNAK, { recursive: true });
  fs.mkdirSync(CIKTI, { recursive: true });
  const yer = yerlesimOku();
  // önceki çalıştırmada kullanılan ölçek ve yerler: sayfalar ayrı ayrı gelince ölçek bilgisi kaybolmasın
  const kullanilanYolu = path.join(CIKTI, 'yerlesim-kullanilan.json');
  if (fs.existsSync(kullanilanYolu)) {
    try {
      const onceki = JSON.parse(fs.readFileSync(kullanilanYolu, 'utf8')) as Yerlesim;
      Object.assign(kullanilan.olcek!, onceki.olcek); Object.assign(kullanilan.sayfa!, onceki.sayfa); Object.assign(kullanilan.cizim!, onceki.cizim);
    } catch { /* bozuk dosya: baştan yazılır */ }
  }
  const kokenYolu = path.join(CIKTI, 'kokenler.json');
  let kokenKaydi: Record<string, { koken: string; hedefMs: number }> = {};
  if (fs.existsSync(kokenYolu)) { try { kokenKaydi = JSON.parse(fs.readFileSync(kokenYolu, 'utf8')); } catch { kokenKaydi = {}; } }
  const kaynaklar: KaynakSonucu[] = [];
  const dosyalar = fs.readdirSync(KAYNAK).filter(f => /\.(png|webp|jpe?g)$/i.test(f)).sort();
  // önce sayfalar, sonra tek çizimler: aynı ad ikisinde de varsa tek çizim (düzeltme) kazanır
  const cozulmus = dosyalar.map(dosya => ({ dosya, k: kaynakAdiCoz(dosya) })).sort((a, b) => (a.k.tur === 'sayfa' ? 0 : 1) - (b.k.tur === 'sayfa' ? 0 : 1));
  // alt klasörle gelen ayrı pozlar: k1-kaynak/a1/00.png … ya da k1-kaynak/zipzip-tirman/zipzip-tirman-0.png …
  for (const klasorAdi of fs.readdirSync(KAYNAK).filter(f => fs.statSync(path.join(KAYNAK, f)).isDirectory()).sort()) {
    const e = altKlasorEsle(klasorAdi, fs.readdirSync(path.join(KAYNAK, klasorAdi)));
    if (!e) { kaynaklar.push({ dosya: klasorAdi + '/', sonuc: 'klasör adı sayfa anahtarı ya da dizi öneki değil, atlandı', seviye: 'hata' }); console.log(`✗ ${klasorAdi}/: klasör tanınmadı`); continue; }
    for (const x of e.eslesme) cozulmus.push({ dosya: klasorAdi + '/' + x.dosya, k: x.ad ? { tur: 'cizim', ad: x.ad } : { tur: 'bilinmiyor', ad: x.dosya } });
  }
  for (const { dosya, k } of cozulmus) if (k.tur === 'cizim') kaynakYolu.set(k.ad, dosya);
  for (const { dosya, k } of cozulmus) {
    if (YALNIZ && !YALNIZ.includes(k.ad)) continue;
    try {
      if (k.tur === 'cizim') kaynaklar.push(await tekIsle(dosya, cizimBul(k.ad)!, yer));
      else if (k.tur === 'sayfa') kaynaklar.push(await sayfaIsle(dosya, sayfaBul(k.ad)!, k.izgara, yer));
      else kaynaklar.push({ dosya, sonuc: 'ad tanınmadı (K1 çizim adı ya da sayfa anahtarı değil), atlandı', seviye: 'hata' });
    } catch (e) {
      kaynaklar.push({ dosya, sonuc: 'işlenemedi: ' + (e as Error).message, seviye: 'hata' });
    }
    const son = kaynaklar[kaynaklar.length - 1];
    console.log(`${son.seviye === 'hata' ? '✗' : son.seviye === 'atlandi' ? '·' : '✓'} ${dosya}: ${son.sonuc}`);
  }

  // hedefteki bütün K1 çizimlerinin denetimi
  const onbellek = new Map<string, Resim>();
  const yukle = async (ad: string): Promise<Resim | null> => {
    const yol = path.join(HEDEF, ad + '.webp');
    if (!fs.existsSync(yol)) return null;
    if (!onbellek.has(ad)) { if (onbellek.size > 6) onbellek.delete(onbellek.keys().next().value!); onbellek.set(ad, await oku(yol)); }
    return onbellek.get(ad)!;
  };
  const bagil = (ad: string) => {
    const yol = path.join(HEDEF, ad + '.webp');
    return path.relative(CIKTI, yol).split(path.sep).join('/') + '?v=' + Math.round(fs.statSync(yol).mtimeMs);
  };
  const cizimler: OnizlemeCizimi[] = [];
  const olcumler = new Map<string, Olcum>();
  for (const c of CIZIMLER) {
    const r = await yukle(c.ad);
    if (!r) { cizimler.push({ ad: c.ad, sayfa: c.sayfa, tuval: c.tuval, g: c.g, y: c.y, yol: null, koken: 'gelmedi', bulgular: [], kutu: null }); continue; }
    const o = olc(r);
    olcumler.set(c.ad, o);
    const bulgular: Bulgu[] = denetle(o, r.g, r.y, c);
    const hedefMs = Math.round(fs.statSync(path.join(HEDEF, c.ad + '.webp')).mtimeMs);
    // bu turda işlenmediyse: önceki turun kaydı, dosya o zamandan beri değişmediyse geçerli
    const kk = koken.get(c.ad) ?? (kokenKaydi[c.ad]?.hedefMs === hedefMs ? kokenKaydi[c.ad].koken : 'hedefte hazır (kaynak klasöründen geçmedi)');
    kokenKaydi[c.ad] = { koken: kk, hedefMs };
    if (/BÜYÜTÜLDÜ/.test(kk)) bulgular.push({ seviye: 'uyari', metin: 'kaynak küçük olduğu için büyütüldü: %100 boyda kontur ve yüz net mi' });
    if (/YERİ TAHMİN/.test(kk)) bulgular.push({ seviye: 'uyari', metin: 'tuvaldeki yeri tahmin: kılavuz çizgilerine göre yerlesim.json ile düzelt' });
    if (/ÖLÇEĞİ TAHMİN/.test(kk)) bulgular.push({ seviye: 'uyari', metin: 'ölçeği tahmin: baş ölçüsünü aynı karakterin öbür pozlarıyla karşılaştır, yerlesim.json → sayfa → olcek ile düzelt' });
    if (/TAŞTI/.test(kk)) bulgular.push({ seviye: 'hata', metin: 'poz tuvalden taştı ve kesildi' });
    if (o.kutu && c.zemin === 'seffaf') bulgular.push({ seviye: 'bilgi', metin: `çizim alanı ${o.kutu.x1 - o.kutu.x0} × ${o.kutu.y1 - o.kutu.y0} px, x ${o.kutu.x0}…${o.kutu.x1}, y ${o.kutu.y0}…${o.kutu.y1}` });
    cizimler.push({ ad: c.ad, sayfa: c.sayfa, tuval: c.tuval, g: r.g, y: r.y, yol: bagil(c.ad), koken: kk, bulgular, kutu: o.kutu, kilavuzlar: CIZIM_KILAVUZLARI[c.ad] });
  }
  // "aynı poz" çiftleri
  const ayniPoz: OnizlemeVerisi['ayniPoz'] = [];
  for (const p of AYNI_POZ) {
    const a = await yukle(p.temel), b = a && await yukle(p.es);
    let oran: number | null = null, yayilma: number | null = null, kutu: Kutu | null = null;
    if (a && b) {
      const f = farkSay(a, b);
      if (f.piksel < 0) oran = -1;
      else {
        const oa = olcumler.get(p.temel) ?? olc(a);
        oran = f.piksel / Math.max(1, oa.gorunen); kutu = f.kutu;
        const alan = (k: Kutu | null) => (k ? (k.x1 - k.x0) * (k.y1 - k.y0) : 0);
        yayilma = alan(kutu) / Math.max(1, alan(oa.kutu));
      }
      const es = cizimler.find(c => c.ad === p.es)!;
      if (oran > p.enCok) es.bulgular.push({ seviye: 'uyari', metin: `"${p.temel}" ile aynı poz olmalı (${p.ne}); değişen alan %${(oran * 100).toFixed(1)}, eşik %${(p.enCok * 100).toFixed(0)}` });
      else if (yayilma !== null && yayilma > 0.35) es.bulgular.push({ seviye: 'uyari', metin: `"${p.temel}" ile aynı poz olmalı (${p.ne}); fark küçük ama çizimin %${Math.round(yayilma * 100)}'ine yayılmış: poz yeniden çizilmiş ya da kaymış olabilir, üst üste oynatıp bak` });
    }
    ayniPoz.push({ ...p, oran, yayilma, kutu });
  }

  const veri: OnizlemeVerisi = {
    uretildi: new Date().toLocaleString('tr-TR'), hedef: goreli(HEDEF), kaynak: goreli(KAYNAK), cizimler,
    sayfalar: SAYFALAR.map(s => ({ anahtar: s.anahtar, baslik: s.baslik, tuval: s.tuval, adlar: s.adlar })),
    tuvaller: Object.fromEntries(Object.entries(TUVALLER).map(([ad, t]) => [ad, { g: t.g, y: t.y, kilavuzlar: t.kilavuzlar }])),
    diziler: ONIZLEME_DIZILERI, agizlar: ONIZLEME_AGIZLARI, ayniPoz, kaynaklar,
    // masa tuvalindeki (1000, 420) noktası Zıpzıp tuvalindeki (650, 1020) noktasıdır; iki tuval aynı ölçekte
    masa: { ad: 'muayene-masasi', sol: TUVAL.zipzip.eksen - TUVAL.masa.eksen, ust: 1020 - 420, g: TUVAL.masa.g, y: TUVAL.masa.y },
    // sahne provası: katmanlar oyundaki kutularıyla (once-kuzu/yerlesim.ts); yer ve ölçek ilk sayfadan itibaren görülür
    prova: {
      sahne: { g: SAHNE.g, y: SAHNE.y },
      kutular: { fon: { sol: 0, ust: 0, g: SAHNE.g, y: SAHNE.y }, perde: PERDE, masa: tuvalKutusu('masa'), kino: tuvalKutusu('kino'), zipzip: tuvalKutusu('zipzip'), yakin: tuvalKutusu('yakin') },
      kamera: { genis: kameraDonusumu('genis'), orta: kameraDonusumu('orta'), yakin: kameraDonusumu('yakin') },
      cerceveler: [{ ad: 'iPad yatay (1024 × 768)', kutu: ekranOlcegi(1024, 768).gorunen }, { ad: 'telefon yatay (844 × 390)', kutu: ekranOlcegi(844, 390).gorunen }],
      adlar: {
        fon: 'fon-muayene', masa: 'muayene-masasi', perde: CIZIMLER.filter(c => c.tuval === 'perde').map(c => c.ad),
        zipzip: CIZIMLER.filter(c => c.tuval === 'zipzip').map(c => c.ad), kino: CIZIMLER.filter(c => c.tuval === 'kino').map(c => c.ad), yakin: CIZIMLER.filter(c => c.tuval === 'yakin').map(c => c.ad),
      },
    },
  };
  const stil = fs.readFileSync(path.join(BURASI, 'onizleme-sayfa.css'), 'utf8');
  const istemci = fs.readFileSync(path.join(BURASI, 'onizleme-sayfa.js'), 'utf8');
  const sayfa = path.join(CIKTI, 'index.html');
  fs.writeFileSync(sayfa, onizlemeHtml(veri, stil, istemci), 'utf8');
  const o = ozetle(veri);
  fs.writeFileSync(path.join(CIKTI, 'rapor.json'), JSON.stringify({ ozet: o, kaynaklar, ayniPoz, cizimler: cizimler.map(c => ({ ad: c.ad, geldi: !!c.yol, koken: c.koken, bulgular: c.bulgular })) }, null, 2), 'utf8');
  fs.writeFileSync(kokenYolu, JSON.stringify(kokenKaydi, null, 2), 'utf8');
  if (Object.keys(kullanilan.sayfa!).length) fs.writeFileSync(kullanilanYolu, JSON.stringify(kullanilan, null, 2), 'utf8');

  console.log('');
  console.log(`K1: ${o.gelen} / ${o.beklenen} çizim hedefte · ${o.hata} hata · ${o.uyari} uyarı · ${o.temiz} temiz`);
  for (const c of cizimler) for (const b of c.bulgular) if (b.seviye !== 'bilgi') console.log(`  ${b.seviye === 'hata' ? '✗' : '!'} ${c.ad}: ${b.metin}`);
  if (o.eksik.length) console.log(`Gelmeyen ${o.eksik.length}: ${o.eksik.length > 14 ? o.eksik.slice(0, 14).join(', ') + ' …' : o.eksik.join(', ')}`);
  console.log(`Önizleme: ${goreli(sayfa)}`);
  if (o.gelen === o.beklenen && !o.hata) console.log('Bütün çizimler hedefte ve hatasız: sahne açılır → doktor/index.html?sahne=once-kuzu');
  return kaynaklar.some(k => k.seviye === 'hata') || o.hata ? 1 : 0;
}

calistir().then(kod => { process.exitCode = kod; }, e => { console.error(e); process.exitCode = 2; });
