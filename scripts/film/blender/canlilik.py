"""Canlılık modülleri: animatörün yazmadığı, kurucunun her sahneye eklediği katmanlar.

Karakter (Kukla) üzerinde:
  nefes        — gövde hafifçe şişer/iner (uyurken göbek belirgin)
  kirpma       — 2-5 sn'de bir göz kırpma (yarı → kapalı → yarı)
  bekleme      — "moving hold": kalça ağırlık aktarır, baş ve kollar gezinir; hiçbir karakter donmaz
  dinleme      — konuşana bakar (göz bebekleri + baş)
  agiz         — ses genliğinden ağız şekli (en az 2 kare kalır, cümle sonunda gülümsemeye döner)
  takip        — kulak / kuyruk / fular / etek: yay benzetimiyle geriden gelir (follow-through)
Mekân:
  sarkac_bukum — arka plan ızgarasında bölge bükümü (perde, nazarlık, askıdaki ceket sallanır)
  kus, buhar, zzz — küçük sprite hareketleri
"""
import math
import random

from ortak import gurultu, yay, duzle, turev, sinirla


def nefes(c, periyot=3.2, genlik=0.012, araliklar=()):
    """araliklar: [(f0, f1, periyot, genlik)] — uyku gibi özel nefes."""
    for f in range(c.n):
        t = f / c.fps
        p, g = periyot, genlik
        for f0, f1, p2, g2 in araliklar:
            if f0 <= f < f1:
                p, g = p2, g2
        s = math.sin(2 * math.pi * t / p + hash(c.ad) % 7)
        c.ekle('govde', 'sy', f, 1 + g * s)
        c.ekle('govde', 'sx', f, 1 + g * 0.8 * s)
        c.ekle('kafa', 'y', f, g * 0.15 * c.m * 2000 * s)


def kirpma(c, tohum=1):
    r = random.Random(hash(c.ad) + tohum)
    f = int(r.uniform(0.6, 2.0) * c.fps)
    while f < c.n - 4:
        for k, s in ((0, 'gozler-yari'), (1, 'gozler-kapali'), (2, 'gozler-kapali'), (3, 'gozler-yari')):
            if c.secim['gozler'][f + k] == 'gozler-acik' or c.secim['gozler'][f + k].startswith('gozler-sol') or c.secim['gozler'][f + k].startswith('gozler-sag'):
                c.secim['gozler'][f + k] = s
        f += int(r.uniform(2.0, 4.8) * c.fps)


def bekleme(c, olcek=1.0):
    """Ağırlık aktarma + baş/kol gezinmesi. mesgul karelerde azalır."""
    a = c.ad
    for f in range(c.n):
        t = f / c.fps
        k = olcek * (0.35 if c.mesgul[f] else 1.0)
        c.ekle('kalca', 'x', f, k * 0.006 * gurultu(t, a + 'x', 0.8))
        c.ekle('govde', 'r', f, k * 1.6 * gurultu(t, a + 'g', 0.9))
        c.ekle('kafa', 'r', f, k * 3.0 * gurultu(t, a + 'k', 1.1))
        for kol_ in ('kol-ust-sag', 'kol-ust-sol'):
            if c.kemik_var(kol_):
                c.ekle(kol_, 'r', f, k * 3.0 * gurultu(t, a + kol_, 0.9))
        for kol_ in ('kol-alt-sag', 'kol-alt-sol'):
            if c.kemik_var(kol_):
                c.ekle(kol_, 'r', f, k * 4.0 * gurultu(t, a + kol_, 0.7))


def dinleme(c, konusanlar):
    """konusanlar: [(f0, f1, ekran_x)] — c dışındakiler. Göz bebekleri ve baş o yöne döner."""
    for f0, f1, x, kim in konusanlar:
        if kim == c.ad:
            continue
        dx = x - (c.taban.x + c.X[min(f0, c.n - 1)])
        if abs(dx) < 0.05:
            continue
        sec = 'gozler-sola' if dx > 0 else 'gozler-saga'   # sol = karakterin solu = ekranın sağı
        for f in range(max(0, f0 + 3), min(c.n, f1 + 8)):
            if c.secim['gozler'][f] == 'gozler-acik':
                c.secim['gozler'][f] = sec
            u = min(1.0, (f - f0) / 8.0, (f1 + 8 - f) / 8.0)
            c.ekle('kafa', 'r', f, (3.5 if dx > 0 else -3.5) * u)


