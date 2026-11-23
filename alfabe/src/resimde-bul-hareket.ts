import { IKON } from '../../src/ui/ikonlar';

/**
 * Resimde Bul · dokunulan nesnenin anı (18 Kasım 2026, Barış: "şu kısım çok amatör, elit seviyeye getir").
 *
 * Önceki yol nesneyi otomatik çizgi verisiyle (VTracer konturları) kesip kalın çizgiyle çiziyordu. Katmanlı çizgi
 * verisinde nesnenin altında koca dikdörtgenler olduğu için bankın çevresinde sert bir çerçeve çıkıyor, çıtaların arasındaki
 * çimen de içeride kalıyordu. Yeni yol nesnenin şekline hiç dayanmaz, bu yüzden her sahnede aynı temiz durur:
 *   1. Spot ışığı: resim yumuşakça kararır, nesnenin üstünde kenarı yumuşak bir ışık yanar.
 *   2. Nefes: ışığın içindeki bölge (yumuşak kenarlı maske) hafifçe büyüyüp yerine oturur; çerçeve yoktur.
 *   3. Doğru nesnede küçük altın yıldızlar saçılır. Yanlış nesne yalnız daha hafif bir ışık alır (adı yine söylenir).
 * Çizim yok: Astra'nın sahnesi olduğu gibi kalır; ışık, maske ve yıldız simgesi arayüz katmanıdır.
 */
const ns = 'http://www.w3.org/2000/svg';
function element(tag: string, attrs: Record<string, string>) {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}
let sayac = 0;

