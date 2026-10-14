/**
 * Mekân resminden "temiz plaka" ve "ön plan" çıkarır (kredi harcamaz, yalnız piksel işi).
 *
 * Gemini kareleri bazen hareket edecek nesneyi (inek, kamyon, fincan) resmin içine çizilmiş verir. Kukla parçası
 * üstüne konunca çift görünmesin diye o nesne resimden silinir:
 *   - yontem 'satir'  : her satırda maskenin solundaki ve sağındaki rengin (kısa pencerede ortanca) arasında
 *                       doğrusal geçiş. Düz 2B boyamada (çimen, yol, duvar, çit rayı) temiz sonuç verir.
 *   - yontem 'kaydir' : maske, aynı satırların dx kadar yanındaki piksellerle doldurulur (desenli yüzey: ekose
 *                       örtü). dx verilmezse maskenin çevresinde en az farkı veren dx aranır.
 * 'yasak' çokgenleri (önde duran karakter) hiçbir zaman kaynak olarak kullanılmaz ve silinmez.
 * Ön plan: kutudaki kontur çizgileriyle kapalı figür (kutunun kenarına çizgi aşmadan ulaşan her şey zemindir).
 * Hareketli nesne bu katmanın arkasından geçer.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ANA = path.resolve(KOK, '..', '..', '..');
const require = createRequire(import.meta.url);
const modul = (ad) => { try { return require(ad); } catch { return require(path.join(ANA, 'node_modules', ad)); } };
const sharp = modul('sharp');

function cokgenMaske(w, h, cokgenler) {
  const m = new Uint8Array(w * h);
  for (const c of cokgenler) {
    const ys = c.map((p) => p[1]);
    const y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(h - 1, Math.ceil(Math.max(...ys)));
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let i = 0; i < c.length; i++) {
        const [ax, ay] = c[i], [bx, by] = c[(i + 1) % c.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.ceil(xs[k])); x <= Math.min(w - 1, Math.floor(xs[k + 1])); x++) m[y * w + x] = 1;
      }
    }
  }
  return m;
}

const kutuCokgen = (k) => [[k[0], k[1]], [k[2], k[1]], [k[2], k[3]], [k[0], k[3]]];
const cokgenler = (b) => [...(b.cokgen ? [b.cokgen] : []), ...(b.cokgenler ?? []), ...(b.kutu ? [kutuCokgen(b.kutu)] : [])];

function ortanca(d, w, y, x0, x1, kanal, gecerli, h) {
  const v = [];
  for (let yy = Math.max(0, y - 3); yy <= Math.min(h - 1, y + 3); yy++) {
    for (let x = x0; x <= x1; x++) if (gecerli(x, yy)) v.push(d[(yy * w + x) * 4 + kanal]);
  }
  if (!v.length) return d[(y * w + x0) * 4 + kanal];
  v.sort((a, b) => a - b);
  return v[v.length >> 1];
}

/** Maskeyi satır satır sol / sağ komşu renkler arasında doğrusal geçişle doldurur. taraf: 'sol' | 'sag' yalnız o yanı kullanır. */
function satirDoldur(d, w, h, m, yasak, pencere, taraf) {
  const gecerli = (x, y) => x >= 0 && x < w && !m[y * w + x] && !yasak[y * w + x];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!m[y * w + x]) { x++; continue; }
      const a = x;
      while (x < w && m[y * w + x]) x++;
      const b = x - 1;
      // sol / sağ: maskenin hemen dışındaki geçerli pencere (ortanca: tek çimen tutamı, çit direği çizgiyi bozmaz)
      const solVar = taraf !== 'sag' && gecerli(a - 1, y), sagVar = taraf !== 'sol' && gecerli(b + 1, y);
      const sol = solVar ? [0, 1, 2].map((k) => ortanca(d, w, y, Math.max(0, a - pencere), a - 1, k, gecerli, h)) : null;
      const sag = sagVar ? [0, 1, 2].map((k) => ortanca(d, w, y, b + 1, Math.min(w - 1, b + pencere), k, gecerli, h)) : null;
      if (!sol && !sag) continue;
      for (let xx = a; xx <= b; xx++) {
        const u = (xx - a + 1) / (b - a + 2);
        for (let k = 0; k < 3; k++) {
          const v = sol && sag ? sol[k] + (sag[k] - sol[k]) * u : (sol ?? sag)[k];
          d[(y * w + xx) * 4 + k] = Math.round(v);
        }
      }
    }
  }
}

/**
 * Maskeyi aynı satırın dx yanındaki piksellerle doldurur; kaynak da maskedeyse bir dx daha atlanır (desen tekrarı:
 * dx desenin periyoduysa ekose kesintisiz sürer). dx yoksa her 'bant' satırlık dilim için maskenin iki yanındaki
 * halkada en uyumlu dx aranır (perspektifte periyot satırdan satıra değişir).
 */
