import { test } from '@playwright/test';
const ON = process.env.ONEK ?? 'once';
const BOY: [number, number][] = [[844, 390], [932, 430], [390, 844], [1024, 768]];
const HEPSI =
  'kac-elma,sayi-karti,sepete-koy,hangisinde-cok,bir-fazla,merdiven,kac-alkis,rakam-ciz,kuslar,piknik,ses-a,ses-n,ses-e,ses-t,ses-i,ses-l,kelime-dinle,kelime-hecele,kelime-boya,kelime-grup,kelime-eksik,kelime-tersi';
const EKR: [string, string][] = [
  ['harita', 'ekran=acilis'],
  ['harita-rozet', `ekran=acilis&biten=${HEPSI}`],
  ['bahce', 'ekran=bolge&bolge=sayi'],
  ['kule', 'ekran=bolge&bolge=ses'],
  ['kopru', 'ekran=bolge&bolge=kelime'],
  ['album', `ekran=album&biten=${HEPSI}`],
  ...HEPSI.split(',').map((e) => [e, `etkinlik=${e}`] as [string, string]),
  ['sonuc', 'etkinlik=kac-elma&ekran=sonuc'],
];
const SADECE = process.env.SADECE?.split(',');
const BOYLAR = process.env.BOYLAR?.split(',');
for (const [w, hh] of BOY)
  test(`${w}x${hh}`, async ({ page }) => {
    if (BOYLAR && !BOYLAR.includes(`${w}x${hh}`)) return;
    await page.setViewportSize({ width: w, height: hh });
    for (const [ad, q] of EKR) {
      if (SADECE && !SADECE.includes(ad)) continue;
      await page.goto(`/okul/?test=1&sifirla=1&yas=5&tohum=3&${q}`);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `tests/screens/cila4/${ON}-${ad}-${w}x${hh}.png` });
    }
  });
