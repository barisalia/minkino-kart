import { baglam, efektCikisi } from '../../src/audio/motor';

let cisirti: AudioBuffer | undefined;
export function kizartmaSesi() {
  const c=baglam(), cikis=efektCikisi();
  if (!c||!cikis||c.state!=='running')return;
  if(!cisirti||cisirti.sampleRate!==c.sampleRate){
    cisirti=c.createBuffer(1,Math.ceil(c.sampleRate*.85),c.sampleRate);
    const kanal=cisirti.getChannelData(0);
    let tane=0;
    for(let i=0;i<kanal.length;i++){
      if(Math.random()<.0009)tane=.6;
      tane*=.992;
      kanal[i]=(Math.random()*2-1)*(.19+tane);
    }
  }
  const src=c.createBufferSource(), filtre=c.createBiquadFilter(), gain=c.createGain();
  src.buffer=cisirti;filtre.type='highpass';filtre.frequency.value=1350;
  gain.gain.setValueAtTime(.0001,c.currentTime);
  gain.gain.exponentialRampToValueAtTime(.22,c.currentTime+.04);
  gain.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.78);
  src.connect(filtre).connect(gain).connect(cikis);
  src.onended=()=>{src.disconnect();filtre.disconnect();gain.disconnect();};src.start();
}
