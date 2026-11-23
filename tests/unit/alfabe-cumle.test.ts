import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { isaretleri, acikOykuler, cizimVar, cumleDurumu, cumleler, gorunur, kadrodan, oykuler, yaptirAcilir, harfleri, okunabilir, bilinenHarfler, okunacaklar, sozcukKaydi, sozcukleri, yasaUygun } from '../../alfabe/src/cumle-okuma-kurallari';
import { SES_GRUPLARI } from '../../alfabe/src/harf-sirasi';
import harfListesi from '../../alfabe/src/harfler.json';

// Bir metnin ses grubu: içindeki harflerin en geç geldiği grup (1…5), harf-sirasi.ts'e göre.
const harfGrubu = (h: string) => SES_GRUPLARI.findIndex((g) => g.some((id) => harfListesi.find((x) => x.id === id)!.lower === h)) + 1;
const metinGrubu = (m: string) => Math.max(...harfleri(m).map(harfGrubu));

describe("Ceren'le oku · okuma kitaplığı (beş ses grubu, beş öykü)", () => {
  it('her ses grubunda en az 12 yeni cümle (cumle-40…99), kolaydan zora; hepsi yalnız o gruba kadarki harflerle', () => {
    const yeni = cumleler.filter((c) => Number(c.id.slice(6)) >= 40 && Number(c.id.slice(6)) <= 99);
    expect(yeni).toHaveLength(60);
    for (let g = 1; g <= 5; g++) {
      const grup = yeni.slice((g - 1) * 12, g * 12);
      expect(grup.map((c) => metinGrubu(c.metin)), 'grup ' + g).toEqual(Array(12).fill(g));
      // Kolaydan zora: grubun ilk cümlesi bir sözcük, son cümlesi en az üç.
      expect(sozcukleri(grup[0].metin)).toHaveLength(1);
      expect(sozcukleri(grup[11].metin).length).toBeGreaterThanOrEqual(3);
    }
  });
  it('yeni cümle sahnesi gelmeden görünmez; geçici resmi olan eski cümle görünür', () => {
    for (const c of cumleler) expect(gorunur(c), c.id).toBe(!!c.gecici || cizimVar(c.id));
    const hepsi = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));
    expect(okunacaklar(hepsi, '5+').every((c) => !!c.gecici || cizimVar(c.id))).toBe(true);
  });
  it('yirmi öykü (1. grupta iki, 2. grupta beş, 3–4. gruplarda dört, 5. grupta beş; H16 ile 11–20 eklendi), dörder sayfa; her sayfa kendi grubuna kadarki harflerle, en çok dört sözcük; son sayfa okuduğunu yaptır', () => {
    expect(oykuler.map((o) => o.grup)).toEqual([1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5]);
    expect(oykuler.map((o) => o.id)).toEqual(Array.from({ length: 20 }, (_, i) => 'oyku-' + (i + 1)));
    expect(oykuler.some((o) => o.sayfalar.some((s) => /çilek/i.test(s.metin)))).toBe(false);
    for (const o of oykuler) {
      expect(o.sayfalar, o.id).toHaveLength(4);
      for (const s of o.sayfalar) {
        expect(metinGrubu(s.metin), s.id).toBeLessThanOrEqual(o.grup);
        expect(sozcukleri(s.metin).length, s.id).toBeLessThanOrEqual(4);
      }
      expect(o.sayfalar.map((s) => !!s.yaptir)).toEqual([false, false, false, true]);
    }
  });
  it('öykü yalnız kendi grubuna kadarki bütün harfler bitince (5+) ve çizimleriyle açılır; test kipinde çizimsiz', () => {
    const birinci = SES_GRUPLARI[0] as string[];
    expect(acikOykuler(birinci, '5+', true).map((o) => o.id)).toEqual(['oyku-1']);
    // 2. cilt: grubun ikinci öyküsü, ilk öykü okununca açılır
    expect(acikOykuler(birinci, '5+', true, ['oyku-1']).map((o) => o.id)).toEqual(['oyku-1', 'oyku-6']);
    expect(acikOykuler(birinci.slice(0, 5), '5+', true)).toEqual([]);
    expect(acikOykuler(SES_GRUPLARI.flat() as string[], '5+', true)).toHaveLength(5);
    expect(acikOykuler(SES_GRUPLARI.flat() as string[], '5+', true, oykuler.slice(0, 5).map((o) => o.id))).toHaveLength(10);
    // 3. ve sonraki öyküler: gruptaki öncekilerin hepsi okununca (H16)
    expect(acikOykuler(SES_GRUPLARI.flat() as string[], '5+', true, oykuler.slice(0, 10).map((o) => o.id)).map((o) => o.id)).toEqual([...oykuler.slice(0, 10).map((o) => o.id), 'oyku-11', 'oyku-14', 'oyku-16', 'oyku-18']);
    expect(acikOykuler(SES_GRUPLARI.flat() as string[], '5+', true, oykuler.map((o) => o.id))).toHaveLength(20);
    // çizimi gelmemiş öykü gerçek uygulamada görünmez
    for (const o of oykuler) if (!o.sayfalar.every((s) => cizimVar(s.id))) expect(acikOykuler(SES_GRUPLARI.flat() as string[], '5+', false, oykuler.map((x) => x.id)).map((x) => x.id)).not.toContain(o.id);
    expect(acikOykuler(SES_GRUPLARI.flat() as string[], '4', true)).toEqual([]);
    for (const o of acikOykuler(SES_GRUPLARI.flat() as string[], '5+')) for (const s of o.sayfalar) expect(cizimVar(s.id), s.id).toBe(true);
  });
  it('her öykü sayfasının ve sözcüğünün Ceren kaydı var; sözcük zamanları kayda oturuyor', () => {
    const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');
    for (const s of oykuler.flatMap((o) => o.sayfalar)) {
      expect(kayit(s.id), s.id).toBe(true);
      for (const w of sozcukleri(s.metin)) expect(kayit(sozcukKaydi(w)), sozcukKaydi(w)).toBe(true);
      expect(s.zamanlar, s.id).toHaveLength(sozcukleri(s.metin).length);
    }
    expect(kayit('cumle-oyku-uyandi')).toBe(true);
  });
});

