import {kupaKazandi} from './gosteri-kaydi';
import type {Sabah} from './model';
import type {Bolge,KosedekiIsler,Tasima} from './kres-servis';
import {bitkiYasi,karisim,type Kose} from './kres-kaydi';
import {otomobil,baski,saksi,kayik,kagitRenkleri,legen} from './kres-oyuncaklari';
import {konusmaTasi} from './kres-cember';
import {sabun} from './kres-lavabo';
import {oykuKapak} from './kres-oyku';
import {panoGalerisi} from './pano-resmi';
import {cerceve,yemek} from './meyve-cizimi';
import {buketiGoster} from './cicekci';
import {pozlar,pozOynat,sahneIkon} from './gosteri-sahnesi';
import {simge} from './cizim';
import {kalanSandvic,isirilanMeyve} from './artanlar';
import {minonunEtiketi,sergiEtiketi} from './sergi';
import {efekt} from '../../src/audio/efekt';
import {patiAlkisi,ayakSesi} from '../../src/audio/sahne-ortami';
import {cevapNotasi,kaydiHazirla,sahneMuzigi,tempo} from './gosteri-muzigi';
import {fonuBeklet} from '../../src/audio/muzik';
import {dansCumlesi,dansPozlari,kendiDansKesiti} from './gosteri-koreografi';
import {aniyiOynat,gosteriFotografi,dansSeridi} from './ev-gosteri-anisi';
import type {SahneAnisi} from './gosteri-kaydi';

