import balon from '../../assets/renkler/balon.webp';
import brokoli from '../../assets/meyveler/brokoli.webp';
import corap from '../../assets/giysin/ikon/corap.webp';
import corba from '../../assets/renkler/corba.webp';
import eldiven from '../../assets/giysin/ikon/eldiven.webp';
import fare from '../../assets/hayvanlar/fare.webp';
import firca from '../../assets/sef/sis/firca.webp';
import gozluk from '../../assets/giysin/ikon/gozluk.webp';
import kurbaga from '../../assets/hayvanlar/kurbaga.webp';
import kaplumbaga from '../../assets/hayvanlar/kaplumbaga.webp';
import hediye from '../../assets/renkler/hediye.webp';
import helikopter from '../../assets/tasitlar/helikopter.webp';
import itfaiye from '../../assets/tasitlar/itfaiye.webp';
import kiraz from '../../assets/meyveler/kiraz.webp';
import karpuz from '../../assets/meyveler/karpuz.webp';
import marul from '../../assets/sef/nesneler/marul.webp';
import misir from '../../assets/meyveler/misir.webp';
import patates from '../../assets/meyveler/patates.webp';
import portakal from '../../assets/meyveler/portakal.webp';
import roket from '../../assets/tasitlar/roket.webp';
import sepet from '../../assets/renkler/sepet-sari.webp';
import salatalik from '../../assets/meyveler/salatalik.webp';
import traktor from '../../assets/tasitlar/traktor.webp';
import tavuk from '../../assets/hayvanlar/tavuk.webp';
import yastik from '../../assets/alfabe/yastik.webp';
import zarf from '../../assets/hazirlik/kres/masal-zarf.webp';

const kartCizimleri = import.meta.glob<string>('../../assets/alfabe/obur-kartlar/*.webp', {
  eager: true, query: '?url', import: 'default',
});
const cizim = (ad: string) => kartCizimleri['../../assets/alfabe/obur-kartlar/'+ad+'.webp'];

