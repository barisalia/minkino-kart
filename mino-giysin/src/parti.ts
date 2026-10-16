/**
 * Kostüm Partisi (final, §2.7): dört arkadaş odada, dolap ve sepet tamamen serbest. Her yeni parçada arkadaşlar alkışlar;
 * üst üste 5 kez aynı parça gelirse Mino "Yeter ama!" deyip onu tavana fırlatır (gizli sürpriz 8: tavana takılır, bir
 * sonraki dokunuşta düşer). "Bitti"de Mino halıda küçük bir geçit yapar: soldan sağa yürür, döner, eğilir; arkadaşlar
 * "Yaşasın!" der. Döndürme yok: dönüş aynalama (scaleX) ile, yürüyüş sekme ve ezilme-esneme ile.
 */
import { h } from '../../src/ui/dom';
import G from '../../content/mino-giysin.json';
import { bekle, kavis, ms, oynat, type Nokta } from './anim';
import type { Arkadas } from './arkadas';
import type { KostumluMino } from './kostumlu-mino';
import type { ParcaId } from './model';
import { parcaResmi } from './resimler';
import { minoSoyle, ses } from './ses';

/** Arkadaşlar alkışlar: sırayla hoplar, mutlu yüz */
export function partiAlkis(arkadaslar: Arkadas[]) {
  if (!arkadaslar.length) return;
  ses.alkis(8);
  arkadaslar.forEach((a, i) => {
    window.setTimeout(() => {
      a.ifade(a.ad === 'ege' ? 'kikir' : a.ad === 'kino' ? 'heyecan' : 'mutlu', 1400);
      void a.hopla(0.7);
      if (a.ad !== 'ege') void a.oynat('sevin', 900);
    }, ms(i * 140));
  });
}

/** Parçayı tavana fırlatır: yukarı uçar, tavana takılıp sallanır; dönen öğe dokununca düşürülür */
export async function tavanaAt(katman: HTMLElement, id: ParcaId, a: Nokta, boy: { w: number; h: number }, W: number): Promise<HTMLElement> {
  const el = h('img.mg-ucan', { src: parcaResmi(id), alt: '', draggable: 'false', style: `width:${boy.w}px;height:${boy.h}px` });
  katman.append(el);
  ses.firlat();
  const hedef = { x: Math.min(W - boy.w, Math.max(boy.w, a.x + 40)), y: boy.h * 0.3 };
  await kavis(el, a, hedef, 520, { tepe: -30 });
  el.remove();
  const t = h('button.mg-tavanda', {
    type: 'button',
    'aria-label': 'Tavandaki parça',
    'data-parca': id,
    style: `left:${hedef.x - boy.w / 2}px;top:${hedef.y - boy.h / 2}px;width:${boy.w}px;height:${boy.h}px`,
  }, h('img', { src: parcaResmi(id), alt: '', draggable: 'false' }));
  katman.append(t);
  ses.tak();
  return t;
}

/** Geçit: Mino halıda soldan sağa yürür, ortada eğilir; arkadaşlar "Yaşasın!" */
export async function gecit(mino: KostumluMino, arkadaslar: Arkadas[], oda: HTMLElement) {
  const W = oda.clientWidth;
  const mr = mino.el.getBoundingClientRect();
  const or = oda.getBoundingClientRect();
  const sol = Math.max(-mr.left + or.left + 10, -W * 0.22);
  const sag = Math.min(or.right - mr.right - 10, W * 0.22);
  void minoSoyle(G.mino.parti);
  // sola sekerek git (sola dönük: aynalama), sonra sağa yürü, ortada eğil
  const yuru = async (x0: number, x1: number, yon: 1 | -1, adim: number) => {
    const kare: Keyframe[] = [];
    for (let i = 0; i <= adim * 2; i++) {
      const u = i / (adim * 2);
      const yukari = i % 2 === 1;
      kare.push({ transform: `translateX(${x0 + (x1 - x0) * u}px) translateY(${yukari ? -12 : 0}px) scale(${yon * (yukari ? 0.97 : 1.03)}, ${yukari ? 1.04 : 0.96})` });
    }
    await oynat(mino.ic, kare, adim * 360, { fill: 'forwards', easing: 'linear' });
  };
  await yuru(0, sol, -1, 3);
  await yuru(sol, sag, 1, 6);
  await yuru(sag, 0, -1, 3);
  await oynat(mino.ic, [{ transform: 'translateX(0) scale(-1, 1)' }, { transform: 'translateX(0) scale(1.08, 0.92)', offset: 0.5 }, { transform: 'translateX(0) scale(1,1)' }], 260, { fill: 'forwards' });
  mino.mino.tepki('selam');
  await bekle(700);
  mino.ic.getAnimations().forEach((a) => a.cancel());
  void minoSoyle(G.hazir.yasasin);
  ses.yasasin();
  partiAlkis(arkadaslar);
  mino.mino.tepki('dans');
  await bekle(2400);
}
