/**
 * Pati Dükkânı v2 · süsleme (PATI-V2 §4g). Mağazadan alınan (ya da Uzman / gece misafiri hediyesi) süs salonun süs
 * tepsisine iner; çocuk parmakla salondaki MIKNATISLI NOKTALARA koyar. Her oyukta üç nokta: duvar (üst köşe), yer (alt
 * köşe), halı (ortada, minderin altında). Süs kendi türündeki noktaya oturur; konan süs başka noktaya taşınabilir,
 * tepsiye geri bırakılabilir. Yerleşim kayıtta (kayit.susler[].nokta).
 *
 *  - Noktalar oyuğun kesitinin içinde (yatayda salon çiziminin üstünde, dikeyde kesitlerle birlikte): iki yönde de görünür.
 *  - Sürüklerken uygun noktalar yumuşak bir halkayla belirir (parlama, ok yok); parmak bırakılınca en yakın uygun boş
 *    noktaya oturur (ezilerek), yoksa yerine döner.
 *  - Dokunuşla da olur: tepsideki süse dokununca ilk boş uygun noktaya uçar.
 *  - Canlı süsler: müzik kutusu partiyi başlatır (Mino gelir, parti.ts); balon sallanır; saat çalar; ötekiler ezilip esner.
 *  - Netlik: süs sahne biriminde kendi pikselini aşmayan boyda (kesit ölçeği ≤ 1/3).
 */
import { h, sure, TEST_MODU } from '../../src/ui/dom';
import { elSurukle, icinde, Tutulan } from '../../kino-otobus/src/dokunsal';
import type { Efekt } from '../../kino-otobus/src/efekt';
import { ezil } from './arayuz';
import { susBilgi, type SusYeri } from './katalog';
import type { PatiKayit } from './kayit';
import { ses } from './sesler';
import { susResmi } from './varliklar';

/** Kesit içi noktalar (kesitin yerel birimi; kesit 667 × 711, oyuğun içi x 34-633, y 92-647) */
const NOKTA: Record<SusYeri, { x: number; y: number; boy: number; en?: number }> = {
  duvar: { x: 150, y: 250, boy: 190 },
  yer: { x: 548, y: 650, boy: 200 },
  hali: { x: 333, y: 672, boy: 0, en: 430 },
};
export const NOKTALAR: string[] = [0, 1, 2].flatMap((i) => (['duvar', 'yer', 'hali'] as SusYeri[]).map((t) => `o${i}-${t}`));
const noktaTuru = (n: string) => n.split('-')[1] as SusYeri;
const noktaOyuk = (n: string) => Number(n.slice(1, 2));

export interface SusOrtam {
  kayit: PatiKayit;
  kaydet: () => void;
  efekt: Efekt;
  etkilesim: () => void;
  /** oyuğun kesiti (süslerin katmanı) */
  kesit: (i: number) => HTMLElement;
  /** canlı süs (müzik kutusu → parti) */
  canli?: (id: string) => void;
}

export class Susler {
  /** salon panelinin altındaki süs tepsisi (yerleştirilmemiş süsler) */
  readonly tepsi: HTMLElement;
  private konan = new Map<string, HTMLElement>();
  private birak: (() => void)[] = [];
  private noktaIsaret: HTMLElement[] = [];

  constructor(private o: SusOrtam) {
    this.tepsi = h('div.pt-sus-tepsi', { 'aria-label': 'Süsler' });
  }

  private resimEl(id: string) {
    const s = susBilgi(id);
    const u = susResmi(id, s.resim);
    return u ? h('img', { src: u, alt: '', draggable: 'false' }) : h('span.pt-yer-tutucu');
  }

  /** Kayıttan: konan süsler yerine, konmayanlar tepsiye */
  kur() {
    for (const f of this.birak) f();
    this.birak = [];
    for (const el of this.konan.values()) el.remove();
    this.konan.clear();
    this.tepsi.replaceChildren();
    for (const s of this.o.kayit.susler) {
      if (s.nokta && NOKTALAR.includes(s.nokta)) this.koy(s.ad, s.nokta, false);
      else this.tepsiyeKoy(s.ad);
    }
    this.tepsiGuncelle();
  }

