// Boyama sayfası için kova doldurma (saf; tests/unit/alfabe-boyama-resmi.test.ts sınar).
// Astra'nın çizimi beyaz zeminde kalın siyah kontur (Paket Harf-H11). Kontur olmayan pikseller kapalı bölgelere ayrılır;
// çocuğun dokunduğu bölge seçilen renkle "çarpma" karışımıyla boyanır: beyaz renge döner, kontur siyah kalır,
// kenar yumuşatması (gri) rengin koyusu olur. Böylece taşma ve beyaz hale olmaz.

/** Bu parlaklığın altı kontur sayılır (0–255). */
export const KONTUR_ESIGI = 128;

export type Bolgeler = { etiket: Int32Array; alan: number[]; kenarda: boolean[] };

/** RGBA → parlaklık (0–255). */
export function parlaklik(rgba: Uint8ClampedArray | Uint8Array): Uint8Array {
  const n = rgba.length / 4, l = new Uint8Array(n);
  for (let i = 0; i < n; i++) l[i] = (rgba[i * 4] * 299 + rgba[i * 4 + 1] * 587 + rgba[i * 4 + 2] * 114) / 1000;
  return l;
}

/** Kontur olmayan pikselleri 4-komşulukla bölgelere ayırır. etiket 0 = kontur; bölgeler 1'den başlar. */
export function bolgele(l: Uint8Array, w: number, h: number, esik = KONTUR_ESIGI): Bolgeler {
  const etiket = new Int32Array(w * h), alan = [0], kenarda = [false];
  const yigin = new Int32Array(w * h);
  let no = 0;
  for (let bas = 0; bas < w * h; bas++) {
    if (etiket[bas] || l[bas] < esik) continue;
    no++; let ust = 0, say = 0, kenar = false;
    yigin[ust++] = bas; etiket[bas] = no;
    while (ust) {
      const p = yigin[--ust]; say++;
      const x = p % w, y = (p - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) kenar = true;
      if (x > 0 && !etiket[p - 1] && l[p - 1] >= esik) { etiket[p - 1] = no; yigin[ust++] = p - 1; }
      if (x < w - 1 && !etiket[p + 1] && l[p + 1] >= esik) { etiket[p + 1] = no; yigin[ust++] = p + 1; }
      if (y > 0 && !etiket[p - w] && l[p - w] >= esik) { etiket[p - w] = no; yigin[ust++] = p - w; }
      if (y < h - 1 && !etiket[p + w] && l[p + w] >= esik) { etiket[p + w] = no; yigin[ust++] = p + w; }
    }
    alan.push(say); kenarda.push(kenar);
  }
  return { etiket, alan, kenarda };
}

/** Dokunulan noktanın bölgesi; kontura dokunulduysa yarıçap içindeki en yakın bölge (yoksa 0). */
export function bolgeBul(b: Bolgeler, w: number, h: number, x: number, y: number, yaricap = 14): number {
  x = Math.round(x); y = Math.round(y);
  if (x >= 0 && y >= 0 && x < w && y < h && b.etiket[y * w + x]) return b.etiket[y * w + x];
  let en = 0, enUzak = Infinity;
  for (let dy = -yaricap; dy <= yaricap; dy++) for (let dx = -yaricap; dx <= yaricap; dx++) {
    const xx = x + dx, yy = y + dy, d = dx * dx + dy * dy;
    if (xx < 0 || yy < 0 || xx >= w || yy >= h || d > yaricap * yaricap || d >= enUzak) continue;
    const e = b.etiket[yy * w + xx];
    if (e) { en = e; enUzak = d; }
  }
  return en;
}

/** Tamamlanmayı sayan büyük bölgeler: resmin içinde (kenara değmeyen) ve alanı en az `oran` olanlar. */
export function buyukBolgeler(b: Bolgeler, toplam: number, oran = 0.004): number[] {
  const sonuc: number[] = [];
  for (let i = 1; i < b.alan.length; i++) if (!b.kenarda[i] && b.alan[i] >= toplam * oran) sonuc.push(i);
  return sonuc;
}