function kaydirDoldur(d, w, h, m, yasak, dxVerilen, ara = [-600, 600], bant = 8) {
  const kaynakGecerli = (x, y) => x >= 0 && x < w && !m[y * w + x] && !yasak[y * w + x];
  const kaynak = (x, y, c) => { for (let k = 1; k <= 8; k++) { const xx = x + k * c; if (xx < 0 || xx >= w) return -1; if (kaynakGecerli(xx, y)) return xx; } return -1; };
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let i = 0; i < w * h; i++) if (m[i]) { const x = i % w, y = (i / w) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const ozgun = Buffer.from(d);
  for (let ya = y0; ya <= y1; ya += bant) {
    const yb = Math.min(y1, ya + bant - 1);
    let dx = dxVerilen, enIyi = Infinity;
    if (dx == null) {
      for (let c = ara[0]; c <= ara[1]; c += 1) {
        if (Math.abs(c) < 8) continue;
        let gecer = true, mal = 0, n = 0;
        for (let y = Math.max(0, ya - 2); y <= Math.min(h - 1, yb + 2) && gecer; y++) {
          for (let x = Math.max(0, x0 - 16); x <= Math.min(w - 1, x1 + 16); x++) {
            const i = y * w + x;
            if (m[i]) { if (y >= ya && y <= yb && kaynak(x, y, c) < 0) { gecer = false; break; } continue; }
            if (yasak[i]) continue;
            // yalnız maskeye 16 px yakın halka
            let yakin = false;
            for (let k = -16; k <= 16 && !yakin; k += 4) { const xx = x + k; if (xx >= 0 && xx < w && m[y * w + xx]) yakin = true; }
            if (!yakin) continue;
            const xs = kaynak(x, y, c);
            if (xs < 0) continue;
            const j = y * w + xs;
            for (let k = 0; k < 3; k++) { const f = ozgun[i * 4 + k] - ozgun[j * 4 + k]; mal += f * f; }
            n++;
          }
        }
        if (gecer && n && mal / n < enIyi) { enIyi = mal / n; dx = c; }
      }
      if (dx == null) throw new Error('kaydir: geçerli dx yok (satır ' + ya + ')');
    }
    for (let y = ya; y <= yb; y++) for (let x = x0; x <= x1; x++) {
      const i = y * w + x;
      if (!m[i]) continue;
      const xs = kaynak(x, y, dx);
      if (xs < 0) continue;
      for (let k = 0; k < 3; k++) d[i * 4 + k] = ozgun[(y * w + xs) * 4 + k];
    }
  }
}

/**
 * b: { cokgen | cokgenler | kutu, yontem: 'satir'|'kaydir', taraf?: 'sol'|'sag', y_aralik?, dx?, ara?, bant?, pencere?, yumusak? }
 * Önce bütün bölgeler doldurulur, sonra 'satir' dolgularının içi hafifçe bulanıklaştırılır (komşu bölgenin henüz
 * silinmemiş nesnesi dolguya sızmasın).
 */
export async function temizPlaka(giris, cikis, bolgeler, yasaklar = []) {
  const { data, info } = await sharp(giris).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const yasak = cokgenMaske(w, h, yasaklar.flatMap(cokgenler));
  const maskeler = bolgeler.map((b) => {
    const m = cokgenMaske(w, h, cokgenler(b));
    for (let i = 0; i < w * h; i++) if (yasak[i]) m[i] = 0;
    if (b.y_aralik) {   // aynı çokgenin satır dilimi (üst dilimde yalnız bir yan kullanmak gibi)
      for (let i = 0; i < w * h; i++) { const y = (i / w) | 0; if (y < b.y_aralik[0] || y > b.y_aralik[1]) m[i] = 0; }
    }
    return m;
  });
  bolgeler.forEach((b, k) => {
    if ((b.yontem ?? 'satir') === 'satir') satirDoldur(data, w, h, maskeler[k], yasak, b.pencere ?? 40, b.taraf);
    else kaydirDoldur(data, w, h, maskeler[k], yasak, b.dx, b.ara, b.bant);
  });
  // satır dolgusunun içi hafif bulanık: satır geçişlerindeki tek piksel çizgiler kaybolsun
  const yum = await sharp(Buffer.from(data), { raw: { width: w, height: h, channels: 4 } }).blur(1.2).raw().toBuffer();
  bolgeler.forEach((b, k) => {
    if ((b.yontem ?? 'satir') !== 'satir' || b.yumusak === 0) return;
    const m = maskeler[k];
    for (let i = 0; i < w * h; i++) if (m[i]) for (let c = 0; c < 3; c++) data[i * 4 + c] = yum[i * 4 + c];
  });
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).removeAlpha().png().toFile(cikis);
}

