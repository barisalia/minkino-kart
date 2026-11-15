export type Dal='sarki'|'dans';
const bolumler=['perde','mino','bulut','sec','isik','arac','prova','final','sonuc'] as const;
export type Gosterim=typeof bolumler[number];
export interface GosteriSonucu {dal:Dal;puan:number;siir?:true}
export const soloPuanlari={mino:4,bulut:6} as const;
export const kupaKazandi=(sonuc:{puan:number}|null|undefined)=>
  !!sonuc&&sonuc.puan>soloPuanlari.bulut;
export interface Dokunus {sira:number;el:0|1|2|3|4;fark:number}
export type Program='yanki'|'dort'|'dort-yanki'|'konser'|'konser-yanki'|'kurdele'|'kurdele-yanki'|'siir'|'siir-yanki';
export const kurdeleli=(p?:Program)=>p==='kurdele'||p==='kurdele-yanki';
export const siirMi=(p?:Program)=>p==='siir'||p==='siir-yanki';
export const konserMi=(p?:Program)=>p==='konser'||p==='konser-yanki'||kurdeleli(p)||siirMi(p);
export const dortlu=(p?:Program)=>p==='dort'||p==='dort-yanki'||konserMi(p);
const programMi=(p:unknown):p is Program=>siirMi(p as Program)||p==='kurdele'||p==='kurdele-yanki'||p==='yanki'||p==='dort'||p==='dort-yanki'||p==='konser'||p==='konser-yanki';
export interface SahneAnisi extends GosteriSonucu {renk:'sari'|'yesil';dokunuslar:Dokunus[];program?:Program;dansDizisi?:number[];sesliYanki?:true}
function dansDizisiniOku(v:unknown):number[]{
  return Array.isArray(v)?v.filter(n=>Number.isInteger(n)&&n>=0&&n<5).slice(0,4):[];
}
export const sahneDeseni:Record<Dal,readonly (0|1)[]>={sarki:[0,1,0,0,1,0,1,1],dans:[0,1,1,0,1,0,0,1]};
// İkinci günkü nakaratta çocuk, az önce duyduğu/gördüğü motifi yineleyebilir.
// Yeni prova gerekmez: aynı iki resim, aynı zaman payı ve yine tam sekiz vuruş.
const yankiDeseni:typeof sahneDeseni={sarki:[0,1,0,1,1,0,1,0],dans:[0,1,0,1,0,0,1,1]};
const dortDesen={dans:[0,2,1,3,2,0,3,1],sarki:[0,1,2,3,2,1,3,0]} as const;
const dortYanki={dans:[1,3,0,2,3,1,2,0],sarki:[2,1,0,3,1,3,2,0]} as const;
const konserDeseni={sarki:[0,1,2,3,2,1,3,0,1,0],dans:[0,2,1,3,2,0,3,1,0,3]} as const;
const konserYanki={sarki:[2,1,0,3,1,3,2,0,3,0],dans:[1,3,0,2,3,1,2,0,2,3]} as const;
const kurdeleDeseni=[0,1,4,2,3,4,1,3,0,2] as const;
const kurdeleYanki=[2,4,0,3,1,4,2,0,1,3] as const;
export function programDeseni(dal:Dal,program?:Program){
  if(kurdeleli(program)&&dal==='dans')return program==='kurdele'?kurdeleDeseni:kurdeleYanki;
  switch(program){
    case 'siir': case 'kurdele': case 'konser': return konserDeseni[dal];
    case 'siir-yanki': case 'kurdele-yanki': case 'konser-yanki': return konserYanki[dal];
    case 'dort': return dortDesen[dal];
    case 'dort-yanki': return dortYanki[dal];
    case 'yanki': return yankiDeseni[dal];
    default: return sahneDeseni[dal];
  }
}
export const notaVurusu=(i:number,program?:Program,dal?:Dal)=>siirMi(program)&&dal==='sarki'?[5,11,17,23,28,33,37,42,46,51][i]:kurdeleli(program)&&dal==='dans'?20+i*4:konserMi(program)?
  (dal==='dans'?[4,10,16,22,28,32,36,40,44,48]:[5,10,15,20,25,31,36,41,46,51])[i]:10+i*6;
