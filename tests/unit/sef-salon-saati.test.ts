import { afterAll, describe, expect, it, vi } from 'vitest';
import {bosMasa,bosTepsiler,sonrakiMenu,tepsileriOku} from '../../sef/src/tepsi-fisleri';
import {salonSaatiniIlerlet} from '../../sef/src/salon-saati';

vi.hoisted(()=>{vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('document',new EventTarget());});
afterAll(()=>vi.unstubAllGlobals());

function salonAc(){
  const t=bosTepsiler();
  t.restoran={sira:0,menuId:'corba-sofrasi',evre:'siparis'};
  t.masalar['corba-sofrasi']=bosMasa();
  t.secili='corba-sofrasi';t.ekran='fisler';t.yanMasadan=true;
  return t;
}

describe('Yan salon müşterileri',()=>{
  it('yan masada oturan kişi başka yemekle ana masada tekrar belirmez',()=>{
    const t=salonAc();
    const siradaki=sonrakiMenu(t);
    expect(siradaki.misafir).toBe('salata');
    t.salonKoltuklari=['kahvalti',null,null,null,null,null];
    expect(sonrakiMenu(t).misafir).not.toBe('salata');
  });
  it('ilk iki müşteri ayrı salonlarda oturur, doluluk ikiyle sınırlıdır',()=>{
    const t=salonAc();
    expect(salonSaatiniIlerlet(t).gelen).toBe('tavsan-salata');
    for(let i=0;i<8;i++)salonSaatiniIlerlet(t);
    expect(t.salonKoltuklari?.slice(0,3).filter(Boolean)).toEqual(['tavsan-salata']);
    expect(t.salonKoltuklari?.slice(3).filter(Boolean)).toEqual(['seftali-makarna']);
  });
  it('yanlış tabağı alan müşteri yemek yerken başka bir masaya tekrar gelmez',()=>{
    const t=salonAc();
    t.secili='tavsan-salata';
    t.ekran='masa';
    t.masalar[t.secili]={...bosMasa(),sunuldu:true,servisKoltugu:3,teslimAlan:'seftali'};
    t.konukSirasi=1;
    t.salonGelisSn=25;
    expect(salonSaatiniIlerlet(t).gelen).toBe('zipzip-makarna');
    expect(t.salonKoltuklari?.[3]).toBeNull();
  });
  it('seçilen yemeği hazırlarken konuk bekler, geri kalan müşteriler ayrılır',()=>{
    const t=salonAc();
    for(let i=0;i<5;i++)salonSaatiniIlerlet(t);
    t.secili='tavsan-salata';t.ekran='kapali';t.oynanan='salata';
    for(let i=0;i<26;i++)salonSaatiniIlerlet(t);
    expect(t.salonKoltuklari).toContain('tavsan-salata');
    expect(t.salonKoltuklari).not.toContain('seftali-makarna');
    expect(t.itibar).toBe(45);
  });
  it('yeniden açılınca kalan bekleme süresi korunur ve kayıp bir kez uygulanır',()=>{
    const ilk=salonAc();salonSaatiniIlerlet(ilk);
    ilk.salonBekleme!['tavsan-salata']=115;
    const t=tepsileriOku(ilk,()=>undefined);
    expect(salonSaatiniIlerlet(t).bekleyen).toContainEqual({id:'tavsan-salata',sure:120});
    expect(salonSaatiniIlerlet(t).ayrildi).toEqual(['tavsan-salata']);
    salonSaatiniIlerlet(t);
    expect(t.itibar).toBe(45);
  });
  it('pastanede ve gün kapanışında müşteri sabrı ilerlemez',()=>{
    const t=salonAc();salonSaatiniIlerlet(t);
    t.pastane.acik=true;salonSaatiniIlerlet(t);
    t.pastane.acik=false;t.gun.kapandi=true;salonSaatiniIlerlet(t);
    expect(t.salonBekleme?.['tavsan-salata']).toBe(0);
  });
  it('düşük itibar sıradaki müşterinin gelişini geciktirir',()=>{
    function sure(itibar:number){
      const t=salonAc();t.itibar=itibar;salonSaatiniIlerlet(t);
      for(let sn=5;sn<=30;sn+=5)if(salonSaatiniIlerlet(t).gelen)return sn;
      throw Error('Yeni müşteri gelmedi');
    }
    expect(sure(20)).toBeGreaterThan(sure(80));
  });
});

