import {build} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
import {copyFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const hedef=resolve('output/matematik-ui');
await mkdir(hedef,{recursive:true});
await build({configFile:false,base:'./',publicDir:false,logLevel:'warn',plugins:[viteSingleFile()],define:{__REVENUECAT_IOS_KEY__:'""',__REVENUECAT_ANDROID_KEY__:'""'},build:{outDir:resolve(hedef,'tek-dosya'),rollupOptions:{input:resolve('matematik/index.html')}}});
await copyFile(resolve(hedef,'tek-dosya/matematik/index.html'),resolve(hedef,'Matematik-Atolyesi.html'));
