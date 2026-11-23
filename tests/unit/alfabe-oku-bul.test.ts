import { describe, expect, it } from 'vitest';
import { celdiriciler, gecmisiYaz, okuBulOturumu, okunabilirSozcukler, type OkuBulSozcuk } from '../../alfabe/src/oku-bul-kurallari';

// "Oku ve bul" kuralları (Ceren'le oku ısınması): yalnız bitirilen harfler, yaşa göre hece ve resim sayısı, tekrar yok.
const L: OkuBulSozcuk[] = [
  ['nane', 'Nane', ['na', 'ne']], ['lale', 'Lale', ['la', 'le']], ['limon', 'Limon', ['li', 'mon']], ['kalem', 'Kalem', ['ka', 'lem']],
  ['okul', 'Okul', ['o', 'kul']], ['nota', 'Nota', ['no', 'ta']], ['roket', 'Roket', ['ro', 'ket']], ['ekmek', 'Ekmek', ['ek', 'mek']],
  ['erik', 'Erik', ['e', 'rik']], ['etek', 'Etek', ['e', 'tek']], ['tencere', 'Tencere', ['ten', 'ce', 're']], ['cilek', 'Çilek', ['çi', 'lek']],
  ['ugur', 'Uğur böceği', ['u', 'ğur', 'bö', 'ce', 'ği']], ['armut', 'Armut', ['ar', 'mut']],
].map(([id, ad, heceler]) => ({ id: id as string, ad: ad as string, heceler: heceler as string[] }));
const ANETIL = ['01', '17', '06', '24', '12', '15'];
const OKURIM = [...ANETIL, '18', '14', '25', '21', '11', '16'];
const tohum = (n: number) => { let x = n * 9301 + 49297; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };

describe('Oku ve bul', () => {
  it('yalnız bitirilen harflerle yazılmış sözcükler; çilek ve iki sözcüklü ad yok; 2–3 yaşta yok', () => {
    expect(okunabilirSozcukler(L, ANETIL, '5+').map((s) => s.id).sort()).toEqual(['lale', 'nane']);
    expect(okunabilirSozcukler(L, OKURIM, '5+').map((s) => s.id)).not.toContain('cilek');
    expect(okunabilirSozcukler(L, ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'], '5+').map((s) => s.id)).not.toContain('ugur');
    expect(okunabilirSozcukler(L, OKURIM, '2-3')).toEqual([]);
  });
  it('4 yaş iki heceli ve iki resim; 5+ üç heceye kadar ve üç resim', () => {
    const hepsi = ['01', '17', '06', '24', '12', '15', '18', '14', '25', '21', '11', '16', '03'];
    expect(okunabilirSozcukler(L, hepsi, '4').every((s) => s.heceler.length === 2)).toBe(true);
    expect(okunabilirSozcukler(L, hepsi, '5+').map((s) => s.id)).toContain('tencere');
    for (const t of okuBulOturumu(L, OKURIM, '4', { gorulme: {}, son: [] }, tohum(1))) expect(t.secenekler).toHaveLength(2);
    for (const t of okuBulOturumu(L, OKURIM, '5+', { gorulme: {}, son: [] }, tohum(2))) { expect(t.secenekler).toHaveLength(3); expect(t.secenekler).toContain(t.hedef); expect(new Set(t.secenekler).size).toBe(3); }
  });
  it('oturumda en çok 5 sözcük; bir önceki oturumun sözcükleri gelmez; en az görülen önce', () => {
    const ilk = okuBulOturumu(L, OKURIM, '5+', { gorulme: {}, son: [] }, tohum(3));
    expect(ilk).toHaveLength(5);
    const g = gecmisiYaz({ gorulme: {}, son: [] }, ilk);
    const ikinci = okuBulOturumu(L, OKURIM, '5+', g, tohum(4));
    const ortak = ikinci.filter((t) => ilk.some((x) => x.hedef === t.hedef));
    const okunur = okunabilirSozcukler(L, OKURIM, '5+').length;
    expect(ortak.length).toBe(Math.max(0, 5 - (okunur - 5)));
  });
  it('çeldiriciler önce aynı harfle başlayanlar (Ekmek → Erik, Etek)', () => {
    const ekmek = L.find((s) => s.id === 'ekmek')!;
    expect(celdiriciler(ekmek, L, 2, tohum(5)).map((s) => s.id).sort()).toEqual(['erik', 'etek']);
  });
});
