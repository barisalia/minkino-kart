import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

const browser = await chromium.launch({channel: 'msedge', headless: true});
const page = await browser.newPage({viewport: {width: 844, height: 390}, reducedMotion: 'reduce'});
const url = (process.env.PATI_TEST_URL || 'http://127.0.0.1:5182') + '/pati/index.html';
const store = 'pati-yeni-ilerleme-v1';
const screenshots = 'tests/screens/pati-yeni';
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
page.setDefaultTimeout(6500);

function control(action, key) {
  const selector = '[data-act="' + action + '"]' + (key ? '[data-key="' + key + '"]' : '');
  return page.locator(selector).first();
}
const click = (action, key) => control(action, key).click();
const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
const visibleCoins = async () => Number(await page.locator('.cuzdan b').textContent());
async function wallet(amount) {
  await page.waitForFunction(([key, expected]) => JSON.parse(localStorage.getItem(key))?.para === expected, [store, amount]);
  if (await page.locator('.cuzdan').count()) assert.equal(await visibleCoins(), amount, 'Cüzdan ile kayıt aynı olmalı');
}
async function snap(name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(Array.from(document.images, img => img.decode()));
  });
  await page.locator('.cerceve').screenshot({path: screenshots + '/' + name + '.png'});
}
async function openDog() {
  await page.goto(url);
  await click('pet', 'kopek');
}
async function openTools() {
  if (!await control('use', 'mama').isVisible()) await click('drawer');
}
async function score(action, expected) {
  await page.waitForFunction(([key, act, value]) => (JSON.parse(localStorage.getItem(key))?.defter?.kopek?.[act] || 0) === value, [store, action, expected]);
}
async function enterBath(action) {
  await openDog();
  await click('banyo');
  await page.locator('.sayfa-banyo').waitFor();
  if (!await control('use', action).isVisible()) await click('drawer');
  await click('use', action);
  await page.locator('.dok-yuzey[data-ready="true"]').waitFor();
}
async function sweepCoat({capture = false, until} = {}) {
  const dog = await page.locator('.buyuk').boundingBox();
  const center = {x: dog.x + dog.width * .5, y: dog.y + dog.height * .52};
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  for (let row = 1; row < 18; row++) {
    const y = dog.y + dog.height * row / 18;
    const left = dog.x + dog.width * .06, right = dog.x + dog.width * .94;
    await page.mouse.move(row % 2 ? left : right, y);
    await page.mouse.move(row % 2 ? right : left, y, {steps: 5});
    if (capture && row === 10) {
      await page.mouse.move(center.x, y);
      await snap('elle-tarama');
    }
    if (until && await until()) break;
  }
  await page.mouse.up();
}
async function brush() {
  await enterBath('firca');
  const surface = page.locator('.dok-yuzey');
  await surface.click();
  await page.getByRole('button', {name: 'Bitir', exact: true}).click();
  await page.locator('.banyo-tepki.cekindi').waitFor();
  await score('firca', 0);
  await enterBath('firca');
  const coverage = () => page.locator('.dok-ilerleme').evaluate(meter => meter.value);
  await sweepCoat({until: async () => await coverage() >= 42});
  const percent = await coverage();
  assert.ok(percent >= 42 && percent < 84);
  await page.getByRole('button', {name: 'Bitir', exact: true}).click();
  await score('firca', Math.round(percent * 5 / 100));
  await enterBath('firca');
  await sweepCoat({capture:true});
  if (await page.locator('.dok-bitir').count()) await page.locator('.dok-bitir').click();
  await page.locator('.sayfa-bakim .bakim-onayi').waitFor();
  await score('firca', 5);
  assert.ok((await saved()).hayvanlar.kopek.bakimlar.includes('firca'));
}
async function playBall() {
  await openTools();
  await click('use', 'oyun');
  for (let i = 0; i < 3; i++) {
    const ball = page.locator('.hedef-' + i);
    await ball.click();
    await ball.waitFor({state: 'detached'});
  }
  await score('oyun', 10);
}
async function buyEquipment(id, price) {
  await page.goto(url);
  await click('magaza');
  await click('raf-tab', 'esya');
  assert.equal(await control('urun-al', 'sampuan').count(), 0, 'Şampuan banyoda ücretsiz kullanılmalı');
  const coins = await visibleCoins();
  await click('urun-al', id);
  await wallet(coins - price);
  assert.equal((await saved()).canta[id], 1);
  assert.ok(await control('urun-al', id).isDisabled());
}
async function wash() {
  await enterBath('sampuan');
  const rinse = page.getByRole('button', {name: 'Durula', exact: true});
  assert.ok(await rinse.isDisabled(), 'Köpük sürmeden durulama açılamaz');
  await sweepCoat();
  assert.ok(await page.locator('.dok-kopuk').count() > 0);
  await rinse.click();
  await sweepCoat({until: async () => !await page.locator('.dok-yuzey').count()});
  await page.locator('.sayfa-bakim .bakim-onayi').waitFor();
  await score('sampuan', 10);
  assert.ok((await saved()).hayvanlar.kopek.bakimlar.includes('sampuan'));
}
async function serve(id, action, points) {
  if (!await page.locator('.yemek-rafi').isVisible()) await click('use', 'mama');
  await page.locator('[data-act=food][data-food="' + id + '"]').click();
  await click('give');
  await page.waitForFunction(() => document.querySelector('.bakim-rafi [data-act=use]') && !document.querySelector('.bakim-rafi fieldset:disabled'));
  await score(action, points);
}

