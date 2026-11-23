// Matematik · Ders yolu: "Minkino Bahçe Şenliği Hazırlığı" (yol haritası adım 9; yönetici kararı 20 Kasım).
// Bahçede altı parça (meyve tezgâhı, sahne, oyun parkuru, fenerler ve bayraklar, şenlik otobüsü, bilet gişesi) Ceren'in altı
// dersidir; patika sırayla geçer. Parlayan parçaya dokunmak dersi açar; ders bitince yola dönülür, parça canlanır ve dersin
// hatırası şenlik panosuna uçar. Biten parçaya dokunmak dersi yeniden oynatır. Kilit değişmez: ders, açtığı oyuncağın
// kilidinin arkasındadır (main.ts erisimVarMi). Astra'nın M8 çizimleri ve Ceren'in sözleri tamam değilse tezgâhta giriş
// görünmez; test kipinde ?test=1&dersyolu=1 ile açılır.
import { oyunSesi } from '../../alfabe/src/oyun-sesi';
import { DersAkisi, DersSesi, cerenBagla, cerenFiguru, hareketler, resimHTML } from './ders-iskelet';
import {
  GEREKLI_CIZIMLER, GEREKLI_SESLER, HATIRA, PARCA_ADI, YOL_KAYIT_ANAHTARI, hazirSesi, hepsiBitti, kutlanacak, yasDersleri, yolDurumu, yolKaydiCoz,
  type DersId, type ParcaDurumu, type YolKaydi,
} from './ders-yolu-mantik';
import './ceren-ders.css';
import './ders-yolu.css';

