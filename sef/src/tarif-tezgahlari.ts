export const tezgahlar = {
  durum: { ad: 'Rulo Dürüm', menu: 'bahce-durumu' },
  kumpir: { ad: 'Kumpir', menu: 'misirli-kumpir' },
  manti: { ad: 'Mantı', menu: 'peynir-manti' },
  tost: { ad: 'Sıcak Tost', menu: 'peynirli-tost' },
  simit: { ad: 'Simit', menu: 'susamli-simit' },
  tavuk: { ad: 'Tavada Tavuk', menu: 'fiyonk-tavuk' },
  icecek: { ad: 'Meyve Karışımı', menu: 'meyveli-mola' },
  menemen: { ad: 'Menemen', menu: 'biberli-menemen' },
  omlet: { ad: 'Omlet', menu: 'kino-omleti' },
} as const;

export type TarifTezgahi = keyof typeof tezgahlar;
