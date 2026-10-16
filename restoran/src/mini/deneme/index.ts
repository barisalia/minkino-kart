/**
 * DENEME mini oyunu (P1): gerçek mini oyunu henüz gelmemiş istasyonda akışı uçtan uca çalıştırır. Kalıcı değil;
 * P2 (Doğra, Tava, Tabakla) ve sonraki paketler geldikçe istasyonlarda onların yerini bırakır.
 * Yine de seçenekli: raftaki malzemelerden istediğini kâseye / tavaya / tabağa koyarsın (her dokunuş bir parça).
 * Tava: konunca kendi pişer (çiğ → az → altın → çıtır; kömür yok), geri çıkınca pişmeye devam eder.
 */
import { h, sure } from '../../../../src/ui/dom';
import {
  MALZEME_ADI,
  PISME_SIRASI,
  urunId,
  type ArkaIs,
  type Istasyon,
  type Malzeme,
  type MiniOyun,
  type Pisme,
  type Urun,
  type YemekOzelligi,
} from '../arayuz';

/** Sade renkler (yer tutucu; gerçek çizim mini oyunların kendi sayfalarında) */
export const RENK: Partial<Record<Malzeme, string>> = {
  domates: '#E8483A',
  salatalik: '#7DBE4E',
  sogan: '#E7C9A0',
  biber: '#4FA83D',
  maydanoz: '#3E9B3A',
  marul: '#9ED36A',
  havuc: '#F2902F',
  patates: '#E9C77B',
  limon: '#F7DC4A',
  yumurta: '#FFF6E0',
  ekmek: '#D9A15B',
  zeytin: '#4A3B33',
  bal: '#F2B233',
  muz: '#F7E06A',
  cilek: '#E5404F',
};

const PISME_MS = 4500;

interface Devam {
  ozellik: YemekOzelligi;
  pismeBas: number | null;
}

/** Kâse / tava / tabak görünümü: malzemeler renkli yuvarlaklar (yer tutucu) */
export function kaseGorsel(oz: YemekOzelligi, kap: 'kase' | 'tava' | 'tabak'): HTMLElement {
  const el = h(`div.rs-deneme-${kap}`, { 'data-pisme': oz.pisme ?? '' });
  let i = 0;
  for (const [m, d] of Object.entries(oz.malzemeler)) {
    for (let k = 0; k < Math.min(d!.adet, 4); k++, i++) {
      const a = (i * 137.5 * Math.PI) / 180;
      const r = 12 + (i % 4) * 7;
      el.append(h('i', { style: `background:${RENK[m as Malzeme] ?? '#ccc'};left:${50 + Math.cos(a) * r}%;top:${50 + Math.sin(a) * r}%` }));
    }
  }
  return el;
}

