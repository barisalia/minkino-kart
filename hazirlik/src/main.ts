import './stil.css';
import { dersSorusu } from './sinif-etkinligi';
import { malzeme } from './malzemeler';
import { efekt, sesiAc, sessizeAlDegistir, tumSesKapaliMi } from '../../src/audio/ses';
import { durum } from '../../src/engine/ilerleme';
import { muzikKis } from '../../src/audio/motor';
import { anaMenuyeDon } from '../../src/uygulama';
import { geriDinle } from '../../src/kabuk/yon';
import { oku, sakla, yeni, icler, dersKisayolu, type Sabah } from './model';
import { dersFonu, dersGoster, okulArkadaslari } from './ders';
import { simge, ray, tahta, tepsi, tabak, askilik, katliPecete, acikPecete } from './cizim';
import { mataraResmi, kapakResmi, servisTakimi, dolumTezgahi, suBardagi } from './su-cizim';
import { kalanSandvic, isirilanMeyve } from './artanlar';
import { suIstasyonu } from './su-oyunu';

const files=import.meta.glob<string>('../../assets/hazirlik/*.webp',{eager:true,query:'?url',import:'default'});
const voices=import.meta.glob<string>('../../assets/hazirlik/ses/*.mp3',{eager:true,query:'?url',import:'default'});
const url=(n:string)=>malzeme(n)??files['../../assets/hazirlik/'+n+'.webp'];
const img=(n:string)=>'<img draggable="false" alt="" src="'+url(n)+'">';
const stage=document.querySelector<HTMLElement>('#sahne')!, bg=document.querySelector<HTMLElement>('#fon')!, nav=document.querySelector<HTMLElement>('#kontrol')!;
let s=oku(), voice:HTMLAudioElement|undefined, locked=false, hintTimer=0;
let suyuDurdur: (()=>void) | undefined;
let hareketSonu = 0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const short=matchMedia('(max-aspect-ratio: 1/1)');
type Pos=[number,number,number,number];
type Action={key:string; name:string; to?:string; landing?:string; run:()=>void};
const actions=new Map<string,Action>();
function stopVoice() {
  delete stage.dataset.sesOynuyor;
  if (!voice) return;
  voice.pause();
  voice = undefined;
  muzikKis(false);
}
function speak(id: string, sonra?:()=>void) {
  stopVoice();
  const url = voices['../../assets/hazirlik/ses/' + id + '.mp3'];
  if (!durum.i.ayarlar.konusma || !url) return;
  const clip = new Audio(url);
  voice = clip;
  clip.volume = durum.i.ayarlar.seviye;
  const finish = () => { if (voice === clip) stopVoice() };
  clip.addEventListener('playing', () => { if (voice === clip) {stage.dataset.sesOynuyor="evet";muzikKis(true)} }, { once: true });
  clip.addEventListener('ended', () => { if(voice===clip){stopVoice();sonra?.()} }, { once:true });
  clip.addEventListener('error', finish, { once: true });
  void clip.play().catch(finish);
}
function enter(n:Sabah['sahne']){s.sahne=n;const line:Record<string,string>={oda:'basla',mutfak:'mutfak',kutu:'kutu',matara:'matara',canta:'canta',aski:'aski',sofra:'sofra',tat:'son',topla:'topla',ders:'ders',cizgi:'cizgi',yuvarlak:'yuvarlak',resim:'balon',etkinlik:dersSorusu(s)};if(line[n])speak(line[n],n==="resim"?()=>{if(s.sahne==="resim")speak("balondan_sonra")}:undefined);}
function piece(id:string,art:string,pos:Pos,portrait?:Pos,action?:Action,cls=''){
 const el=document.createElement(action?'button':'div'); const [x,y,w,h]=short.matches&&portrait?portrait:pos;
 el.className='piece '+cls;el.dataset.id=id;Object.assign(el.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});el.innerHTML=art;
 if(action){el.setAttribute('aria-label',action.name);el.dataset.action=action.key;actions.set(action.key,action)}else el.setAttribute('aria-hidden','true');
 stage.append(el);return el;
}
const item=(n:string,pos:Pos,p?:Pos,a?:Action,cls='')=>piece(n,img(n),pos,p,a,cls);
function action(key:string,name:string,run:()=>void,to?:string,landing?:string):Action{return {key,name,run,to,landing}}
function nextIcon(a:Action,icon='ok'){piece('ileri','<span class="disk">'+simge(icon)+'</span>',[91,84,11,17],[86,87,19,13],a,'round')}
const kino=()=>s.renk||'pijama';
function layer(id: string, index: number) {
  return '<img alt="" draggable="false" class="kat kat-'+id+'" style="--i:'+index+'" src="'+url(id)+'">';
}
function stack(closed: boolean, fillings = s.ic) {
  const layers = ['ekmek', ...fillings];
  if (closed) layers.push('ekmek');
  return '<span class="stack">'+layers.map(layer).join('')+'</span>';
}
function bento(food:boolean,fruit:boolean){
  return '<span class="box">'+img('bento-acik')+
    '<span class="inbread" data-id="sandvic-gozu">'+(food?stack(true):'')+'</span>'+
    '<span class="infruit" data-id="meyve-gozu">'+(fruit&&s.meyve?img(s.meyve):'')+'</span></span>';
}
const backgrounds:Record<Sabah['sahne'],string>={basla:'kapak',oda:'oda',mutfak:'mutfak',kutu:'mutfak',matara:'mutfak',canta:'mutfak',aski:'sinif',sofra:'sinif',tat:'sinif',topla:'sinif','kutuyu-kaldir':'sinif',son:'sinif',ders:'derslik',cizgi:'derslik',yuvarlak:'derslik',resim:'derslik',etkinlik:'derslik','ders-zili':'derslik'};
const current=(id:string)=>stage.querySelector<HTMLElement>('[data-id="'+id+'"]');
function suAlani(evde: boolean, pos: Pos, dik: Pos) {
  const alan = piece('su-alani','',pos,dik);
  suyuDurdur = suIstasyonu(alan,{
    evde, miktar: evde?s.su:s.bardak,
    kaydet(miktar) {
      if (evde) s.su=miktar; else s.bardak=miktar;
      sakla(s);
    },
    tamamla:render,
  });
}
function cantaResmi(acik: boolean, cepDolu: boolean, su=1) {
  const sise = cepDolu ? '<span class="cep-sise">'+mataraResmi('cepteki-su',su)+'</span>' : '';
  return '<span class="sirt-cantasi">'+sise+img(acik?'canta-acik':'canta')+'</span>';
}
function sofraPortresi(tok: boolean) {
  const ad = tok ? 'tok-'+s.renk : kino();
  const oran = tok ? .947 : .695;
  const sanat = '<span class="sofra-portresi" style="--oran:'+oran+'">'+img(ad)+
    '<span data-id="agiz" style="left:'+(tok?56:60)+'%;top:'+(tok?44:33)+'%"></span></span>';
  return piece(ad,sanat,tok?[35,43,41,61]:[35,52,40,90],tok?[39,43,63,48]:[41,54,65,80],undefined,'portre-alani');
}
let donenNesne: 'meyve' | 'bardak' | undefined;
// Meyvenin sağ yanağı, bardağın sol kenarı dudağa değer.
function dudakTemasi(nesne:'meyve'|'bardak',boy:number) {
  return nesne==='meyve' ? {x:-boy*.19,y:boy*.18,aci:-12} : {x:boy*.24,y:boy*.18,aci:16};
}
function birakmaHareketi() {
  const id=donenNesne;
  donenNesne=undefined;
  if(!id || reduced.matches) return;
  const agiz=current('agiz'), nesne=current(id==='meyve'?'artan-meyve':'yudum-bardagi');
  const cizim=nesne?.querySelector('svg');
  if(!agiz || !nesne || !cizim) return;
  const a=agiz.getBoundingClientRect(), b=cizim.getBoundingClientRect();
  const temas=dudakTemasi(id,Math.min(b.width,b.height));
  const x=a.left+a.width/2-b.left-b.width/2+temas.x, y=a.top+a.height/2-b.top-b.height/2+temas.y;
  cizim.animate([
    {transform:'translate('+x+'px,'+y+'px) rotate('+temas.aci+'deg) scale(.78)'},
    {transform:'translate(0,0) scale(1)'},
  ],{duration:330,easing:'ease-out'});
}
function tadinaBak(neyin:'meyve'|'bardak') {
  if(neyin==='meyve') s.meyveIsirildi=true; else s.yudumAldi=true;
  donenNesne=neyin;
  efekt.dokunma();
  if(s.meyveIsirildi && s.yudumAldi) enter('topla');
}
function kalanlariGoster() {
  const toplaniyor=s.sahne==='topla';
  const portre=sofraPortresi(true);
  piece('masa','<div class="kumas"></div>',[50,85,106,52],[50,84,106,49],undefined,'masa');
  piece('serili-pecete',acikPecete,[28,80,43,28],[25,83,48,20]);
  piece('tabak',tabak,[28,79,35,21],[25,82,40,16]);
  const meyve=s.meyve!;
  const kutuDolu=s.kalanPaketlendi;
  const kutu='<span class="box">'+img('bento-acik')+
    '<span class="inbread" data-id="sandvic-gozu">'+(kutuDolu?kalanSandvic(s.ic):'')+'</span>'+
    '<span class="infruit" data-id="artan-meyve">'+(s.meyveIsirildi?isirilanMeyve(meyve):'')+'</span></span>';
  piece('okul-kutusu',kutu,[78,76,37,35],[77,81,43,27]);
  if(kutuDolu)item('bento-kapali',[27,77,23,21],[26,80,32,16],
    action('okul-kutusu-kapat','Beslenme kutusunun kapağını tak',()=>{efekt.yapis();enter('kutuyu-kaldir')},'okul-kutusu'),'ipucu');
  if(!kutuDolu)piece('kalan-sandvic',kalanSandvic(s.ic),[25,75,20,21],[22,79,27,16],
    toplaniyor?action('kalani-sakla','Kalan sandviçi kutusuna al',()=>{s.kalanPaketlendi=true;efekt.yapis()},'okul-kutusu','sandvic-gozu'):undefined);
  if(!s.meyveIsirildi)item(meyve,[39,75,11,16],[39,80,17,14],
    action('meyve-isir',meyve==='elma'?'Kino’ya elmasını ver':'Kino’ya armudunu ver',()=>tadinaBak('meyve'),portre.dataset.id,'agiz'));
  piece('okul-matarasi',mataraResmi('ogun-sonu',.55),[55,66,8,22],[57,67,11,17],undefined,'pasif');
  piece('yudum-bardagi',suBardagi(s.yudumAldi ? .35 : 1),[50,78,12,15],[51,75,16,13],
    !s.yudumAldi?action('bir-yudum','Kino’ya bir yudum su ver',()=>tadinaBak('bardak'),portre.dataset.id,'agiz'):undefined);
  birakmaHareketi();
}
function kutuyuAskiyaKaldir() {
  const bitti=s.sahne==='son';
  item(kino(),[25,60,33,69],[25,63,42,52],undefined,'karakter');
  piece('askilik',askilik,[71,30,39,27],[71,33,53,19]);
  piece('asili-canta',cantaResmi(!bitti,true,.55),[63,56,20,39],[60,52,31,30],undefined,bitti?'kapandi':'');
  if(bitti){
    nextIcon(action('derse-gir','Kino ile derse katıl',()=>enter('ders')),'ileri');
    return;
  }
  item('bento-kapali',[41,80,24,24],[36,82,40,23],
    action('kutuyu-kaldir','Kutuyu yıldızlı çantaya geri koy',()=>{efekt.yapis();enter('son')},'asili-canta'));
}
function render(){
 suyuDurdur?.();
 suyuDurdur=undefined;
 clearTimeout(hareketSonu);
 actions.clear();stage.replaceChildren();stage.dataset.sahne=s.sahne;const name=backgrounds[s.sahne];if(bg.dataset.name!==name){bg.dataset.name=name;bg.style.backgroundImage='url("'+(name==='derslik'?dersFonu:url(name))+'")';if(!reduced.matches)stage.parentElement!.animate([{opacity:.75},{opacity:1}],{duration:320})}
 if(name==='derslik'){
   clearTimeout(hintTimer);
   dersGoster(stage,s,{ilerle:n=>{efekt.sayfa();enter(n);sakla(s);render()},ses:speak,sesiDurdur:stopVoice,kaydet:()=>sakla(s),dokun:sesiAc,
     bastan:()=>{if(dersKisayolu){location.assign(location.pathname);return} s=yeni();enter('oda');sakla(s);render()}});
   return;
 }
 if(name==='sinif')okulArkadaslari(stage,['aski','kutuyu-kaldir','son'].includes(s.sahne));
 if(s.sahne==='basla'){nextIcon(action('basla','Sabaha başla',()=>enter('oda')),'ileri')}
 if(s.sahne==='oda'){
  piece('ray',ray,[73,57,49,68],[71,55,56,55]);
  item(kino(),[28,57,37,74],[24,63,45,57],undefined,'karakter');
  for(const [i,r] of (['yesil','sari'] as const).entries())piece('giysi-'+r,s.renk===r?'<span class="secim-isareti">'+simge('ok')+'</span>':img('aski-'+r),[62+i*21,42,17,32],[59+i*23,47,21,24],s.renk===r?undefined:action(r,r==='yesil'?'Yeşil tişörtü giy':'Sarı hırkayı giy',()=>{s.renk=r;efekt.secim()},kino()));
  if(s.renk)nextIcon(action('mutfaga','Mutfağa geç',()=>enter('mutfak')),'ileri');
 }
 if(s.sahne==='mutfak'){
  piece('tahta',tahta,[29,72,48,47],[50,51,88,37]);
  piece('tepsi',tepsi,[75,72,43,47],[50,80,92,32]);
  const boardPos: Pos = [29,71,27,30], phoneBoardPos: Pos = [50,51,48,24];
  const topFilling = s.ic.at(-1);
  piece('ekmektaban',stack(false,s.ic.slice(0,-1)),boardPos,phoneBoardPos);
  if (topFilling) {
    const names = { marul:'Marulu', domates:'Domatesi', peynir:'Peyniri' };
    const art = '<span class="stack">'+layer(topFilling,s.ic.length)+'</span>';
    piece('ust-malzeme',art,boardPos,phoneBoardPos,action('geri-al',names[topFilling]+' tepsiye geri koy',()=>{
      s.ic.pop();
      efekt.dokunma();
    },'tepsi','yuva-'+topFilling));
  }
  const menu=[...icler,'ekmek'] as const;
  menu.forEach((v,i)=>{const top=v==='ekmek',used=!top&&s.ic.includes(v);const ready=top?s.ic.length>0:!used;
   const p:Pos=[65+(i%2)*19,62+Math.floor(i/2)*20,14,17],pp:Pos=[20+i*20,80,17,14];
   if(used){piece('yuva-'+v,'<span class="bosluk"></span>',p,pp);return}
   item(v,p,pp,ready?action(v,top?'Ekmeği kapat':({marul:'Marul koy',domates:'Domates koy',peynir:'Peynir koy'}[v]),()=>{if(v==='ekmek'){enter('kutu')}else{s.ic.push(v);efekt.nota(s.ic.length)}},'ekmektaban'):undefined,top&&!ready?'bekle':'');
  });
 }
 if(s.sahne==='kutu'){
  const done=s.paket&&!!s.meyve;
  piece('kutu',bento(s.paket,!!s.meyve),[32,72,51,44],[50,52,84,33],done?action('kapat','Kutunun kapağını kapat',()=>{efekt.yapis();enter('matara')}):undefined);
  if(!s.paket)piece('sandvic',stack(true),[71,58,26,24],[29,80,36,18],action('paket','Sandviçi kutuya koy',()=>{s.paket=true;efekt.yapis()},'kutu','sandvic-gozu'));
  if(!s.meyve)(['elma','armut'] as const).forEach((m,i)=>item(m,[63+i*19,83,13,20],[61+i*22,81,17,18],action(m,m==='elma'?'Elma seç':'Armut seç',()=>{s.meyve=m;efekt.secim()},'kutu','meyve-gozu')));
  if(done)item('bento-kapali',[72,68,33,37],[50,80,57,25],action('kapak','Kutuyu kapat',()=>{efekt.yapis();enter('matara')},'kutu'),'ipucu');
 }
 if(s.sahne==='matara'){
  const pos:Pos=[48,63,77,72], dik:Pos=[50,62,100,59];
  if(s.su<1) suAlani(true,pos,dik);
  else {
    const kapat = action('matara-kapat','Matara kapağını tak',()=>{efekt.yapis();enter('canta')},'sise-agzi');
    actions.set(kapat.key,kapat);
    const hazir=piece('dolu-matara','<div class="dolum-cerceve">'+dolumTezgahi(1)+
      '<span class="sise-agzi" data-id="sise-agzi"></span><button class="matara-kapagi" aria-label="Matara kapağını tak" data-action="matara-kapat">'+kapakResmi+'</button></div>',pos,dik,undefined,'matara-dolu');
    hazir.removeAttribute('aria-hidden');
  }
 }
 if(s.sahne==='canta'){
  const hazir=s.kutuCantada && s.mataraCepte;
  const cantayiKapat=()=>{s.cantaKapali=true;efekt.yapis()};
  piece('canta-acik',cantaResmi(!s.cantaKapali,s.mataraCepte),[68,65,34,64],[67,57,47,42],
    hazir&&!s.cantaKapali?action('cantayi-kapat','Sarı kapağı indirip çantanı kapat',cantayiKapat):undefined,s.cantaKapali?'kapandi':'');
  if(!s.kutuCantada)item('bento-kapali',[23,76,30,30],[28,80,44,23],
    action('cantaya','Beslenme kutusunu çantaya koy',()=>{s.kutuCantada=true;efekt.yapis()},'canta-acik'));
  if(!s.mataraCepte)piece('matara',mataraResmi('cantaya-giren'),[44,71,12,36],[25,55,20,26],
    action('cebe','Mataranı çantanın yan cebine koy',()=>{s.mataraCepte=true;efekt.secim()},'canta-acik','cep-hedef'));
  piece('cep-hedef','',[80,71,8,21],[84,62,12,15],undefined,'pasif');
  if(s.cantaKapali)hareketSonu=window.setTimeout(()=>{enter('aski');sakla(s);render()},650);
 }
 if(s.sahne==='aski'){
  item(kino(),[24,59,32,71],[24,62,41,52],undefined,'karakter');
  piece('askilik',askilik,[71,30,39,27],[71,33,53,19]);
  piece('yildiz','',[63,37,18,26],[60,38,23,21]); 
  if(!s.asili)piece('canta',cantaResmi(false,true),[43,78,22,38],[42,80,32,28],action('as','Çantayı yıldızlı askıya as',()=>{s.asili=true;efekt.yapis()},'yildiz'));
  else {piece('canta-acik',cantaResmi(true,true),[63,56,20,39],[60,52,31,30],undefined,'asili');
   item('bento-kapali',[63,53,13,13],[60,51,20,12],action('beslenme','Çantadan beslenme kutunu al',()=>enter('sofra')),'ipucu');}
 }
 if(s.sahne==='tat'||s.sahne==='topla') kalanlariGoster();
 if(s.sahne==='kutuyu-kaldir'||s.sahne==='son') kutuyuAskiyaKaldir();
 if(s.sahne==='sofra'){
  sofraPortresi(false);
  piece('masa','<div class="kumas"></div>',[50,85,106,52],[50,84,106,49],undefined,'masa');
  if(!s.peceteSerili){
    item('bento-kapali',[75,76,34,31],[73,76,44,22]);
    piece('sofra-yeri','<span class="serme-yeri"></span>',[36,78,37,23],[37,78,50,18]);
    piece('pecete',katliPecete,[21,77,26,22],[21,77,33,15],action('pecete-ser','Peçeteyi masaya ser',()=>{
      s.peceteSerili=true;efekt.sayfa();
    },'sofra-yeri'),'ipucu');
  } else {
  piece('serili-pecete',acikPecete,[31,80,44,28],[29,80,53,20]);
  piece('tabak',tabak,[31,79,35,21],[29,79,43,16]);
  if(s.bardak<1)suAlani(false,[53,68,21,28],[54,65,27,19]);
  else piece('bardak',servisTakimi(1),[53,68,21,28],[54,65,27,19],undefined,'pasif');
  if(!s.acik)item('bento-kapali',[73,75,34,31],[74,76,44,22],action('ac','Beslenme kutunu aç',()=>{s.acik=true;efekt.secim()}),'ipucu');
  else {
   piece('acikkutu',bento(false,false),[73,75,36,32],[74,76,45,24]);
   if(!s.meyveTabakta)item(s.meyve!,[81,75,8,14],[85,76,11,12],action('meyve-servis','Meyveyi tabağa al',()=>{s.meyveTabakta=true;efekt.yapis()},'tabak'));
   else item(s.meyve!,[44,76,8,13],[46,79,11,11]);
   if(!s.serviste)piece('sandvic',stack(true),[67,75,18,19],[68,76,23,14],action('servis','Sandviçi tabağa al',()=>{s.serviste=true;efekt.yapis()},'tabak'));
   else piece('sandvic',stack(true),[33,74,25,19],[32,76,36,15],s.meyveTabakta && s.bardak===1?action('ye','Kino’ya bir lokma ver',()=>{efekt.dogru();enter('tat')},kino(),'agiz'):undefined,s.meyveTabakta&&s.bardak===1?'ipucu':'');
  }
  }
 }
 window.clearTimeout(hintTimer);hintTimer=window.setTimeout(()=>{if(!locked)stage.querySelector('button:not(.round):not([data-action="geri-al"])')?.classList.add('ipucu')},4400);
}
function control(name:string,icon:string,run:()=>void){const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',name);b.innerHTML=simge(icon);b.onclick=run;nav.append(b);return b}
control('Ana menü','ev',()=>{stopVoice();anaMenuyeDon()});const mute=control('Sesi kapat','ses',()=>{sesiAc();sessizeAlDegistir();if(tumSesKapaliMi()){stopVoice();suyuDurdur?.()}soundIcon()});function soundIcon(){mute.innerHTML=simge(tumSesKapaliMi()?'sessiz':'ses');mute.setAttribute('aria-label',tumSesKapaliMi()?'Sesi aç':'Sesi kapat')}soundIcon();
function perform(a:Action){a.run();sakla(s);render();locked=false;stage.inert=false}
type Grab={id:number;el:HTMLElement;a:Action;x:number;y:number;ghost?:HTMLElement};
let grab:Grab|undefined;
function floating(el:HTMLElement){const r=el.getBoundingClientRect(),g=document.createElement('div');g.className='ucan';g.innerHTML=el.innerHTML;Object.assign(g.style,{width:r.width+'px',height:r.height+'px',left:r.left+'px',top:r.top+'px'});document.body.append(g);return g}
function endGrab(){grab?.ghost?.remove();grab?.el.classList.remove('elde');grab?.el.style.removeProperty('translate');stage.querySelector('.hedef')?.classList.remove('hedef');grab=undefined}
function deliver(el:HTMLElement,a:Action,g?:HTMLElement){if(locked)return;const target=a.to&&current(a.to);if(!target||reduced.matches){g?.remove();perform(a);return}locked=true;stage.inert=true;
 const destination = (a.landing && current(a.landing)) || target;
 const sprite=g||floating(el),from=sprite.getBoundingClientRect(),to=destination.getBoundingClientRect();const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top+to.height/2-from.top-from.height/2;
 el.classList.add('elde');sprite.style.transform='none';sprite.style.left=from.left+'px';sprite.style.top=from.top+'px';
 const lokma = a.key==='bir-yudum' ? 'bardak' : a.key==='meyve-isir' ? 'meyve' : undefined;
 const temas = lokma ? dudakTemasi(lokma,Math.min(from.width,from.height)) : {x:0,y:0,aci:0};
 const varis = 'translate('+(dx+temas.x)+'px,'+(dy+temas.y)+'px) rotate('+temas.aci+'deg) scale(.78)';
 sprite.animate([{transform:'translate(0,0) scale(1)'},{transform:varis}],{duration:270,easing:'cubic-bezier(.23,.75,.3,1)',fill:'forwards'}).finished.then(()=>{sprite.remove();perform(a)});
}
stage.addEventListener('pointerdown',e=>{const el=(e.target as Element).closest<HTMLElement>('button[data-action]');if(!el||locked||grab||e.button!==0)return;const a=actions.get(el.dataset.action!)!;sesiAc();el.setPointerCapture(e.pointerId);grab={id:e.pointerId,el,a,x:e.clientX,y:e.clientY}});
stage.addEventListener('pointermove',e=>{const q=grab;if(!q||q.id!==e.pointerId)return;let dx=e.clientX-q.x,dy=e.clientY-q.y;
 if(q.a.key==='cantayi-kapat'){q.el.style.translate='0 '+Math.min(5,Math.max(0,dy/8))+'px';return}
 if(!q.a.to)return;
 if(!q.ghost&&Math.hypot(dx,dy)>8){q.ghost=floating(q.el);q.el.classList.add('elde');current(q.a.to)?.classList.add('hedef')}if(q.ghost)q.ghost.style.transform='translate('+dx+'px,'+dy+'px)'});
stage.addEventListener('pointerup',e=>{const q=grab;if(!q||q.id!==e.pointerId)return;const g=q.ghost,a=q.a,el=q.el;if(g&&a.to){const r=current(a.to)!.getBoundingClientRect(),slop=Math.min(25,r.width*.18);if(e.clientX<r.left-slop||e.clientX>r.right+slop||e.clientY<r.top-slop||e.clientY>r.bottom+slop){endGrab();return}}
 const asagiKapatti = a.key==='cantayi-kapat' && e.clientY-q.y>18 && Math.abs(e.clientX-q.x)<el.clientWidth*.6;
 if(!g&&!asagiKapatti&&Math.hypot(e.clientX-q.x,e.clientY-q.y)>18){endGrab();return}
 q.ghost=undefined;endGrab();deliver(el,a,g)});
stage.addEventListener('pointercancel',endGrab);stage.addEventListener('lostpointercapture',e=>{if(grab?.id===e.pointerId)endGrab()});
stage.addEventListener('click',e=>{if(e.detail!==0||locked)return;const el=(e.target as Element).closest<HTMLElement>('button[data-action]');if(!el)return;sesiAc();deliver(el,actions.get(el.dataset.action!)!)});
short.addEventListener('change',()=>{endGrab();if(!locked)render()});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){endGrab();stopVoice();suyuDurdur?.()}
  else if(!locked) render();
});
window.addEventListener('pagehide',()=>{suyuDurdur?.();stopVoice()});
geriDinle(()=>{stopVoice();anaMenuyeDon();return true});
render();for(const u of Object.values(files)){const i=new Image();i.src=u}
