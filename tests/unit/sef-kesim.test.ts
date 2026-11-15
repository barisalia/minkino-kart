import { describe, it, expect } from 'vitest';
import { parcalariKur, serbestKes, ayir, ornekKesim, salataKesimi, topla, type Kesim } from '../../sef/src/kesim-geometri';
import type { MalzemeId } from '../../sef/src/tarif';

describe('Kesme tahtasında serbest kesit', () => {
  for(const id of ['salatalik','domates','havuc','patates','marul'] as const){
    it(id+' için her üç boyda kılavuzun gösterdiği kesim uygulanabilir',()=>{
      for(const hedef of [2,4,6]){
        let parcalar=parcalariKur(id,0);
        for(let n=0;n<hedef;n++){
          const k=salataKesimi(parcalar,id,hedef+1),yer=parcalar[k.parca].konum;
          const okunan=serbestKes(parcalar,[topla(k.a,yer),topla(k.b,yer)]);
          expect(okunan).toBeDefined();parcalar=ayir(parcalar,okunan!);
        }
        expect(parcalar).toHaveLength(hedef+1);
      }
    });
  }
  for(const id of ['salatalik','domates','marul'] as const) {
    it(id+' için dört gerçek kılavuz kesimiyle dengeli beş salata parçası çıkarır',()=>{
      let parcalar=parcalariKur(id,0);
      const kayit:Kesim[]=[];
      for(let i=0;i<4;i++){
        const k=salataKesimi(parcalar,id),d=parcalar[k.parca].konum;
        const gercek=serbestKes(parcalar,[topla(k.a,d),topla(k.b,d)]);
        expect(gercek?.parca).toBe(k.parca);
        if(id==='salatalik')expect(Math.abs((k.b.y-k.a.y)/(k.b.x-k.a.x))).toBeCloseTo(Math.tan(63*Math.PI/180),7);
        kayit.push(gercek!);parcalar=ayir(parcalar,gercek!);
      }
      const alanlar=parcalar.map(({et})=>Math.abs(et.reduce((s,n,i)=>s+n.x*et[(i+1)%et.length].y-n.y*et[(i+1)%et.length].x,0)));
      expect(Math.max(...alanlar)/Math.min(...alanlar)).toBeLessThan(1.32);
      expect(parcalariKur(id,4,kayit)).toEqual(parcalar);
    });
  }
  for (const id of ['domates','salatalik','havuc','patates','marul'] as MalzemeId[]) {
    it(id + ' için serbest el kesişinden sonra beş lokmalık parçayı aynı konumda geri getirir', () => {
      const ilk = parcalariKur(id,0);
      let kabul = 0;
      for(let derece=0; derece<180; derece+=9) {
        const aci= Math.PI* derece/180;
        for(const x of [184,268,372,445]) {
          const dx=750*Math.cos(aci), dy=750*Math.sin(aci);
          const iz=[{x:x-dx,y:253-dy},{x:x+dx,y:253+dy}];
          const k=serbestKes(ilk,iz);
          if(!k) continue;
          kabul++;
          const ters = serbestKes(ilk,[iz[1],iz[0]])!;
          expect(ters.a.x).toBeCloseTo(k.a.x,4);
          expect(ters.a.y).toBeCloseTo(k.a.y,4);
          const kesitler=[k];
          let parcalar=ayir(ilk,k);
          while(kesitler.length<4) {
            const rehber=ornekKesim(parcalar,id);
            const konum=parcalar[rehber.parca].konum;
            const yeni=serbestKes(parcalar,[topla(rehber.a,konum),topla(rehber.b,konum)]);
            expect(yeni).toBeDefined();
            kesitler.push(yeni!);
            parcalar=ayir(parcalar,yeni!);
            expect(parcalar).toHaveLength(kesitler.length+1);
          }
          expect(parcalariKur(id,4,JSON.parse(JSON.stringify(kesitler)))).toEqual(parcalar);
        }
      }
      expect(kabul).toBeGreaterThan(25);
    }, 20000);
  }
  it('saydam köşe, kısa çizik ve gidip gelmede kesim saymaz', () => {
    const s=parcalariKur('salatalik',0);
    expect(serbestKes(s,[{x:1,y:2},{x:50,y:2}])).toBeUndefined();
    expect(serbestKes(s,[{x:240,y:242},{x:245,y:245}])).toBeUndefined();
    expect(serbestKes(s,[{x:30,y:240},{x:320,y:240},{x:30,y:240}])).toBeUndefined();
  });
  it('eski kayıttaki yalnız sayaçtan ve hatalı kesit bilgisinden oynanabilir parçalar kurar',()=>{
    expect(parcalariKur('havuc',1)).toHaveLength(2);
    expect(parcalariKur('marul',2,[{parca:99} as Kesim])).toHaveLength(3);
  });
});
