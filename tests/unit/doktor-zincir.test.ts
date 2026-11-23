import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import {
  ATLA_YOLU, BAHCE, BAHCE_OLCEK, DUSUS_ADIMLAR, DUSUS_DIZI, DUSUS_DOSYALAR, DUSUS_EFEKTLER, DUSUS_KAYIT_MS, DUSUS_REPLIKLER, DUSUS_YOLU, K3_KAPANIS,
  KAPANIS_ADIMLAR, KAPANIS_DIZI, KAPANIS_DOSYALAR, KAPANIS_EFEKTLER, KAPANIS_KAYIT_MS, KAPANIS_REPLIKLER, KOSU, YURU,
} from '../../doktor/src/bahce/veri';
import { BANT_SOZ_ADIMI, DIZ_ADIMLAR, DIZ_DIZI, DIZ_DOSYALAR, DIZ_EFEKTLER, DIZ_KAYIT_MS, DIZ_REPLIKLER, K3_DIZ, type DizOlayi } from '../../doktor/src/diz/veri';
import { AkisMotoru, gorunumCizimleri, yuruKaymasi, yuruSuresi, yuruYolu, type Adim } from '../../doktor/src/motor/akis';
import { BANT_DESENLERI, bindirme, oyun, oyunuSifirla, yasaGore, type Yas } from '../../doktor/src/motor/oyun';
import { K3_ODUL, ODUL_ADIMLAR, ODUL_DIZI, ODUL_DOSYALAR, ODUL_EFEKTLER, ODUL_KAYIT_MS, ODUL_REPLIKLER, type OdulOlayi } from '../../doktor/src/odul/veri';
import { kareSec, type Dizi } from '../../doktor/src/once-kuzu/diziler';
import { PAKET, SAHNE_DOSYALARI, SAHNE_SIRASI, TUM_DOSYALAR, sonrakiSahne } from '../../doktor/src/zincir-veri';

// Minik Doktor · "Zıpzıp'ın Dizi" baştan sona: 1., 6., 7., 8. sahne ve sekiz sahnenin tek akışta bağlanması.
// Çizimler gelmeden doğrulanabilen her şey; çizim adları Astra'ya yazılan Paket Doktor-K3 brief'iyle birebir olmalı.

type Sahne = { adimlar: readonly Adim<string>[]; diziler: Record<string, Dizi>; dosyalar: readonly string[]; kayit: Record<string, number>; replikler: readonly { ad: string; kim: string; metin: string }[]; efektler: readonly string[] };
const SAHNELER: Record<string, Sahne> = {
  bahce: { adimlar: DUSUS_ADIMLAR, diziler: DUSUS_DIZI, dosyalar: SAHNE_DOSYALARI.bahce, kayit: DUSUS_KAYIT_MS, replikler: DUSUS_REPLIKLER, efektler: DUSUS_EFEKTLER },
  diz: { adimlar: DIZ_ADIMLAR, diziler: DIZ_DIZI, dosyalar: SAHNE_DOSYALARI.diz, kayit: DIZ_KAYIT_MS, replikler: DIZ_REPLIKLER, efektler: DIZ_EFEKTLER },
  odul: { adimlar: ODUL_ADIMLAR, diziler: ODUL_DIZI, dosyalar: SAHNE_DOSYALARI.odul, kayit: ODUL_KAYIT_MS, replikler: ODUL_REPLIKLER, efektler: ODUL_EFEKTLER },
  kapanis: { adimlar: KAPANIS_ADIMLAR, diziler: KAPANIS_DIZI, dosyalar: SAHNE_DOSYALARI.kapanis, kayit: KAPANIS_KAYIT_MS, replikler: KAPANIS_REPLIKLER, efektler: KAPANIS_EFEKTLER },
};

