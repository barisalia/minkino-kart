// Çocuk yönergeyi duyup bir süre hiç dokunmazsa Ceren hatırlatır: üst üste en fazla iki kez,
// ilki 12 sn, ikincisi 16 sn sessizlikten sonra. Arka plandaki sekmede süre saymaz.
export function bosBekleyici(hatirlat: (kacinci: number) => void, sureler: [number, number] = [12000, 16000]) {
  let zaman = 0, sayi = 0, kapali = false;
  function kur() {
    clearTimeout(zaman);
    if (kapali || sayi >= 2) return;
    zaman = window.setTimeout(() => {
      if (kapali) return;
      if (document.hidden) { kur(); return; }
      sayi++;
      hatirlat(sayi);
    }, sureler[Math.min(sayi, 1)]);
  }
  return {
    /** Ceren sustu ya da çocuk elini çekti: saymaya başla. */
    kur,
    /** Çocuk dokunuyor ya da Ceren konuşuyor: sayma. */
    dur: () => clearTimeout(zaman),
    /** Çocuk ilerledi: hatırlatma hakkı yeniden ikiye çıkar. */
    sifirla: () => { clearTimeout(zaman); sayi = 0; },
    kapat: () => { kapali = true; clearTimeout(zaman); },
  };
}
