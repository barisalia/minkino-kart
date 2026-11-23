// 3. sahne · bekleme odası: tanım ve sahneye özel dokunma (raftaki eşyayı Zıpzıp'a götürmek).
import { kutuyaKoy, sahneyiBaslat, type SahneTanimi } from '../motor/yurutucu';
import { merkez, tutmaBaslat, uzaklik, type Tutma } from '../tutma';
import {
  BEKLEME_ADIMLAR, BEKLEME_DIZI, BEKLEME_DOSYALAR, BEKLEME_EFEKTLER, BEKLEME_KAMERA, BEKLEME_KAYIT_MS, BEKLEME_OLCEK, BEKLEME_REPLIKLER,
  BEKLEME_YERLESIM, ESYA_ADIMI, ESYA_CIZIMI, K2_BEKLEME, beklemeKatmanlari, type BeklemeOlayi, type Esya,
} from './veri';

const ESYA_ETIKETI: Record<Esya, string> = { kuzu: 'Oyuncak Kuzu', kitap: 'Kitap', top: 'Top' };

export const BEKLEME_SAHNESI: SahneTanimi<BeklemeOlayi> = {
  ad: 'bekleme',
  dosyalar: BEKLEME_DOSYALAR,
  adimlar: BEKLEME_ADIMLAR,
  diziler: BEKLEME_DIZI,
  agizlar: {
    'zipzip-ilis': { katman: 'zipzip', kareler: K2_BEKLEME.ilisAgiz },
    'zipzip-saril': { katman: 'zipzip', kareler: K2_BEKLEME.sarilAgiz },
    'kino-kapida': { katman: 'kino', kareler: K2_BEKLEME.kapidaAgiz },
  },
  fon: K2_BEKLEME.fon,
  katmanlar: beklemeKatmanlari(),
  kamera: BEKLEME_KAMERA,
  replikler: BEKLEME_REPLIKLER.map(r => r.ad),
  efektler: BEKLEME_EFEKTLER,
  kayitMs: BEKLEME_KAYIT_MS,
  kur(b) {
    const verilen = new Set<Esya>();
    let tutma: Tutma | null = null;
    // Zıpzıp'ın kucağı: eşyanın bırakılacağı yer (görünmez işaret; kamerayla birlikte büyür)
    const kucak = document.createElement('div');
    kucak.className = 'ok-isaret';
    const zk = beklemeKatmanlari().find(k => k.ad === 'zipzip')!.kutu;
    kucak.style.left = zk.sol + BEKLEME_YERLESIM.kucak.x * BEKLEME_OLCEK + 'px';
    kucak.style.top = zk.ust + BEKLEME_YERLESIM.kucak.y * BEKLEME_OLCEK + 'px';
    b.kamera.append(kucak);
    const dugmeler = {} as Record<Esya, HTMLButtonElement>;
    for (const esya of ['kuzu', 'kitap', 'top'] as const) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'ok-hedef ok-esya';
      d.setAttribute('aria-label', ESYA_ETIKETI[esya]);
      d.dataset.esya = esya;
      const r = document.createElement('img');
      r.src = b.adres(ESYA_CIZIMI[esya]); r.alt = ''; r.draggable = false;
      d.append(r);
      kutuyaKoy(d, BEKLEME_YERLESIM.raf[esya]);
      b.kamera.append(d);
      dugmeler[esya] = d;
      const ver = () => { verilen.add(esya); d.hidden = true; b.olay('esya-verildi', ESYA_ADIMI[esya]); };
      const al = (e?: PointerEvent) => {
        if (b.akis.adim?.ad !== 's3-raf' || tutma) return;
        if (e) { if (e.button !== 0) return; e.preventDefault(); }
        const kr = d.getBoundingClientRect();
        const t = tutmaBaslat(d, { resimAdresi: b.adres(ESYA_CIZIMI[esya]), oran: r.naturalWidth / Math.max(1, r.naturalHeight), boyPx: Math.max(kr.width, kr.height) * 1.25, tut: [0.5, 0.55], uc: [0.5, 0.5] }, {
          birak: uc => {
            tutma = null;
            const yakin = uzaklik(uc, merkez(kucak)) <= BEKLEME_YERLESIM.kucak.yaricap * BEKLEME_OLCEK * BEKLEME_KAMERA.orta.olcek * b.olcek();
            if (!yakin || b.akis.adim?.ad !== 's3-raf') return false; // rafa geri döner
            void t.bitir('yerinde');
            ver();
            return true;
          },
        }, e);
        tutma = t;
        if (!e) { tutma = null; void t.bitir('yerinde'); ver(); } // klavye: eşya doğrudan verilir
      };
      d.addEventListener('pointerdown', e => al(e));
      d.addEventListener('click', e => { if (e.detail === 0) al(); });
    }
    let sonIpucu = 0;
    return {
      adim: a => { for (const esya of ['kuzu', 'kitap', 'top'] as const) dugmeler[esya].hidden = verilen.has(esya) || a.ad !== 's3-raf'; },
      // çocuk beklerse Zıpzıp bir kez gözünü kırpıp rafa bakmayı sürdürür (çizilmiş poz; ok ve yazı yok)
      kare: () => {
        if (b.akis.adim?.ad !== 's3-raf' || tutma || b.bostaMs() < 6000 || b.saat() - sonIpucu < 6000) return;
        sonIpucu = b.saat();
        b.gecici('zipzip', K2_BEKLEME.ilisKirp, 130);
      },
    };
  },
};
export const baslat = (kok: HTMLElement) => sahneyiBaslat(kok, BEKLEME_SAHNESI);
