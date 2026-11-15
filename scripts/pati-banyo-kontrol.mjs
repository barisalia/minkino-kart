import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({channel:'msedge'});
const page = await browser.newPage({viewport:{width:667,height:375},hasTouch:true,reducedMotion:'reduce'});
const url = (process.env.PATI_TEST_URL || 'http://localhost:5173') + '/pati/';
const key='pati-yeni-ilerleme-v1';
const act=(name,id)=>page.locator(`[data-act="${name}"]`+(id?`[data-key="${id}"]`:''));
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
page.setDefaultTimeout(6000);
page.setDefaultNavigationTimeout(45000);

try {
  await page.goto(url,{waitUntil:'domcontentloaded'});
  const touch=await page.context().newCDPSession(page);
  async function contact(type,x,y){
    await touch.send('Input.dispatchTouchEvent',{type,touchPoints:x===undefined?[]:[{x,y}]});
  }
  for(const id of ['kopek','kedi-5','tavsan-5','hamster-3']){
    await page.evaluate(([key,id])=>localStorage.setItem(key,JSON.stringify({
      para:15,gun:2,hayvanlar:{[id]:{gun:2,kirGun:3}},canta:{}
    })),[key,id]);
    await page.reload({waitUntil:'domcontentloaded'});
    if(id.startsWith('tavsan'))await act('oda','bahce').click();
    await act('pet',id).click();
    await act('banyo').press('Enter');
    assert.equal(await page.locator(':focus').getAttribute('data-key'),'firca');
    await act('drawer').click();
    const handle=await act('drawer').boundingBox();
    await contact('touchStart',handle.x+handle.width/2,handle.y+handle.height/2);
    await contact('touchMove',handle.x+handle.width/2,handle.y-20);
    await contact('touchEnd');
    await act('use','firca').press('Enter');
    await page.locator('.dok-yuzey[data-ready=true]').waitFor();
    assert.equal(await page.locator(':focus').getAttribute('class'),'dok-yuzey');
    if(id==='kopek'){
      const toolX=()=>page.locator('.dok-gerec').evaluate(el=>parseFloat(el.style.left));
      const oldX=await toolX();
      await page.setViewportSize({width:844,height:390});
      await page.waitForFunction(oldX=>Math.abs(parseFloat(document.querySelector('.dok-gerec').style.left)-oldX)>30,oldX);
      assert.equal(await page.locator('progress').evaluate(meter=>meter.value),0);
      await page.setViewportSize({width:667,height:375});
      await page.waitForFunction(oldX=>Math.abs(parseFloat(document.querySelector('.dok-gerec').style.left)-oldX)<3,oldX);
      // Finish while another transaction holds the save, then immediately
      // restart the same brush. The old completion must not close the new bath.
      await page.evaluate(key=>new Promise(acquired=>{
        void navigator.locks.request(key,()=>new Promise(release=>{
          window.releaseBathTest=release;acquired();
        }));
      }),key);
      await page.getByRole('button',{name:'Bakıma geri dön'}).click();
      await page.keyboard.press('Escape');
      await act('use','firca').press('Enter');
      await page.locator('.dok-yuzey[data-ready=true]').waitFor();
      await page.evaluate(async key=>{window.releaseBathTest();await navigator.locks.request(key,()=>{});},key);
      assert.equal(await page.locator('.sayfa-banyo .dokunus[data-phase=firca]').count(),1);
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator(':focus').getAttribute('data-key'),'firca');
    await act('use','sampuan').tap();
    const surface=page.locator('.dok-yuzey[data-ready=true]');
    await surface.waitFor();
    const pet=await page.locator('.buyuk').boundingBox();
    const rinse=page.getByRole('button',{name:'Durula',exact:true});
    assert.equal(await rinse.isDisabled(),true);
    const foam=page.locator('.dok-kopuk');
    await contact('touchStart',pet.x+2,pet.y+3);
    for(let i=1;i<18&&await rinse.isDisabled();i++){
      const y=pet.y+pet.height*i/18;
      await contact('touchMove',pet.x+pet.width*.09,y);
      await contact('touchMove',pet.x+pet.width*.91,y);
    }
    await contact('touchEnd');
    assert.equal(await page.locator('.dok-gerec').evaluate(el=>getComputedStyle(el).opacity),'0');
    const percent=await page.locator('progress').evaluate(meter=>meter.value);
    assert.ok(percent>=22&&percent<85,`${id} sabun: ${percent}`);
    const drops=await foam.evaluateAll(nodes=>nodes.map(node=>{
      const r=node.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};
    }));
    await rinse.tap();
    await page.locator('.dokunus[data-phase=durula]').waitFor();
    assert.equal(await page.locator('progress').evaluate(meter=>meter.value),0);
    let intermediate=false;
    for(const {x,y} of drops){
      if(!await surface.count())break;
      await contact('touchStart',x-3,y);await contact('touchMove',x+3,y);await contact('touchEnd');
      const remaining=await foam.count();
      if(remaining>0&&remaining<drops.length&&!intermediate){
        const shown=await page.locator('progress').evaluate(meter=>meter.value);
        assert.equal(shown,Math.round(100*(drops.length-remaining)/drops.length));
        intermediate=true;
      }
    }
    assert.equal(intermediate,true);
    await page.locator('.sayfa-bakim .bakim-onayi').waitFor();
    await act('banyo').focus();
    const drawerButton=await act('banyo').elementHandle();
    await page.locator('.bakim-onayi').waitFor({state:'detached'});
    assert.equal(await drawerButton.evaluate(el=>el.isConnected&&el===document.activeElement),true);
    await drawerButton.dispose();
    const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    assert.equal(saved.defter[id].sampuan,Math.round(percent/10),id);
    assert.equal(saved.para,15);
    console.log(id,percent+'% yıkandı',saved.defter[id].sampuan+' / 10');
  }
  assert.deepEqual(errors,[]);
} finally {
  await browser.close();
}
