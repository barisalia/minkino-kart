import type {TatliCesidi} from './tatli-ekonomi';

const adlar:Record<TatliCesidi, readonly string[]> = {
  sutlac:[],
  'kurabiye': ["limonlu yıldız","çilekli kalp","kakaolu ay","naneli yaprak","portakallı güneş","yaban mersinli çiçek","vanilyalı bulut","kirazlı fiyonk","kayısılı kelebek","frambuazlı lale","limonlu taç","kakaolu düğme","ballı arı","lavantalı damla","vişneli elma","vanilyalı papatya","karamelli yapboz","narlı balon","fıstıklı yonca","çilekli kurdele","mandalinalı havuç","kakaolu nota","üzümlü şemsiye","limonlu civciv","naneli çam"],
  'dondurma': ["üçgen gofret","kalp gofret","yelpaze gofret","sarmal gofret çubuğu","kakaolu kaşık gofret","çilekli rulo gofret","limon dilimi","portakal dilimi","kivi dilimi","yarım çilek","saplı kiraz","yaban mersini ikilisi","frambuaz","muz dilimi","karambola yıldızı","ejder meyvesi dilimi","ananas üçgeni","kavun dilimi","mango küpü","şeftali dilimi","mandalina dilimi","kayısı yarısı","yeşil elma dilimi","kırmızı üzüm ikilisi","böğürtlen"],
  'minik-kek': ["çikolata yelkeni","beyaz çikolata tüyü","çilekli çikolata halkası","çikolata yaprağı","çikolata balığı","beyaz çikolata kelebeği","karamelli kıvrım","kakaolu çengel","vanilyalı beze","pembe beze gülü","limonlu beze damlası","fıstıklı beze","yaban mersinli makaron","kayısılı makaron","pembe makaron","kakaolu makaron","kalp bisküvi","çiçek bisküvi","tavşan bisküvi","kedi pati bisküvi","deniz kabuğu bisküvi","ayı yüzlü bisküvi","kurdele bisküvi","yalın hilal bisküvi","mini simit bisküvi"],
  'meyveli-tart': ["çilek yelpazesi","armut yelpazesi","elma gülü","mango gülü","şeftali yelpazesi","kivi yarım ayı","ikiz kiraz","şerit portakal kabuğu","sarmal limon kabuğu","taze nane filizi","fesleğen yaprağı","yenilebilir menekşe","yenilebilir hercai menekşe","yenilebilir gül yaprağı","yenilebilir kadife çiçeği","kremadan papatya","kremadan lale","kremadan ayçiçeği","kremadan lavanta","kremadan orkide","frenk üzümü salkımı","altın çilek","mor incir dilimi","nar tanesi üçlüsü","sarı erik yarısı"]
};

const cizimler=import.meta.glob<string>('../../assets/sef/suslemeler/*.webp',{eager:true,query:'?url',import:'default'});
type Sus = {id:string; ad:string; resim:string};
const tarifler=new Map<TatliCesidi,Sus[]>();
const parcalar=new Map<string,Sus>();
let sira=0;
for(const [tarif,isimler] of Object.entries(adlar)){
  const susler:Sus[]=[];
  for(const ad of isimler){
    const id='sus-'+String(++sira).padStart(3,'0');
    const resim=cizimler['../../assets/sef/suslemeler/'+id+'.webp'];
    if(!resim)continue;
    const sus={id,ad,resim};
    susler.push(sus);
    parcalar.set(id,sus);
  }
  tarifler.set(tarif as TatliCesidi,susler);
}
export function suslemeler(tarif:TatliCesidi){return tarifler.get(tarif)??[];}
export function susBul(id:unknown){return typeof id==='string'?parcalar.get(id):undefined;}

