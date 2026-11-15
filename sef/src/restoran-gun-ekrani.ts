import { h } from '../../src/ui/dom';
import { ikon } from './gorsel';
import { jetonSimge } from './tatli-dukkan';
import './restoran-gun-ekrani.css';

export function gunRozeti(gun:number,tamam:number,hedef:number):HTMLElement {
  const ilerleme=h('span.gun-masalar',{'aria-hidden':true});
  for(let masa=0;masa<hedef;masa++)ilerleme.append(h('i',{'data-dolu':masa<tamam?'evet':'hayir'}));
  return h('span.restoran-gun-rozeti',{role:'img','aria-label':gun+'. gün, '+hedef+' müşteriden '+tamam+' tanesi servis aldı'},
    ikon('ebeveyn'),h('b',{},String(gun)),ilerleme);
}

export function gunSonuEkrani(gun:number,jeton:number,baslat:()=>void):HTMLElement {
  const yeni=h('button.restoran-yeni-sabah',{type:'button','aria-label':(gun+1)+'. güne başla'},
    h('span',{},'Yeni gün'),ikon('ileri'));
  yeni.addEventListener('click',()=>{yeni.disabled=true;baslat();},{once:true});
  return h('section.restoran-gun-sonu',{'aria-label':'Restoran gün sonu'},
    h('div.aksam-kazanci',{},
      h('h2',{},gun+'. gün bitti'),
      h('div.aksam-jetonu',{'aria-label':jeton+' jeton kazanıldı'},jetonSimge(),h('strong',{},'+'+jeton)),
      yeni));
}
