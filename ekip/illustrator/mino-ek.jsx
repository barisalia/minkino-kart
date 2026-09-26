// Mino adım 3: gizli ek katmanlar (goz-kapali, agiz-acik, agiz-kapali). Katmanlı belgenin üstüne eklenir.
(function () {
  var doc = app.activeDocument;
  function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
  var KONTUR = rgb(58, 18, 16), AGIZ_CIZGI = rgb(3, 1, 2), AGIZ_IC = rgb(117, 8, 30), DIL = rgb(236, 118, 131);
  var Y = function (svgY) { return 2048 - svgY; };

  function katman(ad) { var l = doc.layers.add(); l.name = ad; return l; }
  function cizgiAyar(p, renk, kalinlik) {
    p.filled = false; p.stroked = true; p.strokeColor = renk; p.strokeWidth = kalinlik;
    p.strokeCap = StrokeCap.ROUNDENDCAP; p.strokeJoin = StrokeJoin.ROUNDENDJOIN;
  }
  // (x1,y1)→(x2,y2) aşağı sarkan yay (svg koordinatı); sarkma = en derin noktanın inişi
  function yay(ly, x1, y1, x2, y2, sarkma, renk, kalinlik) {
    var p = ly.pathItems.add();
    p.setEntirePath([[x1, Y(y1)], [x2, Y(y2)]]);
    var h = sarkma / 0.75, w = (x2 - x1) / 3;
    var a = p.pathPoints[0], b = p.pathPoints[1];
    a.rightDirection = [x1 + w, Y(y1 + h)]; a.leftDirection = a.anchor;
    b.leftDirection = [x2 - w, Y(y2 + h)]; b.rightDirection = b.anchor;
    cizgiAyar(p, renk, kalinlik);
    return p;
  }
  function cizgi(ly, x1, y1, x2, y2, renk, kalinlik) {
    var p = ly.pathItems.add();
    p.setEntirePath([[x1, Y(y1)], [x2, Y(y2)]]);
    cizgiAyar(p, renk, kalinlik);
    return p;
  }
  function elips(ly, cx, cy, w, h, renk) {
    var e = ly.pathItems.ellipse(Y(cy - h / 2), cx - w / 2, w, h);
    e.filled = true; e.fillColor = renk; e.stroked = false;
    return e;
  }

  // goz-kapali: iki gözün kapalı hâli (aşağı yay + dış köşede küçük kirpik), irislerin ortası hizasında
  var gk = katman('goz-kapali');
  yay(gk, 646, 878, 890, 878, 30, KONTUR, 16);
  cizgi(gk, 646, 878, 612, 858, KONTUR, 14);
  yay(gk, 1160, 880, 1404, 880, 30, KONTUR, 16);
  cizgi(gk, 1404, 880, 1438, 860, KONTUR, 14);

  // agiz-acik: "Aaa" (koyu çerçeve + iç ağız + dil). Burnun altı.
  var aa = katman('agiz-acik');
  elips(aa, 1024, 1032, 128, 136, AGIZ_CIZGI);
  var ic = elips(aa, 1024, 1032, 104, 112, AGIZ_IC);
  // dil: iç ağızla kesişen alt elips
  var dil = elips(aa, 1024, 1080, 80, 60, DIL);
  var g = aa.groupItems.add();
  ic.duplicate().move(g, ElementPlacement.PLACEATEND);
  dil.move(g, ElementPlacement.PLACEATBEGINNING);
  doc.selection = null; g.selected = true;
  app.executeMenuCommand('Live Pathfinder Intersect');
  app.executeMenuCommand('expandStyle');
  var dilSon = doc.selection.length ? doc.selection[0] : null;
  if (dilSon) dilSon.move(ic, ElementPlacement.PLACEBEFORE);

  // agiz-kapali: ω kapalı gülümseme + burundan inen kısa çizgi
  var ak = katman('agiz-kapali');
  cizgi(ak, 1024, 958, 1024, 988, AGIZ_CIZGI, 12);
  yay(ak, 950, 980, 1024, 988, 26, AGIZ_CIZGI, 12);
  yay(ak, 1024, 988, 1098, 980, 26, AGIZ_CIZGI, 12);

  doc.selection = null;
  doc.save();
  var o = [];
  for (var i = 0; i < doc.layers.length; i++) o.push(doc.layers[i].name);
  return 'katmanlar ustten: ' + o.join(', ');
})();
