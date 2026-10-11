"""Rig kurucu: kukla kiti (assets/karakter/<ad>/<ad>.json) → Blender iskeleti + bükülen ızgara parçalar.

Kit sözleşmesi (Seri 1/2 kitleri ile aynı): parcalar{ad: {resim, kutu[x,y,w,h], pivot, ust, sinir, yuva}}, sira, yuvalar,
gizli, zemin. Görünüşler (URETIM-YOLU §2.2): her açı ('on', '34', 'yan', 'arka') ayrı kit JSON'udur; aynı karakterin
alt rig'i olarak kurulur, kemik adları ortaktır, açı değişimi tek karede görünürlükle olur. Turntable kitleri
gelince sahne JSON'unda 'gorunusler' altına yolu yazmak yeter.

Bükülme: kol/bacak/kuyruk/kulak parçaları sık ızgaradır. Eklemde iki kemiğe yumuşak ağırlıkla bağlıdır (eklem
çizgisinde iki parça da %50-%50 → dikiş açılmaz, dirsek/diz kırılmadan bükülür).

Kanallar: kemik başına kare dizileri — r (derece, + saat yönü), x / y (dünya birimi, ekran sağ / yukarı),
sx / sy (ölçek; kok kemiğinde squash & stretch). Hepsi toplanır (ölçek çarpılır), sonunda tek seferde piştirilir.
"""
import bpy
import json
import math
import os
from mathutils import Vector

from ortak import (bul, izgara, resim_malzemesi, dizi_yaz, gorunurluk_yaz, yumusak, yumusak_sinir)

# eklemde ebeveynle harmanlanan parçalar ve harman bandı (parça kısa kenarının oranı)
BUKUL = {'kol-ust': 0.30, 'kol-alt': 0.32, 'el': 0.25, 'bacak-ust': 0.30, 'bacak-alt': 0.32, 'ayak': 0.18,
         'kuyruk': 0.35, 'kulak': 0.22, 'etek': 0.25, 'fular': 0.2}
# ebeveyn parçası bu çocuğa doğru da harmanlanır (aynı uzuv zinciri)
ZINCIR = {('kol-ust', 'kol-alt'), ('kol-alt', 'el'), ('bacak-ust', 'bacak-alt'), ('bacak-alt', 'ayak')}


def tur(ad):
    for k in BUKUL:
        if ad.startswith(k):
            return k
    return None


