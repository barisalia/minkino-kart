import './kopek-tipleri.css';

const drawings=import.meta.glob('../assets/pati-yeni/kopek/cizim/*-{tuy,acik,cizgi}.png',{eager:true,query:'?url',import:'default'});

function layer(name, part, paint, model) {
  const file=`${name}-${part}.png`;
  const root='../assets/pati-yeni/kopek/cizim/';
  const url=drawings[root+model+'-'+file]||drawings[root+file];
  return `<span class="boya ${part}" style="--resim:url('${url}');--renk:var(--${paint})"></span>`;
}

function sprite(name, classes, paint='tuy', model='') {
  return `<div class="parca ${classes}">${layer(name,'tuy',paint,model)}${layer(name,'acik','acik',model)}${layer(name,'cizgi','cizgi',model)}</div>`;
}

export function kopek(k,madalya='',isikTipi='',isik='') {
  const ear = side => sprite(k.kulakTip,`kulak ${side} ${k.kulakTip}`,'kulak');
  const face=(name,pose)=>sprite(name,'kafa '+pose,'tuy',k.tip);
  return `<div data-metal="${madalya}" data-isik="${isikTipi}" class="kopek kopek-${k.tip} desen-${k.desen}" data-model="${k.tip}" role="img" aria-label="${k.ad}, ${k.kulakTip==='dik'?'dik':'sarkık'} kulaklı köpek" style="--tuy:${k.tuy};--kulak:${k.kulak};--acik:${k.acik}">
    <div class="rig">
      ${sprite(k.kuyruk,'kuyruk','kulak')}
      ${sprite('govde','govde','tuy',k.tip)}
      <div class="kafa-grup">
        ${ear('sol')}${ear('sag')}
        ${face('bas','normal')}${face('uyku','uykulu')}${face('sevin','neseli')}
      </div>
      ${isik}
    </div>
  </div>`;
}