export function resimHareketiniKur(stage: SVGSVGElement, raw: string, _scene: number) {
  const source = new DOMParser().parseFromString(raw, 'image/svg+xml').documentElement;
  source.setAttribute('viewBox', '0 0 ' + source.getAttribute('width') + ' ' + source.getAttribute('height'));
  source.setAttribute('width', '960'); source.setAttribute('height', '540');
  source.setAttribute('preserveAspectRatio', 'none'); source.setAttribute('id', 'rb-asli');
  const defs = element('defs', {}); defs.append(document.importNode(source, true));
  stage.append(defs, element('use', { href: '#rb-asli' }));
  const effects = element('g', { 'aria-hidden': 'true' }); stage.append(effects);
  const art = stage.parentElement;
  let animasyonlar: Animation[] = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  return function play(index: number, bounds: DOMRect, screen: DOMRect) {
    animasyonlar.forEach((a) => a.cancel()); animasyonlar = [];
    effects.replaceChildren();
    art?.querySelectorAll('.rb-parilti').forEach((el) => el.remove());
    const hedef = index < 2;
    const sx = 960 / screen.width, sy = 540 / screen.height;
    const cx = (bounds.x + bounds.width / 2 - screen.x) * sx;
    const cy = (bounds.y + bounds.height / 2 - screen.y) * sy;
    // ışık nesneden biraz geniş: küçük nesnede de çocuk nereye baktığını görür
    const rx = Math.max(54, bounds.width * sx * 0.72), ry = Math.max(46, bounds.height * sy * 0.74);
    const id = 'rb-' + ++sayac;

    // 1. spot ışığı: koyu katman, ortası yumuşakça delik (maske: beyaz = karanlık görünür, siyah = ışık)
    const yumusak = element('radialGradient', { id: id + '-yumusak' });
    yumusak.append(element('stop', { offset: '0', 'stop-color': '#000' }), element('stop', { offset: '.62', 'stop-color': '#000' }), element('stop', { offset: '1', 'stop-color': '#fff' }));
    const isikMaske = element('mask', { id: id + '-isik', maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '960', height: '540' });
    isikMaske.append(element('rect', { x: '0', y: '0', width: '960', height: '540', fill: '#fff' }),
      element('ellipse', { cx: String(cx), cy: String(cy), rx: String(rx), ry: String(ry), fill: `url(#${id}-yumusak)` }));
    // 2. nefes alan bölge: ortası tam, kenarı sönen elips maske (sert kenar yok)
    const sonen = element('radialGradient', { id: id + '-sonen' });
    sonen.append(element('stop', { offset: '0', 'stop-color': '#fff' }), element('stop', { offset: '.7', 'stop-color': '#fff' }), element('stop', { offset: '1', 'stop-color': '#000' }));
    const bolgeMaske = element('mask', { id: id + '-bolge', maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '960', height: '540' });
    bolgeMaske.append(element('ellipse', { cx: String(cx), cy: String(cy), rx: String(rx * 0.92), ry: String(ry * 0.92), fill: `url(#${id}-sonen)` }));
    const yerel = element('defs', {}); yerel.append(yumusak, sonen, isikMaske, bolgeMaske);

    const karanlik = element('rect', { x: '0', y: '0', width: '960', height: '540', fill: '#0f2a3a', mask: `url(#${id}-isik)`, opacity: '0' });
    const parlama = element('ellipse', { cx: String(cx), cy: String(cy), rx: String(rx), ry: String(ry), fill: `url(#${id}-sonen)`, opacity: '0', style: 'mix-blend-mode:soft-light' });
    const bolge = element('g', { mask: `url(#${id}-bolge)` });
    bolge.append(element('use', { href: '#rb-asli' }));
    bolge.style.transformOrigin = cx + 'px ' + cy + 'px';
    // nefes alan bölge karanlığın altında: büyürken kenarı karanlığa karışır, koyu halka kalmaz
    effects.append(yerel, bolge, karanlik, parlama);

    const sure = hedef ? 1500 : 1000;
    const koyu = hedef ? 0.42 : 0.24;
    animasyonlar.push(karanlik.animate([{ opacity: 0 }, { opacity: koyu, offset: 0.2 }, { opacity: koyu, offset: 0.68 }, { opacity: 0 }], { duration: sure, easing: 'ease-in-out', fill: 'forwards' }));
    animasyonlar.push(parlama.animate([{ opacity: 0 }, { opacity: hedef ? 0.5 : 0.3, offset: 0.25 }, { opacity: 0 }], { duration: sure, easing: 'ease-out', fill: 'forwards' }));
    if (!reduced) {
      const poz = hedef
        ? [{ transform: 'scale(1)' }, { transform: 'scale(1.075)', offset: 0.28 }, { transform: 'scale(1.06)', offset: 0.55 }, { transform: 'scale(.995)', offset: 0.82 }, { transform: 'scale(1)' }]
        : [{ transform: 'scale(1)' }, { transform: 'scale(1.035)', offset: 0.3 }, { transform: 'scale(1)' }];
      animasyonlar.push(bolge.animate(poz, { duration: hedef ? 1100 : 700, easing: 'cubic-bezier(.3,1.2,.5,1)' }));
    }
    const son = animasyonlar[0];
    son.onfinish = () => { if (effects.contains(karanlik)) effects.replaceChildren(); };

    // 3. doğru nesnede altın yıldızlar (azaltılmış harekette yok)
    if (hedef && !reduced && art) {
      const a = art.getBoundingClientRect();
      const ox = bounds.x + bounds.width / 2 - a.x, oy = bounds.y + bounds.height / 2 - a.y;
      // yıldızlar nesnenin kıyısında açılır (sahneye dağılmaz), tam parlaklıkta bir an durur, sonra söner
      const rxY = Math.min(bounds.width / 2 + 16, 230), ryY = Math.min(bounds.height / 2 + 14, 170);
      for (let i = 0; i < 8; i++) {
        const aci = (i / 8) * Math.PI * 2 - Math.PI / 2 + (Math.random() - 0.5) * 0.35;
        const p = document.createElement('span');
        p.className = 'rb-parilti'; p.setAttribute('aria-hidden', 'true'); p.innerHTML = IKON.yildiz;
        const boy = 26 + Math.round(Math.random() * 12);
        p.style.cssText = `left:${ox}px;top:${oy}px;width:${boy}px;height:${boy}px`;
        art.append(p);
        const dx = Math.cos(aci) * rxY, dy = Math.sin(aci) * ryY;
        const yer = (k: number, olcek: number, donus: number) => `translate(calc(-50% + ${dx * k}px),calc(-50% + ${dy * k}px)) scale(${olcek}) rotate(${donus}deg)`;
        const u = p.animate([
          // eğri her aralığa ayrı: bütün animasyona verilince parlak duruş öne kayıp yıldızlar erken sönüyordu
          { transform: yer(0.55, 0.2, 0), opacity: 0, easing: 'cubic-bezier(.2,.8,.3,1)' },
          { transform: yer(0.95, 1.15, 25), opacity: 1, offset: 0.22, easing: 'ease-in-out' },
          { transform: yer(1.02, 0.95, 45), opacity: 1, offset: 0.7, easing: 'ease-in' },
          { transform: yer(1.1, 0.4, 70), opacity: 0 },
        ], { duration: 1150, delay: 80 + i * 35, fill: 'both' });
        u.onfinish = () => p.remove();
        animasyonlar.push(u);
      }
    }
  };
}