/** Kare pencerede min / max (ayrılabilir: önce satır, sonra sütun). */
function kutuSuz(m, w, h, r, tur) {
  const ara = new Uint8Array(w * h), cik = new Uint8Array(w * h);
  const birles = tur === 'min' ? (a, b) => a & b : (a, b) => a | b;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = tur === 'min' ? 1 : 0;
    for (let k = -r; k <= r; k++) { const xx = Math.min(w - 1, Math.max(0, x + k)); v = birles(v, m[y * w + xx]); }
    ara[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = tur === 'min' ? 1 : 0;
    for (let k = -r; k <= r; k++) { const yy = Math.min(h - 1, Math.max(0, y + k)); v = birles(v, ara[yy * w + x]); }
    cik[y * w + x] = v;
  }
  return cik;
}

/**
 * Ön plan katmanı: kutu içindeki, koyu kontur çizgileriyle çevrili figür(ler). Kutu kenarına çizgiyi aşmadan
 * ulaşan açık pikseller zemindir; kalan her şey (çizgi + içi) figürdür. Çıktı kutu boyunda şeffaf PNG.
 * on: { kutu:[x0,y0,x1,y1], esik? (kontur sayılan en yüksek parlaklık), zemin?: [çokgen] (zorla zemin),
 *       sinir?: çokgen (dışı zemin), acma? (px; bundan ince çizgiler atılır), en_kucuk? (en büyük parçaya oranla atılan kırıntı) }
 */
export async function onPlan(giris, cikis, on) {
  const [x0, y0, x1, y1] = on.kutu;
  const w = x1 - x0, h = y1 - y0;
  const { data } = await sharp(giris).extract({ left: x0, top: y0, width: w, height: h }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const esik = on.esik ?? 110;
  const cizgi = (i) => { const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2]; return 0.3 * r + 0.55 * g + 0.15 * b < esik; };
  // çizgileri 1 px kalınlaştır: kenar yumuşatmasındaki ince boşluklardan zemin içeri sızmasın
  const duvar = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!cizgi(y * w + x)) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h) duvar[yy * w + xx] = 1;
    }
  }
  const zemin = new Uint8Array(w * h);
  const yigin = [];
  const zorla = on.zemin ? cokgenMaske(w, h, on.zemin.map((c) => c.map(([x, y]) => [x - x0, y - y0]))) : new Uint8Array(w * h);
  for (let x = 0; x < w; x++) yigin.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) yigin.push(y * w, y * w + w - 1);
  for (let i = 0; i < w * h; i++) if (zorla[i]) yigin.push(i);
  while (yigin.length) {
    const i = yigin.pop();
    if (zemin[i] || (duvar[i] && !zorla[i])) continue;
    zemin[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) yigin.push(i - 1); if (x < w - 1) yigin.push(i + 1);
    if (y > 0) yigin.push(i - w); if (y < h - 1) yigin.push(i + w);
  }
  // kalınlaştırılan çizginin dış yarısı (zemine bakan 1 px) geri zemin olur
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (zemin[i] || cizgi(i)) continue;
    if ((x > 0 && zemin[i - 1]) || (x < w - 1 && zemin[i + 1]) || (y > 0 && zemin[i - w]) || (y < h - 1 && zemin[i + w])) zemin[i] = 2;
  }
  // sınır çokgeni: dışı her zaman zemin (figüre değen çit / çiçek gibi çizili şeyler katmana girmesin)
  if (on.sinir) {
    const ic = cokgenMaske(w, h, [on.sinir.map(([x, y]) => [x - x0, y - y0])]);
    for (let i = 0; i < w * h; i++) if (!ic[i]) zemin[i] = 1;
  }
  // açma (aşınma + genişleme): figüre değen ince çizgiler (yol kenarı, tepe çizgisi) katmandan atılır
  const r = on.acma ?? 5;
  if (r > 0) {
    const fig = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) fig[i] = zemin[i] ? 0 : 1;
    const asin = kutuSuz(fig, w, h, r, 'min');
    const gen = kutuSuz(asin, w, h, r, 'max');
    for (let i = 0; i < w * h; i++) if (!gen[i]) zemin[i] = 1;
  }
  // küçük figür kırıntıları (çimen tutamı, çiçek) atılır: yalnız büyük parçalar kalır
  const etiket = new Int32Array(w * h).fill(-1); const boy = [];
  for (let i0 = 0; i0 < w * h; i0++) {
    if (zemin[i0] || etiket[i0] >= 0) continue;
    const id = boy.length; let n = 0; const st = [i0]; etiket[i0] = id;
    while (st.length) { const i = st.pop(); n++; const x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && !zemin[j] && etiket[j] < 0) { etiket[j] = id; st.push(j); } }
    boy.push(n);
  }
  const enBuyuk = Math.max(...boy);
  const a = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) a[i] = !zemin[i] && boy[etiket[i]] >= enBuyuk * (on.en_kucuk ?? 0.05) ? 255 : 0;
  const yum = await sharp(a, { raw: { width: w, height: h, channels: 1 } }).blur(0.7).extractChannel(0).raw().toBuffer();
  for (let i = 0; i < w * h; i++) data[i * 4 + 3] = a[i] ? 255 : Math.min(255, yum[i]);
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(cikis);
}

