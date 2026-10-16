/**
 * İlk cümle (kalite denetimi 2026-10-16, K1): kaydı olan hiçbir cümle cihazın robot sesiyle okunmaz.
 * Gerçek hızda (?test=1 yok) her oyun açılır; ilk dokunuş birkaç saniye sonra gelir (çocuk ekrana bakıyor).
 * speechSynthesis'e giden her cümle manifestle karşılaştırılır: kaydı olan cümle cihaz sesine düşmüşse test kırmızı.
 * Telefon: 844×390 yatay ve 390×844 dikey, DPR3.
 */
import { expect, test, type Page } from '@playwright/test';

const SAYFALAR: [string, string][] = [
  ['menü', './'],
  ['kartlar', './kartlar/'],
  ['pazar', './pazar/'],
  ['pasta', './pasta/'],
  ['dedektif', './dedektif/'],
  ['giysin', './giysin/'],
  ['mino-giysin', './mino-giysin/'],
  ['kino-otobus', './kino-otobus/'],
  ['canlan', './canlan/'],
  ['film', './film/'],
  ['macera', './macera/'],
  ['macera-dogumgunu', './macera/?onizleme=1&ekran=bolum&bolum=dogumgunu&yas=4'],
  ['macera-banyo', './macera/?onizleme=1&ekran=bolum&bolum=banyo&yas=4'],
  ['macera-ege', './macera/?onizleme=1&ekran=bolum&bolum=ege&yas=4'],
  ['macera-elektrik', './macera/?onizleme=1&ekran=bolum&bolum=elektrik&yas=4'],
  ['macera-salincak', './macera/?onizleme=1&ekran=bolum&bolum=salincak&yas=4'],
  ['uyku', './?uyku=1&saat=21'],
];

async function dinle(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __ses: { cihaz: string[]; kayit: number } };
    w.__ses = { cihaz: [], kayit: 0 };
    try {
      localStorage.setItem('minkino-macera-izin', '1');
    } catch {
      /* yok */
    }
    const ss = window.speechSynthesis;
    if (ss) {
      const asil = ss.speak.bind(ss);
      ss.speak = (u: SpeechSynthesisUtterance) => {
        if (u.text.trim()) w.__ses.cihaz.push(u.text.trim());
        return asil(u);
      };
    }
    const bas = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (this: AudioBufferSourceNode, ...a: Parameters<AudioBufferSourceNode['start']>) {
      if ((this.buffer?.duration ?? 0) > 0.4) w.__ses.kayit++;
      return bas.apply(this, a);
    };
  });
}

/** Ekranda düğme olmayan bir yere gerçek bir dokunuş (ses motoru açılır, oyunda hiçbir şey seçilmez). */
async function bosYereDokun(page: Page) {
  const nokta = await page.evaluate(() => {
    const W = innerWidth;
    const H = innerHeight;
    const etkin = 'button, a, input, [role="button"], [role="img"], .kart, .secenek, .pz-urun, svg, img, canvas';
    for (const fy of [0.5, 0.35, 0.65, 0.2, 0.8, 0.1, 0.9])
      for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85, 0.05, 0.95]) {
        const x = Math.round(W * fx);
        const yy = Math.round(H * fy);
        const e = document.elementFromPoint(x, yy);
        if (e && !e.closest(etkin)) return { x, y: yy };
      }
    return { x: 4, y: Math.round(H / 2) };
  });
  await page.mouse.click(nokta.x, nokta.y);
}

const etiketsiz = (t: string) => t.replace(/\[[^\]]*\]\s*/g, '').replace(/\s+/g, ' ').trim();

for (const [yon, vp] of [
  ['yatay', { width: 844, height: 390 }],
  ['dikey', { width: 390, height: 844 }],
] as const) {
  test.describe(`ilk cümle robot ses değil (${yon})`, () => {
    test.use({ viewport: vp, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    test.setTimeout(240_000);

    test('kaydı olan cümleler cihaz sesine düşmez', async ({ page }) => {
      await dinle(page);
      const m = await (await page.request.get('./ses/manifest.json')).json();
      const kayitli = new Set(Object.keys(m.dosyalar as Record<string, string>).map(etiketsiz));
      const bulgular: string[] = [];
      for (const [ad, yol] of SAYFALAR) {
        await page.goto(yol);
        // çocuk ekrana bakıyor: ilk dokunuş 2.5 sn sonra, boş bir yere (ses motoru açılır, hiçbir şey seçilmez)
        await page.waitForTimeout(2500);
        await bosYereDokun(page);
        await page.waitForTimeout(5500);
        const s = await page.evaluate(() => (window as unknown as { __ses: { cihaz: string[]; kayit: number } }).__ses);
        const robot = s.cihaz.filter((t) => kayitli.has(etiketsiz(t)));
        console.log(`${yon} ${ad}: kayıt ${s.kayit}, cihaz sesi ${s.cihaz.length} (kaydı olan: ${robot.length})${s.cihaz.length ? ` → ${s.cihaz.join(' | ')}` : ''}`);
        if (robot.length) bulgular.push(`${ad}: ${robot.join(' | ')}`);
      }
      expect(bulgular).toEqual([]);
    });
  });
}
