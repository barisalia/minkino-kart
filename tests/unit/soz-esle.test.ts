import { describe, expect, it } from 'vitest';
import { anahtarSozler, normalMetin, sesKalibi, sozEslesti, uzaklik } from '../../src/audio/soz-esle';

const en = { dil: 'en-US' as const };
const tr = { dil: 'tr-TR' as const };

describe('söz eşleme: yalnız söylenen sözcük kabul edilir', () => {
  it('tam sözcük ve cümle içinde sözcük kabul edilir', () => {
    expect(sozEslesti(['cat'], 'cat', en)).toBe(true);
    expect(sozEslesti(['Cat.'], 'cat', en)).toBe(true);
    expect(sozEslesti(["it's a cat"], 'cat', en)).toBe(true);
    expect(sozEslesti(['bu bir kedi'], 'kedi', tr)).toBe(true);
  });

  it('başka sözcük kabul edilmez (eski sorun: her şey geçiyordu)', () => {
    expect(sozEslesti(['table'], 'cat', en)).toBe(false);
    expect(sozEslesti(['hello'], 'dog', en)).toBe(false);
    expect(sozEslesti(['cow'], 'cat', en)).toBe(false);
    expect(sozEslesti(['bat'], 'cat', en)).toBe(false);
    expect(sozEslesti(['duck'], 'dog', en)).toBe(false);
    expect(sozEslesti(['masa'], 'kedi', tr)).toBe(false);
    expect(sozEslesti([''], 'cat', en)).toBe(false);
    expect(sozEslesti([], 'cat', en)).toBe(false);
  });

  it('çocuk söyleyişi ve tanıyıcının yazım seçenekleri hoş görülür', () => {
    expect(sozEslesti(['kat'], 'cat', en)).toBe(true);
    expect(sozEslesti(['doc'], 'dog', en)).toBe(true);
    expect(sozEslesti(['ship'], 'sheep', en)).toBe(true);
    expect(sozEslesti(['chiken'], 'chicken', en)).toBe(true);
    expect(sozEslesti(['horse'], 'horse', en)).toBe(true);
    expect(sozEslesti(['hors'], 'horse', en)).toBe(true);
    expect(sozEslesti(['tank you'], 'thank you', en)).toBe(true);
    expect(sozEslesti(['kelebek'], 'kelebek', tr)).toBe(true);
    expect(sozEslesti(['agac'], 'ağaç', tr)).toBe(true);
    expect(sozEslesti(['Ilık'], 'ılık', tr)).toBe(true);
  });

  it('en olası 5 seçenekten biri tutarsa yeter', () => {
    expect(sozEslesti(['cut', 'cap', 'cat'], 'cat', en)).toBe(true);
    expect(sozEslesti(['table', 'tablet'], 'cat', en)).toBe(false);
  });

  it('aynı dersin öbür sözcüğüne daha yakınsa reddedilir', () => {
    const rakipler = ['cat', 'cow', 'dog', 'duck', 'pig', 'sheep', 'horse', 'chicken'];
    expect(sozEslesti(['cow'], 'cat', { ...en, rakipler })).toBe(false);
    expect(sozEslesti(['pig'], 'dog', { ...en, rakipler })).toBe(false);
    expect(sozEslesti(['cat'], 'cat', { ...en, rakipler })).toBe(true);
    expect(sozEslesti(['kat'], 'cat', { ...en, rakipler })).toBe(true);
    expect(sozEslesti(['doc'], 'dog', { ...en, rakipler })).toBe(true);
  });

  it('cümle: anahtar sözcükler yeter, bağlaçlar aranmaz; eksik ya da yanlış anahtar sözcük geçmez', () => {
    expect(sozEslesti(['a big cow'], 'A big cow.', en)).toBe(true);
    expect(sozEslesti(['big cow'], 'A big cow.', en)).toBe(true);
    expect(sozEslesti(["it's a big cow"], 'A big cow.', en)).toBe(true);
    expect(sozEslesti(['cow'], 'A big cow.', en)).toBe(false);
    expect(sozEslesti(['a small cow'], 'A big cow.', en)).toBe(false);
    expect(sozEslesti(['table'], 'A big cow.', en)).toBe(false);
    expect(sozEslesti(['Kino is at the farm'], 'Kino is at the farm.', en)).toBe(true);
    expect(sozEslesti(['keno farm'], 'Kino is at the farm.', en)).toBe(true);
    expect(sozEslesti(['kino'], 'Kino is at the farm.', en)).toBe(false);
    expect(sozEslesti(['I like apples'], 'I like apples.', en)).toBe(true);
    expect(sozEslesti(['I like bananas'], 'I like apples.', en)).toBe(false);
    expect(sozEslesti(['goodbye cow goodbye duck'], 'Goodbye, cow! Goodbye, duck!', en)).toBe(true);
    expect(sozEslesti(['hello'], 'Goodbye, cow! Goodbye, duck!', en)).toBe(false);
    expect(anahtarSozler('Where is the ball?', 'en-US')).toEqual(['where', 'ball']);
  });

  it('birden çok kabul edilen biçim', () => {
    expect(sozEslesti(['icecream'], ['ice cream', 'icecream'], en)).toBe(true);
    expect(sozEslesti(['ice cream please'], ['ice cream'], en)).toBe(true);
  });

  it('yardımcılar', () => {
    expect(normalMetin('  İYİ   Günler! ', 'tr-TR')).toBe('iyi günler');
    expect(normalMetin("It's", 'en-US')).toBe('its');
    expect(sesKalibi('cat', 'en-US')).toBe(sesKalibi('kat', 'en-US'));
    expect(sesKalibi('sheep', 'en-US')).toBe(sesKalibi('ship', 'en-US'));
    expect(uzaklik('kitten', 'sitting')).toBe(3);
  });
});
