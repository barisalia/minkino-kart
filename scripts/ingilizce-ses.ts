/**
 * İngilizceye Merhaba · ses üretimi (ElevenLabs). Metinler ingilizce/src/icerik.ts'ten gelir.
 *
 * Kullanım (anahtar ekrana yazılmaz; aynı PowerShell işleminde):
 *   . ./scripts/elevenlabs-ortam.ps1; npx vite-node scripts/ingilizce-ses.ts -- --unite ciftlik --ortak
 * Seçenekler:
 *   --unite a,b     ünitelerin kelime sesleri          --ortak        Polly / Ceren / Kino ortak sözleri
 *   --id x,y        yalnız bu kayıtlar                  --efekt        ünitenin hayvan / taşıt sesleri
 *   --yeniden       var olan kaydı da yeniden üret      --kuru         üretmeden liste ve harf sayısı
 *   --stt           kayıtları yazıya çevirip söylenen sözü doğrula (İngilizce ve Türkçe)
 *   --cikti klasor  başka klasöre yaz (ses seçmesi)     --polly kimlik Polly için başka ses dene
 *   --neseli        Polly daha neşeli okur (seçmedeki B adayı)
 *   --ceren-en      İngilizceyi Ceren'in sesiyle üret (seçme için)
 *   --ileri         ünitelerin Seviye 2 ve 3 kayıtları (cümleler, sorular, hikâyeler) ve bu seviyelerin ortak sözleri
 *   --kim polly     yalnız bu konuşanın kayıtları (polly | ceren | kino); ses değişince yalnız onunkiler yenilenir
 *
 * Kurallar (KULLANICI-KURALLARI): her kelime, her yavaş söyleyiş ve her replik ayrı istek. Yavaş söyleyiş ayrı kayıttır.
 * Her kayıt denetlenir: konuşma süresi hece sayısına göre makul mü (aceleye gelmiş kayıt reddedilir), baş ve sonda
 * kesik var mı, tepe kırpılmış mı. Denetimden geçmeyen kayıt en çok üç kez yeniden denenir; yine geçmezse rapora
 * "şüpheli" yazılır ve Barış'ın dinleme sayfasında işaretlenir.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { hesapSesi } from './ses-hesabi';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EK_HAYVANLAR, UNITELER, efektKimligi, ekSesler, kelimeSesleri, ortakSesler, uniteSesleri, type SesMetni } from '../ingilizce/src/icerik';
import { ilerisiSesleri, ortakSesler2 } from '../ingilizce/src/icerik2';
import { saklambacSesMetinleri } from '../ingilizce/src/adimlar/saklambac-veri';
import { abcSesMetinleri, trenSesMetinleri } from '../ingilizce/src/ekranlar/abc-veri';
import { evdeSesMetinleri } from '../ingilizce/src/evde-cumleler';
import { adaOyunuSesMetinleri } from '../ingilizce/src/adimlar/ada-oyunlari-veri';
import { agacEviSesMetinleri } from '../ingilizce/src/agac-evi-veri';
import { bilmeceSesMetinleri } from '../ingilizce/src/adimlar/bilmece-veri';
import { yerlestirSesMetinleri } from '../ingilizce/src/adimlar/yerlestir-veri';
import { canlandirSesMetinleri } from '../ingilizce/src/adimlar/canlandir-veri';
import { ovalaSesMetinleri } from '../ingilizce/src/adimlar/ovala-veri';
import { sohbetSesMetinleri } from '../ingilizce/src/sohbet-veri';
import { masal2SesMetinleri } from '../ingilizce/src/adimlar/masal2-veri';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ffmpeg: string = createRequire(import.meta.url)('ffmpeg-static');
const HIZ = 44100;
const API = 'https://api.elevenlabs.io/v1';

const arg = process.argv.slice(2).filter((a) => a !== '--');
const bayrak = (ad: string) => arg.includes(`--${ad}`);
const deger = (ad: string) => { const i = arg.indexOf(`--${ad}`); return i >= 0 ? arg[i + 1] : undefined; };
const liste = (ad: string) => (deger(ad) ?? '').split(',').map((s) => s.trim()).filter(Boolean);

const filmSesleri = JSON.parse(fs.readFileSync(path.join(KOK, 'content/film2/sesler.json'), 'utf8').replace(/^﻿/, '')).sesler as Record<string, string>;
const SES_KIMLIGI = {
  // Polly: Barış'ın 17 Kasım 2026'da seçmeden (ekip/ingilizce/polly-secimi.html, E adayı) seçtiği ses: "Ruby Roo".
  // Önceki ses Jessica idi (cgSgspJ2msm6clMCkdW9).
  polly: deger('polly') ?? 'b8gbDO0ybjX1VA89pBdX',
  // Ceren Öğretmen: kitaplardaki öğretmen sesi (content/kitap-ses.json → ogretmen → nehir)
  ceren: filmSesleri.nehir,
  kino: filmSesleri.kino,
  // oturan karakterlerin klonları (content/elevenlabs-hesap.json; 23 Kasım, Minik Doktor için kuruldu)
  mino: '12iZbH1fuWoWnJWOJZ1W',
  zipzip: 'zCieqqNJvrBIGmXON5an',
  lokum: 'k4FgffsVVBqLkYX9lS2v',
};

const CIKTI = path.resolve(KOK, deger('cikti') ?? 'assets/ingilizce/ses');
const AGIZ_DOSYASI = path.join(KOK, 'ingilizce/src/ses-agiz.json');
const RAPOR_DOSYASI = path.join(KOK, 'output/ingilizce/ses-rapor.json');

// ---------------------------------------------------------------- ses işleme

function ff(args: string[], girdi?: Buffer): Buffer {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], { input: girdi, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg: ${r.stderr?.toString().slice(0, 300)}`);
  return r.stdout;
}
function pcm(mp3: Buffer): Float32Array {
  const ham = ff(['-i', 'pipe:0', '-ac', '1', '-ar', String(HIZ), '-f', 'f32le', 'pipe:1'], mp3);
  return new Float32Array(ham.buffer, ham.byteOffset, Math.floor(ham.byteLength / 4));
}
const db = (x: number) => 20 * Math.log10(Math.max(x, 1e-9));

interface Olcum { bas: number; son: number; konusmaMs: number; toplamMs: number; tepe: number; rmsDb: number; enUzunSusmaMs: number }

/** 5 ms'lik karelerle konuşmanın başladığı ve bittiği yer; arada en uzun susma */
function olc(x: Float32Array): Olcum {
  const kare = Math.round(HIZ * 0.005);
  const n = Math.floor(x.length / kare);
  const rms = new Float32Array(n);
  let tepe = 0;
  for (let i = 0; i < n; i++) {
    let t = 0;
    for (let j = 0; j < kare; j++) { const v = x[i * kare + j]; t += v * v; if (Math.abs(v) > tepe) tepe = Math.abs(v); }
    rms[i] = Math.sqrt(t / kare);
  }
  const enYuksek = rms.reduce((a, b) => Math.max(a, b), 0);
  const esik = Math.max(0.0012, enYuksek * 0.015);
  let ilk = -1, sonKare = -1, susma = 0, enUzun = 0;
  for (let i = 0; i < n; i++) {
    if (rms[i] > esik) { if (ilk < 0) ilk = i; else enUzun = Math.max(enUzun, susma); sonKare = i; susma = 0; } else if (ilk >= 0) susma++;
  }
  if (ilk < 0) throw new Error('kayıt sessiz');
  const bas = ilk * kare, son = Math.min(x.length, (sonKare + 1) * kare);
  let t = 0;
  for (let i = bas; i < son; i++) t += x[i] * x[i];
  return { bas, son, konusmaMs: Math.round(((son - bas) / HIZ) * 1000), toplamMs: Math.round((x.length / HIZ) * 1000), tepe, rmsDb: db(Math.sqrt(t / Math.max(1, son - bas))), enUzunSusmaMs: enUzun * 5 };
}