/** Brief'in K3 bölümündeki dosya adları (aralıklar ve devamlar açılmış). */
function briefAdlari(): string[] | null {
  if (!existsSync('CLAUDE-ASTRA-MESAJLAR.md')) return null;
  const t = readFileSync('CLAUDE-ASTRA-MESAJLAR.md', 'utf8');
  const bas = t.indexOf('· Paket Doktor-K3 · bahçe, diz yakın planı');
  if (bas < 0) return null;
  const son = t.indexOf('\n## ', bas);
  const bolum = t.slice(bas, son < 0 ? undefined : son);
  const adlar = new Set<string>();
  let onceki = '';
  for (const m of bolum.matchAll(/`([^`]+)`/g)) {
    const s = m[1].trim();
    const aralik = s.match(/^([a-z-]+-)(\d+) … (\d+)$/);
    if (aralik) { for (let i = +aralik[2]; i <= +aralik[3]; i++) adlar.add(aralik[1] + i); onceki = aralik[1]; continue; }
    const devam = s.match(/^-([a-z0-9]+)$/);
    if (devam && onceki) { adlar.add(onceki + devam[1]); continue; }
    if (!/^[a-z][a-z0-9-]+$/.test(s)) continue;
    adlar.add(s);
    const kok = s.match(/^([a-z-]+-)[a-z0-9]+$/);
    onceki = kok ? kok[1] : '';
  }
  return [...adlar];
}

describe('Zıpzıp’ın Dizi · paketler ve çizim adları', () => {
  it('K1 68 + K2 90 + K3 161 = 319 çizim; paketler çakışmaz', () => {
    expect(PAKET.K1).toHaveLength(68);
    expect(PAKET.K2).toHaveLength(90);
    expect(PAKET.K3).toHaveLength(161);
    expect([DUSUS_DOSYALAR.length, DIZ_DOSYALAR.length, ODUL_DOSYALAR.length, KAPANIS_DOSYALAR.length]).toEqual([35, 35, 40, 51]);
    const hepsi = [...PAKET.K1, ...PAKET.K2, ...PAKET.K3];
    expect(new Set(hepsi).size).toBe(319);
    expect([...TUM_DOSYALAR].sort()).toEqual([...hepsi].sort());
  });
  it('K3 adları Astra brief’indeki adlarla birebir', () => {
    const brief = briefAdlari();
    if (!brief) return; // brief dosyası bu ortamda yoksa atlanır
    const briefKume = new Set(brief), kod = new Set<string>(PAKET.K3), onceki = new Set<string>([...PAKET.K1, ...PAKET.K2]);
    for (const ad of PAKET.K3) expect(briefKume.has(ad), 'brief’te yok: ' + ad).toBe(true);
    // brief'te olup kodda olmayan ad ya başka paketin çizimine göndermedir ya da kısaltmadır (ör. `top-al`, `diz-dene`)
    for (const ad of brief) if (!kod.has(ad) && !onceki.has(ad)) expect(PAKET.K3.some(k => k.includes(ad)), 'kodda yok: ' + ad).toBe(true);
  });
  it('her sahnenin kullandığı çizim o sahnenin dosyalarında; ağız dizileri altışar', () => {
    for (const [ad, s] of Object.entries(SAHNELER)) {
      const var_ = new Set(s.dosyalar);
      for (const [dn, d] of Object.entries(s.diziler)) {
        expect(d.kareler.length, ad + ' ' + dn).toBe(d.sureler.length);
        d.kareler.forEach(k => expect(var_.has(k), ad + ' ' + dn + ' → ' + k).toBe(true));
      }
      for (const a of s.adimlar) for (const g of Object.values(a.katman ?? {})) gorunumCizimleri(g, n => s.diziler[n].kareler).forEach(k => expect(var_.has(k), ad + ' ' + a.ad + ' → ' + k).toBe(true));
    }
    for (const d of [K3_DIZ.yuzAgiz, K3_ODUL.ayaktaAgiz, K3_KAPANIS.gosterAgiz, K3_KAPANIS.sallaAgiz]) { expect(d).toHaveLength(6); d.forEach((x, i) => expect(x.endsWith('-agiz-' + i)).toBe(true)); }
  });
  it('başka paketten kullanılan her çizim o paketin listesinde', () => {
    const hepsi = new Set<string>([...PAKET.K1, ...PAKET.K2, ...PAKET.K3]);
    for (const [ad, d] of Object.entries(SAHNE_DOSYALARI)) d.forEach(x => expect(hepsi.has(x), ad + ' → ' + x).toBe(true));
  });
});

describe('Zıpzıp’ın Dizi · sahne sırası', () => {
  it('sekiz sahne yedi parçada, çekim listesindeki sırayla', () => {
    expect([...SAHNE_SIRASI]).toEqual(['bahce', 'kapi', 'bekleme', 'once-kuzu', 'diz', 'odul', 'kapanis']);
    expect(SAHNE_SIRASI.map(s => sonrakiSahne(s))).toEqual(['kapi', 'bekleme', 'once-kuzu', 'diz', 'odul', 'kapanis', null]);
  });
  it('seçimler sahneden sahneye taşınır; yeni oyunda sıfırlanır', () => {
    oyun.bant = 'kalp'; oyun.yildiz = 'mavi'; oyun.kuzuYildizi = 'sari';
    expect(oyun).toEqual({ bant: 'kalp', yildiz: 'mavi', kuzuYildizi: 'sari' });
    oyunuSifirla();
    expect(oyun).toEqual({ bant: null, yildiz: null, kuzuYildizi: null });
    expect(bindirme('olmayan-poz').bant).toHaveLength(2);
  });
});

describe('Zıpzıp’ın Dizi · kayıtlar ve söz', () => {
  it('replikler ve efektler diskte; her replik bir adımda kullanılıyor', () => {
    for (const [ad, s] of Object.entries(SAHNELER)) {
      for (const r of s.replikler) expect(existsSync('assets/doktor/zipzip-diz/ses/' + r.ad + '.mp3'), ad + ' ' + r.ad).toBe(true);
      for (const e of s.efektler) expect(existsSync('assets/doktor/zipzip-diz/ses/' + e + '.mp3') || (e === 'yildiz' && existsSync('public/ses/efekt/yildiz.mp3')), ad + ' ' + e).toBe(true);
      const kullanilan = new Set(s.adimlar.map(a => a.ses?.ad).filter(Boolean));
      expect([...kullanilan].sort(), ad).toEqual(s.replikler.map(r => r.ad).sort());
      for (const a of s.adimlar) a.efekt?.forEach(e => expect(s.efektler.includes(e.ad), ad + ' ' + a.ad + ' ' + e.ad).toBe(true));
    }
  });
  it('süreyle biten adım, içindeki kayıt bitmeden bitmez', () => {
    for (const [ad, s] of Object.entries(SAHNELER)) for (const a of s.adimlar) {
      if (a.ses && a.bitis.tur === 'sure') expect(a.bitis.ms, ad + ' ' + a.ad).toBeGreaterThanOrEqual((a.ses.gecikme ?? 0) + s.kayit[a.ses.ad]);
    }
  });
  it('Kino emir vermez: yasak sözcük yok', () => {
    const YASAK = ['dokun', 'tıkla', 'bas', 'sürükle', 'yanlış', 'hatalı', 'çabuk', 'süre', 'kaybettin', 'aferin'];
    for (const s of Object.values(SAHNELER)) for (const r of s.replikler.filter(x => x.kim === 'kino')) {
      const sozcukler = r.metin.toLocaleLowerCase('tr').split(/[^a-zçğıöşü]+/);
      for (const y of YASAK) expect(sozcukler.includes(y), r.ad + ': ' + y).toBe(false);
      for (const y of ['şimdi şunu', 'hızlı ol']) expect(r.metin.toLocaleLowerCase('tr').includes(y), r.ad).toBe(false);
    }
  });
});

describe('6. sahne · diz yakın planı', () => {
  const kayit = (ad: string) => DIZ_KAYIT_MS[ad] ?? 0;
  const olaylar = (yas: Yas) => yasaGore(DIZ_ADIMLAR, yas).filter(a => a.bitis.tur === 'cocuk').map(a => (a.bitis as { olay: DizOlayi }).olay);
  it('yaşa göre aletler: 5+ büyüteç, cımbız, pamuk, bant; 4 pamuk ve bant; 2–3 yalnız bant', () => {
    expect(olaylar('5+')).toEqual(['yaprak-bulundu', 'yaprak-tutuldu', 'yaprak-cikti', 'pamuk-degdi', 'camur-silindi', 'bant-kondu', 'bant-duzlesti']);
    expect(olaylar('4')).toEqual(['pamuk-degdi', 'camur-silindi', 'bant-kondu', 'bant-duzlesti']);
    expect(olaylar('2-3')).toEqual(['bant-kondu', 'bant-duzlesti']);
  });
  it('her yaşta baştan sona oynanır; seçilen bandın sözü çalar', () => {
    for (const yas of ['5+', '4', '2-3'] as const) for (const desen of BANT_DESENLERI) {
      const adimlar = yasaGore(DIZ_ADIMLAR, yas);
      const akis = new AkisMotoru<Adim<DizOlayi>, DizOlayi>(adimlar, kayit);
      const girilen: string[] = [];
      for (let i = 0; i < 20000 && !akis.bitti; i++) {
        akis.ilerlet(16).forEach(a => girilen.push(a.ad));
        const a = akis.adim;
        if (a && a.bitis.tur === 'cocuk') { const y = akis.olay(a.bitis.olay, a.bitis.olay === 'bant-duzlesti' ? BANT_SOZ_ADIMI[desen] : undefined); if (y) girilen.push(y.ad); }
      }
      expect(akis.bitti, yas + ' ' + desen).toBe(true);
      const sozler = girilen.filter(g => g.startsWith('s6-soz-'));
      expect(sozler, yas + ' ' + desen).toEqual([BANT_SOZ_ADIMI[desen]]);
      expect(girilen[girilen.length - 1]).toBe('s6-gurur');
    }
  });
  it('yakın planda her adımda Zıpzıp’ın yüzü görünür; tedaviden sonra orta plana dönülmez (çamurlu diz görünmesin)', () => {
    const adimlar = yasaGore(DIZ_ADIMLAR, '5+');
    const ilkYakin = adimlar.findIndex(a => a.plan === 'yakin');
    expect(adimlar[ilkYakin].katman!.yuz).toBeDefined();
    adimlar.slice(ilkYakin).forEach(a => expect(a.plan, a.ad).toBe('yakin'));
  });
  it('dört bandın dördünün de çizimi ve sözü var', () => {
    for (const d of BANT_DESENLERI) {
      expect(DIZ_DOSYALAR).toContain('bant-' + d);
      expect(DIZ_REPLIKLER.map(r => r.ad)).toContain('zd-bant-' + d);
      expect(ODUL_DOSYALAR).toContain('bant-isaret-' + d);
    }
  });
});

describe('7. sahne · ödül köşesi', () => {
  const kayit = (ad: string) => ODUL_KAYIT_MS[ad] ?? 0;
  it('karne ve damga yalnız 5+ yaşta', () => {
    const olaylar = (yas: Yas) => yasaGore(ODUL_ADIMLAR, yas).filter(a => a.bitis.tur === 'cocuk').map(a => (a.bitis as { olay: OdulOlayi }).olay);
    expect(olaylar('5+')).toEqual(['yildiz-yapisti', 'kuzu-yildiz', 'damga-basildi']);
    expect(olaylar('4')).toEqual(['yildiz-yapisti', 'kuzu-yildiz']);
    expect(olaylar('2-3')).toEqual(['yildiz-yapisti', 'kuzu-yildiz']);
  });
  it('her yaşta baştan sona oynanır ve Zıpzıp doktor olarak biter', () => {
    for (const yas of ['5+', '4', '2-3'] as const) {
      const akis = new AkisMotoru<Adim<OdulOlayi>, OdulOlayi>(yasaGore(ODUL_ADIMLAR, yas), kayit);
      const girilen: string[] = [];
      for (let i = 0; i < 20000 && !akis.bitti; i++) {
        akis.ilerlet(16).forEach(a => girilen.push(a.ad));
        const a = akis.adim;
        if (a && a.bitis.tur === 'cocuk') { const y = akis.olay(a.bitis.olay); if (y) girilen.push(y.ad); }
      }
      expect(akis.bitti, yas).toBe(true);
      expect(girilen.slice(-2), yas).toEqual(['s7-doktor', 's7-davul']);
    }
  });
  it('üç yıldız rengi: biri Zıpzıp’a, biri Kuzu’ya', () => {
    expect(K3_ODUL.yildizlar).toEqual(['yildiz-sari', 'yildiz-nane', 'yildiz-mavi']);
  });
});

describe('1. ve 8. sahne · bahçe', () => {
  it('düşüşte ve kapanışta çocuğun eylemi beklenmez; sahne kendiliğinden oynar ve biter', () => {
    for (const [adimlar, ms] of [[DUSUS_ADIMLAR, DUSUS_KAYIT_MS], [KAPANIS_ADIMLAR, KAPANIS_KAYIT_MS]] as const) {
      expect(adimlar.every(a => a.bitis.tur !== 'cocuk')).toBe(true);
      const akis = new AkisMotoru<Adim<never>, never>(adimlar, ad => ms[ad] ?? 0);
      akis.ilerlet(120_000);
      expect(akis.bitti).toBe(true);
    }
  });
  it('koşu çalının sağında biter, düşüş çalının solunda; takılma pozunda Zıpzıp havada asılı kalır', () => {
    const kosu = DUSUS_DIZI['zipzip-kosu'], dusus = DUSUS_DIZI['zipzip-dusus'];
    expect(yuruYolu(kosu, KOSU, yuruSuresi(kosu, KOSU))).toBe(1680);
    expect(yuruKaymasi(kosu, KOSU, 0) * BAHCE_OLCEK).toBeCloseTo(672, 6); // sağdan, ekran dışından
    expect(BAHCE.sagX - BAHCE.solX).toBeCloseTo(DUSUS_YOLU.adim * BAHCE_OLCEK, 6);
    const t3 = dusus.sureler[0] + dusus.sureler[1] + dusus.sureler[2];
    expect(kareSec(dusus, t3 + 1).kare).toBe('zipzip-dusus-3');
    expect(yuruYolu(dusus, DUSUS_YOLU, t3 + 400)).toBeCloseTo(yuruYolu(dusus, DUSUS_YOLU, t3 + 1), 6);
    // takılma anında çalının üstünde (çalının ortası ile sağ yanı arasında)
    const x = BAHCE.solX - yuruKaymasi(dusus, DUSUS_YOLU, t3 + 1) * BAHCE_OLCEK * -1;
    expect(x).toBeGreaterThan(BAHCE.caliX - 120);
    expect(x).toBeLessThan(BAHCE.sagX);
    expect(yuruYolu(dusus, DUSUS_YOLU, 99999)).toBe(1650);
  });
  it('kapanışta Zıpzıp klinikten (soldan) gelir, çalının solunda durur ve sağına atlar', () => {
    const yuru = KAPANIS_DIZI['zipzip-yuru'], atla = KAPANIS_DIZI['zipzip-atla'];
    expect(YURU.yon).toBe(1);
    expect(yuruKaymasi(yuru, YURU, 0) * BAHCE_OLCEK).toBeCloseTo(-600, 6); // soldan, ekran dışından
    expect(ATLA_YOLU.yon).toBe(1);
    expect(yuruYolu(atla, ATLA_YOLU, 99999) * BAHCE_OLCEK).toBeCloseTo(BAHCE.sagX - BAHCE.solX, 6);
    expect(yuruYolu(atla, ATLA_YOLU, atla.sureler[0] - 1)).toBe(0); // geri çekilirken yerinden oynamaz
    expect(KAPANIS_ADIMLAR.find(a => a.ad === 's8-yuru')!.bitis).toEqual({ tur: 'sure', ms: yuruSuresi(yuru, YURU) });
  });
  it('baştaki ayrıntılar sonda geri döner: top çalıda kalır ve sonda çıkarılır; son söz Kino’nun', () => {
    expect(KAPANIS_ADIMLAR[0].katman!.top).toEqual({ poz: 'top-0' });
    expect(KAPANIS_ADIMLAR.find(a => a.ad === 's8-cek')!.katman!.top).toEqual({ yok: true });
    const son = KAPANIS_ADIMLAR[KAPANIS_ADIMLAR.length - 1];
    expect(son.ses?.ad).toBe('kk-doktor');
    expect(son.katman).toBeDefined();
    expect(KAPANIS_ADIMLAR.some(a => a.katman?.zipzip && 'dizi' in a.katman.zipzip && a.katman.zipzip.dizi === 'top-sektir')).toBe(true);
    expect(KAPANIS_DIZI['top-sektir'].donus).toBe(0);
    expect(KAPANIS_ADIMLAR.find(a => a.ad === 's8-cesur')!.ses).toMatchObject({ ad: 'zk-cesur', agiz: 'zipzip-goster' });
  });
});
