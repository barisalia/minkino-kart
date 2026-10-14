// Minkino — beyaz zeminli raster PNG → "16 Renk" izli düz vektör (Dönen tabla kaynağı). Belge boyu = resim boyu (en-boy korunur).
// Zemin beyazı silinir: beyaz dolgulu parça tuval kenarına değiyorsa ya da merkezi zemin maskesindeyse (karakterin beyaz yüzü/gövdesi kalır).
// Değişkenler: GIRDI (png), CIKTI (.ai), W, H (px), MASKE ('1' = zemin), MW, MH, IZ (ızgara px), ONAYAR (varsayılan '16 Renk')
(function () {
  var doc = app.documents.add(DocumentColorSpace.RGB, W, H);
  var resim = doc.placedItems.add();
  resim.file = new File(GIRDI);
  resim.position = [0, H];
  resim.width = W;
  resim.height = H;
  var iz = resim.trace();
  iz.tracing.tracingOptions.loadFromPreset(typeof ONAYAR === 'string' ? ONAYAR : '16 Renk');
  app.redraw();
  var grup = iz.tracing.expandTracing();
  function beyazMi(renk) {
    if (renk.typename === 'RGBColor') return renk.red > 235 && renk.green > 235 && renk.blue > 235;
    if (renk.typename === 'GrayColor') return renk.gray < 8;
    return false;
  }
  function kenaraDegerMi(b) { var pay = 2; return b[0] <= pay || b[1] >= H - pay || b[2] >= W - pay || b[3] <= pay; }
  function merkezZeminMi(b) {
    var x = (b[0] + b[2]) / 2, y = H - (b[1] + b[3]) / 2, i = Math.floor(y / IZ), j = Math.floor(x / IZ);
    if (i < 0 || j < 0 || i >= MH || j >= MW) return true;
    return MASKE.charAt(i * MW + j) === '1';
  }
  var silinen = 0;
  for (var i = grup.pathItems.length - 1; i >= 0; i--) {
    var p = grup.pathItems[i];
    if (!(p.filled && beyazMi(p.fillColor))) continue;
    if (kenaraDegerMi(p.geometricBounds) || merkezZeminMi(p.geometricBounds)) { p.remove(); silinen++; }
  }
  for (var k = grup.compoundPathItems.length - 1; k >= 0; k--) {
    var c = grup.compoundPathItems[k], ilk = c.pathItems.length ? c.pathItems[0] : null;
    if (ilk && ilk.filled && beyazMi(ilk.fillColor) && (kenaraDegerMi(c.geometricBounds) || merkezZeminMi(c.geometricBounds))) { c.remove(); silinen++; }
  }
  doc.selection = null;
  doc.saveAs(new File(CIKTI));
  return 'parca: ' + (grup.pathItems.length + grup.compoundPathItems.length) + ', silinen beyaz: ' + silinen;
})();
