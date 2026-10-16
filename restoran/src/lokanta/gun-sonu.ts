/**
 * Gün sonu (§3a.11, dilimin kapanışı §13.7): tabela "Kapalı"ya döner, günün jetonları kasada yığılır (sayı yok),
 * dilimde defterin yalnız süs sekmesi: 3 masa örtüsünden biri seçilir ve masalara serilir; sonra "yarın" (güneş).
 * Tam Babaanne'nin Defteri P4'te (restoran/src/defter.ts) bunun yerine geçer.
 */
import { h, sure, TEST_MODU } from '../../../src/ui/dom';
import { L } from '../model';
import { salonSes, sesler } from '../sesler';
import { varlik, yeniden } from '../varliklar';

export const ORTULER = ['kareli', 'cicekli', 'puantiyeli'] as const;

export interface GunSonuSecenek {
  jeton: number;
  soyle: (metin: string) => Promise<void>;
  ortuSecildi: (ortu: string) => void;
  yarin: () => void;
}

export function gunSonuAc(kap: HTMLElement, s: GunSonuSecenek): HTMLElement {
  const levha = h('div.rs-gs-levha', { 'data-yuz': 'kapali' }, h('span.rs-levha-ay'));
  const jetonUrl = varlik('efekt/jeton') ?? yeniden('pasta/jeton-1');
  const yigin = h('div.rs-gs-yigin', {}, ...Array.from({ length: Math.min(16, s.jeton) }, (_, i) => h('span.rs-jeton', { style: `--i:${i}` }, jetonUrl ? h('img', { src: jetonUrl, alt: '', draggable: 'false' }) : null)));
  const ortuler = h('div.rs-gs-ortuler');
  const yarin = h('button.rs-gs-yarin', { type: 'button', 'aria-label': 'Yarın' }, h('span.rs-gunes'));
  yarin.hidden = true;
  const perde = h('div.rs-gun-sonu', {}, levha, yigin, ortuler, yarin);
  kap.append(perde);
  salonSes.gunSonu();

  let secildi = false;
  for (const o of ORTULER) {
    const b = h('button.rs-gs-ortu', { type: 'button', 'data-ortu': o, 'aria-label': o }, h('span.rs-ortu-ornek', { 'data-ortu': o }));
    b.addEventListener('click', () => {
      if (secildi) return;
      secildi = true;
      b.classList.add('rs-secili');
      sesler.cal('ting');
      s.ortuSecildi(o);
      void s.soyle(L.mino.ortu_tamam).then(() => {
        yarin.hidden = false;
        yarin.classList.add('rs-hopla');
      });
      window.setTimeout(() => perde.classList.add('rs-ortu-bitti'), sure(500));
    });
    ortuler.append(b);
  }
  yarin.addEventListener('click', () => {
    sesler.cal('hop');
    s.yarin();
  });
  void (async () => {
    await s.soyle(L.mino.gun_sonu);
    perde.classList.add('rs-kasa-goster');
    await s.soyle(L.mino.kasa);
    perde.classList.add('rs-ortu-goster');
    await s.soyle(L.mino.ortu_sec);
  })();
  if (TEST_MODU) perde.classList.add('rs-kasa-goster', 'rs-ortu-goster');
  return perde;
}
