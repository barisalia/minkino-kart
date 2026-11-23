// 2. sahne · klinik kapısı: tanım ve sahneye özel dokunma (tabelayı çevirmek).
import { kutuyaKoy, sahneyiBaslat, type SahneTanimi } from '../motor/yurutucu';
import {
  KAPI_ADIMLAR, KAPI_DIZI, KAPI_DOSYALAR, KAPI_EFEKTLER, KAPI_KAMERA, KAPI_KAYIT_MS, KAPI_REPLIKLER, KAPI_YERLESIM, K2_KAPI,
  kapiKatmanlari, type KapiOlayi,
} from './veri';

export const KAPI_SAHNESI: SahneTanimi<KapiOlayi> = {
  ad: 'kapi',
  dosyalar: KAPI_DOSYALAR,
  adimlar: KAPI_ADIMLAR,
  diziler: KAPI_DIZI,
  agizlar: { 'zipzip-cekin': { katman: 'zipzip', kareler: K2_KAPI.cekinAgiz }, 'kino-karsila': { katman: 'kino', kareler: K2_KAPI.karsilaAgiz } },
  fon: K2_KAPI.fon,
  katmanlar: kapiKatmanlari(),
  kamera: KAPI_KAMERA,
  replikler: KAPI_REPLIKLER.map(r => r.ad),
  efektler: KAPI_EFEKTLER,
  kayitMs: KAPI_KAYIT_MS,
  kur(b) {
    // Tabelanın üstünde görünmez dokunma alanı (en az 64 px); çizim tabela katmanındadır.
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'ok-hedef';
    t.setAttribute('aria-label', 'Tabela');
    kutuyaKoy(t, KAPI_YERLESIM.tabela);
    t.style.borderRadius = '24px';
    b.kamera.append(t);
    t.addEventListener('click', () => { b.olay('tabela-cevrildi'); });
    let sonIpucu = 0;
    return {
      adim: a => { t.hidden = a.ad !== 's2-tabela'; },
      // çocuk beklerse tabela çizilmiş yan pozuyla bir kez kıpırdar (ok ve yazı yok)
      kare: () => {
        if (b.akis.adim?.ad !== 's2-tabela' || b.bostaMs() < 6000 || b.saat() - sonIpucu < 6000) return;
        sonIpucu = b.saat();
        b.gecici('tabela', K2_KAPI.tabela[1], 170);
      },
    };
  },
};
export const baslat = (kok: HTMLElement) => sahneyiBaslat(kok, KAPI_SAHNESI);
