import {
  BIRIM,
  DUSUS,
  raylar,
  yerelRay,
  pim,
  donus,
  giris,
  cikis,
  yon,
  type Tip,
  type Nokta,
  type Parca,
} from './misket-geometri';

const m = (v: number) => Number(v.toFixed(2));
/**
 * İri top (yönetici 23 Kasım gecesi: bilye yasak, KALITE-KURALLARI 14; Top Parkuru'ndaki gibi iri top). Yarıçap 22 (eski
 * misket 13,5): rayın üstünde yuvarlanır (misket-hareket.ts → rayın normali boyunca KAYMA kadar yukarıda). Astra'nın çizimi
 * (Paket Matematik-A1 → assets/matematik/top-selalesi/top.webp, 200 × 200, top 170 px çapında ortada) gelene dek eski
 * topun çizgisi büyütülerek kullanılır.
 */
const topCizimleri = import.meta.glob<string>('../../assets/matematik/top-selalesi/*.webp', { eager: true, query: '?url', import: 'default' });
export const topCizimi = (ad: string) => topCizimleri['../../assets/matematik/top-selalesi/' + ad + '.webp'];
export const TOP_R = 22;
export const KAYMA = TOP_R - 13.5;
const TOP_TUVAL = (TOP_R * 2 * 200) / 170;
export const yol = (pts: Nokta[]) => pts.map((p, i) => (i ? 'L' : 'M') + m(p.x) + ',' + m(p.y)).join('');
const rayAdi = (tip: Tip) => 'mk-ray-' + tip;
export const rayKullan = (tip: Tip) => `<use href="#${rayAdi(tip)}"/>`;
export const konum = (p: Parca) => {
  const n = pim(p.kat, p.goz);
  return `translate(${n.x} ${n.y}) scale(${yon(p.kat)} 1)`;
};

// Aynı ray profili rafta, pistte ve bu iki kumandanın çiziminde okunur.
export function modSimgesi(mod: 'atolye' | 'serbest') {
  const resim = mod === 'atolye'
    ? `<path d="M13 26v15h8V29m24 6v6h7v-5" fill="#efb85e"/>
       <path d="M8 41h49v4H8z" fill="#547e87"/>
       <path d="M8 20h5l1 4 36 9 5-3 2 4-6 6-41-10q-3-1-3-4z" fill="#ff7861"/>
       <path d="m14 24 36 9 5-3" fill="none"/>
       <circle cx="24" cy="16" r="8.5" fill="#347ee6"/>
       <path d="M20 14q1-3 4-3" fill="none" stroke="white" stroke-width="2.8"/>`
    : `<path d="m7 34 12 1 1 4 11 1 2-4 22 2v7L7 42z" fill="#35b8ae"/>
       <path d="m10 36 7 .6m19 3 15 1" fill="none" stroke="#a2eee0" stroke-width="1.9"/>
       <g transform="rotate(36 32 22)">
         <rect x="28" y="13" width="8" height="22" rx="3" fill="#ffc052"/>
         <path d="M29 20h6" fill="none"/>
         <path d="M19 9h20q4 0 4 4v3q0 3-4 3h-4l-2-2h-9l-1 2h-4q-2 0-2-3v-4q0-3 2-3z" fill="#fc806c"/>
         <path d="M20 10v8m20-7v6" fill="none" stroke-width="1.6"/>
       </g>
       <path d="m18 26 3 2m-5 3 4 .3" fill="none" stroke="#935730" stroke-width="2.4"/>`;
  return `<svg viewBox="0 0 64 50" aria-hidden="true"><g stroke="#221d22" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${resim}</g></svg>`;
}

function kanal(merkez: Nokta[], renk: string, yuvarlak = false) {
  const d = yol(merkez);
  // Aynı temas hattından taban, oluk ve dudağı çıkar. Uçları pime sıfır taşmayla oturur.
  return `<g fill="none" stroke-linejoin="round" stroke-linecap="${yuvarlak ? 'round' : 'butt'}">
    <path d="${d}" transform="translate(0 7)" stroke="#221e23" stroke-width="22"/>
    <path d="${d}" transform="translate(0 7)" stroke="${renk}" stroke-width="17.5"/>
    <path d="${d}" transform="translate(0 -1)" stroke="#221e23" stroke-width="10"/>
    <path d="${d}" transform="translate(0 -1)" stroke="#44bfbb" stroke-width="6"/>
    <path d="${d}" transform="translate(0 -2.6)" stroke="#9de8d9" stroke-width="1.8"/>
  </g>`;
}

