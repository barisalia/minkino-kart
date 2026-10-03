import { describe, expect, it } from 'vitest';
import motorKaynak from '../../film/src/motor.ts?raw';

// Film arka planları yalnız kullanılan klasörlerden pakete girer (film/src/motor.ts → FILM_GORSEL). Bütün
// assets/film/*/arka-*.webp alındığında filmi olmayan sahneler uygulamayı ~6 MB büyütüyordu. Her filmin
// arka planı yine bulunmalı.
interface FilmDosya { film: string; malzeme?: string; sahneler: { arka?: string }[] }
const FILMLER = import.meta.glob<FilmDosya>('../../content/film/*.json', { eager: true, import: 'default' });
const ARKALAR = Object.keys(import.meta.glob('../../assets/film/*/arka-*.webp', { query: '?url', import: 'default' }));
const arkaliKlasorler = new Set(ARKALAR.map((y) => y.split('/')[4]));

const globDeseni = /FILM_GORSEL = import\.meta\.glob<string>\('\.\.\/\.\.\/assets\/film\/\{([a-z0-9,-]+)\}\/arka-\*\.webp'/.exec(motorKaynak);
const pakette = new Set(globDeseni?.[1].split(',') ?? []);

describe('film arka planları', () => {
  it('motor yalnız seçili klasörleri alır', () => {
    expect(globDeseni).not.toBeNull();
    expect(pakette.size).toBeGreaterThan(0);
  });

  for (const [yol, f] of Object.entries(FILMLER)) {
    it(`${yol.split('/').pop()}: sahnelerin arka planı pakette`, () => {
      for (const s of f.sahneler) {
        if (!s.arka) continue;
        if (s.arka === 'ev') expect(pakette).toContain('ev');
        else if (s.arka === 'park' || s.arka === 'park-salincak') expect(pakette).toContain('park');
        else if (s.arka === 'pazar') {
          const klasor = [f.film, f.malzeme].find((k) => k && arkaliKlasorler.has(k));
          expect(klasor, `${f.film}: pazar çizimi yok`).toBeTruthy();
          expect(pakette).toContain(klasor);
        }
      }
      // filmin kendi ya da malzeme klasöründe arka plan varsa (önceden yükleme bunları ister) pakette olmalı
      for (const k of [f.film, f.malzeme]) if (k && arkaliKlasorler.has(k)) expect(pakette).toContain(k);
    });
  }
});
