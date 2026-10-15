import { describe, expect, it } from 'vitest';
import { karakterCumleleri, tumCumleler } from '../../src/audio/cumleler';
import uykuJson from '../../content/uyku.json';
import {
  acilisDurumu,
  ADIMLAR,
  aksamMi,
  dogruYatakMi,
  kilitSonu,
  kilitVarMi,
  kayitOku,
  oyuncakBittiMi,
  simdiBul,
  sonrakiAdim,
  UYKU_ACIK,
  uykuEtkin,
  yardimBasamagi,
} from '../../uygulama/src/uyku-mantik';

const t = (g: number, s: number, d = 0) => new Date(2026, 9, g, s, d, 0, 0).getTime();

describe('Uyku Vakti mantığı', () => {
  it('akşam 19:00-05:59', () => {
    expect(aksamMi(18)).toBe(false);
    expect(aksamMi(19)).toBe(true);
    expect(aksamMi(23)).toBe(true);
    expect(aksamMi(0)).toBe(true);
    expect(aksamMi(5)).toBe(true);
    expect(aksamMi(6)).toBe(false);
    expect(aksamMi(11)).toBe(false);
  });

  it('kilit: 23:00 yazılan kayıt ertesi 05:59 var, 06:01 yok', () => {
    const k = { bitti: t(15, 23) };
    expect(kilitVarMi(k, t(15, 23, 30))).toBe(true);
    expect(kilitVarMi(k, t(16, 5, 59))).toBe(true);
    expect(kilitVarMi(k, t(16, 6, 1))).toBe(false);
    expect(kilitSonu(k.bitti)).toBe(t(16, 6));
  });

  it('kilit: gece yarısından sonra (02:00) yazılan kayıt aynı gün 06:01 yok', () => {
    const k = { bitti: t(16, 2) };
    expect(kilitVarMi(k, t(16, 5))).toBe(true);
    expect(kilitVarMi(k, t(16, 6, 1))).toBe(false);
  });

  it('açılış: kilit, sabah selamı bir kez, sonra hiçbir şey', () => {
    const k = { bitti: t(15, 21) };
    expect(acilisDurumu(null, t(15, 22))).toBe('yok');
    expect(acilisDurumu(k, t(15, 22))).toBe('kilit');
    expect(acilisDurumu(k, t(16, 7))).toBe('gunaydin');
    expect(acilisDurumu({ ...k, gunaydin: true }, t(16, 7))).toBe('yok');
  });

  it('kayıt okuma bozuk veriye dayanıklı', () => {
    expect(kayitOku(null)).toBeNull();
    expect(kayitOku('{bozuk')).toBeNull();
    expect(kayitOku('{"x":1}')).toBeNull();
    expect(kayitOku('{"bitti":5}')).toEqual({ bitti: 5, gunaydin: false });
  });

  it('bayrak kapalı; ?uyku=1 ile denenir, ?saat= saat taklidi', () => {
    expect(UYKU_ACIK).toBe(false);
    expect(uykuEtkin(new URLSearchParams(''))).toBe(false);
    expect(uykuEtkin(new URLSearchParams('uyku=1'))).toBe(true);
    expect(uykuEtkin(new URLSearchParams(''), true)).toBe(true);
    const g = new Date(2026, 9, 15, 10, 0);
    expect(simdiBul(new URLSearchParams('saat=21'), g).getHours()).toBe(21);
    expect(simdiBul(new URLSearchParams('saat=7'), g).getDate()).toBe(15);
    expect(simdiBul(new URLSearchParams(''), g)).toBe(g);
  });

  it('adımlar sırayla, son adım uyuyan oda', () => {
    expect(ADIMLAR[0]).toBe('acilis');
    let a = ADIMLAR[0] as (typeof ADIMLAR)[number];
    const gorulen = [a];
    while (a !== 'oda') gorulen.push((a = sonrakiAdim(a)));
    expect(gorulen).toEqual(['acilis', 'oyuncak', 'yastik', 'battaniye', 'perde', 'lamba', 'uyku', 'oda']);
    expect(sonrakiAdim('oda')).toBe('oda');
    expect(oyuncakBittiMi(3, false)).toBe(false);
    expect(oyuncakBittiMi(3, true)).toBe(true);
    expect(dogruYatakMi('mino', 'kino')).toBe(false);
    expect(dogruYatakMi('kino', 'kino')).toBe(true);
  });

  it('yardım merdiveni 4 / 10 / 18 sn', () => {
    expect(yardimBasamagi(3999)).toBe(0);
    expect(yardimBasamagi(4000)).toBe(1);
    expect(yardimBasamagi(10000)).toBe(2);
    expect(yardimBasamagi(18000)).toBe(3);
    expect(yardimBasamagi(90, 0.02)).toBe(1);
  });

  it('16 yeni cümle seslendirme listesinde (Kino kendi sesiyle de)', () => {
    const hepsi = new Set(tumCumleler());
    const kinolar = new Set(karakterCumleleri().kino);
    const mino = Object.values(uykuJson.mino);
    const kino = Object.values(uykuJson.kino);
    expect(mino.length + kino.length).toBe(16);
    for (const c of [...mino, ...kino, uykuJson.hazir.uykum, uykuJson.hazir.gunaydin, ...uykuJson.hazir.sayilar]) expect(hepsi.has(c)).toBe(true);
    for (const c of kino) expect(kinolar.has(c)).toBe(true);
  });
});
