// İngilizceye Merhaba · gerçek hızda ders denemesi (test modu olmadan): 1. dersi bir çocuğun yapacağı gibi, söz bitince
// dokunarak ve doğru cevaplarla oynatır. Çalınan her kaydı, adım sürelerini ve toplam ders süresini yazar.
// Kullanım: node scripts/ingilizce-gercek-hiz.mjs   (önizleme sunucusu açık olmalı)
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 1024, height: 768 } });
const hatalar = [];
p.on('pageerror', (e) => hatalar.push('SAYFA ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') hatalar.push(m.text().slice(0, 160)); });
await p.addInitScript(() => {
  window.__calinan = [];
  const asil = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const ad = (this.src.split('/').pop() || '').slice(0, 40);
    const kayit = { ad, basladi: false, bitti: false, hata: '' };
    if (!this.src.startsWith('data:')) window.__calinan.push(kayit);
    this.addEventListener('playing', () => { kayit.basladi = true; }, { once: true });
    this.addEventListener('ended', () => { kayit.bitti = true; }, { once: true });
    return asil.call(this).catch((e) => { kayit.hata = e.name; throw e; });
  };
});
const tik = { force: true, timeout: 4000 };
await p.goto('http://localhost:5173/ingilizce/', { waitUntil: 'networkidle' });
await p.evaluate(() => localStorage.removeItem('minkino-ingilizce-v1'));
await p.reload({ waitUntil: 'networkidle' });
const t0 = Date.now();
const sn = () => ((Date.now() - t0) / 1000).toFixed(0).padStart(3);
await p.locator('.ing-devam').click(tik);
let onceki = '';
const adim = () => p.evaluate(() => document.querySelector('.ing')?.dataset.adim ?? '');
const konusuyor = () => p.evaluate(() => !!document.documentElement.dataset.konusan);
const sonKelime = (secici) => p.evaluate((s) => (document.querySelector(s)?.textContent || '').replace(/[?.!]/g, '').trim().split(' ').pop().toLowerCase(), secici);
for (let tur = 0; tur < 900; tur++) {
  const a = await adim();
  if (a !== onceki) { console.log(sn(), 'sn →', a); onceki = a; }
  if (a === 'sonuc') break;
  if (!(await konusuyor())) {
    if (a === 'selam' || a === 'veda') await p.locator('.ing-el-salla:not([hidden])').click(tik).catch(() => {});
    else if (a === 'tanis') {
      if (await p.locator('.ing-kapak:not(.ing-acik)').count()) await p.locator('.ing-kapak').click(tik).catch(() => {});
      else if (await p.locator('.ing-yildiz-dugme:not([hidden])').count()) await p.locator('.ing-yildiz-dugme').click(tik).catch(() => {});
    } else if (a === 'bul' || a === 'tekrar') {
      await p.locator(`.ing-secim[data-kelime="${await sonKelime('.ing-soru')}"]`).click(tik).catch(() => {});
    } else if (a === 'ogret') {
      if (await p.locator('.ing-oylar:not([hidden])').count()) {
        const karttaki = await p.evaluate(() => document.querySelector('.ing-kino-kart .ing-resim')?.dataset.kelime);
        await p.locator((await sonKelime('.ing-sinif .ing-soz-balonu')) === karttaki ? '.ing-evet' : '.ing-hayir').click(tik).catch(() => {});
      } else await p.locator(`.ing-secim[data-kelime="${await sonKelime('.ing-sinif .ing-soz-balonu')}"]`).click(tik).catch(() => {});
    } else if (a === 'soyle') { if (await p.locator('.ing-yildiz-dugme:not([hidden])').count()) await p.locator('.ing-yildiz-dugme').click(tik).catch(() => {}); }
  }
  await p.waitForTimeout(350);
}
console.log(sn(), 'sn: ders bitti. Kayıt:', await p.evaluate(() => localStorage.getItem('minkino-ingilizce-v1')));
const calinan = await p.evaluate(() => window.__calinan);
const sorunlu = calinan.filter((c) => !c.basladi || c.hata);
console.log('çalınan kayıt:', calinan.length, '| çalmayan:', sorunlu.length, sorunlu.map((c) => c.ad + ':' + c.hata).join(' '));
console.log('sıra:', calinan.map((c) => c.ad.replace('.mp3', '')).join(' › '));
console.log('HATALAR', JSON.stringify([...new Set(hatalar)]));
await p.screenshot({ path: 'output/ingilizce/ekran/gercek-sonuc.png' });
await b.close();
