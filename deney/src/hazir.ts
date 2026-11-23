// Deneyler'in kapıları: Astra'nın Paket D çizimleri ve Ceren'in kayıtları tamam değilse sayfa uygulamada açılmaz
// (ana menüye döner). Paket D6+ deneylerinin her biri ayrıca kendi çizimleri ve kayıtları tamamsa seçim ekranına girer
// (deneyAcik); eksikse görünmez. Test kipinde (?test=1) çizimler gelmeden de denenir: eksik çizimin yerinde adını yazan kutu.
import { CEKIRDEK, GEREKLI_CIZIMLER, GEREKLI_SESLER, deneyCizimleri, deneySesleri, type DeneyId } from './deney-mantik';

const cizimler = import.meta.glob<string>('../../assets/deney/*.webp', { eager: true, query: '?url', import: 'default' });
const sesler = import.meta.glob<string>('../../assets/deney/ses/*.mp3', { eager: true, query: '?url', import: 'default' });
export const cizim = (ad: string): string | undefined => cizimler['../../assets/deney/' + ad + '.webp'];
export const sesAdresi = (id: string): string | undefined => sesler['../../assets/deney/ses/' + id + '.mp3'];
export const eksikCizimler = () => GEREKLI_CIZIMLER.filter((ad) => !cizim(ad));
export const eksikSesler = () => GEREKLI_SESLER.filter((id) => !sesAdresi(id));
/** Sayfa: ortak sahne, Paket D'nin iki deneyi ve onların kayıtları. */
export const deneyHazir = () => !eksikCizimler().length && CEKIRDEK.every((id) => deneySesleri(id).every((s) => !!sesAdresi(s)));
/** Bir deney seçim ekranına girer mi: sayfa açık, kendi çizimleri ve kayıtları tamam. */
export const deneyAcik = (id: DeneyId) => deneyCizimleri(id).every((ad) => !!cizim(ad)) && deneySesleri(id).every((s) => !!sesAdresi(s));
