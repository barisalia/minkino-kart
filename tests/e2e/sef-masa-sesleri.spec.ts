import {expect,test} from '@playwright/test';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {restoranKarakterleri,type SiparisMisafiri} from '../../sef/src/restoran-karakterleri';
// Kayıp bir düğme 120 sn beklemesin: Şef'te her eylem en çok 15 sn, her sayfa açılışı en çok 30 sn bekler.
test.use({actionTimeout:15_000,navigationTimeout:30_000});

const klasor=join(process.cwd(),'sef','src');
const json=(ad:string):Record<string,string>=>JSON.parse(readFileSync(join(klasor,ad+'.json'),'utf8'));
test('Her restoran fişinin kaydı ve konuşma pozu çizilmiş portrelerin ağız ritmi var',()=>{
  const menuler=[...readFileSync(join(klasor,'tepsi-fisleri.ts'),'utf8').matchAll(/id:'([^']+)',misafir:'([^']+)'/g)].map(m=>({id:m[1],tur:m[2]}));
  const siparisler=json('restoran-replikleri'),ritim={...json('musteri-ritmi'),...json('salon-ritimleri')};
  for(const m of menuler)expect(siparisler[m.id],m.id).toBeTruthy();
  for(const id of Object.keys(siparisler)){
    const m=menuler.filter(m=>id===m.id||id.startsWith(m.id+'-')).sort((a,b)=>b.id.length-a.id.length)[0]??
      (id.startsWith('kumpir-')?menuler.find(m=>m.id==='misirli-kumpir'):undefined);
    expect(m,id).toBeTruthy();
    const konuk=restoranKarakterleri[m!.tur as SiparisMisafiri],ad=konuk+'-restoran-'+id;
    const dosya=join('assets/sef',['anne','baba','babaanne','kino'].includes(konuk)?'salon':'musteri-sesi',ad+'.mp3');
    expect(existsSync(dosya)&&statSync(dosya).size>3000,ad).toBe(true);
    if(!['tavsan','bulut','zipzip'].includes(konuk))expect(ritim[ad],ad).toMatch(/^[012]+$/);
  }
  for(const [ad,ritim] of Object.entries(json('masa-ritimleri'))){
    const dosya=join('assets/sef/musteri-sesi',ad+'.mp3');
    expect(statSync(dosya).size,ad).toBeGreaterThan(3000);
    expect(ritim,ad).toMatch(/^[012]+$/);
  }
});

test('Dede salatasını, Mino yanan tavuğu masada kendi sesiyle değerlendirir',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await page.routeWebSocket(url=>url.port==='5173',()=>{});
  const calinan:string[]=[];
  await page.exposeFunction('sefTestindeOynatildi',(url:string)=>calinan.push(url));
  await page.addInitScript(()=>{
    const oynat=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=async function(){
      await oynat.call(this);
      await (window as Window & {sefTestindeOynatildi:(url:string)=>Promise<void>}).sefTestindeOynatildi(this.currentSrc);
    };
  });
  await page.goto('./sef/');
  await page.getByRole('button',{name:'Sesi kapat'}).tap();
  for(const [id,ses] of [['bahce-tabagi','dede-salata-kucuk-tadim'],['fiyonk-tavuk','mino-masa-tavuk-yanik']]){
    await page.evaluate(id=>{
      const d=JSON.parse(localStorage.getItem('minkino-sef-v1')!);d.sessiz=false;
      const sebzeler=['marul','domates','salatalik'];
      const salata={tarifId:'salata',puan:2,istenenSus:'limon',sus:{id:'limon',x:.48,y:.52},salata:{
        tarifId:'salata',aktarilan:sebzeler,alinan:sebzeler,eskiHazir:[],kesimler:{marul:4,domates:4,salatalik:2},kesimBoylari:{salatalik:2},salatalikBoyu:6,karistirma:3,servisEdildi:true,
      }};
      const masa=id==='bahce-tabagi'?{tavukPuani:3,tabaklar:{salata,tavuk:true}}:{tavukPuani:1,tabaklar:{makarna:{tarifId:'makarna',resim:'makarna/makarna',puan:3},tavuk:true}};
      Object.assign(d.tepsiler,{restoranda:true,ekran:'masa',secili:id,restoran:{sira:5,menuId:id,evre:'mutfak',sayildi:true},masalar:{[id]:{...masa,sunuldu:true}}});
      localStorage.setItem('minkino-sef-v1',JSON.stringify(d));
    },id);
    await page.reload();
    await page.getByRole('button',{name:'Müşteriyi dinle'}).tap();
    await expect.poll(()=>calinan.some(url=>url.endsWith('/'+ses+'.mp3'))).toBe(true);
  }
});