class Gorunus:
    def __init__(self, kukla, aci, kit_yolu, kol, derinlik_adim=0.0016):
        self.aci = aci
        yol = bul(kit_yolu)
        with open(yol, encoding='utf-8') as f:
            self.kit = kit = json.load(f)
        self.klasor = os.path.dirname(yol)
        P = kit['parcalar']
        m = kukla.m
        ayaklar = [P[a]['pivot'][0] for a in ('ayak-sag', 'ayak-sol') if a in P]
        self.cx = sum(ayaklar) / len(ayaklar) if ayaklar else kit['boyut'][0] / 2
        self.zemin = kit['zemin']
        self.m = m
        yuva_parca = {s for y in kit.get('yuvalar', {}).values() for s in y['secenekler']}
        self.pivot = {'kok': (self.cx, self.zemin)}
        self.ebeveyn = {'kok': None}
        kemikler = ['kok']
        for p, t in P.items():
            if p in yuva_parca:
                continue
            if p == 'kalca' or 'sinir' in t:
                kemikler.append(p)
                self.pivot[p] = tuple(kit.get('donme', {}).get(p, t['pivot']))
        self.kemikler = kemikler

        def kemigi(p):
            while p and p not in self.pivot:
                p = P[p].get('ust')
            return p or 'kok'

        for k in kemikler[1:]:
            self.ebeveyn[k] = kemigi(P[k].get('ust')) if P[k].get('ust') else 'kok'
        self.kemigi = kemigi

        # --- iskelet (tüm kemikler yukarı bakar; dönme ekran düzleminde, yerel Z ekseni)
        ad = f'{kukla.ad}-{aci}'
        arm_d = bpy.data.armatures.new(ad + '-iskelet')
        arm = bpy.data.objects.new(ad, arm_d)
        kol.objects.link(arm)
        arm.parent = kukla.kok
        arm.hide_render = True
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.mode_set(mode='EDIT')
        for k in kemikler:
            b = arm_d.edit_bones.new(k)
            x, z = self.w(self.pivot[k])
            b.head = (x, 0, z)
            b.tail = (x, 0, z + 0.04)
            b.roll = 0
        for k in kemikler[1:]:
            arm_d.edit_bones[k].parent = arm_d.edit_bones[self.ebeveyn[k]]
        bpy.ops.object.mode_set(mode='OBJECT')
        M = arm_d.bones['kok'].matrix_local.to_3x3()
        self.r_isaret = 1.0 if M.col[2].y > 0 else -1.0   # + saat yönü → euler z
        self.x_isaret = 1.0 if M.col[0].x > 0 else -1.0
        for pb in arm.pose.bones:
            pb.rotation_mode = 'XYZ'
        self.arm = arm

        # --- parçalar (arkadan öne)
        self.parca = {}
        self.yuva = {}
        for s, y in kit.get('yuvalar', {}).items():
            for sec in y['secenekler']:
                self.yuva[sec] = s
        for i, p in enumerate(kit['sira']):
            t = P.get(p)
            if not t:
                continue
            res = os.path.join(self.klasor, t['resim'])
            x0, y0, gw, gh = t['kutu']
            kb = p if p in self.pivot else kemigi(t.get('ust'))
            tr = tur(p) if p in self.pivot else None
            if tr:
                nx = max(4, min(16, round(gw / 30)))
                ny = max(4, min(18, round(gh / 30)))
            else:
                nx = ny = 2

            def kose(u, v, x0=x0, y0=y0, gw=gw, gh=gh):
                x, z = self.w((x0 + u * gw, y0 + (1 - v) * gh))
                return (x, 0.0, z)

            me = izgara(f'{ad}-{p}', nx, ny, kose)
            me.materials.append(resim_malzemesi(res))
            ob = bpy.data.objects.new(f'{ad}-{p}', me)
            kol.objects.link(ob)
            ob.parent = arm
            ob.location.y = -i * derinlik_adim
            mod = ob.modifiers.new('iskelet', 'ARMATURE')
            mod.object = arm
            agirlik = self.agirliklar(p, t, kb, tr, nx, ny)
            gruplar = {}
            for vi, wd in enumerate(agirlik):
                for kemik, a in wd.items():
                    if a <= 1e-4:
                        continue
                    if kemik not in gruplar:
                        gruplar[kemik] = ob.vertex_groups.new(name=kemik)
                    gruplar[kemik].add([vi], a, 'REPLACE')
            self.parca[p] = ob
        self.gizli = set(kit.get('gizli', []))

    def w(self, p):
        return ((p[0] - self.cx) * self.m, (self.zemin - p[1]) * self.m)

    def agirliklar(self, p, t, kb, tr, nx, ny):
        x0, y0, gw, gh = t['kutu']
        n = nx * ny
        if not tr:
            return [{kb: 1.0}] * n
        P = self.kit['parcalar']
        bant = BUKUL[tr] * min(gw, gh)
        piv = Vector(self.pivot[p])
        merkez = Vector((x0 + gw / 2, y0 + gh / 2))
        yon = (merkez - piv).normalized() if (merkez - piv).length > 1 else Vector((0, 1))
        ebe = self.ebeveyn[p]
        cocuklar = []
        for c in self.kemikler:
            if self.ebeveyn.get(c) == p and (tur(p), tur(c)) in ZINCIR:
                cm = Vector((P[c]['kutu'][0] + P[c]['kutu'][2] / 2, P[c]['kutu'][1] + P[c]['kutu'][3] / 2))
                cp = Vector(self.pivot[c])
                cocuklar.append((c, cp, (cm - cp).normalized(), BUKUL[tur(c)] * min(P[c]['kutu'][2], P[c]['kutu'][3])))
        out = []
        for j in range(ny):
            for i in range(nx):
                q = Vector((x0 + i / (nx - 1) * gw, y0 + (1 - j / (ny - 1)) * gh))
                s = (q - piv).dot(yon)
                w_e = 1 - yumusak((s + bant) / (2 * bant))
                d = {ebe: w_e}
                kalan = 1 - w_e
                for c, cp, cy, cb in cocuklar:
                    sc = (q - cp).dot(cy)
                    wc = yumusak((sc + cb) / (2 * cb)) * kalan
                    d[c] = d.get(c, 0) + wc
                    kalan -= wc
                d[p] = d.get(p, 0) + kalan
                out.append(d)
        return out


