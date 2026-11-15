import mikrofon from '../../assets/hazirlik/kres/sahne-mikrofon.svg';
import kurdele from '../../assets/hazirlik/kres/sahne-kurdele.svg';
import alkis from '../../assets/hazirlik/kres/sahne-alkis.svg';
import adim from '../../assets/hazirlik/kres/sahne-adim.svg';
import isik from '../../assets/hazirlik/kres/sahne-isik.svg';
import zil from '../../assets/hazirlik/kres/sahne-zil.svg';
import gunes from '../../assets/hazirlik/kres/sahne-gunes.svg';
import ay from '../../assets/hazirlik/kres/sahne-ay.svg';
import kupa from '../../assets/hazirlik/kres/odul-yildiz-kupasi.webp';
import yildiz from '../../assets/hazirlik/kres/sahne-yildiz.svg';
import kulak from '../../assets/hazirlik/kres/sahne-kulak.svg';

function resim(kaynak:string){
  return '<img class="gosteri-esya-resmi" alt="" draggable="false" src="'+kaynak+'">';
}

export const sahneIkon={
  mikrofon:resim(mikrofon),
  kurdele:resim(kurdele),
  alkis:resim(alkis),
  adim:resim(adim),
  isik:resim(isik),
  zil:resim(zil),
  gunes:resim(gunes),
  ay:resim(ay),
  kupa:resim(kupa),
  yildiz:resim(yildiz),
  kulak:resim(kulak),
};
