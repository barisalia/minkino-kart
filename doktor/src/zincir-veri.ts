// "Zıpzıp'ın Dizi" · sekiz sahnenin sırası ve gereken bütün çizimler (çekim listesi: ekip/senaryo/MINIK-DOKTOR-ZIPZIP-CEKIM-LISTESI.md).
// 4. ve 5. sahne tek parçadır (kanıt sahnesi "Önce Kuzu"). Saf veri: DOM yok.
import { DUSUS_DOSYALAR, KAPANIS_DOSYALAR, KAPANIS_ODUNC } from './bahce/veri';
import { BEKLEME_DOSYALAR } from './bekleme/veri';
import { DIZ_DOSYALAR, DIZ_ODUNC } from './diz/veri';
import { KAPI_DOSYALAR } from './kapi/veri';
import { ODUL_DOSYALAR, ODUL_ODUNC } from './odul/veri';
import { K1_DOSYALAR } from './once-kuzu/diziler';

export const SAHNE_SIRASI = ['bahce', 'kapi', 'bekleme', 'once-kuzu', 'diz', 'odul', 'kapanis'] as const;
export type SahneAdi = (typeof SAHNE_SIRASI)[number];
/** Çekim listesindeki sahne numaraları. */
export const SAHNE_NO: Record<SahneAdi, string> = { bahce: '1', kapi: '2', bekleme: '3', 'once-kuzu': '4–5', diz: '6', odul: '7', kapanis: '8' };

/** Her sahnenin açılması için gereken çizimler (kendi paketindekiler ve başka paketten kullandıkları). */
export const SAHNE_DOSYALARI: Record<SahneAdi, readonly string[]> = {
  bahce: DUSUS_DOSYALAR,
  kapi: KAPI_DOSYALAR,
  bekleme: BEKLEME_DOSYALAR,
  'once-kuzu': K1_DOSYALAR,
  diz: [...DIZ_DOSYALAR, ...DIZ_ODUNC],
  odul: [...ODUL_DOSYALAR, ...ODUL_ODUNC],
  kapanis: [...KAPANIS_DOSYALAR, ...KAPANIS_ODUNC],
};
/** Paketlerin kendi çizimleri: K1 68, K2 90, K3 161. */
export const PAKET = {
  K1: K1_DOSYALAR,
  K2: [...KAPI_DOSYALAR, ...BEKLEME_DOSYALAR],
  K3: [...DUSUS_DOSYALAR, ...DIZ_DOSYALAR, ...ODUL_DOSYALAR, ...KAPANIS_DOSYALAR],
} as const;
/** Oyunun baştan sona oynanması için gereken bütün çizimler (319). */
export const TUM_DOSYALAR: readonly string[] = [...new Set(Object.values(SAHNE_DOSYALARI).flat())];
/** Sıradaki sahne; son sahneden sonra null. */
export const sonrakiSahne = (s: SahneAdi): SahneAdi | null => SAHNE_SIRASI[SAHNE_SIRASI.indexOf(s) + 1] ?? null;