type Veda={s:Sabah;bolge:Bolge;tasinabilir:Tasima;res:(id:string)=>string;is:KosedekiIsler&{sus:()=>void};yenile:()=>void;ileri:(id:string,ad:string,yap:()=>void)=>void;yeniGun:()=>void};
// Yalnız ekran okuyucuya: çocuk yine yalnızca o gün yaptığı işin resmini görür.
const anilarinAdi:Record<Kose,string>={
  blok:'Yaptığın arabayı',boyahane:'Karıştırdığın boyaları','su-masasi':'Su deneyini',kagit:'Kâğıt kayığını',
  bahce:'Sınıf bahçesini',paylas:'Arkadaşlarına hazırladığın tabakları',muzik:'Çaldığın ritmi',kolye:'Dizdiğin kolyeyi',
  pano:'Panoya astığın resmi',harf:'Kendi yazdığın etiketi',beslenme:'Beslenme çantanı',lavabo:'Patilerini nasıl yıkadığını',
  oyku:'Tekerleğin öyküsünü',cember:'Sabah çemberini',beste:'Yaptığın besteyi','serbest-resim':'Çizdiğin resmi',
  cicekci:'Hazırladığın buketi','meyve-mutfagi':'Hazırladığın meyveleri',gosteri:'Zıpzıp ile sahneye çıkışını',
};
export function vedaSozu(s:Sabah){
  const {evKarsilama,gosteri}=s.kres,r=gosteri.sonuc;
  if(evKarsilama==='kapi')return 'anne_eve_karsila';
  if(evKarsilama==='sarilma')return 'anne_eve_sarilma';
  if(evKarsilama==='goster'&&r?.dal==='dans'&&(gosteri.dansDizisi.length||gosteri.sonAni?.dansDizisi?.length))return 'anne_eve_kendi_dans';
  if(r?.siir&&(evKarsilama==='goster'||evKarsilama==='ani'))return 'anne_eve_siir';
  if(evKarsilama==='goster')return r?.dal==='dans'?'anne_eve_bana_dans':'anne_eve_bana_nota';
  if(evKarsilama==='kapanis')return 'anne_eve_sarilalim';
  if(evKarsilama==='pano')return 'anne_eve_pano';
  if(r&&!kupaKazandi(r)&&s.kres.bugununKupasi)return 'anne_eve_onceki_kupa_'+r.dal;
  return r?(kupaKazandi(r)?'anne_eve_kupa_':'anne_eve_')+r.dal:'anne_eve_anlat';
}
export function vedaAc({s,bolge,tasinabilir,res,is,yenile,ileri,yeniGun}:Veda){
  const k=s.kres,son=k.anlatilan,sonuc=k.gosteri.sonuc;
  const dizi=sonuc?.dal==='dans'?(k.gosteri.dansDizisi.length?k.gosteri.dansDizisi:k.gosteri.sonAni?.dansDizisi??[]):[];
  const gununAnisi=k.gosteri.sonAni&&dizi.length?{...k.gosteri.sonAni,dansDizisi:[...dizi]}:k.gosteri.sonAni;
  const adaylar:Kose[]=k.biten.filter(n=>n!=='gosteri').slice(sonuc?-2:-3);
  if(sonuc)adaylar.push('gosteri');
  const baskiRengi=k.baskilar[k.baskilar.length-1]??karisim(k.boyalar);
  function nesne(kose:Kose){
    switch(kose){
      case 'cicekci':return buketiGoster(k.buket.sonBuket??[0,1],res);
      case 'gosteri':return kupaKazandi(sonuc)?sahneIkon.kupa:sonuc?.dal==='dans'?sahneIkon.adim:sahneIkon.mikrofon;
      case 'beste':return res('etkinlik/muzik-'+(k.beste.vuruslar.find(i=>i>=0)??0));
      case 'blok':return otomobil(undefined,false,k.arabaRengi);
      case 'boyahane':return baski(baskiRengi,true,k.boyaliResimler[baskiRengi]);
      case 'su-masasi':return legen;
      case 'kagit':return kayik(3,kagitRenkleri[k.gemiRengi]);
      case 'bahce':return saksi(bitkiYasi(k),k.tohum);
      case 'meyve-mutfagi':{const h=k.meyveMutfagi.hatira;return h?cerceve(yemek(h.tarif,h.dizilen,h.kesitler),'15 85 370 173'):res('etkinlik/meyve-2')}
      case 'paylas':return '<span class="ev-sofra-hatirasi">'+k.tabaklar.map(t=>{
        const yerler=t.length===1?[[50,43]]:t.length===2?[[37,46],[63,42]]:[[50,27],[32,49],[66,47],[41,65],[61,67]];
        return '<i>'+res('etkinlik/sergi-tabak')+t.map((n,j)=>'<b style="left:'+yerler[j][0]+'%;top:'+yerler[j][1]+'%">'+res('etkinlik/meyve-'+n)+'</b>').join('')+'</i>';
      }).join('')+'</span>';
      case 'kolye':return '<span class="kres-kabuklar">'+(k.kolyeHatira.length?k.kolyeHatira.slice(0,3):[0,1,2]).map(i=>res('etkinlik/deniz-'+i)).join('')+'</span>';
      case 'muzik':return res('etkinlik/muzik-1');
      case 'serbest-resim':
      case 'pano':{const kendi=panoGalerisi()[0];return kendi?'<img alt="" src="'+kendi.resim+'">':res('etkinlik/kalemlik-0')}
      case 'harf':{
        const d=s.ders.sergi,sanat=(ad:string)=>res('etkinlik/'+ad);
        if(d.limon.asama==='bitti')return minonunEtiketi(d,sanat);
        if(d.asili||d.kart>0)return sergiEtiketi(d,Math.max(0,Math.min(2,d.asili?d.kart:d.kart-1)),sanat);
        return res('etkinlik/kalemlik-0');
      }
      case 'beslenme':return s.kalanPaketlendi&&s.meyve
        ?'<span class="ev-beslenme-hatirasi"><i>'+kalanSandvic(s.ic)+'</i><i>'+isirilanMeyve(s.meyve)+'</i></span>':res('bento-kapali');
      case 'lavabo':return sabun;
      case 'oyku':return oykuKapak(res('kres/oyku-0'));
      case 'cember':return konusmaTasi;
    }
  }
  const ev=k.evKarsilama,kazandi=kupaKazandi(sonuc),oncekiKupa=!!k.bugununKupasi&&!!sonuc&&!kupaKazandi(sonuc);
  let aniyiKapat:(()=>void)|undefined,albumuKapat:(()=>void)|undefined;
  const aileSaatleri=new Set<number>(),aileDinleyicisi=new AbortController();
  const aileSus=()=>{aileSaatleri.forEach(id=>clearTimeout(id));aileSaatleri.clear()};
  function aileBekle(ms:number,yap:()=>void){const id=window.setTimeout(()=>{aileSaatleri.delete(id);if(!document.hidden&&!document.querySelector('dialog[open]'))yap()},ms);aileSaatleri.add(id)}
  let dansiDurdur:(()=>void)|undefined;
  const temizle=()=>{dansiDurdur?.();aileSus();aileDinleyicisi.abort();aniyiKapat?.();albumuKapat?.()};
  function vitrin(){
    bolge('ev-kupa-rafi','Kino ile Zıpzıp’ın kazandığı kupa',
      '<span class="ev-kupa-rafi"><span>'+sahneIkon.kupa+'</span><i></i></span>',[90.5,40.3,11,8.8],()=>is.soyle(oncekiKupa?'kino_eve_kupa_'+k.bugununKupasi!.dal:'kino_eve_kupa'),'',[89,39.7,15,5.4]);
  }
  const album=(el:HTMLElement,h:SahneAnisi|undefined|null,soz:string)=>{
    const alan=el.closest<HTMLElement>('.kres-sahne');
    if(alan&&h){aniyiKapat?.();aniyiKapat=aniyiOynat(alan,h,res,is.sus,el)}else is.soyle(soz);
  };
  if(ev==='sarilma'){
    if(k.evKupasi||kazandi||oncekiKupa){
      bolge('ev-son-kupa','Rafa konan gösteri kupasını dinle','<span class="ev-kupa-rafi"><span>'+sahneIkon.kupa+'</span><i></i></span>',[93,40.7,9,6.6],()=>is.soyle(oncekiKupa?'kino_eve_kupa_'+k.bugununKupasi!.dal:kazandi?'kino_eve_kupa_'+sonuc!.dal:'kino_eve_kupa'),'ev-son-ani',[84,30.5,17,6.5]);
    }
    if(son){
      const ani=son==='gosteri'?gununAnisi:null;
      const soz=son==='gosteri'&&sonuc?.siir?'kino_eve_siir':son==='gosteri'&&sonuc?(kazandi?'kino_eve_kupa_':'kino_eve_')+sonuc.dal:'kino_gunum_'+son.replace('-','_');
      const hatira=bolge('ev-son-hatira',ani?'Duvardaki gösteri fotoğrafını oynat':'Duvardaki günün hatırasını dinle','<span class="ev-son-pano"><i class="ev-hatira ev-ani-fotografi">'+(ani?gosteriFotografi(ani,res):nesne(son))+'</i></span>',[93,21,10,16],()=>album(hatira,ani,soz),'ev-son-ani',[84,18,23,10]);
    }
    bolge('ev-sarilma','Annenin sözünü tekrar dinle','',[48,59,64,65],()=>is.soyle('anne_eve_sarilma'),'',[49,56,80,53]);
    ileri('yeni-gun','Yeni okul gününe başla',yeniGun);return temizle;
  }
  const eski=k.evAlbumu.filter(h=>h.gun<k.gun);
  window.addEventListener('hazirlik-mola',aileSus,{signal:aileDinleyicisi.signal});
  const kupayiBirakti=kazandi&&(ev==='kapanis'||ev==='goster'||ev==='pano'&&(son!=='gosteri'||dizi.length>0||k.evHareketi!==null));
  if(kupayiBirakti||k.evKupasi||oncekiKupa&&ev!=='kapi')vitrin();
  if(eski.length){
    // Tek tek ufak, üst üste binen raptiyeler yerine çocuk koltuğun üzerindeki
    // albümü açar. Önceki üç okul gününden asıl gösteriyi kendi kıyafetiyle görür.
    const kitap=bolge('ev-aile-albumu','Aile albümünü aç',res('kres/ev-album-kapak'),[87,56,12,13],ac,'ev-album-kitabi',[90,50,15,6]);
    function ac(){
      if(albumuKapat)return;
      const alan=kitap.closest<HTMLElement>('.kres-sahne');if(!alan)return;
      is.sus();efekt.sayfa();
      const pencere=document.createElement('dialog');pencere.className='ev-aile-albumu';pencere.setAttribute('aria-label','Önceki gösterilerin aile albümü');
      const sayfalar=document.createElement('div');sayfalar.className='ev-album-sayfalari';
      for(const h of [...eski].reverse()){
        const foto=document.createElement('button');foto.type='button';foto.className='ev-album-sayfasi';
        foto.setAttribute('aria-label',h.gun+'. gün, '+(h.dal==='dans'?'dans':h.ani?.program?.startsWith('siir')?'şiir':'şarkı')+' gösterisi, '+h.puan+' puan');
        foto.innerHTML='<i class="ev-album-fotosu">'+(h.ani?gosteriFotografi(h.ani,res):kupaKazandi(h)?sahneIkon.kupa:h.dal==='dans'?sahneIkon.adim:sahneIkon.mikrofon)+'</i><span>'+simge(h.ani?'ileri':'kulak')+'</span>';
        foto.onclick=()=>album(foto,h.ani,kupaKazandi(h)?'kino_eve_kupa':'kino_eve_'+h.dal);sayfalar.append(foto);
      }
      const kapa=document.createElement('button');kapa.type='button';kapa.className='ev-album-kapa';kapa.setAttribute('aria-label','Albümü kapat');kapa.innerHTML=simge('ev');
      const kapat=()=>{if(!pencere.isConnected)return;pencere.close();pencere.remove();is.sus();window.removeEventListener('hazirlik-mola',kapat);albumuKapat=undefined;if(kitap.isConnected)kitap.focus({preventScroll:true})};
      kapa.onclick=kapat;pencere.addEventListener('cancel',e=>{e.preventDefault();kapat()});
      pencere.append(sayfalar,kapa);alan.append(pencere);albumuKapat=kapat;window.addEventListener('hazirlik-mola',kapat);
      pencere.showModal();(sayfalar.firstElementChild as HTMLElement).focus({preventScroll:true});
    }
  }
  const tepki=sonuc?.siir?'anne_eve_siir':sonuc?(kazandi?'anne_eve_kupa_':oncekiKupa?'anne_eve_onceki_kupa_':'anne_eve_')+sonuc.dal:'anne_eve_anlat';
  const anlat=()=>{if(son==='gosteri'&&sonuc?.siir)return 'kino_eve_siir';if(son==='gosteri'&&sonuc)return (kazandi?'kino_eve_kupa_':'kino_eve_')+sonuc.dal;return son?'kino_gunum_'+son.replace('-','_'):ev==='kapi'?'kino_eve_merhaba':'kino_eve_seceyim'};
  const alkis=!!sonuc&&ev==='ani';
  const saril=()=>{k.evKarsilama='sarilma';yenile();is.soyle('anne_eve_sarilma')};
  const sohbet=ev==='goster'||ev==='pano'||ev==='kapanis';
  const ikiliGoster=ev==='pano'&&son==='gosteri'&&!!sonuc&&k.evHareketi!==null;
  const eslik=ikiliGoster&&sonuc?.dal==='dans';
  const evDans=ev==='goster'&&son==='gosteri'&&dizi.length>0;
  const anneSanati=pozlar('anne-sohbet',6,res,'ev-sohbet')+
    (evDans?pozlar('anne-alkis',6,res,'ev-eslik'):!sohbet||eslik?pozlar(eslik?(k.evHareketi?'anne-adim':'anne-alkis'):alkis?'anne-alkis':'anne-karsilama',6,res,'ev-eslik'):'');
  const anne=bolge('anne',ev==='kapanis'?'Annene sarıl':'Anneni dinle',anneSanati,[67,59,33,65],()=>{if(ev==='kapanis'){saril();return}anne.classList.remove('eslik-ediyor');is.soyle(vedaSozu(s))},'ev-oyuncu',[73,59,41,47]);
  if(eslik||!sohbet){
    const hareket=eslik?(k.evHareketi?[0,1,2,3,4,5]:[0,1,2,3,4,3,4,5]):alkis?[0,1,2,3,4,3,4,5]:[0,1,2,3,4];
    const geri=()=>{if(anne.isConnected)anne.classList.remove('eslik-ediyor')};
    const sirada=anne.querySelector('.ev-eslik');
    void Promise.allSettled([...sirada!.querySelectorAll('img')].map(im=>im.decode())).then(()=>{
      if(!anne.isConnected||document.hidden)return;
      const katil=()=>{if(!anne.isConnected||document.hidden)return;anne.classList.add('eslik-ediyor');pozOynat(sirada,hareket,180);window.setTimeout(geri,hareket.length*180+100)};
      if(eslik)aileBekle(420,katil);else katil();
    });
  }
  const canlandir=(ev==='goster'||ikiliGoster)&&son==='gosteri'&&sonuc;
  const evPozu=()=>sonuc?.dal==='dans'?(k.evHareketi===1?[0,1,2,3,4,7]:[4,5,6,5,7]):[0,1,2,3,4,5,6,7];
  const kupali=kazandi&&!kupayiBirakti||oncekiKupa&&ev==='kapi';
  const konusmaSeti='kino-sohbet-'+(s.renk||'yesil')+(kupali?'-kupa':'');
  const sakin:readonly number[] = kupali?[5]:canlandir?[7]:s.renk==='sari'?[5]:[1];
  const evdekiHareket=()=>canlandir?evPozu():kupali?[0,1,2,3,4,5]:s.renk==='sari'?[1,2,3,4,5]:[1,2,3,5,1];
  const renk=s.renk==='sari'?'sari':'yesil';
  const kinoEylem=kupali?pozlar('kino-kupa-'+renk,6,res,'ev-kino-eylem'):canlandir?pozlar('kino-'+(renk==='sari'?'sari-':'')+sonuc.dal,8,res,'ev-kino-eylem',evDans?dansPozlari('kino',renk):[]):pozlar('kino-ev-'+renk,6,res,'ev-kino-eylem');
  const kinoSes=pozlar(konusmaSeti,6,res,'ev-kino-ses ev-sohbet');
  const kino=bolge('eve-kino',ev==='kapanis'?'Kino ile annesine sarıl':'Kino’nun anlattığını dinle',kinoEylem+kinoSes,
    [39,71,27,42],()=>{if(ev==='kapanis'){saril();return}pozOynat(kino.firstElementChild,evdekiHareket(),195);is.soyle(anlat())},'ev-oyuncu',[34,64,37,31]);
  if(ikiliGoster&&sonuc?.dal==='sarki'){
    const sirasi=k.evHareketi;
    // Aynı üç notanın bir oktav alttaki cevabı. Sadece çocuk bu hareketi
    // istediğinde çal; panoyu yeniden açmak eski konuşmayı başlatmasın.
    anne.addEventListener('hazirlik-aile-esligi',()=>{
      let etkin=true;
      const iptal=()=>{etkin=false};
      const oda=anne.closest('.kres-sahne');
      oda?.addEventListener('pointerdown',iptal,{once:true,signal:aileDinleyicisi.signal});
      const dur=()=>etkin&&anne.isConnected&&!document.hidden&&!document.querySelector('dialog[open]')&&k.evHareketi===sirasi;
      aileBekle(1000,()=>{if(dur())cevapNotasi(!!sirasi,0,false,true)});
      aileBekle(2010,()=>{if(dur())is.soyle(sirasi?'anne_eve_yanki_ay':'anne_eve_yanki_gunes');oda?.removeEventListener('pointerdown',iptal)});
    },{once:true});
  }
  pozOynat(kino.firstElementChild,ev==='goster'?[0]:canlandir?evPozu():son?evdekiHareket():sakin,205);
  if(ev==='kapi'){
    const as=()=>{
      // Eve erkenden döndüyse seçebileceği bir anı yok; anne çocuktan
      // görünmeyen bir kartı istemesin. Çanta asıldıktan sonra sarılsınlar.
      k.evKarsilama=adaylar.length?'ani':'sarilma';if(oncekiKupa)k.evKupasi=true;
      yenile();is.soyle(adaylar.length?tepki:'anne_eve_sarilma');
    };
    bolge('ev-kanca','Çantanın askısı','',[4,37,9,16],as,'ev-kanca',[5,39,12,11]);
    tasinabilir('ev-aski','Çantayı askıya as',res('canta'),[23,74,14,20],[18,76,23,14],['ev-kanca'],as);
    return temizle;
  }
  bolge('ev-asili-canta','Askıdaki okul çantası',res('canta'),[4.8,42,10,17],undefined,'',[5.5,43,13,12]);
  if(ev==='goster'&&sonuc){
    if(evDans){
      const serit=bolge('ev-kendi-dansin','Hazırladığın dansı annene göster',dansSeridi(dizi,renk,res),
        [49,19,10+dizi.length*6,13],()=>void oyna(),'ev-dans-secimi',[48,27,15+dizi.length*12,10]);
      const kartlar=[...serit.querySelectorAll('i')];
      const plan=kendiDansKesiti(dizi);
      let muzik:ReturnType<typeof sahneMuzigi>|undefined,kare=0,surum=0,calisiyor=false;
      function dur(){
        surum++;cancelAnimationFrame(kare);aileSus();muzik?.durdur();muzik=undefined;
        if(calisiyor)fonuBeklet(false);calisiyor=false;
        serit.removeAttribute('aria-busy');kartlar.forEach(kart=>kart.classList.remove('sirada'));
        anne.classList.remove('eslik-ediyor');pozOynat(kino.firstElementChild,[0],150);
      }
      async function oyna(){
        if(calisiyor)return;is.sus();calisiyor=true;fonuBeklet(true);
        serit.setAttribute('aria-busy','true');const id=++surum;
        await Promise.allSettled([kaydiHazirla('dans'),...[...kino.querySelectorAll('img'),...anne.querySelectorAll('img')].map(im=>im.decode())]);
        if(id!==surum||!kino.isConnected||document.hidden)return;
        muzik=sahneMuzigi('dans',plan.bas,64);let onceki=-1;
        const az=matchMedia('(prefers-reduced-motion: reduce)').matches;
        function goster(){
          if(!muzik)return;
          const vurus=muzik.gecen()*tempo.dans/60,i=Math.floor(vurus/2);
          if(i>=0&&i<dizi.length&&i!==onceki){
            const el=dizi[i],c=dansCumlesi(el,tempo.dans);onceki=i;
            kartlar.forEach((kart,j)=>kart.classList.toggle('sirada',j===i));
            pozOynat(kino.firstElementChild,az?[c.kinoTepe]:c.kino,c.ms);
            if(c.ses)aileBekle(az?0:c.temas*c.ms,()=>{if(c.ses==='alkis')patiAlkisi();else ayakSesi(true,true)});
          }
          if(i===dizi.length&&i!==onceki){
            onceki=i;anne.classList.add('eslik-ediyor');pozOynat(anne.querySelector('.ev-eslik'),az?[3]:[0,1,2,3,4,5],60000/tempo.dans/3);
            aileBekle(60000/tempo.dans*2/3,patiAlkisi);
          }
          if(vurus>=64-plan.bas){dur();is.soyle('anne_eve_dans_tebrik');return}
          kare=requestAnimationFrame(goster);
        }
        goster();
      }
      dansiDurdur=dur;const options={signal:aileDinleyicisi.signal};
      document.addEventListener('visibilitychange',()=>{if(document.hidden)dur()},options);
      window.addEventListener('hazirlik-mola',dur,options);
      const oda=serit.closest('.kres-sahne');
      oda?.addEventListener('click',e=>{if(calisiyor&&!serit.contains(e.target as Node))dur()},{...options,capture:true});
      ileri('ev-dans-panoya','Gösteri fotoğrafını panoya götür',()=>{k.evKarsilama='pano';yenile();is.soyle('anne_eve_pano')});
      return temizle;
    }
    if(sonuc.siir){
      bolge('ev-siir-yagmur','Kino yağmurun kapıyı çalışını okusun',sahneIkon.mikrofon,[43,24,12,15],()=>is.soyle('kino_siir_6'),'ev-aile-secimi',[36,29,20,12]);
      bolge('ev-siir-tohum','Zıpzıp tohumun cevabını okusun',res('kres/zip-sarki-3'),[59,24,12,15],()=>is.soyle('zip_siir_8'),'ev-aile-secimi',[62,29,20,12]);
      ileri('ev-siir-panoya','Şiir hatırasını panoya götür',()=>{k.evHareketi=0;k.evKarsilama='pano';yenile();is.soyle('anne_eve_pano')});
      return temizle;
    }
    const dans=sonuc.dal==='dans';
    ([0,1] as const).forEach(n=>{
      const sanat=dans?(n?sahneIkon.adim:sahneIkon.alkis):(n?sahneIkon.ay:sahneIkon.gunes);
      bolge('ev-goster-'+n,dans?(n?'Annene adımı göster':'Annenle alkış yap'):(n?'Ay notasını söyle':'Güneş notasını söyle'),'<span class="kres-ani-resmi">'+sanat+'</span>',
        [45+n*12,19,10,13],()=>{is.sus();k.evHareketi=n;k.evKarsilama='pano';const alan=anne.parentElement;yenile();
          if(dans){if(n)ayakSesi(true,true);else patiAlkisi()}else{cevapNotasi(!!n);alan?.querySelector('[data-kres=anne]')?.dispatchEvent(new Event('hazirlik-aile-esligi'))}
          if(dans)window.setTimeout(()=>{if(!document.hidden&&alan?.isConnected&&!document.querySelector('dialog[open]')&&k.evKarsilama==='pano')is.soyle(n?'kino_eve_adim':'kino_eve_alkis')},670);
        },'ev-aile-secimi',[37+n*26,27,19,10]);
    });return temizle;
  }
  if(ev==='pano'||ev==='kapanis'){
    // Anne kazanan çocuktan da şarkısını/adımını görmek istiyor. Fotoğrafı
    // hemen asabilir; eşlik etmek isterse önce kupası rafa, sonra patileri harekete gider.
    if(ev==='pano'&&son==='gosteri'&&kazandi&&!dizi.length&&k.evHareketi===null){
      const dans=sonuc!.dal==='dans';
      bolge('ev-birlikte-goster',dans?'Annenle kazanan dansı yeniden yap':sonuc?.siir?'Annenle kazanan şiiri yeniden oku':'Annenle kazanan şarkıyı yeniden söyle',
        '<span class="kres-ani-resmi">'+(dans?sahneIkon.adim:sahneIkon.mikrofon)+'</span>',
        [50,23,10,13],()=>{k.evKarsilama='goster';yenile();is.soyle(vedaSozu(s))},'ev-aile-secimi',[48,30,18,10]);
    }
    const eser=son==='gosteri'&&gununAnisi?gosteriFotografi(gununAnisi,res):son?nesne(son):sahneIkon.yildiz;
    const as=()=>{if(k.evKarsilama!=='pano')return;k.evKarsilama='kapanis';if(kazandi)k.evKupasi=true;
      if(son==='gosteri'&&sonuc)k.evAlbumu=[...k.evAlbumu.filter(h=>h.gun!==k.gun),{gun:k.gun,...sonuc,...(gununAnisi?{ani:gununAnisi}:{})}].slice(-3);
      efekt.yapis();yenile();is.soyle('anne_eve_sarilalim')};
    // Kupa Kino'nun patilerinde kalır. Panoya asılan, o güne ait resimli anı kartıdır.
    const art='<span class="ev-hatira ev-ani-fotografi">'+eser+'</span>';
    if(ev==='pano'){
      bolge('ev-pano','Hatıranı buraya yerleştir',sahneIkon.yildiz,[91,26,11,16],as,'ev-pano-yer',[88,31,16,13]);
      tasinabilir('ev-hatira','Günün hatırasını panoya as',art,[50,79,14,18],[50,82,22,14],['ev-pano'],as);
    }else{const foto=bolge('ev-hatira',son==='gosteri'&&gununAnisi?'Gösteri anını izle':'Panodaki hatıranı dinle',art,[91,26,11,16],()=>album(foto,son==='gosteri'?gununAnisi:null,anlat()),'ev-hatira-tus',[88,31,16,13])}
  }
  const yer=adaylar.length===1?48:adaylar.length===2?37:23;
  if(ev==='ani')adaylar.forEach((kose,i)=>{
    const ad=kose==='gosteri'&&sonuc?(sonuc.dal==='dans'?'Zıpzıp ile dansını':sonuc.siir?'Zıpzıp ile okuduğun şiiri':'Zıpzıp ile söylediğin şarkıyı'):anilarinAdi[kose];
    const fotograf=kose==='gosteri'&&gununAnisi;
    const kart=fotograf
      ? '<span class="kres-ani-resmi ev-anlat-fotografi">'+gosteriFotografi(fotograf,res)+'</span>'
      : '<span class="kres-ani-resmi">'+nesne(kose)+'</span>';
    const g=bolge('hatirla-'+kose,ad+' annene anlat',kart,
      [20,30+i*18,13,16],()=>{
        k.anlatilan=kose;k.evKarsilama=kose==='gosteri'&&sonuc&&(!kazandi||dizi.length)?'goster':'pano';yenile();efekt.sayfa();
          is.soyle(k.evKarsilama==='goster'?vedaSozu(s):kose==='gosteri'&&sonuc?(sonuc.siir?'kino_eve_siir':'kino_eve_kupa_'+sonuc.dal):'kino_gunum_'+kose.replace('-','_'));
      },'kres-anlati',[yer+i*26,29,21,12]);
    g.setAttribute('aria-pressed',String(son===kose));
  });
  if(ev==='kapanis'||!adaylar.length)ileri('yeni-gun','Yeni okul gününe başla',yeniGun);
  return temizle;
}
