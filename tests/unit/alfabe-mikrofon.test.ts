import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import { describe, expect, it } from 'vitest';
import { konusmaVar, ozellikler, sesPenceresi } from '../../alfabe/src/ses-esleme';

const hiz = 48000;
const boy = 1024;
function konusuyor(pcm:Float32Array) {
  const kareler = [];
  for(let i=0;i+boy<=pcm.length;i+=boy) kareler.push(sesPenceresi(pcm.subarray(i,i+boy),hiz));
  return konusmaVar(kareler,boy*1000/hiz,.00016);
}
function oku(yol:string, bas:number, sure:number) {
  const pcm=execFileSync(ffmpeg!, ['-v','error','-ss',String(bas),'-i',yol,'-t',String(sure),'-ac','1','-ar',String(hiz),'-f','f32le','-']);
  return new Float32Array(pcm.buffer,pcm.byteOffset,pcm.length/4);
}

describe('harf atölyesinde çocuk sırası',()=>{
  it('mikrofon ne zaman açılırsa açılsın raketin ses özellikleri aynı kalır',()=>{
    const raket=oku('assets/alfabe/ses/21-model.mp3',0,2);
    const dogrudan=ozellikler(raket,hiz);
    expect(dogrudan.length).toBeGreaterThan(0);
    for(const onBosluk of [193,10240,25013]){
      const yakalama=new Float32Array(onBosluk+raket.length+24576);
      yakalama.set(raket,onBosluk);
      expect(ozellikler(yakalama,hiz)).toEqual(dogrudan);
    }
  });
  it('öğretmen dışındaki sesleri kısık ve kısa yanıtlarda duyar',()=>{
    const a=oku('assets/hazirlik/ses/mino_yazi_armut.mp3',0,.39);
    const b=oku('assets/ses-seri2/o1-bak.mp3',.05,.068);
    expect(konusuyor(a.map(x=>x*.0224))).toBe(true);
    expect(konusuyor(b)).toBe(true);
  });
  it('sessizlik, bir tık, sabit ton ve fan uğultusunu yanıt saymaz',()=>{
    const tik = new Float32Array(hiz);tik[hiz/2]=1;
    let tohum=7;
    const gurultu=Float32Array.from({length:hiz},()=>{
      tohum=(1664525*tohum+1013904223)>>>0;
      return 2*tohum/4294967296-1;
    });
    expect(konusuyor(new Float32Array(hiz))).toBe(false);
    expect(konusuyor(tik)).toBe(false);
    expect(konusuyor(gurultu)).toBe(false);
    expect(konusuyor(gurultu.map((_,i)=>.1*Math.sin(2*Math.PI*440*i/hiz)))).toBe(false);
    expect(konusuyor(gurultu.map((n,i)=>.001*n+.008*Math.sin(2*Math.PI*90*i/hiz)))).toBe(false);
  });
});
