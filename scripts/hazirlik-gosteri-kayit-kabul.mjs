// Verify the two submitted masters without modifying the originals.
// node scripts/hazirlik-gosteri-kayit-kabul.mjs [recording-folder]
import {spawnSync} from 'node:child_process';
import {existsSync,readdirSync} from 'node:fs';
import {resolve,extname,basename} from 'node:path';
const dir=resolve(process.argv[2]||'assets/hazirlik/gosteri-muzik');
const ffmpeg=process.env.FFMPEG_PATH||resolve('node_modules/ffmpeg-static',process.platform==='win32'?'ffmpeg.exe':'ffmpeg');
const plan=[['sahne-bizim',96],['pati-pati-dans',150]];
let sayi=0;
if(!existsSync(dir)){console.error('Kayıt klasörü bulunamadı: '+dir);process.exit(1)}
for(const [ad,bpm] of plan){
  const dosyalar=readdirSync(dir).filter(n=>['.mp3','.wav','.m4a','.ogg'].includes(extname(n).toLowerCase())&&basename(n,extname(n))===ad);
  if(!dosyalar.length){console.log(ad+': teslim edilmedi; oyun kendi geçici bestesini çalar.');continue}
  if(dosyalar.length!==1){console.error(ad+': iki ayrı ana miks aynı adı taşıyor.');process.exitCode=1;continue}
  if(!existsSync(ffmpeg)){console.error('Ses denetimi için ffmpeg bulunamadı.');process.exitCode=1;break}
  const p=spawnSync(ffmpeg,['-hide_banner','-nostats','-i',resolve(dir,dosyalar[0]),'-vn','-af','volumedetect,silencedetect=noise=-55dB:d=0.16','-f','null','-'],{encoding:'utf8',maxBuffer:4*1024*1024});
  const s=p.stderr||'',duration=s.match(/Duration:\s*(\d+):(\d+):([\d.]+)/),num=(re)=>Number(s.match(re)?.[1]??NaN);
  if(p.status!==0||!duration){console.error(ad+': ses çözülemedi.');process.exitCode=1;continue}
  const sure=+duration[1]*3600+ +duration[2]*60+ +duration[3],hedef=64*60/bpm,tepe=num(/max_volume:\s*([-\d.]+)/),orta=num(/mean_volume:\s*([-\d.]+)/);
  // Read only the input settings; FFmpeg's null output defaults to PCM even for MP3.
  const girdi=s.split('Stream mapping:')[0];
  const format=girdi.match(/Audio:\s*([^,]+),\s*(\d+) Hz,\s*([^,\r\n]+)/);
  const oneriler=[];
  if(format){
    const [,codec,hz,kanal]=format;
    // Klasik WAV başlığı kanal düzeni etiketi taşımaz; FFmpeg iki kanalı
    // "2 channels" olarak da bildirir. Doğru dosyaya dönüşüm önermeyin.
    if(!codec.startsWith('pcm_')||Number(hz)!==48000||!['stereo','2 channels'].includes(kanal.trim()))oneriler.push('Arşiv için varsa özgün stereo 48 kHz PCM WAV dosyasını da isteyin; bu kaydı büyütmeyin.');
    console.log(ad+' kaynak: '+codec+', '+hz+' Hz, '+kanal.trim()+'.');
  }
  const basBos=/silence_start:\s*0(?:\.0+)?\s/.test(s);
  const sorun=[];
  if(Math.abs(sure-hedef)>.18)sorun.push('16 ölçüye uymayan süre');
  if(!Number.isFinite(tepe)||!Number.isFinite(orta)||orta<-40)sorun.push('sessiz veya duyulmayacak kadar kısık');
  if(basBos)sorun.push('ilk vuruştan önce en az 160 ms sessizlik');
  if(tepe>=-.1)oneriler.push('Tepe tam seviyeye yakın; vokal ve vuruşlarda bozulma olup olmadığını dinleyin.');
  if(sorun.length)process.exitCode=1;
  sayi++;console.log(ad+': '+sure.toFixed(3)+' sn / hedef '+hedef.toFixed(3)+' sn, ara '+(hedef/2).toFixed(3)+' sn; ortalama '+orta+' dB, tepe '+tepe+' dB. '+(sorun.length?sorun.join('; '):'Teknik süre ve ses kontrolü geçti.'));
  for(const o of oneriler)console.log('  '+o);
}
if(sayi)console.log('Ses kimliği, ritim ve nakaratın kelime ortasından bölünmemesi dinlenerek kontrol edilir.');