export const oburResimleri = [
  { id: 'agac', ad: 'Ağaç', resim: cizim('agac'), ses: 'kutu-ad-agac' },
  { id: 'ari', ad: 'Arı', resim: cizim('ari'), ses: 'obur-kart-ari' },
  { id: 'balon', ad: 'Balon', resim: balon, ses: 'obur-kart-balon' },
  { id: 'brokoli', ad: 'Brokoli', resim: brokoli, ses: 'obur-kart-brokoli' },
  { id: 'cetvel', ad: 'Cetvel', resim: cizim('cetvel'), ses: 'obur-kart-cetvel' },
  { id: 'ceket', ad: 'Ceket', resim: cizim('ceket'), ses: 'obur-kart-ceket' },
  { id: 'corap', ad: 'Çorap', resim: corap, ses: 'obur-kart-corap' },
  { id: 'corba', ad: 'Çorba', resim: corba, ses: 'obur-kart-corba' },
  { id: 'ekmek', ad: 'Ekmek', resim: cizim('ekmek'), ses: 'obur-kart-ekmek' },
  { id: 'eldiven', ad: 'Eldiven', resim: eldiven, ses: 'obur-kart-eldiven' },
  { id: 'findik', ad: 'Fındık', resim: cizim('findik'), ses: 'obur-kart-findik' },
  { id: 'fare', ad: 'Fare', resim: fare, ses: 'obur-kart-fare' },
  { id: 'firca', ad: 'Fırça', resim: firca, ses: 'obur-kart-firca' },
  { id: 'gitar', ad: 'Gitar', resim: cizim('gitar'), ses: 'obur-kart-gitar' },
  { id: 'gozluk', ad: 'Gözlük', resim: gozluk, ses: 'obur-kart-gozluk' },
  { id: 'kurbaga', ad: 'Kurbağa', resim: kurbaga, ses: 'obur-kart-kurbaga' },
  { id: 'kaplumbaga', ad: 'Kaplumbağa', resim: kaplumbaga, ses: 'obur-kart-kaplumbaga' },
  { id: 'hediye', ad: 'Hediye', resim: hediye, ses: 'obur-kart-hediye' },
  { id: 'helikopter', ad: 'Helikopter', resim: helikopter, ses: 'obur-kart-helikopter' },
  { id: 'ihlamur', ad: 'Ihlamur', resim: cizim('ihlamur'), ses: 'obur-kart-ihlamur' },
  { id: 'irmak', ad: 'Irmak', resim: cizim('irmak'), ses: 'obur-kart-irmak' },
  { id: 'itfaiye', ad: 'İtfaiye arabası', resim: itfaiye, ses: 'obur-kart-itfaiye' },
  { id: 'inci', ad: 'İnci', resim: cizim('inci'), ses: 'obur-kart-inci' },
  { id: 'incir', ad: 'İncir', resim: cizim('incir'), ses: 'obur-kart-incir' },
  { id: 'jet', ad: 'Jet', resim: cizim('jet'), ses: 'obur-kart-jet' },
  { id: 'judo', ad: 'Judo kıyafeti', resim: cizim('judo'), ses: 'obur-kart-judo' },
  { id: 'kiraz', ad: 'Kiraz', resim: kiraz, ses: 'pano-ad-kiraz' },
  { id: 'karpuz', ad: 'Karpuz', resim: karpuz, ses: 'pano-ad-karpuz' },
  { id: 'lale', ad: 'Lale', resim: cizim('lale'), ses: 'obur-kart-lale' },
  { id: 'lahana', ad: 'Lahana', resim: cizim('lahana'), ses: 'obur-kart-lahana' },
  { id: 'marul', ad: 'Marul', resim: marul, ses: 'obur-kart-marul' },
  { id: 'misir', ad: 'Mısır', resim: misir, ses: 'obur-kart-misir' },
  { id: 'nohut', ad: 'Nohut', resim: cizim('nohut'), ses: 'obur-kart-nohut' },
  { id: 'nota', ad: 'Nota', resim: cizim('nota'), ses: 'obur-kart-nota' },
  { id: 'olta', ad: 'Olta', resim: cizim('olta'), ses: 'obur-kart-olta' },
  { id: 'oklava', ad: 'Oklava', resim: cizim('oklava'), ses: 'obur-kart-oklava' },
  { id: 'ortu', ad: 'Örtü', resim: cizim('ortu'), ses: 'obur-kart-ortu' },
  { id: 'orumcek', ad: 'Örümcek', resim: cizim('orumcek'), ses: 'obur-kart-orumcek' },
  { id: 'okuz', ad: 'Öküz', resim: cizim('okuz'), ses: 'obur-kart-okuz' },
  { id: 'patates', ad: 'Patates', resim: patates, ses: 'pano-ad-patates' },
  { id: 'portakal', ad: 'Portakal', resim: portakal, ses: 'obur-kart-portakal' },
  { id: 'roket', ad: 'Roket', resim: roket, ses: 'obur-kart-roket' },
  { id: 'radyo', ad: 'Radyo', resim: cizim('radyo'), ses: 'obur-kart-radyo' },
  { id: 'sepet', ad: 'Sepet', resim: sepet, ses: 'obur-kart-sepet' },
  { id: 'salatalik', ad: 'Salatalık', resim: salatalik, ses: 'obur-kart-salatalik' },
  { id: 'seftali', ad: 'Şeftali', resim: cizim('seftali'), ses: 'obur-kart-seftali' },
  { id: 'seker', ad: 'Şeker', resim: cizim('seker'), ses: 'obur-kart-seker' },
  { id: 'traktor', ad: 'Traktör', resim: traktor, ses: 'obur-kart-traktor' },
  { id: 'tavuk', ad: 'Tavuk', resim: tavuk, ses: 'obur-kart-tavuk' },
  { id: 'un', ad: 'Un', resim: cizim('un'), ses: 'obur-kart-un' },
  { id: 'uzay', ad: 'Uzay mekiği', resim: cizim('uzay'), ses: 'obur-kart-uzay' },
  { id: 'utu', ad: 'Ütü', resim: cizim('utu'), ses: 'obur-kart-utu' },
  { id: 'ustgecit', ad: 'Üst geçit', resim: cizim('ustgecit'), ses: 'obur-kart-ustgecit' },
  { id: 'vapur', ad: 'Vapur', resim: cizim('vapur'), ses: 'obur-kart-vapur' },
  { id: 'vantilator', ad: 'Vantilatör', resim: cizim('vantilator'), ses: 'obur-kart-vantilator' },
  { id: 'yastik', ad: 'Yastık', resim: yastik, ses: 'obur-kart-yastik' },
  { id: 'zeytin', ad: 'Zeytin', resim: cizim('zeytin'), ses: 'obur-kart-zeytin' },
  { id: 'zarf', ad: 'Zarf', resim: zarf, ses: 'obur-kart-zarf' },
];
