"""Sahne kurucu: content/film2/blender/<sahne>.json → Blender sahnesi (mekân, kamera, kuklalar, eşyalar, olaylar,
canlılık) → isteğe bağlı EEVEE render (PNG kareler).

  blender -b --factory-startup -P scripts/film/blender/sahne_kur.py -- --sahne content/film2/blender/b00-deneme.json \
      --is <klasor> [--render] [--tek 30,200] [--yuzde 67] [--ornek 8] [--blend <dosya.blend>] [--bulaniklik 0]

Önce: node scripts/film/blender/ses-uret.mjs (replikler) ve node scripts/film/blender/hazirla.mjs (eşya, ses zarfı).
Konumlar mekân resminin pikselleriyle yazılır (referans kameradan görünen yer); 'derinlik' kameradan uzaklığı
belirler: aynı piksel her derinlikte aynı yere düşer, kamera kayınca katmanlar farklı hızda kayar (parallax).
"""
import bpy
import json
import math
import os
import sys
import time

BURA = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURA)
from mathutils import Vector  # noqa: E402

import ortak  # noqa: E402
from ortak import (bul, anahtar_deger, yumusak, asma, yay, gurultu, dizi_yaz, gorunurluk_yaz, egri_yaz, duzlem,
                   izgara, resim_malzemesi, resim_boyu, kanal_torbasi)  # noqa: E402
from rig_kur import Kukla  # noqa: E402
import canlilik  # noqa: E402


def argumanlar():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'render': False, 'tek': None, 'yuzde': 100, 'ornek': 16, 'blend': None, 'bulaniklik': 1}
    i = 0
    while i < len(a):
        k = a[i][2:]
        if k == 'render':
            o['render'] = True
        else:
            o[k] = a[i + 1]
            i += 1
        i += 1
    for k in ('yuzde', 'ornek', 'bulaniklik'):
        o[k] = int(o[k])
    return o


class Mekan:
    """Arka plan resmi + piksel → dünya eşlemesi + bölge bükümleri (perde, sarkaç)."""

    def __init__(self, t, kol, lens):
        self.t = t
        self.yol = bul(t['resim'])
        self.W, self.H = resim_boyu(self.yol)
        self.pxm = t['yukseklik'] / self.H          # referans düzlemde (derinlik 0) piksel başına dünya
        self.zemin = t['zemin_py']                   # derinlik 0'daki ayakların durduğu satır → z = 0
        self.D0 = t['yukseklik'] / (36.0 / lens * 9 / 16)
        self.zc = (self.zemin - self.H / 2) * self.pxm
        self.db = t.get('derinlik', 2.5)
        s = self.s(self.db)
        gen, yuk = self.W * self.pxm * s, self.H * self.pxm * s
        bolgeler = t.get('bukum', [])
        nx, ny = (161, 69) if bolgeler else (2, 2)
        me = izgara('mekan', nx, ny, lambda u, v: ((u - 0.5) * gen, 0.0, (v - 0.5) * yuk))
        me.materials.append(resim_malzemesi(self.yol))
        ob = bpy.data.objects.new('mekan', me)
        kol.objects.link(ob)
        ob.location = (0, self.db, self.zc)
        self.ob = ob
        self.bolgeler = bolgeler
        if bolgeler:
            self._bukum_kur(nx, ny, kol)

    def s(self, d):
        return (self.D0 + d) / self.D0

    def nokta(self, px, py, d=0.0):
        x0 = (px - self.W / 2) * self.pxm
        z0 = (self.zemin - py) * self.pxm
        s = self.s(d)
        return Vector((x0 * s, d, self.zc + (z0 - self.zc) * s))

    def boy(self, px_boy, d):
        """Ekranda px_boy piksel görünen şeyin o derinlikteki dünya boyu."""
        return px_boy * self.pxm * self.s(d)

    def _bukum_kur(self, nx, ny, kol):
        arm_d = bpy.data.armatures.new('mekan-iskelet')
        arm = bpy.data.objects.new('mekan-iskelet', arm_d)
        kol.objects.link(arm)
        arm.location = self.ob.location
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.mode_set(mode='EDIT')
        s = self.s(self.db)

        def yerel(px, py):
            return ((px - self.W / 2) * self.pxm * s, (self.H / 2 - py) * self.pxm * s)

        sabit = arm_d.edit_bones.new('sabit')
        sabit.head, sabit.tail = (0, 0, 0), (0, 0, 0.1)
        for b in self.bolgeler:
            e = arm_d.edit_bones.new(b['ad'])
            x, z = yerel(*b['pivot'])
            e.head, e.tail, e.roll = (x, 0, z), (x, 0, z + 0.05), 0
        bpy.ops.object.mode_set(mode='OBJECT')
        isaret = 1.0 if arm_d.bones['sabit'].matrix_local.col[2].y > 0 else -1.0
        for pb in arm.pose.bones:
            pb.rotation_mode = 'XYZ'
        self.ob.parent = arm
        self.ob.location = (0, 0, 0)
        mod = self.ob.modifiers.new('bukum', 'ARMATURE')
        mod.object = arm
        gr = {b['ad']: self.ob.vertex_groups.new(name=b['ad']) for b in self.bolgeler}
        gs = self.ob.vertex_groups.new(name='sabit')
        for j in range(ny):
            for i in range(nx):
                px, py = i / (nx - 1) * self.W, (1 - j / (ny - 1)) * self.H
                kalan = 1.0
                for b in self.bolgeler:
                    x0, y0, x1, y1 = b['kutu']
                    yu = b.get('yumusak', 30)
                    dx = max(x0 - px, 0, px - x1)
                    dy = max(y0 - py, 0, py - y1)
                    w = 1 - yumusak(math.hypot(dx, dy) / yu)
                    if b.get('asagi'):
                        w *= yumusak((py - b['pivot'][1]) / max(1, (y1 - b['pivot'][1])))
                    w = min(w, kalan)
                    if w > 1e-3:
                        gr[b['ad']].add([j * nx + i], w, 'REPLACE')
                        kalan -= w
                gs.add([j * nx + i], kalan, 'REPLACE')
        self.arm, self.isaret = arm, isaret

    def bukum_pisir(self, n, fps):
        for k, b in enumerate(self.bolgeler):
            d = canlilik.sarkac_egrisi(n, fps, b['aci'], b['periyot'], k * 1.7 + 0.3)
            dizi_yaz(self.arm, f'pose.bones["{b["ad"]}"].rotation_euler', 2, [math.radians(v) * self.isaret for v in d])


