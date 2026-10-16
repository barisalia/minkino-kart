/**
 * Gün sonu (§3a.11): son müşteri gidince tabela "Kapalı"ya döner, günün jetonları kasada yığılır (sayı yok), sonra
 * Babaanne'nin Defteri açılır (restoran/src/defter.ts): çocuk bir şey alır ya da biriktirir. Alınan masa / süs için
 * defter kenara çekilir, çocuk lokantada yerini seçer (lokanta.ts → yerlestirme). Sonra "yarın" (güneş).
 */
import { h, TEST_MODU } from '../../../src/ui/dom';
import { defterAc, type DefterSecenek } from '../defter';
import { L } from '../model';
import { salonSes } from '../sesler';
import { varlik, yeniden } from '../varliklar';

export interface GunSonuSecenek extends Omit<DefterSecenek, 'kapandi'> {
  /** bugün kazanılan jeton (yığın) */
  gunJeton: number;
  yarin: (alinan: number) => void;
}

export interface GunSonu {
  el: HTMLElement;
  /** yerleştirme sırasında perde ve defter gizlenir */
  gizle(g: boolean): void;
  kapat(): void;
}

export function gunSonuAc(kap: HTMLElement, s: GunSonuSecenek): GunSonu {
  const levha = h('div.rs-gs-levha', { 'data-yuz': 'kapali' }, h('span.rs-levha-ay'));
  const jetonUrl = varlik('efekt/jeton') ?? yeniden('pasta/jeton-1');
  const yigin = h('div.rs-gs-yigin', {}, ...Array.from({ length: Math.min(16, s.gunJeton) }, (_, i) => h('span.rs-jeton', { style: `--i:${i}` }, jetonUrl ? h('img', { src: jetonUrl, alt: '', draggable: 'false' }) : null)));
  const perde = h('div.rs-gun-sonu', {}, levha, yigin);
  kap.append(perde);
  salonSes.gunSonu();
  let defter: ReturnType<typeof defterAc> | null = null;
  let kapandi = false;

  void (async () => {
    await s.soyle(L.mino.gun_sonu);
    if (kapandi) return;
    perde.classList.add('rs-kasa-goster');
    if (s.gunJeton > 0) await s.soyle(L.mino.kasa);
    if (kapandi) return;
    perde.classList.add('rs-defter-acik');
    defter = defterAc(perde, { ...s, kapandi: (n) => s.yarin(n) });
  })();
  if (TEST_MODU) perde.classList.add('rs-kasa-goster');

  return {
    el: perde,
    gizle(g: boolean) {
      perde.classList.toggle('rs-gs-gizli', g);
      defter?.gizle(g);
    },
    kapat() {
      kapandi = true;
      defter?.kapat();
      perde.remove();
    },
  };
}