/** Kaç büyük bölge boyanınca resim "bitti" sayılır: en az 3 (ya da hepsi), yaklaşık %60. */
export const bitisSayisi = (buyuk: number) => Math.min(buyuk, Math.max(3, Math.ceil(buyuk * 0.6)));

/** Bölge dizini: her bölgenin pikselleri art arda (bas[no]…bas[no+1]). Yüklenişte bir kez kurulur; dokunuşta tuval taranmaz. */
export type BolgeDizini = { bas: Int32Array; p: Int32Array };
export function bolgeDizini(b: Bolgeler): BolgeDizini {
  const n = b.alan.length, bas = new Int32Array(n + 1);
  for (let e = 1; e < n; e++) bas[e + 1] = bas[e] + b.alan[e];
  const yer = bas.slice(), p = new Int32Array(bas[n]);
  for (let i = 0; i < b.etiket.length; i++) { const e = b.etiket[i]; if (e) p[yer[e]++] = i; }
  return { bas, p };
}

/**
 * Bölgenin pikselleri ve dokunulan noktaya uzaklık karesi; kontur pikselleri de 2 px'e dek katılır (kenar yumuşatması
 * renge karışsın, beyaz hale kalmasın). Dönen dizi uzaklığa göre sıralı (boya dokunulan yerden dalga gibi yayılır).
 * Hız (21 Kasım, yavaş cihazda dokunuş başına 1 sn'yi aşıyordu): bölge dizini hazır gelir, sıralama yerine 1 px'lik
 * halkalara dağıtılır (doğrusal). d, halkanın uzaklık karesidir (azalmaz).
 */
export function bolgePikselleri(b: Bolgeler, w: number, h: number, no: number, x: number, y: number, dizin = bolgeDizini(b)): { p: Int32Array; d: Float32Array } {
  const ic = dizin.p.subarray(dizin.bas[no], dizin.bas[no + 1]);
  // Yalnız bölgenin sınır pikselleri komşu konturu tarar (iç pikselin 2 px yakınında kontur yoktur).
  const ek: number[] = [], eklendi = new Set<number>();
  for (const i of ic) {
    const px = i % w, py = (i - px) / w;
    const sinir = (px > 0 && b.etiket[i - 1] !== no) || (px < w - 1 && b.etiket[i + 1] !== no) || (py > 0 && b.etiket[i - w] !== no) || (py < h - 1 && b.etiket[i + w] !== no);
    if (!sinir) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = px + dx, yy = py + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const j = yy * w + xx;
      if (b.etiket[j] === 0 && !eklendi.has(j)) { eklendi.add(j); ek.push(j); }
    }
  }
  const say = ic.length + ek.length, halka = new Int32Array(say);
  let enBuyuk = 0;
  const al = (k: number) => (k < ic.length ? ic[k] : ek[k - ic.length]);
  for (let k = 0; k < say; k++) { const i = al(k), px = i % w, py = (i - px) / w; const r = Math.floor(Math.sqrt((px - x) ** 2 + (py - y) ** 2)); halka[k] = r; if (r > enBuyuk) enBuyuk = r; }
  const sayac = new Int32Array(enBuyuk + 2);
  for (let k = 0; k < say; k++) sayac[halka[k] + 1]++;
  for (let r = 1; r < sayac.length; r++) sayac[r] += sayac[r - 1];
  const p = new Int32Array(say), d = new Float32Array(say);
  for (let k = 0; k < say; k++) { const yer = sayac[halka[k]]++; p[yer] = al(k); d[yer] = halka[k] * halka[k]; }
  return { p, d };
}

/** Çarpma karışımı: asıl çizim × renk (beyaz renge döner, siyah siyah kalır). */
export function boya(cikti: Uint8ClampedArray, asil: Uint8ClampedArray, pikseller: Int32Array, bas: number, son: number, renk: [number, number, number]) {
  for (let k = bas; k < son; k++) {
    const o = pikseller[k] * 4;
    cikti[o] = asil[o] * renk[0] / 255;
    cikti[o + 1] = asil[o + 1] * renk[1] / 255;
    cikti[o + 2] = asil[o + 2] * renk[2] / 255;
    cikti[o + 3] = 255;
  }
}
