/**
 * Kino'nun Otobüsü V3 (/kino-otobus/, ekip/senaryo/KINO-OTOBUS-V3.md §15 "bitti" ölçütü): üç tür istek, zevk ve
 * tepki, biten külah, kısa sayma, gün sonu üç kart, 26 müşteri, gizli sürprizler, zoom yok. Günler sıradaki işin
 * işaretini (.ko-sirada; ekranda ancak 30 sn'de parlar) izleyerek oynanır. Ekran kareleri tests/screens/ (git'e girmez).
 */
import { expect, test, type Page } from '@playwright/test';
import { hataTopla } from './yardimci';

/** yerel önizleme sunucusunun bağlantı kopması (yüklü bilgisayarda vite preview) oyun hatası değildir */
const agDisi = (h: string) => !h.includes('ERR_CONNECTION_RESET');
const ANAHTAR = 'minkino-kino-otobus-v1';
type Kayit = { acikGun?: number; biten?: number[]; mutlu?: Record<string, number>; acilan?: { tat: string[]; sus: string[]; gorunum: string[] }; ozelTat?: string | null; yeni?: unknown; gorulen?: string[] };
const yerelKayit = (page: Page) => page.evaluate((a) => JSON.parse(localStorage.getItem(a) ?? '{}') as Kayit, ANAHTAR);
interface Durum {
  biten: number;
  mutlu: number;
  bugun: number;
  kuyruk: number;
  jeton: number[];
  kulah: number;
}
const durum = async (page: Page) => JSON.parse((await page.locator('.ko-gun').getAttribute('data-durum')) ?? '{}') as Durum;
type Nokta = { x: number; y: number };
const orta = async (page: Page, sec: string) => {
  const r = (await page.locator(sec).first().boundingBox())!;
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
};

/**
 * Bir günü oynar: sıradaki işin işaretine dokunur (kap, top, sos, süs, ver; külah bitince makine ve paneli), müşterinin
 * bıraktığı jetonlara dokunarak sayar, 5-6 "Kaç jeton?" balonunda doğruyu seçer. Gün sonu ödül ekranında durur.
 * dokun: dokunuş (test modunda tıklama, gerçek hızda parmak)
 */
async function gunuOyna(page: Page, dokun: (p: Nokta, kay?: number) => Promise<void>, o: { bekle?: number } = {}) {
  const bekle = o.bekle ?? 60;
  const sayim = { jetonDokunus: 0, enCokJeton: 0, makine: 0, sayiBalon: 0 };
  let sonDurum = '';
  let sonIlerleme = Date.now();
  for (let n = 0; n < 2000; n++) {
    if (await page.locator('.ko-odul').isVisible().catch(() => false)) break;
    const d = await page.evaluate(() => {
      const g = document.querySelector<HTMLElement>('.ko-gun');
      if (!g) return null;
      const kutu = (e: Element | null) => {
        const r = e?.getBoundingClientRect();
        return r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
      };
      const sayi = document.querySelector<HTMLElement>('.ko-sayi-balonlar:not(.ko-sonuyor)');
      const dogru = sayi ? kutu(sayi.querySelector(`[data-sayi="${sayi.dataset.dogru}"]`)) : null;
      const jeton = [...document.querySelectorAll<HTMLElement>('.ko-jeton-sira')].find((j) => !j.hidden && j.childElementCount);
      const panel = document.querySelector('.ko-is-panel .ko-sirada');
      return {
        durum: g.dataset.durum ?? '',
        adim: g.dataset.adim ?? '',
        sirada: kutu(g.querySelector('.ko-sirada')),
        jeton: jeton ? { ...kutu(jeton)!, n: jeton.childElementCount } : null,
        dogru,
        panel: kutu(panel),
      };
    });
    if (!d) {
      await page.waitForTimeout(120);
      continue;
    }
    if (d.durum !== sonDurum) {
      sonDurum = d.durum;
      sonIlerleme = Date.now();
    } else if (Date.now() - sonIlerleme > 40000) throw new Error(`oyun 40 sn ilerlemedi: ${JSON.stringify(d)}`);
    if (d.dogru) {
      sayim.sayiBalon++;
      await dokun(d.dogru);
      await page.waitForTimeout(250);
      continue;
    }
    // külah paneli açıksa önce o (tezgâhın önünü örter)
    if (d.panel) {
      await dokun(d.panel);
      await page.waitForTimeout(bekle + 200);
      continue;
    }
    if (d.jeton) {
      sayim.jetonDokunus++;
      sayim.enCokJeton = Math.max(sayim.enCokJeton, d.jeton.n);
      await dokun(d.jeton);
      await page.waitForTimeout(bekle + 60);
      continue;
    }
    if (!d.adim || !d.sirada) {
      await page.waitForTimeout(120);
      continue;
    }
    if (d.adim === 'makine') sayim.makine++;
    await dokun(d.sirada, d.adim === 'top' || d.adim === 'sos' || d.adim === 'sus' ? 14 : 0);
    await page.waitForTimeout(d.adim === 'ye' ? bekle + 300 : bekle);
  }
  await expect(page.locator('.ko-odul')).toBeVisible({ timeout: 30000 });
  return sayim;
}

