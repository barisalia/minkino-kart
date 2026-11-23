// Bir harf dersinin resimli sözcükleri: Keşfet'in iki sözcüğü ve küçük harf yazmanın ("Harf canlanır") resmi aynı kaynaktan.
// Sözcük havuzunun bu harfe ait, bu yaşa uygun ve resmi gelmiş ders sözcükleri ikinci sözcük adaylarına katılır
// (sozcuk-havuzu.ts → havuzDersKartlari); ikinci sözcük gün içinde aynı kalır, günden güne sırayla değişir.
import { kutuTurlari } from './harf-kutusu-kartlari';
import { havuzDersKartlari } from './sozcuk-havuzu';
import { yasGrubu } from './yas-grubu';

type Ders = Parameters<typeof kutuTurlari>[0];
export const dersKutuTurlari = (ders: Ders) => kutuTurlari(ders, 3, Math.random, havuzDersKartlari(ders.upper, yasGrubu));
