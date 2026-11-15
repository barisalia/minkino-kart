import {konus} from '../../src/audio/konusma';
import type {Omlet} from './omlet-tarifi';
const sesler=import.meta.glob<string>('../../assets/sef/omlet/*.mp3',{eager:true,query:'?url',import:'default'});
export function omletRehberiniDinle(evre:Omlet['evre']){
  const dosya=sesler['../../assets/sef/omlet/'+evre+'.mp3'];
  return dosya?konus(dosya):Promise.resolve();
}
