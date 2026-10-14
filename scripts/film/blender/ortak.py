"""Blender 2D cut-out hattı: ortak yardımcılar (matematik, eğri yazımı, ışıksız resim malzemesi, ızgara ağ).

Eksenler: X sağ, Z yukarı, Y derinlik (kamera -Y'de, +Y'ye bakar). Açılar derece, + = ekranda saat yönü.
"""
import bpy
import math
import os
import random
from bpy_extras import anim_utils

BURA = os.path.dirname(os.path.abspath(__file__))
KOK = os.path.abspath(os.path.join(BURA, '..', '..', '..'))
ANA = os.path.abspath(os.path.join(KOK, '..', '..', '..'))  # worktree ise ana çalışma kopyası


def bul(yol):
    """Depo yolu: önce bu kopyada, yoksa ana kopyada (Gemini çıktıları depoya girmez)."""
    if os.path.isabs(yol):
        return yol
    for k in (KOK, ANA):
        p = os.path.join(k, yol)
        if os.path.exists(p):
            return p
    return os.path.join(KOK, yol)


# ------------------------------------------------------------------ matematik
def sinirla(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x


def yumusak(t):
    t = sinirla(t)
    return t * t * t * (t * (6 * t - 15) + 10)


def gir_cik(t):
    t = sinirla(t)
    return t * t * (3 - 2 * t)


def asma(t, k=1.70158):
    """easeOutBack: hedefi aşıp geri oturur (overshoot)."""
    t = sinirla(t) - 1
    return 1 + (k + 1) * t * t * t + k * t * t


def hazirlik(t, k=1.70158):
    """easeInBack: önce ters yöne çekilir (anticipation)."""
    t = sinirla(t)
    return (k + 1) * t * t * t - k * t * t


KOLAYLIK = {'yumusak': yumusak, 'asma': asma, 'hazirlik': hazirlik, 'dogru': sinirla, 'gircik': gir_cik,
            'asma2': lambda t: asma(t, 2.6)}


def anahtar_deger(anahtarlar, t):
    """anahtarlar: [(t, v, kolaylik)] → t'deki değer (her aralık kendi kolaylığıyla)."""
    if t <= anahtarlar[0][0]:
        return anahtarlar[0][1]
    for i in range(len(anahtarlar) - 1):
        t0, v0 = anahtarlar[i][0], anahtarlar[i][1]
        t1, v1 = anahtarlar[i + 1][0], anahtarlar[i + 1][1]
        if t < t1:
            e = KOLAYLIK[anahtarlar[i + 1][2] if len(anahtarlar[i + 1]) > 2 else 'yumusak']
            return v0 + (v1 - v0) * e((t - t0) / max(1e-6, t1 - t0))
    return anahtarlar[-1][1]


def yay(hedef, fps, frekans=2.0, sonum=0.35, alt=4):
    """Kütle-yay-sönüm: hedefi gecikmeli ve taşarak izler (follow-through / overlap)."""
    w = 2 * math.pi * frekans
    dt = 1.0 / fps / alt
    x = hedef[0] if hedef else 0.0
    v = 0.0
    cik = []
    for h in hedef:
        for _ in range(alt):
            a = w * w * (h - x) - 2 * sonum * w * v
            v += a * dt
            x += v * dt
        cik.append(x)
    return cik


def turev(d, fps):
    n = len(d)
    return [((d[min(n - 1, i + 1)] - d[max(0, i - 1)]) * fps / (2 if 0 < i < n - 1 else 1)) for i in range(n)]


def duzle(d, r=2):
    n = len(d)
    return [sum(d[max(0, i - r):i + r + 1]) / len(d[max(0, i - r):i + r + 1]) for i in range(n)]


def gurultu(t, tohum, hiz=1.0):
    """Yumuşak 1B gürültü (-1..1): birkaç sinüsün toplamı, karaktere göre tohumlu."""
    r = random.Random(tohum)
    s = 0.0
    for k in range(3):
        f = (0.13 + r.random() * 0.25) * (k + 1) * hiz
        s += math.sin(2 * math.pi * f * t + r.random() * 6.28) / (k + 1)
    return s / 1.83


def yumusak_sinir(v, alt, ust):
    orta, yari = (alt + ust) / 2, (ust - alt) / 2
    x = v - orta
    k = 0.8 * yari
    if abs(x) <= k or yari <= 0:
        return v
    return orta + math.copysign(k + (yari - k) * math.tanh((abs(x) - k) / (yari - k)), x)


# ------------------------------------------------------------------ eğri yazımı (Blender 5 katmanlı eylem)
def kanal_torbasi(obj):
    ad = obj.animation_data or obj.animation_data_create()
    if ad.action is None:
        ad.action = bpy.data.actions.new(obj.name + '-hareket')
    if ad.action_slot is None:
        ad.action_slot = ad.action.slots.new(id_type=obj.id_type if hasattr(obj, 'id_type') else 'OBJECT', name=obj.name)
    return anim_utils.action_ensure_channelbag_for_slot(ad.action, ad.action_slot)


def egri_yaz(obj, yol, indeks, kareler, degerler, ara='LINEAR'):
    cb = kanal_torbasi(obj)
    fc = cb.fcurves.find(yol, index=indeks)
    if fc is None:
        fc = cb.fcurves.new(yol, index=indeks)
    kp = fc.keyframe_points
    kp.add(len(kareler))
    co = []
    for f, v in zip(kareler, degerler):
        co += [float(f), float(v)]
    kp.foreach_set('co', co)
    for k in kp:
        k.interpolation = ara
    fc.update()
    return fc


def dizi_yaz(obj, yol, indeks, dizi, esik=1e-5):
    """Kare başına değer (kare 1'den başlar); değişmeyen yerler seyreltilir. Alt kare hareket bulanıklığı için doğrusal."""
    n = len(dizi)
    kareler, degerler = [], []
    for i in range(n):
        if 0 < i < n - 1 and abs(dizi[i] - dizi[i - 1]) < esik and abs(dizi[i + 1] - dizi[i]) < esik:
            continue
        kareler.append(i + 1)
        degerler.append(dizi[i])
    egri_yaz(obj, yol, indeks, kareler, degerler, 'LINEAR')


def gorunurluk_yaz(obj, gorunur):
    """gorunur: kare başına bool. Sabit adımlı (ara geçiş yok)."""
    kareler, degerler = [], []
    onceki = None
    for i, g in enumerate(gorunur):
        if g != onceki:
            kareler.append(i + 1)
            degerler.append(0.0 if g else 1.0)
            onceki = g
    egri_yaz(obj, 'hide_render', 0, kareler, degerler, 'CONSTANT')
    egri_yaz(obj, 'hide_viewport', 0, kareler, degerler, 'CONSTANT')
    obj.hide_render = not gorunur[0]


# ------------------------------------------------------------------ malzeme ve ağ
_malz = {}


def resim_malzemesi(yol, saydam_carpan=None, kesme=None):
    """Işıksız (emission) + alfa: renkler çizimle birebir. saydam_carpan: değer düğümü (buhar solması için).
    kesme: resmin yalnız v < kesme kısmı görünür ('kesme' düğümü; bardağın dolması gibi alttan yükselen dolum)."""
    yol = os.path.abspath(yol)
    anah = (yol, saydam_carpan is not None or kesme is not None)
    if anah in _malz and saydam_carpan is None and kesme is None:
        return _malz[anah]
    img = bpy.data.images.load(yol, check_existing=True)
    img.alpha_mode = 'STRAIGHT'
    m = bpy.data.materials.new(os.path.splitext(os.path.basename(yol))[0])
    nt = m.node_tree
    nt.nodes.clear()
    cik = nt.nodes.new('ShaderNodeOutputMaterial')
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    tex.interpolation = 'Cubic'
    tex.extension = 'CLIP'
    isik = nt.nodes.new('ShaderNodeEmission')
    say = nt.nodes.new('ShaderNodeBsdfTransparent')
    kar = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(tex.outputs['Color'], isik.inputs['Color'])
    alfa = tex.outputs['Alpha']
    if saydam_carpan is not None:
        c = nt.nodes.new('ShaderNodeMath')
        c.operation = 'MULTIPLY'
        c.name = 'saydamlik'
        c.inputs[1].default_value = saydam_carpan
        nt.links.new(alfa, c.inputs[0])
        alfa = c.outputs[0]
    if kesme is not None:
        uv = nt.nodes.new('ShaderNodeTexCoord')
        ay = nt.nodes.new('ShaderNodeSeparateXYZ')
        nt.links.new(uv.outputs['UV'], ay.inputs[0])
        es = nt.nodes.new('ShaderNodeMath')
        es.operation = 'LESS_THAN'
        es.name = 'kesme'
        es.inputs[1].default_value = kesme
        nt.links.new(ay.outputs['Y'], es.inputs[0])
        c2 = nt.nodes.new('ShaderNodeMath')
        c2.operation = 'MULTIPLY'
        nt.links.new(alfa, c2.inputs[0])
        nt.links.new(es.outputs[0], c2.inputs[1])
        alfa = c2.outputs[0]
    nt.links.new(alfa, kar.inputs['Fac'])
    nt.links.new(say.outputs[0], kar.inputs[1])
    nt.links.new(isik.outputs[0], kar.inputs[2])
    nt.links.new(kar.outputs[0], cik.inputs['Surface'])
    m.surface_render_method = 'BLENDED'
    m.use_backface_culling = False
    if saydam_carpan is None and kesme is None:
        _malz[anah] = m
    return m


def izgara(ad, nx, ny, kose):
    """nx×ny köşeli düzlem; kose(u, v) → (x, y, z), u sağa, v yukarı (UV ile aynı)."""
    me = bpy.data.meshes.new(ad)
    vs, uv = [], []
    for j in range(ny):
        for i in range(nx):
            u, v = i / (nx - 1), j / (ny - 1)
            vs.append(kose(u, v))
            uv.append((u, v))
    fs = [(j * nx + i, j * nx + i + 1, (j + 1) * nx + i + 1, (j + 1) * nx + i) for j in range(ny - 1) for i in range(nx - 1)]
    me.from_pydata(vs, [], fs)
    lay = me.uv_layers.new(name='UV')
    for p in me.polygons:
        for li in p.loop_indices:
            lay.data[li].uv = uv[me.loops[li].vertex_index]
    me.update()
    return me


def resim_boyu(yol):
    img = bpy.data.images.load(os.path.abspath(yol), check_existing=True)
    return img.size[0], img.size[1]


def duzlem(ad, yol, gen, yuk, kol, nx=2, ny=2, cap=(0.5, 0.5), malz=None):
    """Resim düzlemi; cap = orijinin resimdeki yeri (0..1, sol-alt'tan)."""
    me = izgara(ad, nx, ny, lambda u, v: ((u - cap[0]) * gen, 0.0, (v - cap[1]) * yuk))
    me.materials.append(malz or resim_malzemesi(yol))
    ob = bpy.data.objects.new(ad, me)
    kol.objects.link(ob)
    return ob