/** Gün sonu ödülü: üç kart açılır; ilk dokunuş ön izleme, ikincisi seçer; Tamam açılışa döner. Dönen: seçilen kart */
async function odulSec(page: Page, kategori: 'tat' | 'sus' | 'gorunum') {
  await expect(page.locator('.ko-kart')).toHaveCount(3);
  await expect(page.locator('.ko-odul')).toHaveClass(/ko-kartlar-acik/, { timeout: 20000 });
  const kart = page.locator(`.ko-kart[data-kategori="${kategori}"]`);
  const id = (await kart.getAttribute('data-id'))!;
  await kart.click();
  await expect(kart).toHaveClass(/ko-onizleme/);
  await kart.click();
  await expect(page.locator('.ko-odul-tamam')).toBeVisible({ timeout: 20000 });
  return id;
}

const tik = (page: Page) => async (p: Nokta) => {
  await page.mouse.click(p.x, p.y);
};

test('Kino’nun Otobüsü V3: 3-4 yaş üç gün; jetonlara dokunarak sayma (en çok 3), her gün üç kart, seçilen ertesi gün tezgâhta', async ({ page }) => {
  test.setTimeout(420_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&tohum=7');
  await page.locator('.ko-yas-dugme[data-yas="kucuk"]').click();
  await expect(page.locator('.ko-gun-kart')).toHaveCount(3);
  const secimler: string[] = [];
  for (const gun of [1, 2, 3]) {
    await page.locator(`.ko-gun-kart[data-gun="${gun}"]`).click();
    // iki ya da daha çok yeni tat açıldıysa sabah özel tat seçilir
    if (await page.locator('.ko-ozel-secim').waitFor({ timeout: 2500 }).then(() => true, () => false)) await page.locator('.ko-ozel-kap').first().click();
    await expect(page.locator(`.ko-gun[data-gun="${gun}"]`)).toBeVisible();
    await expect(page.locator('.ko-yuva')).toHaveCount(2);
    if (gun > 1) {
      // dünkü ödül tezgâhta: özel tat yuvası (yeni kurdeleli), planda bir istek onu içerir
      await expect(page.locator('.ko-tat.ko-ozel')).toHaveCount(1);
      const plan = await page.evaluate(() => JSON.stringify((window as unknown as { __koGun: { plan: unknown } }).__koGun.plan));
      expect(plan).toContain((await yerelKayit(page)).ozelTat!);
    }
    const s = await gunuOyna(page, tik(page));
    // her ödeme en çok 3 jeton; bir günün sayması kısa (en çok 5 × 3 dokunuş)
    expect(s.enCokJeton).toBeLessThanOrEqual(3);
    expect(s.jetonDokunus).toBeLessThanOrEqual(15);
    expect(s.sayiBalon).toBe(0);
    secimler.push(await odulSec(page, 'tat'));
    await page.locator('.ko-odul-tamam').click();
    await expect(page.locator('.ko-acilis')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`.ko-gun-kart[data-gun="${gun}"]`)).toHaveClass(/ko-biten/);
  }
  expect(secimler).toEqual(['visne', 'portakal', 'pamukseker']);
  const k = await yerelKayit(page);
  expect(k.acilan!.tat).toEqual(['visne', 'portakal', 'pamukseker']);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: 5-6 yaş Gün 3 (paylaşma, örüntü, Mino’nun doğum günü); en çok 5 jeton, "Kaç jeton oldu?" günde en çok 2', async ({ page }) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=3&yas=buyuk&tohum=11');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  const plan = await page.evaluate(() => (window as unknown as { __koGun: { plan: { tur: string }[] } }).__koGun.plan.map((s) => s.tur));
  expect(plan).toEqual(['ipucu', 'paylasma', 'surpriz', 'oruntu', 'dogumgunu']);
  const s = await gunuOyna(page, tik(page));
  expect(s.enCokJeton).toBeLessThanOrEqual(5);
  expect(s.sayiBalon).toBeGreaterThanOrEqual(1);
  expect(s.sayiBalon).toBeLessThanOrEqual(2);
  // görünüm kartı: flama otobüse takılır
  expect(await odulSec(page, 'gorunum')).toBe('flama');
  await expect(page.locator('.ko-aksam-otobus .ko-ob-flama')).toHaveCount(1);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: külah biter; boş rafa dokununca Kino omuz silker; kâse verilince "farklı" tepki; makine 3 külah yapar', async ({ page }) => {
  test.setTimeout(120_000);
  const hatalar = hataTopla(page);
  // Gün 2 (3-4): ilk müşteri resimli (külah ya da kâse)
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=1&yas=kucuk&tohum=7');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  type G = { kulahStok: number; plan: { tur: string; istek: { kap: string; toplar: string[]; sos: string | null }[] }[] };
  const g = () => page.evaluate(() => (window as unknown as { __koGun: { kulahStok: number } }).__koGun.kulahStok);
  expect(await g()).toBe(2);
  // iki külah alınır: raf biter
  await page.locator('.ko-kap-dugme[data-kap="kulah"]').click();
  await page.locator('.ko-yuva[data-yuva="1"]').click({ position: { x: 20, y: 30 } });
  await page.locator('.ko-kap-dugme[data-kap="kulah"]').click();
  expect(await g()).toBe(0);
  await expect(page.locator('.ko-kap-dugme[data-kap="kulah"]')).toHaveClass(/ko-kulah-yok/);
  await expect(page.locator('.ko-kulah-kilif')).toHaveCount(1);
  await expect(page.locator('.ko-is-kosesi')).toHaveClass(/ko-buhar-cok/);
  // makine parlamaz (ancak 20 sn bekleyince)
  await expect(page.locator('.ko-is-kosesi')).not.toHaveClass(/ko-is-var/);
  // yuvaları boşalt (Kino yer), boş rafa dokun: hiçbir kap konmaz, oyun sürer
  for (const i of [0, 1]) {
    const kule = page.locator(`.ko-yuva[data-yuva="${i}"] .ko-kule`);
    for (let n = 0; n < 4 && (await kule.count()); n++) {
      await kule.click();
      await page.waitForTimeout(350);
    }
    await expect(kule).toHaveCount(0);
  }
  await page.locator('.ko-yuva[data-yuva="0"]').click({ position: { x: 20, y: 30 } });
  await page.locator('.ko-kap-dugme[data-kap="kulah"]').click();
  await expect(page.locator('.ko-yuva[data-yuva="0"] .ko-kule')).toHaveCount(0);
  // külahlı resimli istek varsa kâseyle verilir: müşteri "farklı" (komik) tepkiyle yer, yine öder
  const m = await page.evaluate(() => (window as unknown as { __koGun: { slotlar: { musteri: { sip: G['plan'][number] } | null }[] } }).__koGun.slotlar[0].musteri!.sip);
  await page.locator('.ko-kap-dugme[data-kap="kase"]').click();
  for (const t of m.istek[0].toplar) await page.locator(`.ko-tat[data-tat="${t}"]`).click();
  if (m.istek[0].sos) await page.locator(`.ko-sos[data-sos="${m.istek[0].sos}"]`).click();
  await page.locator('.ko-yuva[data-yuva="0"] .ko-ver').click();
  if (m.tur === 'resimli' && m.istek[0].kap === 'kulah') await expect(page.locator('.ko-musteri[data-sonuc="komik"]')).toHaveCount(1, { timeout: 5000 });
  await expect.poll(async () => (await durum(page)).jeton[0] + (await durum(page)).bugun, { timeout: 8000 }).toBeGreaterThan(0);
  // makine: bas, yuvarla → 3 taze külah
  await page.locator('.ko-is-kosesi').click();
  const panel = page.locator('.ko-is-panel');
  await expect(panel).toHaveAttribute('data-adim', 'bas');
  await page.locator('.ko-is-makine').click();
  await expect(panel).toHaveAttribute('data-adim', 'yuvarla', { timeout: 5000 });
  await page.locator('.ko-is-disk').click();
  await expect(panel).toHaveCount(0, { timeout: 5000 });
  await expect.poll(g, { timeout: 5000 }).toBe(3);
  await expect(page.locator('.ko-kulah-yuva.ko-dolu')).toHaveCount(3);
  await expect(page.locator('.ko-is-kosesi')).not.toHaveClass(/ko-buhar-cok/);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: ipucu merdiveni (12 sn bakış, 30 sn parlama, 40 sn el); parlama 30 sn’den önce yok', async ({ page }) => {
  const hatalar = hataTopla(page);
  // ?ipucu=1: merdiven test modunda 10 kat hızlı (1.2 / 3 / 4 sn)
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=2&yas=kucuk&tohum=3&ipucu=1');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  await page.mouse.click(5, 200);
  const t0 = Date.now();
  await expect(page.locator('.ko-musteri.ko-bakiyor')).toHaveCount(1, { timeout: 4000 });
  expect(Date.now() - t0).toBeGreaterThanOrEqual(900);
  expect(await page.locator('.ko-parla').count()).toBe(0);
  await expect(page.locator('.ko-parla')).toHaveCount(1, { timeout: 5000 });
  expect(Date.now() - t0).toBeGreaterThanOrEqual(2800);
  await expect(page.locator('.ko-el-ipucu.ko-goster')).toHaveCount(1, { timeout: 5000 });
  // dokununca merdiven baştan
  await page.mouse.click(5, 200);
  await expect(page.locator('.ko-parla')).toHaveCount(0);
  await expect(page.locator('.ko-el-ipucu.ko-goster')).toHaveCount(0);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: dokunsal hazırlık (kepçe, sos dök, serpinti salla, süs sürükle) ve temizlik', async ({ page }) => {
  test.setTimeout(120_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=3&yas=buyuk&tohum=5');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  const yuva = page.locator('.ko-yuva[data-yuva="0"]');
  const surukle = async (a: Nokta, z: Nokta, ara?: () => Promise<void>) => {
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(a.x + ((z.x - a.x) * i) / 10, a.y + ((z.y - a.y) * i) / 10);
      await page.waitForTimeout(16);
    }
    await ara?.();
    await page.mouse.up();
  };
  await page.locator('.ko-kap-dugme[data-kap="kase"]').click();
  const tat = await orta(page, '.ko-tat[data-tat="cilek"]');
  await surukle(tat, await orta(page, '.ko-yuva[data-yuva="0"]'));
  await expect(yuva.locator('.ko-k-top')).toHaveCount(1);
  await surukle(tat, { x: tat.x + 14, y: tat.y });
  await expect(yuva.locator('.ko-k-top')).toHaveCount(2);
  const kule = await orta(page, '.ko-yuva[data-yuva="0"] .ko-kule');
  await surukle(await orta(page, '.ko-sos[data-sos="karamel"]'), kule, () => page.waitForTimeout(800));
  await expect(yuva.locator('.ko-k-sos')).toHaveCount(1);
  await surukle(await orta(page, '.ko-sus[data-sus="semsiye"]'), kule);
  await expect(yuva.locator('.ko-k-sus[data-sus="semsiye"]')).toHaveCount(1);
  await page.evaluate(() => (window as unknown as { __koGun: { lekeDusur: () => void } }).__koGun.lekeDusur());
  await expect(page.locator('.ko-leke')).toHaveCount(3);
  for (let i = 0; i < 14 && (await page.locator('.ko-leke:not(.ko-silindi)').count()); i++) {
    if (await page.locator('.ko-sinek').count()) await page.locator('.ko-sinek').click({ force: true }).catch(() => undefined);
    await page.locator('.ko-leke:not(.ko-silindi)').first().click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(120);
  }
  await expect(page.locator('.ko-leke')).toHaveCount(0);
  await page.screenshot({ path: 'tests/screens/kino-otobus-dokunsal.png' });
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: dokuz gizli sürpriz tetiklenir, konsol hatası yok', async ({ page }) => {
  test.setTimeout(180_000);
  const hatalar = hataTopla(page);
  let sonSurpriz: string[] = [];
  const surprizler = () => page.evaluate(() => document.querySelector<HTMLElement>('.ko-gun')?.dataset.surprizler ?? null).then((x) => (sonSurpriz = x === null ? sonSurpriz : x.split(' ')));
  // kiraz şapka açık; Lokum, Zıpzıp ve Tombi gelsin; her müşteriden sonra kaçan balon
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=1&yas=kucuk&tohum=21&acilan=kino-sapka&musteriler=lokum,tombi,zipzip&balon=1');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  // 1. külah zinciri soldan sağa
  const zincir = page.locator('.ko-zincir-kulah');
  for (let i = 0; i < (await zincir.count()); i++) await zincir.nth(i).dispatchEvent('pointerdown');
  // 2. dolabın camı: üç dokunuş (gözlerin dışı)
  const dolap = (await page.locator('.ko-dolap').boundingBox())!;
  for (let i = 0; i < 3; i++) await page.mouse.click(dolap.x + 6, dolap.y + dolap.height * 0.3);
  // 3. kumbara: 5 hızlı dokunuş
  for (let i = 0; i < 5; i++) await page.locator('.ko-kumbara').click();
  // 8. kara tahta (yatayda duvarda): çileğe dokun
  const tahta = page.locator('.ko-duvar-tahta');
  if (await tahta.isVisible()) {
    const r = (await tahta.boundingBox())!;
    await page.mouse.click(r.x + r.width * 0.3, r.y + r.height * 0.45);
  }
  // 9. Kino'ya 3. dokunuşta hapşu, 5.'de şapka zıplar
  for (let i = 0; i < 5; i++) {
    await page.locator('.ko-kino-yer').click();
    await page.waitForTimeout(80);
  }
  // 5. Lokum'a dokununca burnuna dondurma (Lokum gelince)
  const lokum = page.locator('.ko-musteri.ko-hazir:not(.ko-bitti)[data-musteri="lokum"]');
  // müşterilere hizmet: Tombi bitirince külah ister (dokun); Zıpzıp öne atlar; kaçan balon çıkınca dokun
  let tombi = false;
  for (let n = 0; n < 900 && !(await page.locator('.ko-odul').isVisible().catch(() => false)); n++) {
    const s = await surprizler();
    if (!s.includes('lokum') && (await lokum.count())) {
      await lokum.dispatchEvent('click').catch(() => undefined);
      await page.waitForTimeout(400);
      continue;
    }
    if (!tombi && (await page.locator('.ko-tombi-kulah').count())) {
      await page.locator('.ko-tombi-kulah').dispatchEvent('click');
      tombi = true;
      continue;
    }
    if (!s.includes('balon') && (await page.locator('.ko-kacan-balon').count())) {
      await page.locator('.ko-kacan-balon').dispatchEvent('click').catch(() => undefined);
      continue;
    }
    const j = page.locator('.ko-jeton-sira:not([hidden])');
    if (await j.count()) {
      await j.first().click().catch(() => undefined);
      continue;
    }
    const h = page.locator('.ko-gun .ko-sirada');
    if (await h.count()) await h.first().click({ timeout: 2000 }).catch(() => undefined);
    await page.waitForTimeout(60);
    if (s.includes('tombi') && s.includes('balon') && s.includes('zipzip') && s.includes('lokum')) break;
  }
  const s = await surprizler();
  for (const ad of ['zincir', 'cam', 'kumbara', 'balon', 'lokum', 'zipzip', 'tombi', 'hapsu', 'sapka']) expect(s, ad).toContain(ad);
  if (await tahta.isVisible()) expect(s).toContain('tahta');
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü V3: son müşteri ödeyince gün kaydedilir; geri basılsa da gün biter', async ({ page }) => {
  test.setTimeout(240_000);
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=2&yas=kucuk&tohum=8');
  await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 20000 });
  await page.evaluate(() => {
    const w = window as unknown as { __koOtobus: { app: { git: (ad: string, p?: unknown) => void } }; __odulIstendi?: boolean };
    const asil = w.__koOtobus.app.git.bind(w.__koOtobus.app);
    w.__koOtobus.app.git = (ad, p) => (ad === 'odul' ? void (w.__odulIstendi = true) : asil(ad, p));
  });
  for (let n = 0; n < 900; n++) {
    if (await page.evaluate(() => !!(window as unknown as { __odulIstendi?: boolean }).__odulIstendi)) break;
    const j = page.locator('.ko-jeton-sira:not([hidden])');
    if (await j.count()) {
      await j.first().click({ timeout: 1000 }).catch(() => undefined);
      continue;
    }
    const pn = page.locator('.ko-is-panel .ko-sirada');
    if (await pn.count()) {
      await pn.first().click({ timeout: 1000 }).catch(() => undefined);
      await page.waitForTimeout(200);
      continue;
    }
    const h = page.locator('.ko-gun .ko-sirada');
    if (await h.count()) await h.first().click({ timeout: 1500 }).catch(() => undefined);
    await page.waitForTimeout(60);
  }
  expect((await yerelKayit(page)).biten).toContain(2);
  await page.locator('.ko-gun .ko-ust button[aria-label="Geri"]').click();
  await expect(page.locator('.ko-acilis')).toBeVisible();
  expect((await yerelKayit(page)).acikGun).toBe(3);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

