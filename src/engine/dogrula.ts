import { HAFIZA_CIFT, SAY_UST, SECENEK_SAYISI, YAS_TIPLERI } from './kurallar';
import { kart, refCoz, temaBul } from './katalog';
import { dogruIndeks } from './soru';
import type { IcerikDosyasi, KartGirdi, Soru, Yas } from './types';

/** Bir içerik dosyasındaki hataları döndürür (boş dizi = sorun yok). */
export function dosyaDogrula(d: IcerikDosyasi): string[] {
  const hatalar: string[] = [];
  const yas = d.yas as Yas;
  if (!YAS_TIPLERI[yas]) hatalar.push(`geçersiz yaş: ${d.yas}`);
  if (!temaBul(d.tema)) hatalar.push(`geçersiz tema: ${d.tema}`);
  d.sorular.forEach((s, i) => {
    for (const h of soruDogrula(s, yas)) hatalar.push(`${d.yas}/${d.tema} #${i + 1} (${s.soru_metni}): ${h}`);
  });
  return hatalar;
}

function refHatalari(g: KartGirdi, yer: string): string[] {
  const r = refCoz(g);
  if (!r.kart && !r.yazi) return [`${yer}: kart veya yazi gerekli`];
  if (r.kart && !kart(r.kart)) return [`${yer}: bilinmeyen kart "${r.kart}"`];
  return [];
}

export function soruDogrula(s: Soru, yas: Yas): string[] {
  const h: string[] = [];
  if (!YAS_TIPLERI[yas]?.includes(s.tip)) h.push(`${s.tip} bu yaşa uygun değil`);
  if (!s.soru_metni?.trim()) h.push('soru_metni boş');
  if (!Array.isArray(s.kartlar) || s.kartlar.length === 0) {
    h.push('kartlar boş');
    return h;
  }
  s.kartlar.forEach((g, i) => h.push(...refHatalari(g, `kartlar[${i}]`)));
  (s.gosterge ?? []).forEach((g, i) => h.push(...refHatalari(g, `gosterge[${i}]`)));
  if (s.ikon && !kart(s.ikon)) h.push(`bilinmeyen ikon "${s.ikon}"`);
  if (s.odul && !kart(s.odul)) h.push(`bilinmeyen odul "${s.odul}"`);

  if (s.tip === 'HAFIZA') {
    const cift = HAFIZA_CIFT[yas];
    if (s.kartlar.length !== cift) h.push(`HAFIZA ${yas} yaş için ${cift} farklı kart ister (${s.kartlar.length} var)`);
    const idler = s.kartlar.map((g) => refCoz(g).kart ?? refCoz(g).yazi);
    if (new Set(idler).size !== idler.length) h.push('HAFIZA kartları birbirinden farklı olmalı');
    return h;
  }

  const beklenen = s.tip === 'FARKLI' ? 4 : SECENEK_SAYISI[yas];
  if (s.kartlar.length !== beklenen) h.push(`${beklenen} seçenek olmalı (${s.kartlar.length} var)`);
  if (s.dogru === undefined) h.push('dogru eksik');
  else if (dogruIndeks(s) < 0) h.push(`dogru "${s.dogru}" seçeneklerde yok`);
  if (typeof s.dogru === 'string') {
    const tekrar = s.kartlar.filter((g) => refCoz(g).kart === s.dogru).length;
    if (tekrar > 1) h.push('dogru kart seçeneklerde birden fazla; sıra numarası kullanın');
  }

  if (s.tip === 'ESLESTIR') {
    if (s.gosterge?.length !== 1) h.push('ESLESTIR tek hedef (gosterge) ister');
  }
  if (s.tip === 'SAY') {
    if (!s.gosterge?.length) h.push('SAY gosterge ister');
    for (const g of s.kartlar) {
      const k = kart(refCoz(g).kart ?? '');
      if (k?.tur !== 'sayi') h.push('SAY seçenekleri sayı kartı olmalı');
    }
    const cevap = saySonucu(s);
    const d = s.kartlar[dogruIndeks(s)];
    const dk = d ? kart(refCoz(d).kart ?? '') : undefined;
    if (dk && Number(dk.deger) !== cevap) h.push(`SAY cevabı ${cevap} olmalı, dogru=${dk.deger}`);
    if (cevap > SAY_UST[yas]) h.push(`SAY ${yas} yaş için en çok ${SAY_UST[yas]}`);
  }
  if (s.tip === 'SIRADAKI' && (s.gosterge?.length ?? 0) < 2) h.push('SIRADAKI en az 2 gösterge ister');
  if (s.tip === 'FARKLI' && s.gosterge?.length) h.push('FARKLI gosterge kullanmaz');
  return h;
}

/** SAY sorusunun sayısal cevabı. */
export function saySonucu(s: Soru): number {
  const g = (s.gosterge ?? []).map(refCoz);
  if (s.islem === '-') return g.reduce((t, r) => t + (r.adet ?? 1) - (r.carpi ?? 0), 0);
  return g.reduce((t, r) => t + (r.adet ?? 1), 0);
}
