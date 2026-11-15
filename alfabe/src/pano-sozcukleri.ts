import { heceler as temel } from './hece-sozlugu';
import { resim } from './resimler';
import dersler from './harfler.json';
import { ekKutuKartlari } from './kutu-ek-resimler';
import kiraz from '../../assets/meyveler/kiraz.webp';
import karpuz from '../../assets/meyveler/karpuz.webp';
import patates from '../../assets/meyveler/patates.webp';
import domates from '../../assets/meyveler/domates.webp';
import kelebek from '../../assets/canlan/kelebek.webp';

export const heceler:Record<string,string[]>={...temel,
  '13':['je', 'ton'],
  '21':['ra', 'ket'],
  'kiraz':['ki', 'raz'],
  'karpuz':['kar', 'puz'],
  'patates':['pa', 'ta', 'tes'],
  'domates':['do', 'ma', 'tes'],
  'kelebek':['ke', 'le', 'bek'],
  'havlu':['hav', 'lu'],
  'lamba':['lam', 'ba'],
  'rende':['ren', 'de'],
  'vagon':['va', 'gon'],
  'civciv':['civ', 'civ'],
  'ucurtma':['u', 'çurt', 'ma'],
};
const nesneler:Record<string,string>={kiraz,karpuz,patates,domates,kelebek,...Object.fromEntries(ekKutuKartlari.map(k=>[k.id,k.gorsel]))};
export const panoResmi=(id:string)=>nesneler[id]??resim(id);
export const panoAdi=(id:string)=>dersler.find(d=>d.id===id)?.example??heceler[id].join('');
export { parcaSesi } from './hece-sozlugu';
