import { elmaResmi } from './elma';
import type { Ic, Meyve } from './model';

function ciz(body: string) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%" stroke="#171719" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+body+'</svg>';
}

const ustEkmek = 'M20 64C4 51 8 33 28 23Q56 8 93 17Q91 30 104 34Q103 47 117 50Q124 61 139 56L141 116Q143 131 127 133H33Q18 133 18 119Z';
const dolgu: Record<Ic, string> = {
  peynir: '<path d="m19 50 81-19q0 18 32 23l9 61-20 25-91-8Z" fill="#ffdb67"/>',
  domates: '<path d="M20 74q6-43 76-49 8 22 35 29 23 24 8 52-15 28-65 28-53 1-57-36Z" fill="#f65340"/>',
  marul: '<path d="M13 61q-6-14 10-17 1-14 17-12 11-16 23-8 15-11 27-3 6 20 36 29 19-4 17 12 14 11 2 22 13 13-1 23 4 17-12 18-5 15-22 10-10 11-24 4-17 8-31 0-17 7-24-6-18 4-19-11-16-6-7-22-10-11 2-20Z" fill="#97c848"/>',
};
export function kalanSandvic(ic: Ic[]) {
  const katlar = ic.map((id,i)=>'<g transform="translate(0 '+(11-i*3)+')">'+dolgu[id]+'</g>').join('');
  return ciz('<path transform="translate(0 16)" d="'+ustEkmek+'" fill="#eaa449"/>'+katlar+
    '<path d="'+ustEkmek+'" fill="#eaa449"/><path d="M28 62Q10 44 33 32 60 18 85 23q3 15 13 16 0 12 14 17 9 12 19 9l2 49q0 10-10 11H36q-11 0-10-11Z" fill="#ffecc9" stroke-width="1.7"/>');
}

export function isirilanMeyve(meyve: Meyve) {
  if(meyve==='armut') return ciz(
    '<path d="M76 41q-4-22 15-34l5 5q-13 12-15 30z" fill="#975e3f"/>'+
    '<path d="M79 30q16 0 18 18 2 13 8 24-10 6-7 16 0 11 11 14 4 10 17 10 6 17-2 29-11 16-44 15-34 1-47-15-18-23 4-51 20-25 23-45 3-15 19-15Z" fill="#b7d64b"/>'+
    '<path d="M105 72q-17 10-12 27 8 20 33 13-13 0-17-10-12-4-11-14-3-10 7-16Z" fill="#fff0bf" stroke-width="1.6"/>'
  );
  return elmaResmi(true);
}
