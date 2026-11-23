import {expect,test,type Page,type Locator} from '@playwright/test';
import {simitFisleri,simitPuani,simitOku,yeniSimit,type SimitFisi} from '../../sef/src/simit-tarifi';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

const defter=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
async function merkez(el:Locator){const r=(await el.boundingBox())!;return {x:r.x+r.width/2,y:r.y+r.height/2};}
async function tasi(page:Page,el:Locator,hedef:Locator){
  const a=await merkez(el),b=await merkez(hedef);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:15});await page.mouse.up();
}
async function ac(page:Page,fis:SimitFisi){
  await page.setViewportSize({width:740,height:380});await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(id=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{secili:id,restoranda:true,ekran:'masa',restoran:{sira:6,menuId:id,sonYemek:id,evre:'siparis'},masalar:{[id]:{tabaklar:{},sunuldu:false}}});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  },fis);await page.reload();await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  await page.getByRole('button',{name:'Simit hazırla',exact:true}).click();
}
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',socket=>socket.connectToServer().onMessage(m=>{if(typeof m==='string'&&m.includes('full-reload'))return;socket.send(m);}));
});
for(const fis of ['susamli-simit','hashasli-simit'] as const){
  test(fis+' gerçek sürüklemeyle pişer; seçilen kaplama tadımda ve gün gelirinde korunur',async({page})=>{
    await ac(page,fis);
    const b=page.getByRole('button',{name:'Hamuru sağa sola yuvarla'}),r=(await page.locator('.simit-sekillendir').boundingBox())!;
    const bas=await merkez(b);await page.mouse.move(bas.x,bas.y);await page.mouse.down();
    for(const x of [.86,.12,.88])await page.mouse.move(r.x+r.width*x,bas.y,{steps:14});
    await page.mouse.up();
    const hedef=page.locator('.simit-hedef');
    await tasi(page,page.getByRole('button',{name:'Sol hamur ucunu birleştir'}),hedef);
    await page.reload();
    await expect(page.locator('.simit-ucu[data-yon="-1"]')).toHaveAttribute('data-bagli','true');
    if(process.env.TOST_ONIZLEME&&fis==='susamli-simit')await page.screenshot({path:process.env.TOST_ONIZLEME+'/simit-halka.png'});
    await tasi(page,page.getByRole('button',{name:'Sağ hamur ucunu birleştir'}),hedef);
    const sec='susam'; // Mino deliberately receives the other coating.
    const kap=page.locator('.simit-kap[data-kaplama="'+sec+'"]');
    if(fis==='susamli-simit')await tasi(page,page.getByRole('button',{name:'Simidi kaplama kabına batır'}),kap);
    else await kap.click();
    await expect(kap).toHaveAttribute('aria-pressed','true');
    if(process.env.TOST_ONIZLEME&&fis==='susamli-simit')await page.screenshot({path:process.env.TOST_ONIZLEME+'/simit-kaplama.png'});
    await page.getByRole('button',{name:'Simidi fırına ver'}).click();
    await page.getByRole('button',{name:'Simidi pişirmeye başla'}).click();
    if(fis==='susamli-simit'){
      const arkaPlan=(arkada:boolean)=>page.evaluate(v=>window.dispatchEvent(new CustomEvent('minkino:arkaplan',{detail:{arkada:v}})),arkada);
      const saat=page.getByRole('meter');
      await expect(saat).not.toHaveAttribute('aria-valuenow','0');
      await arkaPlan(true);
      const kaldigiYer=await saat.getAttribute('aria-valuenow');
      await page.waitForTimeout(800);
      await expect(saat).toHaveAttribute('aria-valuenow',kaldigiYer!);
      await arkaPlan(false);
    }
    await expect(page.getByRole('meter')).toHaveAttribute('aria-valuetext','Altın renginde');
    await page.getByRole('button',{name:'Simidi fırından çıkar'}).click();
    await page.getByRole('button',{name:'Simidi tepsiye koy'}).click();
    // Tepsi tamamlanınca masa sahnesi açılır; seçilen kaplama müşteriye sunulacak tepside.
    const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
    await expect(sunum.locator('.simit-halkasi')).toHaveAttribute('data-kaplama',sec);
    await sunum.click();
    await expect(page.locator('.restoran-lokma .simit-halkasi')).toHaveAttribute('data-kaplama',sec);
    await expect(page.locator('.tepsi-yuva .simit-isirildi')).toBeVisible();
    await page.reload();const t=await defter(page);
    const puan=fis==='susamli-simit'?3:2;
    expect(t.masalar[fis].simitPuan).toBe(puan);expect(t.jeton).toBe(puan);expect(t.gun.kazanc).toBe(puan);
  });
}
test('Pişirme ve farklı sipariş seçimi ile puan değişir; bozuk kayıt aşamayı atlayamaz',()=>{
  for(const [id,hedef] of Object.entries(simitFisleri)){
    const t={...yeniSimit(),kaplama:hedef.kaplama,isi:3000};
    expect(simitPuani(t,id as SimitFisi)).toBe(3);t.isi=8000;expect(simitPuani(t,id as SimitFisi)).toBe(2);
    t.kaplama=t.kaplama==='susam'?'hashas':'susam';expect(simitPuani(t,id as SimitFisi)).toBe(1);
  }
  expect(simitOku({evre:'sun',isi:8000})?.evre).toBe('uzat');
});