function denemeOyunu(istasyon: Istasyon): MiniOyun {
  return {
    ad: 'deneme',
    istasyon,
    baslat(b, g) {
      const tava = istasyon === 'ocak';
      const servis = istasyon === 'servis';
      const onceki = g.devam as Devam | undefined;
      const oz: YemekOzelligi = onceki?.ozellik ?? { malzemeler: {} };
      let pismeBas = onceki?.pismeBas ?? null;
      const kullanilan: string[] = [];
      let yemek: string | undefined;
      const kapTur = tava ? 'tava' : servis ? 'tabak' : 'kase';
      const kapEl = h(`div.rs-deneme-kap.rs-deneme-kap-${kapTur}`);
      const raf = h('div.rs-deneme-raf');
      const sahne = h('div.rs-deneme', {}, kapEl, raf);
      b.kok.append(sahne);
      const ciz = () => {
        kapEl.replaceChildren(kaseGorsel(oz, kapTur));
      };
      const pisme = (): Pisme | undefined => {
        if (!tava || pismeBas == null) return undefined;
        const i = Math.min(PISME_SIRASI.length - 1, Math.floor((performance.now() - pismeBas) / sure(PISME_MS)));
        return PISME_SIRASI[i];
      };
      const ekle = (m: Malzeme, kaynak: HTMLElement) => {
        const d = oz.malzemeler[m] ?? { adet: 0, kesim: tava ? 'kup' : 'iri' };
        d.adet++;
        oz.malzemeler[m] = d;
        if (tava && pismeBas == null) {
          pismeBas = performance.now();
          oz.sicak = true;
        }
        b.ses.cal(tava ? 'ciz' : 'kirt', { perde: 1 + Math.min(d.adet, 6) * 0.05 });
        b.dokunsal(10);
        kaynak.classList.remove('rs-bas');
        void kaynak.offsetWidth;
        kaynak.classList.add('rs-bas');
        ciz();
        if (Object.values(oz.malzemeler).reduce((t, x) => t + x!.adet, 0) >= 4) b.tepsi.hopla();
        b.ipucu.hedef({ el: () => b.tepsi.el, hareket: 'dokun' });
      };
      // raf: tabakta tepsideki ürünler + garnitür; öbür istasyonlarda malzemeler
      if (servis) {
        for (const u of g.tepsi) {
          const d = h('button.rs-deneme-urun', { type: 'button', 'aria-label': u.tur }, u.gorsel());
          d.addEventListener('click', () => {
            if (kullanilan.includes(u.id)) return;
            kullanilan.push(u.id);
            for (const [m, x] of Object.entries(u.ozellik.malzemeler)) {
              const e = oz.malzemeler[m as Malzeme];
              oz.malzemeler[m as Malzeme] = e ? { ...e, adet: e.adet + x!.adet } : { ...x! };
            }
            if (u.ozellik.pisme) oz.pisme = u.ozellik.pisme;
            if (u.ozellik.sicak) oz.sicak = true;
            if (u.yemek) yemek = u.yemek;
            d.classList.add('rs-kullanildi');
            b.ses.cal('pof');
            ciz();
            b.tepsi.hopla();
          });
          raf.append(d);
        }
      }
      const malzemeler = servis ? g.malzemeler.filter((m) => ['limon', 'maydanoz', 'ekmek', 'zeytin', 'bal'].includes(m)) : g.malzemeler;
      for (const m of malzemeler) {
        const d = h('button.rs-deneme-malzeme', { type: 'button', 'aria-label': MALZEME_ADI[m], 'data-malzeme': m }, h('i', { style: `background:${RENK[m] ?? '#ccc'}` }));
        d.addEventListener('click', () => {
          ekle(m, d);
          if (servis) oz.sus = (oz.sus ?? 0) + 1;
        });
        raf.append(d);
      }
      ciz();
      b.ipucu.hedef({ el: () => raf.firstElementChild as HTMLElement | null, hareket: 'dokun', soz: servis ? 'Tabak bomboş…' : tava ? 'Tava bomboş…' : 'Kâse bomboş…' });
      // tava rengi: pişme ilerledikçe
      const t = window.setInterval(() => {
        const p = pisme();
        if (p) {
          oz.pisme = p;
          kapEl.dataset.pisme = p;
          (kapEl.firstElementChild as HTMLElement | null)?.setAttribute('data-pisme', p);
        }
      }, 250);
      const cizirti = tava && pismeBas != null ? b.ses.dongu('ciz') : null;

      let coz: (u: Urun[]) => void = () => undefined;
      const bitti = new Promise<Urun[]>((r) => (coz = r));
      b.tepsi.dinle(() => {
        oz.pisme = pisme() ?? oz.pisme;
        const bos = Object.keys(oz.malzemeler).length === 0;
        if (bos && !servis) return coz([]);
        const ozellik: YemekOzelligi = JSON.parse(JSON.stringify(oz));
        const tur = servis ? 'tabak' : tava ? 'tava' : 'dogranmis';
        const tarifTahmin = servis ? yemek : tava ? 'menemen' : undefined;
        coz([{ id: urunId(tur), tur, yemek: tarifTahmin, ozellik, servis, kullanilan: servis ? kullanilan.slice() : undefined, gorsel: () => kaseGorsel(ozellik, tava ? 'tava' : servis ? 'tabak' : 'kase') }]);
      });
      return {
        bitti,
        arkaPlanda(): ArkaIs | null {
          if (!tava || pismeBas == null) return null;
          const durum: Devam = { ozellik: JSON.parse(JSON.stringify(oz)), pismeBas };
          return {
            durum,
            isaret: () => {
              const i = Math.min(PISME_SIRASI.length - 1, Math.floor((performance.now() - durum.pismeBas!) / sure(PISME_MS)));
              return { ses: 'ciz', buhar: i >= 1, pisme: PISME_SIRASI[i] };
            },
          };
        },
        kapat() {
          clearInterval(t);
          cizirti?.dur();
          sahne.remove();
        },
      };
    },
  };
}

export const oyun: MiniOyun = denemeOyunu('tezgah');
export const denemeIcin = (ist: Istasyon): MiniOyun => denemeOyunu(ist);
