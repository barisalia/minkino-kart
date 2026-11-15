import {expect,test} from '@playwright/test';

test('Mino kurabiyenin gerçek şeklini, Lokum seçilen dondurmayı kendi sesiyle anlatır',async({page})=>{
  test.setTimeout(120000);
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  const calinan:string[]=[];
  page.on('request',r=>{if(r.url().includes('/musteri-sesi/'))calinan.push(r.url());});
  for(const [tarif,ses,isabet] of [
    ['kurabiye','mino-kalip-kalp',false],['kurabiye','mino-kalip-dogru',true],['dondurma','lokum-dondurma-tat',false],
  ] as const){
    await page.evaluate(([tarif,uydu])=>{
      const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);d.sessiz=false;
      Object.assign(d.tepsiler,{ekran:'masa',secili:tarif,tatliSeviye:3,restoranda:true,
        restoran:{menuId:tarif,sira:3,evre:'mutfak',sayildi:true},
        masalar:{[tarif]:{sunuldu:true,tabaklar:{[tarif]:true},tatliPuani:uydu?3:2,kurabiyeIstegi:'kalp',
          kurabiyeSekli:uydu?'kalp':'yuvarlak',dondurmaIstegi:'vanilya',dondurmaTadi:'cilek'}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
    },[tarif,isabet] as const);
    await page.reload();await page.getByRole('button',{name:'Müşteriyi dinle'}).tap();
    await expect.poll(()=>calinan.some(url=>url.includes('/'+ses+'.mp3')),{timeout:15000}).toBe(true);
    await expect.poll(()=>page.locator('.salon-figur:not(.salon-arkadas) .restoran-oyuncu-bedeni > img').getAttribute('src'),{timeout:6000}).toMatch(/\/oyuncular\/.+-tat-[13]\.webp/);
  }
});