const cizimler = import.meta.glob<string>('../../assets/matematik/ders-yolu/*.webp', { eager: true, query: '?url', import: 'default' });
const cizim = (ad: string): string | undefined => cizimler['../../assets/matematik/ders-yolu/' + ad + '.webp'];
const hatiralar = import.meta.glob<string>(['../../assets/matematik/hatira-sayi.webp', '../../assets/matematik/ders/*/hatira-*.webp'], { eager: true, query: '?url', import: 'default' });
const hatiraResmi = (d: DersId) => hatiralar['../../assets/' + HATIRA[d] + '.webp'];
const cerenCizimleri = import.meta.glob<string>('../../assets/matematik/ceren/ceren-*.webp', { eager: true, query: '?url', import: 'default' });
const POZLAR = ['goster', 'alkis', 'sen-dene'] as const;
const pozResmi = (p: string) => cerenCizimleri['../../assets/matematik/ceren/ceren-' + p + '.webp'];
const agizKareleri = Object.entries(import.meta.glob<string>('../../assets/alfabe/ceren-konus/[0-3].webp', { eager: true, query: '?url', import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b)).map(([, u]) => u);
const sesAdresleri = import.meta.glob<string>('../../assets/matematik/ders-yolu/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
const sesAdresi = (id: string) => sesAdresleri['../../assets/matematik/ders-yolu/ses/' + id + '.mp3'];

const adres = new URLSearchParams(location.search);
const TEST = adres.has('test');
const HIZLI = TEST && adres.has('hizli');
declare global { interface Window { __dersYoluSesleri?: string[] } }
if (TEST) window.__dersYoluSesleri = [];
export const dersYoluHazir = GEREKLI_CIZIMLER.every((ad) => !!cizim(ad)) && GEREKLI_SESLER.every((id) => !!sesAdresi(id));
/** Uygulamada çizimler ve sesler tamamsa tezgâhta şenlik tabelası görünür; test kipinde ?test=1&dersyolu=1 ile. */
export const dersYoluGorunur = TEST ? adres.has('dersyolu') : dersYoluHazir;
/** Tezgâhtaki giriş tabelası (çizim yoksa test kipinde adı yazılı kutu). */
export const senlikTabelasi = () => resimHTML(cizim('senlik-tabelasi'), 'senlik-tabela-resim', 'senlik-tabelasi', '', 'Şenlik');

const ses = new DersSesi(sesAdresi, { hizli: HIZLI, okundu: (id) => window.__dersYoluSesleri?.push(id) });

export type DersYoluBaglami = {
  kok: HTMLElement;
  sesiAc: () => void;
  tekrarDinle: (fn: () => void) => void;
  yas: number | null;
  /** Her dersin durumu (main.ts'teki ders modüllerinden). */
  dersler: Record<DersId, { bitti: () => boolean; hazir: () => boolean }>;
  /** Dersi açar (kilitliyse kilit ekranını gösterir ve false döner). */
  dersAc: (d: DersId) => boolean;
};

export function dersYolu(b: DersYoluBaglami): () => void {
  const sakin = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let kayit: YolKaydi;
  try { kayit = yolKaydiCoz(localStorage.getItem(YOL_KAYIT_ANAHTARI)); } catch { kayit = yolKaydiCoz(null); }
  const sakla = () => { try { localStorage.setItem(YOL_KAYIT_ANAHTARI, JSON.stringify(kayit)); } catch { /* özel pencere */ } };
  const dersler = yasDersleri(b.yas);
  const bitti = (d: DersId) => b.dersler[d].bitti();
  const hazir = (d: DersId) => b.dersler[d].hazir();
  let simdikiSoz = 'devam';

  // ----- Sahne: bahçe, patikada altı parça, sol üstte pano, sol altta Ceren -----
  const dunya = document.createElement('div');
  dunya.className = 'cd-dunya dy-dunya';
  dunya.innerHTML =
    resimHTML(cizim('senlik-bahcesi'), 'cd-sinif', 'senlik-bahcesi', '', 'şenlik bahçesi') +
    '<div class="dy-pano">' + resimHTML(cizim('senlik-panosu'), 'dy-pano-resim', 'senlik-panosu', '', 'pano') + '<div class="dy-pano-ic"></div></div>' +
    '<div class="dy-parcalar" role="group" aria-label="Şenlik hazırlığı"></div>' +
    cerenFiguru({ pozlar: POZLAR, pozResmi, agizKareleri, x: 0.005, ust: 0.5, h: 0.5 });
  const ceren = dunya.querySelector<HTMLButtonElement>('.cd-ceren')!;
  const panoIc = dunya.querySelector<HTMLElement>('.dy-pano-ic')!;
  const parcalarEl = dunya.querySelector<HTMLElement>('.dy-parcalar')!;
  b.kok.append(dunya);

  const akis = new DersAkisi(ses, b.sesiAc, HIZLI);
  const { cerenPoz, birak: cereniBirak } = cerenBagla(ceren, ses, { pozVar: (p) => !!pozResmi(p), sakin, hizli: HIZLI, kapandi: () => akis.kapandi });
  const { zipla, salla, ucur } = hareketler(sakin, HIZLI);

  // ----- Parçalar ve pano -----
  const parcalar = new Map<DersId, HTMLButtonElement>();
  dersler.forEach((d, i) => {
    const p = document.createElement('button');
    p.type = 'button';
    p.className = 'dy-parca';
    p.dataset.ders = d;
    p.dataset.sira = String(i);
    p.innerHTML =
      resimHTML(cizim('parca-' + d + '-bos'), 'dy-bos', 'parca-' + d + '-bos', '', PARCA_ADI[d]) +
      resimHTML(cizim('parca-' + d + '-hazir'), 'dy-hazir', 'parca-' + d + '-hazir', '', PARCA_ADI[d] + ' ✓');
    parcalarEl.append(p);
    parcalar.set(d, p);
  });
  function panoyaAs(d: DersId, kaynak?: Element) {
    if (panoIc.querySelector('[data-ders="' + d + '"]')) return;
    const h = document.createElement('span');
    h.className = 'dy-hatira';
    h.dataset.ders = d;
    h.dataset.yer = String(dersler.indexOf(d));
    h.innerHTML = resimHTML(hatiraResmi(d), 'dy-hatira-resim', HATIRA[d], '', '★');
    panoIc.append(h);
    return ucur(h.firstElementChild as HTMLElement, kaynak?.getBoundingClientRect(), 700);
  }
  let durum = yolDurumu(dersler, bitti, hazir);
  function ciz(gizlenen: readonly DersId[] = []) {
    durum = yolDurumu(dersler, bitti, hazir);
    for (const [d, p] of parcalar) {
      // Kutlanacak parça önce "hazırlanmamış" görünür; canlanış onu açar.
      const g: ParcaDurumu = gizlenen.includes(d) ? 'bekliyor' : durum[d];
      p.dataset.durum = g;
      p.setAttribute('aria-label', PARCA_ADI[d] + (g === 'bitti' ? ', hazır' : g === 'sirada' ? ', sıradaki iş' : g === 'hazirlaniyor' ? ', yakında' : ''));
      if (g === 'bitti' && !gizlenen.includes(d)) panoyaAs(d);
    }
    dunya.dataset.sirada = dersler.find((d) => durum[d] === 'sirada') ?? '';
  }

  // ----- Dokunuş -----
  for (const [d, p] of parcalar) {
    akis.dokununca(p, () => {
      const g = p.dataset.durum as ParcaDurumu;
      if (g === 'sirada' || g === 'bitti') {
        zipla(p, 0.4);
        oyunSesi('kutu');
        if (!b.dersAc(d)) salla(p);
        return;
      }
      salla(p);
      ses.sus();
      cerenPoz('goster');
      simdikiSoz = g === 'hazirlaniyor' ? 'hazirlaniyor' : 'sirada_degil';
      void ses.cal(simdikiSoz);
      const s = dersler.find((x) => durum[x] === 'sirada');
      if (s) zipla(parcalar.get(s), 0.5);
    });
  }
  akis.dokununca(ceren, () => { zipla(ceren, 0.25); if (ses.calan === simdikiSoz && ses.bastan()) return; void ses.cal(simdikiSoz); });
  b.tekrarDinle(() => { void ses.cal(simdikiSoz); });

  // ----- Açılış: yeni biten dersler canlanır, hatıraları panoya uçar; sonra Ceren sıradaki işi gösterir -----
  async function ac() {
    const a = akis.no;
    const yeni = kutlanacak(dersler, bitti, kayit);
    ciz(yeni);
    dunya.dataset.adim = yeni.length ? 'kutlama' : 'giris';
    ses.onYukle(['giris', 'devam', ...yeni.map(hazirSesi), 'pano', 'hepsi']);
    if (!(await akis.bekle(500, a))) return;
    for (const [i, d] of yeni.entries()) {
      const p = parcalar.get(d)!;
      p.dataset.durum = 'bitti';
      p.classList.add('canlaniyor');
      oyunSesi('parilti');
      zipla(p, 0.8);
      cerenPoz('alkis');
      simdikiSoz = hazirSesi(d);
      if (!(await akis.konus(hazirSesi(d), a))) return;
      void panoyaAs(d, p);
      oyunSesi('birles');
      if (i === 0) { simdikiSoz = 'pano'; if (!(await akis.konus('pano', a))) return; }
      else if (!(await akis.bekle(500, a))) return;
      p.classList.remove('canlaniyor');
      kayit.kutlanan.push(d);
      sakla();
    }
    ciz();
    dunya.dataset.adim = 'yol';
    if (yeni.length && hepsiBitti(dersler, bitti)) {
      cerenPoz('alkis');
      simdikiSoz = 'hepsi';
      void akis.konus('hepsi', a);
      return;
    }
    cerenPoz('goster');
    simdikiSoz = kayit.tanitildi ? 'devam' : 'giris';
    kayit.tanitildi = true;
    sakla();
    if (!(await akis.konus(simdikiSoz, a))) return;
    cerenPoz('sen-dene');
  }
  void ac();

  return () => {
    akis.kapandi = true;
    akis.iptal();
    cereniBirak();
    dunya.remove();
  };
}
