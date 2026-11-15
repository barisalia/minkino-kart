import type harfler from './harfler.json';
import { izSur } from './cizim';
import { kalemiGoster } from './ornek-kalem';
import zamanlar from './yazim-zamanlari.json';
import { cerenSustur, cerenYuzu } from './konusma-dersi';
import { harfYazisi, iziSakla, kalemNo, murekkepler } from './kartlar';
import { resim } from './resimler';
import { IKON } from '../../src/ui/ikonlar';
import './yazma.css';

const hareketler = [
  'dus', 'yuz', 'yuvarlan', 'dus', 'davul', 'yuvarlan', 'selam', 'seyir',
  'dogus', 'filiz', 'filiz', 'selam', 'yuvarlan', 'selam', 'yuvarlan',
  'sallan', 'dus', 'sur', 'yuz', 'selam', 'raket', 'saat', 'suzul',
  'sur', 'uc', 'sallan', 'kon', 'seyir', 'selam',
];
function canlandir(alan:HTMLElement,id:string,ad:string) {
  const hareket=hareketler[Number(id)-1];
  const oyuncu=document.createElement('span');
  oyuncu.className='yz-oyuncu yz-'+hareket;
  const img=new Image();img.src=resim(id);img.alt=ad;oyuncu.append(img);
  if(hareket==='davul'||hareket==='raket'||hareket==='saat'||hareket==='dogus') {
    const efekt=document.createElement('i');efekt.className='yz-etki';
    efekt.setAttribute('aria-hidden','true');
    if(hareket==='davul')efekt.textContent='♪';
    oyuncu.append(efekt);
  }
  alan.append(oyuncu);
}

export function kurulYazma(
  container: HTMLElement,
  letter: (typeof harfler)[number],
  small: boolean,
  play: (id: string, next?: () => void, oynarken?: (saniye:number)=>void) => void,
  complete: () => void,
  seciliKalem = 0,
  kalemSec?: (i: number) => void,
  yaziKaydedildi?: () => void,
): () => void {
  const harf = small ? letter.lower : letter.upper;
  const maskot = small
    ? '<div class="yz-maskot yz-ikili" aria-hidden="true"><img class="yz-anne" src="'+resim(letter.id)+'" alt=""><img class="yz-yavru" src="'+resim(letter.id)+'" alt=""><b>'+letter.upper+' '+letter.lower+'</b></div>'
    : '<div class="yz-maskot" aria-hidden="true"><img src="'+resim(letter.id)+'" alt=""><b>'+letter.upper+'</b></div>';
  container.innerHTML = '<section class="yz-atolye"><div class="yz-ogretmen">' + cerenYuzu('yz-hoca') + maskot + '</div>' +
    '<div class="yz-masalar"><section aria-label="Ceren’in örneği"><h2>Ceren</h2><div class="yz-kagit"><div class="yz-kalem"></div></div></section>' +
    '<section aria-label="Senin yazma alanın"><h2>Sen</h2><div class="yz-kagit"><div class="yz-iz"></div></div></section></div>' +
    '<div class="yz-palet" role="group" aria-label="Albüm kartının kalem rengini seç">' +
    murekkepler.map((k,i) => '<button type="button" data-kalem="' + i + '" aria-label="' + k.ad + ' kalem" style="--kalem-rengi:' + k.renk + '"><span aria-hidden="true"></span></button>').join('') + '</div>' +
    '<div class="yz-kontrol"><button type="button" class="yz-yine" aria-label="Bir daha göster">' + IKON.goz + '</button>' +
    '<p class="yz-soz" role="status"></p></div></section>';
  const sol = container.querySelector<HTMLElement>('.yz-kalem')!;
  const sag = container.querySelector<HTMLElement>('.yz-iz')!;
  const yazi = container.querySelector<HTMLElement>('.yz-soz')!;
  const tekrar = container.querySelector<HTMLButtonElement>('.yz-yine')!;
  const defterler = container.querySelector<HTMLElement>('.yz-masalar')!;
  const rozet = container.querySelector<HTMLElement>('.yz-maskot')!;
  let calisiyor=true,tamam=false,basladi=false,sira=0,zaman=0,renk=kalemNo(seciliKalem);
  let kalemiDurdur = () => {};
  const kalemler = [...container.querySelectorAll<HTMLButtonElement>('[data-kalem]')];
  function renkSec(i: number) {
    renk=i;
    sag.style.setProperty('--yazim', murekkepler[i].renk);
    kalemler.forEach((b,j) => b.setAttribute('aria-pressed', String(j === i)));
  }
  renkSec(kalemNo(seciliKalem));
  kalemler.forEach((b,i) => b.onclick = () => {
    if (tamam) return;
    renkSec(i); kalemSec?.(i);
  });

  const iz = izSur(sag, harf, cizgiler => {
    tamam = true;
    delete defterler.dataset.sira;
    sira++;
    iziSakla(letter.id,small,renk,cizgiler);
    yaziKaydedildi?.();
    kalemiDurdur();
    kalemiDurdur = kalemiGoster(sol, harf, false);
    tekrar.disabled = true;
    kalemler.forEach(b => b.disabled = true);
    rozet.classList.add('yz-maskot-tamam');
    if(small){
      sol.innerHTML=harfYazisi(letter);
      sol.setAttribute('aria-label',letter.upper+' ve '+letter.lower+', senin harflerin.');
    }
    const kagit=(small?sag:sol).parentElement!;
    canlandir(kagit,letter.id,letter.example);
    yazi.textContent=letter.example+'!';
    let sesBitti=false,hareketBitti=false,gecildi=false;
    function ilerle(){if(calisiyor&&sesBitti&&hareketBitti&&!gecildi){gecildi=true;complete();}}
    zaman=window.setTimeout(()=>{hareketBitti=true;ilerle();},1600);
    play(letter.id+'-label',()=>{if(calisiyor)play('good',()=>{sesBitti=true;ilerle();});});
  }, () => {
    rozet.classList.remove('yz-maskot-zipla');
    void rozet.offsetWidth;
    rozet.classList.add('yz-maskot-zipla');
  }, kalemeDokun);

  function anlat() {
    if (tamam || !calisiyor) return;
    kalemiDurdur();
    const id = letter.id + (small ? '-small' : '-big');
    defterler.dataset.sira='ceren';
    const araliklar = (zamanlar as Record<string,number[][]>)[id];
    let konum = 0;
    kalemiDurdur = kalemiGoster(sol, harf, true, {araliklar,zaman:()=>konum});
    basladi=false;
    const bu=++sira;
    yazi.textContent='';
    play(id, () => {
      if (calisiyor && !tamam && bu===sira) {
        konum=araliklar[araliklar.length-1][1];
        defterler.dataset.sira='sen';
        yazi.textContent = 'Şimdi sen çiz.';
      }
    }, saniye=>{konum=saniye;});
  }
  function kalemeDokun(){
    if(!tamam&&!basladi){
      basladi=true;sira++;cerenSustur();yazi.textContent='';
      defterler.dataset.sira='sen';
      kalemiDurdur();
      kalemiDurdur=kalemiGoster(sol, harf, false);
    }
  }
  tekrar.onclick = anlat;
  anlat();
  return () => {
    calisiyor = false;
    clearTimeout(zaman);
    kalemiDurdur();
    iz.kapat();
    tekrar.onclick = null;
  };
}
