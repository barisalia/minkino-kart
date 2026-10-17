/**
 * Pati Dükkânı v2: jetonla ödeme (vitrindeki yavru alımıyla aynı his; mağaza, çekmecedeki yeni eşya, köşe).
 * Jetonlar kumbaradan fiyat etiketinin yuvalarına yay çizerek uçar, Nehir abla sayar ("Bir! İki!" / 5-6: "Beş! Altı!").
 * Yetmezse eksik yuvalar boş daire kalır ve bir kez nabız atar, jetonlar kumbaraya döner, "Biraz daha jeton lazım."
 * Hiçbir şey kaybolmaz, hiçbir şey kilitlenmez (kilit yok, gri yok).
 */
import { sure } from '../../src/ui/dom';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { jetonUcur, type Etiket, type Kumbara } from './arayuz';
import { odemeDizisi } from './ekonomi';
import { NEHIR2, type Yas } from './katalog';
import type { PatiKayit } from './kayit';
import type { Nehir } from './nehir';
import { ses } from './sesler';

const bekle = (ms: number) => new Promise<void>((r) => setTimeout(r, sure(ms)));

export interface OdemeOrtam {
  efekt: Efekt;
  kumbara: Kumbara;
  kayit: PatiKayit;
  nehir: Nehir;
  yas: () => Yas;
  kaydet: () => void;
}

/**
 * Etikete ödeme. al(): ödeme tamamlanınca alımı kayda yazar (jeton düşer; false: alınamadı, jetonlar geri döner).
 * Dönen: alındı mı.
 */
export async function jetonlaOde(o: OdemeOrtam, et: Etiket, fiyat: number, al: () => boolean, kapandi: () => boolean = () => false): Promise<boolean> {
  const odeme = odemeDizisi(fiyat, o.kayit.jeton, o.yas());
  et.odemeBasla();
  let gosterilen = o.kumbara.jeton;
  let odenen = 0;
  for (let i = 0; i < odeme.ucan.length && !kapandi(); i++) {
    const v = odeme.ucan[i];
    gosterilen -= v;
    o.kumbara.ayarla(gosterilen);
    o.kumbara.yut();
    await jetonUcur(o.efekt, o.kumbara.agiz(), et.yuvaNoktasi(odenen + v), v, 300);
    odenen += v;
    et.goster(odenen);
    ses.jeton(i);
    void o.nehir.soyle(odeme.soz[i]);
    await bekle(odeme.ucan.length > 4 ? 110 : 190);
  }
  if (odeme.eksik === 0 && !kapandi() && al()) {
    o.kaydet();
    o.kumbara.ayarla(o.kayit.jeton);
    const r = et.el.getBoundingClientRect();
    const k = o.efekt.kutu();
    o.efekt.parilti(r.left - k.left + r.width / 2, r.top - k.top + r.height / 2, 8, 1, '#FFE45C');
    et.el.classList.add('pt-odendi');
    ses.ksilofon();
    return true;
  }
  // yetmedi: eksikler boş daire, jetonlar kumbaraya döner
  et.eksikNabiz();
  ses.hmm();
  const soz = o.nehir.soyle(NEHIR2.jeton_az).catch(() => undefined);
  await bekle(700);
  let kalan = odenen;
  for (const v of [...odeme.ucan].reverse()) {
    if (kapandi()) break;
    const kaynak = et.yuvaNoktasi(kalan);
    kalan -= v;
    et.goster(kalan, true);
    await jetonUcur(o.efekt, kaynak, o.kumbara.agiz(), v, 240);
    gosterilen += v;
    o.kumbara.ayarla(gosterilen);
    o.kumbara.yut();
  }
  o.kumbara.ayarla(o.kayit.jeton);
  et.goster(0);
  await soz;
  return false;
}
