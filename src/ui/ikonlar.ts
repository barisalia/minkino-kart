// Kalın konturlu, yuvarlak hatlı arayüz ikonları (currentColor kullanır).
const s = (ic: string, vb = '0 0 48 48') =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${ic}</svg>`;

export const IKON = {
  oyna: `<svg viewBox="0 0 48 48"><path d="M17 11.5c0-2.3 2.5-3.7 4.5-2.5l17 10.5c1.9 1.2 1.9 3.9 0 5.1l-17 10.5c-2 1.2-4.5-.2-4.5-2.5z" fill="currentColor" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/></svg>`,
  ev: s('<path d="M8 22 24 9l16 13"/><path d="M13 19v18a2 2 0 0 0 2 2h6V29h6v10h6a2 2 0 0 0 2-2V19"/>'),
  hoparlor: s('<path d="M8 19v10h7l10 8V11l-10 8z" fill="currentColor"/><path d="M31 18a8 8 0 0 1 0 12"/><path d="M36 13a15 15 0 0 1 0 22"/>'),
  sessiz: s('<path d="M8 19v10h7l10 8V11l-10 8z" fill="currentColor"/><path d="m32 19 10 10M42 19 32 29"/>'),
  muzik: s('<path d="M18 34V12l20-4v22"/><circle cx="13" cy="34" r="5" fill="currentColor"/><circle cx="33" cy="30" r="5" fill="currentColor"/>'),
  album: s('<rect x="9" y="7" width="30" height="34" rx="4"/><path d="M9 14h30"/><path d="m24 23 2.2 4.5 5 .7-3.6 3.5.8 5-4.4-2.4-4.4 2.4.8-5-3.6-3.5 5-.7z" fill="currentColor" stroke-width="2.5"/>'),
  kilit: s('<rect x="10" y="21" width="28" height="20" rx="5" fill="currentColor"/><path d="M16 21v-5a8 8 0 0 1 16 0v5"/>'),
  yildiz: `<svg viewBox="0 0 48 48"><path d="m24 4 5.9 12 13.2 1.9-9.5 9.3 2.2 13.1L24 34.1l-11.8 6.2 2.2-13.1-9.5-9.3L18.1 16z" fill="currentColor" stroke="#5a3617" stroke-width="3" stroke-linejoin="round"/></svg>`,
  tekrar: s('<path d="M38 24a14 14 0 1 1-4.1-9.9"/><path d="M36 6v9h-9" /> '),
  izgara: s('<rect x="8" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="8" width="13" height="13" rx="3" fill="currentColor"/><rect x="8" y="27" width="13" height="13" rx="3" fill="currentColor"/><rect x="27" y="27" width="13" height="13" rx="3" fill="currentColor"/>'),
  ebeveyn: s('<circle cx="24" cy="24" r="6"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2"/>'),
  kapat: s('<path d="m13 13 22 22M35 13 13 35"/>'),
  geri: s('<path d="M29 10 15 24l14 14"/>'),
  tac: s('<path d="M8 36h32M9 16l8 8 7-12 7 12 8-8-3 20H12z" fill="currentColor" stroke-width="4"/>'),
  onay: s('<path d="m11 25 9 9 17-19"/>'),
  sil: s('<path d="M10 14h28M19 14V9h10v5M14 14l2 26h16l2-26"/>'),
  el: s('<path d="M18 26V11a3 3 0 0 1 6 0v12m0-2a3 3 0 0 1 6 0v3m0-1a3 3 0 0 1 6 0v8c0 7-5 12-11 12s-9-3-12-8l-5-8a3 3 0 0 1 5-3l5 5"/>'),
};
