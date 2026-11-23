import {expect,test,type Locator,type Page} from '@playwright/test';
import {menemenOku,menemenPuani,yeniMenemen} from '../../sef/src/menemen-tarifi';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

async function parmak(page:Page,hedef:Locator,noktalar:number[][]){
  const r=(await hedef.boundingBox())!;
  const c=await page.context().newCDPSession(page);
  try{
    for(const [i,[x,y]] of noktalar.entries())await c.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[{x:r.x+r.width*x,y:r.y+r.height*y}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
test('Menemen kaydı eksik adımları atlayamaz ve iki bağımsız müşteri tercihi puanlanır',()=>{
  const t=yeniMenemen();
  expect(menemenOku({...t,evre:'sun',sure:7500,yumurta:2})?.evre).toBe('dogra');
  const tabak=menemenOku({...t,evre:'sun',sebzeler:['domates','biber'],sote:1,yumurta:2,sure:6300})!;
  expect(menemenPuani(tabak,'biberli-menemen')).toBe(3);expect(menemenPuani(tabak,'sade-menemen')).toBe(1);
  expect(menemenPuani({...tabak,sure:2200,sebzeler:['domates']},'sade-menemen')).toBe(3);
});
test('Menemen tahtadan tepsiye parmakla hazırlanır; ortadaki kesik, sipariş ve kıvam korunur',async({page},info)=>{
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.setViewportSize(info.project.name==='ipad'?{width:844,height:390}:{width:568,height:320});
  await page.goto('./sef/');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.getByRole('button',{name:'Sonraki tarif rafı'}).tap();
  const raf=page.locator('.siparisler[data-raf="2"]');
  await expect(raf.getByRole('button')).toHaveCount(9);
  for(const b of await raf.getByRole('button').all()){
    const r=(await b.boundingBox())!;expect(r.height).toBeGreaterThanOrEqual(44);expect(r.y+r.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  }
  await page.getByRole('button',{name:'Menemen tezgâhını aç'}).tap();
  const ekran=page.locator('.mn-tezgah'),kes=ekran.locator('.mn-kes');
  await expect(ekran).toBeVisible();
  for(const tur of ['Domates','Yeşil biber']){
    await page.getByRole('button',{name:tur+' tahtaya al'}).tap();
    await parmak(page,kes,[[.03,.12],[.03,.88]]);
    await expect(kes.locator('.mn-kes-izi')).toHaveCount(3);
    for(const [i,x] of [.5,.27,.73].entries()){
      await parmak(page,kes,[[x,.13],[x,.38],[x,.63],[x,.87]]);
      if(tur==='Domates'&&i===0){await page.reload();await expect(kes.locator('.mn-kes-izi')).toHaveCount(2);}
    }
    if(process.env.SEF_MENEMEN_KARE&&tur==='Domates')await page.screenshot({path:process.env.SEF_MENEMEN_KARE+'-dogra-'+info.project.name+'.png'});
    await page.getByRole('button',{name:'Kesilmiş parçaları sahana al'}).tap();
  }
  await page.getByRole('button',{name:'Sebzeleri sotelemeye geç'}).tap();
  const karistir=page.getByRole('button',{name:'Sebzeleri kaşıkla sotele'});
  const daire=Array.from({length:54},(_,i)=>[.50+.24*Math.cos(i*Math.PI/10),.48+.21*Math.sin(i*Math.PI/10)]);
  await parmak(page,karistir,daire);await expect(ekran).toHaveAttribute('data-evre','kir');
  await page.getByRole('button',{name:'1. yumurtayı sahana kır'}).tap();
  await page.getByRole('button',{name:'2. yumurtayı sahana kır'}).tap();
  await expect(ekran.locator('.mn-buyuk-sahan')).toHaveAttribute('data-kivam','tam',{timeout:8500});
  await page.getByRole('button',{name:'Ocağı kapat'}).tap();
  if(process.env.SEF_MENEMEN_KARE)await page.screenshot({path:process.env.SEF_MENEMEN_KARE+'-servis-'+info.project.name+'.png'});
  await page.getByRole('button',{name:'Menemeni tepsiye koy'}).tap();
  // Son tabak konunca masa sahnesi açılır: menemen, müşteriye sunulacak tepside aynı kıvamda ve üç kaşığın biberleriyle durur.
  const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
  await expect(sunum.locator('.mn-sahan')).toHaveAttribute('data-kivam','tam');
  await expect(sunum.locator('.mn-sahan .mn-tane')).toHaveCount(3);
  // Masa ekranında mutfak arka planı (img.dekor) kaynaksız ve gizli; yalnız görünen çizimler denetlenir.
  const hata=await page.locator('img:visible').evaluateAll(resimler=>resimler.filter(r=>r.isConnected&&r.complete&&!r.naturalWidth).map(r=>r.src));
  expect(hata).toEqual([]);
  await page.reload();
  const masa=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.masalar['biberli-menemen']);
  expect(masa.menemenPuan).toBe(3);expect(masa.menemenServisi.sebzeler).toEqual(['domates','biber']);expect(masa.menemenTaslagi).toBeUndefined();
});
