import { elmaResmi, kapaliKutu } from './elma';
// Yeniden boyutlandırıldığında da düz kalan renkler: dış siluet tek siyah çizgi.
const svg=(body:string)=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none" stroke="#141414" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">'+body+'</svg>';
const food:Record<string,string>={
 ekmek:svg('<path d="M16 70C-1 56 0 34 19 21 46 1 111-1 139 18c22 14 24 36 6 53l4 61q1 21-20 21H32q-23 1-23-21z" fill="#eaa449"/><path d="M25 67Q7 52 19 35C39 8 118 6 140 33q14 18-6 34l4 62q1 12-10 12H33q-13 0-12-13z" fill="#ffecc9" stroke-width="1.8"/>'),
 marul:svg('<path d="M68 10q16-15 26 1 19-9 24 8 21-4 20 15 23 4 11 23 19 12 3 26 15 17-5 27 4 16-13 19-7 19-22 13-8 18-24 11-14 12-25-3-17 4-23-11-20 4-24-15-15-4-9-22-13-12-1-24Q-1 66 11 55 3 38 20 33q-1-17 18-17 10-13 30-6Z" fill="#97c848"/><path d="M77 149q2-59-2-124m3 87Q58 84 29 77m48 1Q53 56 42 47m36 81q18-27 45-39M77 85q21-19 36-41" stroke="#4e702a" stroke-width="3"/>'),
 domates:svg('<circle cx="80" cy="80" r="77" fill="#f65340"/>'+[0,90,180,270].map(a=>'<g transform="rotate('+a+' 80 80)"><path d="M29 66q7-28 31-39 11-5 13 7l-2 26q-1 12-13 13l-23 1q-11 0-6-8z" fill="#cf3930" stroke-width="1.5"/><path d="M45 61q-6-1-5-6 3-5 8-1l7 7zm14-14q-5-7-1-10 6-2 7 4v10z" fill="#ffe382" stroke="none"/></g>').join('')),
 peynir:svg('<path fill-rule="evenodd" d="M23 3h113q21 0 21 21v111q0 22-22 22H24Q3 157 3 136V26Q3 3 23 3Zm89 44a13 13 0 1 0 26 0 13 13 0 1 0-26 0Zm-84 71a10 10 0 1 0 20 0 10 10 0 1 0-20 0Z" fill="#ffdb67"/>'),
 elma:elmaResmi(), 'bento-kapali':kapaliKutu,
 armut:svg('<path d="M77 40q-4-22 15-34l5 5q-13 12-15 30z" fill="#975e3f"/><path d="M80 29q16 0 19 19 4 22 21 43 20 30 6 50-11 16-45 15-35 2-49-15-18-23 4-52 20-24 23-44 3-16 21-16z" fill="#b7d64b"/>')
};
export const malzeme=(id:string)=>food[id]?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(food[id]).replace(/'/g,'%27'):undefined;
