import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';

const browser = await chromium.launch({channel: 'msedge', headless: true});
const context = await browser.newContext({viewport: {width: 844, height: 390}, hasTouch: true, reducedMotion: 'reduce'});
const page = await context.newPage();
const url = (process.env.PATI_TEST_URL || 'http://localhost:5173') + '/pati/index.html';
const key = 'pati-yeni-ilerleme-v1';
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
page.setDefaultTimeout(5000);
page.setDefaultNavigationTimeout(45000);
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
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({
    para: 15, hayvanlar: {kopek: {}, balik: {}},
    canta: {biskuvi: 2, somon: 2, havuc: 2, tavuk: 2, kabak: 2, sampuan: 1, frizbi: 1, kurdele: 1}
  })), key);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('[data-act=pet][data-key=kopek]').click();
  assert.equal(await controls('banyo').count(),1);
  assert.equal(await controls('drawer').getAttribute('aria-expanded'),'true');
  const touch = await page.context().newCDPSession(page);
  async function pull(dy) {
    const start = await center(controls('drawer'));
    await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});
    await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x,y:start.y+dy}]});
    await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  await pull(-22);
  assert.equal(await controls('drawer').getAttribute('aria-expanded'),'true');
  await pull(28);
  assert.equal(await controls('drawer').getAttribute('aria-expanded'),'false');
  assert.equal(await controls('use').count(),0);
  await pull(-32);
  await controls('banyo').click();
  await page.locator('[data-key=firca]').waitFor();
  await controls('back').click();
  assert.equal(await controls('drawer').getAttribute('aria-expanded'),'true');
  await page.locator('[data-key=oyun]').click();
  await page.locator('.elde-oyuncak').waitFor();
  assert.equal(await controls('drawer').getAttribute('aria-expanded'),'false');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator(':focus').getAttribute('data-key'),'oyun');
  const tools = await controls('use').evaluateAll(buttons=>buttons.map(b=>b.dataset.key).sort());
  assert.deepEqual(tools,['mama','su','uyku','oyun','kurdele'].sort());
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
  await controls('food').first().tap();
  assert.equal(await controls('give').count(),1);
  await controls('canta-ileri').press('Enter');
  assert.equal(await controls('give').count(),0);
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'food');

  // Exercise real touch input, including capture, cancellation and a missed drop.
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
  // A failed image decode must release the care tools after the saved sip.
  await page.evaluate(()=>{
    const native=HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode=function(){
      if(this.src.includes('bos-kase')){
        HTMLImageElement.prototype.decode=native;
        document.documentElement.dataset.failedBowl='true';
        return Promise.reject(new DOMException('Test: görsel açılamadı','EncodingError'));
      }
      return native.call(this);
    };
  });
  await water.click();await controls('give').click();
  await page.waitForFunction(()=>document.documentElement.dataset.failedBowl==='true'&&!document.querySelector('.bakim-rafi fieldset:disabled'));
  assert.equal(await water.isEnabled(),true);
  await page.locator('[data-key=mama]').click();
  await controls('canta-ileri').click();
  const contents=()=>controls('food').evaluateAll(items=>items.map(item=>item.dataset.food));
  const beforeMarket=await contents();
  await controls('erzak').click();
  await controls('don-sofra').click();
  assert.deepEqual(await contents(),beforeMarket);
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'erzak');

  await controls('erzak').click();
  const purchase=controls('urun-al').and(page.locator(':enabled')).first();
  const product=await purchase.getAttribute('data-key');
  const price=Number(await purchase.getAttribute('data-fiyat'));
  const record=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  const before=await record();
  await purchase.click();
  await page.locator('.cantaya-eklendi').waitFor();
  await controls('don-sofra').click();
  const after=await record();
  assert.equal(after.para,before.para-price);
  assert.equal(after.canta[product],(before.canta[product]??0)+1);
  assert.equal(await page.locator(':focus').getAttribute('data-food'),product);
  assert.equal(await controls('give').count(),0);
  // Changing to a non-product shelf while the purchase waits on storage.
  await controls('erzak').click();
  await page.evaluate(key=>new Promise(acquired=>{
    void navigator.locks.request(key,()=>new Promise(release=>{
      window.releaseTestPurchase=release;acquired();
    }));
  }),key);
  const pending=controls('urun-al').and(page.locator(':enabled')).first();
  const pendingPrice=Number(await pending.getAttribute('data-fiyat'));
  await pending.click();
  await page.locator('[data-act=raf-tab][data-key=hayvan]').click();
  await page.evaluate(()=>window.releaseTestPurchase());
  await page.waitForFunction(expected=>Number(document.querySelector('.cuzdan')?.textContent.trim())===expected,after.para-pendingPrice);
  assert.equal(await page.locator('[data-act=raf-tab][data-key=hayvan]').getAttribute('aria-pressed'),'true');
  await controls('don-sofra').click();
  const selected=await controls('food').first().getAttribute('data-food');
  await controls('food').first().press('Enter');
  assert.equal(await controls('give').count(),1);
  // Another open game uses the final portion before it can be served here.
  const other=await context.newPage();
  await other.goto(new URL('/pati-yeni/README.md',url).href);
  await other.evaluate(([key,id])=>{
    const save=JSON.parse(localStorage.getItem(key));delete save.canta[id];
    localStorage.setItem(key,JSON.stringify(save));
  },[key,selected]);
  await controls('give').waitFor({state:'detached'});
  assert.equal(await page.locator(`[data-food="${selected}"]`).count(),0);
  assert.equal(await page.locator(':focus').getAttribute('data-act'),'food');
  await other.close();
  assert.deepEqual(errors,[]);
  console.log('Bakım rafı, beş ekran boyutu, porsiyon sayfaları, dokunarak sürükleme, iptal ve klavye dönüşü doğrulandı.');
} finally {
  await browser.close();
}
