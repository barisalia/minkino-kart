import {expect,test,type Locator,type Page} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

type Nokta={x:number;y:number};
async function konum(el:Locator,x=.5,y=.5):Promise<Nokta>{
  const r=(await el.boundingBox())!;
  return {x:r.x+r.width*x,y:r.y+r.height*y};
}
async function tasima(page:Page,noktalar:Nokta[],bekleme=0){
  const c=await page.context().newCDPSession(page);
  try{
    for(const [i,n] of noktalar.entries())await c.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[n]});
    if(bekleme)await page.waitForTimeout(bekleme);
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await c.detach();}
}
test('Sütü dök, karıştır, kepçeyi taşı ve kalıbı elle tarçınla',async({page},info)=>{
  await page.routeWebSocket(u=>u.port==='5173',()=>{});
  await page.setViewportSize(info.project.name==='ipad'?{width:844,height:390}:{width:568,height:320});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{tatliSeviye:5,jeton:14,pastane:{acik:true,tezgah:'sutlac',vitrin:{},taslaklar:{}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  const alan=page.locator('.sl-tezgah'),dok=page.locator('.sl-surahi'),pot=page.locator('.sl-ana-tencere');
  const kare=async(n:string)=>{if(process.env.SEF_SUTLAC_KARE)await page.screenshot({path:process.env.SEF_SUTLAC_KARE+'-'+n+'-'+info.project.name+'.png'});};
  await expect(pot).toBeVisible();await kare('sut');
  const dokunus=await page.context().newCDPSession(page);
  try{
    await dokunus.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[await konum(dok)]});
    await dokunus.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[await konum(pot,.46,.34)]});
    const akim=page.locator('.sl-sut-akimi'),uc=page.locator('.sl-surahi-agzi');
    await expect(akim).toBeVisible();
    const hizalama=await uc.evaluate(el=>{
      const tip=el.getBoundingClientRect(),akim=el.closest('.sl-calisma')!.querySelector('.sl-sut-akimi')!.getBoundingClientRect();
      return Math.hypot(tip.x-akim.x-akim.width/2,tip.y-akim.y);
    });expect(hizalama).toBeLessThan(2);await kare('akis');
    await expect(dok).toBeDisabled({timeout:4500});
    await dokunus.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await dokunus.detach();}
  await expect(dok).toBeDisabled();await expect(pot.locator('.sl-sade-sut')).toBeVisible();
  await expect(pot.locator('.sl-islak-pirinc,.sl-dolu-tencere')).toHaveCount(0);await kare('sade-sut');
  await tasima(page,[await konum(page.locator('.sl-pirinc')),await konum(pot)]);
  await page.getByRole('button',{name:'Sütlacı pişirmeye geç'}).tap();
  await expect(alan).toHaveAttribute('data-adim','1');await expect(page.locator('.sl-portatif-ocak')).toBeVisible();
  const kar=page.locator('.sl-karistir');
  const kr=(await kar.boundingBox())!;
  const tur=Array.from({length:47},(_,i)=>({x:kr.x+kr.width*(.50+.22*Math.cos(i*Math.PI/10)),y:kr.y+kr.height*(.40+.19*Math.sin(i*Math.PI/10))}));
  await tasima(page,tur);await expect(kar).toHaveAttribute('data-kivam','ipeksi',{timeout:11000});await kare('pisir');
  await page.getByRole('button',{name:'Ateşi kapat ve kâseye geç'}).tap();
  const kep=page.locator('.sl-kepce'),hedef=page.locator('.sl-hedef-kase');
  for(let i=0;i<3;i++){await tasima(page,[await konum(kep),await konum(hedef)]);await expect(page.locator('.sl-kepce-pot')).toHaveAttribute('data-kalan',String(1-(i+1)*.25));if(i===0){await page.reload();await expect(alan).toHaveAttribute('data-adim','2');}}
  await kare('kepce');await page.getByRole('button',{name:'Tarçın kalıbını seçmeye geç'}).tap();
  await page.getByRole('button',{name:'Çiçek kalıbı'}).tap();
  const tarcin=page.locator('.sl-kalip-alani'),elek=page.locator('.sl-elek');
  const tr=(await tarcin.boundingBox())!;
  const ele=Array.from({length:29},(_,i)=>({x:tr.x+tr.width*(.53+.22*Math.sin(i*Math.PI/3)),y:tr.y+tr.height*.22}));
  await tasima(page,[await konum(elek),...ele]);await kare('tarcin');
  await page.getByRole('button',{name:'Kalıbı kaldır'}).tap();await kare('sun');
  await page.getByRole('button',{name:'Vitrine koy'}).tap();
  const vitrin=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.pastane.vitrin.sutlac);
  expect(vitrin).toHaveLength(1);expect(vitrin[0]).toMatchObject({puan:3,sutlac:{desen:'cicek',doluluk:.75,kivam:'ipeksi'}});
  expect(vitrin[0].sutlac.toz).toBeGreaterThanOrEqual(.65);
});