describe("Ceren'le oku · okunabilirlik ve yaş kuralları", () => {
  it('144 cümle (H17 ile cumle-100…144 eklendi), kimlikleri tekil; ücretsiz A, N, E, T cümleleri başta; çilek yok', () => {
    expect(cumleler).toHaveLength(144);
    expect(cumleler.map((c) => c.id).sort()).toEqual(Array.from({ length: 144 }, (_, i) => 'cumle-' + String(i + 1).padStart(2, '0')).sort());
    expect(cumleler.slice(0, 5).map((c) => c.metin)).toEqual(['Anne.', 'At.', 'Nane tat.', 'Anne nane tat.', 'Anne, tat!']);
    expect(cumleler.some((c) => /çilek/i.test(c.metin))).toBe(false);
  });
  it('cümle yalnız bitirilen harflerden kuruluysa gösterilir', () => {
    const anne = cumleler.find((c) => c.metin === 'Anne bal al.')!;
    expect(harfleri(anne.metin).sort()).toEqual(['a', 'b', 'e', 'l', 'n']);
    // A (01), B (02), E (06), L (15), N (17)
    expect(okunabilir(anne, bilinenHarfler(['01', '02', '06', '15', '17']))).toBe(true);
    expect(okunabilir(anne, bilinenHarfler(['01', '02', '06', '15']))).toBe(false);
    // Büyük ve küçük İ/ı ayrı harflerdir: "aldı" için I (11) gerekir.
    const baba = cumleler.find((c) => c.metin === 'Baba bal aldı.')!;
    expect(okunabilir(baba, bilinenHarfler(['01', '02', '05', '15']))).toBe(false);
    expect(okunabilir(baba, bilinenHarfler(['01', '02', '05', '11', '15']))).toBe(true);
    expect(okunacaklar([], '5+')).toEqual([]);
  });
  it('4 yaş bir ya da iki sözcük okur, 5+ iki ile dört sözcük; 2–3 yaşta bölüm yok', () => {
    const hepsi = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));
    const dort = okunacaklar(hepsi, '4'), bes = okunacaklar(hepsi, '5+');
    expect(dort.length).toBeGreaterThanOrEqual(3);
    expect(dort.every((c) => sozcukleri(c.metin).length <= 2)).toBe(true);
    expect(bes.every((c) => { const n = sozcukleri(c.metin).length; return n >= 2 && n <= 4; })).toBe(true);
    expect(cumleler.some((c) => yasaUygun(c, '2-3'))).toBe(false);
  });
  it('her cümle, sözcük ve yönergenin Ceren kaydı var; sözcük zamanları kayda oturuyor', () => {
    const kayit = (id: string) => existsSync('assets/alfabe/ses/' + id + '.mp3');
    for (const c of cumleler) {
      expect(kayit(c.id), c.id).toBe(true);
      for (const s of sozcukleri(c.metin)) expect(kayit(sozcukKaydi(s)), sozcukKaydi(s)).toBe(true);
      expect(c.zamanlar, c.id).toHaveLength(sozcukleri(c.metin).length);
      expect(c.zamanlar![0]).toBe(0);
      for (let i = 1; i < c.zamanlar!.length; i++) expect(c.zamanlar![i]).toBeGreaterThan(c.zamanlar![i - 1] + 150);
    }
    for (const y of ['ben', 'sen', 'tumu', 'bitti']) expect(kayit('cumle-yonerge-' + y)).toBe(true);
    for (const k of ['cumle-kart', 'cumle-kart-bos', 'cumle-yaptir', 'cumle-yaptir-tekrar']) expect(kayit(k), k).toBe(true);
  });
  it('ücretsiz dört harf (A, N, E, T) bölümü açar: her yaşta en az üç cümle; kadro cümlesi önde', () => {
    const ucretsiz = ['01', '17', '06', '24'];
    expect(okunacaklar(ucretsiz, '4').map((c) => c.metin)).toEqual(['Anne.', 'Anne, tat!', 'At.', 'Nane tat.']);
    expect(okunacaklar(ucretsiz, '5+').map((c) => c.metin)).toEqual(['Anne nane tat.', 'Anne, tat!', 'Nane tat.']);
    expect(cumleDurumu(ucretsiz, '4')).toEqual({ acik: 4, eksikHarfler: [] });
    // Eski ücretsiz harflerle (A, B, C, Ç) bitirmiş çocuk da "Baba." ve "Baba aç."ı okur.
    expect(okunacaklar(['01', '02', '03', '04'], '4').map((c) => c.metin)).toEqual(['Baba.', 'Baba aç.']);
  });
  it('cumleDurumu: cümle yoksa en yakın cümle ve kalan harfler ses grubu sırasıyla (harf-sirasi.ts)', () => {
    expect(cumleDurumu([], '4')).toMatchObject({ acik: 0, eksikHarfler: ['A', 'N', 'E'] });
    expect(cumleDurumu([], '4').enYakin?.metin).toBe('Anne.');
    // Az harfli ama sırada geride kalan cümle ("Bal al.": B 4. grupta) en yakın sayılmaz.
    expect(cumleDurumu(['01', '17'], '5+').enYakin?.metin).toBe('Anne nane tat.');
    expect(cumleDurumu([], '5+')).toMatchObject({ acik: 0, eksikHarfler: ['A', 'N', 'E', 'T'] });
    expect(cumleDurumu([], '5+').enYakin?.metin).toBe('Anne nane tat.');
    expect(cumleDurumu(['01'], '5+').eksikHarfler).toEqual(['N', 'E', 'T']);
    // Sıra dışarıdan verilirse kalan harfler o sırayla gelir.
    expect(cumleDurumu(['01'], '5+', ['24', '06', '17', '01']).eksikHarfler).toEqual(['T', 'E', 'N']);
    expect(cumleDurumu(['01', '02'], '4').acik).toBe(1);
    expect(cumleDurumu(Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0')), '2-3')).toEqual({ acik: 0, eksikHarfler: [] });
  });
  it('kadro cümleleri önde; harf sırası değişse de cümle yalnız kendi harfleri bitince açılır', () => {
    const hepsi = Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0'));
    const liste = okunacaklar(hepsi, '5+');
    const ilkYabanci = liste.findIndex((c) => !kadrodan(c));
    expect(ilkYabanci).toBeGreaterThan(0);
    expect(liste.slice(ilkYabanci).some(kadrodan)).toBe(false);
    expect(liste[0].metin).toBe('Anne nane tat.');
    // 1. ses grubu A, N, E, T, İ, L (01, 17, 06, 24, 12, 15): "Anne bal al." için B de gerekir.
    const anetil = ['01', '17', '06', '24', '12', '15'];
    expect(okunacaklar(anetil, '5+').map((c) => c.metin)).toContain('Anne nane tat.');
    expect(okunacaklar(anetil, '5+').map((c) => c.metin)).not.toContain('Anne bal al.');
    expect(okunacaklar([...anetil, '02'], '5+').map((c) => c.metin)).toContain('Anne bal al.');
  });
  it('Okuduğunu yaptır: pilot dört cümle ve "Anne nane tat.", dokunma bölgesi kartın içinde ve yeterince iri', () => {
    const pilot = cumleler.filter((c) => c.yaptir);
    expect(pilot.map((c) => c.id)).toEqual(['cumle-38', 'cumle-01', 'cumle-05', 'cumle-10', 'cumle-12']);
    for (const c of pilot) {
      const n = c.yaptir!.points.split(' ').map((p) => p.split(',').map(Number));
      expect(n.length, c.id).toBeGreaterThanOrEqual(3);
      for (const [x, y] of n) { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThanOrEqual(100); expect(y).toBeGreaterThanOrEqual(0); expect(y).toBeLessThanOrEqual(100); }
      const gen = Math.max(...n.map((p) => p[0])) - Math.min(...n.map((p) => p[0])), boy = Math.max(...n.map((p) => p[1])) - Math.min(...n.map((p) => p[1]));
      expect(gen, c.id).toBeGreaterThanOrEqual(15); expect(boy, c.id).toBeGreaterThanOrEqual(20);
      // 5+ yaşın cümlesi (iki–dört sözcük); 4 yaşta an yok.
      expect(yasaUygun(c, '5+') && !yasaUygun(c, '4'), c.id).toBe(true);
    }
  });
  it('Okuduğunu yaptır yalnız 5+ yaşta ve önce ile sonra karesi diskteyken açılır; test kipinde yer tutucuyla', () => {
    const c = cumleler.find((x) => x.id === 'cumle-01')!;
    const ikisi = (ad: string) => ad === 'cumle-01.webp' || ad === 'cumle-01-sonra.webp';
    const yalnizOnce = (ad: string) => ad === 'cumle-01.webp';
    expect(yaptirAcilir(c, '5+', ikisi)).toBe(true);
    expect(yaptirAcilir(c, '5+', yalnizOnce)).toBe(false);
    expect(yaptirAcilir(c, '5+', () => false, true)).toBe(true);
    expect(yaptirAcilir(c, '4', ikisi)).toBe(false);
    expect(yaptirAcilir(cumleler.find((x) => x.id === 'cumle-02')!, '5+', () => true)).toBe(false);
  });
  it('noktalama ekranda: her sözcüğün ardındaki işaret, metindeki her virgül ve sondaki işaret; sözcük sayısı aynı', () => {
    expect(isaretleri('Kino, Mino ile Lokum.')).toEqual([',', '', '', '.']);
    expect(isaretleri('Zıpzıp, feneri as!')).toEqual([',', '', '!']);
    for (const c of [...cumleler, ...oykuler.flatMap((o) => o.sayfalar)]) {
      const i = isaretleri(c.metin);
      expect(i, c.id).toHaveLength(sozcukleri(c.metin).length);
      expect(i.join('').replace(/[.!?]/g, ''), c.id).toBe((c.metin.match(/,/g) ?? []).join(''));
      expect(i.at(-1), c.id).toBe(c.metin.trim().slice(-1));
    }
  });
  it('kayıt adları ASCII: cumle-soz-<sözcük>', () => {
    expect(sozcukKaydi('Ördek')).toBe('cumle-soz-oordek');
    expect(sozcukKaydi('aldı')).toBe('cumle-soz-aldii');
    expect(sozcukKaydi('çay')).toBe('cumle-soz-ccay');
    expect(sozcukKaydi('dağa')).toBe('cumle-soz-dagga');
  });
});

describe('Paket Harf-H17: 4 yaşın cümleleri ikiye katlandı', () => {
  it('bir ya da iki sözcüklü 90 cümle; yeniler (cumle-100…144) yalnız sahnesi gelince görünür, kayıtlı ve zamanlı', () => {
    expect(cumleler.filter((c) => sozcukleri(c.metin).length <= 2)).toHaveLength(90);
    const yeni = cumleler.filter((c) => Number(c.id.slice(6)) >= 100);
    expect(yeni).toHaveLength(45);
    for (const c of yeni) {
      expect(c.gecici, c.id).toBeFalsy();
      expect(gorunur(c), c.id).toBe(cizimVar(c.id));
      expect(sozcukleri(c.metin).length, c.id).toBeLessThanOrEqual(2);
      expect(existsSync('assets/alfabe/ses/' + c.id + '.mp3'), c.id).toBe(true);
      expect(c.zamanlar, c.id).toHaveLength(sozcukleri(c.metin).length);
      expect(/çilek/i.test(c.metin), c.id).toBe(false);
    }
  });
});
