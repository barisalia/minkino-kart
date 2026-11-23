// Doktor-K1 tam boy önizleme sayfasının betiği (bagla.ts bunu sayfaya gömer). Veri: #veri içindeki JSON.
(() => {
  const V = JSON.parse(document.getElementById('veri').textContent);
  const kok = document.getElementById('kok');
  const C = Object.fromEntries(V.cizimler.map((c) => [c.ad, c]));
  const durum = { zemin: 'dama', boy: 'sigdir', kilavuz: true, masa: false };
  const sahneler = [];

  const el = (etiket, oz = {}, ...cocuk) => {
    const e = document.createElement(etiket);
    for (const [k, v] of Object.entries(oz)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    e.append(...cocuk.flat().filter((c) => c !== null && c !== undefined && c !== false));
    return e;
  };
  const imlec = el('div', { class: 'imlec', hidden: true });
  const noktaKutusu = el('textarea', { rows: '6', spellcheck: 'false', 'aria-label': 'Ölçülen noktalar' });
  const noktaPaneli = el('aside', { class: 'noktalar', hidden: true }, el('b', { text: 'Ölçülen noktalar (tuval pikseli)' }), noktaKutusu,
    el('button', { type: 'button', text: 'Temizle', onclick: () => { noktaKutusu.value = ''; noktaPaneli.hidden = true; } }));
  const noktaEkle = (ad, x, y) => { noktaKutusu.value += `${ad}: [${x}, ${y}]
`; noktaPaneli.hidden = false; noktaKutusu.scrollTop = noktaKutusu.scrollHeight; };
  document.body.append(imlec, noktaPaneli);
  const yuzde = (n) => (Math.round(n * 1000) / 10).toLocaleString('tr') + '%';
  const seviye = (c) => (!c.yol ? 'yok' : c.bulgular.some((b) => b.seviye === 'hata') ? 'hata' : c.bulgular.some((b) => b.seviye === 'uyari') ? 'uyari' : 'temiz');

  // ---- sahne: bir tuval; çizimler üst üste, kılavuzlar en üstte
  function sahne(tuvalAdi, secenek = {}) {
    const t = V.tuvaller[tuvalAdi];
    const kutu = el('div', { class: 'sahne', 'data-tuval': tuvalAdi });
    const kat = el('div', { class: 'kat' });
    kutu.append(kat);
    if (tuvalAdi === 'zipzip' && secenek.masa !== false && C[V.masa.ad] && C[V.masa.ad].yol) {
      const m = V.masa;
      kutu.prepend(el('img', {
        class: 'masa', src: C[m.ad].yol, loading: 'lazy', alt: '',
        style: `left:${(m.sol / t.g) * 100}%;top:${(m.ust / t.y) * 100}%;width:${(m.g / t.g) * 100}%;height:${(m.y / t.y) * 100}%`,
      }));
    }
    for (const k of [...t.kilavuzlar, ...(secenek.ekKilavuz || [])]) {
      if (k.tur === 'yatay') kutu.append(el('div', { class: 'kv kv-yatay', style: `top:${(k.konum / t.y) * 100}%` }, el('span', { text: `${k.ad} · y ${k.konum}` })));
      else if (k.tur === 'dikey') kutu.append(el('div', { class: 'kv kv-dikey', style: `left:${(k.konum / t.g) * 100}%` }, el('span', { text: `${k.ad} · x ${k.konum}` })));
      else if (k.tur === 'daire') kutu.append(el('div', { class: 'kv kv-daire', style: `left:${((k.nokta[0] - k.yaricap) / t.g) * 100}%;top:${((k.nokta[1] - k.yaricap) / t.y) * 100}%;width:${((k.yaricap * 2) / t.g) * 100}%;height:${((k.yaricap * 2) / t.y) * 100}%` }, el('span', { text: `${k.ad} · (${k.nokta[0]}, ${k.nokta[1]})` })));
      else kutu.append(el('div', { class: 'kv kv-kutu', style: `left:${(k.kutu[0] / t.g) * 100}%;top:${(k.kutu[1] / t.y) * 100}%;width:${(k.kutu[2] / t.g) * 100}%;height:${(k.kutu[3] / t.y) * 100}%` }, el('span', { text: k.ad })));
    }
    // imleç: tuval pikseli olarak yer; tıklayınca "Ölçülen noktalar" listesine yazılır
    let simdi = '';
    const tuvalNoktasi = (e) => { const r = kutu.getBoundingClientRect(); return [Math.round(((e.clientX - r.left) / r.width) * t.g), Math.round(((e.clientY - r.top) / r.height) * t.y)]; };
    kutu.addEventListener('mousemove', (e) => { const [x, y] = tuvalNoktasi(e); imlec.textContent = `x ${x} · y ${y}` + (simdi ? ` · ${simdi}` : ''); imlec.hidden = false; });
    kutu.addEventListener('mouseleave', () => { imlec.hidden = true; });
    kutu.addEventListener('click', (e) => { const [x, y] = tuvalNoktasi(e); noktaEkle(simdi || tuvalAdi, x, y); });
    const kayit = { kutu, g: t.g, y: t.y, enCok: secenek.enCok };
    sahneler.push(kayit);
    boyutla(kayit);
    const resimler = new Map();
    const koy = (adlar) => {
      kat.replaceChildren();
      resimler.clear();
      for (const ad of adlar) {
        const c = C[ad];
        if (!c || !c.yol) continue;
        const r = el('img', { src: c.yol, alt: ad, loading: secenek.hemen ? 'eager' : 'lazy', decoding: 'async', draggable: 'false' });
        resimler.set(ad, r);
        kat.append(r);
      }
    };
    /** yalnız verilen çizim görünür; `soluk` verilirse hepsi o saydamlıkla üst üste */
    const goster = (ad, soluk) => {
      simdi = ad;
      for (const [a, r] of resimler) {
        r.style.visibility = soluk || a === ad ? 'visible' : 'hidden';
        r.style.opacity = soluk ? (a === ad ? '0.85' : String(soluk)) : '1';
      }
    };
    return { kutu, koy, goster, resimler };
  }
  function boyutla(s) {
    let z = 1;
    if (durum.boy === 'sigdir') {
      // pencere ölçüsü henüz yoksa (arka planda açılan sekme) makul bir ekran varsay; pencere boyutlanınca yeniden hesaplanır
      const en = window.innerWidth || document.documentElement.clientWidth || 1280, boy = window.innerHeight || 800;
      z = Math.max(0.1, Math.min(1, (en - 72) / s.g, (boy * (s.enCok || 0.72)) / s.y));
    }
    else z = Number(durum.boy);
    s.kutu.style.width = Math.round(s.g * z) + 'px';
    s.kutu.style.height = Math.round(s.y * z) + 'px';
    s.kutu.title = `${s.g} × ${s.y} · %${Math.round(z * 100)}`;
  }
  const hepsiniBoyutla = () => sahneler.forEach(boyutla);
  window.addEventListener('resize', hepsiniBoyutla);

  // ---- üst çubuk
  const gelen = V.cizimler.filter((c) => c.yol);
  const say = (s) => V.cizimler.filter((c) => seviye(c) === s).length;
  const secici = (ad, deger, secenekler, degis) => el('label', { class: 'secici' }, el('span', { text: ad }),
    el('select', { onchange: (e) => degis(e.target.value) }, secenekler.map(([d, m]) => el('option', { value: d, selected: d === deger, text: m }))));
  const isaret = (ad, deger, degis) => el('label', { class: 'secici' }, el('input', { type: 'checkbox', checked: deger, onchange: (e) => degis(e.target.checked) }), el('span', { text: ad }));
  const sinifla = () => {
    document.body.className = `zemin-${durum.zemin}` + (durum.kilavuz ? '' : ' kilavuz-yok') + (durum.masa ? ' masa-var' : '');
  };
  kok.append(el('header', { class: 'cubuk' },
    el('h1', { text: 'Doktor-K1 · tam boy önizleme' }),
    el('div', { class: 'rozetler' },
      el('span', { class: 'rozet', text: `${gelen.length} / ${V.cizimler.length} çizim geldi` }),
      el('span', { class: 'rozet hata', text: `${say('hata')} hata` }),
      el('span', { class: 'rozet uyari', text: `${say('uyari')} uyarı` }),
      el('span', { class: 'rozet temiz', text: `${say('temiz')} temiz` })),
    el('div', { class: 'denetimler' },
      secici('Zemin', durum.zemin, [['dama', 'dama'], ['koyu', 'koyu'], ['acik', 'beyaz'], ['oda', 'oda rengi']], (d) => { durum.zemin = d; sinifla(); }),
      secici('Boy', durum.boy, [['sigdir', 'ekrana sığdır'], ['0.5', '%50'], ['1', '%100 (tam boy)'], ['2', '%200']], (d) => { durum.boy = d; hepsiniBoyutla(); }),
      isaret('Kılavuz çizgileri', durum.kilavuz, (d) => { durum.kilavuz = d; sinifla(); }),
      isaret('Masa (Zıpzıp\'ın arkasında)', durum.masa, (d) => { durum.masa = d; sinifla(); })),
    el('p', { class: 'kunye', text: `Üretildi: ${V.uretildi} · çizimler: ${V.hedef} · kaynak: ${V.kaynak}` })));
  sinifla();

  // ---- özet
  const ozet = el('section', {}, el('h2', { text: 'Özet' }));
  const eksik = V.cizimler.filter((c) => !c.yol);
  if (eksik.length) {
    ozet.append(el('details', { open: eksik.length <= 12 }, el('summary', { text: `Gelmeyen ${eksik.length} çizim` }),
      el('ul', { class: 'sikisik' }, V.sayfalar.filter((s) => s.adlar.some((a) => !C[a].yol)).map((s) =>
        el('li', {}, el('b', { text: s.baslik + ': ' }), s.adlar.filter((a) => !C[a].yol).join(', '))))));
  } else ozet.append(el('p', { text: 'Bütün çizimler geldi.' }));
  const sorunlu = V.cizimler.filter((c) => c.yol && c.bulgular.some((b) => b.seviye !== 'bilgi'));
  if (sorunlu.length) {
    ozet.append(el('h3', { text: 'Bakılacak çizimler' }), el('ul', { class: 'sikisik' }, sorunlu.map((c) =>
      el('li', {}, el('a', { href: '#c-' + c.ad, text: c.ad }), ': ', c.bulgular.filter((b) => b.seviye !== 'bilgi').map((b) => el('span', { class: 'bulgu ' + b.seviye, text: b.metin }))))));
  } else if (gelen.length) ozet.append(el('p', { text: 'Gelen çizimlerde otomatik denetim sorun bulmadı. Uzuvları ve yüzleri aşağıda %100 boyda sayın.' }));
  kok.append(ozet);

  // ---- sahne provası: gelen çizimler oyundaki yer ve ölçekleriyle üst üste (çizimi olmayan katman boş kalır)
  if (V.prova) {
    const P = V.prova;
    const varMi = (ad) => Boolean(ad && C[ad] && C[ad].yol);
    const bolum = el('section', {}, el('h2', { text: 'Sahne provası (oyundaki yer ve ölçek)' }),
      el('p', { class: 'kunye', text: 'Katmanlar oyunun kendi ölçüleriyle dizilir (once-kuzu/yerlesim.ts). İlk sayfa gelir gelmez bakılacaklar: Zıpzıp masaya, Kino yere oturuyor mu; ikisinin boyu birbirine ve odaya uyuyor mu. Gelmeyen katman boş kalır.' }));
    const dis = el('div', { class: 'prova' });
    const ic = el('div', { class: 'prova-ic', style: `width:${P.sahne.g}px;height:${P.sahne.y}px` });
    const kamera = el('div', { class: 'prova-kamera' });
    const ust = el('div', { class: 'prova-kamera' });
    const katman = (anahtar, hedef) => {
      const r = el('img', { alt: '', draggable: 'false', hidden: true });
      const k = P.kutular[anahtar];
      r.style.cssText = `position:absolute;left:${k.sol}px;top:${k.ust}px;width:${k.g}px;height:${k.y}px` + (anahtar === 'fon' ? ';object-fit:cover' : '');
      hedef.append(r);
      return r;
    };
    const kat = { fon: katman('fon', kamera), perde: katman('perde', kamera), masa: katman('masa', kamera), kino: katman('kino', kamera), zipzip: katman('zipzip', kamera), yakin: katman('yakin', ust) };
    ic.append(kamera, ust);
    dis.append(ic);
    for (const c of P.cerceveler) dis.append(el('div', { class: 'kv kv-kutu prova-cerceve', style: `left:${(c.kutu.sol / P.sahne.g) * 100}%;top:${(c.kutu.ust / P.sahne.y) * 100}%;width:${(c.kutu.g / P.sahne.g) * 100}%;height:${(c.kutu.y / P.sahne.y) * 100}%` }, el('span', { text: c.ad + ' · görünen alan' })));
    const ilk = (liste) => liste.find(varMi) || '';
    const secim = { plan: 'genis', zipzip: ilk(P.adlar.zipzip), kino: ilk(P.adlar.kino), yakin: ilk(P.adlar.yakin), perde: ilk(P.adlar.perde) };
    const not = el('p', { class: 'kunye' });
    const koy = (r, ad) => { if (varMi(ad)) { r.src = C[ad].yol; r.hidden = false; } else { r.removeAttribute('src'); r.hidden = true; } };
    const ciz = () => {
      const z = Math.max(0.1, Math.min(1, ((window.innerWidth || 1280) - 72) / P.sahne.g));
      dis.style.width = Math.round(P.sahne.g * z) + 'px';
      dis.style.height = Math.round(P.sahne.y * z) + 'px';
      ic.style.transform = `scale(${z})`;
      const k = P.kamera[secim.plan];
      kamera.style.transform = `translate(${k.tx}px, ${k.ty}px) scale(${k.s})`;
      kamera.style.filter = secim.plan === 'yakin' ? 'blur(6px)' : '';
      koy(kat.fon, P.adlar.fon); koy(kat.masa, P.adlar.masa); koy(kat.perde, secim.perde); koy(kat.kino, secim.kino); koy(kat.zipzip, secim.zipzip);
      koy(kat.yakin, secim.plan === 'yakin' ? secim.yakin : '');
      const bakilan = [[P.adlar.fon, 'oda (fon)'], [P.adlar.masa, 'masa'], [secim.perde, 'perde'], [secim.kino, 'Kino'], [secim.zipzip, 'Zıpzıp']];
      if (secim.plan === 'yakin') bakilan.push([secim.yakin, 'yakın plan']);
      const yok = bakilan.filter(([ad]) => !varMi(ad)).map(([, m]) => m);
      not.textContent = yok.length ? 'Henüz gelmeyen ya da gösterilmeyen katmanlar: ' + yok.join(', ') + '.' : 'Bütün katmanlar yerinde.';
    };
    const pozSecici = (ad, anahtar) => secici(ad, secim[anahtar], [['', '(gösterme)'], ...P.adlar[anahtar].filter(varMi).map((a) => [a, a])], (d) => { secim[anahtar] = d; ciz(); });
    bolum.append(el('div', { class: 'denetimler' },
      secici('Plan', secim.plan, [['genis', 'geniş'], ['orta', 'orta'], ['yakin', 'yakın (göğüs)']], (d) => { secim.plan = d; ciz(); }),
      pozSecici('Zıpzıp', 'zipzip'), pozSecici('Kino', 'kino'), pozSecici('Yakın plan', 'yakin'), pozSecici('Perde', 'perde')), not, el('div', { class: 'tasiyici' }, dis));
    window.addEventListener('resize', ciz);
    ciz();
    kok.append(bolum);
  }

  // ---- kaynak dosyalar
  if (V.kaynaklar.length) {
    kok.append(el('section', {}, el('h2', { text: 'Kaynak klasöründen işlenenler' }),
      el('table', {}, el('tbody', {}, V.kaynaklar.map((k) => el('tr', { class: k.seviye }, el('td', { text: k.dosya }), el('td', { text: k.sonuc })))))));
  }

  // ---- oynatıcı: diziler ve ağızlar
  function oynatici(baslik, tuvalAdi, kareler, sureler, donus, aciklama) {
    const var_ = kareler.filter((a) => C[a] && C[a].yol);
    const kutu = el('article', { class: 'oynatici' }, el('h3', { text: baslik }), aciklama && el('p', { class: 'kunye', text: aciklama }));
    const yok = [...new Set(kareler.filter((a) => !C[a] || !C[a].yol))];
    if (yok.length) kutu.append(el('p', { class: 'bulgu uyari', text: `Gelmeyen kare: ${yok.join(', ')}` }));
    if (!var_.length) { kutu.append(el('p', { class: 'kunye', text: 'Bu dizinin çizimleri henüz gelmedi.' })); return kutu; }
    const s = sahne(tuvalAdi, { enCok: 0.62 });
    s.koy([...new Set(var_)]);
    let i = 0, oynuyor = false, zaman = 0, hiz = 1, ustUste = false;
    const etiket = el('span', { class: 'kare-adi' });
    const ciz = () => {
      const ad = kareler[i];
      s.goster(ad, ustUste ? 0.28 : 0);
      etiket.textContent = `${i + 1} / ${kareler.length} · ${ad}` + (sureler ? ` · ${sureler[i] || 'durur'}${sureler[i] ? ' ms' : ''}` : '') + (C[ad] && C[ad].yol ? '' : ' (gelmedi)');
    };
    const ileri = () => {
      if (!oynuyor) return;
      const sure = sureler ? sureler[i] : 110;
      const son = i === kareler.length - 1;
      // son karede durulan dizide kısa bir bekleme, sonra baştan
      const bekle = (sure > 0 ? sure : 900) / hiz;
      zaman = setTimeout(() => {
        i = son ? (donus !== undefined && donus !== null ? donus : 0) : i + 1;
        ciz(); ileri();
      }, bekle);
    };
    const dugme = el('button', { type: 'button', text: 'Oynat', onclick: () => { oynuyor = !oynuyor; dugme.textContent = oynuyor ? 'Durdur' : 'Oynat'; clearTimeout(zaman); if (oynuyor) ileri(); } });
    const adim = (d) => { oynuyor = false; dugme.textContent = 'Oynat'; clearTimeout(zaman); i = (i + d + kareler.length) % kareler.length; ciz(); };
    kutu.append(el('div', { class: 'denetimler' }, dugme,
      el('button', { type: 'button', text: '◀ önceki', onclick: () => adim(-1) }),
      el('button', { type: 'button', text: 'sonraki ▶', onclick: () => adim(1) }),
      secici('Hız', '1', [['1', 'gerçek hız'], ['0.5', 'yarı hız'], ['0.25', 'çeyrek hız']], (d) => { hiz = Number(d); }),
      isaret('Üst üste (baş ölçüsü ve temas noktası)', false, (d) => { ustUste = d; ciz(); }),
      etiket), el('div', { class: 'tasiyici' }, s.kutu));
    ciz();
    return kutu;
  }
  const tuvali = (kareler) => { const c = kareler.map((a) => C[a]).find(Boolean); return c ? c.tuval : 'zipzip'; };

  const diziBolumu = el('section', {}, el('h2', { text: 'Diziler (sahnedeki sürelerle)' }),
    el('p', { class: 'kunye', text: 'Oynatırken bakılacaklar: poz kayıyor ya da sıçrıyor mu, baş ölçüsü ve yere ya da masaya değen nokta sabit mi. "Üst üste" bütün pozları soluk gösterir.' }));
  for (const d of V.diziler) diziBolumu.append(oynatici(d.ad, tuvali(d.kareler), d.kareler, d.sureler, d.donus, `${d.kareler.length} kare · ${d.sureler.reduce((a, b) => a + b, 0)} ms` + (d.donus !== undefined && d.donus !== null ? ` · ${d.donus + 1}. kareden döner` : ' · son karede durur')));
  kok.append(diziBolumu);

  const agizBolumu = el('section', {}, el('h2', { text: 'Ağız dizileri (0 kapalı · 1 az · 2 orta · 3 yuvarlak · 4 diş · 5 gülümseme)' }),
    el('p', { class: 'kunye', text: 'Altı çizim aynı poz olmalı; oynarken yalnız ağız kıpırdamalı. Göz, kulak ya da gövde oynuyorsa çizim geri yazılır.' }));
  for (const a of V.agizlar) agizBolumu.append(oynatici(a.ad, tuvali(a.kareler), a.kareler, null, 0));
  kok.append(agizBolumu);

  // ---- aynı poz çiftleri
  const cift = el('section', {}, el('h2', { text: 'Aynı poz olması gereken çiftler' }),
    el('p', { class: 'kunye', text: 'Değişen: değişen piksellerin temel çizimin görünen piksellerine oranı (eşik tahmindir). Yayılma: değişen alanın kutusunun çizimin kutusuna oranı; yalnız ağız ya da göz değiştiyse küçük kalır. Satıra tıklayınca iki çizim sırayla yanıp söner.' }));
  const bakis = el('div', { class: 'tasiyici' });
  let bakisZamani = 0;
  const ciftGoster = (p) => {
    clearInterval(bakisZamani);
    const s = sahne(C[p.temel].tuval, { enCok: 0.62, hemen: true });
    s.koy([p.temel, p.es]);
    let k = 0;
    const cizgi = el('p', { class: 'kare-adi' });
    const don = () => { const ad = k % 2 ? p.es : p.temel; s.goster(ad, 0); cizgi.textContent = ad; k++; };
    don();
    bakisZamani = setInterval(don, 480);
    if (p.kutu) {
      const t = V.tuvaller[C[p.temel].tuval];
      s.kutu.append(el('div', { class: 'fark-kutu', style: `left:${(p.kutu.x0 / t.g) * 100}%;top:${(p.kutu.y0 / t.y) * 100}%;width:${((p.kutu.x1 - p.kutu.x0) / t.g) * 100}%;height:${((p.kutu.y1 - p.kutu.y0) / t.y) * 100}%` }));
    }
    bakis.replaceChildren(el('h3', { text: `${p.temel} ↔ ${p.es}` }), cizgi, s.kutu);
    bakis.scrollIntoView({ block: 'nearest' });
  };
  cift.append(el('table', {}, el('thead', {}, el('tr', {}, ['Temel', 'Eşi', 'Değişmesi gereken', 'Değişen', 'Eşik', 'Yayılma', 'Değişen alan'].map((b) => el('th', { text: b })))),
    el('tbody', {}, V.ayniPoz.map((p) => {
      const hazir = p.oran !== null;
      const durumu = !hazir ? 'atlandi' : p.oran < 0 ? 'hata' : p.oran > p.enCok || p.yayilma > 0.35 ? 'uyari' : 'tamam';
      return el('tr', { class: durumu + (hazir && p.oran >= 0 ? ' tikla' : ''), onclick: hazir && p.oran >= 0 ? () => ciftGoster(p) : undefined },
        el('td', { text: p.temel }), el('td', { text: p.es }), el('td', { text: p.ne }),
        el('td', { text: !hazir ? 'çizim gelmedi' : p.oran < 0 ? 'tuval boyutu farklı' : yuzde(p.oran) }), el('td', { text: yuzde(p.enCok) }), el('td', { text: hazir && p.yayilma !== null ? yuzde(p.yayilma) : '' }),
        el('td', { text: p.kutu ? `${p.kutu.x1 - p.kutu.x0} × ${p.kutu.y1 - p.kutu.y0} px, (${p.kutu.x0}, ${p.kutu.y0})` : hazir && p.oran === 0 ? 'birebir aynı' : '' }));
    }))), bakis);
  kok.append(cift);

  // ---- sayfalar: her çizim tek başına
  const sayfaBolumu = el('section', {}, el('h2', { text: 'Çizimler (sayfa sayfa)' }),
    el('p', { class: 'kunye', text: 'Bir çizimin üstünde gezince imlecin tuval pikseli sağ altta görünür; tıklayınca nokta listeye yazılır (yerlesim.ts → HEDEF ve PERDE ölçümü için). Uzuv sayımı için "Boy" seçicisinden %100\'ü seçin: iki göz, iki kulak, iki kol, iki pati, iki bacak, iki ayak, bir kuyruk; Kuzu\'yu tutan pati görünür.' }));
  for (const s of V.sayfalar) {
    const geldi = s.adlar.filter((a) => C[a].yol).length;
    const bolum = el('div', { class: 'sayfa' }, el('h3', { text: `${s.baslik} · ${geldi} / ${s.adlar.length}` }));
    for (const ad of s.adlar) {
      const c = C[ad];
      const kart = el('article', { class: 'kart ' + seviye(c), id: 'c-' + ad },
        el('header', {}, el('b', { text: ad }), el('span', { class: 'kunye', text: ` ${c.g} × ${c.y} · ${c.koken}` })));
      if (c.bulgular.length) kart.append(el('ul', { class: 'sikisik' }, c.bulgular.map((b) => el('li', { class: 'bulgu ' + b.seviye, text: b.metin }))));
      if (c.yol) {
        const sh = sahne(c.tuval, { enCok: 0.78, ekKilavuz: c.kilavuzlar });
        sh.koy([ad]); sh.goster(ad, 0);
        kart.append(el('div', { class: 'tasiyici' }, sh.kutu));
      } else kart.append(el('p', { class: 'kunye', text: 'Henüz gelmedi.' }));
      bolum.append(kart);
    }
    sayfaBolumu.append(bolum);
  }
  kok.append(sayfaBolumu);
})();
