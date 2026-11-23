// Minik Doktor · vaka iskeletinin saf verisi (DOM yok; birim testleri buradan okur).
import { SECMELI, VAKA } from '../vaka/veri';

/** Dikenli Pati'den aynen kullanılan çizimler (assets/doktor/vaka/): aynı klinik, aynı çanta, aynı şerit. */
export const ORTAK = { hubFon: VAKA.hubFon, cantaKapali: VAKA.cantaKapali, cantaAcik: VAKA.cantaAcik, serit: VAKA.serit, pof: VAKA.pof, yildiz: VAKA.yildiz } as const;
export const ORTAK_DOSYALAR: readonly string[] = Object.values(ORTAK).flat();
/** Dikenli Pati'nin yakın plandaki ve masadaki Kino'su (assets/doktor/vaka/) */
export const KINO_DOSYALARI: readonly string[] = [SECMELI.kino.goster, SECMELI.kino.sasir, ...SECMELI.kino.alkis];
/**
 * Bir çizim hangi klasörden okunur: vakanın kendi klasöründen. Dikenli Pati'nin klasörüne (assets/doktor/vaka/) yalnız adı açıkça
 * verilen ortak parçalar için gidilir: ortak çizimler, Kino ve vakanın "paylaşılan" dediği çizimler (ör. Y9'da Y1'in büyüteci).
 * A1 bağlandıktan sonra o klasörde kalp-0, su-akis-0 gibi genel adlar da var; aynı adı kullanan bir vaka başka vakanın çizimini
 * açmasın, eksik çizim denetimi de yanlışlıkla geçmesin.
 */
export const cizimKlasoru = (ad: string, klasor: string, paylasilan: readonly string[] = []): string =>
  (ORTAK_DOSYALAR.includes(ad) || KINO_DOSYALARI.includes(ad) || paylasilan.includes(ad) ? 'vaka' : klasor);
/**
 * Parmağın hızı, kare hızından bağımsız: son ~60 ms'nin üstel ortalaması. Kare başına ölçülen hız 60, 120 ve 240 Hz ekranlarda
 * farklı çıkar: dokunma olayı kare kare gelmez, hareketsiz karelerle hareketli kareler sırayla gelir. Yavaş bir el de "hızlı"
 * sayılabilir (ProMotion iPad). deger: bu karedeki anlık hız; dt: karenin süresi (ms).
 */
export const HIZ_PENCERESI = 60;
export const ortalamaHiz = (ort: number, deger: number, dt: number): number => ort + (deger - ort) * Math.min(1, Math.max(0, dt) / HIZ_PENCERESI);
/** Dikenli Pati'nin efektlerinden her vakada kullanılanlar (assets/doktor/vaka/ses/). */
export const ORTAK_EFEKTLER = ['e-cit', 'e-tik', 'e-vuu', 'e-pof', 'e-cin', 'e-pat', 'e-hihi'] as const;
