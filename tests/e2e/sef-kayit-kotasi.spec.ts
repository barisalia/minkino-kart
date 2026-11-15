import {expect,test} from '@playwright/test';

test('Depolama dolarken aynı tabak fotoğrafı bir kez saklanıp tekrar açılır',async({page})=>{
  await page.goto('./sef/?test=1');
  const sonuc=await page.evaluate(async()=>{
    const url='/sef/src/kayit.ts';
    const {defteriAc,kaydet}=await import(url);
    const d=defteriAc();
    const tuval=document.createElement('canvas');tuval.width=tuval.height=160;
    const c=tuval.getContext('2d')!;
    for(let i=0;i<160;i++){c.fillStyle='hsl('+i*2+' 80% 60%)';c.fillRect(i,0,1,160);}
    const resim=tuval.toDataURL('image/png');
    const tabak={tarifId:'makarna',puan:3,resim};
    d.gecmis=[tabak,tabak,tabak];d.tepsiler.jeton=74;
    const yaz=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){
      if(k==='minkino-sef-v1'&&v.length>JSON.stringify(d).length-1)throw new DOMException('Dolu','QuotaExceededError');
      return yaz.call(this,k,v);
    };
    try{
      kaydet(d);
      const ham=JSON.parse(localStorage.getItem('minkino-sef-v1')!);
      const yeni=defteriAc();
      return [ham.surum,ham.fotograflar?.length,yeni.gecmis.every((p:{resim:string})=>p.resim===resim),yeni.gecmis.length,yeni.tepsiler.jeton];
    }finally{Storage.prototype.setItem=yaz;}
  });
  expect(sonuc).toEqual(['fotograf-1',1,true,3,74]);
});
