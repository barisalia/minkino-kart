import { describe, expect, it } from 'vitest';
import { sayfaAdresi } from './sayfa';

describe('sayfaAdresi', () => {
  it('uygulamada klasör adresine index.html ekler, sorguyu korur', () => {
    expect(sayfaAdresi('./kartlar/', true)).toBe('./kartlar/index.html');
    expect(sayfaAdresi('https://localhost/', true)).toBe('https://localhost/index.html');
    expect(sayfaAdresi('./macera/?bolum=ege', true)).toBe('./macera/index.html?bolum=ege');
    expect(sayfaAdresi('./film/index.html', true)).toBe('./film/index.html');
  });
  it('webde dokunmaz', () => {
    expect(sayfaAdresi('./kartlar/', false)).toBe('./kartlar/');
  });
});
