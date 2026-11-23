/**
 * Polly's Riddles (Oyunlar, 4 ve 5+; 21 Kasım 2026): dinlediğini anlama. Polly iki üç kısa cümleyle bir şeyi tarif eder
 * ("It is yellow. It is a fruit. What is it?"); çocuk üç kelime kartından doğrusunu seçer. Doğruda Polly "Yes! It's a
 * banana." der ve kart büyür. Yanlışta kart söner, Polly "Listen again." deyip ipuçlarını yineler. Oturumda dört
 * bilmece; bir önceki oturumdakiler gelmez (bu cihazda saklanır). Veri: bilmece-veri.ts. Yeni çizim yok.
 */
import { h } from '../../../src/ui/dom';
import { kutla, ziplat } from '../kit';
import { bilmeceKimlikleri, bilmeceSoruSesi, cevapSesi, ipucuSesi, soruMetni, type BilmeceTuru } from './bilmece-veri';
import { kelimeKarti, resimleriOnYukle, secimBaslat } from './ada-secim';
import { oyunDuzeni, yasam, type AdimBaglami } from './ortak';
import './bilmece.css';

export const BILMECE_ANAHTARI = 'minkino-ingilizce-bilmece-v1';
export function oncekiBilmeceler(): string[] {
  try { const l = JSON.parse(localStorage.getItem(BILMECE_ANAHTARI) ?? '[]'); return Array.isArray(l) ? l : []; } catch { return []; }
}

export function bilmeceKur(b: AdimBaglami, o: { turlar: BilmeceTuru[] }): () => void {
  const y = yasam();
  const { masa } = oyunDuzeni(b.alan, 'ing-ao ing-ao-bilmece');
  // giriş konuşması sırasında pano boş kalmasın
  const ipuclari = h('div.ing-ao-bm-ipuclari', { lang: 'en-US', 'aria-live': 'polite' }, h('strong.ing-ao-bm-baslik', {}, 'Riddle time!'));
  const kartlar = h('div.ing-secenekler.ing-ao-kartlar.ing-ao-bm-kartlar');
  masa.append(ipuclari, kartlar);
  resimleriOnYukle(o.turlar.flatMap((t) => t.secenekler));
  // bu oturumun bilmeceleri bir sonraki oturumda gelmesin
  try { localStorage.setItem(BILMECE_ANAHTARI, JSON.stringify(bilmeceKimlikleri(o.turlar))); } catch { /* yoksa da oynanır */ }

  secimBaslat({
    b, y, kutu: kartlar, turSayisi: o.turlar.length, yanlisSoner: true,
    tur: (i) => {
      const t = o.turlar[i];
      return {
        hedef: t.bilmece.hedef, kelime: t.bilmece.hedef,
        soru: [...t.bilmece.ipuclari.map(ipucuSesi), bilmeceSoruSesi(t.bilmece)],
        kartlar: t.secenekler.map((w) => kelimeKarti(w)),
        hazirla: async () => {
          ipuclari.replaceChildren(...t.bilmece.ipuclari.map((m) => h('span', {}, m)), h('strong', {}, soruMetni(t.bilmece)));
          return y.dur(250);
        },
      };
    },
    yanlis: () => ['en/g-listen-again'],
    dogru: async (i, d) => {
      const t = o.turlar[i];
      kutla(d);
      void ziplat(d.querySelector<HTMLElement>('.ing-resim'));
      ipuclari.replaceChildren(h('strong', {}, `Yes! ${t.bilmece.cevap}`));
      if (!(await y.soyle(cevapSesi(t.bilmece)))) return false;
      return y.dur(500);
    },
    giris: async () => (!b.ilkKez('ao-bilmece') || (await y.soyle('tr/c-bilmece-giris'))) && y.soyle('en/g-riddle-time'),
    bitis: async () => y.soyle('en/g-well-done'),
  });
  return () => y.kapat();
}
