import {expect,test} from '@playwright/test';

test('Küçük yatay telefonda sayfa, tarif bölümü ve resimli adımlar erişilebilir',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/?test=1');await page.getByRole('button',{name:'Sesi kapat'}).tap();
  await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
  const kitap=page.getByRole('dialog',{name:'Resimli tarifler'});
  await expect(kitap.locator('.kitap-yemek')).toHaveCount(6);
  async function tusBoylari(){
    const kucuk=await kitap.locator('button:visible').evaluateAll(bs=>bs.filter(b=>{
      const r=b.getBoundingClientRect();return r.width<43.9||r.height<43.9||r.bottom>innerHeight||r.right>innerWidth;
    }).map(b=>b.getAttribute('aria-label')));
    expect(kucuk).toEqual([]);
  }
  await tusBoylari();
  if(process.env.SEF_KITAP_KARE)await page.screenshot({path:process.env.SEF_KITAP_KARE+'/tarif-kitabi-cep.png'});
  await kitap.getByRole('button',{name:'Sonraki tarif sayfası'}).tap();
  await expect(kitap.getByRole('status')).toHaveText('2 / 3');
  await kitap.getByRole('button',{name:'Mantı tarifini incele'}).press('Enter');
  await expect(kitap.locator('.kitap-adim-karti')).toHaveCount(4);
  await kitap.getByRole('button',{name:'3. adımı aç'}).tap();
  await expect(kitap.locator('.kitap-resim>img')).toHaveAttribute('src',/manti-3/);
  await expect(kitap.getByRole('button',{name:'3. adımı aç'})).toHaveAttribute('aria-current','step');
  await tusBoylari();
  if(process.env.SEF_KITAP_KARE)await page.screenshot({path:process.env.SEF_KITAP_KARE+'/tarif-kitabi-manti.png'});
  await kitap.getByRole('button',{name:'Tarif kitabını kapat'}).tap();
  await page.reload();await page.getByRole('button',{name:'Resimli tarif kitabı'}).tap();
  await kitap.getByRole('button',{name:'Sonraki tarif sayfası'}).tap();
  await expect(kitap.getByRole('button',{name:'Mantı tarifini incele'})).toHaveAccessibleDescription('3. adımda kaldın.');
  await kitap.getByRole('button',{name:'Mantı tarifini incele'}).tap();
  await expect(kitap.getByRole('button',{name:'3. adımı aç'})).toHaveAttribute('aria-current','step');
  await kitap.getByRole('button',{name:'1. adımı aç'}).press('Enter');
  await kitap.getByRole('button',{name:'Tariflere dön'}).press('Enter');
  await expect(kitap.getByRole('button',{name:'Mantı tarifini incele'})).toBeFocused();
  await kitap.getByRole('button',{name:'Pastane tariflerini aç'}).tap();
  await expect(kitap.locator('.kitap-yemek')).toHaveCount(5);
  await expect(kitap.getByRole('button',{name:'Kalıplı Kurabiye tarifini incele'})).toBeVisible();
  await kitap.getByRole('button',{name:'Kalıplı Kurabiye tarifini incele'}).tap();
  await kitap.getByRole('button',{name:'Kalp sayfalarını göster'}).tap();
  await kitap.getByRole('button',{name:'2. adımı aç'}).tap();
  await expect(kitap.locator('.kitap-resim>img')).toHaveAttribute('src',/kurabiye-kalp-2/);
  await kitap.getByRole('button',{name:'4. adımı aç'}).tap();
  await expect(kitap.locator('.kitap-resim>img')).toHaveAttribute('src',/kurabiye-kalp-4/);
  await tusBoylari();
  if(process.env.SEF_KITAP_KARE)await page.screenshot({path:process.env.SEF_KITAP_KARE+'/tarif-kitabi-kalp.png'});
  await kitap.getByRole('button',{name:'Yuvarlak sayfalarını göster'}).tap();
  await expect(kitap.locator('.kitap-resim>img')).toHaveAttribute('src',/kurabiye-yuvarlak-4/);
  await kitap.getByRole('button',{name:'1. adımı aç'}).tap();
  await kitap.getByRole('button',{name:'Tariflere dön'}).tap();
  await kitap.getByRole('button',{name:'Mutfak tariflerini aç'}).tap();
  await expect(kitap.getByRole('status')).toHaveText('1 / 3');
  await page.setViewportSize({width:844,height:390});
  await expect(kitap.locator('.kitap-yemek')).toHaveCount(10);
  await tusBoylari();
});
