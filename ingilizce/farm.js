const animals = { sheep:'koyun', cow:'inek', duck:'ördek', horse:'at', chicken:'tavuk', pig:'domuz', cat:'kedi', dog:'köpek' };
const ids = Object.keys(animals);
const art = '../assets/ingilizce/';
const visualFiles = import.meta.glob('../assets/ingilizce/*.webp', { eager:true, query:'?url', import:'default' });
const icons = import.meta.glob('../assets/hazirlik/dugmeler/{dinle,sessiz}.webp', { eager:true, query:'?url', import:'default' });
const oldSounds = import.meta.glob('../public/ses/efekt/{inek,ordek,kedi,kopek}.mp3', { eager:true, query:'?url', import:'default' });
const recorded = import.meta.glob('../assets/ingilizce/ses/*.mp3', { eager:true, query:'?url', import:'default' });
const $ = id => document.getElementById(id);
const animalArt = id => visualFiles[art + 'hayvan-' + id + '-dur.webp'];
const birdArt = i => visualFiles[art + 'papagan-konus-' + i + '.webp'];
const saveKey = 'minkino.english.barn.v1';
let earned = [], muted = false;
try {
  const saved = JSON.parse(localStorage.getItem(saveKey)) || {};
  earned = [...new Set((Array.isArray(saved.earned) ? saved.earned : []).filter(id => ids.includes(id)))];
  muted = saved.muted === true;
} catch {}
let review = false, reviewRemaining = [];
let mode = 'home', target, choices = [], currentAudio, cancelPlayback, generation = 0;
function save() {
  try { localStorage.setItem(saveKey, JSON.stringify({ earned, muted })); } catch {}
}
function shuffled(values) {
  const list = [...values];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i],list[j]] = [list[j],list[i]];
  }
  return list;
}
function stop() {
  generation++;
  cancelPlayback?.();
  currentAudio?.pause();
  currentAudio = null;
  $('bird').src = birdArt(0);
}
function play(src, talking=false, speed=1) {
  return new Promise(resolve => {
    const audio = new Audio(src);
    currentAudio = audio;
    let timer, frame = 0;
    const finish = () => {
      clearInterval(timer);
      audio.onended = audio.onerror = audio.onplaying = null;
      if (cancelPlayback === finish) cancelPlayback = null;
      if (currentAudio === audio) currentAudio = null;
      audio.pause();
      $('bird').src = birdArt(0);
      resolve();
    };
    cancelPlayback = finish;
    audio.playbackRate = speed;
    audio.onended = audio.onerror = finish;
    if (talking) audio.onplaying = () => {
      clearInterval(timer);
      timer = setInterval(() => { $('bird').src = birdArt(++frame % 4); },145);
    };
    audio.play().catch(finish);
  });
}
const archiveSounds = { cow:'inek', duck:'ordek', cat:'kedi', dog:'kopek' };
function track(name) {
  return recorded[art + 'ses/' + name + '.mp3'];
}
function soundOf(id) {
  return recorded[art + 'ses/ses-' + id + '.mp3'] || oldSounds['../public/ses/efekt/' + archiveSounds[id] + '.mp3'];
}
async function say(items) {
  stop();
  if (muted) return;
  const token = generation;
  for (const [src, mouth, rate] of items) {
    if (generation !== token) break;
    await play(src, mouth, rate);
  }
}
function word(id, slow=false) {
  return [track('en-' + id + (slow ? '-yavas' : '')), true];
}
function promptRound(intro=false) {
  const parts = intro ? [[track('tr-dinle')]] : [[track(review ? 'en-listen' : 'en-who-is-it'), true]];
  say([...parts, (review ? word(target) : [soundOf(target)])]);
}
function button(parent, cls, label, onClick, text='') {
  const el = document.createElement('button');
  el.className = cls;
  el.setAttribute('aria-label', label);
  el.textContent = text;
  el.onclick = onClick;
  parent.append(el);
  return el;
}
function picture(id) {
  const img = new Image();
  img.alt = ''; img.src = animalArt(id);
  return img;
}
function updateFarm() {
  $('counter').textContent = earned.length + ' / ' + ids.length;
  $('mini').replaceChildren(...ids.map(id => {
    const tile = document.createElement('i');
    if (earned.includes(id)) tile.append(picture(id)); else tile.textContent = '·';
    return tile;
  }));
}
function controls() {
  const bar = $('controls');
  bar.replaceChildren();
  $('stage').dataset.mode = mode;
  document.querySelector('.barn').classList.toggle('open', mode === 'reveal');
  $('revealed').hidden = mode !== 'reveal';
  $('listen').disabled = mode === 'home';
  if (mode === 'home') {
    $('prompt').textContent = earned.length === ids.length ? 'Çiftliğin hazır!' : 'Dinleyelim mi?';
    const done = earned.length === ids.length;
    const title = done ? 'Dinle ve bul' : earned.length ? 'Devam et' : 'Haydi, dinle!';
    button(bar,'pill primary',title,done ? startReview : nextRound, title + '  ▶');
    if (done) button(bar,'pill','Yeniden oyna',restart,'Yeniden oyna');
  } else if (mode === 'guess') {
    $('prompt').textContent = review ? 'Hangi kelimeyi duydun?' : 'Ses hangi hayvanın?';
    choices.forEach(id => {
      const b = button(bar,'answer',animals[id],() => guess(id,b));
      b.dataset.animal = id;
      b.append(picture(id));
    });
  } else {
    $('revealed').src = animalArt(target);
    $('prompt').textContent = review ? 'Evet, bildin!' : 'Çiftliğine katıldı!';
    const wordButton = button(bar,'word',target + ' kelimesini tekrar dinle',() => say([word(target), [track('tr-'+target)]]),target);
    const translation = document.createElement('small');
    translation.textContent = animals[target];
    wordButton.append(translation);
    button(bar,'pill slow','Yavaş söyle',() => say([word(target,true)]),'♪ Yavaş söyle');
    const done = review ? reviewRemaining.length === 0 : earned.length === ids.length;
    button(bar,'pill primary',done ? 'Çiftliğimi gez' : 'Sıradaki hayvan',done ? complete : nextRound,done ? 'Çiftliğim  ★' : 'Sıradaki  ➜');
  }
  updateFarm(); updateSound();
}
function startReview() { review = true; reviewRemaining = shuffled(earned); nextRound(); }
function nextRound() {
  const remaining = ids.filter(id => !earned.includes(id));
  target = review ? reviewRemaining.shift() : earned.length === 0 ? 'sheep' : shuffled(remaining)[0];
  if (!target) return complete();
  choices = shuffled([target,...shuffled(ids.filter(id => id !== target)).slice(0,2)]);
  mode = 'guess'; controls(); promptRound(earned.length === 0);
}
function guess(id, b) {
  if (mode !== 'guess') return;
  if (id !== target) {
    b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
    $('prompt').textContent = 'Bir daha dinleyelim!';
    say([review ? [track('en-try-again'), true] : [track('tr-bir-daha')], (review ? word(target) : [soundOf(target)])]);
    return;
  }
  mode = 'reveal';
  if (!earned.includes(id)) earned.push(id);
  save(); controls();
  say(review ? [[track('en-yes'), true], [track('en-its-a-'+id), true]] : [word(id), [track('tr-'+id)]]);
}
function openAlbum() {
  stop();
  const grid = $('stickers'); grid.replaceChildren();
  ids.forEach(id => {
    const known = earned.includes(id);
    const b = button(grid,'',known ? id + ', ' + animals[id] : 'Henüz bulunmadı',() => say([word(id),[track('tr-'+id)]]));
    b.disabled = !known;
    b.append(picture(id),known ? id : '?');
  });
  $('album').showModal();
}
function complete() { review=false; mode = 'home'; controls(); openAlbum(); say([[track('en-great-job'), true], [track('tr-aferin')]]); }
function restart() { review=false; earned = []; save(); nextRound(); }
function updateSound() {
  $('sound').firstElementChild.src = icons['../assets/hazirlik/dugmeler/' + (muted ? 'sessiz' : 'dinle') + '.webp'];
  $('sound').setAttribute('aria-label', muted ? 'Sesi aç' : 'Sesi kapat');
}
$('home').onclick = () => { stop(); review=false; mode='home'; controls(); };
$('listen').onclick = () => mode === 'guess' ? promptRound() : say([word(target)]);
$('sound').onclick = () => {
  muted = !muted; save(); updateSound(); stop();
  if (!muted && mode === 'guess') promptRound();
  if (!muted && mode === 'reveal') say([word(target)]);
};
$('collection').onclick = openAlbum;
$('back').onclick = () => $('album').close();
$('album').onclose = () => { stop(); if (mode === 'guess') promptRound(); };
document.addEventListener('visibilitychange',() => { if (document.hidden) stop(); });
window.addEventListener('pagehide',stop);
[0,1,2,3].forEach(i => { new Image().src = birdArt(i); });
$('bird').src = birdArt(0);
controls();
