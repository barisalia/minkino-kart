import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { ABC, celdirici, hecele, OTURUM_ZARF, postaAdaylari, postaOturumu, pulSesleri, unluSesi, type PostaSozcugu } from '../../alfabe/src/posta-kutusu-secim';

// "Dede'nin Posta Kutusu"nun sözcük seçimi ve pul sesleri (alfabe/src/posta-kutusu-secim.ts).
const s = (ad: string): PostaSozcugu => ({ id: ad, ad, gorsel: '', ses: 'kutu-ad-' + ad });
const harfler = (h: string) => new Set([...h]);
const kayitVar = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');
const heceSesi = (h: string) => 'pano-hece-' + h;

describe('posta kutusu', () => {
  it('Türkçe heceleme', () => {
    expect(hecele('Nar')).toEqual(['nar']);
    expect(hecele('erik')).toEqual(['e', 'rik']);
    expect(hecele('elma')).toEqual(['el', 'ma']);
    expect(hecele('okul')).toEqual(['o', 'kul']);
    expect(hecele('kapı')).toEqual(['ka', 'pı']);
    expect(hecele('uydu')).toEqual(['uy', 'du']);
  });
  it('2–4 harfli, tek sözcüklü ve yalnız bitirilen harflerle; aynı ad bir kez', () => {
    const havuz = [s('Nar'), s('at'), s('kuş'), s('top'), s('masa'), s('limon'), s('a'), s('El arabası'), s('nar')];
    expect(postaAdaylari(havuz, harfler(ABC)).map(x => x.ad)).toEqual(['Nar', 'at', 'kuş', 'top', 'masa']);
    expect(postaAdaylari(havuz, harfler('anrt')).map(x => x.ad)).toEqual(['Nar', 'at']);
    expect(postaAdaylari(havuz, harfler('ne'))).toEqual([]);
  });
  it('tek heceli sözcükler (jip, kuş, mum) zarfa girer', () => {
    expect(postaAdaylari([s('jip'), s('kuş'), s('mum')], harfler(ABC))).toHaveLength(3);
  });
  it('oturumda 3 zarf, tekrar yok, önce hiç görülmeyenler', () => {
    const ad = ['nar', 'at', 'top', 'kuş', 'mum'].map(s);
    for (let i = 0; i < 20; i++) {
      const o = postaOturumu(ad, { nar: 3, at: 1 }).map(x => x.id);
      expect(o).toHaveLength(OTURUM_ZARF);
      expect(new Set(o).size).toBe(OTURUM_ZARF);
      expect([...o].sort()).toEqual(['kuş', 'mum', 'top']);
    }
  });
  it('çeldirici bilinen bir harf ve sözcükte yok', () => {
    for (let i = 0; i < 30; i++) {
      const c = celdirici('nar', harfler('anrtek'))!;
      expect(['t', 'e', 'k']).toContain(c);
    }
    expect(celdirici('nar', harfler('anr'))).toBeUndefined();
  });
  it('pul sesleri: ünsüz tek başına okunmaz, ünlüyle birleşince hece duyulur, son harfte sözcük okunur', () => {
    const hepsi = () => true;
    expect(pulSesleri('nar', hepsi, heceSesi)).toEqual([undefined, 'ev-n-a', undefined]);
    expect(pulSesleri('at', hepsi, heceSesi)).toEqual([unluSesi('a'), undefined]);
    expect(pulSesleri('kuş', hepsi, heceSesi)).toEqual([undefined, 'ev-k-u', undefined]);
    expect(pulSesleri('erik', hepsi, heceSesi)).toEqual([unluSesi('e'), undefined, 'ev-r-i', undefined]);
    expect(pulSesleri('elma', hepsi, heceSesi)).toEqual([unluSesi('e'), 'pano-hece-el', undefined, undefined]);
    expect(pulSesleri('şişe', hepsi, heceSesi)).toEqual([undefined, 'ev-ss-i', undefined, undefined]);
    // Kaydı olmayan ses sessiz geçer (yalnız "küt").
    expect(pulSesleri('elma', id => id !== 'pano-hece-el', heceSesi)[1]).toBeUndefined();
  });
  it('kullanılan ünlü ve açık hece kayıtları diskte', () => {
    for (const u of 'aeıioöuü') expect(kayitVar(unluSesi(u)), u).toBe(true);
    for (const id of ['ev-n-a', 'ev-k-u', 'ev-r-i', 'ev-ss-i', 'ev-t-o']) expect(kayitVar(id), id).toBe(true);
  });
});