/** Baş ve sondaki fazla sessizliği al (ünsüzleri yememek için pay bırak), düzeyi eşitle, mp3 yap */
function isle(x: Float32Array, o: Olcum, hedefDb = -19, tavanDb = -1.5): { mp3: Buffer; x: Float32Array } {
  const bas = Math.max(0, o.bas - Math.round(HIZ * 0.045)), son = Math.min(x.length, o.son + Math.round(HIZ * 0.11));
  const kesit = x.slice(bas, son);
  let kazanc = Math.pow(10, (hedefDb - o.rmsDb) / 20);
  const tavan = Math.pow(10, tavanDb / 20);
  if (o.tepe * kazanc > tavan) kazanc = tavan / o.tepe;
  const gecis = Math.round(HIZ * 0.006);
  for (let i = 0; i < kesit.length; i++) {
    const kenar = Math.min(1, i / gecis, (kesit.length - 1 - i) / gecis);
    kesit[i] = kesit[i] * kazanc * kenar;
  }
  const mp3 = ff(['-f', 'f32le', '-ar', String(HIZ), '-ac', '1', '-i', 'pipe:0', '-c:a', 'libmp3lame', '-b:a', '96k', '-f', 'mp3', 'pipe:1'], Buffer.from(kesit.buffer, kesit.byteOffset, kesit.byteLength));
  return { mp3, x: kesit };
}