class Esya:
    def __init__(self, ad, t, mekan, kol, hazir, n):
        yol = os.path.join(hazir, t.get('resim', ad) + '.png') if not t.get('yol') else bul(t['yol'])
        iw, ih = resim_boyu(yol)
        d = t.get('derinlik', 0.0)
        self.gen = mekan.boy(t['gen_px'], d)
        self.yuk = self.gen * ih / iw
        cap = tuple(t.get('cap', (0.5, 0.0)))
        self.cap = cap
        malz = None
        if 'dolum' in t:   # alttan yükselen dolum (bardak): her esyaya kendi malzemesi
            malz = resim_malzemesi(yol, kesme=t['dolum'].get('v0', 0.0))
        self.ob = duzlem('esya-' + ad, yol, self.gen, self.yuk, kol, cap=cap, malz=malz)
        self.n = n
        p = mekan.nokta(*t['yer'], d) if 'yer' in t else Vector((0, d, 0))
        self.P = [p.copy() for _ in range(n)]
        self.R = [t.get('aci', 0.0)] * n
        self.S = [1.0] * n
        self.SY = [1.0] * n      # yalnız dikey ölçek çarpanı (akışın uzaması)
        self.ZE = [0.0] * n      # zıplama gibi, çocuklara geçmeyen dikey ek (dünya birimi)
        self.ayna = -1.0 if t.get('ayna') else 1.0
        self.gor = [t.get('gorunur', True)] * n

    def yerel(self, u, v, f):
        """Resimdeki (u, v) (0..1, sol-alt) noktasının dünya yeri."""
        lx = (u - self.cap[0]) * self.gen * self.ayna * self.S[f]
        lz = (v - self.cap[1]) * self.yuk * self.S[f] * self.SY[f]
        r = -math.radians(self.R[f])
        c, s = math.cos(r), math.sin(r)
        return self.P[f] + Vector((c * lx - s * lz, 0, s * lx + c * lz + self.ZE[f]))

    def pisir(self):
        dizi_yaz(self.ob, 'location', 0, [p.x for p in self.P])
        dizi_yaz(self.ob, 'location', 1, [p.y for p in self.P])
        dizi_yaz(self.ob, 'location', 2, [p.z + z for p, z in zip(self.P, self.ZE)])
        dizi_yaz(self.ob, 'rotation_euler', 1, [math.radians(r) for r in self.R])  # +Y ekseni: kameradan saat yönü
        dizi_yaz(self.ob, 'scale', 0, [s * self.ayna for s in self.S])
        dizi_yaz(self.ob, 'scale', 2, [s * sy for s, sy in zip(self.S, self.SY)])
        gorunurluk_yaz(self.ob, self.gor)


def kare(t, fps):
    return int(round(t * fps))


