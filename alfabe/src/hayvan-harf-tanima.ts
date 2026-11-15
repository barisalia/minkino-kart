import { kalemYollari } from './yollar';

export type KalemNoktasi = { x: number; y: number };
type Iz = KalemNoktasi[];
type Ornek = KalemNoktasi & { dx: number; dy: number };
const alfabe = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
const mesafe = (a: KalemNoktasi, b: KalemNoktasi) => Math.hypot(a.x - b.x, a.y - b.y);

function izle(iz: Iz) {
  const uzunluklar = [0];
  for (let i = 1; i < iz.length; i++)
    uzunluklar.push(uzunluklar[i - 1] + mesafe(iz[i], iz[i - 1]));
  const uzunluk = uzunluklar[iz.length - 1];
  if (uzunluk < 0.2) return { noktalar: [iz[0]], uzunluk };
  const adet = Math.max(2, Math.min(120, Math.ceil(uzunluk / 3) + 1));
  let j = 1;
  const noktalar: Iz = [];
  for (let i = 0; i < adet; i++) {
    const s = uzunluk * i / (adet - 1);
    while (j < iz.length - 1 && uzunluklar[j] < s) j++;
    const a = iz[j - 1], b = iz[j];
    const t = (s - uzunluklar[j - 1]) / (uzunluklar[j] - uzunluklar[j - 1] || 1);
    noktalar.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return { noktalar, uzunluk };
}

function betimle(izler: Iz[]) {
  // Parmakla konan bir nokta kısa bir çizgi ya da minik bir halka olabilir.
  // Üst işarete ait küçük izin merkezini sakla; dairesini bir harf gövdesi gibi puanlama.
  const parcalar = izler.map(izle).map(p => {
    if (p.uzunluk > 42) return { ...p, benek: false };
    const xs = p.noktalar.map(n => n.x), ys = p.noktalar.map(n => n.y);
    const sol = Math.min(...xs), sag = Math.max(...xs), ust = Math.min(...ys), alt = Math.max(...ys);
    if (sag-sol > 10 || alt-ust > 10 || alt > 46) return { ...p, benek: false };
    return { noktalar: [{x:(sol+sag)/2, y:(ust+alt)/2}], uzunluk: 0, benek: true };
  });
  const noktalar = parcalar.flatMap(p => p.noktalar);
  const xs = noktalar.map(p => p.x), ys = noktalar.map(p => p.y);
  const sol = Math.min(...xs), sag = Math.max(...xs), ust = Math.min(...ys), alt = Math.max(...ys);
  const en = sag - sol, boy = alt - ust;
  const olcek = Math.max(1, en, boy);
  // Dikey satırları koru; harfi ince/geniş yazmak yatayda bir miktar serbesttir.
  // İncecik gövdeyi büyütmek I veya l harfinin küçük titreşimini şekle dönüştürür.
  const enOlcegi = Math.max(boy * .35, en) ** .76 * olcek ** .24 || 1;
  const bulut: Ornek[] = [];
  let benek = 0;
  for (const { noktalar: p, benek: ufak } of parcalar) {
    if (ufak) benek++;
    for (let i = 0; i < p.length; i++) {
      const a = p[Math.max(0, i - 1)], b = p[Math.min(i + 1, p.length - 1)];
      const dx = (b.x-a.x)/enOlcegi, dy = (b.y-a.y)/olcek, l = Math.hypot(dx,dy) || 1;
      bulut.push({ x: (p[i].x - (sag + sol) / 2) / enOlcegi, y: (p[i].y - (alt + ust) / 2) / olcek,
        dx: ufak ? 0 : dx/l, dy: ufak ? 0 : dy/l });
    }
  }
  return { bulut, en, boy, ust, alt, benek, uzunluk: parcalar.reduce((v, p) => v + p.uzunluk, 0) / olcek };
}

type Bicim = ReturnType<typeof betimle>;

// Üçgen ve dikdörtgenin kenarları A ve O'ya yaklaşabilir. Kalem kapalı,
// köşeli bir çevre çizmişse çocuğa harf tahmin ettirmeden tekrar sun.
function kapaliCokgen(iz: Iz) {
  if (iz.length < 4 || mesafe(iz[0], iz[iz.length - 1]) > 4) return false;
  function koseSay(ilk: number, son: number, kalan: number): number {
    const a = iz[ilk], b = iz[son];
    const dx = b.x - a.x, dy = b.y - a.y, kare = dx * dx + dy * dy;
    let enUzak = 2.2, kose = -1;
    for (let i = ilk + 1; i < son; i++) {
      const p = iz[i];
      const t = kare ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / kare)) : 0;
      const uzaklik = Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
      if (uzaklik > enUzak) { enUzak = uzaklik; kose = i; }
    }
    if (kose < 0) return 1;
    if (kalan <= 1) return 2;
    const sol = koseSay(ilk, kose, kalan - 1);
    return sol >= kalan ? sol + 1 : sol + koseSay(kose, son, kalan - sol);
  }
  const kenarlar = koseSay(0, iz.length - 1, 5);
  return kenarlar >= 3 && kenarlar <= 4;
}

