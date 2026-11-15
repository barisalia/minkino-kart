import type { Kesim } from './kesim-geometri';
export type TarifId = 'corba' | 'salata';
export type MalzemeId = 'domates' | 'havuc' | 'patates' | 'salatalik' | 'marul';
export type CorbaKivami='taneli'|'puruzsuz'|'patates';
export const SEBZELER:readonly MalzemeId[]=['domates','havuc','marul','patates','salatalik'];
export type Istasyon = 'dolap' | 'tahta' | 'ocak' | 'kase' | 'servis' | 'tamam';

export interface Tarif {
  readonly ad: string;
  readonly malzemeler: readonly MalzemeId[];
  readonly istasyon: 'ocak' | 'kase';
}

export const TARIFLER: Readonly<Record<TarifId, Tarif>> = {
  corba: {
    ad: 'Sebze çorbası',
    malzemeler: ['domates', 'havuc', 'patates'],
    istasyon: 'ocak',
  },
  salata: {
    ad: 'Bahçe salatası',
    malzemeler: ['marul', 'salatalik', 'domates'],
    istasyon: 'kase',
  },
};

export const KESIM_HEDEFI = 4;
export const KESIM_BOYLARI = [2,4,6] as const;
export type KesimBoyu = typeof KESIM_BOYLARI[number];
export const kesimHedefi = (siparis: Siparis, id: MalzemeId) =>
  siparis.eskiHazir.includes(id) ? 2 : siparis.kesimBoylari?.[id] ?? KESIM_HEDEFI;
export const dograndi = (siparis: Siparis, id: MalzemeId) =>
  siparis.kesimler[id] >= kesimHedefi(siparis,id);
export const KARISTIRMA_HEDEFI = 3;

export interface Siparis {
  readonly tarifId: TarifId;
  readonly alinan: readonly MalzemeId[];
  readonly sulanan?:readonly MalzemeId[];
  readonly bahceden?:readonly MalzemeId[];
  readonly eskiHazir: readonly MalzemeId[];
  readonly yikama?:Partial<Record<MalzemeId,number>>;
  readonly kesimBoylari?: Partial<Record<MalzemeId, KesimBoyu>>;
  readonly kesimler: Readonly<Record<MalzemeId, number>>;
  readonly tahtadaki?: MalzemeId;
  readonly kesitler: Partial<Record<MalzemeId, Kesim[]>>;
  readonly aktarilan: readonly MalzemeId[];
  readonly karistirma: number;
  readonly servisEdildi: boolean;
  readonly istenenKivam?:CorbaKivami;
  readonly salatalikBoyu?:2|6;
  readonly bekleyenIstasyon?:'dolap'|'tahta'|'ocak'|'kase'|'servis';
  readonly ezilen:readonly MalzemeId[];
}

export function siparisBaslat(tarifId: TarifId,istenenKivam?:CorbaKivami): Siparis {
  return {
    tarifId,
    alinan: [],
    eskiHazir: [],
    kesimler: { domates: 0, havuc: 0, patates: 0, salatalik: 0, marul: 0 },
    kesitler: {},
    aktarilan: [],
    karistirma: 0,
    servisEdildi: false,
    istenenKivam:tarifId==='corba'?istenenKivam:undefined,ezilen:[],
  };
}

export function malzemeAl(siparis: Siparis, malzeme: MalzemeId): Siparis {
  if (siparis.servisEdildi || siparis.alinan.length>=3 || siparis.alinan.includes(malzeme)) return siparis;
  return { ...siparis, alinan: [...siparis.alinan, malzeme] };
}

export function rafaKoy(s:Siparis,id:MalzemeId):Siparis {
  if(!s.alinan.includes(id)||s.kesimler[id]>0||s.aktarilan.includes(id))return s;
  const yikama={...s.yikama};delete yikama[id];
  return {...s,yikama,bahceden:s.bahceden?.filter(m=>m!==id),sulanan:s.sulanan?.filter(m=>m!==id),alinan:s.alinan.filter(m=>m!==id)};
}

export function sebzeFarki(s:Siparis) {
  const istenen=TARIFLER[s.tarifId].malzemeler;
  return {eksik:istenen.filter(id=>!s.aktarilan.includes(id)),fazla:s.aktarilan.filter(id=>!istenen.includes(id))};
}