test('Kino’nun Otobüsü: gün kartına çift dokunuş günü bir kez açar; ?onizleme=1 kilitli güne atlamaz', async ({ page }) => {
  const hatalar = hataTopla(page);
  await page.goto('./kino-otobus/?test=1&sifirla=1&yas=kucuk&ekran=acilis');
  await expect(page.locator('.ko-gun-kart[data-gun="1"]')).toBeVisible();
  const gidilen = await page.evaluate(async () => {
    const app = (window as unknown as { __koOtobus: { app: { git: (ad: string, p?: unknown) => void } } }).__koOtobus.app;
    const asil = app.git.bind(app);
    const liste: string[] = [];
    app.git = (ad, p) => {
      liste.push(ad);
      asil(ad, p);
    };
    const kart = document.querySelector<HTMLButtonElement>('.ko-gun-kart[data-gun="1"]')!;
    kart.click();
    kart.click();
    await new Promise((r) => setTimeout(r, 400));
    return liste;
  });
  expect(gidilen).toEqual(['gun']);
  await page.goto('./kino-otobus/?onizleme=1&ekran=gun&gun=2');
  await expect(page.locator('.ko-acilis')).toBeVisible();
  await expect(page.locator('.ko-gun')).toHaveCount(0);
  expect((await yerelKayit(page)).acikGun).toBe(1);
  expect(hatalar.filter(agDisi)).toEqual([]);
});

