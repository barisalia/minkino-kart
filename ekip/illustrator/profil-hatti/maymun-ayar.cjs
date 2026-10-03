// maymun-profil.json.taslak -> maymun-profil.json (ölçülen siluet/kontur çokgenleri; köpek/ayı standardı)
const fs = require('fs'); const d = __dirname + '/';
const j = JSON.parse(fs.readFileSync(d + 'maymun-profil.json.taslak', 'utf8').replace(/^\uFEFF/, ''));
const KOL = 'p:1062,1176,1130,1186,1182,1232,1186,1300,1168,1360,1172,1440,1190,1500,1192,1550,1184,1610,1160,1660,1100,1672,1050,1668,1010,1640,1006,1596,1030,1556,1022,1470,1018,1400,1022,1330,1030,1280,1046,1240,1054,1208';
const BON = 'p:1000,1640,1100,1650,1205,1630,1218,1640,1216,1680,1209,1700,1200,1730,1192,1760,1182,1782,1176,1796,1200,1801,1238,1803,1264,1813,1277,1826,1283,1840,1287,1858,1272,1884,1252,1902,1130,1902,1040,1894,1010,1862,1008,1830,1020,1790,1024,1740,1018,1690,1008,1660';
const BAR = 'p:1222,1636,1312,1624,1308,1660,1296,1700,1281,1740,1268,1762,1292,1774,1340,1782,1366,1796,1380,1815,1380,1838,1372,1856,1360,1860,1290,1862,1288,1850,1283,1834,1272,1820,1260,1810,1238,1799,1196,1796,1186,1786,1192,1750,1203,1710,1214,1670';
const EAR = 'e:1052,852,114,170';
const set = (ad, s) => { for (const q of j.parcalar) if (q.ad === ad) q.sekil = s; for (const q of (j.sert || [])) if (q.ad === ad) q.sekil = s; };
set('kol-on', KOL); set('bacak-on', BON); set('bacak-arka', BAR);
for (const q of j.parcalar) if (q.ad === 'kulak-on') { q.sekil = EAR; q.ozel = true; q.kes = false; }
j.sert = [{ ad: 'bacak-on', sekil: BON }, { ad: 'bacak-arka', sekil: BAR }, { ad: 'kol-on', sekil: KOL }];
j.tamamla = [{ ad: 'kafa', sekil: 'e:1380,790,58,72', renk: '#FDC089', kontur: false }, { ad: 'kafa', sekil: 'p:1385,935,1420,965,1480,975,1530,950,1560,940,1540,990,1480,1015,1420,1005', renk: '#FDBF86', kontur: false }];   // göz ve ağız yuvaları; kulak altı, gövde altı, kökler maymun-profil-son.ps1'de
j.yumusat = [];
j.donme['kol-on'] = [1090, 1230]; j.donme['bacak-on'] = [1100, 1685]; j.donme['bacak-arka'] = [1250, 1700]; j.donme.kuyruk = [960, 1590]; j.donme['kulak-on'] = [1052, 852];
fs.writeFileSync(d + 'maymun-profil.json', JSON.stringify(j, null, 4));
console.log('ayar yazildi');