export function kivamUyuyor(s:Siparis) {
  if(!s.istenenKivam)return true;
  if(s.istenenKivam==='patates')return s.ezilen.length===1&&s.ezilen[0]==='patates';
  return s.istenenKivam==='puruzsuz'?s.ezilen.length===3:s.ezilen.length===0;
}
export function dilimUyuyor(s:Siparis){
  return !s.salatalikBoyu||!s.aktarilan.includes('salatalik')||kesimHedefi(s,'salatalik')===s.salatalikBoyu;
}

export function sebzeyiEz(s:Siparis,id:MalzemeId):Siparis {
  if(s.tarifId!=='corba'||s.servisEdildi||s.karistirma!==KARISTIRMA_HEDEFI||!s.aktarilan.includes(id)||s.ezilen.includes(id))return s;
  return {...s,ezilen:[...s.ezilen,id]};
}

// Bir sebzeyi başkasıyla değiştirmek tek seçimdir. Yanlış sos ayrı bir karardır.
export function tabakTadimi(s:Siparis,cesniDogru:boolean):1|2|3 {
  const {eksik,fazla}=sebzeFarki(s);
  const hata=Math.max(eksik.length,fazla.length)+Number(!cesniDogru)+Number(!kivamUyuyor(s))+Number(!dilimUyuyor(s));
  return Math.max(1,3-hata) as 1|2|3;
}

export function kes(siparis: Siparis, malzeme: MalzemeId, kesit?: Kesim): Siparis {
  const onceki = siparis.kesimler[malzeme];
  if (!siparis.alinan.includes(malzeme) || dograndi(siparis, malzeme)) return siparis;
  const kesitler = { ...siparis.kesitler };
  if (kesit) {
    const liste = [...(kesitler[malzeme] ?? [])];
    liste[onceki] = kesit;
    kesitler[malzeme] = liste;
  }
  return { ...siparis, tahtadaki: kesit && onceki + 1 === kesimHedefi(siparis,malzeme) ? malzeme : siparis.tahtadaki, kesitler, kesimler: { ...siparis.kesimler, [malzeme]: onceki + 1 } };
}

export function aktar(siparis: Siparis, malzeme: MalzemeId): Siparis {
  if (!dograndi(siparis, malzeme) || siparis.aktarilan.includes(malzeme)) return siparis;
  return { ...siparis, tahtadaki: siparis.tahtadaki === malzeme ? undefined : siparis.tahtadaki, aktarilan: [...siparis.aktarilan, malzeme] };
}

export function sonKesimiGeriAl(s:Siparis,id:MalzemeId):Siparis {
  const adet=s.kesimler[id];
  if(!adet||s.servisEdildi||s.aktarilan.includes(id)||dograndi(s,id)&&s.tahtadaki!==id)return s;
  return {...s,tahtadaki:undefined,kesimler:{...s.kesimler,[id]:adet-1},
    kesitler:{...s.kesitler,[id]:s.kesitler[id]?.slice(0,adet-1)}};
}

export function karistir(siparis: Siparis): Siparis {
  const tarif = TARIFLER[siparis.tarifId];
  if (siparis.aktarilan.length !== tarif.malzemeler.length || siparis.karistirma >= KARISTIRMA_HEDEFI) return siparis;
  return { ...siparis, karistirma: siparis.karistirma + 1 };
}

export function servisEt(siparis: Siparis): Siparis {
  if (siparis.karistirma < KARISTIRMA_HEDEFI || siparis.servisEdildi) return siparis;
  return { ...siparis, servisEdildi: true };
}

// İpucu için önerilen durak. İstasyona giriş çocuğun seçimine açıktır.
export function siradakiIstasyon(siparis: Siparis): Istasyon {
  const tarif = TARIFLER[siparis.tarifId];
  if (siparis.servisEdildi) return 'tamam';
  if (siparis.alinan.length < tarif.malzemeler.length) return 'dolap';
  if (siparis.tahtadaki || siparis.alinan.some(malzeme => !dograndi(siparis, malzeme))) return 'tahta';
  if (siparis.karistirma < KARISTIRMA_HEDEFI) return tarif.istasyon;
  return 'servis';
}

/** Bonus only for a portion made with all three washed salad vegetables. */
export function citirSalata(s:Siparis|undefined){
  return s?.tarifId==='salata'&&s.aktarilan.length===3&&s.aktarilan.every(id=>s.yikama?.[id]===7);
}
