// Vitrin için tek, kesintisiz oynanmış bir turun seçkisi. Kaynak kaydı değiştirmez.
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const out=resolve('output/hazirlik');
const exe=process.env.FFMPEG_PATH||resolve('node_modules/ffmpeg-static',process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const kaynak=resolve(out,'Yil-Sonu-Dans-Oynanis.mp4'),hedef=resolve(out,'Yil-Sonu-Kisa-Oynanis.mp4');
// Aynı günün sarı hırkası, dansı ve kupası: bölümler arası kişi/giysi değiştirme.
const planlar=[[0,4.2],[7.1,11.3],[16.8,21.1],[23.8,28.5],[46.9,53.4],[80.5,91.75],[96.5,104.7],[113.1,123]];
const ses=(t)=>t.toFixed(3);
const filtre=planlar.map(([g,c],i)=>
  '[0:v]trim=start='+g+':end='+c+',setpts=PTS-STARTPTS[v'+i+'];'+
  '[0:a]atrim=start='+g+':end='+c+',asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.025,afade=t=out:st='+ses(c-g-.04)+':d=0.04[a'+i+']'
).join(';')+';'+planlar.map((_,i)=>'[v'+i+'][a'+i+']').join('')+'concat=n='+planlar.length+':v=1:a=1[v][a]';
const run=spawnSync(exe,['-hide_banner','-loglevel','error','-y','-i',kaynak,'-filter_complex',filtre,'-map','[v]','-map','[a]','-c:v','libx264','-crf','18','-preset','fast','-threads','3','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',hedef],{stdio:'inherit',windowsHide:true});
if(run.status!==0)throw Error('Kısa oynanış yazılamadı.');
console.log(hedef);
