import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';

const browser = await chromium.launch({channel: 'msedge', headless: true});
const page = await browser.newPage({viewport: {width: 844, height: 390}, hasTouch: true, reducedMotion: 'reduce'});
const url = (process.env.PATI_TEST_URL || 'http://127.0.0.1:5182') + '/pati/index.html';
const key = 'pati-yeni-ilerleme-v1';
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
page.setDefaultTimeout(5000);
const controls = action => page.locator(`[data-act="${action}"]`);

async function checkShelf() {
  const geometry = await page.locator('.bakim-rafi').evaluate(shelf => {
    const {left, right, top, bottom} = shelf.getBoundingClientRect();
    return [...shelf.querySelectorAll('.raf-ici button')].map(button => {
      const bounds = button.getBoundingClientRect();
      return {
        label: button.getAttribute('aria-label'),
        hasCaption: /\p{L}/u.test(button.innerText),
        fits: bounds.left >= left && bounds.right <= right && bounds.top >= top && bounds.bottom <= bottom,
        target: Math.min(bounds.width, bounds.height)
      };
    });
  });
  for (const {label, hasCaption, fits, target} of geometry) {
    assert.ok(label && fits && target >= 44, JSON.stringify({label, fits, target}));
    assert.equal(hasCaption, false, label);
  }
}

async function center(locator) {
  const box = await locator.boundingBox();
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}

try {
  await page.goto(url);
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    para: 15, hayvanlar: {kopek: {}, balik: {}},
    canta: {biskuvi: 2, somon: 2, havuc: 2, tavuk: 2, kabak: 2, sampuan: 1, frizbi: 1, kurdele: 1}
  })), key);
  await page.reload();
  await page.locator('[data-act=pet][data-key=kopek]').click();
  assert.equal(await controls('banyo').count(),1);
  await controls('drawer').click();
  const tools = await controls('use').evaluateAll(buttons=>buttons.map(b=>b.dataset.key).sort());
  assert.deepEqual(tools,['mama','su','uyku','oyun','frizbi','kurdele'].sort());
  for (const [width, height] of [[568,320],[844,390],[1024,768],[2157,1599],[390,844]]) {
    await page.setViewportSize({width,height});
    await checkShelf();
  }
  await page.setViewportSize({width:844,height:390});
  await page.locator('[data-key=mama]').click();
  const all = new Set();
  for (let i=0; i<2; i++) {
    await checkShelf();
    const ids = await controls('food').evaluateAll(buttons => buttons.map(button => button.dataset.food));
    ids.forEach(id => all.add(id));
    await controls('canta-ileri').click();
  }
  assert.equal(all.size,5);

  // Exercise real touch input, including capture, cancellation and a missed drop.
  const touch = await page.context().newCDPSession(page);
  const food = controls('food').first(), id = await food.getAttribute('data-food');
  const stock = () => page.evaluate(([key,id]) => JSON.parse(localStorage.getItem(key)).canta[id], [key,id]);
  async function drag(destination, end) {
    const start = await center(food);
    await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[destination]});
    await page.locator('.suruklenen').waitFor();
    await touch.send('Input.dispatchTouchEvent',{type:end,touchPoints:[]});
    await page.locator('.suruklenen').waitFor({state:'detached'});
  }
  await drag({x:80,y:90},'touchCancel');
  await drag({x:80,y:90},'touchEnd');
  assert.equal(await stock(),2);
  assert.equal(await controls('give').count(),0);
  await drag(await center(page.locator('.buyuk .rig')),'touchEnd');
  await page.waitForFunction(([key,id]) => JSON.parse(localStorage.getItem(key)).canta[id]===1,[key,id]);
  assert.equal(await page.locator('.suruklenen').count(),0);

  assert.equal(await page.locator('.cuzdan,.pati-haber .odul-jeton').count(),0);
  assert.equal((await page.evaluate(key => JSON.parse(localStorage.getItem(key)),key)).para,15);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.bakim-rafi').count(),0);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('data-key'),'mama');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'food');
  await page.keyboard.press('Enter');
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'give');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'food');
  await page.keyboard.press('Escape');
  const water = page.locator('[data-key=su]');
  await water.click();
  await controls('give').click();
  assert.equal(await water.isDisabled(),true);
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).hayvanlar.kopek.bakimlar.includes('su'),key);
  await page.waitForFunction(() => !document.querySelector('.bakim-rafi fieldset:disabled'));
  assert.equal(await water.isEnabled(),true);
  assert.equal(await stock(),1);
  assert.deepEqual(errors,[]);
  console.log('Bakım rafı, beş ekran boyutu, porsiyon sayfaları, dokunarak sürükleme, iptal ve klavye dönüşü doğrulandı.');
} finally {
  await browser.close();
}
