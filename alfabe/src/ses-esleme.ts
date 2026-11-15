/** Cihazda örnekle: şiddetten ve ses perdesinden daha az etkilenen mel bantlarının
 * zaman sırasını karşılaştır. Çocuğun kaydı oturum bitince atılır. */
const ornekHizi = 16000, pencereBoyu = 400, fftBoyu = 512, bantSayisi = 24;
const pencere = Array.from({length:pencereBoyu}, (_,i) => .5-.5*Math.cos(2*Math.PI*i/(pencereBoyu-1)));
const tersBit = Array.from({length:fftBoyu}, (_,i) => {
  let s=0;
  for (let j=0;j<9;j++) { s=(s<<1)|(i&1); i>>=1; }
  return s;
});
const kos = Array.from({length:fftBoyu/2}, (_,i)=>Math.cos(2*Math.PI*i/fftBoyu));
const sin = Array.from({length:fftBoyu/2}, (_,i)=>-Math.sin(2*Math.PI*i/fftBoyu));
const mel = (hz:number) => Math.log(1+hz/700);
const bantUclari = Array.from({length:bantSayisi+2}, (_,i) => {
  const yer=mel(110)+(mel(7600)-mel(110))*i/(bantSayisi+1);
  return 700*Math.expm1(yer)*fftBoyu/ornekHizi;
});

export function ozellikler(girdi:Float32Array, hiz:number):number[][] {
  // 25 ms'lik enerji zarfı sessiz bir ünsüzle başlayan sözcükteki ilk
  // patlamayı da korur. Tek bir yüksek örnek başlangıcı yanlış yere taşımasın.
  const blok=Math.max(1,Math.round(hiz*.025));
  const zarf=new Float32Array(girdi.length);
  let toplamEnerji=0, dorukEnerji=0;
  for(let i=0;i<girdi.length;i++){
    toplamEnerji+=girdi[i]**2;
    if(i>=blok)toplamEnerji-=girdi[i-blok]**2;
    zarf[i]=toplamEnerji;
    dorukEnerji=Math.max(dorukEnerji,toplamEnerji);
  }
  const tetik=Math.max(.00012**2*blok,dorukEnerji*.075**2);
  const ilkOrnek=zarf.findIndex(e=>e>=tetik);
  if(ilkOrnek<0)return [];
  const baslangic=ilkOrnek-2*blok;
  const uzunluk=girdi.length-baslangic+blok;
  const x=new Float32Array(Math.floor(uzunluk*ornekHizi/hiz));
  // Mikrofon tamponu sözcüğün başladığı anda açılmaz. Hem yeniden örneklemeyi
  // hem spektrum pencerelerini konuşmaya hizala ve iki kenarı sessizlikle tamamla.
  for(let i=0;i<x.length;i++){
    const ilk=baslangic+Math.floor(i*hiz/ornekHizi);
    const son=Math.max(ilk+1,baslangic+Math.floor((i+1)*hiz/ornekHizi));
    for(let j=Math.max(0,ilk);j<Math.min(girdi.length,son);j++) x[i]+=girdi[j];
    x[i]/=son-ilk;
  }
  const enerji:number[]=[];
  for(let i=0;i+pencereBoyu<=x.length;i+=160){
    let kare=0;
    for(let j=0;j<pencereBoyu;j++) kare+=x[i+j]**2;
    enerji.push(Math.sqrt(kare/pencereBoyu));
  }
  const esik=Math.max(.00012,Math.max(0,...enerji)*.075);
  const ilk=enerji.findIndex(e=>e>=esik);
  let son=enerji.length-1;
  while(son>=0&&enerji[son]<esik)son--;
  if(ilk<0||son-ilk<4||son-ilk>320)return [];
  const oz:number[][]=[],re=new Float64Array(fftBoyu),im=new Float64Array(fftBoyu),guc=new Float64Array(fftBoyu/2+1);
  for(let t=ilk;t<=son;t+=2) {
    re.fill(0);im.fill(0);
    const bas=t*160;
    for(let j=0;j<pencereBoyu;j++) re[tersBit[j]]=(x[bas+j]-.94*(x[bas+j-1]||0))*pencere[j];
    for(let boy=2;boy<=fftBoyu;boy*=2){
      const yari=boy/2,adim=fftBoyu/boy;
      for(let i=0;i<fftBoyu;i+=boy)for(let j=0;j<yari;j++){
        const a=i+j,b=a+yari,c=kos[j*adim],s=sin[j*adim];
        const ger=c*re[b]-s*im[b], san=c*im[b]+s*re[b];
        re[b]=re[a]-ger;im[b]=im[a]-san;re[a]+=ger;im[a]+=san;
      }
    }
    for(let j=0;j<guc.length;j++)guc[j]=re[j]**2+im[j]**2;
    const bant=Array.from({length:bantSayisi},(_,k)=>{
      const a=bantUclari[k],b=bantUclari[k+1],c=bantUclari[k+2];
      let toplam=0;
      for(let j=Math.ceil(a);j<c;j++)toplam+=guc[j]*Math.max(0,Math.min((j-a)/(b-a),(c-j)/(c-b)));
      return Math.log(Math.max(1e-12,toplam/(c-a)));
    });
    const ort=bant.reduce((a,b)=>a+b)/bant.length;
    const norm=Math.sqrt(bant.reduce((a,b)=>a+(b-ort)**2,0))||1;
    oz.push(bant.map(v=>(v-ort)/norm));
  }
  return oz;
}

