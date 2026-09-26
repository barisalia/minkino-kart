// Minkino — Recraft karakter görselini Illustrator'da vektöre çevirir, beyaz zemini atar.
// Turntable (Nesne → Turntable) için temiz kaynak üretir.
// Kullanım (PowerShell):
//   $ai = New-Object -ComObject Illustrator.Application
//   $ai.DoJavaScript("var GIRDI='C:/.../sincap.webp'; var CIKTI='C:/.../sincap-temiz.ai'; " + (Get-Content -Raw vektorlestir.jsx))
// GIRDI: .webp/.png (1024 kare, beyaz ya da şeffaf zemin). CIKTI: .ai (açık kalır, karakter seçili).

(function () {
  var BOY = 1024;
  var doc = app.documents.add(DocumentColorSpace.RGB, BOY, BOY);
  var resim = doc.placedItems.add();
  resim.file = new File(GIRDI);
  resim.position = [0, BOY];
  resim.width = BOY;
  resim.height = BOY;

  var iz = resim.trace();
  iz.tracing.tracingOptions.loadFromPreset('[High Fidelity Photo]');
  app.redraw();
  var grup = iz.tracing.expandTracing();

  // Beyaz zemin: beyaza yakın dolgulu VE (tuval kenarına değen YA DA büyük) parçalar.
  // Büyük = kuyruk ile kafa arası gibi kapalı zemin boşlukları (sincapta ~3000).
  // İçteki beyaz parlamalar (göz ışığı, parlak lekeler) küçük (< 700) olduğu için kalır.
  var BUYUK_BOSLUK = 1500;
  function beyazMi(renk) {
    if (renk.typename === 'RGBColor') return renk.red > 235 && renk.green > 235 && renk.blue > 235;
    if (renk.typename === 'GrayColor') return renk.gray < 8;
    return false;
  }
  function kenaraDegerMi(p) {
    var b = p.geometricBounds; // [sol, ust, sag, alt]
    var pay = 2;
    return b[0] <= pay || b[1] >= BOY - pay || b[2] >= BOY - pay || b[3] <= pay;
  }
  var silinen = 0;
  for (var i = grup.pathItems.length - 1; i >= 0; i--) {
    var p = grup.pathItems[i];
    if (p.filled && beyazMi(p.fillColor) && (kenaraDegerMi(p) || Math.abs(p.area) > BUYUK_BOSLUK)) { p.remove(); silinen++; }
  }
  for (var k = grup.compoundPathItems.length - 1; k >= 0; k--) {
    var c = grup.compoundPathItems[k];
    var ilk = c.pathItems.length ? c.pathItems[0] : null;
    if (ilk && ilk.filled && beyazMi(ilk.fillColor) && kenaraDegerMi(c)) { c.remove(); silinen++; }
  }

  doc.selection = null;
  grup.selected = true;
  doc.saveAs(new File(CIKTI));
  return 'parca: ' + (grup.pathItems.length + grup.compoundPathItems.length) + ', silinen beyaz: ' + silinen;
})();
