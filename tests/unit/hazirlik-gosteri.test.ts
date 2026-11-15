import {describe,it,expect} from 'vitest';
import {gosteriOku,puan,yeniGosteri,ilkSahneVurusu,programDeseni,type Gosteri} from '../../hazirlik/src/gosteri-kaydi';
import {kresOku,yeniOkulGunu} from '../../hazirlik/src/kres-kaydi';
import {dansCumlesi,sonDansAdimlari,kendiDansKesiti,sarkiSelami} from '../../hazirlik/src/gosteri-koreografi';

describe('Yıl sonu gösterisinin kaydı',()=>{
  it('Şarkı selamı yalnızca çocuğun yakaladığı sesleri, Zıpzıp ve Kino sırasıyla çalar',()=>{
    const desen=programDeseni('sarki','dort');
    const iz=[{sira:7,el:0 as const,fark:.21},{sira:6,el:3 as const,fark:.12},{sira:5,el:1 as const,fark:0}];
    expect(sarkiSelami(desen,iz)).toEqual([
      {el:3,vurus:60,kim:'zip'},{el:0,vurus:61,kim:'zip'},
      {el:3,vurus:62,kim:'kino'},{el:0,vurus:63,kim:'kino'},
    ]);
    expect(sarkiSelami(desen,iz.slice(0,1)).map(n=>n.el)).toEqual([0,0,0,0]);
    expect(sarkiSelami(desen,[{sira:7,el:1,fark:0}])).toEqual([]);
  });
  it('Albümde aynı hareket tekrarlanabilir ve sonraki gün özgün dansın ölçüsü korunur',()=>{
    const ani={dal:'dans' as const,puan:0,renk:'sari' as const,dokunuslar:[],dansDizisi:[2,0,12,0,3,1]};
    const k=kresOku({evAlbumu:[{gun:1,dal:'dans',puan:0,ani}]});
    const dizi=yeniOkulGunu(k).evAlbumu[0].ani!.dansDizisi!;
    expect(dizi).toEqual([2,0,0,3]);
    expect(kendiDansKesiti(dizi)).toEqual({bas:54,iz:[{el:2,vurus:54},{el:0,vurus:56},{el:0,vurus:58},{el:3,vurus:60}]});
    const sarki={...ani,dal:'sarki' as const};
    expect(kresOku({evAlbumu:[{gun:1,dal:'sarki',puan:0,ani:sarki}]}).evAlbumu[0].ani?.dansDizisi).toBeUndefined();
  });
  it('Kapanış çocuğun yakaladığı son iki farklı hareketi sahne sırasıyla tekrarlar',()=>{
    const desen=programDeseni('dans','dort');
    const sonuc=sonDansAdimlari(desen,[{sira:4,el:2,fark:0},{sira:5,el:0,fark:.5},{sira:7,el:2,fark:.3}]);
    expect(sonuc).toEqual([2,0,2,3]);
    expect(sonDansAdimlari(desen,[])).toEqual([0,1,2,3]);
    const alkis=dansCumlesi(0,104);
    expect([alkis.kino[alkis.temas],alkis.zip[alkis.temas]]).toEqual([6,2]);
  });
  it('Her yarıda dört hareket görülür ve üçüncü ile dördüncü tuş albüme gerçek vuruşuyla kaydolur',()=>{
    for(const program of ['dort','dort-yanki'] as const)for(const dal of ['dans','sarki'] as const){
      const d=programDeseni(dal,program);
      for(const bas of [0,4])expect([...d.slice(bas,bas+4)].sort()).toEqual([0,1,2,3]);
      const dokunuslar=d.map((el,sira)=>({sira,el,fark:-.85}));
      const ani={dal,puan:10,renk:'sari' as const,program,dokunuslar};
      expect(kresOku({evAlbumu:[{gun:1,dal,puan:10,ani}]}).evAlbumu[0].ani).toEqual(ani);
    }
  });
  const yarim=():Gosteri=>({...yeniGosteri(),program:'dort',dal:'dans',bolum:'final',prova:2,kararlar:[true],isaretler:[true,false,true,true]});
  it('Eski gösterinin ortasında kaydedilen puanlar kesintisiz konsere taşınır',()=>{
    const g=gosteriOku(yarim());
    expect(g.bolum).toBe('final');expect(puan(g)).toBe(4);
    expect(gosteriOku(JSON.parse(JSON.stringify(g)))).toEqual(g);
  });
  it('Kararı verilmiş nakarat açıldığında ikinci kez puan toplanamaz',()=>{
    const g=yarim();g.kararlar.push(false);
    const geri=gosteriOku(g);expect(geri.bolum).toBe('final');expect(puan(geri)).toBe(4);
    geri.isaretler.push(true,true,true,true);
    expect(puan(geri)).toBe(8);
  });
  it('Son notada yenilenirse sekiz puan kaydını korur ve kapanış müziğinden başlar',()=>{
    const g={...yarim(),isaretler:Array(8).fill(true),kararlar:[true,true]};
    expect(ilkSahneVurusu(g)).toBe(56);expect(puan(gosteriOku(g))).toBe(10);
    expect(ilkSahneVurusu({...g,isaretler:g.isaretler.slice(0,4)})).toBe(32);
  });
  it('Prova yeni denemede puan taşımaz; eski tamamlanmış gösteri eve anlatılabilir',()=>{
    const g=gosteriOku({...yarim(),bolum:'sec',sonuc:{dal:'sarki',puan:10}});
    expect(g.isaretler).toEqual([]);expect(g.kararlar).toEqual([]);expect(g.sonuc?.puan).toBe(10);
  });
  it('Yeni günde okul oyunu baştan başlar, eve asılmış gerçek yarışma hatıraları korunur',()=>{
    const s=kresOku({gun:5,evKarsilama:'sarilma',evAlbumu:[{gun:3,dal:'dans',puan:7},{gun:5,dal:'sarki',puan:10}]});
    const yarin=yeniOkulGunu(s);
    expect(yarin.gosteri).toEqual({...yeniGosteri(),program:'konser-yanki'});expect(yarin.evKarsilama).toBe('kapi');
    expect(gosteriOku(yarin.gosteri).program).toBe('konser-yanki');
    expect(programDeseni('dans',yarin.gosteri.program)).not.toEqual(programDeseni('dans',s.gosteri.program));
    expect(yarin.evAlbumu).toEqual(s.evAlbumu);expect(yarin.gun).toBe(6);
  });
  it('Albümdeki eski kıyafeti ve gerçek zamanlamayı tutar; uyumsuz kayda uydurma hareket eklemez',()=>{
    const ani={dal:'sarki' as const,puan:8,renk:'sari' as const,dokunuslar:[{sira:7,el:1 as const,fark:.61},{sira:2,el:0 as const,fark:-.82},{sira:2,el:0 as const,fark:.25},{sira:8,el:1 as const,fark:0}]};
    const k=kresOku({evAlbumu:[{gun:1,dal:'sarki',puan:8,ani},{gun:2,dal:'dans',puan:8,ani}]});
    expect(k.evAlbumu[0].ani).toEqual({...ani,dokunuslar:[ani.dokunuslar[1],ani.dokunuslar[0]]});
    expect(k.evAlbumu[1]).toEqual({gun:2,dal:'dans',puan:8});
    expect(yeniOkulGunu(k).evAlbumu).toEqual(k.evAlbumu);
  });
  it('Kazanan fotoğrafın yerini üç yeni hatıra alsa da eski kupa evde kalır; bugünün şovu kazanılmış sayılmaz',()=>{
    const ev=kresOku({gun:5,evAlbumu:[10,8,6,9].map((puan,i)=>({gun:i+1,dal:'dans',puan}))});
    expect(ev.evAlbumu.map(h=>h.puan)).toEqual([8,6,9]);expect(ev.evKupasi).toBe(true);
    const yeni=kresOku(yeniOkulGunu(ev));expect(yeni.evKupasi).toBe(true);expect(yeni.gosteri.sonuc).toBeNull();
    for(const dal of ['sarki','dans'] as const)for(const puan of [0,4,6,7,8,9,10])
      expect(kresOku({evAlbumu:[{gun:1,dal,puan}]}).evKupasi).toBe(puan>=7);
  });
  it('Tamamlanmış eski kayıtta önceki yarışmanın kupa sonucu kalmışsa gerçek karar ve vuruşlardan düzeltir',()=>{
    const veri={...yarim(),bolum:'sonuc' as const,kararlar:[true,false],isaretler:[true,true,true,false,false,true,true,true],sonuc:{dal:'sarki' as const,puan:10}};
    const g=gosteriOku(veri);expect(g.sonuc).toEqual({dal:'dans',puan:7});expect(g.sonAni).toBeNull();
    expect(gosteriOku({...veri,bolum:'sec'}).sonuc).toEqual({dal:'sarki',puan:10});
  });
  it('Aynı gün ikinci gösteri kupasız bitince ilk kazanan performansı ve akşam alınacak kupa korunur',()=>{
    const kazan={dal:'sarki' as const,puan:10,renk:'sari' as const,dokunuslar:[{sira:0,el:0 as const,fark:.38}]};
    const son={...yarim(),bolum:'sonuc' as const,kararlar:[true,false],isaretler:[true,true,true,true,true,false,false,false],sonuc:{dal:'dans' as const,puan:6}};
    const k=kresOku({gosteri:son,biten:['gosteri'],bugununKupasi:kazan});
    expect(k.gosteri.sonuc).toEqual({dal:'dans',puan:6});expect(k.bugununKupasi).toEqual(kazan);
    const yarin=yeniOkulGunu(k);expect(yarin.evKupasi).toBe(true);expect(yarin.bugununKupasi).toBeNull();
    expect(kresOku(yarin).oncekiGun).toMatchObject({sonGosterisi:{dal:'dans',puan:6},kupaKazandi:true});expect(yarin.evAlbumu).toEqual([]);
    expect(kresOku({bugununKupasi:{...kazan,puan:6}}).bugununKupasi).toBeNull();
  });
});
