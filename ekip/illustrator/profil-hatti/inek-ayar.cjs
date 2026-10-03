// inek-profil.json (ayı şablonundan): Gemini inek yan çizimi (../hyan/inek-yan.png), kulak ve boynuzlar kafada, kol/bacak/kuyruk ayrı
const fs = require('fs'); const d = __dirname + '/';
const j = JSON.parse(fs.readFileSync(d + 'ayi-profil.json.taslak', 'utf8').replace(/^\uFEFF/, ''));
j.ad = 'inek-profil'; j.kaynak = '../hyan/inek-yan.png'; j.konturRenk = '#3A1E1B'; j.koyuEsik = 95; j.konturSicak = 12; j.konturW = 14; j.konturAl = 30; delete j.kenarLum;
j.sira = 'kuyruk,bacak-arka,bacak-on,govde,kol-on,kafa,goz,agiz,goz-kapali'; j.gizli = 'goz-kapali';
const P = (ad, sekil, ozel = false, kes = true) => ({ ad, sekil, ozel, kes });
const KAFA = 'p:700,300,1580,300,1580,1095,1520,1105,1440,1105,1300,1112,1150,1100,1000,1075,900,1062,835,1075,835,830,700,830';
const KOL = 'p:990,1128,1090,1132,1136,1190,1128,1250,1118,1300,1116,1350,1118,1400,1124,1450,1130,1500,1124,1540,1100,1566,1040,1568,985,1546,966,1510,946,1450,938,1400,937,1350,938,1300,944,1250,955,1200,975,1160';
const BON = 'p:915,1632,1000,1640,1100,1640,1150,1625,1150,1700,1135,1760,1170,1790,1170,1866,1110,1886,1000,1892,950,1880,940,1800,935,1740,925,1670';
const BAR = 'p:1142,1640,1230,1630,1300,1600,1306,1700,1272,1740,1286,1790,1312,1820,1306,1852,1250,1862,1164,1864,1164,1760,1132,1700';
const KUY2 = 'p:540,1490,790,1490,790,1560,805,1590,830,1622,850,1640,850,1690,540,1690';
const KUY = 'p:540,1490,796,1490,806,1560,822,1590,850,1612,850,1690,540,1690';
j.parcalar = [P('goz', 'e:1226,778,64,78', true, false), P('agiz', 'p:1325,955,1345,962,1380,985,1420,972,1428,990,1405,1015,1360,1010,1325,980', true, false), P('kafa', KAFA), P('kol-on', KOL), P('bacak-on', BON), P('bacak-arka', BAR), P('kuyruk', KUY)];
j.sert = [{ ad: 'bacak-on', sekil: BON }, { ad: 'bacak-arka', sekil: BAR }, { ad: 'kol-on', sekil: KOL }, { ad: 'kuyruk', sekil: KUY2 }];
j.zorla = [{ ad: 'kuyruk', sekil: 'p:540,1490,790,1490,790,1560,805,1590,830,1622,850,1640,850,1690,540,1690' }];   // sap gövdeyle aynı bileşende: kuyruğa zorla
j.tamamla = [{ ad: 'kafa', sekil: 'e:1226,778,64,78', renk: '#222126', kontur: false }, { ad: 'kafa', sekil: 'p:1325,955,1345,962,1380,985,1420,972,1428,990,1405,1015,1360,1010,1325,980', renk: '#F07A92', kontur: false }];
j.yumusat = []; j.kapak = [];
j.yaylar = { 'goz-kapali': '1172,782,1282,776,24' };
j.donme = { kafa: [1100, 1090], goz: [1226, 778], agiz: [1380, 985], 'goz-kapali': [1226, 786], 'kol-on': [1030, 1190], 'bacak-on': [1040, 1650], 'bacak-arka': [1225, 1650], kuyruk: [840, 1590], govde: [1100, 1880] };
j.bagli = { goz: 'kafa', agiz: 'kafa', 'goz-kapali': 'kafa' };
j.test = [
  { ad: 'evre-1', gizli: '', goster: '', aci: 'bacak-on=-20;bacak-arka=20;kol-on=14;kuyruk=8;kafa=-2', olcek: '' },
  { ad: 'evre-3', gizli: '', goster: '', aci: 'bacak-on=20;bacak-arka=-20;kol-on=-14;kuyruk=-8;kafa=2', olcek: '' },
  { ad: 'goz-kapali', gizli: 'goz', goster: 'goz-kapali', aci: 'kafa=4', olcek: '' },
  { ad: 'kuyruk', gizli: '', goster: '', aci: 'kuyruk=-18', olcek: '' },
];
fs.writeFileSync(d + 'inek-profil.json', JSON.stringify(j, null, 4)); console.log('inek ayar yazildi');
