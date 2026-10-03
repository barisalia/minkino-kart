// kus-profil.json (ayı şablonundan): Gemini kuş yan çizimi (../hyan/kus-yan-seffaf.png); kafa ayrı (sert), kanat-on (gövde yanındaki kanat + uçuş tüyleri), kuyruk, iki bacak, goz
const fs = require('fs'); const d = __dirname + '/';
const j = JSON.parse(fs.readFileSync(d + 'ayi-profil.json.taslak', 'utf8').replace(/^\uFEFF/, ''));
j.ad = 'kus-profil'; j.kaynak = '../hyan/kus-yan-seffaf.png'; j.konturRenk = '#3F1A1A'; j.koyuEsik = 85; j.konturW = 14; j.konturAl = 30; j.kenarLum = 0; delete j.konturSicak;
j.sira = 'kuyruk,bacak-arka,bacak-on,govde,kanat-on,kafa,goz,goz-kapali'; j.gizli = 'goz-kapali';
const P = (ad, sekil, ozel = false, kes = true) => ({ ad, sekil, ozel, kes });
const KAFA = 'p:780,360,1620,360,1620,900,1500,925,1380,935,1250,965,1100,962,980,952,900,945,780,935';
const KANAT = 'p:772,1096,860,1000,960,962,1070,966,1126,1010,1140,1100,1132,1200,1112,1300,1062,1384,1000,1424,900,1452,780,1466,680,1466,598,1450,586,1420,600,1380,640,1326,662,1232,684,1160,730,1110';
const KUY = 'p:470,1472,700,1470,770,1456,830,1485,815,1530,780,1600,740,1680,470,1720';
const BON = 'p:925,1580,1010,1580,1030,1650,1020,1700,1032,1740,1090,1760,1130,1780,1170,1810,1180,1880,1100,1895,870,1895,860,1810,890,1770,945,1760,950,1700,938,1650';
const BAR = 'p:1070,1560,1150,1560,1140,1640,1126,1700,1130,1730,1200,1750,1300,1760,1400,1790,1550,1810,1560,1880,1290,1896,1186,1860,1150,1790,1088,1762,1082,1700,1092,1640';
j.parcalar = [P('goz', 'e:1214,630,76,86', true, false), P('kafa', KAFA), P('kanat-on', KANAT), P('bacak-on', BON), P('bacak-arka', BAR), P('kuyruk', KUY)];
j.sert = [{ ad: 'kafa', sekil: KAFA }, { ad: 'kanat-on', sekil: KANAT }, { ad: 'bacak-on', sekil: BON }, { ad: 'bacak-arka', sekil: BAR }, { ad: 'kuyruk', sekil: KUY }];
j.zorla = []; j.tamamla = []; j.yumusat = []; j.kapak = [];
j.yaylar = { 'goz-kapali': '1150,632,1280,630,26' };
j.donme = { kafa: [1000, 930], goz: [1214, 630], 'goz-kapali': [1214, 640], 'kanat-on': [990, 1010], 'bacak-on': [990, 1620], 'bacak-arka': [1110, 1620], kuyruk: [790, 1470], govde: [1100, 1700] };
j.bagli = { goz: 'kafa', 'goz-kapali': 'kafa' };
j.varsayilan = 'govde';
j.test = [
  { ad: 'evre-1', gizli: '', goster: '', aci: 'bacak-on=-12;bacak-arka=12;kanat-on=5;kuyruk=6;kafa=-2', olcek: '' },
  { ad: 'evre-3', gizli: '', goster: '', aci: 'bacak-on=12;bacak-arka=-12;kanat-on=-5;kuyruk=-6;kafa=2', olcek: '' },
  { ad: 'goz-kapali', gizli: 'goz', goster: 'goz-kapali', aci: 'kafa=4', olcek: '' },
  { ad: 'kanat-ac', gizli: '', goster: '', aci: 'kanat-on=-25', olcek: '' },
  { ad: 'kuyruk', gizli: '', goster: '', aci: 'kuyruk=-14', olcek: '' },
];
fs.writeFileSync(d + 'kus-profil.json', JSON.stringify(j, null, 4)); console.log('kus ayar yazildi');