function uzaklik(a:number[][],b:number[][]){
  // Eşit zaman ölçeği, bir uzun sözcüğün tek bir tanınmış ünlüye çökmesini engeller.
  const n=24, sinir=5;
  const once=new Float64Array(n+1).fill(Infinity),simdi=new Float64Array(n+1);
  once[0]=0;
  for(let i=1;i<=n;i++){
    simdi.fill(Infinity);
    const ai=a[Math.round((i-1)*(a.length-1)/(n-1))];
    for(let j=Math.max(1,i-sinir);j<=Math.min(n,i+sinir);j++){
      const bj=b[Math.round((j-1)*(b.length-1)/(n-1))];
      let d=1;
      for(let k=0;k<ai.length;k++)d-=ai[k]*bj[k];
      simdi[j]=Math.max(0,d)+Math.min(once[j-1],once[j]+.045,simdi[j-1]+.045);
    }
    once.set(simdi);
  }
  return once[n]/n;
}

// Aynı sesin farklı boğazlarda daha ince veya kalın duyulmasına bir mel bandı pay ver.
function bantKaydir(kareler:number[][], adim:number) {
  return kareler.map(kare=>{
    const yeni=kare.map((_,i)=>kare[Math.max(0,Math.min(kare.length-1,i+adim))]);
    const ort=yeni.reduce((s,x)=>s+x)/yeni.length;
    const norm=Math.sqrt(yeni.reduce((s,x)=>s+(x-ort)**2,0))||1;
    return yeni.map(x=>(x-ort)/norm);
  });
}

type SesBankasi = Record<string, number[][][]>;
/** Öğretmenin istediği ses/kelime, diğer 28 hedef ve derslerde duyulan yakın
 * kelimelerle yarışır. Düşük şiddet tek başına hata, konuşma tek başına başarı değildir. */
export function hedefDuyuldu(kareler:number[][], id:string, banka:SesBankasi) {
  const hedefler=banka[id];
  if(!kareler.length||!hedefler?.length)return false;
  const ornekBoylari=hedefler.map(k=>k.length);
  const enUzun=Math.max(...ornekBoylari);
  if(kareler.length>Math.max(62,enUzun*2.8) || kareler.length<Math.max(3,Math.min(...ornekBoylari)*.3))return false;
  const ince=bantKaydir(kareler,1), kalin=bantKaydir(kareler,-1);
  function uzak(ornek:number[][]) {
    return Math.min(uzaklik(kareler,ornek),.025+uzaklik(ince,ornek),.025+uzaklik(kalin,ornek));
  }
  let hedef=Math.min(...hedefler.map(uzak));
  if(hedef>.535)return false;
  // Bu esneklik tam sözcük kadar ses gelmişse geçerli. Tek hecelik bir kesiti,
  // uzun hedefin zayıf ama rakipsiz eşleşmesi olarak kabul etme.
  if(hedef>.5 && kareler.length<.85*Math.min(...ornekBoylari))return false;
  // “Fil” gibi bir sözcüğün ortasındaki i, tek başına söylenmiş i değildir.
  // İki ardışık son pencerede güçlü bir sessiz geçişi varsa ünlüyü onaylama.
  if(hedef>.32 && ['01','06','11','12','18','19','25','26'].includes(id) && kareler.length>=6){
    const orta=kareler[Math.floor(kareler.length/2)];
    const sonIki=kareler.slice(-2);
    const ayrim=sonIki.reduce((toplam,k)=>toplam+1-k.reduce((s,x,i)=>s+x*orta[i],0),0)/2;
    if(ayrim>.92)return false;
  }
  // Yuvarlak O ve U benzer göründüğünde sesin orta bölümündeki alt bantları
  // karşılaştır. U'nun birinci rezonansı O'nunkinden daha aşağıdadır. Bu ipucu
  // ancak iki sesin spektrumları zaten birbirine yakın olduğunda devreye girer.
  let karsit='', karsitSkoru=Infinity;
  if(id==='18'||id==='25'){
    karsit=id==='18'?'25':'18';
    karsitSkoru=Math.min(...banka[karsit].map(uzak));
    if(Math.abs(hedef-karsitSkoru)<.11){
      const orta=kareler.slice(Math.floor(kareler.length*.2),Math.ceil(kareler.length*.8));
      const egim=orta.reduce((s,k)=>s+(k[1]+k[2]-k[4]-k[5])/2,0)/orta.length;
      const fark=Math.max(-.065,Math.min(.065,egim*.5))*(id==='25'?1:-1);
      hedef-=fark;karsitSkoru+=fark;
    }
  }
  // Kuşkulu örneklerde tekrar iste. Süre ve ses rengi iki hedefi ayırmıyorsa başarı verme.
  // MediaStream bazen sözcük içinde birkaç milisaniyelik bir bloğu atlar.
  // Sınırdaki mutlak benzerliği ancak diğer tüm cevaplardan açıkça ayrılıyorsa kabul et.
  const pay=hedef>.5 ? .085 : .012+hedef*.035;
  for(const [diger,ornekler] of Object.entries(banka)){
    if(diger===id)continue;
    if(diger===karsit){if(karsitSkoru<hedef+pay)return false;continue;}
    for(const ornek of ornekler)if(uzak(ornek)<hedef+pay)return false;
  }
  return true;
}

