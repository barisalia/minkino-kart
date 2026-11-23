import { resimHareketiniKur } from './resimde-bul-hareket';
import scenes from './resimde-bul-sahneleri.json';
import { cerenKonus } from './konusma-dersi';
import { oyunSesi } from './oyun-sesi';
import { bosBekleyici } from './bos-bekle';
import { IKON } from '../../src/ui/ikonlar';
import { inmisSahne, sahneyiYukle } from './resimde-bul-sahne';
import { ikinciSahne, sahneSvg } from './resimde-bul-ikinci';
import { turBitti, yeniIcerikSirasi } from './ikinci-tur';
import { bitisKutla, cerenGostersin } from './cila';
import './resimde-bul.css';

/** `ileriYazi`: ileri düğmesinin yazısı (dersin akışındaki sonraki adım, main.ts → dersGoster). */
export function resimdeBulKur(root: HTMLElement, lesson: {id:string; upper:string}, next:()=>void, ileriYazi='Albüm kartımı gör') {
  // Harf ikinci kez oynanınca (ve Astra'nın ikinci sahnesi hazırsa) yeni sahne: ikinci-tur.ts, resimde-bul-ikinci.ts.
  const ikinci = yeniIcerikSirasi('bul', lesson.id) ? ikinciSahne(lesson.id) : undefined;
  const items: {name:string;points:string;ustte?:boolean}[] = ikinci?.items ?? scenes[Number(lesson.id)-1];
  const nesneSesi = (i:number) => (ikinci ? 'bul2-' : 'bul-yeni-')+lesson.id+'-'+i;
  let sayildi = false;
  const found = new Set<number>();
  let alive = true;
  const prompt = lesson.upper === 'Ğ' ? 'Adında Ğ olan iki şeyi bul.' : lesson.upper+' ile başlayan iki şeyi bul.';
  // Dokunma alanlarının çizim sırası (sonra çizilen üstte kalır, 19 Kasım): aranan iki nesne (0, 1) yanlış nesnelerin üstünde.
  // Önceden yanlışlar sonra çizildiği için çiçeğin önündeki arıya, ağacın önündeki bisiklete ya da söğüdün önündeki ördeğe
  // dokunan çocuk yanlış adı duyabiliyordu. Resimde gerçekten aranan nesnenin önünde duran yanlış nesne veride `ustte`
  // ile işaretlidir (ırmaktaki kano, piyanonun önündeki tabure, çadırın önündeki fener) ve en üste çizilir.
  const katman = (i:number) => (items[i] as {ustte?:boolean}).ustte ? 2 : i < 2 ? 1 : 0;
  const cizimSirasi = items.map((_,i) => i).sort((a,b) => katman(a) - katman(b) || a - b);
  const hotspots = cizimSirasi.map(i => '<polygon class="rb-hit" data-item="'+i+'" role="button" tabindex="0" aria-label="'+items[i].name+'" points="'+items[i].points+'"/>').join('');
  root.innerHTML = '<section class="rb"><div class="rb-bar"><button class="rb-listen" aria-label="Soruyu dinle">'+IKON.hoparlor+'</button><strong aria-live="polite">'+prompt+'</strong><span class="rb-stars" aria-label="İki nesne aranıyor"><i>'+IKON.yildiz+'</i><i>'+IKON.yildiz+'</i></span><button class="rb-next" hidden aria-label="'+ileriYazi+'">'+IKON.oyna+'</button></div><div class="rb-space"><div class="rb-art"><svg class="rb-picture" viewBox="0 0 960 540" aria-hidden="true" preserveAspectRatio="none"></svg><svg class="rb-map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Resimde nesneleri bul">'+hotspots+'</svg></div></div></section>';
  const art = root.querySelector<HTMLElement>('.rb-art')!;
  const stage=art.querySelector<SVGSVGElement>('.rb-picture')!;
  // Sahne önceden indiyse (main.ts → dersAc) aynı karede çizilir; inmediyse indirilip çizilir (bir kez yeniden denenir).
  // Dokunma alanları JSON'dan gelir ve hemen çalışır; resim gelmeden dokunulursa ışık sessizce atlanır.
  let play:ReturnType<typeof resimHareketiniKur>|undefined;
  const ciz=(svg:string)=>{if(alive&&!play)play=resimHareketiniKur(stage,svg,Number(lesson.id)-1);};
  const inmis=ikinci?sahneSvg(ikinci.url):inmisSahne(lesson.id);
  if(ikinci)root.querySelector('.rb')?.setAttribute('data-set','2');
  if(inmis!==undefined)ciz(inmis);
  else void sahneyiYukle(lesson.id).catch(()=>sahneyiYukle(lesson.id)).then(ciz,()=>{});
  const message = root.querySelector('strong')!;
  const stars = Array.from(root.querySelectorAll<HTMLElement>('.rb-stars i'));
  const button = root.querySelector<HTMLButtonElement>('.rb-next')!;
  const listen = root.querySelector<HTMLButtonElement>('.rb-listen')!;
  // nesne sırasıyla (0, 1 aranan): çizim sırası değişse de dizin nesnenin kendisini gösterir
  const hits = items.map((_,i) => art.querySelector<SVGPolygonElement>('polygon[data-item="'+i+'"]')!);
  const quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Çocuk bir süre hiçbir şey bulmazsa Ceren soruyu yineler; ikincisinde aranan nesnelerden biri parlar.
  // İkisi de bulunduysa "devam" düğmesi hafifçe sallanır.
  const idle = bosBekleyici(kacinci => {
    if(!alive) return;
    if(found.size===2){
      if(!quiet){button.classList.remove('rb-durt');void button.offsetWidth;button.classList.add('rb-durt');}
      idle.kur();return;
    }
    if(kacinci===2){
      // Aranan nesnelerden birinin ortasında yumuşak bir ışık birkaç kez yanıp söner.
      const hedef=hits.find((_,i)=>i<2&&!found.has(i));
      if(hedef){
        art.querySelector('.rb-isik')?.remove();
        cerenGostersin(); // ipucu anı: Ceren gösterir (bütün adımlarla aynı)
        const a=art.getBoundingClientRect(),h=hedef.getBoundingClientRect(),isik=document.createElement('span');
        isik.className='rb-isik';isik.setAttribute('aria-hidden','true');
        const cap=Math.max(64,Math.min(h.width,h.height)*1.1);
        isik.style.cssText='left:'+(h.left-a.left+h.width/2)+'px;top:'+(h.top-a.top+h.height/2)+'px;width:'+cap+'px;height:'+cap+'px';
        art.append(isik);isik.addEventListener('animationend',()=>isik.remove(),{once:true});
      }
    }
    speakPrompt();
  });
  function speakPrompt(){
    message.textContent = prompt;
    idle.dur();
    cerenKonus('bul-'+lesson.id,()=>{if(alive)idle.kur();});
  }
  speakPrompt();
  listen.onclick = speakPrompt;
  button.onclick = next;
  function collect(index:number, hit:SVGPolygonElement){
    const slot = stars[index];
    slot.classList.add('rb-filled');
    if(quiet) return;
    const a = hit.getBoundingClientRect(), b = slot.getBoundingClientRect();
    const token = document.createElement('span');
    token.className = 'rb-token'; token.innerHTML = IKON.yildiz;
    root.append(token);
    const x=a.left+a.width/2-16, y=a.top+a.height/2-16;
    const dx=b.left+b.width/2-16-x, dy=b.top+b.height/2-16-y;
    token.style.left=x+'px';token.style.top=y+'px';
    const flight=token.animate([
      {transform:'scale(.5)',opacity:0},
      {transform:'translate(0,-9px) scale(1.2)',opacity:1,offset:.22},
      {transform:'translate('+dx+'px,'+dy+'px) scale(.68)',opacity:1}
    ],{duration:690,easing:'cubic-bezier(.22,.7,.25,1)'});
    flight.onfinish=()=>token.remove();
  }
  hits.forEach((hit,index)=>{
    function choose(){
      if(!alive || found.size===2) return;
      idle.dur();
      const target=index<2;
      const word=items[index].name;
      play?.(index,hit.getBoundingClientRect(),stage.getBoundingClientRect());
      if(target && found.has(index)){
        message.textContent=word+' ✓';
        cerenKonus(nesneSesi(index),()=>{if(alive)idle.kur();});
        return;
      }
      oyunSesi(target?'birles':'geri');
      message.textContent=word+' · '+(lesson.upper==='Ğ' && target?'Ğ':word[0]);
      if(target){
        idle.sifirla();art.querySelector('.rb-isik')?.remove();
        collect(found.size,hit);found.add(index);
        hit.setAttribute('aria-label',word+', bulundu');
        root.querySelector('.rb-stars')!.setAttribute('aria-label',found.size+' / 2 bulundu');
      }
      const complete=found.size===2;
      if(complete&&!sayildi){sayildi=true;turBitti('bul',lesson.id);requestAnimationFrame(()=>{if(alive)bitisKutla(art);});}
      if(complete){button.hidden=false;listen.hidden=true;}
      cerenKonus(nesneSesi(index),()=>{
        if(alive && complete){message.textContent='İkisini de buldun!';cerenKonus('bul-yeni-ikisi',()=>{if(alive)idle.kur();});}
        else if(alive)idle.kur();
      });
    }
    hit.onclick=choose;
    hit.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}};
  });
  // Resimde boş bir yere dokunuş da karşılıksız kalmaz: parmağın altında küçük bir halka açılır.
  art.querySelector<SVGSVGElement>('.rb-map')!.addEventListener('pointerdown',e=>{
    if(!alive||(e.target as Element).closest('.rb-hit'))return;
    if(found.size<2)idle.kur();
    if(quiet)return;
    const r=art.getBoundingClientRect(),halka=document.createElement('span');
    halka.className='rb-halka';halka.setAttribute('aria-hidden','true');
    halka.style.left=(e.clientX-r.left)+'px';halka.style.top=(e.clientY-r.top)+'px';
    art.append(halka);halka.addEventListener('animationend',()=>halka.remove(),{once:true});
  });
  return ()=>{alive=false;idle.kapat();root.querySelectorAll('.rb-token').forEach(el=>el.remove());};
}