// ---------------------------------------------------------------- telefon: gerçek hız, gerçek dokunuş, DPR 3
const TELEFON = [
  { ad: 'yatay', viewport: { width: 844, height: 390 } },
  { ad: 'dikey', viewport: { width: 390, height: 844 } },
];
async function parmak(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  const d = (p: Nokta, type: 'touchStart' | 'touchMove' | 'touchEnd') => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: p.x, y: p.y }] });
  return async (p: Nokta, kay = 0) => {
    await d(p, 'touchStart');
    for (let i = 1; i <= 3 && kay; i++) {
      await d({ x: p.x + (kay * i) / 3, y: p.y + (kay * i) / 6 }, 'touchMove');
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(40);
    await d({ x: p.x + kay, y: p.y + kay / 2 }, 'touchEnd');
  };
}
const kayitla = (page: Page, yas: 'kucuk' | 'buyuk') =>
  page.addInitScript(([a, y]) => {
    if (!sessionStorage.getItem('ko-kuruldu')) {
      sessionStorage.setItem('ko-kuruldu', '1');
      localStorage.setItem(a, JSON.stringify({ acikGun: 3, biten: [1], yas: y, mutlu: {}, acilan: { tat: [], sus: [], gorunum: [] } }));
    }
  }, [ANAHTAR, yas] as const);

