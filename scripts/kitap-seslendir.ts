/**
 * Kitapların "Bana oku" seslendirmesi: her satır konuşanın kendi ElevenLabs sesiyle (eleven_v4), zaman damgalı.
 *   → public/ses/kitap/<kim>/<karma>.mp3 + public/ses/kitap/manifest.json (kelime anları dahil)
 *
 *   npx vite-node scripts/kitap-seslendir.ts                 # eksik / imzası eskimiş satırları üret
 *   npx vite-node scripts/kitap-seslendir.ts -- --denetle    # ayrıca ElevenLabs Scribe ile yazıya dök, sözle karşılaştır
 *   npx vite-node scripts/kitap-seslendir.ts -- --yeniden "kim|metin" ...   # belirtilen satırları zorla yeniden üret
 *   npx vite-node scripts/kitap-seslendir.ts -- --sinir 3    # en çok 3 satır (deneme)
 *
 * Satırlar: kitap/src/kitaplar.ts → her kitabın kapak + sayfa satırları ve canlanan anların kısa sözleri (soz).
 * Sesler: content/kitap-ses.json → kimler (kim → content/film2/sesler.json'daki ses adı). Anahtar ELEVENLABS_API_KEY;
 * anahtar ve ses kimliği loga yazılmaz. Her kayıt denetlenir (süre, baştaki/sondaki sessizlik, iç sessizlik,
 * kırpılma, hız, sözün kesilmesi); tutmayan en çok 2 kez yeniden üretilir, en iyisi kalır.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { kimlikOzeti } from '../src/audio/karakter-ses';
import { KITAPLAR } from '../kitap/src/kitaplar';
import { etiketsiz } from '../kitap/src/metin';
import { kelimeAnlari, konusmaSonu, satirAnahtari, type Hizalama, type KitapSesKaydi, type KitapSesManifest } from '../kitap/src/ses-mantik';
import type { Kim } from '../kitap/src/tipler';

interface KimAyari {
  ses: string;
  ayarlar?: Record<string, number | boolean>;
}
interface Ayar {
  kaynak: string;
  model: string;
  bicim: string;
  dil: string;
  ayarlar: Record<string, number | boolean>;
  kimler: Record<string, KimAyari>;
  es_zaman?: number;
  bekleme_ms?: number;
  butce_karakter?: number;
}

const KOK = process.cwd();
const ayar: Ayar = JSON.parse(fs.readFileSync(path.join(KOK, 'content/kitap-ses.json'), 'utf8'));
const seri2: { sesler: Record<string, string> } = JSON.parse(fs.readFileSync(path.join(KOK, ayar.kaynak), 'utf8'));
const ANAHTAR = process.env.ELEVENLABS_API_KEY;
const argv = process.argv.slice(2);
const DENETLE = argv.includes('--denetle');
const sinirIdx = argv.indexOf('--sinir');
const SINIR = sinirIdx >= 0 ? Number(argv[sinirIdx + 1]) : Infinity;
const yIdx = argv.indexOf('--yeniden');
const YENIDEN = new Set(yIdx >= 0 ? argv.slice(yIdx + 1).filter((a) => !a.startsWith('--')) : []);

if (!ANAHTAR) {
  console.log('ELEVENLABS_API_KEY yok — kitap seslendirmesi atlandı.');
  process.exit(0);
}

// ------------------------------------------------------------------ satırlar

interface Is {
  kim: Kim;
  metin: string;
  anahtar: string;
  /** önceki / sonraki satır aynı sesle konuşuyorsa (anlatıcı): tonlama sürekliliği için */
  once?: string;
  sonra?: string;
}
const isler = new Map<string, Is>();
function ekle(kim: Kim, metin: string, once?: string, sonra?: string) {
  if (kim === 'ses' || !etiketsiz(metin)) return;
  const anahtar = satirAnahtari(kim, metin);
  if (!isler.has(anahtar)) isler.set(anahtar, { kim, metin: metin.replace(/\s+/g, ' ').trim(), anahtar, once, sonra });
}
for (const k of KITAPLAR) {
  if (!k.icerik) continue;
  for (const satirlar of [k.icerik.kapak.satirlar, ...k.icerik.sayfalar.map((s) => s.satirlar)])
    satirlar.forEach((s, i) => {
      const komsu = (j: number) => (satirlar[j]?.kim === s.kim ? etiketsiz(satirlar[j].metin) : undefined);
      ekle(s.kim, s.metin, komsu(i - 1), komsu(i + 1));
    });
  for (const sc of Object.values(k.canli ?? {}))
    for (const an of sc.anlar) for (const a of [...an.adimlar, ...(an.sirali ?? []).flat()]) if (a.soz) ekle(a.soz.kim, a.soz.metin);
}

// ------------------------------------------------------------------ manifest

