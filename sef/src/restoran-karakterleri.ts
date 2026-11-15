// The first three guest IDs were recipe IDs in the original game saves.
export const restoranKarakterleri = {
  corba: 'lokum', salata: 'mino', pizza: 'dede',
  kino: 'kino', anne: 'anne', baba: 'baba', babaanne: 'babaanne',
  seftali: 'seftali', tavsan: 'tavsan', zipzip: 'zipzip', bulut: 'bulut',
} as const;

export type SiparisMisafiri = keyof typeof restoranKarakterleri;
export type RestoranKarakteri = typeof restoranKarakterleri[SiparisMisafiri];

export const karakterAdlari: Record<RestoranKarakteri, string> = {
  lokum: 'Lokum', mino: 'Mino', dede: 'Dede Hasan', kino: 'Kino',
  anne: 'Anne', baba: 'Baba Murat', babaanne: 'Babaanne Nazlı',
  seftali: 'Mila', tavsan: 'Tavşan', zipzip: 'Zıpzıp', bulut: 'Bulut',
};

export function misafirAdi(misafir: SiparisMisafiri) {
  return karakterAdlari[restoranKarakterleri[misafir]];
}

export const arkadasAgizlari = {
  bulut: [.52, .38], seftali: [.32, .58], tavsan: [.61, .51], zipzip: [.55, .45],
} as const;
export function salonArkadasi(kim:RestoranKarakteri):kim is keyof typeof arkadasAgizlari {
  return Object.hasOwn(arkadasAgizlari,kim);
}