  private tepsiyeKoy(id: string) {
    const b = h('button.pt-sus-tepsi-kalem', { type: 'button', 'data-sus': id, 'aria-label': id }, this.resimEl(id)) as HTMLButtonElement;
    b.addEventListener('click', () => {
      const n = this.bosNokta(id);
      if (n) this.yerlestir(id, n, b);
      else ezil(b, 1.2, 300);
    });
    this.birak.push(elSurukle(b, this.surukle(id, b)));
    this.tepsi.append(b);
  }
  private tepsiGuncelle() {
    const var_ = this.tepsi.children.length > 0;
    this.tepsi.classList.toggle('acik', var_);
  }

  /** Bu süsün türünde ilk boş nokta */
  private bosNokta(id: string): string | null {
    const t = susBilgi(id).yer;
    const dolu = new Set(this.o.kayit.susler.map((s) => s.nokta).filter(Boolean));
    return NOKTALAR.find((n) => noktaTuru(n) === t && !dolu.has(n)) ?? null;
  }

  /** Süs noktada (kesitin içinde, hayvanın ve minderin arkasında) */
  private koy(id: string, nokta: string, canlandir: boolean) {
    const s = susBilgi(id);
    const p = NOKTA[s.yer];
    const kesit = this.o.kesit(noktaOyuk(nokta));
    const el = h('button.pt-sus', { type: 'button', 'data-sus': id, 'data-nokta': nokta, 'data-yer': s.yer, 'aria-label': id }, this.resimEl(id));
    // boy: halı enine, ötekiler boyuna; netlik: resmin kendi pikselini aşmaz (kesit ölçeği ≤ 1/3)
    const img = el.querySelector('img');
    const olc = () => {
      const nw = img?.naturalWidth || 400;
      const nh = img?.naturalHeight || 400;
      let w: number;
      let hh: number;
      if (p.en) {
        w = Math.min(p.en, nw);
        hh = (w * nh) / nw;
      } else {
        hh = Math.min(p.boy, nh);
        w = (hh * nw) / nh;
        if (w > 420) {
          w = 420;
          hh = (w * nh) / nw;
        }
      }
      el.style.cssText = `left:${(p.x - w / 2).toFixed(0)}px;top:${(p.y - (s.yer === 'duvar' ? hh / 2 : hh)).toFixed(0)}px;width:${w.toFixed(0)}px;height:${hh.toFixed(0)}px`;
    };
    if (img && !img.complete) img.addEventListener('load', olc, { once: true });
    olc();
    el.addEventListener('click', () => this.dokun(id, el));
    this.birak.push(elSurukle(el, this.surukle(id, el)));
    kesit.prepend(el);
    this.konan.set(id, el);
    if (canlandir) ezil(el, 1.8, 420);
  }

