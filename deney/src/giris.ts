// Deneyler girişi (Barış, 23 Kasım 2026: "tamamlayın, kilitli bir şekilde açın"). Menü kartı Doktor'daki gibi tamamen premium
// (src/engine/erisim.ts → deney, deney/*). Sayfaya doğrudan gelinirse de öbür kilitli oyunlardaki aynı kilit anı açılır
// ("Büyükler için" → ebeveyn kapısı → abonelik). Abonelik alınırsa sayfa yeniden yüklenir; alınmazsa ana menüye dönülür.
// Kilitler yalnız mağaza uygulamasında etkin; web sitesinde her şey açık.
import { kilitli } from '../../src/engine/erisim';
import { anaMenuyeDon } from '../../src/uygulama';

function kilitliGiris(): void {
  document.getElementById('sahne')?.replaceChildren();
  document.body.dataset.durum = 'kilitli';
  const katman = document.createElement('div');
  katman.className = 'mk-kok mk-kilit-katmani';
  document.body.append(katman);
  void Promise.all([import('../../src/abonelik/kilit'), import('../../src/abonelik/ekran')])
    .then(([, e]) => e.kilitliIcerik(katman))
    .then((alindi) => { katman.remove(); if (alindi && !kilitli('deney')) location.reload(); else anaMenuyeDon(); }, () => anaMenuyeDon());
}
function ac(): void {
  void import('./parkur/main');
}
if (kilitli('deney')) kilitliGiris(); else ac();