/** Dudak hareketi: 60 ms adımlarla ağız açıklığı (0 kapalı … 3 en açık), kaydın kendi tepe düzeyine göre */
function agizDizisi(x: Float32Array): string {
  const adim = Math.round(HIZ * 0.06);
  const d: number[] = [];
  for (let i = 0; i + adim <= x.length; i += adim) {
    let t = 0;
    for (let j = 0; j < adim; j++) t += x[i + j] * x[i + j];
    d.push(Math.sqrt(t / adim));
  }
  const tepe = Math.max(...d, 1e-6);
  return d.map((v) => { const r = v / tepe; return r < 0.07 ? 0 : r < 0.3 ? 1 : r < 0.62 ? 2 : 3; }).join('');
}

// ---------------------------------------------------------------- denetim

/** Konuşma süresinin makul aralığı (ms): aceleye gelmiş ya da uzamış kayıtlar reddedilir */
export function sureSiniri(s: Pick<SesMetni, 'dil' | 'hece' | 'yavas' | 'metin'>): [number, number] {
  const sozcuk = s.metin.trim().split(/\s+/).length;
  if (s.dil === 'en') {
    if (s.yavas) return [Math.max(650, s.hece * 520), s.hece * 1500 + 900];
    if (sozcuk === 1) return [Math.max(300, s.hece * 190), s.hece * 520 + 700];
    return [s.hece * 240, s.hece * 560 + 900];
  }
  return [Math.max(350, s.hece * 110), s.hece * 330 + 1500];
}

const sade = (m: string) => m.toLocaleLowerCase('tr').replace(/[’`]/g, "'").replace(/[^a-z0-9çğıöşüâî' ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Geçici hatalarda (ağ kesintisi, hız sınırı 429, sunucu 5xx) bekleyip yeniden dener */
async function inatla<T>(is: () => Promise<T>, deneme = 4): Promise<T> {
  for (let i = 0; ; i++) {
    try { return await is(); } catch (e) {
      const m = String((e as Error).message ?? e);
      const gecici = /fetch failed|terminated|ECONN|ETIMEDOUT|socket| 429| 5\d\d|ffmpeg: undefined/.test(m);
      if (!gecici || i >= deneme - 1) throw e;
      await new Promise((r) => setTimeout(r, 4000 * (i + 1)));
    }
  }
}

async function yaziyaCevir(mp3: Buffer, dil: 'en' | 'tr'): Promise<string> {
  return inatla(() => yaziyaCevirBir(mp3, dil));
}
async function yaziyaCevirBir(mp3: Buffer, dil: 'en' | 'tr'): Promise<string> {
  const form = new FormData();
  form.append('model_id', 'scribe_v2');
  form.append('language_code', dil);
  form.append('file', new Blob([new Uint8Array(mp3)], { type: 'audio/mpeg' }), 'kayit.mp3');
  const r = await fetch(`${API}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY! }, body: form });
  if (!r.ok) throw new Error(`STT ${r.status}`);
  return ((await r.json()) as { text?: string }).text ?? '';
}

// ---------------------------------------------------------------- üretim

interface Ayar { etiket: string; kararlilik: number; stil: number; benzerlik?: number }
/**
 * Deneyle bulundu (17 Kasım 2026): eleven_v4'te `speed` ayarı tek kelimede hiçbir şey değiştirmiyor (0,7 ve 1,0 aynı süre).
 * Tempo, metnin başına konan yönlendirme etiketiyle veriliyor: "[slowly] Sheep." normalin iki katı sürüyor ve etiket okunmuyor.
 * Etiket seçimi önemli: "[clearly]" boğaz temizleme sesi olarak yorumlandı; yalnız aşağıdaki denenmiş etiketler kullanılır.
 */
/** Yavaş söyleyiş için sırayla denenen yönlendirmeler (bir kelime ilkinde bozuk çıkarsa sonraki denenir) */
const YAVAS_ETIKETLERI = ['[slowly] ', '[very slowly, stretching the word] ', '[speaking slowly and gently] ', '[slowly, pronouncing every sound] ', '[slowly and clearly, like a teacher] '];
function ayar(s: SesMetni, deneme: number): Ayar {
  // klon karakterler İngilizce konuşurken: kendi sesine sadık, neşeli
  if (s.dil === 'en' && (s.kim === 'mino' || s.kim === 'zipzip' || s.kim === 'lokum')) return { etiket: deneme === 0 ? '' : '[cheerfully] ', kararlilik: 0.45, stil: 0.35, benzerlik: 0.85 };
  if (s.dil === 'en') {
    if (s.yavas) return { etiket: YAVAS_ETIKETLERI[deneme % YAVAS_ETIKETLERI.length], kararlilik: 0.6, stil: 0.15 };
    // --neseli: Polly seçmesindeki B adayının ayarı (aynı ses, daha neşeli ve oyuncu)
    if (bayrak('neseli')) return { etiket: deneme === 0 ? '[cheerful, playful] ' : '[cheerful] ', kararlilik: 0.45, stil: 0.45 };
    // seçmede Barış'ın dinleyip beğendiği ayar (kararlılık 0,5 · stil 0,3); ilk deneme bozuk çıkarsa sakin etiketle yeniden
    return { etiket: deneme === 0 ? '' : '[calmly and clearly] ', kararlilik: 0.5, stil: 0.3 };
  }
  // Kino: çizgi filmlerdeki ayar (İtfaiye filmi; Barış 18 Kasım: Kino'nun sesi filmdeki)
  if (s.kim === 'kino') return { etiket: '', kararlilik: 0.47, stil: 0.3, benzerlik: 0.85 };
  return { etiket: '', kararlilik: 0.5, stil: 0.4 };
}

