/**
 * Uygulamadaki çizgi filmler (Barış 2026-11-10): eski 6 canlı film menüden kalktı; filmler Minkino Kids YouTube
 * kanalından (UCbntz-BxwhDmsNnbVrwehXQ) uygulamanın kendi oynatıcısında (izle/, YouTube iframe) oynar. Pakete
 * yalnız küçük kapaklar girer (assets/video/<id>.webp, 640 px), video girmez: paket boyutu büyümez, internet gerekir.
 * Shorts (Anne Baba Günlüğü) listeye alınmaz: çocuklar için değil.
 * Yeni film: YouTube kimliği + kapak (assets/video/<id>.webp) + aşağıya bir satır. Sıra: en yeni üstte.
 * Erişim kimliği 'izle/<id>' (src/engine/erisim.ts).
 */
import bisiklet from '../../assets/video/kino-bisiklet.webp';
import piknik from '../../assets/video/babanin-piknik-paketi.webp';
import kopukler from '../../assets/video/kopukler-bembeyaz.webp';
import ilkSes from '../../assets/video/ilk-ses-cikaran-yanar.webp';
import pasta from '../../assets/video/pasta-canavari-kim.webp';
import buldum from '../../assets/video/onu-ben-buldum.webp';

export interface Video {
  id: string;
  baslik: string;
  /** YouTube video kimliği */
  youtube: string;
  kapak: string;
}

export const VIDEOLAR: Video[] = [
  { id: 'kino-bisiklet', baslik: 'Kino Bisiklet Sürmeyi Öğreniyor', youtube: 'f--HMjt1HbY', kapak: bisiklet },
  { id: 'babanin-piknik-paketi', baslik: 'Babanın Piknik Paketi', youtube: 'KQpnWAcQlxQ', kapak: piknik },
  { id: 'kopukler-bembeyaz', baslik: 'Köpükler Bembeyaz', youtube: 'l64w_33K-cc', kapak: kopukler },
  { id: 'ilk-ses-cikaran-yanar', baslik: 'İlk Ses Çıkaran Yanar!', youtube: 'YgFr32-mNog', kapak: ilkSes },
  { id: 'pasta-canavari-kim', baslik: 'Pasta Canavarı Kim?', youtube: 'fcpJa8wB6r8', kapak: pasta },
  { id: 'onu-ben-buldum', baslik: 'Onu Ben Buldum!', youtube: '8i8c62wEBZg', kapak: buldum },
];

export const videoBul = (id: string | null): Video | undefined => VIDEOLAR.find((v) => v.id === id);
