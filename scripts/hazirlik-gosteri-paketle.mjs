// Proje kökünden: node scripts/hazirlik-gosteri-paketle.mjs
// Boş bir output/hazirlik dizininden de çalışır; ilk sayfa ve oyun birlikte taşınır.
import {build} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
import {resolve,join} from 'node:path';
import {copyFile,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const cikis=resolve('output/hazirlik'),dir=join(cikis,'anaokulu-paket');
await mkdir(cikis,{recursive:true});
await build({configFile:false,base:'./',publicDir:false,logLevel:'warn',define:{__REVENUECAT_IOS_KEY__:'""',__REVENUECAT_ANDROID_KEY__:'""'},plugins:[
 {name:'anaokulu-tek-dosya',enforce:'pre',transform(code,id){
   if(!id.endsWith('/src/uygulama.ts'))return;
   const once="export const anaMenuyeDon = () => sayfayaDon('../');";
   if(!code.includes(once))throw Error('Ana menü bağlantısı değişmiş: yerel HTML menüsünü yeni girişle eşleştirin.');
   return code.replace(once,"export const anaMenuyeDon = () => { window.dispatchEvent(new Event('anaokulu-yerel-menu')) };");
 }},viteSingleFile({removeViteModuleLoader:true})],build:{outDir:dir,emptyOutDir:false,target:'es2020',reportCompressedSize:false,rollupOptions:{input:resolve('hazirlik/index.html')}}});
await copyFile(join(dir,'hazirlik/index.html'),join(cikis,'Minkino-Anaokulu.html'));
const baslat='<!doctype html>\n<html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minkino • Yıl sonu gösterisi</title>\n<meta http-equiv="refresh" content="0;url=./Minkino-Anaokulu.html?ders=gosteri">\n<a href="./Minkino-Anaokulu.html?ders=gosteri">Yıl sonu gösterisini aç</a></html>\n';
await writeFile(join(cikis,'Yil-Sonu-Gosterisi.html'),baslat);
await writeFile(join(cikis,'Oyun-Odasi.html'),baslat.replaceAll('ders=gosteri','ders=oyun-odasi').replace('Yıl sonu gösterisini aç','Oyun odasını aç').replace('Yıl sonu gösterisi','Oyun odası'));
const zip=spawnSync(process.env.PYTHON||'python',['scripts/hazirlik-gosteri-tasima.py'],{stdio:'inherit',windowsHide:true});
if(zip.status!==0)throw Error('Çevrimdışı ZIP hazırlanamadı.');
