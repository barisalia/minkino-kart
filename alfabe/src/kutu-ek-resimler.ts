import civciv from '../../assets/alfabe/kutu/civciv.webp';
import canta from '../../assets/hazirlik/canta.webp';
import elArabasi from '../../assets/film/esya/el-arabasi.webp';
import fener from '../../assets/alfabe/macera/sahne-fener.webp';
import gunes from '../../assets/film/esya/gunes.webp';
import yogurt from '../../assets/sef/mucver/yogurt.webp';
import havlu from '../../assets/banyo/havlu-mavi.webp';
import izgara from '../../assets/alfabe/kutu/izgara.webp';
import ip from '../../assets/alfabe/kelime/ip.webp';
import jole from '../../assets/alfabe/kutu/jole.webp';
import kapi from '../../assets/dedektif3/kart-kapi.webp';
import lamba from '../../assets/elektrik/lamba.webp';
import nane from '../../assets/sef/nesneler/corba-nane.webp';
import oyuncakAyi from '../../assets/film/esya/oyuncak-ayi.webp';
import onluk from '../../assets/ege/onluk.webp';
import rende from '../../assets/sef/mucver/rende.webp';
import sapka from '../../assets/giysin/ikon/sapka.webp';
import top from '../../assets/pati-yeni/nesneler/top.webp';
import ucurtma from '../../assets/alfabe/kutu/ucurtma.webp';
import ucgen from '../../assets/hazirlik/etkinlik/ucgen-2.webp';
import vagon from '../../assets/alfabe/macera/tren-vagon.webp';
import yaprak from '../../assets/dedektif2/yaprak.webp';

function kart(id: string, ad: string, gorsel: string) {
  return {id, ad, gorsel, ses: 'kutu-ad-' + id};
}

export const ekKutuKartlari = [
  kart('civciv', 'Civciv', civciv),
  kart('canta', 'Çanta', canta),
  kart('el-arabasi', 'El arabası', elArabasi),
  kart('fener', 'Fener', fener),
  kart('gunes', 'Güneş', gunes),
  kart('yogurt', 'Yoğurt', yogurt),
  kart('havlu', 'Havlu', havlu),
  kart('izgara', 'Izgara', izgara),
  kart('ip', 'İp', ip),
  kart('jole', 'Jöle', jole),
  kart('kapi', 'Kapı', kapi),
  kart('lamba', 'Lamba', lamba),
  kart('nane', 'Nane', nane),
  kart('oyuncak-ayi', 'Oyuncak ayı', oyuncakAyi),
  kart('onluk', 'Önlük', onluk),
  kart('rende', 'Rende', rende),
  kart('sapka', 'Şapka', sapka),
  kart('top', 'Top', top),
  kart('ucurtma', 'Uçurtma', ucurtma),
  kart('ucgen', 'Üçgen', ucgen),
  kart('vagon', 'Vagon', vagon),
  kart('yaprak', 'Yaprak', yaprak),
];