function baslik(tip: Tip) {
  const noktalar = yerelRay(tip);
  const en = raylar[tip].birim * BIRIM;
  const bitis = noktalar.at(-1)!.y;
  // Bir çemberde dikey öteleme üstte ve altta yer değiştirir. Çemberin
  // dudağını merkez hattına eşmerkezli çiz; birleşimi ön oluk kapatır.
  const ray = tip === 'halka'
    ? `<g fill="none" stroke-linejoin="round">
         <path d="${yol(noktalar.slice(1, -1))}" stroke="#221e23" stroke-width="18"/>
         <path d="${yol(noktalar.slice(1, -1))}" stroke="#4bc5b7" stroke-width="13.5"/>
         <path d="${yol(noktalar.slice(12, 49))}" stroke="#adf1d9" stroke-width="3" stroke-linecap="round"/>
       </g>${kanal([noktalar[0], noktalar.at(-1)!], raylar[tip].renk)}`
    : kanal(noktalar, raylar[tip].renk);
  const diller = tip === 'vadi' ? [0, 1, 2].map((i) => {
    const x = 58 + 18 * i;
    return `<rect x="${x}" y="37" width="13" height="${30 - i * 5}" rx="6" fill="${['#ffbf48', '#ff8068', '#74cce3'][i]}" stroke="#221e23" stroke-width="2.2"/>`;
  }).join('') : '';
  // Her birimde tek bir gömülü pirinç pim bulunur; çocuk uzunluğu elde de sayabilir.
  const pimler = Array.from({length: raylar[tip].birim}, (_, i) => {
    const x = (i + 0.5) * BIRIM;
    const y = x * DUSUS / BIRIM + (tip === 'vadi' ? 23 * Math.sin(x / en * Math.PI) ** 2 : 0);
    return `<circle cx="${x}" cy="${m(y + 10.3)}" r="2.7" fill="#fff0bf" stroke="#4b3632" stroke-width="1.4"/>`;
  }).join('');
  return `<g id="${rayAdi(tip)}">${diller}${ray}${pimler}
    <path d="M0 -4v20 M${en} ${m(bitis - 4)}v20" stroke="#30262a" stroke-width="1.7"/>
  </g>`;
}
const civata = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="4.2" fill="#ffdd8e" stroke="#37262a" stroke-width="2"/><path d="M${x - 1.8} ${y + 1.2}l3.6 -2.4" stroke="#74513b" stroke-width="1.5"/>`;
const tipler = Object.keys(raylar) as Tip[];
export const stokYerleri: Record<Tip, number> = { kisa: 178, uzun: 292, vadi: 486, halka: 691 };
export const rafY = (tip: Tip) => tip === 'vadi' ? 529 : tip === 'halka' ? 565 : 553;
export function parkurCiz() {
  const direkler = [208, 543, 895]
    .map((x, i) => {
      const y = 103 + i * 20;
      return `<g transform="translate(${x} 0)" stroke="#302429" stroke-width="2.6" stroke-linejoin="round">
        <path d="M3 ${y+54}l50-45 7 7-58 56z" fill="#e7a754"/>
        <rect x="-12" y="${y}" width="24" height="${460-y}" rx="7" fill="#f4c176"/>
        <path d="M-6 ${y+29}v${392-y}" stroke="#ffdf9f" stroke-width="4" stroke-linecap="round"/>
        <path d="M-22 455v-5q0-5 6-7l3-7h26l3 7q6 2 6 7v5z" fill="#466e79"/>
        ${[y+13, 251, 389].map(h => civata(0, h)).join('')}
      </g>`;
    })
    .join('');
  const rack = tipler
    .map((tip) => {
      const x = stokYerleri[tip],
        en = raylar[tip].birim * BIRIM,
        y = rafY(tip);
      return `<g class="mk-kumanda mk-stok" role="button" tabindex="0" data-tip="${tip}" aria-label="${raylar[tip].ad}" aria-pressed="false">
      <rect class="mk-stok-zemin" x="${x - 9}" y="502" width="${en + 18}" height="97" rx="14"/>
      <g transform="translate(${x} ${y})">${rayKullan(tip)}</g>
      <rect x="${x - 9}" y="500" width="${en + 18}" height="103" fill="transparent"/>
    </g>`;
    })
    .join('');
  return `<defs>
    ${tipler.map(baslik).join('')}
    <g id="mk-misket">${topCizimi('top')
      ? `<image href="${topCizimi('top')}" x="${m(-TOP_TUVAL / 2)}" y="${m(-TOP_TUVAL / 2)}" width="${m(TOP_TUVAL)}" height="${m(TOP_TUVAL)}"/>`
      : `<g transform="scale(${m(TOP_R / 13.5)})"><circle r="13.5" fill="#316cd4" stroke="#251f29" stroke-width="2.7"/>
      <path d="M-9 7C-2 4 2 2 6 -10C12 -7 13 2 9 7C4 6 0 10 -4 11Z" fill="#88dfee"/>
      <path d="M-8 -3Q-7 -9 -2 -9" fill="none" stroke="#fff9e3" stroke-width="3.2" stroke-linecap="round"/></g>`}</g>
    ${topCizimi('top-ez') ? `<g id="mk-top-ez"><image href="${topCizimi('top-ez')}" x="${m(-TOP_TUVAL / 2)}" y="${m(-TOP_TUVAL / 2)}" width="${m(TOP_TUVAL)}" height="${m(TOP_TUVAL)}"/></g>` : ''}
  </defs>
  <g aria-hidden="true">${direkler}
    <rect x="55" y="464" width="1008" height="13" rx="6" fill="#9d6266" stroke="#32272a" stroke-width="2.8"/>
    <rect x="46" y="453" width="1025" height="16" rx="8" fill="#ffcf89" stroke="#32272a" stroke-width="2.8"/>
    <path d="M83 452V101h24v351M80 110h70v9H80z" fill="#ffd191" stroke="#34262b" stroke-width="3"/>
    ${civata(95, 138)}${civata(95, 430)}
    <path d="M934 160v65l39 -28z" fill="#e6aa70" stroke="#332730" stroke-width="2.7"/>
    <g class="mk-canlar" transform="translate(121 315)"><path d="M-4 -17h35" stroke="#4a3540" stroke-width="5" stroke-linecap="round"/>
      ${[0, 1, 2].map((i) => `<g class="mk-can"><path d="M${i * 12 + 1} -17v6" stroke="#372431" stroke-width="2"/><rect x="${i * 12 - 3}" y="-11" width="8" height="${24 + i * 5}" rx="4" fill="${['#ffc34d', '#f79277', '#83cbdf'][i]}" stroke="#342530" stroke-width="2"/></g>`).join('')}</g>
    ${kanal(donus(0), '#ff9c85', true)}${kanal(donus(1), '#ffbd73', true)}
    <g transform="translate(965 187)"><g class="mk-cark">${['#ff8a73','#f9bc44','#61c6ba','#84a9ec'].map((c,i) => `<g transform="rotate(${i*90})" stroke="#28202a" stroke-width="2.3" stroke-linejoin="round"><path d="M0 0Q-14 -3 -18 -19Q-9 -32 3 -32Q14 -16 0 0Z" fill="${c}"/><path d="M0 0Q-5 -13 3 -32" fill="none" stroke-width="1.6"/></g>`).join('')}
      <circle r="6.4" fill="#ffe08e" stroke="#28202a" stroke-width="2.5"/></g></g>
    ${kanal(giris, '#f38373')}${kanal(cikis, '#f38373')}
    <g class="mk-bayrak" transform="translate(1049 450)"><g class="mk-flama">
      <path d="M0 2v-48" stroke="#342630" stroke-width="4" stroke-linecap="round"/>
      <path d="M-1 -46q-12 6 -29 0l4 11 -5 8q15 7 30 0Z" fill="#ef7b71" stroke="#342630" stroke-width="2.5"/>
      <path d="M-16 -40l2 4 4 1 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 -1Z" fill="#ffdf7c"/>
    </g></g>
    <g class="mk-zil"><g transform="translate(1047 438)" stroke="#272026" stroke-width="2.6" stroke-linejoin="round">
      <path d="M-30 25h60l4 6q0 4-6 4h-56q-6 0-6-4z" fill="#95526c"/>
      <path d="M-28 24Q-26 2-3 0v-4h6v4q22 2 25 24z" fill="#ffbd31"/>
      <rect x="-8" y="-8" width="16" height="5" rx="2.5" fill="#ffc64d"/>
      <path d="M-27 21q27 5 54 0l4 4q-29 7-62 0z" fill="#f2a12d"/>
      <path d="M-19 14q4-8 12-10" fill="none" stroke="#fff0aa" stroke-width="3.4" stroke-linecap="round"/>
    </g></g>
    <g class="mk-cin-izleri" fill="none" stroke="#ce823b" stroke-width="3.5" stroke-linecap="round">
      <path d="M1080 438l8 -6m-12 -2 4 -8m-55 11 -5 -6"/>
    </g>
  </g>
  <g class="mk-yol"></g><g class="mk-hedefler"></g>
  <g class="mk-hazne mk-kumanda" data-is="yukle" role="button" tabindex="0" aria-label="Topu başlangıç çanağına koy">
    <rect x="40" y="46" width="60" height="90" rx="14" fill="transparent"/>
    <path d="M76 76q0 -5 5 -5h3q5 1 5 7v9h47v11H86q-10 0 -10 -10Z" fill="#ef877b" stroke="#2e2630" stroke-width="3"/>
    <ellipse class="mk-yukleme-yeri" cx="105" cy="81" rx="15" ry="15" fill="#fff4c2" stroke="#98683f" stroke-width="2" stroke-dasharray="4 4"/>
  </g>
  <g class="mk-kol mk-kumanda" role="button" tabindex="0" data-is="gonder" aria-label="Kırmızı kolu çek ve topu gönder">
    <rect x="100" y="18" width="82" height="94" rx="14" fill="transparent"/>
    <g class="mk-kol-sap"><path d="M130 97l22 -47" stroke="#30212b" stroke-width="13" stroke-linecap="round"/>
    <path d="M130 97l22 -47" stroke="#ffbc89" stroke-width="7" stroke-linecap="round"/>
    <circle cx="153" cy="49" r="14" stroke="#30212b" stroke-width="3" fill="#fe766a"/>
    <path d="M147 44q2 -3 6 -3" stroke="#ffdbc4" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <circle cx="130" cy="97" r="8" fill="#d98264" stroke="#34252a" stroke-width="2.6"/>${civata(130, 97)}
  </g>
  <g aria-hidden="true"><rect x="35" y="499" width="1050" height="115" rx="25" fill="#e5a369" stroke="#30252b" stroke-width="3.5"/>
    <rect x="35" y="493" width="1050" height="114" rx="25" fill="#ffdb99" stroke="#30252b" stroke-width="3.5"/>
    <rect x="48" y="504" width="1024" height="91" rx="18" fill="#fbebc5" stroke="#ac7954" stroke-width="2"/>
  </g>${rack}
  <g class="mk-top-yuvasi mk-kumanda" role="button" tabindex="0" data-is="top" aria-label="Mavi topu al">
    <rect x="52" y="511" width="102" height="80" rx="17" fill="transparent"/>
    <ellipse cx="100" cy="559" rx="29" ry="10" fill="#d2aa80" stroke="#694c44" stroke-width="2.3"/>
    <ellipse cx="100" cy="555" rx="24" ry="8" fill="#9a7478"/>
    <g class="mk-stok-top" transform="translate(100 541)"><use href="#mk-misket"/></g>
  </g>
  <g class="mk-kumanda mk-geri" role="button" tabindex="0" data-is="geri" aria-label="Son ray değişikliğini geri al">
    <rect x="962" y="503" width="107" height="93" fill="transparent"/>
    <rect x="974" y="515" width="83" height="69" rx="21" fill="#fff5d7" stroke="#765646" stroke-width="2.5"/>
    <path d="M997 543l13 -12v8h9c15 0 21 15 11 24q1 -12 -12 -12h-8v7z" fill="#61bcb4" stroke="#352834" stroke-width="2.8" stroke-linejoin="round"/>
  </g>
  <g class="mk-rehber" pointer-events="none" aria-hidden="true"></g>
  <g class="mk-oniz" pointer-events="none"></g>
  <g class="mk-top-konum" pointer-events="none" visibility="hidden"><g class="mk-top-donus"><use href="#mk-misket"/></g></g>`;
}
