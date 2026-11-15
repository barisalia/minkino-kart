import {parkurAc,parkurSozu,damgalar} from './yelken-parkuru';
import {kayikGoleti,kayikCizimi} from './kayik-goleti';
import {goletSozu,ilkGolet} from './golet-kaydi';
import {bosKagit,kendiResminiAc} from './kendi-resmim';
import {oyuncakYolunuAc,yolSozu,yolaCik} from './oyuncak-yolu';
import {odaKesfiniAc} from './oda-kesfi';
import {buketSozu,buketiGoster,cicekciAc} from './cicekci';
import {ibrik as sulamaKabi} from './okul-gunu';
import './kres.css';
import type {Sabah} from './model';
import {bitkiYasi,bugun,karisim,tamamla,kresSahneleri,suNesneleri,renkler,type KresSahnesi,type Kose,type SuNesnesi} from './kres-kaydi';
import {otomobil,otoTek,arabaAd,parcaAd,tup,kase,baski,boyaYolu,firca,renkMasasi,renk,kaportalar,boyaKavanozu,kagitRenkleri,kayik,saksi,tohum,zil} from './kres-oyuncaklari';
import {vedaAc,vedaSozu} from './kres-veda';
import {eveYuru} from './eve-yuruyus';
import {ayakSesi} from '../../src/audio/sahne-ortami';
import {toplanAc} from './kres-toplan';
import {kagidiKat} from './kagit-kati';
import {cemberAc} from './kres-cember';
import {lavaboAc,sabun} from './kres-lavabo';
import {oykuAc,oykuKapak,limanSozu} from './kres-oyku';
import {mutfagiAc} from './meyve-mutfagi';
import {gosteriAc} from './gosteri-sahnesi';
import {gosteriSozu} from './gosteri-kaydi';
import {mutfakSozu} from './meyve-tarifi';
import {sofraAc} from './kres-servis';
import {simge} from './cizim';
import {rafKarti} from './sergi-defteri';
import {yazilar} from './yazi-yollari';
import {panoGalerisi} from './pano-resmi';
import {efekt,sesiAc} from '../../src/audio/ses';
import {panoBaslangici,yaziBaslangici,bosDers} from './ders-programi';
const resimler=import.meta.glob<string>(['../../assets/hazirlik/ders/*.webp','../../assets/hazirlik/etkinlik/*.webp','../../assets/hazirlik/kres/*.webp','../../assets/hazirlik/*.webp'],{eager:true,query:'?url',import:'default'});
const url=(n:string)=>resimler['../../assets/hazirlik/'+n+'.webp'];
const res=(n:string)=>'<img alt="" draggable="false" src="'+url(n)+'">';
const nesneAdi:Record<SuNesnesi,string>={tas:'Taş',kup:'Tahta küp',yaprak:'Yaprak',kayik:'Kâğıt kayık'};
const sinifIsleri=['meyve-mutfagi','gosteri','cicekci','paylas','bahce','boyahane','etkinlik','sofra','toplan','lavabo','cember','kendi-resmim'];
export const kresMi=(n:string)=>kresSahneleri.some(s=>s===n);
export function odaYolu(n:string):KresSahnesi{return sinifIsleri.includes(n)?'anasinifi':'oyun-odasi'}
export const kresSozu:Record<KresSahnesi,string>={'okul-kapisi':'kino_kres_kapi',anasinifi:'kres_sinif','oyun-odasi':'kres_oyun',golet:'kres_golet_yavru','yelken-parkuru':'kres_yelken_parkur',blok:'kres_blok',boyahane:'kres_boya_kose','su-masasi':'kres_havuz',kagit:'kres_gemi',bahce:'kres_fidan',paylas:'kres_sofra_hazir',cicekci:'kres_cicekci','meyve-mutfagi':'kres_mutfak_sec',gosteri:'kres_gosteri_giris','ev-yolu':'kino_eve_yol',lavabo:'kres_lavabo',oyku:'kres_oyku_ac',cember:'kres_cember_ac',toplan:'kres_duzen','kendi-resmim':'kres_resim_defteri',veda:'anne_okul_sor'};
function bahceSozu(yas:number){return yas>=3?'kres_cicek':yas===2?'kres_tomurcuk':yas===1?'kres_filiz':'kres_fidan_yarin'}
export function kresYonergesi(s:Sabah):string{
  const k=s.kres,sahne=s.sahne as KresSahnesi;
  switch(sahne){
    case 'ev-yolu':return k.eveYol===1?'kino_eve_zil':'kino_eve_yol';
    case 'cember':return ['kres_cember_ac','kres_cember_tas','kres_cember_kino','kino_cember_sec'][k.konusanlar.length];
    case 'cicekci':return buketSozu(k);
    case 'meyve-mutfagi':return mutfakSozu(k.meyveMutfagi);
    case 'gosteri':return gosteriSozu(k.gosteri);
    case 'yelken-parkuru':return parkurSozu(k.parkur.adim);
    case 'golet':return goletSozu(k.golet);
    case 'veda':return vedaSozu(s);
    case 'toplan':return k.duzenPlani.length&&k.duzenPlani.length===k.duzenBitti.length?'kres_duzen_bitti':'kres_duzen';
    case 'blok':return k.tekneKuruluyor?(k.tekneParcalari.length===3?'kres_yelken_yuz':'kres_yelken_kur'):k.kalip.length<3?'kres_blok':k.araba.length<4?'kres_araba_renk':yolSozu(k);
    case 'boyahane':return k.boyandi?'kres_sergi':k.boyalar.length<2?'kres_boya_kose':k.donus<12?'kres_karistir':k.fircaElde?'kres_firca_sur':'kres_'+karisim(k.boyalar);
    case 'bahce':return !k.tohum?'kres_fidan':k.sulamaTarihi===bugun()?bahceSozu(bitkiYasi(k)):'okul_ek';
    case 'oyku':return k.limanKitabi?limanSozu(k):k.oykuSayfa===0?'kres_oyku_ac':k.oykuSayfa<3?'kres_oyku_'+k.oykuSayfa:'kres_oyku_diz';
    case 'lavabo':return k.elYikama===3&&k.ovma===8?'kres_ac_durula':['kres_lavabo','kres_islat','kres_sabun','kres_ovala','kres_durula','kres_kuru','kino_kres_temiz'][k.elYikama];
    case 'kagit':return k.kat===3?(k.damga===null?'kres_kagit_damga':'kres_gemi_yuz'):k.kat===2?'kres_kagit_ac':'kres_gemi';
    case 'su-masasi':return k.tahminNesnesi?(k.gemiTahmin?'kres_tahmin_birak':'kres_tahmin'):k.suda.includes('kayik')?'kres_su_it':'kres_havuz';
    default:return kresSozu[sahne];
  }
}
type Isler={yeniGun:()=>void;gir:(n:Sabah['sahne'])=>void;soyle:(id:string,sonra?:()=>void)=>void;sus:()=>void;kaydet:()=>void};
export type Yer=[number,number,number,number];
export type Parca={id:string;ad:string;art:string;yer:Yer;dik?:Yer;eylem?:()=>void;hedef?:string[];birak?:(id:string)=>void;stil?:string};
// Dikey dekorlar aynı odanın telefon için ayrıca çizilmiş kadrajlarıdır.
const dikOda:Record<string,Record<string,Yer>>={
  'okul-kapisi':{kino:[30,74,34,33]},
  anasinifi:{pano:[87,25,18,13],saksi:[16,47,12,12],zil:[74,23,7,10],ceren:[52,41,24,30],
    'tahta-harf':[38,29,17,11],mino:[26,57,37,31],meyve:[20,69,29,12],boya:[80,68,30,12],zipzip:[69,57,37,31],
    beslenme:[90,51,14,8],lavabo:[81,46,9,8],kino:[51,75,33,29]},
  'oyun-odasi':{kapi:[16,41,19,15],kagit:[59,46,16,7],kolye:[41,46,14,7],muzik:[84,45,16,9],
    'raftaki-araba':[59,54,19,8],mino:[25,58,36,32],zipzip:[73,58,36,32],kino:[49,79,31,28],blok:[19,72,31,11],su:[81,72,33,11]},
};
export function kresAc(stage:HTMLElement,s:Sabah,is:Isler){
  const k=s.kres,sahne=s.sahne as KresSahnesi,oda=sahne==='anasinifi'||sahne==='oyun-odasi'||sahne==='okul-kapisi';
  const panel=document.createElement('section');panel.className='kres '+(oda?'kres-oda':'kres-is');panel.dataset.alan=sahne;stage.append(panel);
  const alan=document.createElement('div');alan.className='kres-sahne';panel.append(alan);
  const hareketAz=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pos=(yer:Yer)=>yer.map(n=>n+'%');
  let parcalar=new Map<string,Parca>();
  let kesfiKapat:(()=>void)|undefined;
  let cicekciyiKapat:(()=>void)|undefined;
  let gosteriyiKapat:(()=>void)|undefined;
  let gosteriyiDinle:(()=>void)|undefined;
  let birakilan='',gozlem:SuNesnesi|undefined,secili:Parca|undefined;
  function eleman(id:string){return alan.querySelector<HTMLElement>('[data-kres="'+id+'"]')}
  function ekle(p:Parca){
    const yuvaSec=sahne==='blok'&&p.stil==='kres-yuva'&&!p.art;
    const et=document.createElement(p.eylem||p.hedef||yuvaSec?'button':'div');
    et.dataset.kres=p.id;et.className='kres-parca '+(p.stil||'');
    if(et instanceof HTMLButtonElement){et.type='button';et.setAttribute('aria-label',p.ad)}
    else if(p.ad){et.setAttribute('role','img');et.setAttribute('aria-label',p.ad)}else et.setAttribute('aria-hidden','true');
    for(const [i,v] of pos(p.yer).entries())et.style.setProperty('--'+['x','y','w','h'][i],v);
    const dik=dikOda[sahne]?.[p.id.startsWith('kino-')?'kino':p.id]??p.dik??p.yer;
    for(const [i,v] of pos(dik).entries())et.style.setProperty('--d'+['x','y','w','h'][i],v);
    et.innerHTML=p.art;
    alan.append(et);parcalar.set(p.id,p);
    if(yuvaSec)p.eylem=()=>{if(secili)yerlestir(secili,p.id)};
    return et;
  }
  function bolge(id:string,ad:string,art:string,yer:Yer,eylem?:()=>void,stil='',dik?:Yer){return ekle({id,ad,art,yer,dik,eylem,stil})}
  function oyunBitir(kose:Kose,soz?:string){tamamla(k,kose);is.kaydet();if(soz)is.soyle(soz);efekt.yildiz(1)}
  function don(){is.gir(odaYolu(sahne))}
  function sahneye(n:Sabah['sahne']){return ()=>is.gir(n)}
  function ders(pano:boolean){
    s.ders.tur=pano?panoBaslangici:yaziBaslangici;s.ders.arada=false;
    if(pano&&s.ders.pano.durum==='kazandi'){
      const konu=s.ders.pano.konu;s.ders.pano=bosDers().pano;
      s.ders.pano.konu=konu==='balon'?'tirtil':konu==='tirtil'?'isik':'balon';
    }
    if(!pano)s.ders.sergi.donus=null;
    is.gir('etkinlik');
  }
  function ileri(id:string,ad:string,yap:()=>void){bolge(id,ad,simge(id==='saga'?'oda-sag':id==='panoya'||id==='done'||id==='park'?'tamam':'ileri'),[93,87,10,15],yap,'kres-ok',[86,92,19,11])}
  function geri(id:string,ad:string,yap:()=>void){bolge(id,ad,simge(id==='sola'?(sahne==='anasinifi'?'sahne-kapisi':'oda-sol'):'ileri'),[7,86,10,15],yap,'kres-ok kres-geri',[12,92,18,11])}
  function oyuncu(ad:string,kim:string,yer:Yer,eylem?:()=>void){
    let poz=kim==='ceren'?'<span class="kres-poz">'+[0,1,2].map(i=>res('ders/'+kim+'-'+i)).join('')+'</span>':
      kim.startsWith('kino-')?sahne==='okul-kapisi'?res('kres/'+(s.renk||'yesil')+'-canta-yuru-2'):res(s.renk||'yesil'):'<span class="kres-davet">'+Array.from({length:8},(_,i)=>res('kres/'+kim+'-davet-'+i)).join('')+'</span>';
    const kimde=s.kolyeKimde??k.hediye,boncuk=s.kolyeKimde?s.kolye:k.kolyeHatira;
    if(kimde===kim)poz='<span class="kres-tam-kisi">'+poz+'<span class="kres-boyun">'+boncuk.map(n=>res('etkinlik/deniz-'+n)).join('')+'</span></span>';
    const kisi=bolge(kim,ad,poz,yer,eylem,'kres-karakter');
    const pozlar=kisi.querySelectorAll<HTMLImageElement>('.kres-davet img');
    if(pozlar.length&&!hareketAz()){
      const sureler=[700,145,155,185,400,135,245,450],bekleme=kim==='mino'?5800:7900;
      const tur=sureler.reduce((a,b)=>a+b,0)+bekleme;
      let t=0;
      pozlar.forEach((el,i)=>{
        const bas=t/tur;t+=sureler[i];const son=t/tur;
        const zamanlar:Keyframe[]=i===0?[{visibility:'visible',offset:0},{visibility:'hidden',offset:son},{visibility:'visible',offset:1-bekleme/tur},{visibility:'visible',offset:1}]:
          [{visibility:'hidden',offset:0},{visibility:'visible',offset:bas},{visibility:'hidden',offset:son},{visibility:'hidden',offset:1}];
        el.animate(zamanlar.map(z=>({...z,easing:'steps(1,end)'})),{duration:tur,iterations:Infinity,easing:'linear',delay:kim==='mino'?0:-1900});
      });
    }
    return kisi;
  }
  async function kapiyaYuru(hedef:Sabah['sahne'],yon:number){
    if(panel.inert)return;
    const kino=eleman('kino-'+(s.renk||'yesil'));
    if(!kino||hareketAz()){is.gir(hedef);return}
    panel.inert=true;
    const yuruyen=kino;
    const r=kino.getBoundingClientRect(),adimBoyu=r.height*.56;
    const hedefX=(hedef==='aski'?.46:hedef==='gosteri'?-.075:yon>0?.77:.26)*alan.clientWidth+alan.getBoundingClientRect().left;
    const dx=hedefX-r.left-r.width/2;
    const uzaklas=hedef==='aski';
    const dy=uzaklas?(matchMedia('(max-aspect-ratio:1/1)').matches?-.16:-.10)*alan.clientHeight:0;
    const renk=s.renk||'yesil';
    const ad=sahne==='okul-kapisi'?renk+'-canta-yuru':yon<0?'kino-sola-yuru-'+renk:renk+'-yuru';
    const cels=Array.from({length:8},(_,n)=>{const im=new Image();im.alt='';im.draggable=false;im.src=url('kres/'+ad+'-'+n);return im});
    let iptal=false,kare=0,coz:(()=>void)|undefined;
    const durdur=()=>{iptal=true;cancelAnimationFrame(kare);coz?.()};
    window.addEventListener('hazirlik-mola',durdur);
    try{
      await Promise.all(cels.map(im=>im.decode()));
      if(iptal||!panel.isConnected)return;
      const adim=Math.max(8,Math.round(Math.abs(dx)/adimBoyu*8)),sure=adim*95;
      const kisi=document.createElement('span');kisi.className='kres-yuruyor';
      kisi.append(...cels);kino.replaceChildren(kisi);
      const bas=performance.now();
      await new Promise<void>(bitir=>{
        coz=bitir;let eski=-1,sonTemas=-1;
        function canlandir(an:number){
          if(iptal||!panel.isConnected||document.hidden){iptal=true;bitir();return}
          const zaman=Math.min(1,(an-bas)/sure),n=Math.floor(zaman*adim)%8;
          const basim=Math.floor(zaman*adim/4);
          if(zaman<1&&basim!==sonTemas){sonTemas=basim;ayakSesi(basim%2===0)}
          if(n!==eski){if(eski>=0)cels[eski].hidden=true;cels[n].hidden=false;eski=n}
          yuruyen.style.translate=dx*zaman+'px '+dy*zaman+'px';
          if(uzaklas){kisi.style.transform='scale('+(1-.20*zaman)+')';kisi.style.transformOrigin='center bottom'}
          if(zaman>=1)bitir();else kare=requestAnimationFrame(canlandir);
        }
        cels.forEach(c=>c.hidden=true);kare=requestAnimationFrame(canlandir);
      });
    }catch{/* Çizim yüklenemediğinde kapı yine açılır. */}finally{
      window.removeEventListener('hazirlik-mola',durdur);
      if(panel.isConnected){panel.inert=false;if(iptal)yenile();else is.gir(hedef)}
    }
  }
  function dekoruKoy(dekor:string){
    panel.classList.add('kres-cift-dekor');
    alan.style.setProperty('--oda-yatay','url("'+url('kres/'+dekor)+'")');
    alan.style.setProperty('--oda-dik','url("'+url('kres/'+dekor+'-dik')+'")');
  }
  function odalar(){
    if(sahne==='okul-kapisi'){
      dekoruKoy('okul-kapisi');
      bolge('okula-gir','Kino ile okul kapısını çal','',[46,44,21,44],()=>{efekt.sinifCalgisi(3);void kapiyaYuru('aski',1)},'',[50,46,33,25]);
      bolge('kapi-zili','Kapı zilini çal','',[57.5,47,8,14],()=>{efekt.sinifCalgisi(3);void kapiyaYuru('aski',1)},'kres-kapi-zili',[67,49,13,10]);
      oyuncu('Kino ile okula gir','kino-'+(s.renk||'yesil'),[28,74,22,44],()=>is.soyle('kino_kres_kapi'));
      return;
    }
    const sinif=sahne==='anasinifi';
    const dekor=sinif?'sinif':'oyun';
    panel.classList.add('kres-iki-oda');dekoruKoy(dekor);
    if(sinif){
      const baskilar=k.baskilar.slice(-3),galeri=panoGalerisi().slice(0,1);
      const eserler=galeri.map(x=>'<img alt="" src="'+x.resim+'">').concat(baskilar.map(c=>baski(c,true,k.boyaliResimler[c])));
      const sanat=eserler.length?'<span class="kres-pano">'+eserler.map(x=>'<i>'+x+'</i>').join('')+'</span>':res('etkinlik/kalemlik-1');
      bolge('pano','Panoda resim yap',sanat,[86,25,16,17],()=>ders(true));
      bolge('saksi','Pencere bahçesine bak',saksi(bitkiYasi(k),k.tohum),[16,42,9,17],sahneye('bahce'));
      bolge('zil','Gün sonu zilini çal',zil,[73.7,17,5,13],()=>{
        if(k.biten.length>=2){is.gir('toplan')}else is.soyle('kres_once_oyna');
      },'kres-zil');
      oyuncu('Ceren Öğretmen ile harf atölyesi','ceren',[56,43,15,45],()=>ders(false));
      const etiket=rafKarti(s.ders.sergi,Math.min(s.ders.sergi.kart,2));
      bolge('tahta-harf','Ceren ile harf atölyesi','<span class="kres-tahta-dersi"><svg viewBox="0 0 240 232">'+yazilar[etiket.harf].yollar.map(y=>'<path d="'+y+'" fill="none" stroke="#fff0ca" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>').join('')+'</svg>'+res('etkinlik/'+etiket.sanat)+'</span>',[46,28,14,15],()=>ders(false));
      oyuncu('Mino ile beslenme masası','mino',[25,55,17,34],sahneye('paylas'));
      bolge('meyve','Meyve mutfağında tarif hazırla','<span class="kres-tepsi">'+res('etkinlik/sergi-tabak')+res('etkinlik/sergi-armut')+res('etkinlik/meyve-2')+'</span>',[15,73,18,16],sahneye('meyve-mutfagi'));
      bolge('hali','Sabah çemberine otur','',[59,86,15,9],sahneye('cember'),'',[50,89,39,7]);
      oyuncu('Kino ile sabah çemberine otur', 'kino-'+(s.renk||'yesil'),[49,74,16,34],sahneye('cember'));
      oyuncu('Zıpzıp ile boyaları karıştır','zipzip',[72,52,17,33],sahneye('boyahane'));
      bolge('boya','Renk karıştırma masası',renkMasasi,[85,71,19,19],sahneye('boyahane'));
      bolge('lavabo','Patilerini yıka',sabun,[80,58,6,9],sahneye('lavabo'));
      if(!s.kalanPaketlendi)bolge('beslenme','Kendi beslenme kutunu aç',res('bento-kapali'),[87,48,9,10],sahneye('sofra'));
      ileri('saga','Sağdaki oyun odasına geç',()=>{void kapiyaYuru('oyun-odasi',1)});
      geri('sola','Soldaki yıl sonu gösterisine git',()=>{void kapiyaYuru('gosteri',-1)});
    }else{
      bolge('kapi','Sınıfa dön','',[10,38,14,38],sahneye('anasinifi'));
      bolge('kagit','Kâğıt kayık katla',res('kres/'+kayikCizimi(k.gemiVar?k.gemiRengi:0)),[51.5,34,11,10],sahneye('kagit'));
      bolge('kolye','Arkadaşına kolye diz','<span class="kres-kabuklar">'+[0,1,2].map(n=>res('etkinlik/deniz-'+n)).join('')+'</span>',[34,35,13,9],sahneye('kolye'));
      bolge('muzik','Mino ile ritim çal',res('etkinlik/muzik-0'),[62,33,10,14],sahneye('muzik'));
      bolge('oyku','Zıpzıp’ın kayıp tekerleğini anlat',oykuKapak(res(k.limanKitabi?'kres/masal-liman':'kres/oyku-0')),[41.5,47,10,10],sahneye('oyku'),'',[42,55,20,8]);
      if(k.arabaRafta)bolge('raftaki-araba','Yaptığın arabayı sür',otomobil(undefined,false,k.arabaRengi),[55,49,12,10],()=>{k.kalip=[0,1,2];k.araba=[0,1,2,3];yolaCik(k);is.gir('blok')});
      oyuncu('Mino ile tahta şekiller','mino',[29,56,17,36],sahneye('blok'));
      oyuncu('Kino','kino-'+(s.renk||'yesil'),[49,75,17,34]);
      oyuncu('Zıpzıp ile su deneyi','zipzip',[73,52,16.5,35],sahneye('su-masasi'));
      bolge('blok','Tahta şekil oyuncağını aç',res('kres/oda-kalip'),[16,73,24,17],sahneye('blok'));
      bolge('su','Su masasında deney yap',res('kres/oda-legen'),[84,70,22,19],sahneye('su-masasi'));
      geri('sola','Soldaki sınıfa dön',()=>{void kapiyaYuru('anasinifi',-1)});
    }
    kesfiKapat=odaKesfiniAc(alan,sinif?'anasinifi':'oyun-odasi',k,is.soyle);
  }
  function tasinabilir(id:string,ad:string,art:string,yer:Yer,dik:Yer,hedef:string[],birak:(id:string)=>void){
    const p:Parca={id,ad,art,yer,dik,hedef,birak,stil:'kres-tasinir'};
    p.eylem=sahne==='blok'||sahne==='paylas'||sahne==='cember'||sahne==='toplan'?()=>{
      if(secili)eleman(secili.id)?.classList.remove('kres-secili');
      secili=p;alan.dataset.secili=id;eleman(id)?.classList.add('kres-secili');efekt.dokunma();
    }:()=>birak(hedef[0]);
    ekle(p);
  }
  function yerlestir(p:Parca,hedef:string){
    if(p.hedef?.includes(hedef)){secili=undefined;p.birak?.(hedef);return}
    efekt.dokunma();
    if(sahne==='toplan')is.soyle('kres_duzen_ipucu');
    if(sahne==='cember')is.soyle('kres_cember_bekle');
    if(sahne==='blok'){
      const sebep=p.id.startsWith('sekil-')?['kres_daire','kres_kare','kres_ucgen'][Number(p.id.slice(-1))]:Number(p.id.slice(-1))>=2?'kres_teker':'kres_araba';
      is.soyle(p.id.startsWith('tekne-parca-')?'kres_yelken_kur':sebep);
      if(!hareketAz())eleman(p.id)?.animate([{rotate:'0deg'},{rotate:'-7deg'},{rotate:'3deg'},{rotate:'0deg'}],{duration:350});
    }
  }
  function yelkenliKur(){
    const adlar=['Gövde','Direk','Yelken'];
    const cizimler=['tekne-govde','tekne-direk','tekne-yelken'];
    const pano=bolge('tersane','Yelkenli yapım tezgâhı','',[62,55,50,65],undefined,'tekne-tezgahi',[50,39,78,38]);
    const yuz=document.createElement('span');yuz.className='tekne-plan';pano.append(yuz);
    const hedefler=[[50,89,100,22],[39,39,7,79],[66.5,43,48,60]];
    for(let i=0;i<3;i++){
      const dolu=k.tekneParcalari.includes(i);
      const hedef='tekne-yuva-'+i;
      const e=bolge(hedef,adlar[i]+' yeri','',[0,0,0,0],undefined,'kres-yuva');
      e.innerHTML=res('kres/'+cizimler[i]);e.classList.toggle('tekne-bos',!dolu);
      yuz.append(e);
      const [x,y,w,h]=hedefler[i];Object.assign(e.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});
      if(dolu)continue;
      const yer:Yer[]=[[19,77,23,12],[13,53,10,28],[29,49,14,22]];
      const dik:Yer[]=[[23,71,31,11],[50,69,14,22],[77,70,22,16]];
      tasinabilir('tekne-parca-'+i,adlar[i]+' parçasını tak',res('kres/'+cizimler[i]),yer[i],dik[i],[hedef],()=>{
        k.tekneParcalari.push(i);birakilan=hedef;efekt.yapis();
        if(k.tekneParcalari.length===3)is.soyle('kres_yelken_yuz');yenile();
      });
    }
    if(k.tekneParcalari.length===3)bolge('tekne-sok','Yelkenliyi sök ve yeniden kur',simge('yenile'),[26,78,10,13],()=>{k.tekneParcalari=[];efekt.sayfa();yenile();is.soyle('kres_yelken_kur')},'',[26,74,17,11]);
    if(k.tekneParcalari.length===3)ileri('yelken-ac','Yelkenlini gölete indir',()=>{
      Object.assign(k.golet,ilkGolet(),{ahsap:true,tur:1});k.tekneKuruluyor=false;is.gir('golet');
    });
    bolge('arabaya-don','Araba atölyesine dön',otomobil(undefined,false,k.arabaRengi),[86,23,12,13],()=>{k.tekneKuruluyor=false;yenile()},'',[83,15,19,10]);
  }
  function bloklar(){
    if(k.tekneKuruluyor){yelkenliKur();return}
    bolge('tersaneye','Ahşap yelkenli yap',res('kres/oyuncak-yelken'),[87,23,10,13],()=>{
      k.tekneKuruluyor=true;yenile();is.soyle(k.tekneParcalari.length===3?'kres_yelken_yuz':'kres_yelken_kur');
    },'',[85,15,18,10]);
    if(k.kalip.length<3){
      const pano=bolge('tahta','Ahşap şekil tahtası',res('kres/kalip-tahta'),[64,58,57,44],undefined,'kres-ahsap',[50,42,92,29]);
      const yuz=document.createElement('span');yuz.className='kres-tahta-yuzu';yuz.append(pano.firstChild!);pano.append(yuz);
      for(let i=0;i<3;i++){
        const dolu=k.kalip.includes(i),parca=res('kres/kalip-'+['daire','kare','ucgen'][i]);
        const yuva=bolge('yuva-'+i,parcaAd[i]+' yuvası',dolu?parca:'',[0,0,0,0],undefined,'kres-yuva');
        yuz.append(yuva);Object.assign(yuva.style,{left:([18.8,49.3,81][i])+'%',top:([46,45,45][i])+'%',width:([29.1,28,31][i])+'%',height:([73,68,68][i])+'%'});
        if(!dolu)tasinabilir('sekil-'+i,parcaAd[i]+' parçasını yerleştir',parca,[[15,26,22][i],37+i*21,13,20],[20+i*30,72,23,16],['yuva-'+i],()=>{
          k.kalip.push(i);birakilan='yuva-'+i;efekt.yapis();if(k.kalip.length===3)is.soyle('kres_araba_renk');yenile();
        });
      }
      return;
    }
    const tam=k.araba.length===4;
    if(!tam){
      kaportalar.forEach((c,i)=>{
        const sec=bolge('kaporta-'+i,c.ad+' gövde boyası',boyaKavanozu(i,k.arabaRengi===i),[48+i*10,80,9,13],()=>{
          k.arabaRengi=i;efekt.dokunma();yenile();
        },'kres-araba-boyasi',[30+i*20,19,16,9]);
        sec.setAttribute('aria-pressed',String(k.arabaRengi===i));
      });
      const sablon=bolge('otomobil','Oyuncak arabanın montaj yeri',otomobil(k.araba,true,k.arabaRengi),[64,55,54,54],undefined,'kres-ahsap',[50,41,85,35]);
      const yuz=document.createElement('span');yuz.className='kres-araba-yuzu';yuz.append(sablon.firstChild!);sablon.append(yuz);
      const yerler:Yer[]=[[50,58,90,23],[50,26,58,35],[76.3,77,21,36],[22.1,77,21,36]];
      const hedef=(i:number)=>'araba-yuva-'+i;
      yerler.forEach(([x,y,w,h],i)=>{
        const e=bolge(hedef(i),arabaAd[i]+' yeri',k.araba.includes(i)?'<span></span>':'',[x,y,w,h],undefined,'kres-yuva');
        Object.assign(e.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});yuz.append(e);
      });
      [0,1,2,3].forEach(i=>{
        if(k.araba.includes(i))return;
        const es=[2,3].filter(j=>!k.araba.includes(j));
        const hedefler=i<2?[hedef(i)]:es.map(hedef);
        const yerl:Yer[]=[[19,38,27,12],[20,57,19,15],[13,76,9,16],[27,76,9,16]];
        const dik:Yer[]=[[28,69,42,10],[72,69,31,10],[36,82,16,10],[63,82,16,10]];
        tasinabilir('tak-'+i,arabaAd[i]+' tak',otoTek(i,k.arabaRengi),yerl[i],dik[i],hedefler,id=>{
          const hedefNo=Number(id.slice(-1));
          // İki teker aynı parçadır. Bırakılan tekerin yeni yeri kaybolmasın.
          k.araba.push(hedefNo);birakilan='otomobil';efekt.yapis();
          if(k.araba.length===4)is.soyle('kres_araba_yol');
          yenile();
        });
      });return;
    }
    yoluKapat=oyuncakYolunuAc(alan,k,is.kaydet,is.soyle,()=>is.gir('oyun-odasi'));
  }
  let yoluKapat:(()=>void)|undefined;
  let katIzi:((x:number,y:number)=>void)|undefined;
  let katSil:(()=>void)|undefined;
  let donmeyeBasla:((ev:PointerEvent)=>void)|undefined,donmeyeDevam:((ev:PointerEvent)=>void)|undefined,donmeyiBirak:(()=>void)|undefined;
  function boyahane(){
    bolge('kendi-kagidim','Kendi resmini çiz ve boya',bosKagit,[86,30,17,22],sahneye('kendi-resmim'),'kres-bos-kagit',[82,18,21,12]);
    const kar=karisim(k.boyalar);
    const renk1=k.boyalar[0]?renk[k.boyalar[0]]:'#fff8e4',ikinci=k.boyalar[1]?renk[k.boyalar[1]]:'';
    const hazir=k.donus>=12;
    bolge('kase','Boya karıştırma kâsesi',kase(hazir?renk[kar]:renk1,ikinci,k.donus),[47,61,35,35],undefined,'kres-kase',[49,49,52,24]);
    if(k.boyalar.length<2){
      renkler.forEach((b,i)=>{
        if(k.boyalar.includes(b))return;
        tasinabilir('tup-'+b,({mavi:'Mavi',kirmizi:'Kırmızı',sari:'Sarı'}[b])+' boyayı sık',tup(b),[22+i*25,36,12,22],[21+i*29,29,19,17],['kase'],()=>{
          k.boyalar.push(b);efekt.vicik();birakilan='kase';if(k.boyalar.length===2)is.soyle('kres_karistir');yenile();
        });
      });return;
    }
    if(!hazir){
      const kas=eleman('kase')!;
      kas.innerHTML+='<span class="kres-kasik">'+firca+'</span><svg class="kres-karistir-izi" viewBox="0 0 90 40"><path d="M12 23C5 11 24 6 45 6s36 7 35 16q-1 10-23 12m8-7-10 8 13 1" fill="none" stroke="#43685d" stroke-width="2.7" stroke-linecap="round"/></svg>';
      kas.tabIndex=0;kas.setAttribute('role','button');kas.setAttribute('aria-label','Kâsede daire çizerek boyaları karıştır');
      let once:number|undefined,toplam=0;
      function ilerle(n:number){
        k.donus=Math.min(12,k.donus+n);is.kaydet();kas.style.setProperty('--aci',(k.donus*30)+'deg');
        const iz=kas.querySelector<SVGElement>('.kres-karistir-izi');if(iz)iz.style.opacity=String(1-k.donus/18);
        const kap=kas.querySelector(':scope >svg:first-child');
        if(kap){const temp=document.createElement('template');temp.innerHTML=kase(k.donus>8?renk[kar]:renk1,ikinci,k.donus);kap.replaceWith(temp.content)}
        efekt.ovala();
        if(k.donus>=12){is.soyle('kres_'+kar);yenile()}
      }
      kas.style.setProperty('--aci',(k.donus*30)+'deg');
      kas.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ilerle(2)}};
      const aci=(ev:PointerEvent)=>{
        const r=kas.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.44;
        return Math.hypot(x,y)>.08?Math.atan2(y,x):undefined;
      };
      donmeyeBasla=ev=>{once=aci(ev);toplam=0};
      donmeyeDevam=ev=>{
        const son=aci(ev);if(son===undefined){once=undefined;return}
        if(once!==undefined){
          const fark=Math.abs(Math.atan2(Math.sin(son-once),Math.cos(son-once)));
          if(fark<1.6)toplam+=fark;
          if(toplam>Math.PI/5){toplam-=Math.PI/5;ilerle(1)}
        }once=son;
      };
      donmeyiBirak=()=>{once=undefined;toplam=0};return;
    }
    const kart=bolge('kagit-resim','Kendi boyanla resim yap','<span class="kres-kart">'+baski(kar,k.boyandi,k.izler,'kres-boya-kalibi')+'</span>',
      [70,54,38,49],undefined,'kres-sanat',[50,42,77,37]);
    if(!k.fircaElde&&!k.boyandi){
      tasinabilir('firca','Fırçana boya al',firca.replace('#e67564',renk[kar]),[27,69,13,24],[25,74,23,19],['kagit-resim'],()=>{
        k.fircaElde=true;is.soyle('kres_firca_sur');yenile();
      });return;
    }
    if(k.boyandi){
      bolge('yeni-renk','Başka renk karıştır',simge('yenile'),[23,42,10,15],()=>{k.boyalar=[];k.donus=0;k.boyandi=false;k.fircaElde=false;k.izler=[];yenile()},'kres-ok',[21,69,18,12]);
      ileri('panoya','Resmini panoya as',sahneye('anasinifi'));return;
    }
    const kagit=kart.querySelector('svg') as SVGSVGElement;
    const grup=kagit.querySelector('.kres-firca-izleri')!;
    kart.classList.add('kres-cizilebilir');kart.removeAttribute('aria-hidden');kart.setAttribute('role','button');kart.tabIndex=0;
    const bitir=()=>{
      k.boyandi=true;if(!k.baskilar.includes(kar))k.baskilar.push(kar);
      k.boyaliResimler[kar]=k.izler.map(iz=>[...iz]);
      oyunBitir('boyahane');is.gir('anasinifi');is.soyle('kres_sergi');
    };
    ileri('panoya','Boyadığın resmi panoya as',bitir);
    const pano=eleman('panoya')!;
    const sil=bolge('izi-sil','Son fırça izini geri al',simge('yenile'),[26,42,9,13],()=>{k.izler.pop();yenile()},'kres-ok',[22,69,17,12]);
    const tazele=()=>{pano.hidden=sil.hidden=!k.izler.length};
    tazele();
    let cizen:number|undefined,son:SVGPathElement|undefined;
    const nokta=(x:number,y:number):[number,number]=>{
      const p=new DOMPoint(x,y).matrixTransform(kagit.getScreenCTM()!.inverse());
      return [Math.max(0,Math.min(118,Math.round(p.x))),Math.max(0,Math.min(108,Math.round(p.y)))];
    };
    const sinirda=(p:[number,number])=>{
      const mask=kagit.querySelector('clipPath')!;
      return [...mask.querySelectorAll<SVGGeometryElement>('path,ellipse')].some(e=>{
        const n=new DOMPoint(...p),yerel=e.transform.baseVal.consolidate();
        return e.isPointInFill(yerel?n.matrixTransform(yerel.matrix.inverse()):n);
      })
    };
    const baslat=(p:[number,number])=>{
      if(!sinirda(p)||k.izler.length>=80)return false;
      k.izler.push([p]);son=document.createElementNS('http://www.w3.org/2000/svg','path');grup.append(son);
      son.setAttribute('d',boyaYolu([p]));return true;
    };
    kart.onpointerdown=e=>{
      if(e.button!==0||cizen!==undefined||!baslat(nokta(e.clientX,e.clientY)))return;
      e.stopPropagation();e.preventDefault();kart.setPointerCapture(e.pointerId);cizen=e.pointerId;
    };
    kart.onpointermove=e=>{
      if(cizen!==e.pointerId||!son)return;const p=nokta(e.clientX,e.clientY),iz=k.izler[k.izler.length-1],once=iz[iz.length-1];
      if(Math.hypot(p[0]-once[0],p[1]-once[1])>=2){
        if(iz.length>=180)iz.splice(0,iz.length,...iz.filter((_,i)=>i%2===0));
        iz.push(p);son.setAttribute('d',boyaYolu(iz));tazele();
      }
    };
    kart.onpointerup=e=>{if(cizen===e.pointerId){cizen=undefined;son=undefined;is.kaydet();tazele()}};
    kart.onpointercancel=kart.onlostpointercapture=e=>{if(cizen===e.pointerId){k.izler.pop();son?.remove();cizen=undefined;son=undefined;tazele()}};
    kart.onkeydown=e=>{
      if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();
      const y=30+8*(k.izler.length%6),x=kar==='yesil'?75:58;
      if(baslat([x,y])){const iz=k.izler[k.izler.length-1];iz.push([x+12,y+4]);son!.setAttribute('d',boyaYolu(iz));is.kaydet();tazele()}
    };
  }
  function deneyResmi(n:SuNesnesi){return res('kres/'+(n==='kayik'?kayikCizimi(k.gemiRengi):'deney-'+n))}
  function deneyDefteri(){
    const d=document.createElement('dialog');d.className='deney-defteri';d.setAttribute('aria-label','Suda ne gördüm?');
    d.innerHTML=res('kres/deney-defter');
    for(const [i,yer] of (['ust','dip'] as const).entries()){
      const sayfa=document.createElement('section');sayfa.className='deney-kaydi';sayfa.style.left=(i?52:7)+'%';sayfa.setAttribute('aria-label',i?'Dibe inenler':'Yüzenler');
      sayfa.innerHTML=res('kres/deney-'+yer);
      const sira=document.createElement('div');sira.className='deney-pullar';
      for(const n of suNesneleri)if(k.deneyGozlemleri[n]&&(n==='tas'?'dip':'ust')===yer){
        const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',nesneAdi[n]+', gözlemini dinle');b.innerHTML=deneyResmi(n);
        b.onclick=()=>is.soyle(n==='tas'?'kres_gozlem_dip':'kres_gozlem_ust');sira.append(b);
      }
      sayfa.append(sira);d.append(sayfa);
    }
    const kapat=document.createElement('button');kapat.className='deney-kapat';kapat.type='button';kapat.setAttribute('aria-label','Defteri kapat');kapat.innerHTML=simge('tamam');kapat.onclick=()=>d.close();d.append(kapat);
    alan.append(d);d.addEventListener('close',()=>d.remove(),{once:true});d.showModal();
  }
  function kagitlaGolet(){
    if(k.golet.ahsap)Object.assign(k.golet,ilkGolet());is.gir('golet');
  }
  function suMasasi(){
    const tank=bolge('legen','Su dolu deney leğeni',res('kres/deney-legen'),[55,55,61,53],undefined,'kres-deney',[50,42,93,35]);
    const yuz=document.createElement('span');yuz.className='kres-leğen-yuzu';yuz.append(tank.firstChild!);tank.append(yuz);
    const liste=suNesneleri.filter(n=>n!=='kayik'||k.gemiVar);
    if(k.tahminNesnesi&&!k.suda.includes(k.tahminNesnesi)){
      const n=k.tahminNesnesi;
      bolge('tahmin-nesnesi','Deneyeceğin '+nesneAdi[n],deneyResmi(n),[21,37,12,16],undefined,'',[21,25,20,13]);
      for(const [i,yer] of (['ust','dip'] as const).entries()){
        const b=bolge('tahmin-'+yer,yer==='ust'?'Üstte kalacağını düşünüyorum':'Dibe ineceğini düşünüyorum',res('kres/deney-'+yer),[36+i*15,25,12,17],()=>{
          k.gemiTahmin=yer;efekt.nota(i+1);is.soyle('kres_tahmin_birak');yenile();
        },'kres-tahmin',[43+i*24,25,22,12]);
        b.setAttribute('aria-pressed',String(k.gemiTahmin===yer));
      }
    }else if(!k.tahminNesnesi&&k.suda.length<liste.length){
      bolge('once-dusun','Suya bırakmadan önce tahmin et',res('kres/deney-buyutec'),[89,22,8,13],()=>{
        const sec=liste.find(n=>!k.suda.includes(n));if(sec){k.tahminNesnesi=sec;k.gemiTahmin=null;is.soyle('kres_tahmin');yenile()}
      },'',[84,20,15,11]);
    }
    if(Object.keys(k.deneyGozlemleri).length)bolge('deney-defteri','Deney defterine bak',res('kres/deney-defter'),[72,19,12,12],deneyDefteri,'',[68,14,17,10]);
    function tanka(e:HTMLElement,yer:Yer){
      const [x,y,w,h]=yer;
      Object.assign(e.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});yuz.append(e);
    }
    const suYer:Record<SuNesnesi,Yer>={tas:[25,83,10,18],yaprak:[32,40,15,15],kup:[48,37,13,23],kayik:[k.gemiKonum,35,28,31]};
    function dalga(x:number){
      k.gemiKonum=x>k.gemiKonum?Math.max(23,k.gemiKonum-22):Math.min(80,k.gemiKonum+22);
      k.dalga=true;gozlem='kayik';efekt.dalga();yenile();
    }
    if(k.suda.some(n=>n!=='tas')){
      const su=bolge('dalga','Suya dokunup dalga yap','<svg viewBox="0 0 100 27"><path d="M2 12q8-7 16 0t16 0t16 0t16 0t16 0t16 0" fill="none" stroke="#338ba2" stroke-width="2.5" stroke-linecap="round"/></svg>',[0,0,0,0],()=>dalga(k.gemiKonum>=50?90:10),'kres-dalga');
      tanka(su,[50,56,79,18]);
      su.onpointerup=e=>{if(e.button!==0)return;e.stopPropagation();sal();const r=yuz.getBoundingClientRect();dalga((e.clientX-r.left)*100/r.width)};
    }
    liste.forEach((n,i)=>{
      if(k.suda.includes(n)){
        const e=bolge('suda-'+n,'Sudaki '+nesneAdi[n],deneyResmi(n),[0,0,0,0],()=>{
          if(n==='tas'){is.soyle('kres_tas_dip');efekt.dokunma()}
          else if(n==='kayik')dalga(k.gemiKonum>50?90:10);
          else{efekt.dalga();gozlem=n;k.dalga=true;yenile()}
        },'kres-suda '+(n==='tas'?'kres-dip':'kres-yuzer'));
        tanka(e,suYer[n]);
        if(!hareketAz()&&gozlem===n){
          const geldi=suyaBirakildi===n;
          const hareket=geldi?(n==='tas'?[{translate:'0 -280%'},{translate:'0 -176%',offset:.27},{translate:'0 0'}]:
            [{translate:'0 -105%'},{translate:'0 12%',offset:.52},{translate:'0 0'}]):
            [{translate:(n==='kayik'?(k.gemiKonum>50?'-42%':'42%'):'-8%')+' 0',rotate:'-3deg'},{rotate:'2deg',offset:.65},{translate:'0 0',rotate:'0deg'}];
          e.animate(hareket,{duration:geldi?680:900,easing:'ease-out'});
          const halka=document.createElement('span');halka.className='kres-su-halkasi';halka.style.left=suYer[n][0]+'%';yuz.append(halka);
          halka.animate([{opacity:0,scale:'.22'},{opacity:.85,offset:.2},{opacity:0,scale:'1.8'}],{duration:780,delay:geldi?160:0}).finished.then(()=>halka.remove(),()=>halka.remove());
        }
        return;
      }
      tasinabilir('deney-'+n,nesneAdi[n]+' suya bırak',deneyResmi(n),[24+i*16,84,n==='kayik'?13:9,14],[15+i*23,75,18,12],['legen'],()=>{
        k.suda.push(n);efekt.sicrama();gozlem=n;suyaBirakildi=n;
        const tahmin=k.tahminNesnesi===n?k.gemiTahmin:null;
        k.deneyGozlemleri[n]=tahmin??'serbest';
        if(k.tahminNesnesi===n){k.tahminNesnesi=null;k.gemiTahmin=null;if(tahmin)k.sonDeney={nesne:n,tahmin}}
        if(k.suda.includes('tas')&&k.suda.some(a=>a!=='tas'))tamamla(k,'su-masasi');
        is.soyle(tahmin?(n==='tas'?'kres_gozlem_dip':'kres_gozlem_ust'):n==='tas'?'kres_batti':n==='kayik'?'kres_su_it':'kres_yuzdu');yenile();
      });
    });
    if(k.suda.length)bolge('cikar','Nesneleri sudan çıkar',simge('yenile'),[88,34,10,14],()=>{k.suda=[];k.dalga=false;k.tahminNesnesi=null;k.gemiTahmin=null;yenile()},'kres-ok',[88,62,16,12]);
    if(k.gemiVar)bolge('golet','Kayığınla yavru ördeklere yol göster',res('kres/oyuncak-ordek-anne'),[15,37,14,19],kagitlaGolet,'',[17,60,21,12]);
    if(!k.gemiVar)bolge('gemi-yap','Katlayıp yüzdürmek için kâğıt al',kayik(1),[13,35,15,14],sahneye('kagit'),'',[16,62,20,12]);
    suyaBirakildi=undefined;
  }
  let suyaBirakildi:SuNesnesi|undefined;
  function kagit(){
    const n=k.kat,renk=kagitRenkleri[k.gemiRengi];
    const kagit=bolge('katlama',n===3?'Katladığın kâğıt kayık':'Katlama kâğıdı',n===3?res('kres/'+kayikCizimi(k.gemiRengi)):kayik(n,renk),[51,53,57,58],undefined,'kres-katlama',[50,46,89,40]);
    const yuz=document.createElement('span');yuz.className='kres-kagit-yuzu';yuz.append(kagit.firstChild!);kagit.append(yuz);
    if(n===3){
      if(k.damga!==null){const pul=document.createElement('i');pul.className='katli-kayik-damga';pul.innerHTML=res('kres/damga-'+damgalar[k.damga]);yuz.append(pul)}
      damgalar.forEach((ad,i)=>{
        const b=bolge('damga-'+i,['Güneş','Balık','Yıldız'][i]+' damgasını bas',res('kres/damga-'+ad),[32+i*12,80,8,11],()=>{k.damga=i;efekt.yapis();yenile()},'',[22+i*19,70,13,9]);
        b.setAttribute('aria-pressed',String(k.damga===i));
      });
      bolge('yelken-parkuru','Kayığınla şamandıra rotasına çık',res('kres/regatta-bayrak'),[83,26,12,17],sahneye('yelken-parkuru'),'',[80,21,18,13]);
      bolge('golet','Kayığınla yavru ördekleri bul',res('kres/oyuncak-ordek-anne'),[73,79,14,16],kagitlaGolet,'',[73,72,23,14]);ileri('suya','Kayığını su masasına götür',sahneye('su-masasi'));return}
    if(!n)kagitRenkleri.forEach((c,i)=>{
      const e=bolge('kagit-renk-'+i,['Mercan','Turkuaz','Sarı'][i]+' kâğıt seç',kayik(0,c),[27+i*13,82,11,10],()=>{k.gemiRengi=i;efekt.sayfa();yenile()},'',[30+i*20,75,17,10]);
      e.setAttribute('aria-pressed',String(i===k.gemiRengi));
    });
    const noktalar=[[14,81,86,21],[83,72,51,21],[52,51,85,49]], [x,y,tx,ty]=noktalar[n];
    const taslak=yuz.querySelector('svg')!;
    katIzi=(cx,cy)=>{
      const m=taslak.getScreenCTM();if(!m)return;
      const p=new DOMPoint(cx,cy).matrixTransform(m.inverse());
      kagidiKat(taslak,n,[x*1.7,y*1.16],[Math.max(4,Math.min(165,p.x)),Math.max(4,Math.min(112,p.y))]);
    };
    katSil=()=>{taslak.querySelector('.kres-katlanma')?.remove();taslak.querySelector('g')!.style.visibility=''};
    function katman(id:string,x:number,y:number,w:number){
      const e=eleman(id)!;Object.assign(e.style,{left:x+'%',top:y+'%',width:w+'%',height:w*1.46+'%'});yuz.append(e);
    }
    const iz=document.createElementNS('http://www.w3.org/2000/svg','svg');iz.setAttribute('viewBox','0 0 100 100');iz.setAttribute('preserveAspectRatio','none');iz.setAttribute('class','kres-kat-izi');
    iz.innerHTML='<path d="M'+x+' '+y+' Q'+(x+tx)/2+' '+(Math.min(y,ty)-12)+' '+tx+' '+ty+'" fill="none" stroke="#668777" stroke-width="1" stroke-dasharray="2.3 2.8"/>';yuz.append(iz);
    const hedef='<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="16" fill="#fff3bb" stroke="#687763" stroke-width="2.5" stroke-dasharray="4 4"/></svg>';
    bolge('uc','Katın buluşacağı uç',hedef,[0,0,0,0]);katman('uc',tx,ty,16);
    tasinabilir('katla','Kâğıdın ucunu işaretli köşeye katla','<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="14" fill="#64c5aa" stroke="#232729" stroke-width="2"/><path d="m23 34 14-10m-9-1 10 0-2 9" fill="none" stroke="#233b37" stroke-width="2"/></svg>',[0,0,0,0],[0,0,0,0],['uc'],()=>{
      k.kat++;efekt.sayfa();birakilan='katlama';
      if(k.kat===3){k.gemiVar=true;oyunBitir('kagit','kres_kagit_damga')}
      else if(k.kat===2)is.soyle('kres_kagit_ac');yenile();
    });katman('katla',x,y,20);
  }
  function bahce(){
    const yas=bitkiYasi(k);
    bolge('toprak','Pencere saksısı',saksi(yas,k.tohum),[57,56,30,53],undefined,'',[53,44,51,34]);
    if(!k.tohum){
      tasinabilir('tohum','Tohumu toprağa ek',tohum,[27,66,12,18],[23,73,19,13],['toprak'],()=>{k.tohum=true;efekt.pof();is.soyle('okul_ek');yenile()});
    }else if(k.sulamaTarihi!==bugun()){
      tasinabilir('sula','Saksıyı sula',sulamaKabi,[26,60,20,32],[24,71,33,22],['toprak'],()=>{
        if(!k.ekimTarihi)k.ekimTarihi=bugun();k.sulamaTarihi=bugun();efekt.sicrama();birakilan='toprak';
        oyunBitir('bahce',bahceSozu(yas));yenile();
      });
    }else ileri('pencere','Saksını sınıf penceresinde gör',sahneye('anasinifi'));
  }
  function yenile(){
    kesfiKapat?.();yoluKapat?.();yoluKapat=undefined;cicekciyiKapat?.();cicekciyiKapat=undefined;gosteriyiKapat?.();gosteriyiKapat=undefined;gosteriyiDinle=undefined;
    is.kaydet();alan.replaceChildren();delete alan.dataset.secili;parcalar=new Map();secili=undefined;donmeyeBasla=donmeyeDevam=donmeyiBirak=undefined;katIzi=katSil=undefined;
    if(oda)odalar();
    else{
      const fon=({veda:'ev-fon',gosteri:'sahne-fon',toplan:'duzen',cember:'cember',paylas:'sofra',lavabo:'lavabo',oyku:'okuma-fon',blok:'tersane-fon',kagit:'katlama',bahce:'bahce','su-masasi':'bilim'} as Partial<Record<KresSahnesi,string>>)[sahne]??'tezgah';
      dekoruKoy(sahne==='ev-yolu'?'yol-fon':sahne==='veda'&&k.evKarsilama==='sarilma'?'ev-saril-'+(s.renk==='sari'?'sari':'yesil'):fon);
      if(sahne==='ev-yolu')gosteriyiKapat=eveYuru(alan,s,bolge,res,is.kaydet,is.soyle,()=>is.gir('veda'));
      if(sahne==='kendi-resmim')kendiResminiAc(alan,k,is.kaydet,()=>{efekt.sayfa();is.gir('anasinifi');is.soyle('kres_sergi')},is.soyle);
      if(sahne==='paylas')sofraAc({s,bolge,tasinabilir,secili:()=>secili?.id,aktar:(id)=>{if(secili)yerlestir(secili,id)},res,is,yenile,ileri});
      if(sahne==='meyve-mutfagi')mutfagiAc(alan,k,res,is.kaydet,is.soyle);
      if(sahne==='gosteri'){const salon=gosteriAc(alan,s,{...is,res});gosteriyiKapat=salon.kapat;gosteriyiDinle=salon.tekrarDinle}
      if(sahne==='paylas'||sahne==='meyve-mutfagi')bolge('cicekci','Çiçekleri say, buket hazırla',buketiGoster([0,1,2],res),sahne==='paylas'?[55,38,14,22]:[94,36,8,13],sahneye('cicekci'),'buket-giris',[sahne==='paylas'?52:89,sahne==='paylas'?38:23,16,10]);
      if(sahne==='yelken-parkuru')yoluKapat=parkurAc(alan,k,res,is.kaydet,is.soyle,()=>is.gir('kagit'));
      if(sahne==='golet')yoluKapat=kayikGoleti(alan,k,res,is.kaydet,is.soyle,()=>is.gir('su-masasi'));
      if(sahne==='cicekci')cicekciyiKapat=cicekciAc(alan,k,res,is.kaydet,is.soyle,sahneye('anasinifi'));
      if(sahne==='veda')gosteriyiKapat=vedaAc({s,bolge,tasinabilir,res,is,yenile,ileri,yeniGun:is.yeniGun});
      if(sahne==='toplan')toplanAc({s,bolge,tasinabilir,secili:()=>secili?.id,aktar:(id)=>{if(secili)yerlestir(secili,id)},res,is,yenile,ileri});
      if(sahne==='cember')cemberAc({s,bolge,tasinabilir,secili:()=>secili?.id,aktar:(id)=>{if(secili)yerlestir(secili,id)},res,is,yenile});
      if(sahne==='oyku')oykuAc({s,bolge,res,is,yenile,ileri});
      if(sahne==='lavabo')lavaboAc({s,bolge,res,is,yenile,ileri});
      ({blok:bloklar,boyahane,'su-masasi':suMasasi,kagit,bahce} as Partial<Record<KresSahnesi,()=>void>>)[sahne]?.();
      if(sahne!=='veda'&&sahne!=='ev-yolu')geri('geri',sahne==='golet'?'Su masasına dön':'Köşelerden başka birini seç',sahne==='golet'?sahneye('su-masasi'):sahne==='yelken-parkuru'?sahneye('kagit'):don);
      bolge('dinle',sahne==='veda'?'Anneni tekrar dinle':'Yönergeyi tekrar dinle',simge(['veda','gosteri','ev-yolu','meyve-mutfagi'].includes(sahne)?'kulak':'ses'),[10,16,8,11],()=>{
        if(gosteriyiDinle)gosteriyiDinle();else is.soyle(kresYonergesi(s));
      },'kres-ok',[20,14,14,10]);
    }
    if(birakilan&&!hareketAz())eleman(birakilan)?.animate([{scale:'.91',rotate:'-2deg'},{scale:'1.025'},{scale:'1',rotate:'0deg'}],{duration:380});
    birakilan='';gozlem=undefined;
  }
  let tut:{id:number;el:HTMLElement;p:Parca;x:number;y:number;suruk:boolean}|undefined;
  function sal(){if(!tut)return;if(tut.p.id==='katla')katSil?.();tut.el.classList.remove('kres-elde');tut.el.style.removeProperty('translate');tut=undefined;donmeyiBirak?.()}
  function hareketEt(p:Parca){sesiAc();p.eylem?.()}
  alan.onpointerdown=ev=>{
    const el=(ev.target as Element).closest<HTMLElement>('[data-kres]');if(!el||tut||ev.button!==0)return;
    const p=parcalar.get(el.dataset.kres!);if(!p||(!p.eylem&&!p.hedef&&!(p.id==='kase'&&donmeyeBasla)))return;
    sesiAc();ev.preventDefault();el.setPointerCapture(ev.pointerId);tut={id:ev.pointerId,el,p,x:ev.clientX,y:ev.clientY,suruk:false};
    if(p.id==='kase')donmeyeBasla?.(ev);
  };
  alan.onpointermove=ev=>{
    if(!tut||tut.id!==ev.pointerId)return;
    if(tut.p.id==='kase'){donmeyeDevam?.(ev);return}
    const dx=ev.clientX-tut.x,dy=ev.clientY-tut.y;
    const dokunmaPayi=panel.classList.contains('kres-iki-oda')&&ev.pointerType==='touch'?16:7;
    if(Math.hypot(dx,dy)>dokunmaPayi)tut.suruk=true;
    if(tut.suruk&&tut.p.hedef){tut.el.classList.add('kres-elde');tut.el.style.translate=dx+'px '+dy+'px';if(tut.p.id==='katla')katIzi?.(ev.clientX,ev.clientY)}
  };
  alan.onpointerup=ev=>{
    if(!tut||tut.id!==ev.pointerId)return;
    const {p,suruk}=tut;sal();
    if(!suruk){
      // A physical tap can emit a compatibility click on the screen it just opened.
      // Consume only that click at the same point; a new press starts a new gesture.
      const iptal=new AbortController(),sonX=ev.clientX,sonY=ev.clientY;
      const kapat=()=>iptal.abort();
      document.addEventListener('click',son=>{
        if(son.detail&&Math.hypot(son.clientX-sonX,son.clientY-sonY)<20){son.preventDefault();son.stopImmediatePropagation()}
        kapat();
      },{capture:true,once:true,signal:iptal.signal});
      document.addEventListener('pointerdown',kapat,{capture:true,once:true,signal:iptal.signal});
      window.setTimeout(kapat,450);hareketEt(p);return;
    }

    const adaylar=sahne==='blok'?[...parcalar.values()].filter(q=>q.stil==='kres-yuva').map(q=>q.id):sahne==='toplan'?[...parcalar.keys()].filter(id=>id.startsWith('kutu-')):p.hedef;
    const yakin=adaylar?.flatMap(id=>{
      const r=eleman(id)?.getBoundingClientRect();
      if(!r||ev.clientX<r.left-7||ev.clientX>r.right+7||ev.clientY<r.top-7||ev.clientY>r.bottom+7)return [];
      return [{id,uzaklik:Math.hypot(ev.clientX-r.left-r.width/2,ev.clientY-r.top-r.height/2)}];
    }).sort((a,b)=>a.uzaklik-b.uzaklik);
    const id=yakin?.[0]?.id;
    if(id&&p.hedef)yerlestir(p,id);else if(p.hedef)efekt.dokunma();
  };
  alan.onpointercancel=alan.onlostpointercapture=ev=>{if(tut?.id===ev.pointerId)sal()};
  alan.onclick=ev=>{if(ev.detail)return;const id=(ev.target as Element).closest<HTMLElement>('button[data-kres]')?.dataset.kres;if(id&&parcalar.has(id))hareketEt(parcalar.get(id)!)};
  yenile();
  return ()=>{kesfiKapat?.();yoluKapat?.();cicekciyiKapat?.();gosteriyiKapat?.()};
}