export function ilkSahneVurusu(g:Pick<Gosteri,'kararlar'|'isaretler'>&Partial<Pick<Gosteri,'program'|'dal'>>){
  const n=g.isaretler.length;
  if(kurdeleli(g.program)&&g.dal==='dans')return n===10?60:n?notaVurusu(n,g.program,'dans')-2:16;
  if(konserMi(g.program))return n===10?(g.dal==='dans'?52:56):n?notaVurusu(n,g.program,g.dal??undefined)-3:0;
  // Son işaretten sonra uygulama kapanırsa bir sonraki (olmayan) işarete
  // değil, kapanış cümlesinin başına dön. İlk dört ölçü yeniden puanlanmaz.
  if(n===8)return 56;
  if(n===4)return g.kararlar.length===2?32:28;
  return n?Math.max(0,notaVurusu(n)-3):0;
}
function izOku(v:unknown,program?:Program,dal?:Dal|null):Dokunus[]{
  if(!Array.isArray(v))return [];
  const izin=new Set<string>();
  return v.filter((e):e is Dokunus=>{
    if(!e||!Number.isInteger(e.sira)||e.sira<0||e.sira>(konserMi(program)?9:7)||!Number.isInteger(e.el)||e.el<0||e.el>(dal==='dans'&&kurdeleli(program)?4:dortlu(program)?3:1)||!Number.isFinite(e.fark)||e.fark< -1.36||e.fark>2.11)return false;
    const kim=e.sira+':'+e.el;if(izin.has(kim))return false;izin.add(kim);return true;
  }).map(({sira,el,fark})=>({sira,el,fark})).sort((a,b)=>a.sira-b.sira||a.fark-b.fark);
}
export function sahneAnisiniOku(v:Partial<SahneAnisi>|null|undefined):SahneAnisi|null{
  if(!v||v.dal!=='sarki'&&v.dal!=='dans'||v.renk!=='sari'&&v.renk!=='yesil'||typeof v.puan!=='number'||!Number.isInteger(v.puan)||v.puan<0||v.puan>10||!Array.isArray(v.dokunuslar))return null;
  const dizi=v.dal==='dans'?dansDizisiniOku(v.dansDizisi):[];
  return {dal:v.dal,puan:v.puan,...(siirMi(v.program)?{siir:true as const}:{}),renk:v.renk,dokunuslar:izOku(v.dokunuslar,v.program,v.dal),...(programMi(v.program)?{program:v.program}:{}),...(dizi.length?{dansDizisi:dizi}:{}),...(v.sesliYanki===true&&v.dal==='sarki'&&dortlu(v.program)?{sesliYanki:true}:{})};
}
export interface Gosteri {bolum:Gosterim;dal:Dal|null;kararlar:boolean[];isaretler:boolean[];ipucu:boolean;prova:number;sonuc:GosteriSonucu|null;dokunuslar:Dokunus[];sonAni:SahneAnisi|null;program?:Program;dansDizisi:number[];dansDefteriAcik:boolean}
export const yeniGosteri=():Gosteri=>({program:'konser',bolum:'perde',dal:null,kararlar:[],isaretler:[],ipucu:false,prova:0,sonuc:null,dokunuslar:[],sonAni:null,dansDizisi:[],dansDefteriAcik:false});
export const puan=(g:Gosteri)=>[...g.kararlar,...g.isaretler].filter(Boolean).length;
export function gosteriOku(v?:Partial<Gosteri>):Gosteri{
  const g=yeniGosteri();if(!v)return g;
  if(programMi(v.program))g.program=v.program;
  else if(v.dal)delete g.program;
  const sonuc=v.sonuc;
  if(sonuc&&(sonuc.dal==='sarki'||sonuc.dal==='dans')&&Number.isInteger(sonuc.puan)&&sonuc.puan>=0&&sonuc.puan<=10)g.sonuc=sonuc;
  const ani=sahneAnisiniOku(v.sonAni);
  if(ani&&g.sonuc?.dal===ani.dal&&g.sonuc.puan===ani.puan)g.sonAni=ani;
  const bolum=String(v.bolum)==='lokum'?'bulut':v.bolum;
  if(!bolum||!bolumler.includes(bolum))return g;
  g.bolum=bolum;g.dal=v.dal==='sarki'||v.dal==='dans'?v.dal:null;
  g.kararlar=Array.isArray(v.kararlar)?v.kararlar.filter(n=>typeof n==='boolean').slice(0,2):[];
  g.isaretler=Array.isArray(v.isaretler)?v.isaretler.filter(n=>typeof n==='boolean').slice(0,konserMi(g.program)?10:8):[];
  g.ipucu=v.ipucu===true;g.prova=Number.isInteger(v.prova)?Math.max(0,Math.min(kurdeleli(g.program)&&g.dal==='dans'?5:dortlu(g.program)?4:2,v.prova!)):0;
  if(bolumler.indexOf(g.bolum)>3&&!g.dal)g.bolum='sec';
  // Kupa yalnız tamamlanmış ve kendi puanlarıyla eşleşen o gösterinindir.
  // Yarım bir tekrarın 'sonuc' alanı önceki tamamlanan günü temsil edebilir.
  if(g.bolum==='sonuc'&&(!g.sonuc||g.isaretler.length!==(konserMi(g.program)?10:8)))g.bolum='final';
  if(['perde','mino','bulut','sec','isik'].includes(g.bolum))g.kararlar=[];
  if(g.bolum==='arac')g.kararlar=g.kararlar.slice(0,1);
  if(!['final','arac','sonuc'].includes(g.bolum))g.isaretler=[];
  if(['final','arac','sonuc'].includes(g.bolum))g.dokunuslar=izOku(v.dokunuslar,g.program,g.dal).filter(e=>e.sira<=g.isaretler.length);
  if(g.bolum!=='sonuc'&&g.dal){
    if(!konserMi(g.program)){
      const eskiIsaret=g.isaretler.length;
      g.isaretler=[...g.isaretler,...g.kararlar];
      if(eskiIsaret===0&&g.isaretler.length)g.dokunuslar=[];
      g.program=g.program==='dort-yanki'||g.program==='yanki'?'konser-yanki':'konser';
    }
    g.kararlar=[];
    if(g.bolum==='isik')g.bolum='prova';
    if(g.bolum==='arac')g.bolum=g.prova>=4||g.isaretler.length>=4?'final':'prova';
  }
  if(g.dal==='dans'&&(g.bolum==='prova'||g.bolum==='final')&&!g.isaretler.length&&!g.dokunuslar.length&&!kurdeleli(g.program)){
    g.program=g.program?.endsWith('yanki')?'kurdele-yanki':'kurdele';
  }
  if(g.bolum==='sonuc'&&g.dal&&g.sonuc&&(g.sonuc.puan!==puan(g)||g.sonuc.dal!==g.dal)){
    g.sonuc={dal:g.dal,puan:puan(g),...(siirMi(g.program)?{siir:true as const}:{})};
    if(g.sonAni&&(g.sonAni.puan!==g.sonuc.puan||g.sonAni.dal!==g.dal))g.sonAni=null;
  }
  if(g.bolum==='sonuc'&&g.dal==='dans'&&Array.isArray(v.dansDizisi)){
    g.dansDefteriAcik=v.dansDefteriAcik===true;
    g.dansDizisi=dansDizisiniOku(v.dansDizisi);
  }
  if(g.bolum==='prova')g.bolum='final';
  return g;
}
export function gosteriSozu(g:Gosteri){
  if(g.bolum==='sonuc'&&g.dansDefteriAcik)return 'zip_sahne_dansini_kur';
  return {perde:'kres_gosteri_giris',mino:'kres_gosteri_mino',bulut:'kres_gosteri_bulut',sec:'zip_siir_sec',isik:'kres_gosteri_isik',
    arac:g.dal==='sarki'?'kres_gosteri_mikrofon':'kres_gosteri_nakarat_davul',prova:dortlu(g.program)?(g.dal==='sarki'?(siirMi(g.program)?'zip_siir_prova':'zip_sahne_ritme_gir'):'kres_gosteri_dort_dans'):g.dal==='sarki'?'kres_gosteri_nota':'kres_gosteri_dansi_izle',
    final:g.isaretler.length>=4?'kres_gosteri_nakarat_baslat':'kres_gosteri_baslat',sonuc:g.sonuc&&kupaKazandi(g.sonuc)?['kres_gosteri_kupa_yedi','kres_gosteri_kupa_sekiz','kres_gosteri_kupa_dokuz','kres_gosteri_kazandi'][g.sonuc.puan-7]:g.sonuc?'kres_gosteri_puan_'+g.sonuc.puan:'kres_gosteri_bitirdi'}[g.bolum];
}
