/**
 * Pati Dükkânı v2: hayvanların zevki (saf; tests/unit/pati-tercih.test.ts). Paket 2'nin Bakım Odası bunu kullanır.
 *
 * Doğru cevap bir kural değil, o hayvanı tanımak (PATI-V2 §1a): aynı fırçayı kedi sever, kuş kaçar.
 *  tepki(hayvan, ihtiyac, esya, yas, gecmis):
 *   'sever'          ★ (5-6'da gizli sevgi de)
 *   'olur'           ✓
 *   'sevmez'         ✗, komik tepki (cezasız: kalp düşmez, jeton gitmez, eşya dolabına döner)
 *   'baska-ihtiyac'  bu eşya başka bir ihtiyacın (ilgilenir ama ihtiyaç kapanmaz)
 *   'ders'           yalnız 5-6: önce hoş görünen ama küçük bir sonucu olan seçim (süt → karın ağrısı)
 *  cekmece(hayvan, cekmece, yas): o hayvana açılan çekmecedeki eşyalar. 3-4: tam 1 ★, 1 ✓ (yoksa ikinci ★), 1 ✗.
 *   5-6: 4-6 eşya, başka hayvanların eşyaları da karışık.
 */
import { CEKMECELER, ESYA_IDLERI, esyaBilgi, hayvanBilgi, ihtiyacCekmecesi, IHTIYACLAR, type CekmeceAdi, type IhtiyacAdi, type Sevgi, type Yas } from './katalog';
import type { DefterTepki, PatiKayit } from './kayit';
import { acilabilir } from './ihtiyac';

/** Hayvan Defteri'nin bir satırı: ihtiyaç, denenen eşyalar (tepkisiyle), gizli sevgi bulundu mu (5-6) */
export interface DefterSatiri {
  ihtiyac: IhtiyacAdi;
  cekmece: CekmeceAdi;
  denenen: { esya: string; tepki: DefterTepki }[];
  /** bu ihtiyaçta en az bir ★ bulundu */
  sever: boolean;
  /** 5-6: gizli sevgi bu satırda ve henüz bulunmadı (defterde boş kalp) */
  gizliBekliyor: boolean;
}

/** Defter sayfası: yaşa göre ihtiyaç satırları (3-4: aç, susuz, sıkılmış, uykulu; 5-6: hepsi) */
export function defterSayfasi(k: PatiKayit, id: string, yas: Yas): DefterSatiri[] {
  const b = hayvanBilgi(id);
  const sayfa = k.defter[id] ?? {};
  const ihtiyaclar = acilabilir(b.ihtiyaclar, { yas, temizlik: k.esyalar.includes('temizlik'), hayvanSayisi: 99 });
  return ihtiyaclar.map((ih) => {
    const c = ihtiyacCekmecesi(ih);
    const denenen = Object.entries(sayfa)
      .filter(([e]) => esyaBilgi(e).cekmece === c)
      .map(([esya, tepki]) => ({ esya, tepki }))
      // önce sevdikleri, sonra olurlar, sonra sevmedikleri
      .sort((x, y) => ['sever', 'olur', 'sevmez'].indexOf(x.tepki) - ['sever', 'olur', 'sevmez'].indexOf(y.tepki));
    const gizliBurada = yas === 'buyuk' && !!b.gizli && esyaBilgi(b.gizli).cekmece === c;
    return { ihtiyac: ih, cekmece: c, denenen, sever: denenen.some((d) => d.tepki === 'sever'), gizliBekliyor: gizliBurada && sayfa[b.gizli!] !== 'sever' };
  });
}

/** Uzman: sayfadaki her ihtiyacın en az bir ★'ı bulundu */
export const uzmanMi = (k: PatiKayit, id: string, yas: Yas) => defterSayfasi(k, id, yas).every((s) => s.sever);

export type Tepki = 'sever' | 'olur' | 'sevmez' | 'baska-ihtiyac' | 'ders';

const BOS: Sevgi = { s: [], o: [], x: [] };
const sevgisi = (id: string, ih: IhtiyacAdi) => hayvanBilgi(id).sevgi[ih] ?? BOS;
const icinde = (s: Sevgi, e: string) => s.s.includes(e) || s.o.includes(e) || s.x.includes(e);

