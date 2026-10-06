// Tasarımcının katmanlı karakter iskeletlerini (ekip/pazar-musteri/<ad>.svg + <ad>.json) oyun varlıklarına aktarır:
// assets/karakter-iskelet/<ad>.svg (olduğu gibi) ve <ad>.json (BOM'suz, sade). Standart: ekip/film/FILM-REHBERI.md §5.
// Ana karakterler kendi klasöründen gelir: ekip/kino/kino-final.svg + .json → kino.
// Çalıştırma: node scripts/karakter/iskelet-al.mjs
import fs from 'node:fs';
import path from 'node:path';

// ekip/cocuk: çocuk karakterler (Ada, Can, Elif…; Sesli Maceralar)
const KAYNAK = ['ekip/pazar-musteri', 'ekip/film/cizim', 'ekip/cocuk'];
/** [klasör, dosya adı (uzantısız), iskelet adı] */
const ANA = [
  ['ekip/kino', 'kino-final', 'kino'],
  // Kino yan görünüş (yandan yürüyüş, src/karakter/yandan.ts) ve 3/4 görünüş (Adobe, Turntable + Gemini)
  ['ekip/kino', 'kino-profil', 'kino-profil'],
  ['ekip/kino', 'kino-34', 'kino-34'],
  // Pamuk: komşunun beyaz kedisi (Dedektif Mino); ağızlar ve ifadeler gizli
  ['ekip/pamuk', 'pamuk-final', 'pamuk'],
  // Bebek Ege (Sesli Maceralar Bölüm 2): kafa, kol, bacak, göz, ağız, kaş katmanları
  ['ekip/ege', 'ege', 'ege'],
  // Anne (Ege bölümü): ayakta çizimi (anne.webp) + dudak senkronu ağızları; tuval 428×1143 (ekip/ege/IFADELER.md)
  ['ekip/ege', 'anne', 'anne'],
  // Anne sarılma pozu (assets/ege/anne-sariliyor.webp): gizli goz-kapali katmanı (ekip/ege/IFADELER.md)
  ['ekip/ege', 'anne-sariliyor', 'anne-sariliyor'],
];
/**
 * İfade setleri (göster / gizle). Kaynak JSON'da "ifadeler" varsa o, yoksa buradaki tablo (tasarımcının ifade
 * belgesinden: Ege → ekip/ege/IFADELER.md). src/karakter/karakter.ts `ifade(ad)` bunları kullanır.
 */
const GOZLER = ['goz-sol', 'goz-sag', 'goz-kapali'];
/** Çocuk karakterler: gizli ekler goz-kapali, agiz-acik (konuşma / şaşkın), agiz-gulus */
const COCUK_IFADE = {
  saskin: { goster: ['agiz-acik'], gizle: ['agiz'] },
  mutlu: { goster: ['agiz-gulus'], gizle: ['agiz'] },
  dilek: { goster: ['goz-kapali', 'agiz-gulus'], gizle: ['goz-sol', 'goz-sag', 'agiz'] },
};
const IFADE_TABLOSU = {
  ada: COCUK_IFADE,
  can: COCUK_IFADE,
  elif: COCUK_IFADE,
  deniz: COCUK_IFADE,
  zeynep: COCUK_IFADE,
  ege: {
    agliyor: { goster: ['goz-agliyor', 'agiz-agliyor'], gizle: [...GOZLER, 'kas', 'agiz'] },
    am: { goster: ['agiz-am'], gizle: ['agiz'] },
    kikir: { goster: ['goz-kikir', 'agiz-kikir'], gizle: [...GOZLER, 'agiz'] },
    kahkaha: { goster: ['goz-kikir', 'agiz-kahkaha'], gizle: [...GOZLER, 'agiz'] },
    saskin: { goster: ['goz-saskin', 'agiz-saskin'], gizle: [...GOZLER, 'kas', 'agiz'] },
    buzuk: { goster: ['agiz-buzuk'], gizle: ['agiz'] },
    esniyor: { goster: ['goz-esniyor', 'agiz-esniyor'], gizle: [...GOZLER, 'agiz'] },
    uyuyor: { goster: ['goz-uyku'], gizle: GOZLER },
    'uykuda-gulumsuyor': { goster: ['goz-uyku', 'agiz-uyku-gulus'], gizle: [...GOZLER, 'agiz'] },
    'tek-goz': { goster: ['goz-tek-acik'], gizle: ['goz-sag', 'goz-kapali'] },
  },
};
const HEDEF = 'assets/karakter-iskelet';
fs.mkdirSync(HEDEF, { recursive: true });

