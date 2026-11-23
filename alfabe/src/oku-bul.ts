// "Oku ve bul" (Ceren'le oku'nun ısınması, 21 Kasım): çocuk taştaki sözcüğü kendi okur (ses yok), resimlerden doğrusuna
// dokunur. Doğruysa Ceren sözcüğü okur ve heceleri sırayla yanar; yanlışta ceza yok, Ceren sözcüğü hece hece okur ve
// çocuk yeniden seçer. Resimler ve kayıtlar Harf Atölyesi'nin sözcük havuzundan (pano-sozcukleri.ts; yeni çizim yok).
// Kurallar: oku-bul-kurallari.ts.
import { dersKaydiniOku, dersKaydiniYaz } from './ders-kaydi';
import { oyunSesi } from './oyun-sesi';
import { resmiCanlandir } from './kesfet-canlanma';
import { kaynakAdi, sozcukKareleri } from './a1-kareler';
import { heceler, panoAdi, panoResmi, adSesi, parcaSesi } from './pano-sozcukleri';
import { gecmisiYaz, okuBulOturumu, type OkuBulGecmis, type OkuBulSozcuk, type OkuBulTuru } from './oku-bul-kurallari';
import type { CumleYasi } from './cumle-okuma-kurallari';

const KAYIT = 'minkino-oku-bul-v1';
export const YONERGE = 'cumle-okubul-yonerge';

/** Havuzun resimli, kayıtlı sözcükleri (oku-bul-kurallari'nın beklediği biçimde) */
export function okuBulListesi(): OkuBulSozcuk[] {
  return Object.keys(heceler).filter((id) => !!panoResmi(id)).map((id) => ({ id, ad: panoAdi(id), heceler: heceler[id] }));
}
function gecmisOku(): OkuBulGecmis {
  try { const k = JSON.parse(dersKaydiniOku(KAYIT) ?? '{}'); return { gorulme: k.gorulme ?? {}, son: Array.isArray(k.son) ? k.son : [] }; } catch { return { gorulme: {}, son: [] }; }
}
/** Bu çocuk için bir oturum (boşsa ısınma atlanır) */
export function okuBulTurlari(bitenHarfler: string[], yas: CumleYasi): OkuBulTuru[] {
  return okuBulOturumu(okuBulListesi(), bitenHarfler, yas, gecmisOku());
}

export interface OkuBulBaglami {
  sahne: HTMLElement;
  oku: (id: string, sonra?: () => void) => void;
  sustur: () => void;
  bekle: (ms: number, f: () => void) => void;
  ilerleme: HTMLElement;
  cerenYuzu: string;
}

/** Turları oynatır; bitince `bitti` çağrılır. */
export function okuBulOyna(b: OkuBulBaglami, turlar: OkuBulTuru[], bitti: () => void) {
  const { sahne } = b;
  let no = 0;
  const noktalar = () => {
    b.ilerleme.innerHTML = '<span class="at-adim co-adim">' + turlar.map((_, i) => '<i class="' + (i < no ? 'at-dolu' : i === no ? 'at-dolu at-simdi' : '') + '"></i>').join('') + '</span>';
  };
  function tur() {
    if (no >= turlar.length) { dersKaydiniYaz(KAYIT, JSON.stringify(gecmisiYaz(gecmisOku(), turlar))); bitti(); return; }
    noktalar();
    const t = turlar[no];
    const hc = heceler[t.hedef];
    sahne.dataset.evre = 'okubul';
    sahne.dataset.hedef = t.hedef;
    sahne.dataset.soru = String(no);
    sahne.dataset.bekliyor = 'false';
    sahne.innerHTML = b.cerenYuzu + '<div class="co-okubul">' +
      '<p class="co-okubul-soz" aria-label="Sözcük: ' + panoAdi(t.hedef) + '">' + hc.map((h, i) => '<span class="co-okubul-hece" data-i="' + i + '">' + (i === 0 ? h.charAt(0).toLocaleUpperCase('tr') + h.slice(1) : h) + '</span>').join('') + '</p>' +
      '<div class="co-okubul-resimler" data-adet="' + t.secenekler.length + '">' + t.secenekler.map((id) => '<button type="button" class="co-okubul-resim" data-id="' + id + '" aria-label="Resim"><img src="' + panoResmi(id) + '" alt="" draggable="false"></button>').join('') + '</div></div>';
    const hecelerEl = [...sahne.querySelectorAll<HTMLElement>('.co-okubul-hece')];
    const yak = (i: number) => hecelerEl.forEach((e, j) => e.classList.toggle('co-yanik', j === i));
    let kilit = false;
    const acik = () => { kilit = false; sahne.dataset.bekliyor = 'true'; };
    sahne.querySelectorAll<HTMLButtonElement>('.co-okubul-resim').forEach((d) => {
      d.onclick = () => {
        if (kilit) return;
        kilit = true;
        sahne.dataset.bekliyor = 'false';
        b.sustur();
        if (d.dataset.id !== t.hedef) {
          // ceza yok: komik bir 'boyoyoy' (cila.ts), Ceren hece hece okur (heceler sırayla yanar), çocuk yeniden seçer
          oyunSesi('geri');
          d.classList.add('co-okubul-yanlis');
          const heceHece = (i: number) => {
            if (i >= hc.length) { yak(-1); acik(); return; }
            yak(i);
            b.oku(parcaSesi(hc[i]), () => b.bekle(180, () => heceHece(i + 1)));
          };
          heceHece(0);
          return;
        }
        oyunSesi('birles');
        d.classList.add('co-okubul-dogru');
        // Doğru resim canlanır (Keşfet'in hareket kareleri varsa onlarla).
        resmiCanlandir(d.querySelector('img'), panoAdi(t.hedef), true, sozcukKareleri(kaynakAdi(t.hedef)));
        sahne.querySelectorAll('.co-okubul-resim').forEach((x) => x.classList.toggle('co-okubul-soluk', x !== d));
        // doğru: Ceren sözcüğü okur, heceler sırayla yanar
        let i = 0;
        yak(0);
        const adim = () => { i++; if (i < hc.length) { yak(i); b.bekle(260, adim); } };
        b.bekle(260, adim);
        b.oku(adSesi(t.hedef), () => { hecelerEl.forEach((e) => e.classList.add('co-yanik')); b.bekle(800, () => { no++; tur(); }); });
      };
    });
    if (no === 0) b.oku(YONERGE, acik); else b.bekle(300, acik);
  }
  tur();
}
