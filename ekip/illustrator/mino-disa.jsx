// Mino teslim: SVG (Presentation Attributes, Layer Names, minify kapalı) + 2048 px şeffaf PNG.
// Değişkenler: SVG_YOL, PNG_YOL
(function () {
  var d = app.activeDocument;
  var EKLER = ['goz-kapali', 'agiz-acik', 'agiz-kapali'];
  // Degrade adları ASCII (SVG id'leri Türkçe karakter taşımasın)
  for (var gi = 0; gi < d.gradients.length; gi++) if (/Ads|degrade/i.test(d.gradients[gi].name)) d.gradients[gi].name = 'goz-degrade-' + (gi + 1);

  // SVG: tüm katmanlar görünür; 2048 tuval için geçici görünmez çerçeve (sonra SVG'den silinir)
  for (var i = 0; i < EKLER.length; i++) d.layers.getByName(EKLER[i]).visible = true;
  var tuval = d.layers.add(); tuval.name = 'tuval';
  var r = tuval.pathItems.rectangle(2048, 0, 2048, 2048); r.filled = false; r.stroked = false;
  tuval.zOrder(ZOrderMethod.SENDTOBACK);
  var s = new ExportOptionsWebOptimizedSVG();
  s.cssProperties = SVGCSSPropertyLocation.PRESENTATIONATTRIBUTES;
  s.svgId = SVGIdType.SVGIDREGULAR;
  s.svgMinify = false;
  s.svgResponsive = false;
  s.coordinatePrecision = 2;
  d.exportFile(new File(SVG_YOL), ExportType.WOSVG, s);
  tuval.remove();

  // PNG: ek katmanlar gizli, 2048 px, şeffaf
  for (var j = 0; j < EKLER.length; j++) d.layers.getByName(EKLER[j]).visible = false;
  var o = new ExportOptionsPNG24();
  o.antiAliasing = true; o.transparency = true; o.artBoardClipping = true; o.horizontalScale = 100; o.verticalScale = 100;
  d.exportFile(new File(PNG_YOL), ExportType.PNG24, o);
  d.save();
  return 'ok';
})();
