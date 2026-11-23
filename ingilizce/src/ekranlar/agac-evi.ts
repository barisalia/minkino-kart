/**
 * Polly'nin Yaşayan Ağaç Evi (İngilizce yol haritası #4, 21 Kasım 2026): ana ekrandan girilir. Çocuk bir adanın kelime
 * derslerini (Seviye 1) bitirince eve o adanın eşyası gelir. Eşyaya dokununca öbür durumuna geçer, Polly o durumun
 * kısa İngilizce cümlesini söyler ("Turn on the lamp!"); ikinci dokunuşta eski hale döner ("Turn off the lamp.").
 * Puan, mağaza, satın alma yok. Eve yeni gelen eşya ilk dokunuşa kadar parlar ("Look! Something new!").
 * Eşyaların durumu ve görülenler bu cihazda saklanır (minkino-ingilizce-agac-v1); ilerleme kaydına dokunulmaz.
 * Veri ve fondaki yerler: agac-evi-veri.ts · Çizim: İngilizce Paket 24.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { ESYALAR, FON, POLLY_YERI, esyaResmi, esyaSesi, type Esya } from '../agac-evi-veri';
import { TUM_DERSLER, UNITELER } from '../icerik';
import { dersBittiMi, oku, type Kayit } from '../ilerleme';
import { cizim, dugme, kisi, kutla, simgeDugme } from '../kit';
import { konus, sus, tik } from '../ses';
import { dersHazir, resim, sesAdresi, TASLAK } from '../varlik';
import type { Gezinme } from './ders';
import './agac-evi.css';

const ANAHTAR = 'minkino-ingilizce-agac-v1';
interface EvKaydi { durum: Record<string, 0 | 1>; gorulen: string[]; tanisti: boolean }
function evOku(): EvKaydi {
  try {
    const k = JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}') as Partial<EvKaydi>;
    return { durum: k.durum ?? {}, gorulen: Array.isArray(k.gorulen) ? k.gorulen : [], tanisti: !!k.tanisti };
  } catch { return { durum: {}, gorulen: [], tanisti: false }; }
}
function evYaz(k: EvKaydi) { try { localStorage.setItem(ANAHTAR, JSON.stringify(k)); } catch { /* kayıt yoksa ev yine açılır */ } }

const taslakMi = () => TASLAK || TEST_MODU;
const sesVar = (id: string) => !!sesAdresi(id);

/** Ana ekrandaki düğme görünsün mü: fon, Polly'nin iki pozu ve karşılama sesleri hazır (taslak ve test kipinde her zaman) */
export function agacEviHazir(): boolean {
  if (taslakMi()) return true;
  return !!resim('agac-evi/fon') && !!resim('agac-evi/polly-0') && !!resim('agac-evi/polly-1')
    && ['tr/c-agac-giris', 'en/g-tree-house', 'en/g-something-new'].every(sesVar);
}

/** Eşya eve gelmiş mi: adasının kelime dersleri (Seviye 1) bitmiş olmalı */
export function esyaKazanildi(k: Kayit, e: Esya): boolean {
  const u = UNITELER.find((x) => x.id === e.ada);
  if (!u) return false;
  const dersler = TUM_DERSLER.filter((d) => d.unite === u && d.seviye === 1 && dersHazir(u, d.no));
  return dersler.length > 0 && dersler.every((d) => dersBittiMi(k, d.id));
}
const esyaHazir = (e: Esya) => taslakMi() || ([0, 1] as const).every((d) => !!resim(esyaResmi(e, d)) && sesVar(esyaSesi(e, d)));

const yuzde = (v: number, toplam: number) => `${(v / toplam) * 100}%`;
const yerle = (el: HTMLElement, [x, y, g, yuk]: readonly [number, number, number, number]) => {
  el.style.left = yuzde(x, FON.g); el.style.top = yuzde(y, FON.y); el.style.width = yuzde(g, FON.g); el.style.height = yuzde(yuk, FON.y);
};