/** Yaklaşık 32 ms'lik bir ses penceresi. Sabit frekanslı uğultuyu ve tek tıkı
 * konuşma saymamak için şiddet, periyodiklik ve dalga biçimini birlikte ölç. */
export function sesPenceresi(x:Float32Array,hiz:number){
  const adim=Math.max(1,Math.round(hiz/8000)), oran=hiz/adim;
  const n=Math.floor(x.length/adim), y=new Float32Array(n);
  let toplam=0,fark=0,sifir=0,enYuksek=0,dc=0;
  for(let i=0;i<n;i++){
    let v=0;
    for(let j=0;j<adim;j++)v+=x[i*adim+j];
    v/=adim;
    dc+=.075*(v-dc);y[i]=v-dc;
    toplam+=y[i]*y[i];
    if(i){fark+=(y[i]-y[i-1])**2;if((y[i]>0)!==(y[i-1]>0))sifir++;}
    enYuksek=Math.max(enYuksek,Math.abs(y[i]));
  }
  const rms=Math.sqrt(toplam/n);
  if(!rms || n<75)return {rms,sesli:false,surtunme:false};
  const gecis=sifir*oran/(2*n);
  const parlak=oran/Math.PI*Math.asin(Math.min(1,Math.sqrt(fark/toplam)/2));
  const tepe=enYuksek/rms;
  let bag=0;
  for(let kay=Math.max(4,Math.floor(oran/630));kay<=Math.min(n/2,Math.ceil(oran/75));kay++){
    let xy=0,xx=0,yy=0;
    for(let i=kay;i<n;i++){xy+=y[i]*y[i-kay];xx+=y[i]**2;yy+=y[i-kay]**2;}
    bag=Math.max(bag,xy/Math.sqrt(xx*yy||1));
  }
  const yalinkat=tepe<1.7 && Math.abs(parlak-gecis)<Math.max(70,gecis*.17);
  return {
    rms,
    sesli:!yalinkat && parlak>140 && gecis>115 && bag>.53 && tepe<8,
    surtunme:!yalinkat && bag<.8 && tepe<8 && gecis>270 && gecis<1750 && parlak>370,
  };
}

type Oz = ReturnType<typeof sesPenceresi>;
export function konusmaVar(kareler:Oz[],pencereMs:number,taban:number){
  const etkin=kareler.filter(k=>k.rms>Math.max(.00022,taban*1.8));
  const zarflar=etkin.map(k=>k.rms).sort((a,b)=>a-b);
  // Aynı düzeyde süren pervane veya motor uğultusunun periyodu da bulunabilir.
  if(etkin.length*pencereMs>320 && zarflar[Math.floor(zarflar.length*.9)]<1.14*zarflar[Math.floor(zarflar.length*.12)])return false;
  const sesli=etkin.filter(k=>k.sesli).length;
  if(sesli>=2 && sesli*pencereMs>=42)return true;
  // Kısa sessizlerin salımında gürültü hızla büyüyüp söner. Sürekli fan/hışırtı,
  // yalnız bir darbe veya sabit bir nota burada bir yanıt oluşturmaz.
  const surtunen=etkin.filter(k=>k.surtunme);
  return surtunen.length>=3 && surtunen.length*pencereMs>=70 && etkin.length*pencereMs<1050 &&
    zarflar[zarflar.length-1]>1.65*zarflar[Math.floor(zarflar.length*.25)];
}
