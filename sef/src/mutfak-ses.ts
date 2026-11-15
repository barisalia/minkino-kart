import { baglam, efektCikisi } from '../../src/audio/motor';
import type { MalzemeId } from './tarif';

let sesDokusu: AudioBuffer | undefined;
let tezgahKanali:GainNode|undefined;
function tezgahSesi(){
  const c=baglam(),cikis=efektCikisi();
  if(!c||!cikis||c.state!=='running'||document.hidden)return;
  if(!tezgahKanali||tezgahKanali.context!==c){
    tezgahKanali=c.createGain();
    tezgahKanali.connect(cikis);
  }
  return {c,cikis:tezgahKanali,t:c.currentTime};
}
export function tezgahiSustur(){
  const kanal=tezgahKanali;
  if(!kanal)return;
  tezgahKanali=undefined;
  kanal.gain.setTargetAtTime(0,kanal.context.currentTime,.006);
  window.setTimeout(()=>kanal.disconnect(),45);
}
function doku(c: AudioContext) {
  if (sesDokusu?.sampleRate === c.sampleRate) return sesDokusu;
  sesDokusu = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = sesDokusu.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return sesDokusu;
}
function hisirti(c: AudioContext, cikis: GainNode, t: number, sure: number, ilk: number, son: number, seviye: number) {
  const kaynak = c.createBufferSource();
  kaynak.buffer = doku(c);
  const filtre = c.createBiquadFilter();
  filtre.type = 'bandpass';
  filtre.Q.value = .8;
  filtre.frequency.setValueAtTime(ilk, t);
  filtre.frequency.exponentialRampToValueAtTime(son, t + sure);
  const g = c.createGain();
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(seviye, t + Math.min(.025, sure * .18));
  g.gain.exponentialRampToValueAtTime(.0001, t + sure);
  kaynak.connect(filtre).connect(g).connect(cikis);
  kaynak.onended = () => { kaynak.disconnect(); filtre.disconnect(); g.disconnect(); };
  kaynak.start(t, Math.random() * .3, sure + .01);
}
function vur(c: AudioContext, cikis: GainNode, t: number, hz: number, seviye: number) {
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'triangle';
  o.frequency.setValueAtTime(hz, t);
  o.frequency.exponentialRampToValueAtTime(hz * .55, t + .075);
  g.gain.setValueAtTime(.0001, t);
  g.gain.exponentialRampToValueAtTime(seviye, t + .004);
  g.gain.exponentialRampToValueAtTime(.0001, t + .095);
  o.connect(g).connect(cikis);
  o.onended = () => { o.disconnect(); g.disconnect(); };
  o.start(t); o.stop(t + .1);
}
export function kumpirTemasSesi(ad:'kabuk'|'ez'|'misir'|'tursu'|'zeytin'|'kasar'|'koz-biber'|'bezelye'){
  const ses=tezgahSesi();
  if(!ses)return;
  const {c,cikis,t}=ses;
  switch(ad){
    case 'kabuk':
      hisirti(c,cikis,t,.12,2800,1450,.14);
      hisirti(c,cikis,t+.08,.11,1700,900,.09);
      break;
    case 'ez':
      vur(c,cikis,t,220,.075);
      hisirti(c,cikis,t+.015,.12,1150,520,.10);
      break;
    case 'kasar':
      hisirti(c,cikis,t,.10,1650,750,.055);
      break;
    case 'bezelye':
    case 'misir':
      vur(c,cikis,t,490,.036);
      vur(c,cikis,t+.042,390,.037);
      vur(c,cikis,t+.092,460,.027);
      break;
    case 'koz-biber':
    case 'tursu':
      vur(c,cikis,t,390,.056);
      hisirti(c,cikis,t+.022,.07,1800,760,.06);
      break;
    case 'zeytin':
      vur(c,cikis,t,260,.073);
      break;
  }
}
export function kesmeSesi(id: MalzemeId) {
  const ses=tezgahSesi();if(!ses)return;
  const {c,cikis,t}=ses;
  if (id === 'marul') {
    hisirti(c, cikis, t, .16, 3700, 1300, .20);
    hisirti(c, cikis, t + .07, .1, 4600, 2500, .12);
    return;
  }
  const dokular = {
    domates: { sure: .12, frekans: 1580, tahta: 275 },
    havuc: { sure: .053, frekans: 3900, tahta: 510 },
    salatalik: { sure: .09, frekans: 3250, tahta: 360 },
    patates: { sure: .075, frekans: 2160, tahta: 335 },
  };
  const d = dokular[id];
  hisirti(c, cikis, t, d.sure, d.frekans, 760, .14);
  vur(c, cikis, t + d.sure * .56, d.tahta, .15);
}

