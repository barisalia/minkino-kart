/**
 * "Elektrikler Kesildi!" ışık ve karanlık:
 * - Gece: dünyanın üstünde sıcak lacivert karanlık (hiç tam siyah değil). Ortasında yumuşak kenarlı bir ışık deliği
 *   (fener). Delik yalnız transform ile kayar (her karede yerleşim okunmaz); yarıçapı nadiren değişir.
 * - Huzme: fenerin ışığı (ekranın altından ışık lekesine uzanan soluk koni); yalnız transform.
 * - GecePencere: arka plan resmindeki yuvarlak pencerenin camına gece göğü, ay, yıldızlar ve karşı apartman
 *   (Can'ın ışıklı penceresi) çizer; karanlığın üstündedir (kendisi zaten gece renginde).
 * - Balonlar: karakterlerin konuşma balonları ekran katmanında (karanlığın altında kalmasın).
 */
import { h, sure } from '../../src/ui/dom';
import { adres } from './gorsel';
import { APARTMAN_SVG } from './elektrik-cizim';

/** Arka plan resmi (1024×1024) içindeki pencere: camın merkezi ve yarıçapı, perdelerin iç kenarları */
export const PENCERE = { x: 264, y: 244, r: 158 };

export class Gece {
  readonly el: HTMLElement;
  private maske: HTMLElement;
  private huzmeEl: HTMLElement;
  private ayEl: HTMLElement;
  /** delik merkezi (dünyanın kendi pikseli) */
  private x = 0;
  private y = 0;
  private hx = 0;
  private hy = 0;
  private r = 0;
  private huzmeAcik = false;
  /** dünyanın boyu (px, ölçeksiz) */
  private W = 1;
  private H = 1;

  constructor() {
    this.maske = h('i.el-gece-maske');
    this.huzmeEl = h('i.el-huzme');
    this.ayEl = h('i.el-ay-isigi');
    this.el = h('div.el-gece', { 'aria-hidden': 'true' }, this.maske, this.ayEl, this.huzmeEl);
  }

  /** Dünyanın ölçüsü (kurulumda bir kez) */
  olcu(W: number, H: number) {
    this.W = W;
    this.H = H;
    this.x = this.hx = W / 2;
    this.y = this.hy = H / 2;
    this.uygula();
  }

  /** Ay ışığı şeridi: pencereden (dünya %: x, y üstten, genişlik) yere */
  ay(x: number, yUst: number, w: number, zeminUst: number) {
    const s = this.ayEl.style;
    s.left = `${x - w / 2}%`;
    s.top = `${yUst}%`;
    s.width = `${w}%`;
    s.height = `${Math.max(5, zeminUst - yUst)}%`;
  }

  /** Karanlık açık/kapalı (opacity geçişi) */
  karanlik(acik: boolean, ms = 900) {
    this.el.style.transitionDuration = `${sure(ms)}ms`;
    this.el.classList.toggle('acik', acik);
  }
  /** Karanlığın koyuluğu: 'tam' (elektrik yok), 'fener' (fener yanıyor: oda biraz seçilir), 'los' (final, gece lambası) */
  seviye(s: 'tam' | 'fener' | 'los') {
    this.el.dataset.seviye = s;
  }
  /** Titreyen ışık (lamba gelirken): karanlık kısa kısa açılıp kapanır */
  titret() {
    this.el.animate(
      [{ opacity: 1 }, { opacity: 0.25, offset: 0.12 }, { opacity: 1, offset: 0.24 }, { opacity: 0.1, offset: 0.46 }, { opacity: 0.9, offset: 0.6 }, { opacity: 0.2, offset: 0.8 }, { opacity: 1 }],
      { duration: sure(900), easing: 'steps(1, end)' },
    );
  }

