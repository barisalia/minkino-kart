export const names = Object.freeze({
  biskuvi: 'Köpek bisküvisi', 'kedi-lokmasi': 'Balık bisküvisi', tavuk: 'Tavuk', somon: 'Somon',
  havuc: 'Havuç', brokoli: 'Brokoli', yaprak: 'Yeşillik', elma: 'Elma', dari: 'Darı', yulaf: 'Yulaf',
  bezelye: 'Bezelye', cekirge: 'Çekirge', kurt: 'Un kurdu', yosun: 'Yosun tableti', 'pul-yem': 'Pul yem',
  'balik-yemi': 'Yem tanesi', kabak: 'Kabak', salatalik: 'Salatalık', armut: 'Armut', cilek: 'Çilek'
});

export const pantry = {
  kopek: ['biskuvi','tavuk','havuc','somon','kabak','salatalik'],
  kedi: ['kedi-lokmasi','tavuk','somon'],
  tavsan: ['yaprak','brokoli','havuc','elma','armut','cilek'],
  hamster: ['yulaf','havuc','brokoli','dari','salatalik','kabak'],
  kus: ['dari','brokoli','elma','yulaf','armut','salatalik'],
  civciv: ['dari','yulaf','kurt','bezelye'],
  kirpi: ['cekirge','kurt','tavuk'],
  geko: ['cekirge','kurt'],
  kaplumbaga: ['yaprak','brokoli','havuc','kabak'],
  beta: ['balik-yemi','pul-yem'],
  balik: ['pul-yem','yosun','balik-yemi'],
  ordek: ['bezelye','yaprak','yulaf','kurt','salatalik']
};

export const urunler = Object.freeze({
  ...Object.fromEntries(Object.entries(names).map(([id, ad]) => [id, {ad, fiyat: 1, tip: 'yiyecek'}])),
  atki: {ad:'Sıcacık atkı',fiyat:9,tip:'kiyafet',bonus:2,koruma:.35},
  fular: {ad:'Denizci fuları',fiyat:14,tip:'kiyafet',bonus:3,koruma:.45},
  yelek: {ad:'Kapitone yelek',fiyat:18,tip:'kiyafet',bonus:4,koruma:.55},
  yuva: {ad:'Sıcak yuva',fiyat:24,tip:'yuva',bonus:5,koruma:.60},
  papatya: {ad:'Papatya yaka',fiyat:12,tip:'kiyafet',bonus:3,koruma:.40},
  ormanci: {ad:'Ormancı yeleği',fiyat:22,tip:'kiyafet',bonus:5,koruma:.57},
  cilekli: {ad:'Çilekli boyunluk',fiyat:16,tip:'kiyafet',bonus:4,koruma:.46},
  pelerin: {ad:'Ay pelerini',fiyat:26,tip:'kiyafet',bonus:6,koruma:.58},
  baslik: {ad:'Başlık',fiyat:24,tip:'kiyafet',bonus:4,koruma:.45},
  imza: {ad:'Özel dikim',fiyat:32,tip:'kiyafet',bonus:7,koruma:.62},
  'gece-pelerini': {ad:'Takımyıldız pelerini',fiyat:38,tip:'kiyafet',bonus:8,koruma:.65},
  cicek: {ad:'Çiçek yatağı',fiyat:18,tip:'yuva',bonus:3,koruma:.45,ortamlar:['ev','bahce']},
  kayik: {ad:'Kayık yatak',fiyat:32,tip:'yuva',bonus:6,koruma:.64,ortamlar:['ev','bahce']},
  nilufer: {ad:'Nilüfer yatağı',fiyat:26,tip:'yuva',bonus:5,koruma:.62,ortamlar:['golet']},
  kemer: {ad:'Toprak kemer',fiyat:26,tip:'yuva',bonus:5,koruma:.62,ortamlar:['teraryum']},
  cadir: {ad:'Kamp çadırı',fiyat:30,tip:'yuva',bonus:6,koruma:.65,ortamlar:['ev','bahce','teraryum']},
  'ay-yatak': {ad:'Ay yatağı',fiyat:34,tip:'yuva',bonus:7,koruma:.67,ortamlar:['ev','bahce']},
  'incili-yuva': {ad:'İnci yatağı',fiyat:30,tip:'yuva',bonus:6,koruma:.64,ortamlar:['golet']},
  ciceklik: {ad:'Kokulu çiçek',fiyat:12,tip:'dekor',ortamlar:['ev','bahce','teraryum']},
  cangirak: {ad:'Çanlı oyuncak',fiyat:18,tip:'dekor',ortamlar:['ev','bahce']},
  denizotu: {ad:'Kabarcıklı yosun',fiyat:14,tip:'dekor',ortamlar:['golet']},
  ilac: {ad: 'Pati şurubu', fiyat: 3, tip: 'ilac'},
  sampuan: {ad: 'Şampuan', fiyat: 5, tip: 'esya', rafta: false},
  kurdele: {ad: 'Kurdele', fiyat: 4, tip: 'esya'}
});

export function donanimUygun(key,ortam) {
  const urun = urunler[key];
  if (urun?.tip === 'kiyafet') return key === 'baslik' || ortam !== 'golet';
  return ['yuva','dekor'].includes(urun?.tip) && (!urun.ortamlar || urun.ortamlar.includes(ortam));
}

export function yuvaCizimi(tur,ortam,yatak) {
  if (yatak === 'yuva') return ['golet','teraryum'].includes(ortam) ? 'kovuk' : 'yuva';
  if (yatak) return yatak;
  if (ortam === 'teraryum') return 'kovuk';
  if (ortam === 'golet') return 'su-yatagi';
  return ['kus','civciv','ordek'].includes(tur) ? 'kus-yatagi' : 'sepet-yatak';
}
