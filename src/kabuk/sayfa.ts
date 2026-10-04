import { UYGULAMA_DERLEMESI } from './ortam';

/**
 * Sayfalar arası geçiş adresi. Capacitor'un yerel sunucusu (https://localhost/...) klasör adresine ('/kartlar/')
 * index.html vermez, kökteki menüye düşer: uygulamada her adres açıkça '.../index.html' olmalı (sorgu korunur).
 */
export function sayfaAdresi(yol: string, uygulama = UYGULAMA_DERLEMESI): string {
  if (!uygulama) return yol;
  return yol.replace(/^([^?#]*\/)([?#].*)?$/, (_t, y: string, kuyruk?: string) => `${y}index.html${kuyruk ?? ''}`);
}