  /** Işık deliğinin yarıçapı (dünya px; 0: kapalı) */
  delik(r: number) {
    this.r = Math.max(0, r);
    this.maske.style.setProperty('--r', `${this.r.toFixed(0)}px`);
    this.el.classList.toggle('delikli', this.r > 0);
  }
  get yaricap() {
    return this.r;
  }
  /** Deliğin hedefi (dünya px); anlik: kaymadan */
  hedef(x: number, y: number, anlik = false) {
    this.hx = x;
    this.hy = y;
    if (anlik) {
      this.x = x;
      this.y = y;
      this.uygula();
    }
  }
  get merkez(): [number, number] {
    return [this.x, this.y];
  }
  get hedefi(): [number, number] {
    return [this.hx, this.hy];
  }
  /** Fenerin huzmesi (ekranın altından ışık lekesine) */
  huzme(acik: boolean) {
    this.huzmeAcik = acik;
    this.huzmeEl.classList.toggle('acik', acik);
    this.uygula();
  }

  /** Her karede: delik hedefe yumuşakça kayar (yalnız transform yazılır) */
  tik(dt: number) {
    const dx = this.hx - this.x;
    const dy = this.hy - this.y;
    if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) return;
    const k = 1 - Math.exp(-dt * 14);
    this.x += dx * k;
    this.y += dy * k;
    this.uygula();
  }

  private uygula() {
    this.maske.style.transform = `translate(${(this.x - this.W / 2).toFixed(1)}px, ${(this.y - this.H / 2).toFixed(1)}px)`;
    if (this.huzmeAcik) {
      // koni ekranın alt ortasından (dünyada alt orta) deliğe
      const ox = this.W / 2;
      const oy = this.H + 40;
      const dx = this.x - ox;
      const dy = this.y - oy;
      const boy = Math.hypot(dx, dy);
      const aci = (Math.atan2(dx, -dy) * 180) / Math.PI;
      this.huzmeEl.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) rotate(${aci.toFixed(2)}deg) scale(${Math.max(0.3, this.r / 120).toFixed(3)}, ${(boy / 100).toFixed(3)})`;
    }
  }
}

/**
 * Pencerenin camındaki gece (arka plan resminin koordinatlarında çizilir; kutusu resmin sahnedeki yerine oturur):
 * gök, ay, yıldızlar, karşı apartman ve Can'ın ışıklı penceresi (Can: parti/can küçük). Komşuların pencereleri
 * ışıklar gelince yanar (.komsu).
 */
export class GecePencere {
  readonly el: HTMLElement;
  readonly can: HTMLElement;
  readonly canFener: HTMLElement;
  readonly bizimIsik: HTMLElement;
  constructor() {
    const { x, y, r } = PENCERE;
    const canUrl = adres('parti/can');
    // cam: yuvarlak; soldaki ve sağdaki toplanmış perdelerin iç kenarları camı biraz örter (kırpılır)
    const kirp = `<clipPath id="el-cam-kirp"><path d="M${x} ${y - r}A${r} ${r} 0 1 1 ${x - 0.01} ${y - r}Z"/></clipPath>
<clipPath id="el-cam-perde"><path d="M196 60Q150 150 108 232Q100 300 120 420H420Q432 300 424 232Q384 150 334 60Z"/></clipPath>`;
    const bina = `<g transform="translate(${x - r} ${y - r + 40}) scale(${(2 * r) / 300})">${APARTMAN_SVG.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`;
    const yildizlar = [
      [180, 150], [236, 120], [330, 140], [372, 196], [210, 206], [300, 104], [160, 236],
    ]
      .map(([sx, sy], i) => `<g class="el-yildiz" style="--i:${i}"><path d="M${sx} ${sy - 7}L${sx + 2} ${sy - 2}L${sx + 7} ${sy}L${sx + 2} ${sy + 2}L${sx} ${sy + 7}L${sx - 2} ${sy + 2}L${sx - 7} ${sy}L${sx - 2} ${sy - 2}Z" fill="#fff6c8"/></g>`)
      .join('');
    // Can'ın penceresi: sağdaki binada (resim koordinatı)
    const cx = x + r * 0.42;
    const cy = y + r * 0.2;
    this.el = h('div.el-pencere', {
      'data-el': 'pencere',
      html: `<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="none">
<defs>${kirp}<linearGradient id="el-gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2260"/><stop offset="1" stop-color="#3a3f8f"/></linearGradient>
<radialGradient id="el-ay-g" cx=".5" cy=".5" r=".5"><stop offset=".55" stop-color="#fff7d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient></defs>
<g clip-path="url(#el-cam-kirp)"><g clip-path="url(#el-cam-perde)">
<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="url(#el-gok)"/>
${yildizlar}
<circle cx="${x - r * 0.42}" cy="${y - r * 0.45}" r="46" fill="url(#el-ay-g)"/>
<path d="M${x - r * 0.42 + 6} ${y - r * 0.45 - 26}A26 26 0 1 0 ${x - r * 0.42 + 22} ${y - r * 0.45 + 14}A20 20 0 1 1 ${x - r * 0.42 + 6} ${y - r * 0.45 - 26}Z" fill="#ffe9a0" stroke="#3a1210" stroke-width="4"/>
${bina}
<g class="el-komsu"><rect x="${x - r * 0.72}" y="${y + r * 0.18}" width="22" height="26" rx="3" fill="#ffd97a"/><rect x="${x + r * 0.02}" y="${y + r * 0.52}" width="22" height="26" rx="3" fill="#ffd97a"/><rect x="${x + r * 0.7}" y="${y + r * 0.1}" width="22" height="26" rx="3" fill="#ffd97a"/></g>
</g></g>
<g stroke="#3a1210" stroke-width="5"><rect x="${x - 9}" y="${y - r}" width="18" height="${2 * r}" fill="#6b2c24"/><rect x="${x - r}" y="${y - 12}" width="${2 * r}" height="18" fill="#6b2c24"/></g>
</svg>`,
    });
    // Can'ın penceresi (ayrı eleman: yanıp söner, Can içinde)
    this.canFener = h('i.el-can-fener');
    this.can = h(
      'div.el-can-pencere',
      { style: `--cx:${((cx / 1024) * 100).toFixed(2)}%;--cy:${((cy / 1024) * 100).toFixed(2)}%`, 'data-el': 'can' },
      h('i.el-can-isik'),
      canUrl ? h('img.el-can', { src: canUrl, alt: 'Can', draggable: 'false' }) : h('i.el-can'),
      this.canFener,
      h('i.el-can-cerceve'),
    );
    // bizim fenerin cama düşen ışığı (alkışla yanıp söner)
    this.bizimIsik = h('i.el-bizim-isik', { style: `--cx:${((x / 1024) * 100).toFixed(2)}%;--cy:${((y / 1024) * 100).toFixed(2)}%` });
    this.el.append(this.can, this.bizimIsik);
  }
  /** Resmin sahnedeki kutusu (dünya %: sol, üst, genişlik, yükseklik) */
  yerlestir(sol: number, ust: number, w: number, hh: number) {
    Object.assign(this.el.style, { left: `${sol}%`, top: `${ust}%`, width: `${w}%`, height: `${hh}%` });
  }
}

/** Ekran katmanında konuşma balonu (karanlığın altında kalmasın): hedefin tepesinde, kısa süre */
export function balonGoster(katman: HTMLElement, hedef: DOMRect, yazi: string, ms = 1300, ust = 0.02) {
  const k = katman.getBoundingClientRect();
  const el = h('div.el-balon', { style: `left:${(hedef.left + hedef.width / 2 - k.left).toFixed(0)}px;top:${(hedef.top + hedef.height * ust - k.top).toFixed(0)}px` }, yazi);
  katman.append(el);
  void el.offsetWidth;
  el.classList.add('acik');
  setTimeout(() => el.classList.remove('acik'), sure(ms));
  setTimeout(() => el.remove(), sure(ms) + 400);
  return el;
}
