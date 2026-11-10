import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { durum, varsayilan } from '../../src/engine/ilerleme';
import { menuYasiOku, menuYasiniSec, menuYasModu } from '../../src/engine/menu-yas';

describe('Menü ve oyunların ortak yaşı', () => {
  let depo: Map<string, string>;
  beforeEach(() => {
    depo = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => depo.get(k) ?? null,
      setItem: (k: string, v: string) => { depo.set(k, v); },
      removeItem: (k: string) => { depo.delete(k); },
    });
    durum.i = varsayilan();
  });
  afterEach(() => { vi.unstubAllGlobals(); durum.i = varsayilan(); });

  it('yaş seçilmediyse oyun için varsayımsal yaş uydurmaz', () => {
    expect(menuYasiOku()).toBeNull();
    expect(menuYasModu()).toBeNull();
  });

  it.each([[3, 'kucuk'], [4, 'kucuk'], [5, 'buyuk'], [6, 'buyuk']] as const)('%i yaş ortak kayda ve Dondurma moduna yansır; ilerleme korunur', (yas, mod) => {
    durum.i.album = ['elma'];
    durum.i.enIyi = { '4-hayvanlar': 3 };
    durum.i.toplamYildiz = 12;
    menuYasiniSec(yas);
    expect(menuYasiOku()).toBe(yas);
    expect(menuYasModu()).toBe(mod);
    const kayit = JSON.parse(depo.get('minkino-kartlar-v1')!);
    expect(kayit).toMatchObject({ yas, album: ['elma'], enIyi: { '4-hayvanlar': 3 }, toplamYildiz: 12 });
  });

  it.each([['2–3 yaş', 3], ['4–5 yaş', 4], ['6–7 yaş', 6]] as const)('eski %s seçimini desteklenen %i yaşa taşır', (eski, yas) => {
    depo.set('minkino-menu-yas', eski);
    expect(menuYasiOku()).toBe(yas);
    menuYasiniSec(menuYasiOku()!);
    expect(depo.has('minkino-menu-yas')).toBe(false);
    expect(JSON.parse(depo.get('minkino-kartlar-v1')!).yas).toBe(yas);
  });

  it('oyunda değiştirilen yaş eski menü etiketinden önce gelir', () => {
    depo.set('minkino-menu-yas', '6–7 yaş');
    durum.i.yas = 3;
    expect(menuYasiOku()).toBe(3);
  });

  it('bozuk eski seçimi yok sayar', () => {
    depo.set('minkino-menu-yas', '99 yaş');
    expect(menuYasiOku()).toBeNull();
  });

  it('depolama kullanılamıyorsa seçim oturumda çalışır', () => {
    vi.stubGlobal('localStorage', { getItem() { throw Error('kapalı'); }, setItem() { throw Error('dolu'); }, removeItem() { throw Error('kapalı'); } });
    expect(menuYasiOku()).toBeNull();
    expect(() => menuYasiniSec(5)).not.toThrow();
    expect(menuYasiOku()).toBe(5);
    expect(menuYasModu()).toBe('buyuk');
  });
});
