import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UNITELER, kelimeBul } from '../../ingilizce/src/icerik';
import {
  BILMECELER, FARKLI_TURLAR, IPUCU_UYANLAR, KATEGORILER, bilmeceKimlikleri, bilmeceSoruSesi, celdiriciOlamaz, ipucunaUyanlar, soruMetni, bilmeceOturumSesleri, bilmecePlani, bilmeceSesMetinleri, farkliOturumSesleri, farkliPlani,
} from '../../ingilizce/src/adimlar/bilmece-veri';

// Polly's Riddles ve Odd One Out (21 Kasım 2026, ingilizce/src/adimlar/bilmece-veri.ts)
const tohum = (n: number) => () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
const hepsi = new Set(UNITELER.map((u) => u.id));

describe('ingilizce · bilmece ve farklı olan', () => {
  it('en az 40 bilmece ve 30 tur; her kelime kendi adasında, cümleler kısa', () => {
    expect(BILMECELER.length).toBeGreaterThanOrEqual(40);
    expect(FARKLI_TURLAR.length).toBeGreaterThanOrEqual(30);
    for (const x of BILMECELER) {
      const u = UNITELER.find((y) => y.id === x.ada)!;
      expect(u.kelimeler.some((w) => w.id === x.hedef), `${x.ada}/${x.hedef}`).toBe(true);
      for (const m of x.ipuclari) expect(m.split(/\s+/).length, m).toBeLessThanOrEqual(6);
    }
    for (const [k, v] of Object.entries(KATEGORILER)) for (const [w, a] of v.kelimeler) expect(UNITELER.find((u) => u.id === a)?.kelimeler.some((x) => x.id === w), `${k}/${w}`).toBe(true);
    for (const t of FARKLI_TURLAR) expect(kelimeBul(t.farkli), t.farkli).toBeTruthy();
  });

  it('bilmece oturumu: dört bilmece, üç seçenek, doğru cevap içinde; önceki oturumdakiler tekrar gelmez; yalnız izinli adalar', () => {
    const ilk = bilmecePlani(hepsi, [], '4', tohum(1));
    expect(ilk).toHaveLength(4);
    for (const t of ilk) { expect(t.secenekler).toHaveLength(3); expect(t.secenekler).toContain(t.bilmece.hedef); expect(new Set(t.secenekler).size).toBe(3); }
    for (let s = 2; s < 20; s++) {
      const sonraki = bilmecePlani(hepsi, bilmeceKimlikleri(ilk), '5+', tohum(s));
      expect(bilmeceKimlikleri(sonraki).filter((id) => bilmeceKimlikleri(ilk).includes(id)), `tohum ${s}`).toEqual([]);
    }
    const az = bilmecePlani(new Set(['ciftlik', 'yiyecekler']), [], '4', tohum(3));
    expect(az.every((t) => ['ciftlik', 'yiyecekler'].includes(t.bilmece.ada))).toBe(true);
  });

  it('her ipucunun uyanlar listesi var, hedefini içerir, yalnız bilmece kelimeleri', () => {
    const kelimeler = new Set(BILMECELER.map((x) => x.hedef));
    for (const x of BILMECELER) for (const m of x.ipuclari) {
      expect(m === 'It is not a fruit.' || m in IPUCU_UYANLAR, `liste yok: ${m}`).toBe(true);
      expect(ipucunaUyanlar(m), `${x.hedef}: ${m}`).toContain(x.hedef);
    }
    for (const [m, l] of Object.entries(IPUCU_UYANLAR)) for (const w of l) expect(kelimeler.has(w), `${m} → ${w}`).toBe(true);
  });

  it('56 bilmecenin hiçbirinde iki doğru cevap yok: çeldiriciler hiçbir ipucuna uymaz, başka adadan', () => {
    const adalar = [...new Set(BILMECELER.map((x) => x.ada))];
    const izinler: Set<string>[] = [hepsi, ...adalar.map((a, i) => new Set([a, adalar[(i + 1) % adalar.length], adalar[(i + 5) % adalar.length]]))];
    const gorulen = new Set<string>();
    for (const izin of izinler) for (let s = 1; s < 120; s++) for (const t of bilmecePlani(izin, [], '4', tohum(s))) {
      gorulen.add(t.bilmece.hedef);
      const yasak = celdiriciOlamaz(t.bilmece);
      const dogrular = t.secenekler.filter((w) => t.bilmece.ipuclari.every((m) => ipucunaUyanlar(m).includes(w)));
      expect(dogrular, `${t.bilmece.hedef}: ${t.secenekler.join(', ')}`).toEqual([t.bilmece.hedef]);
      for (const w of t.secenekler) if (w !== t.bilmece.hedef) {
        expect(yasak.has(w), `${t.bilmece.ipuclari.join(' ')} → çeldirici ${w}`).toBe(false);
        expect(BILMECELER.find((x) => x.hedef === w)!.ada, `${t.bilmece.hedef}/${w}`).not.toBe(t.bilmece.ada);
      }
    }
    expect(gorulen.size).toBe(BILMECELER.length);
    // örnekler: balon uçar, süt soğuk ve beyaz
    expect(celdiriciOlamaz(BILMECELER.find((x) => x.hedef === 'plane')!).has('balloon')).toBe(true);
    expect(celdiriciOlamaz(BILMECELER.find((x) => x.hedef === 'snow')!).has('milk')).toBe(true);
  });

  it('çoğul bilmecelerde soru What are they?', () => {
    const cogul = BILMECELER.filter((x) => soruMetni(x) === 'What are they?').map((x) => x.hedef).sort();
    expect(cogul).toEqual(['ears', 'eyes', 'grapes', 'shoes', 'socks']);
    for (const x of BILMECELER) expect(bilmeceSoruSesi(x)).toBe(cogul.includes(x.hedef) ? 'en/g-what-are-they' : 'en/g-what-is-it');
  });

  it('farklı olan: dört tur, kategoriler farklı; 2–3 yaşta üç kart, büyüklerde dört; farklı kelime tek', () => {
    for (const [yas, adet] of [['2-3', 3], ['4', 4], ['5+', 4]] as const) for (let s = 1; s < 10; s++) {
      const turlar = farkliPlani(hepsi, yas, tohum(s));
      expect(turlar).toHaveLength(4);
      expect(new Set(turlar.map((t) => t.tur.kategori)).size).toBe(4);
      for (const t of turlar) {
        expect(t.kartlar).toHaveLength(adet);
        expect(t.kartlar.filter((w) => KATEGORILER[t.tur.kategori].kelimeler.some(([x]) => x === w))).toHaveLength(adet - 1);
      }
    }
    expect(farkliPlani(new Set(['ciftlik']), '4', tohum(1))).toEqual([]);
  });

  it('kayıtlar diskte: bütün yeni sözler ve oturumların çaldığı her şey', () => {
    expect(bilmeceSesMetinleri().filter((s) => !existsSync(`assets/ingilizce/ses/${s.id}.mp3`)).map((s) => s.id)).toEqual([]);
    const eksik = new Set<string>();
    for (let s = 1; s < 30; s++) {
      for (const id of [...bilmeceOturumSesleri(bilmecePlani(hepsi, [], '4', tohum(s))), ...farkliOturumSesleri(farkliPlani(hepsi, '4', tohum(s)))]) if (!existsSync(`assets/ingilizce/ses/${id}.mp3`)) eksik.add(id);
    }
    expect([...eksik]).toEqual([]);
  });
});
