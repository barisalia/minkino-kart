// ayi-profil.json.taslak -> ayi-profil.json (düzeltilmiş kol/bacak çokgenleri)
const fs = require('fs'); const d = __dirname + '/';
const j = JSON.parse(fs.readFileSync(d + 'ayi-profil.json.taslak', 'utf8').replace(/^﻿/, ''));
const KOL = 'p:826,1226,880,1212,960,1216,1022,1240,1024,1290,1018,1400,1014,1500,1004,1560,984,1600,940,1622,890,1622,848,1606,824,1548,812,1440,812,1330,818,1262';
const BON = 'p:792,1640,860,1655,960,1660,1030,1640,1066,1612,1064,1650,1058,1700,1050,1740,1043,1766,1070,1775,1088,1791,1099,1810,1106,1840,1107,1866,1084,1900,820,1912,792,1852,796,1740';
const BAR = 'p:1068,1606,1180,1604,1178,1735,1210,1750,1226,1790,1228,1862,1186,1866,1109,1864,1108,1830,1100,1802,1090,1782,1076,1778,1046,1768,1050,1740,1060,1700,1067,1650';
const set = (ad, s) => { for (const q of j.parcalar) if (q.ad === ad) q.sekil = s; for (const q of j.sert) if (q.ad === ad) q.sekil = s; };
const KUL = 'p:640,640,640,540,655,470,700,410,760,375,830,366,900,380,945,420,968,490,970,575,935,610,900,650,860,700,800,722,720,725,670,690';
for (const q of j.parcalar) if (q.ad === 'kulak-on') q.sekil = KUL;
set('kol-on', KOL); set('bacak-on', BON); set('bacak-arka', BAR);
j.tamamla = [{ ad: 'kafa', sekil: 'e:1195,860,80,98', renk: '#C97440', kontur: false }];   // kulak altı kafa dolgusu ayi-profil-son.ps1'de (harmonik, kürk renginden)
j.yumusat = [];
j.donme['kol-on'] = [925, 1290]; j.donme['bacak-on'] = [910, 1665]; j.donme['bacak-arka'] = [1125, 1665]; j.donme.govde = [980, 1900];
fs.writeFileSync(d + 'ayi-profil.json', JSON.stringify(j, null, 4));
console.log('ayar yazildi', j.sert.map((q) => q.ad).join(','));