let modeller: { harf: string; bicim: Bicim; yatma: number }[] | undefined;
function harfModelleri() {
  if (modeller) return modeller;
  const yol = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  function model(harf: string, yollar: string[]) {
    const izler = yollar.map(d => {
      yol.setAttribute('d', d);
      const l = yol.getTotalLength();
      const adet = Math.max(1, Math.ceil(l / 2));
      return Array.from({ length: adet + 1 }, (_, i) => yol.getPointAtLength(l * i / adet));
    });
    // Kalemin sağa/sola yatmasını aynı harfle eşleştir. Bütün harflere aynı
    // alternatifleri vererek oyunun gösterdiği örnekten bağımsız kalırız.
    return [0, -.16, .16].map(yatma => ({
      harf, yatma, bicim: betimle(izler.map(iz => iz.map(p => ({x:p.x+(100-p.y)*yatma, y:p.y})))),
    }));
  }
  modeller = [...alfabe, ...alfabe.toLocaleLowerCase('tr')].flatMap(h => model(h, kalemYollari(h)));
  modeller.push(...model('I', ['M34 22 H66', 'M50 22 V100', 'M34 100 H66']));
  modeller.push(...model('l', ['M48 20 V90 Q48 101 58 100']));
  return modeller;
}

function tekYon(a: Ornek[], b: Ornek[]) {
  let toplam = 0, enUzak = 0;
  for (const p of a) {
    let enIyi = Infinity;
    for (const q of b) {
      const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
      if (d >= enIyi) continue;
      const yonFarki = 1 - Math.min(1, Math.abs(p.dx * q.dx + p.dy * q.dy));
      const yonlu = d + (p.dx || p.dy ? .003 * yonFarki ** 2 : 0);
      enIyi = Math.min(enIyi, yonlu);
    }
    toplam += enIyi;
    enUzak = Math.max(enUzak, enIyi);
  }
  return Math.sqrt(toplam / a.length) + .11 * Math.sqrt(enUzak);
}

/** Satırlı 120 × 136 alandaki kalem izleri. Belirsizlikte iki harf, karalamada boş liste. */
export function tani(izler: KalemNoktasi[][]): string[] {
  const temiz = izler.filter(p => p.length);
  if (!temiz.length || temiz.length > 12 ||
      temiz.some(iz => iz.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)))) return [];
  if (temiz.length === 1 && kapaliCokgen(temiz[0])) return [];
  const c = betimle(temiz);
  if (c.boy < 22 || c.uzunluk > 6.8) return [];
  const skor = new Map<string, number>();
  for (const { harf, bicim: m, yatma } of harfModelleri()) {
    const sekil = (tekYon(c.bulut, m.bulut) + tekYon(m.bulut, c.bulut)) / 2;
    const satir = (.65 * Math.abs(c.boy - m.boy) + .35 * Math.abs(c.ust - m.ust)) / 430;
    const uzunluk = .036 * Math.abs(Math.log((c.uzunluk + .1) / (m.uzunluk + .1)));
    const oran = .018 * Math.abs(Math.log((.12 + c.en/c.boy)/(.12 + m.en/m.boy)));
    const fark = sekil + satir + uzunluk + oran + .03 * Math.abs(yatma) + .056 * Math.abs(m.benek - c.benek);
    skor.set(harf, Math.min(skor.get(harf) ?? Infinity, fark));
  }
  const sira = [...skor].sort((a, b) => a[1] - b[1]);
  const [bir, iki] = sira;
  if (bir[1] > .139) return [];
  if (iki[1] - bir[1] < .014 && iki[1] < .139) return [bir[0], iki[0]];
  return [bir[0]];
}

// Kılavuzun ne kadarının izlendiğini ve kalemin yolun yakınında kalmasını ayrı ölç.
export function hedefIzineUyuyor(izler: Iz[], harf: string, yas: '2-3'|'4'|'5+') {
  const iz = izler.filter(p => p.length).flatMap(p => izle(p).noktalar);
  if (iz.length < 3) return false;
  const yol = kalemYollari(harf).flatMap(d => {
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',d);
    const uzunluk = path.getTotalLength(), n = Math.max(1,Math.ceil(uzunluk/3));
    return Array.from({length:n+1},(_,i)=>path.getPointAtLength(i*uzunluk/n));
  });
  const [pay,kapsam,isabet,uzanis] = yas==='2-3' ? [16,.24,.55,12] : yas==='4' ? [11,.53,.7,19] : [7,.8,.8,22];
  if (!iz.some(p=>mesafe(p,iz[0])>=uzanis)) return false;
  const oran=(a:Iz,b:Iz)=>a.filter(p=>b.some(q=>mesafe(p,q)<=pay)).length/a.length;
  return oran(yol,iz)>=kapsam && oran(iz,yol)>=isabet;
}
