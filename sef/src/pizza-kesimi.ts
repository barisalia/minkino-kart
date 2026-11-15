export type PizzaKesigi='dikey'|'yatay';
export interface PizzaKesimi {kesikler:PizzaKesigi[]}
// Clockwise from the upper-left slice. Old saves tracked only a bite count.
export function alinanCeyrekler(v:unknown,adet:number):number[]{
  const siralar=Array.isArray(v)?v.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<4):[];
  return [...new Set([...siralar,0,1,2,3])].slice(0,Math.min(4,Math.max(0,adet)));
}
export function ceyrekKonumu(x:number,y:number){return y<.5?(x<.5?0:1):(x<.5?3:2);}
export function pizzaKesiminiOku(v:unknown):PizzaKesimi|undefined{
  if(!v||typeof v!=='object'||!('kesikler' in v)||!Array.isArray(v.kesikler))return;
  return {kesikler:[...new Set(v.kesikler.filter((k):k is PizzaKesigi=>k==='dikey'||k==='yatay'))]};
}
