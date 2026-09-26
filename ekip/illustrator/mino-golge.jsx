// Mino: gövdeye sert kenarlı, az dozlu cel gölge (adım 1). Kafa/yüz/gözlere dokunmaz.
// Değişkenler (çağıran verir): KAYNAK (svg), CALISMA (.ai kayıt), ONIZLEME (png klasörü)
(function () {
  var doc = app.open(new File(KAYNAK));
  var L = doc.layers[0];
  var n = L.pageItems.length;
  for (var i = 0; i < n; i++) L.pageItems[i].name = 'p' + i;
  function p(i) { return L.pageItems.getByName('p' + i); }

  function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
  var TURUNCU_G = rgb(224, 122, 46);   // #E07A2E
  var KREM_G = rgb(230, 205, 181);     // #E6CDB5

  function boya(it, c) {
    if (it.typename === 'PathItem') { it.filled = true; it.fillColor = c; it.stroked = false; }
    else if (it.typename === 'CompoundPathItem') { for (var k = 0; k < it.pathItems.length; k++) boya(it.pathItems[k], c); }
    else if (it.typename === 'GroupItem') { for (var j = 0; j < it.pageItems.length; j++) boya(it.pageItems[j], c); }
  }
  // Pathfinder efekti yalnızca gruba uygulanır: arka (a) + ön (b) grupla, efekt uygula, genişlet.
  function pathfinder(a, b, komut) {
    var g = L.groupItems.add();
    a.move(g, ElementPlacement.PLACEATEND);
    b.move(g, ElementPlacement.PLACEATBEGINNING);
    doc.selection = null;
    g.selected = true;
    app.executeMenuCommand(komut);
    app.executeMenuCommand('expandStyle');
    return doc.selection.length ? doc.selection[0] : null;
  }
  function bitir(r, base, renk, ad) {
    if (!r) return null;
    boya(r, renk); r.name = ad;
    r.move(base, ElementPlacement.PLACEBEFORE);
    return r;
  }

  // base eksi (base'in dx,dy kaydırılmış kopyası) = kenar şeridi. dy>0 yukarı.
  function kenar(base, dx, dy, renk, ad) {
    var a = base.duplicate();
    var b = base.duplicate();
    b.translate(dx, dy);
    return bitir(pathfinder(a, b, 'Live Pathfinder Subtract'), base, renk, ad);
  }
  // base ile elipsin kesişimi. cx, cy: merkez (Illustrator koordinatı, y yukarı)
  function kesisim(base, cx, cy, rx, ry, renk, ad) {
    var a = base.duplicate();
    var e = L.pathItems.ellipse(cy + ry, cx - rx, rx * 2, ry * 2);
    return bitir(pathfinder(a, e, 'Live Pathfinder Intersect'), base, renk, ad);
  }
  function tekParca(it) {
    while (it && it.typename === 'GroupItem' && it.pageItems.length === 1) it = it.pageItems[0];
    return it;
  }
  // Düşen gölge: gölge yapanların birleşimi (dx,dy kaydırılmış) ile base'in kesişimi
  // (her gölge yapan parça için ayrı kesişim; sonuçlar tek grupta toplanır)
  function dusenGolge(base, yapanlar, dx, dy, renk, ad) {
    var toplu = L.groupItems.add();
    for (var i = 0; i < yapanlar.length; i++) {
      var u = yapanlar[i].duplicate();
      u.name = '';   // kopya asıl parçanın adını taşımasın
      u.translate(dx, dy);
      var a = base.duplicate();
      var r = pathfinder(a, u, 'Live Pathfinder Intersect');
      if (r) r.move(toplu, ElementPlacement.PLACEATEND);
    }
    if (!toplu.pageItems.length) { toplu.remove(); return null; }
    return bitir(toplu, base, renk, ad);
  }

  var govde = p(42), gobek = p(41), kolSol = p(17), kolSag = p(14);
  var kuyruk = p(40), ayakSol = p(23), ayakSag = p(20);
  var Y = function (svgY) { return 2048 - svgY; };

  var log = [];
  function kaydet(r, ad) { log.push(ad + (r ? ' ok' : ' YOK')); }

  // 1) Boyun / göğüs üstü (fuların altı): kafanın gövdeye düştüğü hilal
  //    = fuların gövdeye düşen gölgesi (fular şekli biraz aşağı-sağa kaydırılır)
  var fular = [p(4), p(6), p(24)]; // p(5) düğüm: kesişimde bozuk sonuç veriyor, gölgesi zaten uçta
  kaydet(dusenGolge(govde, fular, 8, -26, TURUNCU_G, 'g-boyun'), 'g-boyun');
  kaydet(dusenGolge(gobek, fular, 8, -26, KREM_G, 'g-gobek-ust'), 'g-gobek-ust');
  // 2) Gövdenin iki yanı + bacakların iç tarafı (sağ biraz geniş: ışık sol üstten)
  kaydet(kenar(govde, -22, 0, TURUNCU_G, 'g-govde-sag'), 'g-govde-sag');
  kaydet(kenar(govde, 9, 0, TURUNCU_G, 'g-govde-sol'), 'g-govde-sol');
  // 3) Bacak alt / ayak tabanına yakın
  kaydet(kenar(govde, 0, 16, TURUNCU_G, 'g-bacak-alt'), 'g-bacak-alt');
  kaydet(kenar(ayakSol, 0, 12, KREM_G, 'g-ayak-sol'), 'g-ayak-sol');
  kaydet(kenar(ayakSag, 0, 12, KREM_G, 'g-ayak-sag'), 'g-ayak-sag');
  // 4) Kolların gövdeye değen iç kenarı (sol kolun sağı, sağ kolun solu)
  kaydet(kenar(kolSol, -16, 0, TURUNCU_G, 'g-kol-sol'), 'g-kol-sol');
  kaydet(kenar(kolSag, 16, 0, TURUNCU_G, 'g-kol-sag'), 'g-kol-sag');
  // 5) Göbek kreminin yanları (ortası açık)
  kaydet(kenar(gobek, -12, 0, KREM_G, 'g-gobek-sag'), 'g-gobek-sag');
  kaydet(kenar(gobek, 10, 0, KREM_G, 'g-gobek-sol'), 'g-gobek-sol');
  // 6) Kuyruğun alt kenarı
  kaydet(kenar(kuyruk, 0, 16, TURUNCU_G, 'g-kuyruk-alt'), 'g-kuyruk-alt');

  // Beyaz zemin kalkar (şeffaf)
  p(103).remove();

  doc.selection = null;
  doc.saveAs(new File(CALISMA));

  function png(yol, olcek, zemin) {
    var bg = null;
    if (zemin) {
      bg = L.pathItems.rectangle(2048, 0, 2048, 2048);
      bg.filled = true; bg.stroked = false; bg.fillColor = zemin;
      bg.move(L, ElementPlacement.PLACEATEND);
    }
    var o = new ExportOptionsPNG24();
    o.antiAliasing = true; o.transparency = true; o.artBoardClipping = true;
    o.horizontalScale = olcek; o.verticalScale = olcek;
    doc.exportFile(new File(yol), ExportType.PNG24, o);
    if (bg) bg.remove();
  }
  png(ONIZLEME + '/mino-golge-onizleme.png', 50, null);
  png(ONIZLEME + '/mino-golge-onizleme-koyu.png', 50, rgb(40, 34, 48));
  png(ONIZLEME + '/mino-golge-onizleme-beyaz.png', 50, rgb(255, 255, 255));
  doc.save();
  return log.join(' | ');
})();
