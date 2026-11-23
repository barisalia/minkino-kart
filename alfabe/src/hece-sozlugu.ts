export const heceler: Record<string, string[]> = {
  '01':['ar','mut'], '03':['ce','viz'], '04':['çi','lek'], '05':['da','vul'],
  '08':['ge','mi'], '10':['ha','vuç'], '11':['ıs','pa','nak'], '12':['i','nek'],
  '14':['ke','di'], '25':['u','çak'], '27':['va','zo'],
  '02':['ba','lık'], '06':['el','ma'], '15':['li','mon'], '19':['ör','dek'],
  '20':['pan','da'], '26':['ü','züm'], '18':['o','to','büs'], '23':['şem','si','ye'],
  '28':['yel','ken','li'], '29':['zü','ra','fa'],
};

import { havuzHeceSesleri } from './sozcuk-havuzu';

// Hecenin Ceren kaydı: sözcük havuzunun listesinde (ekip/alfabe/sozcuk-havuzu.json) adı geçen hece oradaki `ses`
// alanıyla çalar (açık hecelerin çoğu Hece Evleri'nin ev-* kayıtları); öbürleri pano-hece-<hece>.
export function parcaSesi(hece:string){
  return havuzHeceSesleri[hece]??'pano-hece-'+hece;
}
