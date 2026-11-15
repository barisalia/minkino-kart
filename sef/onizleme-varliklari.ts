import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Plugin } from 'vite';

/** Vite expands eager URL globs into one JavaScript import for every file in
 * development. Serve the same local URLs directly; the production bundler
 * still fingerprints the assets and the glob still tracks additions/removals. */
export function sefOnizlemeVarliklari():Plugin {
  let kok='',taban='/';
  return {
    name:'minik-sef-onizleme-varliklari',
    apply:'serve',enforce:'post',
    configResolved(config){kok=resolve(config.root);taban=config.base;},
    transform(code,id){
      if(!id.replaceAll('\\','/').includes('/sef/src/')||!code.includes('__vite_glob_'))return;
      const desen=/import\s*\{\s*default\s+as\s+(__vite_glob_\d+_\d+)\s*\}\s*from\s*"([^"]+\.(?:webp|png|mp3)\?url)"\s*;/g;
      const sonuc=code.replace(desen,(tam:string,ad:string,spec:string)=>{
        const yol=spec.slice(0,-4);
        const dosya=yol.startsWith('/')?resolve(kok,'.'+yol):fileURLToPath(new URL(yol,pathToFileURL(resolve(dirname(id),'_'))));
        const kaynak=relative(kok,dosya).split(sep).join('/');
        if(!kaynak.startsWith('assets/'))return tam;
        return 'const '+ad+'='+JSON.stringify(taban+kaynak.split('/').map(encodeURIComponent).join('/'))+';';
      });
      if(sonuc!==code)return {code:sonuc,map:null};
    },
  };
}