const klasor = path.join(KOK, 'public/ses/kitap');
const manifestYolu = path.join(klasor, 'manifest.json');
const manifest: KitapSesManifest = fs.existsSync(manifestYolu) ? JSON.parse(fs.readFileSync(manifestYolu, 'utf8')) : { surum: 1, satirlar: {} };
const kaydet = () => {
  fs.mkdirSync(klasor, { recursive: true });
  const sirali = Object.fromEntries(Object.entries(manifest.satirlar).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestYolu, JSON.stringify({ surum: 1, satirlar: sirali }, null, 0));
};

function uretimAyari(kim: string) {
  const ka = ayar.kimler[kim];
  if (!ka) throw new Error(`content/kitap-ses.json → kimler.${kim} yok`);
  const sesId = seri2.sesler[ka.ses];
  if (!sesId) throw new Error(`${ayar.kaynak} → sesler.${ka.ses} yok`);
  const ayarlar = { ...ayar.ayarlar, ...ka.ayarlar };
  const imza = `${kimlikOzeti(sesId)}|${ayar.model}|${ayar.dil}|${JSON.stringify(ayarlar)}`;
  return { sesId, ayarlar, imza };
}
const dosyaAdi = (is: Is, imza: string) => `${is.kim}/${createHash('sha1').update(`${imza}|${is.metin}`).digest('hex').slice(0, 14)}.mp3`;

// ------------------------------------------------------------------ ElevenLabs

const bekle = (ms: number) => new Promise((c) => setTimeout(c, ms));
const gizle = (t: string, sesId: string) => t.split(sesId).join('<ses>').split(ANAHTAR!).join('<anahtar>').slice(0, 300);

async function uret(is: Is, sesId: string, ayarlar: Record<string, number | boolean>): Promise<{ mp3: Buffer; hiz: Hizalama }> {
  const govde = {
    text: is.metin,
    model_id: ayar.model,
    language_code: ayar.dil,
    voice_settings: ayarlar,
    ...(is.once ? { previous_text: is.once } : {}),
    ...(is.sonra ? { next_text: is.sonra } : {}),
  };
  for (let deneme = 1; deneme <= 5; deneme++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${sesId}/with-timestamps?output_format=${ayar.bicim}`, {
      method: 'POST',
      headers: { 'xi-api-key': ANAHTAR!, 'Content-Type': 'application/json' },
      body: JSON.stringify(govde),
    });
    if (r.ok) {
      const j = (await r.json()) as { audio_base64: string; alignment: Hizalama | null; normalized_alignment?: Hizalama | null };
      const hiz = j.alignment ?? j.normalized_alignment;
      if (!hiz?.characters?.length) throw new Error('zaman damgası gelmedi');
      return { mp3: Buffer.from(j.audio_base64, 'base64'), hiz };
    }
    const metin = await r.text();
    if (r.status === 429 || r.status >= 500) {
      await bekle(1500 * deneme * deneme);
      continue;
    }
    throw new Error(`ElevenLabs ${r.status}: ${gizle(metin, sesId)}`);
  }
  throw new Error('ElevenLabs: çok fazla yeniden deneme');
}

/** ElevenLabs Scribe ile yazıya dökme (yalnız --denetle) */
async function yaziyaDok(dosya: string): Promise<string> {
  for (let deneme = 1; deneme <= 4; deneme++) {
    const fd = new FormData();
    fd.append('model_id', 'scribe_v1');
    fd.append('language_code', 'tr');
    fd.append('tag_audio_events', 'false');
    fd.append('file', new Blob([fs.readFileSync(dosya)], { type: 'audio/mpeg' }), 'satir.mp3');
    const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': ANAHTAR! }, body: fd });
    if (r.ok) return ((await r.json()) as { text: string }).text ?? '';
    const t = await r.text();
    if (r.status === 429 || r.status >= 500) {
      await bekle(1500 * deneme * deneme);
      continue;
    }
    throw new Error(`Scribe ${r.status}: ${gizle(t, '')}`);
  }
  throw new Error('Scribe: çok fazla yeniden deneme');
}

// ------------------------------------------------------------------ ses denetimi

const FFMPEG: string = (await import('ffmpeg-static')).default as unknown as string;

interface Olcum {
  sure: number;
  bas: number;
  son: number;
  icSessiz: number;
  kirpik: number;
  tepe: number;
}
/** mp3 → 16 bit tek kanal örnekler; 10 ms'lik pencerelerde sessizlik (-45 dBFS altı) ve kırpılma */
function olc(dosya: string): Olcum {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-i', dosya, '-ac', '1', '-ar', '44100', '-f', 's16le', '-'], { maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${String(r.stderr).slice(0, 200)}`);
  const b = r.stdout as Buffer;
  const n = b.length / 2;
  const pen = 441;
  const esik = 32768 * 10 ** (-45 / 20);
  const sesli: boolean[] = [];
  let kirpik = 0;
  let tepe = 0;
  for (let p = 0; p < n; p += pen) {
    let kare = 0;
    const m = Math.min(n, p + pen);
    for (let i = p; i < m; i++) {
      const v = b.readInt16LE(i * 2);
      const a = Math.abs(v);
      if (a > tepe) tepe = a;
      if (a >= 32700) kirpik++;
      kare += v * v;
    }
    sesli.push(Math.sqrt(kare / Math.max(1, m - p)) > esik);
  }
  const ilk = sesli.indexOf(true);
  const sonIdx = sesli.lastIndexOf(true);
  let icSessiz = 0;
  let akim = 0;
  for (let i = Math.max(0, ilk); i <= sonIdx; i++) {
    akim = sesli[i] ? 0 : akim + 1;
    icSessiz = Math.max(icSessiz, akim);
  }
  const sure = (n / 44100) * 1000;
  return { sure, bas: ilk < 0 ? sure : ilk * 10, son: ilk < 0 ? 0 : sure - (sonIdx + 1) * 10, icSessiz: icSessiz * 10, kirpik, tepe: tepe / 32768 };
}

