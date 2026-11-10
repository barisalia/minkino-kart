import assert from 'node:assert/strict';
import {durum, gunuBitir, urunAl, satinAl, hayvanSat, tedaviEt, topluYika} from '../pati-yeni/ilerleme.js';
const key='pati-yeni-ilerleme-v1',store=new Map();
globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
for(const [gun,zam] of [[1,0],[7,0],[8,1],[14,1],[15,2]]){
 store.set(key,JSON.stringify({gun,para:200,hayvanlar:{kopek:{hastaGun:gun}},canta:{}}));
 let bakiye=200;
 for(const [id,taban] of [['biskuvi',1],['frizbi',6]]){
  assert.equal((await urunAl(id,taban+zam)).para,bakiye-=taban+zam);
 }
 assert.equal((await tedaviEt('kopek',true,3+zam)).para,bakiye-=3+zam);
 assert.equal((await satinAl('kedi',18+zam)).para,bakiye-=18+zam);
 assert.equal((await topluYika(gun)).para,bakiye-=10+zam);
 const kayit=durum();
 kayit.hayvanlar.kedi.ogrenilen=['su','mama'];store.set(key,JSON.stringify(kayit));
 assert.equal((await hayvanSat('kedi')).para,bakiye+=15+zam);
}
store.set(key,JSON.stringify({gun:7,para:24,hayvanlar:{kopek:{}},canta:{}}));
await gunuBitir(7);
assert.equal(durum().gun,8);
assert.equal((await urunAl('biskuvi',1)).ok,false);
assert.equal(durum().para,24);
assert.equal((await urunAl('biskuvi',2)).para,22);
console.log('1, 7, 8, 14 ve 15. gün fiyatları ve eski etiketle alışveriş doğrulandı.');