async function throwDisc() {
  await openDog();
  await openTools();
  const coins = (await saved()).para;
  await click('use', 'frizbi');
  for (const hit of [false, true, true]) {
    // Use the visible release meter. Aim at the centre of the green band
    // for two throws and release on the far left for one intentional miss.
    await page.waitForFunction(wantHit => {
      const button = document.querySelector('.firlat');
      if (!button || button.disabled) return false;
      const strip = document.querySelector('.atis-seridi').getBoundingClientRect();
      const band = document.querySelector('.atis-seridi i').getBoundingClientRect();
      const needle = document.querySelector('.atis-seridi em').getBoundingClientRect();
      const x = needle.left + needle.width / 2;
      return wantHit
        ? Math.abs(x - (band.left + band.width / 2)) < band.width * .15
        : x < strip.left + strip.width * .05;
    }, hit);
    await page.getByRole('button', {name: 'Fırlat', exact: true}).click();
  }
  await page.locator('.frizbi-kontrol').waitFor({state: 'detached'});
  await score('frizbi', 7);
  await wallet(coins);
  assert.ok((await saved()).hayvanlar.kopek.bakimlar.includes('frizbi'));
}

await mkdir(screenshots, {recursive: true});
await page.addInitScript(()=>{Math.random=()=>.65;});
try {
  await page.goto(url);
  assert.equal(await visibleCoins(), 7, 'Yeni oyun 7 jetonla başlamalı');
  await snap('menu');
  await click('magaza');await click('raf-tab','hayvan');
  await click('aile', 'kedi');
  await click('incele', 'kedi');
  assert.equal(await control('satin-al').count(), 0);
  await control('bakima-don').waitFor();

  await openDog();
  await click('bowl');
  assert.equal(await page.locator('[data-act=food]').count(), 0, 'Boş çantada tüketilecek yiyecek olmamalı');
  const preferred=await page.locator('[data-istek]').getAttribute('data-istek');
  await click('erzak');
  assert.equal(await page.locator('.urun-kart').first().getAttribute('data-key'),preferred);
  assert.equal(await page.locator('.urun-kart:has(.rafta-istek)').count(),1);
  await snap('market');
  assert.equal(await page.locator('[data-act=urun-al]').count(),20);
  const ordinary=preferred==='biskuvi'?'tavuk':'biskuvi';
  await click('urun-al', preferred);
  await control('urun-al',preferred).locator('.rafta-stok').waitFor();
  assert.equal(await control('urun-al',preferred).locator('.rafta-stok').textContent(),'×1');
  await click('urun-al', ordinary);

  const wrong = 'kedi-lokmasi';
  await click('urun-al', wrong);
  await wallet(4);
  const bag = (await saved()).canta;
  for (const item of [preferred, ordinary, wrong]) assert.equal(bag[item], 1);
  await click('don-sofra');
  await serve(ordinary, 'mama', 5);
  await serve(preferred, 'mama', 10);
  await serve(wrong, 'yanlis', -5);
  const eaten = await saved();
  assert.equal(eaten.canta[preferred] || 0, 0);
  assert.equal(eaten.canta[ordinary] || 0, 0);
  assert.equal(eaten.canta[wrong] || 0, 0);
  assert.equal(eaten.hayvanlar.kopek.hastaGun,1);
  await control('tedavi').waitFor();
  await page.goto(url);await click('gece');assert.match(await page.locator('.gelir-listesi').innerText(),/Hasta.*0 puan/s);
  await openDog();await click('drawer');await click('tedavi');
  await wallet(1);

  await brush();
  await wash();
  await openDog();
  await playBall();
  await openDog();
  await playBall();
  await wallet(1);
  await page.goto(url);
  await click('gece');
  await click('uyu');
  // 10 food − 5 unsuitable + 5 brushing + 10 washing + 10 playing.
  await wallet(28);
  assert.equal((await saved()).gun, 2);
  const beforeAdoption = (await saved()).para;
  await page.goto(url);
  await click('magaza');await click('raf-tab','hayvan');
  await click('aile', 'kedi');
  await click('incele', 'kedi');
  await click('satin-al');
  await wallet(beforeAdoption - 18);
  assert.ok((await saved()).hayvanlar.kedi);
  await page.reload();
  await click('pet', 'kopek');
  await click('next');
  assert.equal(await page.locator('header h1').textContent(), 'Gümüş Tekir');
  await snap('bakim');

  // Use the free care game to earn a permanent piece of equipment.
  await openDog();await openTools();await click('use','uyku');await page.waitForFunction(k=>JSON.parse(localStorage.getItem(k)).hayvanlar.kopek.bakimlar.includes('uyku'),store);await page.goto(url);await click('gece');await click('uyu');
  await buyEquipment('kurdele', 4);
  await openDog();
  await openTools();
  await click('use', 'kurdele');
  await page.getByRole('img', {name: 'Papyon', exact: true}).waitFor();
  await page.reload();
  assert.equal((await saved()).canta.kurdele, 1);
  assert.ok((await saved()).hayvanlar.kedi, 'Dost ve eşya sahipliği aynı kayıtta kalmalı');
  assert.ok((await saved()).hayvanlar.kopek.kurdele);
  await buyEquipment('frizbi', 6);
  await throwDisc();
  await page.clock.install();
  await openDog();
  const beforeTime = await saved();
  for (let i = 0; i < 19; i++) {
    await page.clock.runFor(5000);
    await page.evaluate(key => navigator.locks.request(key, () => {}), store);
  }
  const afterTime = await saved();
  assert.equal(afterTime.para, beforeTime.para, 'Süre tek başına cüzdanı değiştirmemeli');
  assert.deepEqual(afterTime.defter, beforeTime.defter);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 844);
  assert.deepEqual(errors, []);
  console.log('Yatay telefonda yiyecek seçimi, stok, banyo tepkileri, günlük puan ve tek seferlik tahsilat, sahiplenme, papyon ve frizbi doğrulandı.');
} finally {
  await browser.close();
}