const harfSay = (t: string) => [...etiketsiz(t)].filter((c) => /\p{L}/u.test(c)).length;
/** Kaydın sorunları (boş = iyi) */
function sorunlar(is: Is, o: Olcum, konusmaBitti: number): string[] {
  const s: string[] = [];
  const harf = harfSay(is.metin);
  const konusma = Math.max(1, o.sure - o.bas - o.son);
  const hiz = harf / (konusma / 1000);
  if (o.bas >= o.sure - 50) s.push('sessiz kayıt');
  if (o.bas > 900) s.push(`başta ${Math.round(o.bas)} ms sessizlik`);
  if (o.son < 25) s.push('söz sonda kesik (kuyruk yok)');
  if (konusmaBitti > o.sure + 30) s.push('hizalamaya göre söz dosya sonuna taşıyor');
  if (o.icSessiz > (harf < 15 ? 1500 : 2200)) s.push(`içte ${Math.round(o.icSessiz)} ms sessizlik`);
  if (o.kirpik > 20) s.push(`kırpılma (${o.kirpik} örnek)`);
  if (harf >= 6 && hiz > 17) s.push(`fazla hızlı (${hiz.toFixed(1)} harf/sn)`);
  // etiketli kısa sözlerde (gülme, iç çekme) uzun kayıt olağan; yalnız aşırı uzunluk sorun
  if (o.sure > 2500 + harf * 260) s.push(`fazla uzun (${Math.round(o.sure)} ms)`);
  return s;
}