/**
 * Baş çevirme (ör. Ege): kafaya bağlı katmanların "<katman>-sola" / "<katman>-saga" sürümleri varsa her ifade için
 * "<ifade>-sola" / "<ifade>-saga" (ve "normal-sola/saga") setleri üretilir: görünen her yönlü katman X yerine X-yön.
 */
function yonSetleri(b, ifadeler) {
  const yonlu = new Set(b.sira.filter((id) => /-(sola|saga)$/.test(id)).map((id) => id.replace(/-(sola|saga)$/, '')));
  if (!yonlu.size) return ifadeler;
  const tabanGorunur = b.sira.filter((id) => yonlu.has(id) && !b.gizli.includes(id));
  const cikti = { ...(ifadeler ?? {}) };
  for (const yon of ['sola', 'saga']) {
    for (const [ad, set] of [['normal', { goster: [], gizle: [] }], ...Object.entries(ifadeler ?? {})]) {
      const gorunur = new Set(tabanGorunur.filter((x) => !set.gizle.includes(x)));
      set.goster.forEach((x) => gorunur.add(x));
      const goster = [...gorunur].map((x) => (yonlu.has(x) ? `${x}-${yon}` : x));
      const gizle = [...new Set([...set.gizle, ...gorunur])].filter((x) => yonlu.has(x));
      cikti[`${ad}-${yon}`] = { goster, gizle };
    }
  }
  return cikti;
}

let n = 0;
function aktar(jsonYol, svg, ad) {
  if (!fs.existsSync(jsonYol) || !fs.existsSync(svg)) return;
  const bilgi = JSON.parse(fs.readFileSync(jsonYol, 'utf8').replace(/^﻿/, ''));
  if (!bilgi.donme || !bilgi.sira) return;
  const sade = { ad: bilgi.ad ?? ad, boyut: bilgi.boyut ?? 2048, sira: bilgi.sira, gizli: bilgi.gizli ?? [], bagli: bilgi.bagli ?? {}, donme: bilgi.donme };
  // kare olmayan tuval (ör. anne 428×1143): en × boy da yazılır, boyut uzun kenar
  if (Array.isArray(bilgi.tuval)) {
    sade.tuval = bilgi.tuval;
    if (!bilgi.boyut) sade.boyut = Math.max(...bilgi.tuval);
  }
  const ifadeler = yonSetleri(sade, bilgi.ifadeler ?? IFADE_TABLOSU[ad]);
  if (ifadeler) sade.ifadeler = ifadeler;
  fs.writeFileSync(path.join(HEDEF, `${ad}.json`), JSON.stringify(sade, null, 2) + '\n');
  fs.copyFileSync(svg, path.join(HEDEF, `${ad}.svg`));
  console.log('✓', ad, `${sade.sira.length} katman`, `${Math.round(fs.statSync(svg).size / 1024)} KB`);
  n++;
}
for (const klasor of KAYNAK) {
  if (!fs.existsSync(klasor)) continue;
  for (const dosya of fs.readdirSync(klasor)) {
    if (!dosya.endsWith('.json')) continue;
    const ad = path.basename(dosya, '.json');
    aktar(path.join(klasor, dosya), path.join(klasor, `${ad}.svg`), ad);
  }
}
for (const [klasor, dosya, ad] of ANA) aktar(path.join(klasor, `${dosya}.json`), path.join(klasor, `${dosya}.svg`), ad);
console.log(n, 'iskelet aktarıldı →', HEDEF);