  /** Süs bir noktaya uçar ve oturur (kayda yazılır) */
  private yerlestir(id: string, nokta: string, kaynak: HTMLElement) {
    this.o.etkilesim();
    const kayit = this.o.kayit.susler.find((s) => s.ad === id);
    if (!kayit) return;
    const r = kaynak.getBoundingClientRect();
    kayit.nokta = nokta;
    this.o.kaydet();
    this.konan.get(id)?.remove();
    this.konan.delete(id);
    if (kaynak.parentElement === this.tepsi) kaynak.remove();
    this.koy(id, nokta, true);
    this.tepsiGuncelle();
    ses.pit();
    const el = this.konan.get(id)!;
    if (!TEST_MODU) {
      const h2 = el.getBoundingClientRect();
      const dx = r.left + r.width / 2 - (h2.left + h2.width / 2);
      const dy = r.top + r.height / 2 - (h2.top + h2.height / 2);
      el.animate([{ translate: `${dx}px ${dy}px`, opacity: 0.6 }, { translate: '0 0', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.3,.8,.4,1)' });
    }
    const k = this.o.efekt.kutu();
    const h3 = el.getBoundingClientRect();
    this.o.efekt.parilti(h3.left - k.left + h3.width / 2, h3.top - k.top + h3.height / 2, 6, 0.8, '#FFE45C');
  }

  private dokun(id: string, el: HTMLElement) {
    this.o.etkilesim();
    const s = susBilgi(id);
    if (s.canli === 'parti') {
      ses.ksilofon();
      ezil(el, 1.6, 420);
      this.o.canli?.(id);
      return;
    }
    if (id === 'balon') {
      ses.boing();
      if (!TEST_MODU) el.animate([{ translate: '0 0' }, { translate: '0 -14px' }, { translate: '0 4px' }, { translate: '0 0' }], { duration: 900, easing: 'ease-in-out' });
      return;
    }
    if (id === 'saat') {
      [0, 1, 2].forEach((i) => setTimeout(() => ses.tikir(i), sure(i * 160)));
      ezil(el, 1.4, 360);
      return;
    }
    ses.pit();
    ezil(el, 1.4, 360);
  }

  private noktalariGoster(t: SusYeri | null) {
    for (const n of this.noktaIsaret) n.remove();
    this.noktaIsaret = [];
    if (!t) return;
    const dolu = new Set(this.o.kayit.susler.map((s) => s.nokta).filter(Boolean));
    for (const n of NOKTALAR) {
      if (noktaTuru(n) !== t || dolu.has(n)) continue;
      const p = NOKTA[t];
      const i = h('i.pt-sus-nokta', { 'data-nokta': n, style: `left:${p.x}px;top:${p.y - (t === 'yer' ? 80 : t === 'hali' ? 30 : 0)}px` });
      this.o.kesit(noktaOyuk(n)).prepend(i);
      this.noktaIsaret.push(i);
    }
  }
  /** Ekran noktasına en yakın uygun boş nokta (70 px içinde) */
  private enYakin(id: string, x: number, y: number): string | null {
    let en: string | null = null;
    let enU = 90;
    for (const i of this.noktaIsaret) {
      const r = i.getBoundingClientRect();
      const u = Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y);
      if (u < enU) {
        enU = u;
        en = i.dataset.nokta!;
      }
    }
    void id;
    return en;
  }

  private surukle(id: string, kaynak: HTMLElement) {
    let tut: Tutulan | null = null;
    return {
      basla: (x: number, y: number) => {
        this.o.etkilesim();
        const r = kaynak.getBoundingClientRect();
        const en = Math.max(64, Math.min(140, r.width));
        tut = new Tutulan(this.o.efekt, this.resimEl(id), { en, boy: Math.max(64, Math.min(140, r.height)), sinif: 'pt-tutulan-sus' });
        tut.yer(x, y);
        kaynak.classList.add('pt-tutuldu');
        this.noktalariGoster(susBilgi(id).yer);
      },
      tasi: (x: number, y: number, dx: number) => tut?.yer(x, y, dx),
      birak: (x: number, y: number, kisa: boolean) => {
        kaynak.classList.remove('pt-tutuldu');
        const t = tut;
        tut = null;
        const n = kisa ? null : this.enYakin(id, x, y);
        this.noktalariGoster(null);
        if (!t) return;
        if (n) {
          t.kaldir();
          this.yerlestir(id, n, kaynak);
          return;
        }
        // tepsiye geri bırakıldı (konmuş süs geri alınır)
        if (!kisa && kaynak.classList.contains('pt-sus') && icinde(this.tepsi.getBoundingClientRect(), x, y, 20)) {
          t.kaldir();
          const kayit = this.o.kayit.susler.find((s) => s.ad === id);
          if (kayit) kayit.nokta = '';
          this.o.kaydet();
          this.kur();
          return;
        }
        const r = kaynak.getBoundingClientRect();
        void t.don_([r.left + r.width / 2, r.top + r.height / 2], 260);
      },
    };
  }

  /** Yeni süs tepsiye iner (mağazadan ya da hediye) */
  yeni(id: string) {
    this.kur();
    const b = this.tepsi.querySelector<HTMLElement>(`[data-sus="${id}"]`);
    if (b && !TEST_MODU) b.animate([{ transform: 'translateY(-80px) scale(.6)', opacity: 0 }, { transform: 'translateY(6px) scale(1.08,.92)', opacity: 1, offset: 0.7 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'ease-out' });
  }

  get durum() {
    return this.o.kayit.susler.map((s) => ({ ...s }));
  }

  kapat() {
    for (const f of this.birak) f();
  }
}
