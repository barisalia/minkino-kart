import { menuYasiOku } from '../../src/engine/menu-yas';

export type AtolyeYasi = '2-3' | '4' | '5+';
function grubuOku(): AtolyeYasi {
  if(location.protocol==='file:'){
    const secim=new URLSearchParams(location.search).get('yas');
    let tercih=secim;
    try{
      if(secim==='2-3'||secim==='4'||secim==='5+')localStorage.setItem('minkino-atolye-dosya-yasi',secim);
      else tercih=localStorage.getItem('minkino-atolye-dosya-yasi');
    }catch{/* Dosya depolaması kapalıysa adres çubuğundaki seçim kullanılır. */}
    if(tercih==='2-3'||tercih==='4'||tercih==='5+')return tercih;
  }
  const yas=menuYasiOku();
  if(yas===2||yas===3)return '2-3';
  return yas===4?'4':'5+';
}

export const yasGrubu=grubuOku();
export const kucukGrup=yasGrubu==='2-3';
export const tamDers=yasGrubu==='5+';
