import {expect,test} from '@playwright/test';

// Artwork is published to the shared running Vite server while this suite plays.
// Keep the running game on the same page until the player explicitly reloads it.
test.beforeEach(async({page})=>{
  await page.routeWebSocket(url=>url.hostname==='localhost',socket=>socket.connectToServer().onMessage(message=>{
    if(typeof message==='string'&&message.includes('full-reload'))return;
    socket.send(message);
  }));
});

test('Çocuğun süsü vitrinden tadıma taşınır ve eşleşen sipariş yalnız bir bonus jeton verir',async({page})=>{
  await page.setViewportSize({width:667,height:375});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      jeton:10,tatliSeviye:1,secili:'kurabiye',restoranda:true,ekran:'masa',
      restoran:{sira:2,menuId:'kurabiye',sonYemek:'corba-sofrasi',evre:'mutfak'},
      gun:{no:3,ziyaret:0,kazanc:0,kapandi:false},
      masalar:{kurabiye:{tabaklar:{},sunuldu:false,susIstegi:'sus-005'}},
      pastane:{acik:true,tezgah:'kurabiye',taslaklar:{kurabiye:{surum:2,adim:5,yanlis:0}},
        vitrin:{kurabiye:[{puan:3,tabak:'beyaz',sus:'sus-001'}]}}
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await expect(page.locator('.tatli-sus-dugmesi')).toHaveCount(4);
  await page.locator('.tatli-sus-dugmesi').first().click();
  await expect(page.locator('.tatli-katlari .tatli-susu')).toHaveAttribute('data-sus','sus-001');
  await page.getByRole('button',{name:'Sonraki süsler'}).click();
  const yeni=page.locator('button[data-sus="sus-005"]');
  const r=(await page.locator('.pastane-sunum .tatli-katlari').boundingBox())!;
  const b=(await yeni.boundingBox())!;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);
  await page.mouse.down();await page.mouse.move(r.x+r.width/2,r.y+r.height/2,{steps:12});await page.mouse.up();
  await expect(page.locator('.tatli-susu')).toHaveAttribute('data-sus','sus-005');
  await page.getByRole('button',{name:'Sarı servis tabağı'}).click();
  await page.reload();
  await expect(page.locator('button[data-sus="sus-005"]')).toHaveAttribute('aria-pressed','true');
  const cizim=page.locator('.tatli-susu');
  await expect(cizim).toBeVisible();
  expect(await cizim.evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  if(process.env.SEF_SUS_ONIZLEME)await page.locator('.tatli-tezgahi').screenshot({path:process.env.SEF_SUS_ONIZLEME});
  await page.getByRole('button',{name:'Vitrine koy'}).click();
  await page.getByRole('button',{name:'Mutfağa dön'}).click();
  await page.getByRole('button',{name:'Yıldız Kurabiye vitrinden tepsiye al'}).click();
  const vitrin=page.getByRole('dialog',{name:'Vitrinden bir porsiyon seç'});
  await vitrin.locator('button.vitrin-tabagi').filter({has:page.locator('[data-sus="sus-005"]')}).click();
  await expect(page.locator('.tepsi-istek .sus-istek-rozeti')).toHaveAttribute('data-uydu','true');
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.locator('.restoran-tatli-lokmasi')).toHaveAttribute('data-sus','sus-005');
  await expect(page.getByRole('button',{name:/7 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.masalar.kurabiye.odenen).toBe(7);
  expect(t.jeton).toBe(17);expect(t.gun.kazanc).toBe(7);expect(t.gun.ziyaret).toBe(1);
  expect(t.pastane.vitrin.kurabiye.map((p:{sus:string})=>p.sus)).toEqual(['sus-001']);
});

test('Servisi tamamlanan tatlı tekrar süslenince yalnızca aradaki jeton ödenir',async({page})=>{
  await page.setViewportSize({width:568,height:320});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  await page.evaluate(()=>{
    const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
    Object.assign(k.tepsiler,{
      jeton:6,tatliSeviye:1,secili:'kurabiye',restoranda:true,ekran:'masa',
      restoran:{sira:2,menuId:'kurabiye',sonYemek:'corba-sofrasi',evre:'mutfak',sayildi:true},
      gun:{no:3,ziyaret:1,kazanc:6,kapandi:false},
      masalar:{kurabiye:{tabaklar:{kurabiye:true},sunuldu:true,tatliPuani:3,tatliSusu:'sus-001',
        susIstegi:'sus-005',tatliTabagi:'beyaz',odenen:6,sonKazanc:6}},
    });
    localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
  });
  await page.reload();
  await page.getByRole('button',{name:'Yıldız Kurabiye siparişi ile tabağı karşılaştır'}).click();
  const pencere=page.getByRole('dialog');
  await expect(pencere.locator('.tepsi-fis-ornek .tatli-susu')).toHaveAttribute('data-sus','sus-005');
  await expect(pencere.locator('.tepsi-tabak-ornek .tatli-susu')).toHaveAttribute('data-sus','sus-001');
  await page.getByRole('button',{name:'Tatlı süsünü değiştir'}).click();
  await page.getByRole('button',{name:'Sonraki süsler'}).click();
  await page.locator('button[data-sus="sus-005"]').click();
  await page.getByRole('button',{name:'Tatlıyı tepsiye koy'}).click();
  await page.getByRole('button',{name:'Tepsiyi müşteriye sun'}).click();
  await expect(page.getByRole('button',{name:/1 jeton kazanıldı/})).toBeVisible();
  await page.reload();
  const t=await page.evaluate(()=>JSON.parse(localStorage.getItem('minkino-sef-v1')!).tepsiler);
  expect(t.jeton).toBe(7);expect(t.gun.kazanc).toBe(7);expect(t.gun.ziyaret).toBe(1);
  expect(t.masalar.kurabiye.odenen).toBe(7);
});

for(const [i,tarif] of ['kurabiye','dondurma','minik-kek','meyveli-tart'].entries()){
  test(tarif+' süslerinin tamamı yatay telefonda açılır ve tabağın üstünde okunur',async({page})=>{
    await page.setViewportSize({width:568,height:320});
    await page.goto('./sef/?test=1');
    await page.getByRole('button',{name:'Sesi kapat'}).click();
    await page.evaluate(tarif=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      Object.assign(k.tepsiler,{tatliSeviye:4,pastane:{acik:true,tezgah:tarif,taslaklar:{
        [tarif]:{surum:2,adim:tarif==='dondurma'?3:5,yanlis:0}
      },vitrin:{}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    },tarif);
    await page.reload();
    const porsiyon=tarif==='kurabiye'?'.kb-dizi':tarif==='minik-kek'?'.mk-kek':'.tabaktaki-tatli';
    const food=page.locator('.pastane-sunum '+porsiyon);
    const dots=page.locator('.tatli-sus-dugmesi');
    const next=page.getByRole('button',{name:'Sonraki süsler'});
    const visited:string[]=[];
    for(let sayfa=0;sayfa<7;sayfa++){
      const count=await dots.count();
      expect(count).toBe(sayfa===6?1:4);
      for(let j=0;j<count;j++){
        const b=dots.nth(j);
        await b.tap();
        const id=(await b.getAttribute('data-sus'))!;
        expect(visited).not.toContain(id);visited.push(id);
        const sus=page.locator('.tatli-susu');
        await expect(sus).toHaveAttribute('data-sus',id);
        await sus.evaluate(async e=>(e as HTMLImageElement).decode());
        const inside=await sus.evaluate(e=>{
          const r=e.getBoundingClientRect(),base=e.parentElement!.getBoundingClientRect();
          return r.width>12&&r.height>8&&r.left+r.width/2>base.left&&r.right-r.width/2<base.right;
        });
        await expect(food).toBeVisible();
        expect(inside).toBe(true);
      }
      if(sayfa<6)await next.tap();
    }
    expect(visited).toEqual(Array.from({length:25},(_,j)=>'sus-'+String(i*25+j+1).padStart(3,'0')));
    await expect(next).toBeDisabled();
    if(process.env.SEF_SUS_EKRANLARI)await page.locator('.tatli-tezgahi').screenshot({path:process.env.SEF_SUS_EKRANLARI+'/'+tarif+'-susler.png',animations:'disabled'});
  });
}


test('Yeni tatlı sade istenir, sonraki siparişte görsel tercih kayıtla birlikte gelir',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.goto('./sef/?test=1');
  await page.getByRole('button',{name:'Sesi kapat'}).click();
  for(const tanidik of [false,true]){
    await page.evaluate(tanidik=>{
      const k=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      Object.assign(k.tepsiler,{
        jeton:8,tatliSeviye:1,ekran:'masa',restoranda:true,secili:'corba-sofrasi',
        restoran:{sira:2,menuId:'corba-sofrasi',sonYemek:'corba-sofrasi',evre:'mutfak',sayildi:true},
        gun:{no:2,ziyaret:1,kazanc:3,kapandi:false},
        rekorlar:tanidik?{kurabiye:3}:{},
        masalar:{'corba-sofrasi':{tabaklar:{icecek:true},sunuldu:true,odenen:3,sonKazanc:3},
          ...(tanidik?{kurabiye:{tabaklar:{kurabiye:true},sunuldu:true,tatliPuani:3,odenen:6}}:{})},
        pastane:{acik:false,taslaklar:{},vitrin:{}}
      });
      localStorage.setItem('minkino-sef-v1',JSON.stringify(k));
    },tanidik);
    await page.reload();
    await page.getByRole('button',{name:'Sıradaki müşteriyi karşıla'}).click();
    await expect(page.getByRole('button',{name:'Siparişi al ve mutfağa geç'})).toBeVisible({timeout:15000});
    const rozet=page.locator('.restoran-siparis .sus-istek-rozeti');
    await expect(rozet).toHaveCount(tanidik?1:0);
    if(tanidik){
      const id=await rozet.getAttribute('data-sus');
      await page.reload();await expect(rozet).toHaveAttribute('data-sus',id!);
      await page.getByRole('button',{name:'Siparişi al ve mutfağa geç'}).click();
      await expect(page.locator('.tepsi-istek .sus-istek-rozeti')).toHaveAttribute('data-sus',id!);
    }
  }
});
