import { h } from '../../src/ui/dom';
import { dugme, resim } from './gorsel';
import { hareket, icinde, jest, merkez, type Nokta } from './hareket';
import type { MalzemeId, Siparis } from './tarif';

/** Blenderin ucu parmağı izler. Her temas yalnızca seçilen sebzeyi ezer. */
export function blenderTezgahi(sahne:HTMLElement,kap:HTMLElement,s:Siparis,secili:boolean,
  sec:(deger:boolean)=>void,ez:(id:MalzemeId)=>void,calistir:(id:MalzemeId)=>void) {
  const kalan=s.aktarilan.filter(id=>!s.ezilen.includes(id));
  if(!kalan.length)return;
  const alet=dugme('El blenderi','corba-blender',resim('corba-blender'));
  alet.setAttribute('aria-pressed',String(secili));
  alet.setAttribute('aria-description','Tencerede ezmek istediğin parçaya sürükle. İstersen önce blendere, sonra sebzeye dokun.');
  const noktalar=h('div.blender-noktalari');
  const yuvalar=[[27,53],[52,32],[71,57]];
  const hedefler=kalan.map(id=>{
    const yuva=yuvalar[s.aktarilan.indexOf(id)];
    const parcaciklar=[...kap.querySelectorAll<HTMLElement>('[data-malzeme="'+id+'"]')];
    const uzaklik=(p:HTMLElement)=>Math.hypot(parseFloat(p.style.left)-yuva[0],parseFloat(p.style.top)-yuva[1]);
    const odak=parcaciklar.sort((a,b)=>uzaklik(a)-uzaklik(b))[0];
    const ad={patates:'Patatesi',domates:'Domatesi',havuc:'Havucu',marul:'Marulu',salatalik:'Salatalığı'}[id];
    const b=dugme(ad+' ez','blender-noktasi');
    const kutu=kap.getBoundingClientRect();
    const parcaMerkezi=odak?merkez(odak):undefined;
    b.style.left=parcaMerkezi&&kutu.width?(parcaMerkezi.x-kutu.left)*100/kutu.width+'%':yuva[0]+'%';
    b.style.top=parcaMerkezi&&kutu.height?(parcaMerkezi.y-kutu.top)*100/kutu.height+'%':yuva[1]+'%';
    b.dataset.ez=id;b.tabIndex=secili?0:-1;b.setAttribute('aria-hidden',String(!secili));
    noktalar.append(b);
    jest(b,{birak:(_n,_i,tik)=>{if(tik)temas(id,merkez(b));},klavye:()=>temas(id,merkez(b))});
    return {b,id};
  });
  kap.classList.toggle('ezme-secili',secili);
  kap.append(noktalar);sahne.append(alet);
  let hareketli:HTMLImageElement|undefined;
  let calisiyor=false;
  function elde(yer:Nokta){
    if(!hareketli){
      hareketli=resim('corba-blender','blender-elde');
      hareketli.style.height=alet.querySelector('img')!.getBoundingClientRect().height+'px';
      sahne.append(hareketli);
    }
    const r=sahne.getBoundingClientRect();
    hareketli.style.left=yer.x-r.left+'px';hareketli.style.top=yer.y-r.top+'px';
  }
  function temizle(){hareketli?.remove();hareketli=undefined;alet.classList.remove('surukleniyor');kap.classList.remove('ezme-yakin');}
  async function temas(id:MalzemeId,nokta:Nokta){
    if(calisiyor||!alet.isConnected)return;
    calisiyor=true;elde(nokta);calistir(id);alet.classList.add('surukleniyor');
    // Diğer parmak aynı anda kepçeyi kullanırsa yarım ezilmiş porsiyon kaydedilmesin.
    const kepce=kap.querySelector<HTMLButtonElement>('[data-porsiyon-al]');
    if(kepce)kepce.disabled=true;
    alet.setAttribute('aria-busy','true');
    const secilen=kap.querySelectorAll<HTMLElement>('[data-malzeme="'+id+'"]');
    const halka=h('span.blender-halka');const r=kap.getBoundingClientRect();
    halka.style.left=(nokta.x-r.left)+'px';halka.style.top=(nokta.y-r.top)+'px';kap.append(halka);
    const titresim=hareket(hareketli!,[{rotate:'-6deg'},{rotate:'-3deg'},{rotate:'-7deg'},{rotate:'-3deg'},{rotate:'-6deg'}],420);
    const erime=[...secilen].map(p=>{
      const merkezNoktasi=merkez(p);
      const dx=nokta.x-merkezNoktasi.x,dy=nokta.y-merkezNoktasi.y;
      return hareket(p,[
        {transform:'translate(0,0) scaleY(.86)',opacity:1},
        {transform:`translate(${dx*.4-dy*.08}px,${dy*.4+dx*.08}px) scale(.78)`,opacity:.9,offset:.56},
        {transform:`translate(${dx}px,${dy}px) scale(.16)`,opacity:0}
      ],420);
    });
    await Promise.all([titresim,...erime]);
    const acik=alet.isConnected;temizle();halka.remove();if(acik)ez(id);
  }
  const degistir=()=>{if(calisiyor)return;sec(!secili);};
  jest(alet,{
    tasi:(yer,ilk)=>{
      if(calisiyor||Math.hypot(yer.x-ilk.x,yer.y-ilk.y)<7)return;
      elde(yer);alet.classList.add('surukleniyor');kap.classList.toggle('ezme-yakin',icinde(kap,yer));
    },
    birak:(yer,_ilk,tik)=>{
      if(calisiyor)return;
      if(tik){temizle();degistir();return;}
      if(!icinde(kap,yer)){temizle();return;}
      const mesafe=(el:HTMLElement)=>{const n=merkez(el);return Math.hypot(n.x-yer.x,n.y-yer.y);};
      const parcalar=[...kap.querySelectorAll<HTMLElement>('.sef-kap-parcasi[data-malzeme]')];
      const yakin=parcalar.sort((a,b)=>mesafe(a)-mesafe(b))[0];
      const hedef=hedefler.find(h=>h.id===yakin?.dataset.malzeme);
      if(!hedef||!yakin||mesafe(yakin)>Math.max(22,yakin.getBoundingClientRect().width*.72)){temizle();return;}
      void temas(hedef.id,yer);
    },iptal:temizle,klavye:degistir,
  });
}
