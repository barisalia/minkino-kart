import {h} from '../../src/ui/dom';
import {kresOku,type Kose,type KresKaydi} from '../../hazirlik/src/kres-kaydi';
import {kupaKazandi} from '../../hazirlik/src/gosteri-kaydi';

const isler:Record<Kose,string>={
  beste:'Çalgıları seçip kendi ritmini oluşturdu.',
  'serbest-resim':'Kendi çizdiği resmi sınıf panosuna astı.',
  cember:'Sabah çemberinde konuşma taşını sırayla arkadaşlarına verdi ve bir köşe seçti.',
  blok:'Üç şekli yuvasına yerleştirdi, tekerlekleri takıp arabayı sürdü.',
  boyahane:'İki ana rengi karıştırdı ve kendi fırça izleriyle bir resim yaptı.',
  'su-masasi':'Suda kalan bir nesne ile suyun dibine inen taşı karşılaştırdı.',
  kagit:'Kâğıdı katlayarak su masasında kullanabileceği bir kayık yaptı.',
  bahce:'Pencere önündeki saksıyı suladı.',
  cicekci:'Arkadaşının istediği kadar çiçeği saydı ve buketine sayı kartı taktı.',
  'meyve-mutfagi':'Meyveleri yıkadı, parmağıyla kesti ve kendi tarifini arkadaşına sundu.',
  gosteri:'Arkadaşıyla birlikte yıl sonu gösterisinde sahne aldı.',
  paylas:'Mino ve Zıpzıp’ın istediği meyveleri tabaklarına sayarak koydu.',
  muzik:'Mino’nun çaldığı üç ritmi sırayla tekrar etti.',
  kolye:'Altı kabuğu ipe dizdi ve kolyeyi bir arkadaşına verdi.',
  pano:'Sınıf panosu için bir resim çalışması yaptı.',
  harf:'Sınıf sergisinin sayı ve harf etiketleriyle çalıştı.',
  beslenme:'Evde hazırladığı beslenme kutusunu açtı, yedi ve artanları topladı.',
  lavabo:'Patilerini ıslattı, sabunla ovaladı, durulayıp kuruladı.',
  oyku:'Kayıp Tekerlek öyküsünün üç olayını oluş sırasına koydu.',
};
function gozlem(s:KresKaydi){
  const onceki=s.biten.length?null:s.oncekiGun;
  const giris=onceki?onceki.biten:s.biten;
  if(!giris.length)return [];
  const gun=onceki?.gun??s.gun;
  const sonuc=onceki?onceki.sonGosterisi??s.evAlbumu.find(h=>h.gun===gun):s.gosteri.sonuc;
  const gununKupasi=onceki?onceki.kupaKazandi:!!s.bugununKupasi;
  return [h('details.ug-okul-gunlugu',{},h('summary',{},'Anaokulunda '+gun+'. gün'),
    h('ul',{},...giris.map(k=>{
      const satir=k==='gosteri'&&sonuc?'Zıpzıp ile '+(sonuc.dal==='dans'?'dans etmeyi':sonuc.siir?'şiir okumayı':'şarkı söylemeyi')+' seçti. Son gösteri: '+sonuc.puan+'/10.'+(kupaKazandi(sonuc)?' Birlikte kupayı kazandılar.':gununKupasi?' Aynı gün önceki gösterilerinde kupayı kazandılar.':''):
        k==='meyve-mutfagi'&&!onceki&&s.meyveMutfagi.hatira?s.meyveMutfagi.hatira.tarif==='sis'?'Meyveleri yıkayıp kesti, kesilen parçaları kendi sırasında şişe dizip Zıpzıp’a ikram etti.':'Meyveleri yıkayıp kesti, kâsede karıştırarak Mino’ya meyve salatası hazırladı.':isler[k];
      return h('li',{},satir);
    })))];
}
export function anaokuluGunlugu():HTMLElement[]{
  try{
    const veri=JSON.parse(localStorage.getItem('minkino-hazirlik-sabah-v1')??'null');
    return veri?.kres?gozlem(kresOku(veri.kres)):[];
  }catch{return []}
}
