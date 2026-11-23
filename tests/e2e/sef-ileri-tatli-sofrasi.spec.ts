import {expect,test} from '@playwright/test';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

test('Baba vitrindeki yaban mersinli keki pizzadan sonra alır ve tek defa öder',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.routeWebSocket(u=>u.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Restoranı aç'}).waitFor();
  await page.evaluate(async()=>{
    const {kekOrnegi}=await import(new URL('/sef/src/minik-kek.ts',location.href).href);
    const id='baba-pizza-kek';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      jeton:4,tatliSeviye:3,ekran:'masa',secili:id,restoranda:true,restoran:{sira:15,menuId:id,evre:'siparis'},
      gun:{no:6,ziyaret:0,kazanc:0,kapandi:false},
      pastane:{vitrin:{'minik-kek':[{puan:3,tabak:'sari',kek:kekOrnegi('orman')}]}},
      masalar:{[id]:{sunuldu:false,tabaklar:{pizza:{tarifId:'pizza',no:1,ust:[{cesit:'domates',x:30,y:50},{cesit:'peynir',x:34,y:57},{cesit:'zeytin',x:70,y:50}],fis:{malzemeler:['domates','peynir','zeytin'],yarilar:{sol:['domates','peynir'],sag:['zeytin']}},kivam:'tam',puan:3}}}}
    }}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(siparis.locator('.mk-fis')).toHaveAttribute('aria-label',/kakao.*yaban/i);
  await siparis.tap();
  await page.getByRole('button',{name:/vitrinden tepsiye al/i}).tap();
  // Tepsi tamamlanınca masa sahnesi açılır: pizza ve kek müşteriye sunulacak tepside.
  const sunum=page.getByRole('button',{name:'Tepsiyi müşteriye sun'});
  await expect(sunum.locator('.pz-pizza')).toBeVisible();
  await expect(sunum.locator('.pastane-porsiyonu')).toBeVisible();
  await sunum.tap();
  const salon=page.locator('.sirali-servis');

  await salon.locator('[data-yemek=pizza]').tap();
  await expect(salon).toHaveAttribute('data-evre','1');
  await page.reload({waitUntil:'domcontentloaded'});
  const bakiye=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler.jeton);
  expect(await bakiye()).toBe(4);
  await salon.locator('[data-yemek=minik-kek]').tap();
  await expect(page.getByRole('button',{name:/jeton kazanıldı/})).toBeVisible();
  const alindi=await bakiye();expect(alindi).toBeGreaterThan(4);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.getByRole('button',{name:/jeton kazanıldı/})).toBeVisible();
  expect(await bakiye()).toBe(alindi);
});

