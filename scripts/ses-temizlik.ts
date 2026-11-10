/**
 * Ölü seslendirme kayıtlarını bulur (ve --sil ile siler): artık hiçbir oyunda ya da kitapta geçmeyen cümlelerin mp3'leri.
 *
 *   npx vite-node scripts/ses-temizlik.ts           # yalnız sayar
 *   npx vite-node scripts/ses-temizlik.ts -- --sil  # dosyaları siler, manifest kayıtlarını çıkarır
 *   ... -- --sil --kitap                            # kitap seslerini de (yakında kitapların hazır sesleri dahil)
 *
 * Ölü sayılan:
 * - public/ses/manifest.json → dosyalar: cümlesi tumCumleler()'de olmayan anlatıcı kayıtları (web + uygulama, bütün oyunlar)
 * - manifest → karakterler: cümlesi o karakterin karakterCumleleri() listesinde olmayan kayıtlar
 * - public/ses/kitap/manifest.json → satirlar: raftaki kitapların (KITAPLAR, içeriği olanlar) sayfalarında ve canlanan
 *   anlarında geçmeyen satırlar. DİKKAT: rafta "yakında" olan (içeriksiz) kitabın sesleri de ölü sayılır.
 * - hiçbir manifestte geçmeyen mp3 dosyaları
 * Silinen cümle ileride geri gelirse CI (yayinla.yml) yeniden seslendirir (kredi harcar), o yüzden yalnız ölüler silinir.
 */
import fs from 'node:fs';
import path from 'node:path';
import { karakterCumleleri, tumCumleler } from '../src/audio/cumleler';
import { KITAPLAR } from '../kitap/src/kitaplar';
import { satirAnahtari } from '../kitap/src/ses-mantik';

const SIL = process.argv.includes('--sil');
/** kitap sesleri yalnız istenince (--kitap): rafta "yakında" duran kitabın hazır sesleri silinmesin */
const KITAP = process.argv.includes('--kitap');
const KOK = process.cwd();
const kl = path.join(KOK, 'public/ses');
const boy = (f: string) => {
  try {
    return fs.statSync(path.join(kl, f)).size;
  } catch {
    return 0;
  }
};
const MB = (n: number) => (n / 1e6).toFixed(1) + ' MB';
const olu: string[] = [];

// anlatıcı ve karakter kayıtları
const mYol = path.join(kl, 'manifest.json');
const m = JSON.parse(fs.readFileSync(mYol, 'utf8'));
const tum = new Set(tumCumleler());
const kc = karakterCumleleri();
const kullanilan = new Set<string>();
for (const [c, f] of Object.entries(m.dosyalar as Record<string, string>)) {
  if (tum.has(c)) kullanilan.add(f);
  else {
    olu.push(f);
    delete m.dosyalar[c];
  }
}
for (const [k, kayit] of Object.entries((m.karakterler ?? {}) as Record<string, { dosyalar: Record<string, string> }>)) {
  for (const [c, f] of Object.entries(kayit.dosyalar)) {
    if ((kc[k] ?? []).includes(c)) kullanilan.add(f);
    else {
      olu.push(f);
      delete kayit.dosyalar[c];
    }
  }
}
// aynı dosyayı paylaşan canlı bir kayıt varsa silinmez
const oluKok = [...new Set(olu)].filter((f) => !kullanilan.has(f));
const yetim = fs.readdirSync(kl).filter((f) => f.endsWith('.mp3') && !kullanilan.has(f) && !oluKok.includes(f));

// kitap sesleri
const kmYol = path.join(kl, 'kitap/manifest.json');
const km = JSON.parse(fs.readFileSync(kmYol, 'utf8'));
// canlı satırlar: kitapların kendi listesinden (sayfa + canlanan anların sözleri; etiketli anahtarlar satirAnahtari ile)
const canli = new Set<string>();
for (const k of KITAPLAR) {
  if (!k.icerik) continue;
  for (const sa of [k.icerik.kapak.satirlar, ...k.icerik.sayfalar.map((p) => p.satirlar)].flat()) if (sa.kim !== 'ses') canli.add(satirAnahtari(sa.kim, sa.metin));
  for (const sc of Object.values(k.canli ?? {})) for (const an of sc.anlar) for (const ad of [...an.adimlar, ...(an.sirali ?? []).flat()]) if (ad.soz) canli.add(satirAnahtari(ad.soz.kim, ad.soz.metin));
}
const kitapKullanilan = new Set<string>();
const kitapOlu: string[] = [];
for (const [anahtar, sa] of Object.entries(km.satirlar as Record<string, { d: string }>)) {
  if (!KITAP || canli.has(anahtar)) kitapKullanilan.add(sa.d);
  else {
    kitapOlu.push(sa.d);
    delete km.satirlar[anahtar];
  }
}
const kitapOluDosya = [...new Set(kitapOlu)].filter((f) => !kitapKullanilan.has(f)).map((f) => 'kitap/' + f);

const hepsi = [...oluKok, ...yetim, ...kitapOluDosya];
console.log(`Ölü anlatıcı/karakter kaydı: ${oluKok.length} (${MB(oluKok.reduce((t, f) => t + boy(f), 0))})`);
console.log(`Hiçbir manifestte olmayan mp3: ${yetim.length} (${MB(yetim.reduce((t, f) => t + boy(f), 0))})`);
console.log(`Ölü kitap satırı: ${kitapOluDosya.length} (${MB(kitapOluDosya.reduce((t, f) => t + boy(f), 0))})`);
console.log(`Toplam: ${hepsi.length} dosya, ${MB(hepsi.reduce((t, f) => t + boy(f), 0))}`);
if (SIL) {
  for (const f of hepsi) fs.rmSync(path.join(kl, f), { force: true });
  fs.writeFileSync(mYol, JSON.stringify(m));
  fs.writeFileSync(kmYol, JSON.stringify(km));
  console.log('Silindi; manifestler güncellendi.');
}
