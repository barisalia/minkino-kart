/**
 * Yeni çizgide (Astra, assets/dedektif-oyuncular) Mino ile Kino tek parça çizimle görünür; iskelet görünmez (dedektif.css).
 * Bu dosya o çizimlerin canlı kalmasını sağlar:
 *
 * - Ağız: konuşan karakterin çiziminin üstüne, sese göre (dudak senkronu: src/audio/dudak.ts) Astra'nın ağız karesi
 *   konur: assets/dedektif-oyuncular/agiz/<temel>-agiz-<az|orta|yuvarlak|dis>.webp (tuval temel çizimle aynı; yalnız
 *   ağız bölgesi dolu). Kapalı / gülümseyen ağız temel çizimin kendisi. Kare yoksa bir şey konmaz (bugünkü gibi).
 * - Kino'nun yönü: sola dönük çizimler (kino-dur-sol, kino-otur-sol, kino-adim-sol-*) geldiyse Kino baktığı yere göre
 *   onları kullanır. Aynalama yok (yüz lekesi ve fular ters dönmesin).
 */
import { Dudak } from '../../src/audio/dudak';
import { h } from '../../src/ui/dom';

const OYUNCU = import.meta.glob<string>('../../assets/dedektif-oyuncular/*.webp', { eager: true, query: '?url', import: 'default' });
const AGIZ = import.meta.glob<string>('../../assets/dedektif-oyuncular/agiz/*.webp', { eager: true, query: '?url', import: 'default' });

/** assets/dedektif-oyuncular/<ad>.webp adresi (yoksa null) */
export const oyuncuCizim = (ad: string): string | null => OYUNCU[`../../assets/dedektif-oyuncular/${ad}.webp`] ?? null;
const agizCizim = (temel: string, sekil: string): string | null => AGIZ[`../../assets/dedektif-oyuncular/agiz/${temel}-agiz-${sekil}.webp`] ?? null;

/** Hiç ağız karesi var mı (yoksa ağız döngüsü kurulmaz) */
export const AGIZ_VAR = Object.keys(AGIZ).length > 0;
/** Kino'nun sola dönük duruşu var mı (yoksa Kino sağa dönük kalır) */
export const KINO_SOL = !!oyuncuCizim('kino-dur-sol');

/** Bir karakterin ağız katmanı: temel çizimin (CSS ::after) tam üstünde, aynı kutuda */
export class CizgiAgiz {
  private dudak = new Dudak();
  private kat = h('i.dd-agiz-kat', { 'aria-hidden': 'true' });
  private son = '';

  /** temel: o an görünen tek parça çizimin adı (ör. 'mino-sapka', 'kino-dur-sol') */
  /** hazir: iskelet kurulunca (Karakter.hazir) içi baştan yazılır; katman ondan sonra eklenir */
  constructor(
    rig: HTMLElement,
    private temel: () => string,
    hazir: Promise<unknown> = Promise.resolve(),
  ) {
    rig.append(this.kat);
    void hazir.then(() => {
      if (!this.kat.isConnected || this.kat.parentElement !== rig) rig.append(this.kat);
    });
  }

  /** Konuşma başlıyor (cihaz sesinde / sessizde ağız metnin hece ritmiyle oynar) */
  hazirla(metin: string) {
    this.dudak.hazirla({ metin });
  }

  /** Her karede: konuşuyorsa sese göre ağız karesi, değilse temel çizimin kapalı ağzı */
  kare(simdi: number, konusuyor: boolean) {
    const sekil = this.dudak.kare(simdi, konusuyor);
    const u = sekil === 'kapali' || sekil === 'gulumse' ? null : agizCizim(this.temel(), sekil);
    const deger = u ? `url("${u}")` : '';
    if (deger === this.son) return;
    this.son = deger;
    this.kat.style.backgroundImage = deger;
  }
}

/** Mino'nun o an görünen tek parça çizimi (dedektif.css'teki sırayla aynı) */
export const minoTemel = (el: HTMLElement) =>
  el.classList.contains('dedektif-buyutec') ? 'mino-mercek' : el.classList.contains('dedektif-sapka') ? 'mino-sapka' : 'mino-dur';

/** Kino'nun o an görünen tek parça çizimi */
export const kinoTemel = (el: HTMLElement, sol: boolean) => `${el.dataset.poz === 'otur' ? 'kino-otur' : 'kino-dur'}${sol && KINO_SOL ? '-sol' : ''}`;

/** Kino'nun duruş çizimlerini yöne göre koyar (CSS değişkeni; sola dönük yoksa bir şey yapmaz) */
export function kinoYonuKoy(el: HTMLElement, sol: boolean) {
  if (!KINO_SOL) return;
  const dur = oyuncuCizim(sol ? 'kino-dur-sol' : 'kino-dur');
  const otur = oyuncuCizim(sol ? 'kino-otur-sol' : 'kino-otur') ?? oyuncuCizim('kino-otur');
  if (dur) el.style.setProperty('--dd-kino-dur', `url("${dur}")`);
  if (otur) el.style.setProperty('--dd-kino-otur', `url("${otur}")`);
  el.dataset.yon = sol ? 'sol' : 'sag';
}