# ------------------------------------------------------------------ olaylar
class Kurucu:
    def __init__(self, sahne, is_, o):
        self.sh = sahne
        self.is_ = is_
        self.fps = sahne.get('fps', 30)
        self.n = kare(sahne['sure'], self.fps)
        self.hazir = os.path.join(is_, 'hazir')
        with open(os.path.join(self.hazir, 'ses.json'), encoding='utf-8') as f:
            self.ses = json.load(f)['sesler']
        sc = bpy.context.scene
        self.kol = sc.collection
        self.lens = sahne['kamera'].get('lens', 35)
        mt = dict(sahne['mekan'])
        if 'plaka' in mt:   # hazirla.mjs'in ürettiği temiz plaka (çizili nesnesi silinmiş kare)
            mt['resim'] = os.path.join(self.hazir, mt['plaka'] + '.png')
        self.mekan = Mekan(mt, self.kol, self.lens)
        self.m = 1.0
        if sahne.get('karakterler'):
            with open(bul('assets/karakter/aile-boy.json'), encoding='utf-8') as f:
                boy = json.load(f)
            self.m = self.mekan.boy(sahne['kino_boy_px'], 0) / boy['kinoBoyKare']
        self.c = {}
        for k in sahne.get('karakterler', []):
            d = k.get('derinlik', 0.0)
            p = self.mekan.nokta(k['x'], k['y'], d)
            gor = k.get('gorunusler') or {'on': f'assets/karakter/{k["kit"]}/{k["kit"]}.json'}
            c = Kukla(k['ad'], gor, self.m, self.kol, self.n, self.fps, p, d)
            c.y_px = k['y']
            self.c[k['ad']] = c
        self.e = {}
        for ad, t in sahne.get('esya', {}).items():
            self.e[ad] = Esya(ad, t, self.mekan, self.kol, self.hazir, self.n)
        self.klipler = []
        self.konusanlar = []

    def x_dunya(self, c, px):
        return self.mekan.nokta(px, c.y_px, c.derinlik).x - c.taban.x

    # --- hareket
    def ol_kos(self, c, ev):
        fps, n = self.fps, self.n
        f0, f1 = kare(ev['t'], fps), kare(ev['t'] + ev['sure'], fps)
        x0 = self.x_dunya(c, ev['bas']) if 'bas' in ev else c.X[f0]
        x1 = self.x_dunya(c, ev['hedef'])
        hiz_bas = ev.get('hizli_bas', False)
        ham = []
        for f in range(n):
            u = (f - f0) / max(1, f1 - f0)
            if u <= 0:
                ham.append(x0)
            elif u >= 1:
                ham.append(x1)
            else:
                # sabit hız, son %25'te yumuşak duruş; baştan hızlı (ekran dışından giriyorsa)
                a = 0.0 if hiz_bas else 0.2
                b = 0.28
                def v(uu):
                    return min(1.0, uu / a if a else 1.0) * (1 - yumusak((uu - (1 - b)) / b))
                N = 40
                top = sum(v((i + 0.5) / N) for i in range(N)) / N
                k = int(u * N)
                part = sum(v((i + 0.5) / N) for i in range(k)) / N + v((k + 0.5) / N) * (u * N - k) / N
                ham.append(x0 + (x1 - x0) * part / top)
        once = c.X[:]
        for f in range(n):
            if f >= f0 or 'bas' in ev:
                c.X[f] = ham[f]
        # duruşta yay: gövde hedefi biraz aşar, geri oturur
        yx = yay(c.X, fps, 2.4, 0.42)
        for f in range(f0, n):
            c.X[f] = c.X[f] + (yx[f] - c.X[f]) * min(1.0, max(0.0, (f - f1 + 8) / 8.0)) if f > f1 - 8 else c.X[f]
        h = c.m * 2038
        yon = 1 if x1 > x0 else -1
        adim = ev.get('adim', 0.36 * h)
        faz = 0.0
        vmax = abs(x1 - x0) / max(1e-3, ev['sure']) * 1.15
        hizlar = [0.0] + [(c.X[f] - c.X[f - 1]) * fps for f in range(1, n)]
        for f in range(max(1, f0 - 2), min(n, f1 + 12)):
            v = abs(hizlar[f])
            A = min(1.0, v / max(0.2, vmax * 0.6))
            if A < 0.02:
                continue
            faz += 2 * math.pi * v / fps / (2 * adim)
            s, co = math.sin(faz), math.cos(faz)
            kos = ev.get('kos', True)
            bac = 26 if kos else 16
            c.ekle('bacak-ust-sag', 'r', f, -yon * bac * s * A)
            c.ekle('bacak-ust-sol', 'r', f, yon * bac * s * A)
            c.ekle('bacak-alt-sag', 'r', f, yon * 38 * max(0, s) * A)
            c.ekle('bacak-alt-sol', 'r', f, yon * 38 * max(0, -s) * A)
            c.ekle('ayak-sag', 'r', f, -yon * 10 * s * A)
            c.ekle('ayak-sol', 'r', f, yon * 10 * s * A)
            c.ekle('kol-ust-sag', 'r', f, yon * 30 * s * A + 12 * A)
            c.ekle('kol-ust-sol', 'r', f, -yon * 30 * s * A - 12 * A)
            c.ekle('kol-alt-sag', 'r', f, -40 * A)
            c.ekle('kol-alt-sol', 'r', f, 40 * A)
            sek = abs(s)
            c.ekle('kok', 'y', f, A * (0.045 if kos else 0.02) * h * sek)
            c.ekle('kok', 'sy', f, 1 - A * 0.05 * (1 - sek))
            c.ekle('kok', 'sx', f, 1 + A * 0.04 * (1 - sek))
            c.ekle('kafa', 'r', f, -yon * 3 * A + 2 * co * A)
            c.ekle('govde', 'r', f, yon * 2.5 * s * A)
            c.mesgul[f] = True
        # duruş: ağırlık öne gider, ezilir, toparlanır
        for f in range(f1 - 4, min(n, f1 + 14)):
            u = (f - (f1 - 4)) / 18
            b = math.sin(math.pi * u) * math.exp(-2 * u)
            c.ekle('kok', 'sy', f, 1 - 0.07 * b)
            c.ekle('kok', 'sx', f, 1 + 0.05 * b)
            c.ekle('kafa', 'r', f, yon * 4 * b)

    def ol_zipla(self, c, ev):
        fps = self.fps
        h = c.m * 2038
        t0 = ev['t']
        hz = ev.get('yukseklik', 0.2) * h
        hava = ev.get('sure', 0.5)
        kollar = ev.get('kollar', 70)
        haz = 0.16
        for f in range(max(0, kare(t0 - haz, fps)), min(self.n, kare(t0 + hava + 0.45, fps))):
            t = f / fps
            if t < t0:                     # hazırlık: çömel
                u = yumusak((t - (t0 - haz)) / haz)
                c.ekle('kok', 'sy', f, 1 - 0.12 * u)
                c.ekle('kok', 'sx', f, 1 + 0.08 * u)
                c.ekle('kol-ust-sag', 'r', f, -15 * u)
                c.ekle('kol-ust-sol', 'r', f, 15 * u)
            elif t < t0 + hava:            # havada: uzar, kollar açılır
                u = (t - t0) / hava
                c.Z[f] += 4 * hz * u * (1 - u)
                st = 0.12 * max(0.0, 1 - 2.2 * u) - 0.03 * max(0.0, u - 0.7) / 0.3
                c.ekle('kok', 'sy', f, 1 + st)
                c.ekle('kok', 'sx', f, 1 - st * 0.6)
                k = math.sin(math.pi * min(1, u * 1.3))
                c.ekle('kol-ust-sag', 'r', f, kollar * k)
                c.ekle('kol-ust-sol', 'r', f, -kollar * k)
                c.ekle('kol-alt-sag', 'r', f, -20 * k)
                c.ekle('kol-alt-sol', 'r', f, 20 * k)
                c.ekle('bacak-alt-sag', 'r', f, 14 * k)
                c.ekle('bacak-alt-sol', 'r', f, -14 * k)
            else:                          # iniş: ezil, aşarak toparlan
                u = (t - t0 - hava) / 0.45
                b = math.exp(-5 * u) * math.cos(10 * u)
                c.ekle('kok', 'sy', f, 1 - 0.13 * b)
                c.ekle('kok', 'sx', f, 1 + 0.09 * b)
            c.mesgul[f] = True

    def ol_sallan(self, c, ev):
        h = c.m * 2038
        for f in range(kare(ev['t'], self.fps), min(self.n, kare(ev['t'] + ev['sure'], self.fps))):
            t = f / self.fps - ev['t']
            zarf = min(1.0, t / 0.2, (ev['sure'] - t) / 0.2)
            s = 0.5 - 0.5 * math.cos(2 * math.pi * t / ev.get('periyot', 0.5))
            g = ev.get('genlik', 0.03) * zarf
            c.ekle('kok', 'sy', f, 1 - 0.8 * g * s)
            c.ekle('kok', 'sx', f, 1 + 0.5 * g * s)
            c.ekle('bacak-alt-sag', 'r', f, 10 * g / 0.03 * s * 0.5)
            c.ekle('bacak-alt-sol', 'r', f, -10 * g / 0.03 * s * 0.5)
            if ev.get('zipla'):
                c.Z[f] += g * h * 2 * abs(math.sin(math.pi * t / ev.get('periyot', 0.5)))

    def ol_poz(self, c, ev):
        an = ev['anahtarlar']
        kemikler = {k for a in an for k in a[1]}
        t0, t1 = an[0][0], an[-1][0]
        for k in kemikler:
            if not c.kemik_var(k.split(':')[0]):
                continue
            kemik, tur_ = (k.split(':') + ['r'])[:2]
            dz = [(a[0], a[1].get(k, 0.0), a[2] if len(a) > 2 else 'yumusak') for a in an]
            for f in range(max(0, kare(t0, self.fps)), min(self.n, kare(t1, self.fps) + 1)):
                v = anahtar_deger(dz, f / self.fps)
                if tur_ in ('x', 'y'):
                    v *= c.m * 2038
                c.ekle(kemik, tur_, f, v)
            if not ev.get('serbest'):
                for f in range(kare(t0, self.fps), min(self.n, kare(t1, self.fps) + 1)):
                    c.mesgul[f] = True

    def ol_yuz(self, c, ev):
        f0, f1 = kare(ev['t'], self.fps), kare(ev['t'] + ev['sure'], self.fps)
        for yuva in ('gozler', 'kaslar', 'agiz'):
            if yuva in ev:
                for f in range(f0, min(self.n, f1)):
                    c.sec(yuva, f, f'{yuva}-{ev[yuva]}')

    def ol_uyu(self, c, ev):
        fps = self.fps
        f0, f1 = kare(ev['t'], fps), kare(ev['t'] + ev['sure'], fps)
        h = c.m * 2038
        for f in range(f0, min(self.n, f1)):
            t = f / fps
            if c.secim['gozler'][f] == c.ana.kit['yuvalar']['gozler']['varsayilan']:
                c.secim['gozler'][f] = 'gozler-kapali'
            c.secim['agiz'][f] = 'agiz-az'
            nef = math.sin(2 * math.pi * t / 2.6)
            c.ekle('govde', 'sy', f, 1 + 0.03 * nef)
            c.ekle('govde', 'sx', f, 1 + 0.045 * nef)
            c.ekle('kafa', 'r', f, 4 + 3 * gurultu(t, c.ad + 'uyku', 0.6))
            c.ekle('kafa', 'y', f, -0.012 * h)
            c.ekle('kalca', 'x', f, 0.01 * h * math.sin(2 * math.pi * t / 5.3))
            c.ekle('govde', 'r', f, -2.5 * math.sin(2 * math.pi * t / 5.3 + 0.6))
        # başı düşüp silkinerek kalkma (uyuklama)
        for td in ev.get('bas_dus', []):
            for f in range(kare(td, fps), min(self.n, kare(td + 1.6, fps))):
                u = (f / fps - td)
                v = 14 * yumusak(u / 1.1) if u < 1.1 else 14 * (1 - asma((u - 1.1) / 0.5, 2.2))
                c.ekle('kafa', 'r', f, v)
                c.ekle('kafa', 'y', f, -0.02 * h * v / 14)
        self.zzz.append((c, f0, f1))

    def ol_konus(self, c, ev):
        s = self.ses[ev['ses']]
        bas = ev['t'] - s['bas']
        self.klipler.append({'kimlik': ev['ses'], 't': round(bas, 3)})
        f0 = kare(bas, self.fps)
        canlilik.agiz(c, f0, s['zarf'], ev.get('gul', False))
        if not ev.get('arka'):
            self.konusanlar.append((kare(ev['t'], self.fps), kare(bas + s['son'], self.fps), c, c.ad))

    def ol_bak(self, c, ev):
        f0, f1 = kare(ev['t'], self.fps), kare(ev['t'] + ev['sure'], self.fps)
        sec = 'gozler-sola' if ev['yon'] == 'sag' else 'gozler-saga'
        for f in range(f0, min(self.n, f1)):
            c.sec('gozler', f, sec)
            u = min(1.0, (f - f0) / 6, (f1 - f) / 6)
            c.ekle('kafa', 'r', f, (4 if ev['yon'] == 'sag' else -4) * u)

    # --- eşya
    def ol_tut(self, e, ev):
        c = self.c[ev['kim']]
        kemikler = ev['kemik'] if isinstance(ev['kemik'], list) else [ev['kemik']]
        P = c.ana.kit['parcalar']
        f0 = kare(ev['t'], self.fps)
        f1 = min(self.n, kare(ev.get('bitis', self.sh['sure']), self.fps))
        bas = e.P[max(0, f0 - 1)].copy()
        bas_r = e.R[max(0, f0 - 1)]
        gecis = ev.get('gecis', 0.15)
        ofs = ev.get('ofset', [0, 0])
        on = ev.get('on', -0.03)
        for f in range(f0, f1):
            top, ac = Vector((0, 0, 0)), 0.0
            for k in kemikler:
                kut = P[k]['kutu']
                p, a = c.nokta(k, ev.get('nokta', (kut[0] + kut[2] / 2, kut[1] + kut[3] / 2)), f)
                top += p
                ac += a
            hedef = top / len(kemikler) + Vector((ofs[0] * c.m * 2038, 0, ofs[1] * c.m * 2038))
            hedef.y = c.taban.y + on
            r = ac / len(kemikler) * ev.get('aci_takip', 1.0) + ev.get('aci', 0.0)
            if 'egim' in ev:
                r += anahtar_deger([(a[0], a[1], a[2] if len(a) > 2 else 'yumusak') for a in ev['egim']], f / self.fps)
            u = yumusak((f - f0) / max(1, gecis * self.fps))
            e.P[f] = bas.lerp(hedef, u)
            e.R[f] = bas_r + (r - bas_r) * u

    def ol_at(self, e, ev):
        fps = self.fps
        f0 = kare(ev['t'], fps)
        p0 = e.P[f0 - 1].copy()
        r0 = e.R[f0 - 1]
        tv = ev['varis']
        f1 = kare(tv, fps)
        hd = ev['hedef']
        if 'kim' in hd:
            c = self.c[hd['kim']]
            p1, _ = c.nokta(hd['kemik'], hd['nokta'], f1)
            p1.y = c.taban.y - 0.04
        else:
            p1 = self.mekan.nokta(hd['px'][0], hd['px'][1], hd.get('derinlik', p0.y))
        g = ev.get('yercekimi', 6.0)
        T = (f1 - f0) / fps
        vx = (p1.x - p0.x) / T
        vz = (p1.z - p0.z + 0.5 * g * T * T) / T
        donus = ev.get('donus', 360)
        for f in range(f0, min(self.n, f1 + 1)):
            t = (f - f0) / fps
            e.P[f] = Vector((p0.x + vx * t, p0.y + (p1.y - p0.y) * t / T, p0.z + vz * t - 0.5 * g * t * t))
            e.R[f] = r0 + donus * t / T
        son = e.P[min(self.n - 1, f1)].copy()
        rs = e.R[min(self.n - 1, f1)]
        if 'sek' in ev:   # çarpınca sekip yere düşer
            sk = ev['sek']
            zemin = self.mekan.nokta(0, sk['zemin_py'], son.y).z
            bvx, bvz = sk.get('vx', -0.4), sk.get('vz', 1.2)
            t = 0.0
            p = son.copy()
            for f in range(f1 + 1, self.n):
                t += 1 / fps
                z = son.z + bvz * t - 0.5 * g * t * t
                if z <= zemin:
                    bvz = -bvz * 0.3 if abs(bvz) > 0.3 else 0
                    son = Vector((p.x, p.y, zemin))
                    t = 0
                    bvx *= 0.5
                    z = zemin
                p = Vector((p.x + bvx / fps, son.y, z))
                e.P[f] = p
                rs += bvx * 200 / fps
                e.R[f] = rs
        else:
            ezil = ev.get('ezil', True)
            for f in range(f1 + 1, self.n):
                e.P[f] = son.copy()
                e.R[f] = rs
                u = (f - f1) / fps
                if ezil and u < 0.5:
                    e.S[f] = 1 - 0.12 * math.exp(-6 * u) * math.cos(14 * u)

    # --- özel küçük hareketler
    def akis(self, t):
        """Kaynak eşyanın bir noktasından hedefe akan ince sıvı (çay)."""
        ks, hs = self.e[t['kaynak']], self.e[t['hedef']]
        yol = os.path.join(self.hazir, t.get('resim', 'cay') + '.png')
        ob = duzlem('akis', yol, 0.02, 1.0, self.kol, cap=(0.5, 1.0))
        f0, f1 = kare(t['t'], self.fps), kare(t['t'] + t['sure'], self.fps)
        X, Y, Z, R, S, G = [], [], [], [], [], []
        for f in range(self.n):
            a = ks.yerel(*t['nokta'], f)
            b = hs.yerel(*t['hedef_nokta'], f)
            d = b - a
            L = max(1e-4, math.hypot(d.x, d.z))
            u = min(1.0, (f - f0) / 5) if f < f1 else max(0.0, 1 - (f - f1) / 4)
            X.append(a.x); Y.append(min(a.y, b.y) - 0.01); Z.append(a.z)
            R.append(-math.atan2(d.x, -d.z))  # aşağı yönden sapma (+ = saat yönü)
            S.append(L * max(0.001, u))
            G.append(f0 <= f < f1 + 4)
        dizi_yaz(ob, 'location', 0, X)
        dizi_yaz(ob, 'location', 1, Y)
        dizi_yaz(ob, 'location', 2, Z)
        dizi_yaz(ob, 'rotation_euler', 1, R)
        dizi_yaz(ob, 'scale', 2, S)
        dizi_yaz(ob, 'scale', 0, [t.get('kalinlik', 1.0)] * self.n)
        gorunurluk_yaz(ob, G)

    def parcacik(self, ad, resim, kaynaklar, boyut, omur, aralik, yuksel, kac=8, salinim=0.02, opak=0.7, buyu=1.8):
        """kaynaklar(f) → Vector ya da None. Yükselen, büyüyen, solan sprite'lar (buhar, Zzz)."""
        yol = os.path.join(self.hazir, resim + '.png')
        ob_l = []
        for i in range(kac):
            m = resim_malzemesi(yol, saydam_carpan=opak)
            ob = duzlem(f'{ad}-{i}', yol, boyut, boyut, self.kol, malz=m)
            ob_l.append((ob, m))
        nf = int(omur * self.fps)
        X = [[0.0] * self.n for _ in ob_l]
        Y = [[0.0] * self.n for _ in ob_l]
        Z = [[0.0] * self.n for _ in ob_l]
        S = [[0.001] * self.n for _ in ob_l]
        A = [[0.0] * self.n for _ in ob_l]
        G = [[False] * self.n for _ in ob_l]
        sira = 0
        f = 0
        while f < self.n:
            p = kaynaklar(f)
            if p is not None:
                i = sira % kac
                sira += 1
                for k in range(nf):
                    g = f + k
                    if g >= self.n:
                        break
                    u = k / nf
                    X[i][g] = p.x + salinim * math.sin(u * 5 + sira) + u * 0.02 * math.sin(sira * 2.3)
                    Y[i][g] = p.y - 0.02
                    Z[i][g] = p.z + yuksel * u
                    S[i][g] = 0.4 + buyu * u
                    A[i][g] = opak * min(1.0, u * 5) * (1 - u) ** 1.2
                    G[i][g] = True
            f += max(1, int(aralik * self.fps))
        for i, (ob, m) in enumerate(ob_l):
            dizi_yaz(ob, 'location', 0, X[i])
            dizi_yaz(ob, 'location', 1, Y[i])
            dizi_yaz(ob, 'location', 2, Z[i])
            dizi_yaz(ob, 'scale', 0, S[i])
            dizi_yaz(ob, 'scale', 2, S[i])
            dizi_yaz(m.node_tree, 'nodes["saydamlik"].inputs[1].default_value', 0, A[i])
            gorunurluk_yaz(ob, G[i])

    def kus(self, t):
        """Balkon korkuluğunda sekip gagalayan kuş (2 kare: kanat kapalı / açık)."""
        mk = self.mekan
        d = mk.db - 0.02
        boy = mk.boy(t['gen_px'], d)
        k1 = duzlem('kus-1', os.path.join(self.hazir, 'kus-1.png'), boy, boy * 200 / 240, self.kol, cap=(0.5, 0.08))
        k2 = duzlem('kus-2', os.path.join(self.hazir, 'kus-2.png'), boy, boy * 200 / 240, self.kol, cap=(0.5, 0.08))
        x0, x1 = t['x_aralik']
        y = t['y']
        import random
        r = random.Random(4)
        X, Z, R, SX, kanat = [], [], [], [], []
        x = (x0 + x1) / 2
        yon = 1
        f = 0
        plan = []
        while f < self.n:
            bekle = int(r.uniform(0.8, 1.8) * self.fps)
            plan.append(('dur', f, f + bekle))
            f += bekle
            sek = int(0.3 * self.fps)
            plan.append(('sek', f, f + sek))
            f += sek
        hedefx = x
        for tip, a, b in plan:
            if tip == 'sek':
                yeni = min(x1, max(x0, x + r.uniform(-60, 60)))
                yon = 1 if yeni > x else -1
                hedefx = yeni
            for g in range(a, min(b, self.n)):
                u = (g - a) / max(1, b - a)
                if tip == 'sek':
                    px = x + (hedefx - x) * yumusak(u)
                    hz = 18 * 4 * u * (1 - u)
                    X.append(px); Z.append(hz); R.append(0); kanat.append(int(u * 6) % 2 == 0)
                else:
                    gaga = 25 * max(0.0, math.sin(2 * math.pi * u * 2)) if (a // 7) % 2 == 0 else 0
                    X.append(x); Z.append(0); R.append(gaga * yon); kanat.append(False)
                SX.append(yon)
            if tip == 'sek':
                x = hedefx
        for ob, gor in ((k1, [not k for k in kanat]), (k2, kanat)):
            P = [mk.nokta(X[f], y - Z[f], d) for f in range(self.n)]
            dizi_yaz(ob, 'location', 0, [p.x for p in P])
            dizi_yaz(ob, 'location', 1, [p.y for p in P])
            dizi_yaz(ob, 'location', 2, [p.z for p in P])
            dizi_yaz(ob, 'rotation_euler', 1, [math.radians(v) for v in R])
            dizi_yaz(ob, 'scale', 0, SX)
            gorunurluk_yaz(ob, gor)

    # --- karaktersiz ses (anlatıcı, resme çizili karakter, efekt)
    def ol_ses(self, ev):
        s = self.ses[ev['ses']]
        k = {'kimlik': ev['ses'], 't': round(ev['t'] - s['bas'], 3)}
        if 'kazanc' in ev:
            k['kazanc'] = ev['kazanc']
        self.klipler.append(k)

    # --- parça hareketi (kesme kukla: inek başı, kuyruk, kamyon, tekerlek, bardak)
    def esya_hareket(self, e, t):
        """Esya JSON alanları (hepsi isteğe bağlı, sırayla uygulanır):
        hareket        [[t, px, py, kolaylik?]]  mekân pikselinde yol
        bag            {esya, nokta:[u,v], on, aci_takip}  başka parçanın resmindeki noktaya bağlı (çocuk)
        aci_anahtar    [[t, derece, kolaylik?]]  (+ saat yönü)
        salinim        [{kanal: aci|x|y|olcek|olcek_y, genlik, periyot, faz, t0, t1, harmonik}]
        zipla          {genlik_px, periyot, t0, t1}  çocuklara geçen sekme (kamyon yaylanması)
        teker          {yaricap_px}  yatay yoldan dönme açısı
        olcek_anahtar  [[t, olcek, olcek_y?, kolaylik?]]
        gorunur_anahtar [[t, true|false]]
        kirpma         {aralik:[a, b], tohum, kare}  göz kapağı: yalnız kırpma karelerinde görünür
        dolum          {anahtarlar:[[t, 0..1, kolaylik?]], v0, v1}  resmin alttan v0 → v1 arası görünür
        """
        fps, n, mk = self.fps, self.n, self.mekan
        d = t.get('derinlik', 0.0)

        def egri(an, i, tt, kol=None):
            return anahtar_deger([(a[0], a[i], a[kol] if kol is not None and len(a) > kol else 'yumusak') for a in an], tt)

        if 'hareket' in t:
            an = t['hareket']
            for f in range(n):
                tt = f / fps
                e.P[f] = mk.nokta(egri(an, 1, tt, 3), egri(an, 2, tt, 3), d)
        if 'bag' in t:
            b = t['bag']
            ebe = self.e[b['esya']]
            for f in range(n):
                p = ebe.yerel(b['nokta'][0], b['nokta'][1], f)
                p.y = ebe.P[f].y + b.get('on', -0.002)
                e.P[f] = p
                e.R[f] = e.R[f] + ebe.R[f] * b.get('aci_takip', 1.0)
                e.S[f] = e.S[f] * ebe.S[f]
        if 'aci_anahtar' in t:
            for f in range(n):
                e.R[f] += egri(t['aci_anahtar'], 1, f / fps, 2)
        if 'olcek_anahtar' in t:
            an = t['olcek_anahtar']
            for f in range(n):
                e.S[f] *= egri(an, 1, f / fps, 3)
                if len(an[0]) > 2:
                    e.SY[f] *= egri(an, 2, f / fps, 3)
        for s in t.get('salinim', []):
            t0, t1 = s.get('t0', 0.0), s.get('t1', self.sh['sure'])
            for f in range(n):
                tt = f / fps
                if not (t0 <= tt <= t1):
                    continue
                zarf = min(1.0, (tt - t0) / 0.3, (t1 - tt) / 0.3)
                faz = 2 * math.pi * tt / s['periyot'] + s.get('faz', 0.0)
                v = math.sin(faz) + s.get('harmonik', 0.0) * math.sin(2 * faz + 0.7)
                v *= s['genlik'] * zarf
                k = s['kanal']
                if k == 'aci':
                    e.R[f] += v
                elif k == 'x':
                    e.P[f] = e.P[f] + Vector((mk.boy(v, d), 0, 0))
                elif k == 'y':
                    e.P[f] = e.P[f] + Vector((0, 0, mk.boy(v, d)))
                elif k == 'olcek':
                    e.S[f] *= 1 + v
                elif k == 'olcek_y':
                    e.SY[f] *= 1 + v
        if 'zipla' in t:
            z = t['zipla']
            t0, t1 = z.get('t0', 0.0), z.get('t1', self.sh['sure'])
            for f in range(n):
                tt = f / fps
                if t0 <= tt <= t1:
                    zarf = min(1.0, (tt - t0) / 0.2, (t1 - tt) / 0.2)
                    e.ZE[f] += mk.boy(z['genlik_px'], d) * zarf * abs(math.sin(math.pi * tt / z['periyot']))
        if 'teker' in t:
            r = mk.boy(t['teker']['yaricap_px'], d)
            for f in range(n):
                e.R[f] += math.degrees((e.P[f].x - e.P[0].x) / r)
        if 'gorunur_anahtar' in t:
            an = sorted(t['gorunur_anahtar'])
            for f in range(n):
                g = e.gor[f]
                for a in an:
                    if a[0] <= f / fps:
                        g = bool(a[1])
                e.gor[f] = g
        if 'kirpma' in t:
            import random
            k = t['kirpma']
            r = random.Random(k.get('tohum', 1))
            e.gor = [False] * n
            f = int(r.uniform(0.5, 1.5) * fps)
            while f < n:
                for i in range(k.get('kare', 4)):
                    if f + i < n:
                        e.gor[f + i] = True
                f += int(r.uniform(*k.get('aralik', [2.0, 4.0])) * fps)
        if 'dolum' in t:
            dl = t['dolum']
            v0, v1 = dl.get('v0', 0.0), dl.get('v1', 1.0)
            m = e.ob.data.materials[0]
            dizi_yaz(m.node_tree, 'nodes["kesme"].inputs[1].default_value', 0,
                     [v0 + (v1 - v0) * egri(dl['anahtarlar'], 1, f / fps, 2) for f in range(n)])

    # --- kamera
    def kamera(self):
        k = self.sh['kamera']
        mk = self.mekan
        cam = bpy.data.cameras.new('kamera')
        cam.lens = self.lens
        cam.sensor_fit = 'HORIZONTAL'
        cam.sensor_width = 36
        cam.clip_start = 0.2
        cam.clip_end = 100
        cam.dof.use_dof = True
        cam.dof.aperture_fstop = k.get('fstop', 2.2)
        ob = bpy.data.objects.new('kamera', cam)
        self.kol.objects.link(ob)
        ob.rotation_euler = (math.radians(90), 0, 0)
        an = [(a['t'], a['x'], a.get('yakin', 1.0), a.get('e', 'gircik'), a.get('y')) for a in k['anahtarlar']]
        dikey = all(a[4] is not None for a in an)   # 'y' (kadraj ortası, piksel) verilmişse dikey de kayar
        X, Y, Z, F = [], [], [], []
        alt = (mk.zemin - mk.H) * mk.pxm
        for f in range(self.n):
            t = f / self.fps
            px = anahtar_deger([(a[0], a[1], a[3]) for a in an], t)
            yk = anahtar_deger([(a[0], a[2], a[3]) for a in an], t)
            D = mk.D0 / yk
            if dikey:
                py = anahtar_deger([(a[0], a[4], a[3]) for a in an], t)
                yy = mk.H / 2 / yk
                py = min(mk.H - yy, max(yy, py))           # kadraj resmin dışına taşmaz
                xx = yy * 16 / 9
                px = min(mk.W - xx, max(xx, px))
                z = (mk.zemin - py) * mk.pxm + k.get('z_pay', 0.0)
            else:
                z = alt + mk.D0 * (36.0 / self.lens * 9 / 16) / (2 * yk) + k.get('z_pay', 0.0)
            el = k.get('el', 0.004)
            X.append((px - mk.W / 2) * mk.pxm + el * gurultu(t, 'kx', 0.35))
            Y.append(-D)
            Z.append(z + el * 0.7 * gurultu(t, 'kz', 0.3))
            F.append(D + k.get('odak_derinlik', 0.0))
        dizi_yaz(ob, 'location', 0, X)
        dizi_yaz(ob, 'location', 1, Y)
        dizi_yaz(ob, 'location', 2, Z)
        dizi_yaz(cam, 'dof.focus_distance', 0, F)
        bpy.context.scene.camera = ob

    # --- ana akış
    def kur(self):
        sh = self.sh
        self.zzz = []
        olaylar = sorted(sh.get('olaylar', []), key=lambda e: e['t'])
        esya_olay = []
        for ev in olaylar:
            tip = ev['tip']
            if tip in ('tut', 'at'):
                esya_olay.append(ev)
                continue
            if tip == 'ses':
                self.ol_ses(ev)
                continue
            getattr(self, 'ol_' + tip)(self.c[ev['kim']], ev)
        # parça hareketleri: önce ebeveynler (bag zinciri)
        bitti = set()

        def hareket(ad):
            if ad in bitti:
                return
            t = sh['esya'][ad]
            if 'bag' in t:
                hareket(t['bag']['esya'])
            self.esya_hareket(self.e[ad], t)
            bitti.add(ad)
        for ad in sh.get('esya', {}):
            hareket(ad)
        for c in self.c.values():
            canlilik.dinleme(c, [(a, b, k.taban.x + k.X[min(a, self.n - 1)], ad) for a, b, k, ad in self.konusanlar])
            canlilik.kirpma(c)
            canlilik.bekleme(c)
            canlilik.nefes(c)
            canlilik.takip(c)
        for ev in esya_olay:
            getattr(self, 'ol_' + ev['tip'])(self.e[ev['esya']], ev)
        for c in self.c.values():
            c.pisir()
        for e in self.e.values():
            e.pisir()
        for t in sh.get('akis', []):
            self.akis(t)
        for t in sh.get('buhar', []):
            if 'esya' in t:
                es = self.e[t['esya']]
                f0, f1 = kare(t.get('t', 0), self.fps), kare(t.get('bitis', sh['sure']), self.fps)
                kay = (lambda es, t, f0, f1: lambda f: es.yerel(*t['nokta'], f) if f0 <= f < f1 else None)(es, t, f0, f1)
                self.parcacik('buhar-' + t['esya'] + str(len(self.kol.objects)), t.get('resim', 'buhar'), kay,
                              self.mekan.boy(t.get('boy_px', 40), 0), t.get('omur', 1.8),
                              t.get('aralik', 0.35), t.get('yuksel', 0.12), kac=t.get('kac', 7), opak=t.get('opak', 0.55),
                              salinim=t.get('salinim', 0.02), buyu=t.get('buyu', 1.8))
        for c, f0, f1 in self.zzz:
            P = c.ana.kit['parcalar']['kafa']['kutu']

            def kay(f, c=c, f0=f0, f1=f1, P=P):
                if not (f0 <= f < f1) or (f - f0) % int(1.5 * self.fps):
                    return None
                p, _ = c.nokta('kafa', (P[0] + P[2] * 0.85, P[1] + P[3] * 0.1), f)
                return p
            self.parcacik('zzz-' + c.ad, 'zzz', kay, c.m * 2038 * 0.16, 2.2, 1 / self.fps, c.m * 2038 * 0.4,
                          kac=3, salinim=0.04, opak=0.95, buyu=1.2)
        if 'kus' in sh:
            self.kus(sh['kus'])
        self.mekan.bukum_pisir(self.n, self.fps)
        self.kamera()


def render_ayarla(sc, sh, o):
    r = sc.render
    sc.render.engine = 'BLENDER_EEVEE'
    r.fps = sh.get('fps', 30)
    r.resolution_x, r.resolution_y = sh.get('cozunurluk', [1920, 1080])
    r.resolution_percentage = o['yuzde']
    sc.eevee.taa_render_samples = o['ornek']
    r.use_motion_blur = bool(o['bulaniklik'])
    r.motion_blur_shutter = 0.5
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    sc.display_settings.display_device = 'sRGB'
    r.film_transparent = False
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.compression = 15
    sc.frame_start = 1
    w = bpy.data.worlds.new('dunya')
    w.color = (0, 0, 0)
    sc.world = w


def sahne_isle(sh, o, is_, cikti, t0, sec=None):
    """Tek sahneyi kurar, isteğe bağlı render eder. sec: yalnız bu kareler (--tek)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ortak._malz.clear()   # önceki kesitin malzemeleri silindi
    sc = bpy.context.scene
    k = Kurucu(sh, is_, o)
    sc.frame_end = k.n
    k.kur()
    render_ayarla(sc, sh, o)
    print(f'[sahne] {sh.get("ad", "")} kuruldu: {k.n} kare, {time.time() - t0:.1f} sn')
    if o['blend']:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(o['blend']))
    os.makedirs(cikti, exist_ok=True)
    if sec is not None:
        for fr in sec:
            sc.frame_set(fr)
            sc.render.filepath = os.path.join(cikti, f'tek-{fr:04d}.png')
            bpy.ops.render.render(write_still=True)
            print(f'[sahne] kare {fr} ({time.time() - t0:.1f} sn)')
    elif o['render']:
        sc.render.filepath = os.path.join(cikti, '')
        bpy.ops.render.render(animation=True)
        print(f'[sahne] render bitti: {time.time() - t0:.1f} sn')
    return k


def main():
    o = argumanlar()
    t0 = time.time()
    with open(bul(o['sahne']), encoding='utf-8') as f:
        sh = json.load(f)
    is_ = os.path.abspath(o['is'])
    tek = [int(x) for x in o['tek'].split(',')] if o['tek'] else None
    if 'kesitler' not in sh:
        k = sahne_isle(sh, o, is_, os.path.join(is_, 'kare'), t0, tek)
        with open(os.path.join(is_, 'klipler.json'), 'w', encoding='utf-8') as f:
            json.dump({'fps': k.fps, 'sure': sh['sure'], 'klipler': k.klipler}, f, ensure_ascii=False, indent=1)
        return
    # Kurgu: art arda kesitler, her biri kendi mekânı / kamerası / parçalarıyla; aralarında 'gecis' sn çapraz geçiş.
    # Hepsi tek Blender sürecinde sırayla render edilir (bilgisayar paylaşımlı). --tek: kurgu zamanındaki kareler.
    # --kesit 2: yalnız o kesit.
    fps = sh.get('fps', 30)
    gecis = sh.get('gecis', 0.5)
    ortak_alan = {a: v for a, v in sh.items() if a not in ('kesitler', 'replikler')}
    bas, kesitler, klipler = 0.0, [], []
    for i, ks in enumerate(sh['kesitler']):
        kesitler.append({'klasor': f'kesit-{i + 1:02d}', 'bas': round(bas, 4), 'sure': ks['sure']})
        bas += ks['sure'] - gecis
    toplam = round(bas + gecis, 4)
    for i, ks in enumerate(sh['kesitler']):
        b = kesitler[i]['bas']
        if o.get('kesit') and int(o['kesit']) != i + 1:
            continue
        sec = None
        if tek is not None:
            sec = [fr - int(round(b * fps)) for fr in tek if b * fps < fr <= (b + ks['sure']) * fps]
            if not sec:
                continue
        alt = dict(ortak_alan)
        alt.update(ks)
        k = sahne_isle(alt, o, is_, os.path.join(is_, kesitler[i]['klasor']), t0, sec)
        for c in k.klipler:
            c = dict(c)
            c['t'] = round(c['t'] + b, 3)
            klipler.append(c)
    if not o['tek'] and not o.get('kesit'):
        with open(os.path.join(is_, 'klipler.json'), 'w', encoding='utf-8') as f:
            json.dump({'fps': fps, 'sure': toplam, 'gecis': gecis, 'kesitler': kesitler, 'klipler': klipler},
                      f, ensure_ascii=False, indent=1)
    print(f'[sahne] kurgu: {len(kesitler)} kesit, {toplam:.2f} sn')


main()