export function agacEviEkrani(kok: HTMLElement, git: Gezinme): () => void {
  let kapandi = false;
  const ev = evOku();
  const kayit = oku();
  const gelenler = ESYALAR.filter((e) => esyaKazanildi(kayit, e) && esyaHazir(e));

  const sayac = h('div.ing-sayac.ing-ae-sayac', { 'aria-label': `${gelenler.length} / ${ESYALAR.length} eşya` }, h('strong', {}, `${gelenler.length} / ${ESYALAR.length}`));
  const ust = h('header.ing-ust', {},
    simgeDugme('geri', 'Ana ekrana dön', () => git.ana(), 'ing-geri'),
    h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Polly’nin Ağaç Evi')),
    h('div.ing-ust-sag', {}, sayac));

  // ---- sahne: fon, Polly, eşyalar (fon pikselinin yüzdesiyle)
  const sahne = h('div.ing-ae-sahne');
  const fon = cizim('agac-evi/fon', 'ing-ae-fon');
  if (fon) sahne.append(fon); else sahne.classList.add('ing-ae-fonsuz');

  const polly = dugme('ing-ae-polly', 'Polly', () => { tik.dokun(); void soyle('en/g-tree-house'); });
  yerle(polly, POLLY_YERI);
  const poz = [cizim('agac-evi/polly-0', 'ing-ae-polly-poz'), cizim('agac-evi/polly-1', 'ing-ae-polly-poz')];
  if (poz[0] && poz[1]) { poz[1].dataset.poz = '1'; polly.append(poz[0], poz[1]); } else polly.append(kisi('polly', 'ing-ae-polly-yedek'));
  sahne.append(polly);
  const konusuyor = (evet: boolean) => { polly.dataset.konusuyor = String(evet); };

  const yazi = h('p.ing-ae-yazi', { lang: 'en-US', 'aria-live': 'polite' });
  let soyleyis = 0;
  async function soyle(...idler: string[]) {
    const no = ++soyleyis;
    // Polly yalnız İngilizce sözlerde konuşur (Ceren'in girişinde susar)
    konusuyor(idler.some((id) => id.startsWith('en/')));
    await konus(...idler);
    if (no === soyleyis && !kapandi) konusuyor(false);
  }

  const dugmeler = gelenler.map((e) => {
    const d = dugme('ing-ae-esya', `${e.tr}`, () => void dokun(e, d));
    d.dataset.esya = e.id;
    d.dataset.durum = String(ev.durum[e.id] ?? 0);
    yerle(d, e.yer);
    for (const durum of [0, 1] as const) {
      const img = cizim(esyaResmi(e, durum), 'ing-ae-esya-resim') ?? h('span.ing-ae-esya-resim.ing-ae-yer', {}, `${e.tr} · ${durum}`);
      img.dataset.hal = String(durum);
      d.append(img);
    }
    if (!ev.gorulen.includes(e.id)) d.classList.add('ing-ae-yeni');
    sahne.append(d);
    return d;
  });

  async function dokun(e: Esya, d: HTMLButtonElement) {
    tik.dokun();
    const yeni: 0 | 1 = (ev.durum[e.id] ?? 0) === 1 ? 0 : 1;
    ev.durum[e.id] = yeni;
    if (!ev.gorulen.includes(e.id)) ev.gorulen.push(e.id);
    evYaz(ev);
    d.dataset.durum = String(yeni);
    d.classList.remove('ing-ae-yeni');
    d.classList.remove('ing-ae-oynadi'); void d.offsetWidth; d.classList.add('ing-ae-oynadi');
    if (yeni === 1) kutla(d);
    yazi.textContent = e.soz[yeni === 1 ? 0 : 1];
    await soyle(esyaSesi(e, yeni));
  }

  const bos = gelenler.length === 0
    ? h('p.ing-ae-bos', {}, 'İlk adanın kelime derslerini bitirince eve ilk eşya gelecek!')
    : null;
  kok.append(ust, h('section.ing-ae', {}, sahne, yazi, bos));

  // karşılama: Ceren evi bir kez tanıtır; Polly selam verir; yeni eşya varsa gösterir
  void (async () => {
    if (!ev.tanisti) { ev.tanisti = true; evYaz(ev); await soyle('tr/c-agac-giris'); if (kapandi) return; }
    const yeniVar = dugmeler.some((d) => d.classList.contains('ing-ae-yeni'));
    await soyle(...(yeniVar ? ['en/g-tree-house', 'en/g-something-new'] : ['en/g-tree-house']));
  })();

  return () => { kapandi = true; sus(); };
}
