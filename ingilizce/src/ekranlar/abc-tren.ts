/**
 * Alphabet Train (Polly's ABC içinde, 21 Kasım 2026): 26 harf sırayla vagonlarda. Çocuk vagona dokundukça Polly harfin
 * adını söyler ve vagon zıplar; hepsine dokununca tren yola çıkar. 5+ yaşta ardından üç "eksik vagon" turu: beş ardışık
 * harften biri boş, üç seçenekten doğrusu boş vagona oturur.
 * Çizimler: Paket 28 (lokomotif, vagon, ray) ve Paket 27'nin resimli harfleri. Çizimler gelmeden gerçek oyunda görünmez
 * (`trenHazir`); taslak ve test kipinde yer tutucuyla oynanır.
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { bekle, cizim, dugme, hareket, kutla, salla, simgeDugme } from '../kit';
import { konus, sesHazirla, sus, tik } from '../ses';
import { resim, sesAdresi, TASLAK } from '../varlik';
import type { Yas } from '../plan';
import { ABC, trenEksikTurlari, trenSesleri } from './abc-veri';
import './abc-tren.css';

export function trenHazir(): boolean {
  if (TASLAK || TEST_MODU) return true;
  return ['tren-lokomotif', 'tren-vagon', 'tren-ray'].every((ad) => !!resim(`abc/${ad}`)) && trenSesleri().every((id) => !!sesAdresi(id));
}

function vagon(harf: string, bos = false): HTMLElement {
  const govde = cizim('abc/tren-vagon', 'ing-tren-vagon-resim');
  const tabela = h('span.ing-tren-tabela', {}, bos ? h('span.ing-tren-bos', {}, '?') : (cizim(`abc/harf-${harf}`, 'ing-tren-harf') ?? h('b.ing-tren-harf-yazi', {}, harf.toUpperCase())));
  return h('span.ing-tren-vagon', { 'data-yer-tutucu': govde ? null : 'true' }, ...(govde ? [govde] : []), tabela);
}
function lokomotif(): HTMLElement {
  return h('span.ing-tren-lokomotif', { 'aria-hidden': 'true' }, cizim('abc/tren-lokomotif') ?? h('span.ing-tren-loko-yer', {}, 'Polly'));
}

export function alfabeTreni(kok: HTMLElement, git: { ana(): void; yas: Yas }): () => void {
  let acik = true;
  sesHazirla(trenSesleri());
  const soyle = async (...idler: string[]) => { if (!acik) return false; await konus(...idler); return acik; };
  const iz = (x: string) => { if (TEST_MODU) ((window as unknown as { __tren?: string[] }).__tren ??= []).push(x); };
  const sayac = h('div.ing-ust-sag.ing-tren-sayac');
  const ust = h('header.ing-ust', {}, simgeDugme('geri', 'Ana ekrana dön', () => { tik.dokun(); git.ana(); }, 'ing-geri'), h('div.ing-ust-orta', {}, h('h1.ing-baslik', {}, 'Alphabet Train')), sayac);
  const ray = resim('abc/tren-ray');
  const yol = h('div.ing-tren-yol');
  if (ray) yol.style.backgroundImage = `url("${ray}")`;
  // soldan sağa A…Z, lokomotif en önde (sağda); tren sağa doğru yola çıkar
  const tren = h('div.ing-tren');
  const alan = h('section.ing-tren-alan', {}, h('div.ing-tren-kaydir', {}, tren, yol));
  kok.append(ust, alan);

  const dokunulan = new Set<string>();
  const sayacYaz = () => { sayac.textContent = `${dokunulan.size} / ${ABC.length}`; };
  sayacYaz();
  for (const x of ABC) {
    const v = vagon(x.id);
    const d = dugme('ing-tren-dugme', `${x.id.toUpperCase()} vagonu`, () => {
      tik.dokun();
      v.classList.remove('ing-tren-zipla'); void v.offsetWidth; v.classList.add('ing-tren-zipla');
      void soyle(`en/abc-ad-${x.id}`);
      if (!dokunulan.has(x.id)) { dokunulan.add(x.id); d.classList.add('ing-tren-dokunuldu'); sayacYaz(); iz('vagon ' + x.id); if (dokunulan.size === ABC.length) void yolaCik(); }
    }, v);
    d.dataset.harf = x.id;
    tren.append(d);
  }
  tren.append(lokomotif());

  async function yolaCik() {
    await bekle(700);
    if (!(await soyle('en/g-tren-go'))) return;
    tren.classList.add('ing-tren-gidiyor');
    void hareket('polly', 'sevin');
    iz('yola cikti');
    await bekle(TEST_MODU ? 50 : 2600);
    if (!acik) return;
    if (git.yas === '5+') await eksikTurlari(); else bitir();
  }

  async function eksikTurlari() {
    const turlar = trenEksikTurlari(3);
    alan.replaceChildren();
    const kisa = h('div.ing-tren.ing-tren-kisa');
    const secimler = h('div.ing-tren-secimler');
    alan.append(h('div.ing-tren-kaydir', {}, kisa, h('div.ing-tren-yol')), secimler);
    if (ray) (alan.querySelector('.ing-tren-yol') as HTMLElement).style.backgroundImage = `url("${ray}")`;
    for (const [no, t] of turlar.entries()) {
      sayac.textContent = `${no + 1} / ${turlar.length}`;
      // önceki turun seçenekleri soru sırasında kalmasın (ölü düğme olmasın)
      secimler.replaceChildren(); secimler.dataset.kilit = 'true';
      kisa.replaceChildren(...t.dizi.map((x) => h('span.ing-tren-dugme', { 'data-harf': x }, vagon(x, x === t.eksik))), lokomotif());
      const bosVagon = kisa.querySelector<HTMLElement>(`[data-harf="${t.eksik}"]`)!;
      bosVagon.classList.add('ing-tren-eksik');
      if (!(await soyle('en/g-tren-missing'))) return;
      iz('eksik ' + t.eksik);
      await new Promise<void>((coz) => {
        let yanlis = 0;
        secimler.replaceChildren(...t.secenekler.map((x) => {
          const d = dugme('ing-tren-secim', `${x.toUpperCase()} harfi`, async () => {
            if (secimler.dataset.kilit === 'true') return;
            if (x !== t.eksik) {
              secimler.dataset.kilit = 'true'; yanlis++; salla(d);
              await soyle('en/g-no', `en/abc-ad-${x}`);
              if (yanlis >= 2) secimler.querySelector(`[data-harf="${t.eksik}"]`)?.classList.add('ing-parla');
              secimler.dataset.kilit = 'false';
              return;
            }
            secimler.dataset.kilit = 'true';
            tik.yapis();
            bosVagon.replaceChildren(vagon(x));
            bosVagon.classList.remove('ing-tren-eksik');
            kutla(bosVagon);
            void hareket('polly', 'sevin');
            await soyle('en/g-yes', `en/abc-ad-${x}`);
            secimler.dataset.kilit = 'false';
            coz();
          }, cizim(`abc/harf-${x}`, 'ing-tren-secim-resim') ?? h('b', {}, x.toUpperCase()));
          d.dataset.harf = x;
          return d;
        }));
        secimler.dataset.kilit = 'false';
      });
      if (!acik) return;
      iz('dogru ' + t.eksik);
      kisa.classList.add('ing-tren-gidiyor');
      await bekle(TEST_MODU ? 50 : 1400);
      kisa.classList.remove('ing-tren-gidiyor');
    }
    bitir();
  }

  function bitir() {
    iz('bitti');
    alan.replaceChildren(h('div.ing-tren-son', {}, h('h2', {}, 'Choo choo! Bütün harfler trende.'),
      dugme('ing-ana-dugme', 'Ana ekran', () => { tik.sec(); git.ana(); }, 'Ana ekran')));
    void soyle('en/g-great-job');
  }

  void (async () => { if (await soyle('tr/c-tren-giris')) await soyle('en/g-tren-aboard'); })();
  return () => { acik = false; sus(); };
}