test('İki ve üç yıldız alan şeflerin tatlıları açma ve gerçek yemeklerden sonra sunma ritmi',async({page})=>{
  await page.goto('./sef/?test=1',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Restoranı aç'}).waitFor();
  const turler=await page.evaluate(async()=>{
    const yukle=(id:string)=>import(new URL('/sef/src/'+id+'.ts',location.href).href);
    const f=await yukle('tepsi-fisleri'),e=await yukle('tatli-ekonomi'),{restoranAc}=await yukle('tepsi-masasi');
    return [2,2.4,3].map(ortalama=>{
      const t=f.bosTepsiler(),acilis:number[]=[],yemekler:string[]=[],gunluk:number[]=[];
      for(let i=0;i<150;i++){
        const gun=Math.floor(i/3)+1;if(i%3===0)t.gun={no:gun,ziyaret:0,kazanc:0,kapandi:false};
        restoranAc(t,i>0,()=>{});
        const m=f.aktifMenu(t),masa=t.masalar[m.id],tatli=f.menuTatlisi(m);
        yemekler.push(m.id);gunluk[gun-1]=(gunluk[gun-1]??0)+Number(!!tatli);
        let toplam=0;
        m.parcalar.forEach((p:string,j:number)=>{
          const y=ortalama===2.4?((i*2+j)%5<2?3:2):ortalama;
          toplam+=y*(e.tatliCarpan[p]??1);masa.tabaklar[p]=true;
        });
        t.jeton+=toplam;t.rekorlar[m.id]=toplam;t.gun.ziyaret++;masa.sunuldu=true;
        f.sofrayiHatirla(t,m.id,masa,i);
        while(e.kilitAc(t))acilis[t.tatliSeviye]=i+1;
      }
      return {ortalama,acilis,ilk:yemekler.slice(0,3),gunlukMax:Math.max(...gunluk),ileri:[...new Set(yemekler.filter(id=>['baba-pizza-kek','babaanne-simit-tart','dede-manti-sutlac'].includes(id)))]};
    });
  });
  console.log('Tatlı açılışları (ziyaret)',JSON.stringify(turler));
  for(const t of turler){
    expect(t.ilk).toEqual(['corba-sofrasi','fiyonk-tavuk','fiyonk-sis']);expect(t.gunlukMax).toBe(1);expect(t.ileri.length).toBe(3);expect(t.acilis).toHaveLength(6);
  }
  expect(turler[0].acilis[5]).toBeGreaterThan(turler[1].acilis[5]);
  expect(turler[1].acilis[5]).toBeGreaterThan(turler[2].acilis[5]);
});
test('Babaanne taze tartında iki muz ve üç yaban mersini görür, Dede kalpli sütlaç ister',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.routeWebSocket(u=>u.searchParams.has('token'),()=>{});
  await page.goto('./sef/?test=1',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:'Restoranı aç'}).waitFor();
  await page.evaluate(()=>{
    const id='babaanne-simit-tart';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{
      jeton:6,tatliSeviye:4,ekran:'masa',secili:id,restoranda:true,restoran:{sira:23,menuId:id,evre:'siparis'},
      masalar:{[id]:{sunuldu:false,tabaklar:{simit:true},simitServisi:{evre:'sun',uzunluk:1,sol:1,sag:1,kaplama:'hashas',isi:3600},tatliTaslagi:{surum:2,adim:4,yanlis:0}}}
    }}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  const siparis=page.getByRole('button',{name:'Siparişi al ve mutfağa geç'});
  await expect(siparis.getByRole('img',{name:'2 Muz, 3 Yaban mersini'})).toBeVisible();
  await siparis.tap();await page.locator('.tepsi-yuva[data-parca=meyveli-tart]').tap();
  const tart=page.locator('.ta-tart');
  const yer=await tart.boundingBox();expect(yer).toBeTruthy();
  for(const [i,meyve] of ['Muz','Muz','Yaban mersini','Yaban mersini','Yaban mersini'].entries()){
    await page.getByRole('button',{name:meyve+' dilimini al'}).tap();
    await page.touchscreen.tap(yer!.x+yer!.width*[.28,.49,.64,.38,.55][i],yer!.y+yer!.height*[.44,.34,.47,.55,.63][i]);
  }
  await page.getByRole('button',{name:'Tartı tabağa al'}).tap();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).tap();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).tap();
  const salon=page.locator('.sirali-servis');
  await salon.locator('[data-yemek=simit]').tap();await expect(salon).toHaveAttribute('data-evre','1');
  const servis=salon.locator('button[data-yemek=meyveli-tart]');
  await expect(servis.locator('.tart-dilimi[data-meyve=yaban]')).toHaveCount(3);
  await servis.tap();await expect(page.getByRole('button',{name:/jeton kazanıldı/})).toBeVisible();
  await page.evaluate(()=>{
    const id='dede-manti-sutlac';
    localStorage.setItem('minkino-sef-v1',JSON.stringify({sessiz:true,tepsiler:{tatliSeviye:5,secili:id,ekran:'masa',restoranda:true,restoran:{sira:28,menuId:id,evre:'siparis'},masalar:{[id]:{sunuldu:false,tabaklar:{}}}}}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(siparis.getByRole('img',{name:/kalp/i}).first()).toBeVisible();
  await siparis.tap();await expect(page.locator('.tepsi-yuva[data-parca=sutlac]')).toBeVisible();
});
