import {test,expect} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Servis jetonunu bir kez öder, satın alınan ilk tatlı sıradaki siparişe girer',async({page})=>{
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.getByRole('button',{name:/Tatlı atölyesini aç/i}).click();
  await expect(page.locator('.tatli-vitrin-karti:enabled')).toHaveCount(0);
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Restoranı aç'}).click();
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  // A returning chef has six coins and an open soup order on day two. The
  // fixed first-day introduction was completed before the unlock.
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    k.tepsiler.jeton=6;
    k.tepsiler.gun={no:2,ziyaret:0,kazanc:0,kapandi:false};
    k.tepsiler.restoran.sira=3;
    Object.assign(k.tepsiler.masalar['corba-sofrasi'],{tabaklar:{icecek:true},icecekMeyvesi:'limon',icecekPuani:3});
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:'Eksik tepsiyi şimdi sun'}).click();
  const odul=page.getByRole('button',{name:/3 jeton kazanıldı/});
  await expect(odul).toBeVisible();
  await page.reload();await odul.click();
  const kasa=page.locator('.tatli-cuzdan');
  await expect(kasa).toHaveText('9');
  await page.locator('[data-kademe="0"]').click();
  await expect(kasa).toHaveText('3');
  await page.locator('[data-kademe="1"]').click();
  await expect(kasa).toHaveText('0');
  await expect(page.locator('[data-kademe="2"]')).toBeDisabled();
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
  await page.getByRole('button',{name:'Yıldız Kurabiye hazırla',exact:true}).click();
  const izle=async(ad:string,n:number)=>{for(let i=0;i<n;i++)await page.getByRole('button',{name:ad,exact:true}).press('Enter');};
  await izle('Hamuru merdaneyle aç',5);
  await expect(page.getByRole('button',{name:'Yıldız kalıp'})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Yıldız kalıp'}).click();
  for(let i=0;i<3;i++){await expect(page.locator('.kb-bas')).toHaveAttribute('data-yer',String(i));await expect(page.locator('.kb-bas')).toBeEnabled();await page.locator('.kb-bas').press('Enter');}
  for(let i=0;i<3;i++){
    const kurabiye=page.getByRole('button',{name:(i+1)+'. kurabiyeyi tepsiye taşı'});
    await expect(kurabiye).toBeEnabled();await kurabiye.press('Enter');await expect(kurabiye).toHaveCount(0);
  }
  await page.getByRole('button',{name:'Tepsiyi fırına koy'}).click();
  await expect(page.locator('.ta-firin-istasyonu')).toHaveAttribute('data-evre','hazir');
  await page.getByRole('button',{name:'Tepsiyi fırından çıkar'}).click();
  for(let i=0;i<3;i++){await page.locator('.kb-sec').nth(i).click();await page.locator('.kb-editor').press('Enter');}
  await page.getByRole('button',{name:'Kurabiyeleri tabağa diz'}).click();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await page.getByRole('button',{name:/6 jeton kazanıldı/}).click();
  await expect(kasa).toHaveText('6');
});
