// Mino: gölgeli çalışma belgesini animasyon katmanlarına ayırır (adım 2).
// Tek parça koyu silüet (p102) her katman için "silüet ∩ parçanın D kadar genişletilmiş hâli" olarak bölünür.
// Değişkenler: CALISMA (.ai, gölgeli), CIKTI_AI (.ai), D (kontur payı, px)
(function () {
  var doc = null;
  for (var i = 0; i < app.documents.length; i++) if (app.documents[i].fullName.fsName === new File(CALISMA).fsName) doc = app.documents[i];
  if (!doc) doc = app.open(new File(CALISMA));
  app.activeDocument = doc;
  var L = doc.layers[0];
  // Yalnız üst düzey öğeler: gölge gruplarının içinde aynı adı taşıyan kopyalar var (p4 vb.)
  var UST = {};
  for (var ui = 0; ui < L.pageItems.length; ui++) {
    var uo = L.pageItems[ui];
    if (uo.parent.typename === 'Layer' && uo.name && !UST[uo.name]) UST[uo.name] = uo;
  }
  function p(i) { return UST['p' + i]; }
  function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
  var KONTUR = rgb(58, 18, 16);
  var TURUNCU = rgb(250, 158, 60);
  var Y = function (svgY) { return 2048 - svgY; };

  function boya(it, c) {
    if (it.typename === 'PathItem') { it.filled = true; it.fillColor = c; it.stroked = false; }
    else if (it.typename === 'CompoundPathItem') { for (var k = 0; k < it.pathItems.length; k++) boya(it.pathItems[k], c); }
    else if (it.typename === 'GroupItem') { for (var j = 0; j < it.pageItems.length; j++) boya(it.pageItems[j], c); }
  }
  function tekParca(it) {
    while (it && it.typename === 'GroupItem' && it.pageItems.length === 1) it = it.pageItems[0];
    return it;
  }
  function pathfinder(a, b, komut) {
    var g = L.groupItems.add();
    a.move(g, ElementPlacement.PLACEATEND);
    b.move(g, ElementPlacement.PLACEATBEGINNING);
    doc.selection = null; g.selected = true;
    app.executeMenuCommand(komut);
    app.executeMenuCommand('expandStyle');
    return doc.selection.length ? tekParca(doc.selection[0]) : null;
  }
  function ofset(it, d) {
    var k = it.duplicate();
    k.applyEffect('<LiveEffect name="Adobe Offset Path"><Dict data="R mlim 4 R ofst ' + d + ' I jntp 0 "/></LiveEffect>');
    doc.selection = null; k.selected = true;
    app.executeMenuCommand('expandStyle');
    return tekParca(doc.selection[0]);
  }
  var siluet = p(102);
  var KOL_KONTUR = 13, GOVDE_KONTUR = 14;
  var log = [];
  function icinde(rb, sb) { return rb && rb[0] >= sb[0] - 1 && rb[1] <= sb[1] + 1 && rb[2] <= sb[2] + 1 && rb[3] >= sb[3] - 1; }
  function sinir(it) { var b = it.geometricBounds; return [b[0], b[1], b[2], b[3]]; }
  // r'den (arkadaki katmanların renkli) şekilleri çıkar: Minus Front, en arkadaki r kalır.
  function eksi(r, sekiller, ad, pay) {
    if (!sekiller.length) return r;
    var sb = sinir(r);
    var yedek = r.duplicate();
    var g = L.groupItems.add();
    r.move(g, ElementPlacement.PLACEATEND);
    for (var i = 0; i < sekiller.length; i++) (pay ? ofset(sekiller[i], pay) : sekiller[i].duplicate()).move(g, ElementPlacement.PLACEATBEGINNING);
    doc.selection = null; g.selected = true;
    app.executeMenuCommand('Live Pathfinder Subtract');
    app.executeMenuCommand('expandStyle');
    var s = doc.selection.length ? tekParca(doc.selection[0]) : null;
    if (!s) { yedek.remove(); log.push(ad + ':bos'); return null; }        // tamamen arkada kaldı
    if (!icinde(sinir(s), sb)) { s.remove(); log.push(ad + ':eksi-bozuk'); return yedek; }
    yedek.remove();
    return kirintiSil(s, ad);
  }
  // Çıkarmadan kalan kıymık gibi küçük parçaları sil (parça oynayınca görünmesinler)
  var KIRINTI = 150;
  function kirintiSil(it, ad) {
    var n = 0;
    function tara(x) {
      if (x.typename === 'CompoundPathItem') {
        for (var k = x.pathItems.length - 1; k >= 0; k--) if (Math.abs(x.pathItems[k].area) < KIRINTI && x.pathItems.length > 1) { x.pathItems[k].remove(); n++; }
      } else if (x.typename === 'GroupItem') {
        for (var j = x.pageItems.length - 1; j >= 0; j--) {
          var c = x.pageItems[j];
          if (c.typename === 'PathItem' && Math.abs(c.area) < KIRINTI && x.pageItems.length > 1) { c.remove(); n++; }
          else tara(c);
        }
      }
    }
    tara(it);
    if (n) log.push(ad + ':kirinti' + n);
    return it;
  }
  // Katmanın kontur altlığı: (silüet ∩ genişletilmiş parça) − arkadaki katmanların renkli şekilleri.
  // Kesişim bozuk çıkarsa (sınır taşarsa) düz genişletme kullanılır.
  function altlik(surucu, d, arkadakiler, ad, pay) {
    var o = ofset(surucu, d);
    var sb = sinir(o);
    var yedek = o.duplicate();
    var r = pathfinder(siluet.duplicate(), o, 'Live Pathfinder Intersect');
    if (!(r && icinde(sinir(r), sb))) { if (r) r.remove(); r = yedek; log.push(ad + ':duz'); } else { yedek.remove(); log.push(ad + ':ok'); }
    r = eksi(r, arkadakiler, ad, pay);
    if (!r) return null;
    boya(r, KONTUR); r.name = 'kontur';
    return r;
  }

  // Grup üyeleri (kaynak indeksleri)
  function aralik(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  var UYE = {
    'kuyruk': [37, 38, 39, 40],
    'govde': [0, 1, 18, 19, 20, 21, 22, 23, 41, 42],
    'kol-sol': [10, 11, 15, 16, 17],
    'kol-sag': [7, 8, 9, 12, 13, 14],
    'fular': [4, 5, 6, 24],
    'kafa': [2, 3].concat(aralik(25, 36), [43, 44, 45], aralik(52, 60), [90, 91, 92, 93, 94, 98, 99, 100, 101]),
    'goz-sol': [47, 48].concat(aralik(61, 64), aralik(79, 89)),
    'goz-sag': [46, 49, 50, 51].concat(aralik(65, 78)),
    'agiz': [95, 96, 97]
  };
  var GOLGE = {
    'kuyruk': ['g-kuyruk-alt'],
    'govde': ['g-boyun', 'g-gobek-ust', 'g-govde-sag', 'g-govde-sol', 'g-bacak-alt', 'g-ayak-sol', 'g-ayak-sag', 'g-gobek-sag', 'g-gobek-sol'],
    'kol-sol': ['g-kol-sol'],
    'kol-sag': ['g-kol-sag']
  };
  var SURUCU = {
    'kuyruk': [40], 'govde': [42, 20, 23], 'kol-sol': [17, 11], 'kol-sag': [14, 9],
    'fular': [4, 5, 6, 24],
    'kafa': [101, 28, 32, 2, 3, 27, 31, 34, 36, 55, 57]   // kulak alt yanları ve pembe iç kulak kafa şeklinin dışına taşıyor
  };
  // Konturundan çıkarılacak, arkadaki katmanların renkli şekilleri (duruşta görüntü aynı kalsın diye)
  var GOVDE_R = [42, 41, 20, 23], KUYRUK_R = [40, 37, 38, 39], KOLSOL_R = [17, 11], KOLSAG_R = [14, 9];
  var FULAR_R = [4, 6, 24, 5], BOYUN_R = [0, 1];
  var ARKA = {
    'kuyruk': [],
    'govde': KUYRUK_R,
    'kol-sol': GOVDE_R.concat(KUYRUK_R),
    'kol-sag': GOVDE_R.concat(KUYRUK_R, KOLSOL_R),
    'fular': GOVDE_R.concat(KUYRUK_R, KOLSOL_R, KOLSAG_R, BOYUN_R),
    'kafa': GOVDE_R.concat(KUYRUK_R, KOLSOL_R, KOLSAG_R, FULAR_R, BOYUN_R)
  };
  function oge(liste) { var r = []; for (var i = 0; i < liste.length; i++) r.push(p(liste[i])); return r; }
  var SIRA = ['kuyruk', 'govde', 'kol-sol', 'kol-sag', 'fular', 'kafa', 'goz-sol', 'goz-sag', 'agiz'];

  // Hangi öğe hangi gruba
  var hedef = {};
  for (var g = 0; g < SIRA.length; g++) {
    var ad = SIRA[g];
    for (var u = 0; u < UYE[ad].length; u++) hedef['p' + UYE[ad][u]] = ad;
    if (GOLGE[ad]) for (var s = 0; s < GOLGE[ad].length; s++) hedef[GOLGE[ad][s]] = ad;
  }

  // 1) Kontur altlıkları (henüz ana katmanda)
  var altliklar = {};
  for (var g2 in SURUCU) {
    altliklar[g2] = [];
    for (var k = 0; k < SURUCU[g2].length; k++) {
      var al;
      if (g2 === 'kol-sol' || g2 === 'kol-sag') {
        // Kollar: silüetten kesilmez; kol ve patinin çevresi boyunca eşit kalınlıkta kendi konturu.
        // Yalnız arkadaki gövdenin rengi çıkarılır: duruşta gövdeye değen çizgi kaynaktaki kadar kalır,
        // kol kalkınca da her kenarda kontur olur (kıymık yok).
        // Kaynakta kolun dış çizgisi 12-14 px, kol-gövde arası 9-12 px (ölçüldü): her kenarda eşit 13 px,
        // hiçbir şey çıkarılmaz (omuzda çentik/basamak olmasın). Duruşta kol-gövde çizgisi en çok 3 px kalınlaşır.
        al = ofset(p(SURUCU[g2][k]), KOL_KONTUR);
        if (al) { boya(al, KONTUR); al.name = 'kontur'; log.push(g2 + '/p' + SURUCU[g2][k] + ':kol'); }
      } else {
        // Gövde konturu kaynakta 11-13 px: 14 px ile genişletilir (16 px patinin konturundan kıymık kapıyordu)
        var dd = (g2 === 'govde') ? GOVDE_KONTUR : D;
        al = altlik(p(SURUCU[g2][k]), dd, oge(ARKA[g2]), g2 + '/p' + SURUCU[g2][k], 0);
      }
      if (al) altliklar[g2].push(al);
    }
  }

  // 2) Boyun uzantısı (gövdede, kafanın ve fuların altında gizli; kafa oynayınca boşluk görünmesin)
  var boyun = L.pathItems.roundedRectangle(Y(1105), 885, 270, 200, 70, 70);
  boya(boyun, TURUNCU); boyun.name = 'boyun';
  var boyunKontur = ofset(boyun, D); boya(boyunKontur, KONTUR); boyunKontur.name = 'kontur';

  // 3) Katmanları arkadan öne oluştur (her add en üste gelir)
  var katman = {};
  for (var g3 = 0; g3 < SIRA.length; g3++) { var ly = doc.layers.add(); ly.name = SIRA[g3]; katman[SIRA[g3]] = ly; }

  // 4) Öğeleri yukarıdan aşağı sırayla taşı (PLACEATEND sırayı korur)
  var liste = [];
  for (var i2 = 0; i2 < L.pageItems.length; i2++) if (L.pageItems[i2].parent.typename === 'Layer') liste.push(L.pageItems[i2]);
  var eksik = [];
  for (var j2 = 0; j2 < liste.length; j2++) {
    var it = liste[j2];
    var h = hedef[it.name];
    if (h) it.move(katman[h], ElementPlacement.PLACEATEND);
  }
  // 5) Boyun ve kontur altlıkları katmanların en altına
  boyun.move(katman['govde'], ElementPlacement.PLACEATEND);
  boyunKontur.move(katman['govde'], ElementPlacement.PLACEATEND);
  for (var g4 in altliklar) for (var a2 = 0; a2 < altliklar[g4].length; a2++) altliklar[g4][a2].move(katman[g4], ElementPlacement.PLACEATEND);

  // 6) Artık tek parça silüet gereksiz
  siluet.remove();
  // Pathfinder'dan kalan boş gruplar
  for (var r1 = L.groupItems.length - 1; r1 >= 0; r1--) if (L.groupItems[r1].pageItems.length === 0) L.groupItems[r1].remove();
  for (var r2 = 0; r2 < L.pageItems.length; r2++) eksik.push(L.pageItems[r2].name + '/' + L.pageItems[r2].typename);
  if (!eksik.length) L.remove();

  // 7) Adları temizle (SVG'de gereksiz id olmasın); katman adları kalır
  for (var q = 0; q < doc.layers.length; q++) {
    var its = doc.layers[q].pageItems;
    for (var w = 0; w < its.length; w++) its[w].name = '';
  }
  doc.selection = null;
  doc.saveAs(new File(CIKTI_AI));
  var ozet = [];
  for (var z = 0; z < doc.layers.length; z++) ozet.push(doc.layers[z].name + '(' + doc.layers[z].pageItems.length + ')');
  return 'katmanlar ustten: ' + ozet.join(' ') + ' | kalan: ' + eksik.join(',') + ' | ' + log.join(' ');
})();