AGIZ_SIRA = ['agiz-az', 'agiz-e', 'agiz-orta', 'agiz-o', 'agiz-genis']


def agiz(c, f0, zarf, gul=False):
    """Ses genliğinden ağız: hece tepelerinde açık şekiller dönüşümlü; kısa şekiller birleşir (≥2 kare)."""
    n = len(zarf)
    z = duzle(zarf, 1)
    onceki, kalan, hece = None, 0, 0
    for i in range(n):
        f = f0 + i
        if not (0 <= f < c.n):
            continue
        e = z[i]
        if i > 0 and i < n - 1 and z[i] > z[i - 1] and z[i] >= z[i + 1]:
            hece += 1
        if e < 0.08:
            s = 'agiz-gulumse'
        elif e < 0.25:
            s = 'agiz-az'
        elif e < 0.5:
            s = ('agiz-e', 'agiz-orta', 'agiz-az')[hece % 3]
        else:
            s = ('agiz-genis', 'agiz-o', 'agiz-orta')[hece % 3] if not gul else 'agiz-kahkaha'
        if kalan > 0 and onceki:
            s = onceki
            kalan -= 1
        elif s != onceki:
            kalan = 1
        onceki = s
        c.secim['agiz'][f] = s
        c.konusma[f] = max(c.konusma[f], e)
        # konuşurken baş vurguyla hafif oynar, kaşlar hecede kalkar
        c.ekle('kafa', 'r', f, 2.0 * (e - 0.3) * math.sin(i * 0.35))
        c.ekle('kafa', 'y', f, 0.004 * e)
        if e > 0.75 and c.secim['kaslar'][f] == 'kaslar-notr':
            c.secim['kaslar'][f] = 'kaslar-kalkik'


def takip(c):
    """Kulak / kuyruk / fular / etek: bağlı oldukları noktanın ivmesine yay ile tepki (geriden gelir, taşar)."""
    g = c.ana
    P = g.kit['parcalar']
    hedefler = {}
    for k in g.kemikler:
        tr = k.split('-')[0]
        if tr not in ('kulak', 'kuyruk', 'fular', 'etek'):
            continue
        ebe = g.ebeveyn[k]
        piv = g.pivot[k]
        xs, zs, ac = [], [], []
        for f in range(c.n):
            p, a = c.nokta(ebe, piv, f)
            xs.append(p.x)
            zs.append(p.z)
            ac.append(a)
        ax = duzle(turev(duzle(turev(xs, c.fps), 1), c.fps), 2)
        az = duzle(turev(duzle(turev(zs, c.fps), 1), c.fps), 2)
        va = turev(ac, c.fps)
        kut = P[k]['kutu']
        asili = (kut[1] + kut[3] / 2) > piv[1]  # merkez pivotun altında → sarkan parça
        dis = -1 if (kut[0] + kut[2] / 2) < g.cx else 1
        isaret = 1 if asili else -1
        kat = {'kulak': 7.0, 'kuyruk': 8.0, 'fular': 5.0, 'etek': 4.0}[tr]
        frek = {'kulak': 2.2, 'kuyruk': 1.8, 'fular': 2.8, 'etek': 2.5}[tr]
        hedef = []
        for f in range(c.n):
            v = isaret * kat * ax[f] / max(0.3, c.m * 2038) * 0.6
            if tr == 'kulak':
                v += dis * kat * 0.35 * az[f] / max(0.3, c.m * 2038)
            v -= 0.06 * va[f]                   # dönen başın gerisinde kalır
            v += 1.2 * gurultu(f / c.fps, c.ad + k, 1.4)  # hiç durmayan küçük kıpırtı
            hedef.append(max(-40, min(40, v)))
        cik = yay(hedef, c.fps, frek, 0.28)
        for f in range(c.n):
            c.ekle(k, 'r', f, cik[f])


# ------------------------------------------------------------------ mekân
def sarkac_egrisi(n, fps, aci, periyot, tohum):
    return [aci * (math.sin(2 * math.pi * f / fps / periyot + tohum) * 0.75 + 0.25 * gurultu(f / fps, str(tohum), 0.9))
            for f in range(n)]
