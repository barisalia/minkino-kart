// Mino ve Kino için 6'şar dudak senkronu ağzı: SVG üret → Chromium ile 2048 saydam PNG
import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const req = createRequire('C:/Users/Minkex/Desktop/Minkino Games/package.json'); const { chromium } = req('playwright');
const OUT = 'C:/Users/Minkex/Desktop/Minkino Games/ekip/adobe-yanci/cikti/agiz'; const SVGDIR = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), 'svg');
fs.mkdirSync(SVGDIR, { recursive: true });
const st = (s, w) => `fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// ---------- MINO (merkez x=1024; burun altı 958) ----------
const M = { S: '#030102', I: '#75081e', T: '#ec7683', D: '#fff6ea', W: 12 };
const mPhil = `<line x1="1024" y1="958" x2="1024" y2="988" ${st(M.S, 12)}/>`;
const mOmegaD = 'M950,980c24.67,34.67,49.33,42.67,74,8c24.67,34.67,49.33,26.67,74,-8';
const mOmega = `<path d="${mOmegaD}" ${st(M.S, 12)}/>`;
const mAcikD = 'M950,980c24.67,34.67,49.33,42.67,74,8c24.67,34.67,49.33,26.67,74,-8 C1092,1112 956,1112 950,980 Z';   // orta ağız boşluğu
const mAzD = 'M998,1010 C1004,1050 1044,1050 1050,1010 Q1024,997 998,1010 Z';
const mDisD = 'M930,1000 Q1024,972 1118,1000 Q1024,1078 930,1000 Z';
const mino = {
  'agiz-gulumse': mPhil + mOmega,
  'agiz-kapali': mPhil + `<path d="M948,996 Q986,1012 1024,1005 Q1062,1012 1100,996" ${st(M.S, 12)}/>`,
  'agiz-az': mPhil + `<path d="${mAzD}" fill="${M.I}"/>` + mOmega + `<path d="${mAzD}" ${st(M.S, 12)}/>`,
  'agiz-orta': mPhil + `<clipPath id="mo"><path d="${mAcikD}"/></clipPath><path d="${mAcikD}" fill="${M.I}"/><ellipse cx="1024" cy="1086" rx="50" ry="32" fill="${M.T}" clip-path="url(#mo)"/>` + mOmega + `<path d="${mAcikD}" ${st(M.S, 12)}/>`,
  'agiz-yuvarlak': `<ellipse cx="1024" cy="1032" rx="64" ry="68" fill="${M.S}"/><ellipse cx="1024" cy="1032" rx="52" ry="56" fill="${M.I}"/><path d="M1024,1088c14.93,0,28.39-6.79,37.87-17.65-5.36-11.83-20.28-20.35-37.87-20.35s-32.52,8.52-37.87,20.35c9.48,10.86,22.94,17.65,37.87,17.65Z" fill="${M.T}"/>`,
  'agiz-dis': `<clipPath id="md"><path d="${mDisD}"/></clipPath><path d="${mDisD}" fill="${M.I}"/><g clip-path="url(#md)"><path d="M920,960 L1128,960 L1128,1022 Q1024,1008 920,1022 Z" fill="${M.D}"/><path d="M964,990 L964,1020 M994,984 L994,1016 M1024,982 L1024,1014 M1054,984 L1054,1016 M1084,990 L1084,1020" ${st(M.S, 4)}/><ellipse cx="1024" cy="1062" rx="40" ry="18" fill="${M.T}"/></g><path d="${mDisD}" ${st(M.S, 12)}/>`,
};

// ---------- KINO (merkez x=915; burun altı ~918) ----------
const K = { S: '#3a1210', I: '#3a1210', T: '#ec7683', D: '#ffffff' };
const kOmegaD = 'M790,912 Q852,968 915,922 Q978,968 1040,912';
const kOmega = `<path d="${kOmegaD}" ${st(K.S, 18)}/><path d="M772,902 L790,912" ${st(K.S, 12)}/><path d="M1058,902 L1040,912" ${st(K.S, 12)}/>`;
const kAzD = 'M885,938 C890,978 940,978 945,938 Q915,928 885,938 Z';
const kOrtaD = 'M840,941 Q878,956 915,922 Q952,956 990,941 C985,1140 845,1140 840,941 Z';
const kDisD = 'M800,935 Q915,918 1030,935 Q1046,965 1030,995 Q915,1012 800,995 Q784,965 800,935 Z';
const kino = {
  'agiz-gulumse': kOmega,
  'agiz-kapali': `<path d="M802,938 Q915,972 1028,938" ${st(K.S, 18)}/>`,
  'agiz-az': `<path d="${kAzD}" fill="${K.I}"/>` + kOmega + `<path d="${kAzD}" ${st(K.S, 14)}/>`,
  'agiz-orta': `<clipPath id="ko"><path d="${kOrtaD}"/></clipPath><path d="${kOrtaD}" fill="${K.I}"/><g clip-path="url(#ko)"><ellipse cx="915" cy="1080" rx="62" ry="48" fill="${K.T}"/><path d="M926,1040 Q938,1062 922,1090" ${st(K.S, 6)}/></g>` + kOmega + `<path d="${kOrtaD}" ${st(K.S, 16)}/>`,
  'agiz-yuvarlak': `<ellipse cx="915" cy="1000" rx="54" ry="76" fill="${K.I}" stroke="${K.S}" stroke-width="16"/><clipPath id="ky"><ellipse cx="915" cy="1000" rx="54" ry="76"/></clipPath><ellipse cx="915" cy="1072" rx="44" ry="28" fill="${K.T}" clip-path="url(#ky)"/>`,
  'agiz-dis': `<clipPath id="kd"><path d="${kDisD}"/></clipPath><path d="${kDisD}" fill="${K.I}"/><g clip-path="url(#kd)"><path d="M780,900 L1050,900 L1050,962 Q915,974 780,962 Z" fill="${K.D}"/><path d="M845,928 L845,966 M880,924 L880,968 M915,922 L915,969 M950,924 L950,968 M985,928 L985,966" ${st(K.S, 6)}/><ellipse cx="915" cy="1010" rx="52" ry="20" fill="${K.T}"/></g><path d="${kDisD}" ${st(K.S, 16)}/>`,
};

const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2048, height: 2048 }, deviceScaleFactor: 1 });
for (const [kar, set] of [['mino', mino], ['kino', kino]]) {
  fs.mkdirSync(path.join(OUT, kar), { recursive: true });
  for (const [ad, body] of Object.entries(set)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 2048 2048"><g id="${ad}">${body}</g></svg>`;
    fs.writeFileSync(path.join(SVGDIR, `${kar}-${ad}.svg`), svg);
    await pg.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`); await pg.waitForTimeout(100);
    const out = path.join(OUT, kar, `${ad}.png`); await pg.screenshot({ path: out, omitBackground: true }); console.log('yazildi', out);
  }
}
await b.close();
