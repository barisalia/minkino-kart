import {resim} from './gorsel';
import {h} from '../../src/ui/dom';
import replik from './corba-bitis-sesleri.json';
export type CorbaBitisi='nane'|'kruton'|'sade';
export const corbaBitisiMi=(id:unknown):id is CorbaBitisi=>id==='nane'||id==='kruton'||id==='sade';
export const bitisAdi={nane:'Nane yaprağı',kruton:'Kıtır ekmek',sade:'Sade çorba'};
export const bitisResmi=(id:CorbaBitisi,sinif='')=>id==='sade'
  ?h('span.corba-sade-isareti',{class:'corba-sade-isareti '+sinif},resim('corba-kasesi'),h('i'))
  :resim('corba-'+id,sinif);
export const bitisIstegi=(id:CorbaBitisi)=>replik[`corba-${id}`];
export const bitisTadimi=(id:CorbaBitisi)=>replik[`corba-${id}-tadim`];
