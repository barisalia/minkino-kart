import { describe, expect, it } from 'vitest';
import P from '../../content/pazar.json';
import { normal, tumCumleler } from '../../src/audio/cumleler';
import { kart } from '../../src/engine/katalog';
import { YASLAR } from '../../src/engine/types';
import { agirlik, AGIRLIK, denetle, istekUret, musteriSayisi, PARA, paraMi, pazarCumleleri, PLAN, urunGrubu, urunRengi, uygunMu, type Istek } from '../../pazar/src/istek';
import { MEYVE_RENGI } from '../../pazar/src/meyvesuyu';
import { SAYILAN } from '../../pazar/src/sarki-plan';
import { TART_MEYVELER } from '../../pazar/src/tart';

/** Tekrarlanabilir rastgele sayı (mulberry32) */
function tohumlu(t: number) {
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Her yaş × her müşteri sırası × birçok tohum */
function hepsi(): Istek[] {
  const l: Istek[] = [];
  for (const y of YASLAR) for (let s = 0; s < musteriSayisi(y); s++) for (let t = 1; t <= 60; t++) l.push(istekUret(y, s, tohumlu(t * 97 + s)));
  return l;
}

/** Bir turun bütün istekleri, oyundaki gibi sırayla (her istek öncekileri bilir) */
function birTur(y: (typeof YASLAR)[number], t: number): Istek[] {
  const rnd = tohumlu(t * 131 + y);
  const tur: Istek[] = [];
  for (let s = 0; s < musteriSayisi(y); s++) tur.push(istekUret(y, s, rnd, undefined, tur));
  return tur;
}

/** İsteği doğru karşılayan sepet (tezgâhtan seçilerek) */
function dogruSepet(ist: Istek): string[] {
  if (ist.tur === 'terazi') {
    // tezgâhtan, ağır olandan başlayarak hedef ağırlığı tam tutturan bir seçim
    let kalan = (ist.sol ?? []).reduce((a, id) => a + agirlik(id), 0);
    const s: string[] = [];
    for (const id of [...ist.tezgah].sort((a, b) => agirlik(b) - agirlik(a))) {
      if (agirlik(id) <= kalan) {
        s.push(id);
        kalan -= agirlik(id);
      }
    }
    return s;
  }
  if (ist.tur === 'ode') {
    const lira = ist.lira ?? 0;
    const bes = Math.floor(lira / 5);
    return [...Array.from({ length: bes }, () => 'para-5'), ...Array.from({ length: lira - bes * 5 }, () => 'para-1')];
  }
  return Object.entries(ist.istenen).flatMap(([id, n]) => Array.from({ length: n }, () => id));
}

describe('pazar: istek üretme', () => {
  it('yaş planı: 2–3 yaşta 3, büyüklerde 4 müşteri; aynı tür en çok iki kez, arka arkaya gelmez; yaşa uygun türler', () => {
    for (const y of YASLAR) {
      expect(PLAN[y]).toHaveLength(musteriSayisi(y));
      expect(musteriSayisi(y)).toBe(y === 3 ? 3 : 4);
      if (y === 3) continue;
      for (const t of new Set(PLAN[y])) expect(PLAN[y].filter((x) => x === t).length, `${y} yaş ${t}`).toBeLessThanOrEqual(2);
      PLAN[y].forEach((t, i) => i > 0 && expect(t, `${y} yaş ${i}. müşteri`).not.toBe(PLAN[y][i - 1]));
    }
    expect(new Set(PLAN[3])).toEqual(new Set(['tek']));
    expect(new Set(PLAN[4])).toEqual(new Set(['renk', 'sayi']));
    expect(new Set(PLAN[5])).toEqual(new Set(['iki', 'ayir', 'terazi']));
    expect(new Set(PLAN[6])).toEqual(new Set(['toplama', 'ode', 'terazi']));
  });

  it('bir turda istenen ürün, renk, sayı ve tutar yinelenmez (çeşit); her istek yine tezgâhla yapılabilir', () => {
    for (const y of YASLAR) {
      for (let t = 1; t <= 200; t++) {
        const tur = birTur(y, t);
        const urunler = tur.filter((i) => ['tek', 'sayi', 'iki', 'toplama'].includes(i.tur)).flatMap((i) => Object.keys(i.istenen));
        expect(new Set(urunler).size, `${y} yaş: ${urunler.join()}`).toBe(urunler.length);
        const renkler = tur.filter((i) => i.tur === 'renk').map((i) => i.renk);
        expect(new Set(renkler).size).toBe(renkler.length);
        const sayilar = tur.filter((i) => i.tur === 'sayi').map((i) => Object.values(i.istenen)[0]);
        expect(new Set(sayilar).size).toBe(sayilar.length);
        const liralar = tur.filter((i) => i.tur === 'ode').map((i) => i.lira);
        expect(new Set(liralar).size).toBe(liralar.length);
        // aynı cümle bir turda en çok iki kez
        const sozler = tur.flatMap((i) => i.soz);
        for (const s of new Set(sozler)) expect(sozler.filter((x) => x === s).length, s).toBeLessThanOrEqual(2);
        for (const ist of tur) expect(denetle(ist, dogruSepet(ist))).toBe('tamam');
      }
    }
  });

  it('3 yaş: tek ürün, tezgâhta 3 farklı seçenek', () => {
    for (let t = 1; t <= 100; t++) {
      const ist = istekUret(3, t % 5, tohumlu(t));
      expect(ist.tur).toBe('tek');
      expect(ist.tezgah).toHaveLength(3);
      expect(new Set(ist.tezgah).size).toBe(3);
      const [u] = Object.keys(ist.istenen);
      expect(ist.istenen[u]).toBe(1);
      expect(ist.tezgah).toContain(u);
      expect(ist.dugmeli).toBe(false);
    }
  });

  it('K3: 3 yaşta tezgâhta istenenle aynı renkte bir tuzak ürün var (resme dikkatle bakmak gerekir)', () => {
    for (let t = 1; t <= 100; t++) {
      const ist = istekUret(3, 0, tohumlu(t));
      const [u] = Object.keys(ist.istenen);
      expect(ist.tezgah.filter((x) => x !== u && urunRengi(x) === urunRengi(u)).length, ist.tezgah.join()).toBeGreaterThanOrEqual(1);
      expect(ist.resimsiz).toBeFalsy();
    }
  });

  it('K3: 5-6 yaşta iki ürün ve toplama isteğinde balon resimsiz (müşteri söyler), 3-4 yaşta resimli', () => {
    for (let t = 1; t <= 40; t++) {
      expect(istekUret(5, 0, tohumlu(t)).resimsiz).toBe(true);
      expect(istekUret(6, 0, tohumlu(t)).resimsiz).toBe(true);
      expect(istekUret(4, 0, tohumlu(t)).resimsiz).toBeFalsy();
      expect(istekUret(4, 0, tohumlu(t), 'iki').resimsiz).toBeFalsy();
    }
  });

  it('4 yaş renk: tezgâhta istenen renkte tam bir ürün var', () => {
    for (let t = 1; t <= 100; t++) {
      const ist = istekUret(4, 1, tohumlu(t));
      expect(ist.tur).toBe('renk');
      expect(ist.tezgah.filter((id) => urunRengi(id) === ist.renk)).toHaveLength(1);
      expect(new Set(ist.tezgah.map(urunRengi)).size).toBe(3);
    }
  });

  it('sayılar yaşa uygun: 4 yaş 1-5, 5 yaş 1-3, 6 yaş toplam en çok 5', () => {
    for (const ist of hepsi()) {
      if (ist.tur === 'sayi') {
        const n = Object.values(ist.istenen)[0];
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(5);
      }
      if (ist.tur === 'iki') for (const n of Object.values(ist.istenen)) expect(n).toBeLessThanOrEqual(3);
      if (ist.tur === 'toplama') {
        const daha = Object.values(ist.istenen)[0];
        expect(ist.bende).toBeGreaterThanOrEqual(1);
        expect(daha).toBeGreaterThanOrEqual(1);
        expect((ist.bende ?? 0) + daha).toBeLessThanOrEqual(5);
      }
      if (ist.tur === 'ode') {
        expect(ist.lira).toBeGreaterThanOrEqual(2);
        expect(ist.lira).toBeLessThanOrEqual(9);
      }
    }
  });

  it('her istek tezgâhtakilerle yapılabilir (kilitlenme yok) ve tezgâh taşmaz', () => {
    for (const ist of hepsi()) {
      expect(ist.tezgah.length).toBeLessThanOrEqual(9);
      const sepet = dogruSepet(ist);
      const kalan = ist.tezgah.slice();
      for (const id of sepet) {
        const i = kalan.indexOf(id);
        expect(i, `${ist.tur}: ${id} tezgâhta yok`).toBeGreaterThanOrEqual(0);
        kalan.splice(i, 1);
      }
      for (const id of sepet) expect(uygunMu(ist, id)).toBe(true);
      expect(denetle(ist, sepet)).toBe('tamam');
    }
  });

  it('5 yaş ayırma: 3 meyve + 3 sebze, istenen hep aynı gruptan', () => {
    for (let t = 1; t <= 60; t++) {
      const ist = istekUret(5, 1, tohumlu(t));
      expect(ist.tur).toBe('ayir');
      expect(ist.tezgah.filter((id) => urunGrubu(id) === 'meyve')).toHaveLength(3);
      expect(ist.tezgah.filter((id) => urunGrubu(id) === 'sebze')).toHaveLength(3);
      for (const id of Object.keys(ist.istenen)) expect(urunGrubu(id)).toBe(ist.grup);
    }
  });

  it('bütün ürünler kart kataloğunda, renk ve grup bilgisiyle', () => {
    const ids = new Set([...P.urunler.say, ...P.urunler.meyve, ...P.urunler.sebze, ...Object.values(P.renkler).flat()]);
    for (const id of ids) {
      expect(kart(id), id).toBeDefined();
      expect(urunGrubu(id), id).toBeDefined();
    }
    for (const [renk, l] of Object.entries(P.renkler)) for (const id of l) expect(urunRengi(id), id).toBe(renk);
    for (const g of ['meyve', 'sebze'] as const) for (const id of P.urunler[g]) expect(urunGrubu(id), id).toBe(g);
  });

  it('kullanılan her çizim var (oyunda yer tutucu yok: renkli daire, kodla çizilmiş meyve, CSS tezgâh)', () => {
    const gorseller = import.meta.glob(['../../assets/meyveler/*.webp', '../../assets/hayvanlar/*.webp', '../../assets/pazar/*.webp']);
    const var_ = (yol: string) => `../../assets/${yol}.webp` in gorseller;
    // ürünler, renkler, terazi (ananas, karpuz), Tart meyveleri, açılış ve şarkıdaki meyveler, Meyve Suyu meyveleri
    const meyveler = new Set([
      ...P.urunler.say, ...P.urunler.meyve, ...P.urunler.sebze, ...Object.values(P.renkler).flat(), ...Object.keys(AGIRLIK),
      ...TART_MEYVELER, ...SAYILAN.map((s) => s.meyve), 'elma', 'muz', 'cilek', 'portakal', 'havuc',
      ...Object.keys(MEYVE_RENGI).filter((m) => m !== 'yabanmersini'),
    ]);
    for (const m of meyveler) expect(var_(`meyveler/${m}`), m).toBe(true);
    // müşteriler ve uzaktan geçen yayalar (canli.ts)
    for (const m of [...P.musteriler, 'civciv', 'kaplumbaga', 'koyun', 'tavuk']) expect(var_(`hayvanlar/${m}`), m).toBe(true);
    for (const p of ['arkaplan', 'arkaplan-genis', 'tezgah', 'on-tezgah', 'sepet', 'para-1', 'para-5', 'yabanmersini', 'kompost', 'kompost-kapak', 'domates-curuk', 'terazi-kefe', 'terazi-kol', 'terazi-taban'])
      expect(var_(`pazar/${p}`), p).toBe(true);
  });
});

describe('pazar: terazi', () => {
  it('5 yaş: kefede 2-4 aynı küçük meyve; 6 yaş: ağır meyve (ananas 2 / karpuz 3) — tezgâhla her zaman dengelenir', () => {
    for (let t = 1; t <= 80; t++) {
      for (const y of [5, 6] as const) {
        const ist = istekUret(y, 2, tohumlu(t * 13 + y));
        expect(ist.tur).toBe('terazi');
        const hedef = (ist.sol ?? []).reduce((a, id) => a + agirlik(id), 0);
        if (y === 5) {
          expect(new Set(ist.sol).size).toBe(1);
          expect(hedef).toBeGreaterThanOrEqual(2);
          expect(hedef).toBeLessThanOrEqual(4);
        } else {
          expect(ist.sol?.some((id) => agirlik(id) >= 2)).toBe(true);
          expect(hedef).toBeLessThanOrEqual(4);
        }
        expect(ist.tezgah.reduce((a, id) => a + agirlik(id), 0)).toBeGreaterThanOrEqual(hedef);
        expect(denetle(ist, dogruSepet(ist))).toBe('tamam');
      }
    }
  });
  it('ağırlıklar: karpuz = 3 elma, ananas = 2; az / tamam / fazla', () => {
    const ist: Istek = { tur: 'terazi', istenen: {}, sol: ['karpuz'], tezgah: [], soz: [], yazi: '', dugmeli: false };
    expect(denetle(ist, ['elma', 'elma'])).toBe('az');
    expect(denetle(ist, ['elma', 'elma', 'elma'])).toBe('tamam');
    expect(denetle(ist, ['ananas', 'elma'])).toBe('tamam');
    expect(denetle(ist, ['ananas', 'ananas'])).toBe('fazla');
    expect(uygunMu(ist, 'elma')).toBe(true);
    expect(uygunMu(ist, 'para-1')).toBe(false);
  });
});

describe('pazar: doğru / yanlış', () => {
  const sabit = (o: Partial<Istek> & Pick<Istek, 'tur' | 'istenen'>): Istek => ({ tezgah: [], soz: [], yazi: '', dugmeli: true, ...o });

  it('tek: doğru ürün tamam, başka ürün uymaz', () => {
    const ist = sabit({ tur: 'tek', istenen: { elma: 1 }, dugmeli: false });
    expect(uygunMu(ist, 'elma')).toBe(true);
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['elma'])).toBe('tamam');
    expect(denetle(ist, [])).toBe('az');
  });

  it('renk: aynı renkteki ürün uyar', () => {
    const ist = sabit({ tur: 'renk', istenen: { cilek: 1 }, renk: 'kırmızı', dugmeli: false });
    expect(uygunMu(ist, 'cilek')).toBe(true);
    expect(uygunMu(ist, 'domates')).toBe(true);
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['cilek'])).toBe('tamam');
  });

  it('sayma: az, tamam, fazla', () => {
    const ist = sabit({ tur: 'sayi', istenen: { cilek: 3 } });
    expect(uygunMu(ist, 'muz')).toBe(false);
    expect(denetle(ist, ['cilek', 'cilek'])).toBe('az');
    expect(denetle(ist, ['cilek', 'cilek', 'cilek'])).toBe('tamam');
    expect(denetle(ist, ['cilek', 'cilek', 'cilek', 'cilek'])).toBe('fazla');
  });

  it('iki ürün: ikisi de doğru adette olmalı', () => {
    const ist = sabit({ tur: 'iki', istenen: { elma: 2, muz: 1 } });
    expect(denetle(ist, ['elma', 'elma', 'muz'])).toBe('tamam');
    expect(denetle(ist, ['muz', 'elma', 'elma'])).toBe('tamam');
    expect(denetle(ist, ['elma', 'elma'])).toBe('az');
    expect(denetle(ist, ['elma', 'muz', 'muz'])).toBe('fazla');
  });

  it('ayırma: yalnız gruptakiler uyar, hepsi konunca tamam', () => {
    const ist = sabit({ tur: 'ayir', grup: 'meyve', istenen: { elma: 1, muz: 1, kiraz: 1 }, dugmeli: false });
    expect(uygunMu(ist, 'armut')).toBe(true);
    expect(uygunMu(ist, 'havuc')).toBe(false);
    expect(denetle(ist, ['elma', 'muz'])).toBe('az');
    expect(denetle(ist, ['kiraz', 'elma', 'muz'])).toBe('tamam');
  });

  it('toplama: yalnız eklenenler sayılır', () => {
    const ist = sabit({ tur: 'toplama', istenen: { elma: 3 }, bende: 2 });
    expect(denetle(ist, ['elma', 'elma'])).toBe('az');
    expect(denetle(ist, ['elma', 'elma', 'elma'])).toBe('tamam');
  });

  it('para: 1 ve 5 liralarla toplam tutmalı', () => {
    const ist = sabit({ tur: 'ode', istenen: {}, lira: 7 });
    expect(paraMi('para-5') && PARA['para-5']).toBe(5);
    expect(uygunMu(ist, 'para-1')).toBe(true);
    expect(uygunMu(ist, 'elma')).toBe(false);
    expect(denetle(ist, ['para-5', 'para-1', 'para-1'])).toBe('tamam');
    expect(denetle(ist, ['para-1', 'para-1', 'para-1', 'para-1', 'para-1', 'para-1', 'para-1'])).toBe('tamam');
    expect(denetle(ist, ['para-5', 'para-1'])).toBe('az');
    expect(denetle(ist, ['para-5', 'para-5'])).toBe('fazla');
  });
});

describe('pazar: metinler', () => {
  const liste = new Set(tumCumleler());
  it('oyunun söyleyeceği her parça seslendirme listesinde', () => {
    for (const ist of hepsi()) for (const p of ist.soz) expect(liste.has(normal(p)), p).toBe(true);
    for (const p of pazarCumleleri()) expect(liste.has(normal(p)), p).toBe(true);
  });
  it('kısa: cümle ≤ 30 karakter, soru ≤ 6 kelime; arayüz yazısı ≤ 30 karakter', () => {
    for (const c of pazarCumleleri()) {
      expect(c.length, c).toBeLessThanOrEqual(30);
      expect(c.split(/\s+/).length, c).toBeLessThanOrEqual(6);
    }
    for (const t of Object.values(P.arayuz)) expect(t.length, t).toBeLessThanOrEqual(30);
  });
  it('"sıfır" hiç söylenmez', () => {
    for (const c of pazarCumleleri()) expect(c.toLocaleLowerCase('tr')).not.toContain('sıfır');
  });
});
