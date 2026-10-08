/** Hoparlör düğmesi ebeveynin Ebeveyn Köşesi seçimini ezmez (hata avı 2, L4) */
import { beforeEach, describe, expect, it } from 'vitest';
import { durum } from '../../src/engine/ilerleme';
import { ayarDegistir, sessizeAlDegistir, tumSesKapaliMi } from '../../src/audio/ses';

const kanallar = () => {
  const { muzik, efekt, konusma } = durum.i.ayarlar;
  return { muzik, efekt, konusma };
};

describe('sessize al / aç', () => {
  beforeEach(() => {
    ayarDegistir({ muzik: true, efekt: true, konusma: true });
  });

  it('ebeveyn yalnız müziği kapattıysa: sessize al + aç sonrası müzik kapalı kalır', () => {
    ayarDegistir({ muzik: false });
    expect(sessizeAlDegistir()).toBe(true);
    expect(tumSesKapaliMi()).toBe(true);
    expect(sessizeAlDegistir()).toBe(false);
    expect(kanallar()).toEqual({ muzik: false, efekt: true, konusma: true });
  });

  it('ebeveyn yalnız anlatımı kapattıysa da korunur', () => {
    ayarDegistir({ konusma: false });
    sessizeAlDegistir();
    sessizeAlDegistir();
    expect(kanallar()).toEqual({ muzik: true, efekt: true, konusma: false });
  });

  it('sessizken ebeveyn bir kanalı açarsa saklı seçim düşer, onun seçimi geçerli olur', () => {
    ayarDegistir({ muzik: false });
    sessizeAlDegistir();
    ayarDegistir({ efekt: true });
    expect(tumSesKapaliMi()).toBe(false);
    expect(durum.i.ayarlar.sesOnce).toBeUndefined();
    expect(kanallar()).toEqual({ muzik: false, efekt: true, konusma: false });
  });

  it('saklı seçim yoksa (hepsi kapalı) ses açılınca üç kanal da açılır', () => {
    ayarDegistir({ muzik: false, efekt: false, konusma: false });
    expect(sessizeAlDegistir()).toBe(false);
    expect(kanallar()).toEqual({ muzik: true, efekt: true, konusma: true });
  });
});