async function seslendir(s: SesMetni, a: Ayar, sesKimligi: string): Promise<Buffer> {
  return inatla(() => seslendirBir(s, a, sesKimligi));
}
async function seslendirBir(s: SesMetni, a: Ayar, sesKimligi: string): Promise<Buffer> {
  const govde: Record<string, unknown> = {
    text: a.etiket + s.metin,
    model_id: 'eleven_v4',
    language_code: s.dil,
    voice_settings: { stability: a.kararlilik, similarity_boost: a.benzerlik ?? 0.8, style: a.stil, use_speaker_boost: true },
  };
  const r = await fetch(`${API}/text-to-speech/${hesapSesi(sesKimligi)}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(govde),
  });
  if (!r.ok) throw new Error(`TTS ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return Buffer.from(await r.arrayBuffer());
}

interface Satir { id: string; kim: string; metin: string; konusmaMs: number; sinir: [number, number]; deneme: number; etiket: string; yazi?: string; uyari: string[] }

async function kayitUret(s: SesMetni, normalMs?: number): Promise<Satir> {
  const sesKimligi = bayrak('ceren-en') && s.dil === 'en' ? SES_KIMLIGI.ceren : SES_KIMLIGI[s.kim];
  const [enAz, enCok] = sureSiniri(s);
  const altSinir = s.yavas && normalMs ? Math.max(enAz, Math.round(normalMs * 1.35)) : enAz;
  let enIyi: { satir: Satir; mp3: Buffer; agiz: string; puan: number } | undefined;
  for (let deneme = 0; deneme < (s.yavas ? YAVAS_ETIKETLERI.length : 3); deneme++) {
    const a = ayar(s, deneme);
    const ham = await seslendir(s, a, sesKimligi);
    const x = await inatla(async () => pcm(ham));
    const o = olc(x);
    const uyari: string[] = [];
    if (o.konusmaMs < altSinir) uyari.push(`hızlı (${o.konusmaMs} ms < ${altSinir})`);
    if (o.konusmaMs > enCok) uyari.push(`uzun (${o.konusmaMs} ms > ${enCok})`);
    if (o.tepe >= 0.995) uyari.push('tepe kırpılmış');
    if (o.bas < HIZ * 0.004) uyari.push('başı kesik olabilir');
    if (x.length - o.son < HIZ * 0.004) uyari.push('sonu kesik olabilir');
    let yazi: string | undefined;
    if (bayrak('stt')) {
      yazi = await yaziyaCevir(ham, s.dil);
      const beklenen = sade(s.metin), duyulan = sade(yazi);
      if (duyulan !== beklenen) uyari.push(`söz farklı duyuldu: "${yazi.trim()}"`);
    }
    const islenmis = isle(x, o);
    const satir: Satir = { id: s.id, kim: s.kim, metin: s.metin, konusmaMs: o.konusmaMs, sinir: [altSinir, enCok], deneme: deneme + 1, etiket: a.etiket.trim(), yazi, uyari };
    // en az uyarılı deneme seçilir; eşitlikte sınıra daha yakın (daha uzun) olan. Sözün farklı duyulması (kelimenin iki kez
    // okunması, gülme sesi) biraz hızlı olmaktan çok daha ağır kusurdur: üç uyarı sayılır.
    const agir = uyari.filter((u) => u.startsWith('söz farklı')).length;
    const puan = (uyari.length + agir * 2) * 10000 - Math.min(o.konusmaMs, altSinir);
    if (!enIyi || puan < enIyi.puan) enIyi = { satir, mp3: islenmis.mp3, agiz: agizDizisi(islenmis.x), puan };
    if (!uyari.length) break;
  }
  const secilen = enIyi!;
  const hedef = path.join(CIKTI, `${s.id}.mp3`);
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, secilen.mp3);
  agizKaydet(s.id, secilen.agiz);
  return secilen.satir;
}