export function blenderSesi(malzeme?:MalzemeId) {
  const ses=tezgahSesi();if(!ses)return;
  const {c,cikis,t:an}=ses,motor=c.createOscillator(),g=c.createGain();
  const sert=malzeme==='patates'||malzeme==='havuc';
  if(malzeme){
    vur(c,cikis,an+.035,sert?310:195,.05);
    if(sert)vur(c,cikis,an+.12,245,.032);
  }
  motor.type='triangle';
  motor.frequency.setValueAtTime(sert?104:130,an);
  motor.frequency.exponentialRampToValueAtTime(sert?185:215,an+.09);
  motor.frequency.exponentialRampToValueAtTime(146,an+.38);
  g.gain.setValueAtTime(.0001,an);g.gain.exponentialRampToValueAtTime(.09,an+.04);
  g.gain.exponentialRampToValueAtTime(.0001,an+.42);
  motor.connect(g).connect(cikis);motor.onended=()=>{motor.disconnect();g.disconnect();};
  motor.start(an);motor.stop(an+.43);
  hisirti(c,cikis,an+.05,.31,720,1130,.075);
}
export function karistirmaSesi(sicak:boolean,hiz=1,kisa=false) {
  const ses=tezgahSesi();if(!ses)return;
  const {c,cikis,t}=ses;
  if (sicak) {
    const guc=Math.max(.3,Math.min(1.15,hiz));
    hisirti(c,cikis,t,kisa ? .15 : .22,540,710+guc*580,.072*guc);
    if(!kisa){
      hisirti(c,cikis,t+.15,.18,1080,480,.067);
      vur(c,cikis,t+.22,710,.023);
    }
  } else {
    hisirti(c, cikis, t, .15, 2800, 1100, .16);
    hisirti(c, cikis, t + .12, .19, 1900, 850, .14);
  }
}

/** Wet pulp grows quieter as the same citrus half gives up its juice. */
export function sikmaSesi(ilerleme:number,hiz:number,damla:boolean){
  const ses=tezgahSesi();if(!ses)return;
  const {c,cikis,t}=ses,guc=Math.max(.3,Math.min(1,hiz));
  const islaklik=1-Math.min(1,Math.max(0,ilerleme/3));
  hisirti(c,cikis,t,.09+islaklik*.06,690+guc*420,360+islaklik*150,.065*guc);
  if(damla){
    vur(c,cikis,t+.075,560+ilerleme*45,.05);
    vur(c,cikis,t+.13,445+ilerleme*38,.027);
  }
}

/** Glass resonance rises during the second pour, as the air pocket shrinks. */
export function bardagaDokmeSesi(yarim:boolean){
  const ses=tezgahSesi();if(!ses)return;
  const {c,cikis,t}=ses,taban=yarim?740:465;
  hisirti(c,cikis,t,.36,yarim?1220:940,yarim?1590:1220,.09);
  for(const [i,aralik] of [.025,.11,.2,.295,.405].entries()){
    vur(c,cikis,t+aralik,taban+i*42,i===4?.02:.044);
  }
}