/**
 * Düz renkli zemini (beyaz ya da açık nane yeşili gibi) şeffaf yapar: zemin rengi köşelerden okunur, kenardan
 * taşma doldurmayla içeri ilerlenir; kontur kenarındaki karışık pikseller zemin renginden arındırılır (yeşil hare
 * kalmaz). En büyük parça ve ona yakın büyüklüktekiler kalır, boş kenar kırpılır.
 */
export async function zeminSil(giris, cikis, ayar = {}) {
  const { data, info } = await sharp(giris).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  if (data[3] < 250 && data[(w * h - 1) * 4 + 3] < 250) { await sharp(giris).png().toFile(cikis); return; } // zaten şeffaf
  // zemin rengi: dört köşe şeridinin ortancası
  const ornek = [[], [], []];
  for (const [cx, cy] of [[0, 0], [w - 12, 0], [0, h - 12], [w - 12, h - 12]])
    for (let y = cy; y < cy + 12; y++) for (let x = cx; x < cx + 12; x++) for (let k = 0; k < 3; k++) ornek[k].push(data[(y * w + x) * 4 + k]);
  const zr = ornek.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  const uzak = (i) => Math.hypot(data[i * 4] - zr[0], data[i * 4 + 1] - zr[1], data[i * 4 + 2] - zr[2]);
  const esik = ayar.esik ?? 26;      // bu kadar yakın → kesin zemin
  const tam = ayar.tam ?? 95;        // bu kadar uzak → kesin çizim (arada kısmi saydam)
  const dis = new Uint8Array(w * h);
  const yigin = [];
  for (let x = 0; x < w; x++) yigin.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) yigin.push(y * w, y * w + w - 1);
  while (yigin.length) {
    const i = yigin.pop();
    if (dis[i] || uzak(i) > esik) continue;
    dis[i] = 1;
    const x = i % w, y = (i / w) | 0;
    if (x > 0) yigin.push(i - 1); if (x < w - 1) yigin.push(i + 1);
    if (y > 0) yigin.push(i - w); if (y < h - 1) yigin.push(i + w);
  }
  const etiket = new Int32Array(w * h).fill(-1); const boy = [];
  for (let i0 = 0; i0 < w * h; i0++) {
    if (dis[i0] || etiket[i0] >= 0) continue;
    const id = boy.length; let n = 0; const st = [i0]; etiket[i0] = id;
    while (st.length) { const i = st.pop(); n++; const x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1])
        if (j >= 0 && !dis[j] && etiket[j] < 0) { etiket[j] = id; st.push(j); } }
    boy.push(n);
  }
  const enBuyuk = Math.max(...boy);
  for (let i = 0; i < w * h; i++) if (!dis[i] && boy[etiket[i]] < enBuyuk * 0.08) dis[i] = 1;
  // kenar bandı (zemine 3 px içindeki çizim pikselleri): alfa renk uzaklığından, renk zeminden arındırılır
  const kenar = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (dis[i]) continue;
    let yakin = false;
    for (let dy = -3; dy <= 3 && !yakin; dy++) for (let dx = -3; dx <= 3; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && dis[yy * w + xx]) { yakin = true; break; }
    }
    if (yakin) kenar[i] = 1;
  }
  for (let i = 0; i < w * h; i++) {
    if (dis[i]) { data[i * 4 + 3] = 0; continue; }
    if (!kenar[i]) { data[i * 4 + 3] = 255; continue; }
    const a = Math.min(1, Math.max(0, (uzak(i) - esik * 0.5) / (tam - esik * 0.5)));
    if (a < 0.02) { data[i * 4 + 3] = 0; continue; }
    for (let k = 0; k < 3; k++) data[i * 4 + k] = Math.max(0, Math.min(255, Math.round((data[i * 4 + k] - (1 - a) * zr[k]) / a)));
    data[i * 4 + 3] = Math.round(a * 255);
  }
  const img = sharp(data, { raw: { width: w, height: h, channels: 4 } });
  await (ayar.kirp === false ? img : img.trim({ threshold: 1 })).png().toFile(cikis);
  return { zemin: zr };
}

export const varMi = (p) => fs.existsSync(p);