/** Bir eşyayı bir ihtiyaç için verince hayvanın tepkisi. gecmis: bu eşya bugün bu hayvana kaç kez verildi (ders) */
export function tepki(id: string, ih: IhtiyacAdi, esya: string, yas: Yas, gecmis: Readonly<Record<string, number>> = {}): Tepki {
  const b = hayvanBilgi(id);
  if (yas === 'buyuk' && b.ders && b.ders.esya === esya && (gecmis[esya] ?? 0) + 1 >= b.ders.kez) return 'ders';
  if (!b.ihtiyaclar.includes(ih)) return 'baska-ihtiyac';
  const s = sevgisi(id, ih);
  if (s.s.includes(esya)) return 'sever';
  if (s.o.includes(esya)) return 'olur';
  if (s.x.includes(esya)) return 'sevmez';
  const ayniCekmece = esyaBilgi(esya).cekmece === ihtiyacCekmecesi(ih);
  if (b.gizli === esya && ayniCekmece) return yas === 'buyuk' ? 'sever' : 'olur';
  if (IHTIYACLAR.some((n) => n !== ih && icinde(sevgisi(id, n), esya))) return 'baska-ihtiyac';
  // listede olmayan, aynı çekmeceden bir eşya (köpeğe saman): koklar, burnunu çevirir
  return ayniCekmece ? 'sevmez' : 'baska-ihtiyac';
}

/** Başka çekmecenin eşyası olup bu çekmecede de duranlar (§7b: ecza çekmecesinde battaniye ortak) */
const ORTAK: Partial<Record<CekmeceAdi, string[]>> = { ecza: ['battaniye', 'isi-lambasi'] };
/** Çekmecenin havuzu: önce baştan olanlar, sonra ortaklar, sonra mağazanınkiler */
const havuz = (c: CekmeceAdi) => [...ESYA_IDLERI.filter((e) => esyaBilgi(e).cekmece === c && esyaBilgi(e).bastan), ...(ORTAK[c] ?? []), ...ESYA_IDLERI.filter((e) => esyaBilgi(e).cekmece === c && !esyaBilgi(e).bastan)];

/** Bu çekmece bu yaşta var mı (temizlik ve ecza yalnız 5-6; 3-4'te temizlik mağazadan alınınca, paket 3) */
export const cekmeceAcik = (c: CekmeceAdi, yas: Yas) => CEKMECELER[c].yas.includes(yas);

/** O hayvana açılan çekmecedeki eşyalar (sıra karışık değil; arayüz karıştırır) */
export function cekmece(id: string, c: CekmeceAdi, yas: Yas): string[] {
  const ih = CEKMECELER[c].ihtiyac;
  const s = sevgisi(id, ih);
  const dolgu = (haric: string[]) => havuz(c).find((e) => !haric.includes(e) && tepki(id, ih, e, 'kucuk') === 'sevmez') ?? havuz(c).find((e) => !haric.includes(e))!;
  if (yas === 'kucuk') {
    const sev = s.s[0] ?? havuz(c)[0];
    const x = s.x[0] ?? dolgu([sev, ...s.o, ...s.s]);
    // ✓ yoksa ikinci ★, o da yoksa aynı çekmeceden bir eşya (o hayvan için ikinci ✗ olur)
    const olur = s.o[0] ?? s.s[1] ?? dolgu([sev, x]);
    return [sev, olur, x];
  }
  const b = hayvanBilgi(id);
  const l = [...new Set([...s.s, ...s.o, ...s.x, ...(b.gizli && esyaBilgi(b.gizli).cekmece === c ? [b.gizli] : [])])];
  for (const e of havuz(c)) {
    if (l.length >= 6) break;
    if (!l.includes(e) && (l.length < 4 || esyaBilgi(e).bastan || ORTAK[c]?.includes(e))) l.push(e);
  }
  return l.slice(0, 6);
}

/** Deftere yazar (yalnız sever / olur / sevmez). Dönen: bu ★ ilk kez mi bulundu (altın kalp etiketi + jeton) */
export function defterYaz(k: PatiKayit, id: string, esya: string, t: Tepki): boolean {
  const d: DefterTepki | null = t === 'sever' ? 'sever' : t === 'olur' ? 'olur' : t === 'sevmez' ? 'sevmez' : null;
  if (!d) return false;
  const sayfa = (k.defter[id] ??= {});
  const ilk = d === 'sever' && sayfa[esya] !== 'sever';
  sayfa[esya] = d;
  return ilk;
}