const ETIKET_SOZ = /\b(giggles?|giggling|whispers?|whispering|excited|happy|curious|surprised|sad|sleepy|laughs?|laughing|gasps?|sighs?|yawns?)\b/i;
const sade = (t: string) =>
  t
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
/** Yazıya dökülenin sözle uyumu: etiket sesli okunmuş mu, söz eksik mi */
function sozSorunlari(is: Is, yazi: string): string[] {
  const s: string[] = [];
  if (ETIKET_SOZ.test(yazi)) s.push(`etiket sesli okunmuş: "${yazi}"`);
  // harf harf (boşluk, noktalama yok: "O da kuzu mu" = "Oda kuzumu"); uzatmalar (Kuzuuu) tek harf sayılır
  const harfler = (t: string) => sade(t).join('').replace(/(\p{L})\1+/gu, '$1');
  const a = harfler(etiketsiz(is.metin));
  const b = harfler(yazi);
  const fark = uzaklik(a, b) / Math.max(1, a.length);
  if (!b.length && a.length) s.push('hiç söz duyulmadı');
  else if (fark > (a.length < 8 ? 0.25 : 0.15)) s.push(`söz eksik/yanlış (fark ${fark.toFixed(2)}): "${yazi}"`);
  return s;
}
/** Harf düzeyinde düzenleme uzaklığı */
function uzaklik(a: string, b: string): number {
  let once = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const simdi = [i];
    for (let j = 1; j <= b.length; j++) simdi[j] = Math.min(once[j] + 1, simdi[j - 1] + 1, once[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    once = simdi;
  }
  return once[b.length];
}

// ------------------------------------------------------------------ üretim

const tumu = [...isler.values()];
const eksik = tumu
  .filter((is) => {
    if (YENIDEN.has(is.anahtar)) return true;
    const k = manifest.satirlar[is.anahtar];
    return !k || k.i !== uretimAyari(is.kim).imza || !fs.existsSync(path.join(klasor, k.d));
  })
  .slice(0, SINIR);
const toplamKarakter = eksik.reduce((t, is) => t + is.metin.length, 0);
console.log(`Kitap: ${tumu.length} satır, ${eksik.length} üretilecek (${toplamKarakter} karakter)`);
const kimde = new Map<string, number>();
for (const is of eksik) kimde.set(is.kim, (kimde.get(is.kim) ?? 0) + 1);
if (kimde.size) console.log('Sesler:', [...kimde].map(([k, n]) => `${k} ${n}`).join(', '));

const BUTCE = ayar.butce_karakter ?? Infinity;
let harcanan = 0;
let tamam = 0;
let yeniden = 0;
const kalanSorun: string[] = [];

async function satirUret(is: Is) {
  const { sesId, ayarlar, imza } = uretimAyari(is.kim);
  const d = dosyaAdi(is, imza);
  const hedef = path.join(klasor, d);
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  const gecici = `${hedef}.tmp.mp3`;
  let en: { mp3: Buffer; hiz: Hizalama; s: string[]; o: Olcum } | null = null;
  for (let d2 = 0; d2 < 3; d2++) {
    if (harcanan + is.metin.length > BUTCE) {
      if (en) break;
      throw new Error(`Karakter bütçesi (${BUTCE}) doldu`);
    }
    harcanan += is.metin.length;
    if (d2 > 0) yeniden++;
    const u = await uret(is, sesId, ayarlar);
    fs.writeFileSync(gecici, u.mp3);
    const o = olc(gecici);
    const s = sorunlar(is, o, konusmaSonu(u.hiz));
    let yazi = '';
    if (DENETLE && !s.length) {
      yazi = await yaziyaDok(gecici);
      s.push(...sozSorunlari(is, yazi));
    }
    const hz = harfSay(is.metin) / (Math.max(1, o.sure - o.bas - o.son) / 1000);
    console.log(`  ${s.length ? '·' : '✓'} ${is.anahtar} [${Math.round(o.sure)} ms, baş ${Math.round(o.bas)}, son ${Math.round(o.son)}, iç ${o.icSessiz}, tepe ${o.tepe.toFixed(2)}, ${hz.toFixed(1)} harf/sn]${yazi ? ` duyulan: "${yazi}"` : ''}`);
    if (!en || s.length < en.s.length) en = { ...u, s, o };
    if (!s.length) break;
    console.log(`  ↻ ${is.anahtar}: ${s.join('; ')}`);
    await bekle(ayar.bekleme_ms ?? 300);
  }
  fs.rmSync(gecici, { force: true });
  fs.writeFileSync(hedef, en!.mp3);
  if (en!.s.length) kalanSorun.push(`${is.anahtar}: ${en!.s.join('; ')}`);
  const kayit: KitapSesKaydi = { d: d.replace(/\\/g, '/'), i: imza, s: Math.round(en!.o.sure), k: kelimeAnlari(is.metin, en!.hiz) };
  manifest.satirlar[is.anahtar] = kayit;
  if (++tamam % 10 === 0) {
    kaydet();
    console.log(`… ${tamam}/${eksik.length}`);
  }
}

async function havuz<T>(liste: T[], esZaman: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  await Promise.all(
    Array.from({ length: esZaman }, async () => {
      while (i < liste.length) {
        await fn(liste[i++]);
        await bekle(ayar.bekleme_ms ?? 300);
      }
    }),
  );
}

try {
  await havuz(eksik, ayar.es_zaman ?? 1, satirUret);
} catch (e) {
  kaydet();
  console.error(`Durdu (${tamam} kayıt, ${harcanan} karakter):`, (e as Error).message);
  process.exit(1);
}

// artık kitapta olmayan satırların kayıtları
if (SINIR === Infinity) {
  const gecerli = new Set(tumu.map((is) => is.anahtar));
  for (const a of Object.keys(manifest.satirlar)) if (!gecerli.has(a)) delete manifest.satirlar[a];
  const kullanilan = new Set(Object.values(manifest.satirlar).map((k) => k.d));
  if (fs.existsSync(klasor))
    for (const alt of fs.readdirSync(klasor, { withFileTypes: true }))
      if (alt.isDirectory())
        for (const f of fs.readdirSync(path.join(klasor, alt.name))) if (f.endsWith('.mp3') && !kullanilan.has(`${alt.name}/${f}`)) fs.unlinkSync(path.join(klasor, alt.name, f));
}
kaydet();
console.log(`Bitti: ${tamam} yeni kayıt, denetim nedeniyle ${yeniden} yeniden üretim, ${harcanan} karakter.`);
if (kalanSorun.length) {
  console.log(`Sorunu süren ${kalanSorun.length} kayıt (en iyisi tutuldu):`);
  for (const s of kalanSorun) console.log('  ✗', s);
}
