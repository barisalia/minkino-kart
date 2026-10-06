// Geliştirme: dış sahnede polaroid ortaya gelince kare çeker (tests/screens/giysin-polaroid.png)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 844, height: 390 } });
  await p.goto('http://localhost:4325/giysin/index.html?onizleme=1&ekran=disari', { timeout: 120000 });
  await p.locator('.gy-polaroid').waitFor({ timeout: 60000 });
  await p.waitForTimeout(1100);
  await p.screenshot({ path: 'tests/screens/giysin-polaroid.png' });
  await b.close();
})();
