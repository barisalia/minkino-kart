export function oksamaBagla(scene, pet, part, onLove, heartUrl) {
  const body = scene.querySelector('.buyuk');
  const bed = scene.querySelector('.yatak');
  const face = body.querySelector('.kafa.normal,.yuz,.butun-balik');
  if (!face || !bed) return;
  const fish = face.classList.contains('butun-balik');
  const dog = pet === 'kopek';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const normal = face.src;
  let press, timer, lean;
  body.classList.add('oksanabilir');
  body.tabIndex = 0;
  body.setAttribute('role', 'button');
  body.setAttribute('aria-label', 'Sev veya yatağına sürükle');

  function love() {
    clearTimeout(timer);
    onLove();
    body.classList.add('oksaniyor');
    if (!dog) face.src = part(pet, fish ? 'tam-sevin' : 'sevin');
    if (!reduced) {
      lean?.cancel();
      const head = body.querySelector('.kafa-grup') || face;
      lean = head.animate([{rotate:'0deg'},{rotate:'-5deg',offset:.4},{rotate:'2deg',offset:.8},{rotate:'0deg'}],{duration:540});
    }
    let heart = body.querySelector('.sevgi-kalbi');
    if (!heart) {
      heart = new Image();
      heart.src = heartUrl;
      heart.alt = '';
      heart.className = 'sevgi-kalbi';
      body.append(heart);
    }
    timer = setTimeout(() => {
      body.classList.remove('oksaniyor');
      if (!dog) face.src = normal;
      heart.remove();
    }, 720);
  }
  function atBed(event) {
    const r = bed.getBoundingClientRect();
    return event.clientX >= r.left-6 && event.clientX <= r.right+6 && event.clientY >= r.top-6 && event.clientY <= r.bottom+6;
  }
  function reset() {
    press = undefined;
    body.style.transform = '';
    bed.classList.remove('hedef-yatak');
  }
  body.addEventListener('dragstart', event => event.preventDefault());
  body.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    press = {id:event.pointerId,x:event.clientX,y:event.clientY,drag:false};
    body.setPointerCapture(event.pointerId);
  });
  body.addEventListener('pointermove', event => {
    if (press?.id !== event.pointerId) return;
    const dx=event.clientX-press.x, dy=event.clientY-press.y;
    if (Math.hypot(dx,dy)>22) press.drag = true;
    if (press.drag) {
      body.style.transform = `translate(${dx}px,${dy}px) scale(.88)`;
      bed.classList.toggle('hedef-yatak',atBed(event));
    }
  });
  body.addEventListener('pointerup', event => {
    if (press?.id !== event.pointerId) return;
    const drag = press.drag, landed = atBed(event);
    const distance = Math.hypot(event.clientX-press.x,event.clientY-press.y);
    reset();
    if (drag && landed) bed.click();
    else if (!drag || distance < 42) love();
  });
  body.addEventListener('lostpointercapture',reset);
  body.addEventListener('pointercancel',reset);
  body.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) love();
    }
  });
}