function agizKaydet(id: string, dizi: string) {
  if (deger('cikti')) return; // seçme kayıtları uygulamanın tablosuna girmez
  const tablo = fs.existsSync(AGIZ_DOSYASI) ? (JSON.parse(fs.readFileSync(AGIZ_DOSYASI, 'utf8')) as Record<string, string>) : {};
  tablo[id] = dizi;
  const sirali = Object.fromEntries(Object.entries(tablo).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(AGIZ_DOSYASI, JSON.stringify(sirali, null, 0).replace(/","/g, '",\n"') + '\n');
}

const EFEKT_TARIFI: Record<string, string> = {
  sheep: 'A single sheep bleating "baa" once, close-up, clean recording, no background noise',
  cow: 'A cow mooing once, long friendly moo, close-up, clean recording, no background noise',
  duck: 'A duck quacking three times, close-up, clean recording, no background noise',
  cat: 'A cute cat meowing once, clear meow, close-up, clean recording, no background noise',
  dog: 'A small friendly dog barking twice, woof woof, close-up, clean recording, no background noise',
  horse: 'A horse neighing once, clear whinny, close-up, clean recording, no background noise',
  car: 'A small car horn honking twice, friendly beep beep, clean recording, no background noise',
  bus: 'A city bus horn, one long low honk, clean recording, no background noise',
  train: 'A steam train whistle, two cheerful toots, choo choo, clean recording, no background noise',
  plane: 'A small airplane flying past overhead, propeller engine whoosh, clean recording, no background noise',
  boat: 'A boat horn, one deep foghorn blast, clean recording, no background noise',
  bike: 'A bicycle bell ringing twice, ring ring, close-up, clean recording, no background noise',
  truck: 'A big truck horn, two short deep honks, clean recording, no background noise',
  rocket: 'A toy rocket launching, rising whoosh, clean recording, no background noise',
  chicken: 'A hen clucking, bok bok bok bagawk, close-up, clean recording, no background noise',
  pig: 'A pig oinking three times, friendly oink oink, close-up, clean recording, no background noise',
  snake: 'A snake hissing once, soft long hiss, close-up, clean recording, no background noise',
  lion: 'A lion roaring once, friendly cartoon-like roar, not scary, clean recording, no background noise',
  monkey: 'A monkey chattering happily, ooh ooh aah aah, clean recording, no background noise',
  elephant: 'An elephant trumpeting once, clear trumpet call, clean recording, no background noise',
  bird: 'A small songbird chirping, three clear tweets, close-up, clean recording, no background noise',
  frog: 'A frog croaking twice, ribbit ribbit, close-up, clean recording, no background noise',
  // 23 Kasım 2026: yüz hayvanın kalanı (Hayvan Geçidi, Hayvanat Bahçesi; ses çıkarmayanlarda çizgi film hareket sesi)
  goat: 'A baby goat bleating twice, cute high meh meh, close-up, clean recording, no background noise',
  mouse: 'A tiny mouse squeaking three times, cute high squeak squeak, close-up, clean recording, no background noise',
  donkey: 'A donkey braying once, hee-haw, friendly and funny, close-up, clean recording, no background noise',
  rabbit: 'A rabbit hopping on grass, three soft quick thumps and a tiny sniff, close-up, clean recording, no background noise',
  fish: 'A small fish swimming, quick bubbly bloop bloop with tiny water bubbles, close-up, clean recording, no background noise',
  giraffe: 'A giraffe chewing leaves, soft crunchy munching and a gentle hum, close-up, clean recording, no background noise',
  tiger: 'A tiger giving a short friendly growl, cartoon-like, not scary, close-up, clean recording, no background noise',
  bear: 'A bear giving a short friendly low grumble, cartoon-like, not scary, close-up, clean recording, no background noise',
  zebra: 'A zebra barking call, short high yip yip, then a happy snort, close-up, clean recording, no background noise',
  panda: 'A panda munching bamboo, crunchy chewing and a happy little bleat, close-up, clean recording, no background noise',
  penguin: 'A penguin waddling on ice and squawking happily twice, close-up, clean recording, no background noise',
  turtle: 'A turtle sliding into water, soft gentle splash and a bubble, close-up, clean recording, no background noise',
  crocodile: 'A crocodile snapping its jaws shut twice, cartoon chomp chomp, not scary, close-up, clean recording, no background noise',
  kangaroo: 'A kangaroo hopping, three springy boing boing boing jumps, cartoon-like, close-up, clean recording, no background noise',
  hippo: 'A hippo making a deep happy grunt and a big bubbly splash in water, close-up, clean recording, no background noise',
  butterfly: 'A butterfly fluttering past, very soft light wing flutter with a tiny magical twinkle, clean recording, no background noise',
  dolphin: 'A dolphin clicking and whistling happily, short playful squeaks, close-up, clean recording, no background noise',
  whale: 'A whale singing, one long gentle low song call, then a blowhole spray, clean recording, no background noise',
  shark: 'A small cartoon shark, quick swish through water and a playful chomp, not scary, clean recording, no background noise',
  octopus: 'An octopus moving underwater, soft squishy bloop sounds and bubbles, cartoon-like, clean recording, no background noise',
  crab: 'A crab clicking its claws, snip snap snip snap, cartoon-like, close-up, clean recording, no background noise',
  starfish: 'A starfish on the beach, soft sparkling twinkle with a gentle wave, cartoon-like, clean recording, no background noise',
  seal: 'A seal barking happily, arf arf arf, close-up, clean recording, no background noise',
  jellyfish: 'A jellyfish floating underwater, soft wobbly bloop and gentle bubbles, cartoon-like, clean recording, no background noise',
  seahorse: 'A tiny seahorse swimming, soft bubbly trill and tiny bubbles, cartoon-like, clean recording, no background noise',
  walrus: 'A walrus making a deep funny bellow and snort, cartoon-like, close-up, clean recording, no background noise',
  owl: 'An owl hooting softly, hoo hoo, close-up, clean recording, no background noise',
  parrot: 'A parrot squawking happily twice, bright cheerful squawk, close-up, clean recording, no background noise',
  eagle: 'An eagle calling once, high clear screech, close-up, clean recording, no background noise',
  flamingo: 'A flamingo honking softly twice, nasal honk honk, close-up, clean recording, no background noise',
  peacock: 'A peacock calling once, loud bright call, then a feather fan rustle, clean recording, no background noise',
  swan: 'A swan gliding on water with a soft trumpet-like honk, close-up, clean recording, no background noise',
  ostrich: 'An ostrich running, fast heavy footsteps and a deep boom call, cartoon-like, clean recording, no background noise',
  pigeon: 'A pigeon cooing softly, coo coo, close-up, clean recording, no background noise',
  rooster: 'A rooster crowing once, cock-a-doodle-doo, close-up, clean recording, no background noise',
  turkey: 'A turkey gobbling, gobble gobble, close-up, clean recording, no background noise',
  goose: 'A goose honking twice, loud honk honk, close-up, clean recording, no background noise',
  toucan: 'A toucan croaking call, short rattling croak twice, close-up, clean recording, no background noise',
  crow: 'A crow cawing twice, caw caw, close-up, clean recording, no background noise',
  woodpecker: 'A woodpecker pecking on a tree, fast tap tap tap tap tap drumming, close-up, clean recording, no background noise',
  bee: 'A bee buzzing past, cute short buzz, close-up, clean recording, no background noise',
  ant: 'A tiny ant marching, very light quick tip-tap footsteps, cartoon-like, close-up, clean recording, no background noise',
  ladybug: 'A ladybug opening its wings and flying off, tiny flutter and a cute twinkle, cartoon-like, clean recording, no background noise',
  spider: 'A little spider scuttling, soft quick tippy-tap legs and a tiny boing, cartoon-like, not scary, clean recording, no background noise',
  snail: 'A snail sliding slowly, soft squishy slide, cartoon-like, close-up, clean recording, no background noise',
  worm: 'A worm wiggling out of the soil, soft squiggly wriggle and a tiny pop, cartoon-like, clean recording, no background noise',
  caterpillar: 'A caterpillar munching a leaf, tiny crunchy nibble nibble, cartoon-like, close-up, clean recording, no background noise',
  dragonfly: 'A dragonfly zipping past, quick light wing whirr, close-up, clean recording, no background noise',
  grasshopper: 'A grasshopper chirping, cricket-like chirp chirp chirp, close-up, clean recording, no background noise',
  beetle: 'A beetle buzzing its wings, short low whirring buzz, close-up, clean recording, no background noise',
  fox: 'A fox yipping twice, short playful yip yip, close-up, clean recording, no background noise',
  wolf: 'A wolf cub howling once, short cute howl, not scary, close-up, clean recording, no background noise',
  deer: 'A deer stepping lightly on leaves and making a soft bleat, close-up, clean recording, no background noise',
  squirrel: 'A squirrel chattering quickly, cute chit chit chit, close-up, clean recording, no background noise',
  hedgehog: 'A hedgehog snuffling and sniffing, soft cute snorts, close-up, clean recording, no background noise',
  raccoon: 'A raccoon chittering curiously, soft trill and chatter, close-up, clean recording, no background noise',
  bat: 'A small bat flapping wings with tiny high squeaks, cartoon-like, not scary, clean recording, no background noise',
  beaver: 'A beaver slapping its tail on water, one loud splash, close-up, clean recording, no background noise',
  skunk: 'A skunk making a funny little huff and stomp, cartoon-like, close-up, clean recording, no background noise',
  otter: 'An otter squeaking playfully and splashing in water, close-up, clean recording, no background noise',
  rhino: 'A rhino snorting loudly once, big friendly snort, cartoon-like, close-up, clean recording, no background noise',
  camel: 'A camel grumbling and groaning once, funny low moan, close-up, clean recording, no background noise',
  cheetah: 'A cheetah chirping, short high bird-like chirps, then a quick dash whoosh, clean recording, no background noise',
  leopard: 'A leopard purring and giving a short soft growl, friendly, not scary, close-up, clean recording, no background noise',
  gorilla: 'A gorilla beating its chest, thump thump thump, and a happy hoot, cartoon-like, clean recording, no background noise',
  koala: 'A koala making a soft sleepy grunt and a yawn, cartoon-like, close-up, clean recording, no background noise',
  'polar-bear': 'A polar bear sliding on ice with a short friendly grumble, cartoon-like, clean recording, no background noise',
  sloth: 'A sloth yawning very slowly, long sleepy cartoon yawn, close-up, clean recording, no background noise',
  lizard: 'A lizard scurrying fast on rocks, quick tiny patter, cartoon-like, close-up, clean recording, no background noise',
  chameleon: 'A chameleon shooting out its tongue, quick cartoon zip and a tiny pop, clean recording, no background noise',
  meerkat: 'A meerkat chirping alarm call, short squeaky chirps, close-up, clean recording, no background noise',
  llama: 'A llama humming softly, then a short funny snort, close-up, clean recording, no background noise',
  ox: 'An ox lowing once, deep long moo, close-up, clean recording, no background noise',
  moose: 'A moose bellowing once, deep long low call, close-up, clean recording, no background noise',
  lamb: 'A baby lamb bleating twice, small cute baa baa, close-up, clean recording, no background noise',
  puppy: 'A puppy yipping happily twice, small cute arf arf, close-up, clean recording, no background noise',
  kitten: 'A kitten mewing softly twice, tiny meow meow, close-up, clean recording, no background noise',
  chick: 'A baby chick peeping, cute cheep cheep cheep, close-up, clean recording, no background noise',
  pony: 'A pony whinnying softly, short gentle neigh, close-up, clean recording, no background noise',
  bull: 'A bull snorting and stomping a hoof, cartoon-like, not scary, close-up, clean recording, no background noise',
  hamster: 'A hamster squeaking and nibbling a seed, tiny squeak and crunch, close-up, clean recording, no background noise',
  goldfish: 'A goldfish in a bowl, tiny bloop bloop bubbles, cartoon-like, close-up, clean recording, no background noise',
  duckling: 'A duckling peeping, tiny soft quack quack, close-up, clean recording, no background noise',
  calf: 'A baby calf mooing softly, small gentle moo, close-up, clean recording, no background noise',
  tadpole: 'A tadpole wiggling in a pond, tiny quick swish and a bubble, cartoon-like, clean recording, no background noise',
  foal: 'A baby horse whinnying softly, short high gentle neigh, close-up, clean recording, no background noise',
};

async function efektUret(kelimeId: string): Promise<Satir> {
  const tarif = EFEKT_TARIFI[kelimeId];
  if (!tarif) throw new Error(`efekt tarifi yok: ${kelimeId}`);
  const r = await fetch(`${API}/sound-generation?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: tarif, duration_seconds: 2, prompt_influence: 0.6 }),
  });
  if (!r.ok) throw new Error(`SFX ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const x = pcm(Buffer.from(await r.arrayBuffer()));
  const o = olc(x);
  const { mp3 } = isle(x, o, -20, -2);
  const hedef = path.join(CIKTI, `efekt/${kelimeId}.mp3`);
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.writeFileSync(hedef, mp3);
  return { id: `efekt/${kelimeId}`, kim: 'efekt', metin: tarif, konusmaMs: o.konusmaMs, sinir: [300, 2500], deneme: 1, etiket: '', uyari: o.konusmaMs < 300 ? ['çok kısa'] : [] };
}

// ---------------------------------------------------------------- akış

async function calistir() {
  const uniteler = UNITELER.filter((u) => liste('unite').includes(u.id));
  // --hayvanlar: ünitelerin dışındaki 84 hayvanın altışar kaydı (Hayvan Geçidi, Hayvanat Bahçesi)
  let istenen: SesMetni[] = bayrak('hayvanlar') ? EK_HAYVANLAR.flatMap(kelimeSesleri) : bayrak('ileri')
    ? [...ortakSesler2(), ...uniteler.flatMap(ilerisiSesleri)]
    : [...(bayrak('ortak') ? [...ortakSesler(), ...ekSesler()] : []), ...uniteler.flatMap(uniteSesleri)];
  const idler = liste('id');
  if (idler.length) {
    const hepsi = [...ortakSesler(), ...ekSesler(), ...UNITELER.flatMap(uniteSesleri), ...ortakSesler2(), ...UNITELER.flatMap(ilerisiSesleri), ...EK_HAYVANLAR.flatMap(kelimeSesleri), ...saklambacSesMetinleri(), ...evdeSesMetinleri(), ...adaOyunuSesMetinleri(), ...agacEviSesMetinleri(), ...abcSesMetinleri(), ...trenSesMetinleri(), ...bilmeceSesMetinleri(), ...yerlestirSesMetinleri(), ...canlandirSesMetinleri(), ...ovalaSesMetinleri(), ...masal2SesMetinleri(), ...sohbetSesMetinleri()];
    istenen = idler.map((id) => { const s = hepsi.find((x) => x.id === id); if (!s) throw new Error(`bilinmeyen kayıt: ${id}`); return s; });
  }
  if (deger('kim')) istenen = istenen.filter((s) => s.kim === deger('kim'));
  // --efekt-hayvan: tarifi olup dosyası olmayan bütün hayvan sesleri (yüz hayvan); --efekt-id a,b: yalnız bunlar
  const efektler = bayrak('efekt') ? uniteler.flatMap((u) => u.kelimeler.filter((w) => w.efekt).map((w) => w.id))
    : bayrak('efekt-hayvan') ? [...UNITELER.flatMap((u) => u.kelimeler), ...EK_HAYVANLAR].map((w) => w.id).filter((id) => !!EFEKT_TARIFI[id])
    : liste('efekt-id');
  const var_ = (id: string) => fs.existsSync(path.join(CIKTI, `${id}.mp3`));
  const uretilecek = istenen.filter((s) => bayrak('yeniden') || !var_(s.id));
  const efektUretilecek = efektler.filter((id) => bayrak('yeniden') || !var_(`efekt/${id}`));
  const harf = uretilecek.reduce((t, s) => t + s.metin.length, 0);
  console.log(`${istenen.length} kayıt istendi, ${uretilecek.length} üretilecek (${harf} harf), ${efektUretilecek.length} efekt.`);
  if (bayrak('kuru')) { for (const s of uretilecek) console.log(`  ${s.id.padEnd(26)} ${s.kim.padEnd(6)} ${s.metin}`); return; }
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY gerekli (. ./scripts/elevenlabs-ortam.ps1).');

  const rapor: Satir[] = [];
  const normalSureleri = new Map<string, number>();
  // normal söyleyiş yavaştan önce üretilir: yavaş kayıt normalin en az 1,5 katı olmalı
  uretilecek.sort((a, b) => Number(!!a.yavas) - Number(!!b.yavas));
  for (const s of uretilecek) {
    try {
      const normalId = s.id.replace(/-yavas$/, '');
      const satir = await kayitUret(s, s.yavas ? normalSureleri.get(normalId) : undefined);
      if (!s.yavas) normalSureleri.set(s.id, satir.konusmaMs);
      rapor.push(satir);
      console.log(`${satir.uyari.length ? 'ŞÜPHELİ' : 'tamam  '} ${s.id.padEnd(26)} ${String(satir.konusmaMs).padStart(5)} ms  deneme ${satir.deneme}${satir.uyari.length ? '  · ' + satir.uyari.join('; ') : ''}`);
    } catch (e) {
      rapor.push({ id: s.id, kim: s.kim, metin: s.metin, konusmaMs: 0, sinir: [0, 0], deneme: 0, etiket: '', uyari: [`üretilemedi: ${(e as Error).message}`] });
      console.log(`HATA    ${s.id}: ${(e as Error).message}`);
    }
  }
  for (const id of efektUretilecek) {
    try { const satir = await efektUret(id); rapor.push(satir); console.log(`efekt   ${satir.id.padEnd(26)} ${satir.konusmaMs} ms`); }
    catch (e) { console.log(`HATA    efekt/${id}: ${(e as Error).message}`); }
  }
  fs.mkdirSync(path.dirname(RAPOR_DOSYASI), { recursive: true });
  const eski: Satir[] = fs.existsSync(RAPOR_DOSYASI) && !deger('cikti') ? JSON.parse(fs.readFileSync(RAPOR_DOSYASI, 'utf8')) : [];
  const birlesik = [...eski.filter((e) => !rapor.some((r) => r.id === e.id)), ...rapor];
  fs.writeFileSync(deger('cikti') ? path.join(CIKTI, 'rapor.json') : RAPOR_DOSYASI, JSON.stringify(birlesik, null, 1));
  const supheli = rapor.filter((r) => r.uyari.length);
  console.log(`\nBitti: ${rapor.length} kayıt, ${supheli.length} şüpheli, ${harf} harf harcandı.`);
}

void efektKimligi;
calistir().catch((e) => { console.error(String(e?.message ?? e)); process.exit(1); });