/** Görsel kaynak pikselinin üstüne büyütülmüş mü (DPR 3): ekrandaki en × 3 ≤ doğal en */
const buyutulen = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLImageElement>('.ko-gun img, .ko-odul img')]
      .filter((i) => i.naturalWidth && i.getBoundingClientRect().width > 4 && !i.closest('.ko-ucan, .ko-efekt'))
      .map((i) => {
        // object-fit: contain ise çizilen boy kutudan küçük olabilir
        const r = i.getBoundingClientRect();
        const fit = getComputedStyle(i).objectFit;
        const en = fit === 'contain' || fit === 'scale-down' ? Math.min(r.width, (r.height * i.naturalWidth) / i.naturalHeight) : r.width;
        return { src: i.src.split('/').pop(), en, dogal: i.naturalWidth };
      })
      .filter((x) => x.en * 3 > x.dogal * 1.02),
  );

for (const boy of TELEFON) {
  test.describe(`Kino’nun Otobüsü telefon ${boy.ad}`, () => {
    test.use({ viewport: boy.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'iphone', 'telefon boyları ayrı veriliyor'));

    const yas = boy.ad === 'yatay' ? 'kucuk' : 'buyuk';
    test(`gerçek hızda üç gün (${yas}): kayan dokunuşlar, jeton sayma, külah, ödül kartı; zoom yok`, async ({ page }) => {
      test.setTimeout(1_500_000);
      const hatalar = hataTopla(page);
      await kayitla(page, yas);
      const dokun = await parmak(page);
      for (const gun of [1, 2, 3] as const) {
        await page.goto(`./kino-otobus/?onizleme=1&ekran=gun&gun=${gun}`);
        await expect(page.locator(`.ko-gun[data-gun="${gun}"]`)).toBeVisible();
        await expect(page.locator('.ko-musteri.ko-hazir').first()).toBeVisible({ timeout: 30000 });
        await page.waitForTimeout(1500);
        expect(await buyutulen(page), `gün ${gun}`).toEqual([]);
        if (gun === 2) await page.screenshot({ path: `tests/screens/kino-otobus-v3-${boy.ad}-gun2.png` });
        const s = await gunuOyna(page, dokun, { bekle: 220 });
        expect(s.enCokJeton).toBeLessThanOrEqual(yas === 'kucuk' ? 3 : 5);
        await page.waitForTimeout(2500);
        expect(await buyutulen(page), `ödül ${gun}`).toEqual([]);
        if (gun === 1) await page.screenshot({ path: `tests/screens/kino-otobus-v3-${boy.ad}-odul.png` });
        const kat = (['tat', 'sus', 'gorunum'] as const)[gun - 1];
        const kart = await orta(page, `.ko-kart[data-kategori="${kat}"]`);
        await dokun(kart);
        await page.waitForTimeout(600);
        await dokun(kart);
        await expect(page.locator('.ko-odul-tamam')).toBeVisible({ timeout: 20000 });
      }
      const k = await yerelKayit(page);
      expect(k.acilan!.tat).toHaveLength(1);
      expect(k.acilan!.sus).toHaveLength(1);
      expect(k.acilan!.gorunum).toHaveLength(1);
      expect(hatalar.filter(agDisi)).toEqual([]);
    });

    test('müşteriler pencereye göre ölçülü, yüzleri tezgâhın üstünde; yeni karakterler ve aile görünür', async ({ page }) => {
      const hatalar = hataTopla(page);
      for (const [gun, m] of [
        [2, 'bidik,tombi'],
        [2, 'baba,bulut'],
        [3, 'zipzip,lokum'],
      ] as const) {
        await page.goto(`./kino-otobus/?test=1&sifirla=1&ekran=gun&gun=${gun}&yas=kucuk&musteriler=${m}&tohum=2`);
        await expect(page.locator('.ko-musteri.ko-hazir')).toHaveCount(2, { timeout: 20000 });
        await page.waitForTimeout(500);
        const olcu = await page.evaluate(() => {
          const pen = document.querySelector('.ko-pencere')!.getBoundingClientRect();
          return [...document.querySelectorAll<HTMLElement>('.ko-musteri')].map((el) => {
            const y = [...el.querySelectorAll('.m-goz, .m-agiz, [data-parca^="goz"], [data-parca^="agiz"]')].map((e) => e.getBoundingClientRect()).filter((r) => r.width);
            const ust = Math.min(...y.map((r) => r.top));
            const alt = Math.max(...y.map((r) => r.bottom));
            return { ad: el.dataset.musteri, ust, alt, penUst: pen.top, penAlt: pen.bottom };
          });
        });
        for (const o of olcu) {
          expect(o.alt, o.ad).toBeLessThanOrEqual(o.penAlt + 1);
          expect(o.ust, o.ad).toBeGreaterThanOrEqual(o.penUst - 2);
        }
        expect(await buyutulen(page)).toEqual([]);
        await page.screenshot({ path: `tests/screens/kino-otobus-v3-${boy.ad}-musteri-${gun}.png` });
      }
      expect(hatalar.filter(agDisi)).toEqual([]);
    });
  });
}