class Kukla:
    """Bir karakter: kök boş nesnesi + görünüş başına alt rig + kare başına kanallar."""

    def __init__(self, ad, gorunusler, m, kol, n, fps, konum, derinlik):
        self.ad, self.m, self.n, self.fps = ad, m, n, fps
        self.kok = bpy.data.objects.new(ad, None)
        kol.objects.link(self.kok)
        self.taban = Vector(konum)   # dünya: ayak ortası
        self.derinlik = derinlik
        self.g = {}
        for aci, yol in gorunusler.items():
            self.g[aci] = Gorunus(self, aci, yol, kol)
        self.ana = self.g.get('on') or next(iter(self.g.values()))
        self.k = {}
        self.X = [0.0] * n
        self.Z = [0.0] * n
        self.ayna = [1.0] * n
        self.aci = [next(iter(self.g))] * n
        kit = self.ana.kit
        self.secim = {s: [y['varsayilan']] * n for s, y in kit.get('yuvalar', {}).items()}
        self.zorla = {}   # yuva → kare → seçenek (olaylardan; otomatiklerden önce gelir)
        self.konusma = [0.0] * n   # kare başına konuşma genliği (ağız ve baş için)
        self.mesgul = [False] * n  # büyük hareket sırasında otomatik bakınma kısılır

    # ---- kanallar
    def kanal(self, kemik, tur_):
        key = (kemik, tur_)
        if key not in self.k:
            self.k[key] = [1.0 if tur_ in ('sx', 'sy') else 0.0] * self.n
        return self.k[key]

    def ekle(self, kemik, tur_, f, v):
        if 0 <= f < self.n:
            d = self.kanal(kemik, tur_)
            if tur_ in ('sx', 'sy'):
                d[f] *= v
            else:
                d[f] += v

    def kemik_var(self, k):
        return k in self.ana.pivot

    def sec(self, yuva, f, secenek):
        if 0 <= f < self.n and yuva in self.secim:
            self.zorla.setdefault(yuva, {})[f] = secenek

    # ---- 2B ileri kinematik (eşya tutma, takip hareketi için)
    def matris(self, kemik, f, _bel=None):
        g = self.ana
        zincir = []
        k = kemik
        while k:
            zincir.append(k)
            k = g.ebeveyn.get(k)
        M = ((1, 0, 0), (0, 1, 0))

        def carp(A, B):
            return tuple(tuple(A[i][0] * B[0][j] + A[i][1] * B[1][j] + (A[i][2] if j == 2 else 0) for j in range(3)) for i in range(2))

        for k in reversed(zincir):
            px, pz = g.w(g.pivot[k])
            r = -math.radians(self.kanal(k, 'r')[f]) if (k, 'r') in self.k else 0.0
            sx = self.k[(k, 'sx')][f] if (k, 'sx') in self.k else 1.0
            sy = self.k[(k, 'sy')][f] if (k, 'sy') in self.k else 1.0
            lx = self.k[(k, 'x')][f] if (k, 'x') in self.k else 0.0
            ly = self.k[(k, 'y')][f] if (k, 'y') in self.k else 0.0
            c, s = math.cos(r), math.sin(r)
            # T(piv+loc) R S T(-piv)
            A = ((c * sx, -s * sy, 0), (s * sx, c * sy, 0))
            t = (px + lx - (A[0][0] * px + A[0][1] * pz), pz + ly - (A[1][0] * px + A[1][1] * pz))
            L = ((A[0][0], A[0][1], t[0]), (A[1][0], A[1][1], t[1]))
            M = carp(M, L)
        return M

    def nokta(self, kemik, px, f):
        """Kit pikseli (kemiğe bağlı) → dünya (x, y, z) ve birikmiş açı (derece, + saat yönü)."""
        g = self.ana
        M = self.matris(kemik, f)
        x, z = g.w(px)
        wx = M[0][0] * x + M[0][1] * z + M[0][2]
        wz = M[1][0] * x + M[1][1] * z + M[1][2]
        aci = -math.degrees(math.atan2(M[1][0], M[0][0]))
        return Vector((self.taban.x + self.X[f] + wx * self.ayna[f], self.taban.y, self.taban.z + self.Z[f] + wz)), aci * self.ayna[f]

    # ---- pişirme
    def pisir(self):
        n = self.n
        dizi_yaz(self.kok, 'location', 0, [self.taban.x + v for v in self.X])
        dizi_yaz(self.kok, 'location', 1, [self.taban.y] * n)
        dizi_yaz(self.kok, 'location', 2, [self.taban.z + v for v in self.Z])
        dizi_yaz(self.kok, 'scale', 0, self.ayna)
        # yuva seçimleri: olay zorlaması otomatiğin üstüne
        for s, d in self.zorla.items():
            for f, v in d.items():
                self.secim[s][f] = v
        for aci, g in self.g.items():
            for (k, t), d in self.k.items():
                if k not in g.pivot:
                    continue
                pb = g.arm.pose.bones[k]
                yol = f'pose.bones["{k}"].'
                if t == 'r':
                    sinir = g.kit['parcalar'].get(k, {}).get('sinir')
                    dd = [yumusak_sinir(v, sinir[0] - 10, sinir[1] + 10) if sinir else v for v in d]
                    dizi_yaz(g.arm, yol + 'rotation_euler', 2, [math.radians(v) * g.r_isaret for v in dd])
                elif t == 'x':
                    dizi_yaz(g.arm, yol + 'location', 0, [v * g.x_isaret for v in d])
                elif t == 'y':
                    dizi_yaz(g.arm, yol + 'location', 1, d)
                elif t == 'sx':
                    dizi_yaz(g.arm, yol + 'scale', 0, d)
                elif t == 'sy':
                    dizi_yaz(g.arm, yol + 'scale', 1, d)
            for p, ob in g.parca.items():
                acik = [self.aci[f] == aci for f in range(n)]
                if p in g.yuva:
                    s = g.yuva[p]
                    gor = [acik[f] and self.secim[s][f] == p for f in range(n)]
                elif p in g.gizli:
                    gor = [False] * n
                else:
                    gor = acik
                gorunurluk_yaz(ob, gor)
