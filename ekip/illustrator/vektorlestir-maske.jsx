// Minkino — vektorlestir.jsx'in maskeli sürümü: iç beyazları (yaka, göz akı, beyaz ayakkabı) korur.
// Beyaz parça yalnız şu durumlarda silinir: tuval kenarına değiyorsa YA DA büyükse VE merkezi gerçekten zemindeyse.
// Zemin maskesi: şeffaf PNG'nin alfa kanalından 128x128 '0/1' dizisi (1 = zemin), MASKE değişkeniyle verilir.
// Kullanım: $ai.DoJavaScript("var GIRDI='...-on-beyaz.png'; var CIKTI='...-temiz.ai'; var MASKE='0101...'; " + (Get-Content -Raw vektorlestir-maske.jsx))

(function () {
  var BOY = 1024, MN = 128;
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
  function merkezZeminMi(p) {
    var b = p.geometricBounds, x = (b[0] + b[2]) / 2, y = BOY - (b[1] + b[3]) / 2;
    var i = Math.floor(y / (BOY / MN)), j = Math.floor(x / (BOY / MN));
    if (i < 0 || j < 0 || i >= MN || j >= MN) return true;
    return MASKE.charAt(i * MN + j) === '1';
  }
  var silinen = 0, korunan = 0;
  for (var i = grup.pathItems.length - 1; i >= 0; i--) {
    var p = grup.pathItems[i];
    if (!(p.filled && beyazMi(p.fillColor))) continue;
    if (kenaraDegerMi(p) || (Math.abs(p.area) > BUYUK_BOSLUK && merkezZeminMi(p))) { p.remove(); silinen++; }
    else if (Math.abs(p.area) > BUYUK_BOSLUK) korunan++;
  }
  for (var k = grup.compoundPathItems.length - 1; k >= 0; k--) {
    var c = grup.compoundPathItems[k];
    var ilk = c.pathItems.length ? c.pathItems[0] : null;
    if (ilk && ilk.filled && beyazMi(ilk.fillColor) && kenaraDegerMi(c)) { c.remove(); silinen++; }
  }

  doc.selection = null;
  grup.selected = true;
  doc.saveAs(new File(CIKTI));
  return 'parca: ' + (grup.pathItems.length + grup.compoundPathItems.length) + ', silinen beyaz: ' + silinen + ', korunan ic beyaz: ' + korunan;
})();
