// Mino profil katman onarımı: maske (yol/çokgen/elips), kaynaktan kopyala, sil, harmonik dolgu, kontur çiz, kenar konturu, kök zarfı.
// Yol sözdizimi: "M x,y L x,y C x1,y1 x2,y2 x,y Q x1,y1 x,y Z" (mutlak); birden çok şekil ';' ile (birleşim). "e:cx,cy,rx,ry" elips.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;

public static class Profil {
  static CultureInfo C = CultureInfo.InvariantCulture;
  public static byte[] Oku(string yol, out int W, out int H) {
    using (var b0 = new Bitmap(yol)) using (var b = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) g.DrawImage(b0, 0, 0, b0.Width, b0.Height);
      W = b.Width; H = b.Height; var p = new byte[W * H * 4];
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(d.Scan0 + y * d.Stride, p, y * W * 4, W * 4); b.UnlockBits(d); return p;
    }
  }
  public static void Yaz(byte[] p, int W, int H, string yol) {
    using (var b = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(p, y * W * 4, d.Scan0 + y * d.Stride, W * 4); b.UnlockBits(d); b.Save(yol, ImageFormat.Png);
    }
  }
  static GraphicsPath Yol(string s) {
    var gp = new GraphicsPath(FillMode.Winding);
    foreach (var parca in s.Split(';')) {
      var t = parca.Trim(); if (t == "") continue;
      if (t.StartsWith("e:")) { var v = Array.ConvertAll(t.Substring(2).Split(','), x => float.Parse(x, C)); gp.StartFigure(); gp.AddEllipse(v[0] - v[2], v[1] - v[3], 2 * v[2], 2 * v[3]); gp.CloseFigure(); continue; }
      var tok = Regex.Matches(t, @"[MLCQZ]|-?\d+(\.\d+)?"); var l = new List<string>(); foreach (Match m in tok) l.Add(m.Value);
      int i = 0; PointF cur = new PointF(); char cmd = 'M'; gp.StartFigure(); bool acik = false;
      Func<float> sayi = () => float.Parse(l[i++], C);
      while (i < l.Count) {
        if (Regex.IsMatch(l[i], "^[MLCQZ]$")) { cmd = l[i][0]; i++; if (cmd == 'Z') { gp.CloseFigure(); acik = false; continue; } }
        if (cmd == 'M') { if (acik) gp.StartFigure(); cur = new PointF(sayi(), sayi()); acik = true; cmd = 'L'; }
        else if (cmd == 'L') { var n = new PointF(sayi(), sayi()); gp.AddLine(cur, n); cur = n; }
        else if (cmd == 'C') { var a = new PointF(sayi(), sayi()); var b = new PointF(sayi(), sayi()); var n = new PointF(sayi(), sayi()); gp.AddBezier(cur, a, b, n); cur = n; }
        else if (cmd == 'Q') { var q = new PointF(sayi(), sayi()); var n = new PointF(sayi(), sayi());
          gp.AddBezier(cur, new PointF(cur.X + 2f / 3 * (q.X - cur.X), cur.Y + 2f / 3 * (q.Y - cur.Y)), new PointF(n.X + 2f / 3 * (q.X - n.X), n.Y + 2f / 3 * (q.Y - n.Y)), n); cur = n; }
      }
    }
    return gp;
  }
  /// şekil maskesi (0..1), kenar yumuşatmalı; genislet>0 ise o kalınlıkta kontur ile büyütülür
  public static float[] Maske(int W, int H, string sekil, float genislet) {
    if (sekil.StartsWith("png:")) { var par = sekil.Substring(4).Split('|'); var mm = new float[W * H];
      foreach (var yol0 in par[0].Split('+')) { bool ters = yol0.StartsWith("!"); bool gevsek = yol0.StartsWith("~"); var yol = (ters || gevsek) ? yol0.Substring(1) : yol0; int W2, H2; var pp = Oku(yol, out W2, out H2); for (int i = 0; i < W * H; i++) if (ters ? pp[i * 4 + 3] == 0 : gevsek ? pp[i * 4 + 3] > 0 : pp[i * 4 + 3] == 255) mm[i] = 1f; }
      if (par.Length > 1) { var k2 = Maske(W, H, par[1], 0); for (int i = 0; i < W * H; i++) mm[i] = Math.Min(mm[i], k2[i]); }
      return mm; }
    using (var bm = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bm)) { g.Clear(Color.Transparent); g.SmoothingMode = SmoothingMode.AntiAlias; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        using (var gp = Yol(sekil)) { g.FillPath(Brushes.Black, gp); if (genislet > 0) using (var pen = new Pen(Color.Black, genislet * 2) { LineJoin = LineJoin.Round }) g.DrawPath(pen, gp); } }
      var p = new byte[W * H * 4]; var d = bm.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(d.Scan0 + y * d.Stride, p, y * W * 4, W * 4); bm.UnlockBits(d);
      var m = new float[W * H]; for (int i = 0; i < W * H; i++) m[i] = p[i * 4 + 3] / 255f; return m;
    }
  }
  static void Kaydet(string yol, byte[] p, int W, int H) { Yaz(p, W, H, yol); }
  /// hedef ← kaynak (maske içinde, maske oranında karışım; premultiplied)
  public static string Kopyala(string hedef, string kaynak, string sekil, string cikti) {
    int W, H, W2, H2; var p = Oku(hedef, out W, out H); var k = Oku(kaynak, out W2, out H2); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { float a = m[i]; if (a <= 0) continue; int o = i * 4; n++;
      float ah = p[o + 3] / 255f, ak = k[o + 3] / 255f; float A = ak * a + ah * (1 - a);
      for (int c = 0; c < 3; c++) { float v = A > 0 ? (k[o + c] * ak * a + p[o + c] * ah * (1 - a)) / A : 0; p[o + c] = (byte)Math.Round(Math.Min(255, v)); }
      p[o + 3] = (byte)Math.Round(A * 255); }
    Yaz(p, W, H, cikti); return "kopya " + n;
  }
  public static string Sil(string hedef, string sekil, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { if (m[i] <= 0) continue; int o = i * 4; p[o + 3] = (byte)Math.Round(p[o + 3] * (1 - m[i])); n++; }
    Yaz(p, W, H, cikti); return "sil " + n;
  }
  static bool Gecer(byte[] p, int o, string filtre) {
    if (p[o + 3] < 250) return false; int B = p[o], G = p[o + 1], R = p[o + 2]; int lum = (R * 3 + G * 6 + B) / 10;
    if (lum < (filtre == "maymun" ? 95 : filtre == "kus" ? 60 : 110)) return false;
    if (filtre == "kurk") return R > 190 && G > 105 && B < 110 && R - G > 35 && R - G < 115;   // turuncu kürk (+gölge), çizgi ve krem hariç
    if (filtre == "kurkkoyu") return R > 190 && G > 105 && G < 168 && B < 100 && R - G > 60 && R - G < 115;
    if (filtre == "kopek") return R > 180 && G > 110 && B > 80 && B < 140 && R - G > 40 && R - G < 95;
    if (filtre == "tavsan") return lum >= 175 && B >= R - 3 && G >= R - 16;
    if (filtre == "inek") return lum >= 95 && R > 150 && G > 150 && B > 140;   // inek: beyaz/açık gri kürk (siyah leke, pembe burun ve kontur hariç)
    if (filtre == "kus") return R < 150 && B > 150 && B > R + 50;   // kuş: mavi tüyler (koyu ve açık mavi; kontur ve ten hariç)
    if (filtre == "maymun") return R > 150 && R < 240 && G > 70 && G < 142 && B > 25 && B < 90;   // maymun kürkü (turuncu; açık yüz ve sarı karın hariç)
    if (filtre == "ayikurk") return R > 185 && R < 220 && G > 98 && G < 130 && B > 48 && B < 100;   // ayı kafa kürkü (vurgu ve kontur hariç)
    if (filtre == "ayi") return lum >= 105 && R > 150 && R - G > 45 && R - G < 110 && B < 125;   // ayı kürkü: kahve/turuncu kahve, krem karın dahil, çizgi ve beyaz hariç
    if (filtre == "turuncu") return lum >= 110 && R > 170 && R - B > 90;
    if (filtre == "ordek") return lum >= 170 && R - G <= 7 && R - B <= 10 && B - R <= 12;
    if (filtre == "krem") return R > 200 && G > 190 && B > 170;
    return true;
  }
  /// harmonik dolgu: maske içindeki pikseller, maske dışındaki filtreden geçen komşulardan Laplace ile doldurulur (alfa 255)
  public static string Doldur(string hedef, string sekil, string filtre, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, sekil, 0); int N = W * H;
    var bil = new sbyte[N]; // 1 bilinmeyen, 2 bilinen sınır
    int x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (int i = 0; i < N; i++) if (m[i] >= 0.5f) { bil[i] = 1; int x = i % W, y = i / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    var v = new float[N * 3]; var q = new Queue<int>(); int nb = 0;
    // başlangıç: en yakın bilinen pikselin rengi (BFS)
    var dol = new bool[N];
    for (int i = 0; i < N; i++) { if (bil[i] != 0) continue; if (!Gecer(p, i * 4, filtre)) continue; int x = i % W, y = i / W; if (x < x0 - 1 || x > x1 + 1 || y < y0 - 1 || y > y1 + 1) continue;
      bool kom = false; foreach (int t in new[] { i - 1, i + 1, i - W, i + W }) if (t >= 0 && t < N && bil[t] == 1) kom = true;
      if (!kom) continue; bil[i] = 2; nb++; for (int c = 0; c < 3; c++) v[i * 3 + c] = p[i * 4 + c]; dol[i] = true; q.Enqueue(i); }
    if (nb == 0) return "sinir yok";
    while (q.Count > 0) { int j = q.Dequeue(); foreach (int t in new[] { j - 1, j + 1, j - W, j + W }) { if (t < 0 || t >= N || bil[t] != 1 || dol[t]) continue; dol[t] = true; for (int c = 0; c < 3; c++) v[t * 3 + c] = v[j * 3 + c]; q.Enqueue(t); } }
    var liste = new List<int>(); for (int i = 0; i < N; i++) if (bil[i] == 1 && dol[i]) liste.Add(i);
    for (int it = 0; it < 600; it++) { double deg = 0;
      foreach (int i in liste) { double[] s = new double[3]; int n = 0;
        foreach (int t in new[] { i - 1, i + 1, i - W, i + W }) { if (bil[t] == 0) continue; n++; for (int c = 0; c < 3; c++) s[c] += v[t * 3 + c]; }
        if (n == 0) continue; for (int c = 0; c < 3; c++) { double y = v[i * 3 + c] + 1.9 * (s[c] / n - v[i * 3 + c]); deg = Math.Max(deg, Math.Abs(y - v[i * 3 + c])); v[i * 3 + c] = (float)y; } }
      if (deg < 0.05) break; }
    foreach (int i in liste) { int o = i * 4; float a = m[i]; float ah = p[o + 3] / 255f;
      for (int c = 0; c < 3; c++) { float y = ah > 0 ? v[i * 3 + c] * a + p[o + c] * (1 - a) : v[i * 3 + c]; p[o + c] = (byte)Math.Round(Math.Max(0, Math.Min(255, y))); }
      p[o + 3] = (byte)Math.Round(255 * Math.Max(a, ah)); }
    Yaz(p, W, H, cikti); return "doldur " + liste.Count + " (sinir " + nb + ")";
  }
  /// düz renkle boya (maske oranında, üstüne)
  public static string Boya(string hedef, string sekil, string renk, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, sekil, 0); var r = ColorTranslator.FromHtml(renk); int n = 0;
    for (int i = 0; i < W * H; i++) { float a = m[i]; if (a <= 0) continue; int o = i * 4; n++; float ah = p[o + 3] / 255f, A = a + ah * (1 - a);
      p[o + 2] = (byte)Math.Round((r.R * a + p[o + 2] * ah * (1 - a)) / A); p[o + 1] = (byte)Math.Round((r.G * a + p[o + 1] * ah * (1 - a)) / A); p[o] = (byte)Math.Round((r.B * a + p[o] * ah * (1 - a)) / A); p[o + 3] = (byte)Math.Round(A * 255); }
    Yaz(p, W, H, cikti); return "boya " + n;
  }
  /// açık yol boyunca kontur çiz (yuvarlak uç), üstüne
  public static string Cizgi(string hedef, string yol, float kalinlik, string renk, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var r = ColorTranslator.FromHtml(renk); float[] m;
    using (var bm = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(bm)) { g.Clear(Color.Transparent); g.SmoothingMode = SmoothingMode.AntiAlias; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        using (var gp = Yol(yol)) using (var pen = new Pen(Color.Black, kalinlik) { StartCap = LineCap.Round, EndCap = LineCap.Round, LineJoin = LineJoin.Round }) g.DrawPath(pen, gp); }
      var q = new byte[W * H * 4]; var d = bm.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(d.Scan0 + y * d.Stride, q, y * W * 4, W * 4); bm.UnlockBits(d);
      m = new float[W * H]; for (int i = 0; i < W * H; i++) m[i] = q[i * 4 + 3] / 255f; }
    int n = 0;
    for (int i = 0; i < W * H; i++) { float a = m[i]; if (a <= 0) continue; int o = i * 4; n++; float ah = p[o + 3] / 255f, A = a + ah * (1 - a);
      p[o + 2] = (byte)Math.Round((r.R * a + p[o + 2] * ah * (1 - a)) / A); p[o + 1] = (byte)Math.Round((r.G * a + p[o + 1] * ah * (1 - a)) / A); p[o] = (byte)Math.Round((r.B * a + p[o] * ah * (1 - a)) / A); p[o + 3] = (byte)Math.Round(A * 255); }
    Yaz(p, W, H, cikti); return "cizgi " + n;
  }
  /// katmanın dış kenarı boyunca (yalnız bolge içinde) içe doğru w kalınlığında kontur bandı
  public static string KenarKontur(string hedef, string bolge, float w, string renk, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, bolge, 0); var r = ColorTranslator.FromHtml(renk); int N = W * H;
    // dışarı uzaklığı (8-komşu, yaklaşık öklid: 1 / 1.414), eşik alfa 128
    var d = new float[N]; for (int i = 0; i < N; i++) d[i] = p[i * 4 + 3] >= 128 ? 1e9f : 0;
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) { int i = y * W + x; if (d[i] == 0) continue;
      d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i - 1] + 1, d[i - W] + 1), Math.Min(d[i - W - 1] + 1.414f, d[i - W + 1] + 1.414f))); }
    for (int y = H - 2; y >= 1; y--) for (int x = W - 2; x >= 1; x--) { int i = y * W + x; if (d[i] == 0) continue;
      d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i + 1] + 1, d[i + W] + 1), Math.Min(d[i + W + 1] + 1.414f, d[i + W - 1] + 1.414f))); }
    int n = 0;
    for (int i = 0; i < N; i++) { if (m[i] <= 0 || p[i * 4 + 3] == 0) continue; float a = Math.Max(0, Math.Min(1, w + 0.5f - (d[i] - 0.5f))) * m[i]; if (a <= 0) continue; int o = i * 4; n++;
      p[o + 2] = (byte)Math.Round(r.R * a + p[o + 2] * (1 - a)); p[o + 1] = (byte)Math.Round(r.G * a + p[o + 1] * (1 - a)); p[o] = (byte)Math.Round(r.B * a + p[o] * (1 - a)); }
    Yaz(p, W, H, cikti); return "kenar " + n;
  }
  /// disk (merkez, r) ile noktaların dışbükey zarfı → yol dizgesi "M..L..Z"
  public static string Zarf(float cx, float cy, float r, string noktalar) {
    var pts = new List<PointF>(); for (int k = 0; k < 96; k++) { double a = k * Math.PI * 2 / 96; pts.Add(new PointF((float)(cx + r * Math.Cos(a)), (float)(cy + r * Math.Sin(a)))); }
    foreach (var t in noktalar.Split(' ')) { if (t == "") continue; var v = t.Split(','); pts.Add(new PointF(float.Parse(v[0], C), float.Parse(v[1], C))); }
    pts.Sort((a, b) => a.X != b.X ? a.X.CompareTo(b.X) : a.Y.CompareTo(b.Y));
    Func<PointF, PointF, PointF, double> cr = (o, a, b) => (a.X - o.X) * (double)(b.Y - o.Y) - (a.Y - o.Y) * (double)(b.X - o.X);
    var h = new List<PointF>();
    foreach (var pt in pts) { while (h.Count >= 2 && cr(h[h.Count - 2], h[h.Count - 1], pt) <= 0) h.RemoveAt(h.Count - 1); h.Add(pt); }
    int alt = h.Count + 1;
    for (int i = pts.Count - 2; i >= 0; i--) { var pt = pts[i]; while (h.Count >= alt && cr(h[h.Count - 2], h[h.Count - 1], pt) <= 0) h.RemoveAt(h.Count - 1); h.Add(pt); }
    h.RemoveAt(h.Count - 1);
    var sb = new System.Text.StringBuilder(); for (int i = 0; i < h.Count; i++) sb.AppendFormat(C, "{0}{1:F1},{2:F1} ", i == 0 ? "M" : "L", h[i].X, h[i].Y); sb.Append("Z"); return sb.ToString();
  }
/// kalça kökü: bacak ∪ zarf tek silüet (bölge içinde yumuşatılır), içeride kalan eski kontur ve boşluklar harmonik kürkle dolar,
  /// kontur bandı (w) yeni silüet boyunca tek parça çizilir. bolge dışı değişmez.
  public static string Kok(string hedef, string zarf, string bolge, float w, string renk, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); int N = W * H; var z = Maske(W, H, zarf, 0); var b = Maske(W, H, bolge, 0); var r = ColorTranslator.FromHtml(renk);
    var U = new float[N]; for (int i = 0; i < N; i++) U[i] = Math.Max(p[i * 4 + 3] / 255f, z[i]);
    // bölgede yumuşatma: 2 geçişli kutu bulanıklığı (r=3) → eşik etrafında dik geçiş
    var T = (float[])U.Clone(); int R = 3;
    for (int gec = 0; gec < 2; gec++) { var A = new float[N];
      for (int y = 0; y < H; y++) { float s = 0; for (int x = -R; x <= R; x++) s += T[y * W + Math.Max(0, Math.Min(W - 1, x))];
        for (int x = 0; x < W; x++) { A[y * W + x] = s / (2 * R + 1); int xa = Math.Max(0, x - R), xb = Math.Min(W - 1, x + R + 1); s += T[y * W + xb] - T[y * W + xa]; } }
      for (int x = 0; x < W; x++) { float s = 0; for (int y = -R; y <= R; y++) s += A[Math.Max(0, Math.Min(H - 1, y)) * W + x];
        for (int y = 0; y < H; y++) { T[y * W + x] = s / (2 * R + 1); int ya = Math.Max(0, y - R), yb = Math.Min(H - 1, y + R + 1); s += A[yb * W + x] - A[ya * W + x]; } } }
    var Y = new float[N]; for (int i = 0; i < N; i++) { float sm = Math.Max(0, Math.Min(1, (T[i] - 0.5f) * 5f + 0.5f)); Y[i] = b[i] * sm + (1 - b[i]) * U[i]; }
    // dışarı uzaklığı (Y>=0.5 içeride)
    var d = new float[N]; for (int i = 0; i < N; i++) d[i] = Y[i] >= 0.5f ? 1e9f : 0;
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i - 1] + 1, d[i - W] + 1), Math.Min(d[i - W - 1] + 1.414f, d[i - W + 1] + 1.414f))); }
    for (int y = H - 2; y >= 1; y--) for (int x = W - 2; x >= 1; x--) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i + 1] + 1, d[i + W] + 1), Math.Min(d[i + W + 1] + 1.414f, d[i + W - 1] + 1.414f))); }
    // bilinmeyen: bölgede, bant dışında (d > w-3) ve (bacak pikseli değil ya da koyu kontur kalıntısı)
    var bil = new sbyte[N]; int nu = 0;
    for (int i = 0; i < N; i++) { if (b[i] < 0.5f || Y[i] < 0.5f || d[i] <= w - 3) continue; int o = i * 4; int lum = (p[o + 2] * 3 + p[o + 1] * 6 + p[o]) / 10;
      if (p[o + 3] < 250 || lum < 120) { bil[i] = 1; nu++; } }
    var v = new float[N * 3]; var q = new Queue<int>(); var dol = new bool[N];
    for (int i = W; i < N - W; i++) { if (bil[i] != 0) continue; int o = i * 4; if (p[o + 3] < 250) continue; int lum = (p[o + 2] * 3 + p[o + 1] * 6 + p[o]) / 10; if (lum < 120) continue;
      bool kom = bil[i - 1] == 1 || bil[i + 1] == 1 || bil[i - W] == 1 || bil[i + W] == 1; if (!kom) continue; bil[i] = 2; dol[i] = true; for (int c = 0; c < 3; c++) v[i * 3 + c] = p[o + c]; q.Enqueue(i); }
    while (q.Count > 0) { int j = q.Dequeue(); foreach (int t in new[] { j - 1, j + 1, j - W, j + W }) { if (bil[t] != 1 || dol[t]) continue; dol[t] = true; for (int c = 0; c < 3; c++) v[t * 3 + c] = v[j * 3 + c]; q.Enqueue(t); } }
    var liste = new List<int>(); for (int i = 0; i < N; i++) if (bil[i] == 1 && dol[i]) liste.Add(i);
    for (int it = 0; it < 500; it++) { double deg = 0;
      foreach (int i in liste) { double s0 = 0, s1 = 0, s2 = 0; int n = 0; foreach (int t in new[] { i - 1, i + 1, i - W, i + W }) { if (bil[t] == 0 || !dol[t]) continue; n++; s0 += v[t * 3]; s1 += v[t * 3 + 1]; s2 += v[t * 3 + 2]; }
        if (n == 0) continue; double[] s = { s0 / n, s1 / n, s2 / n }; for (int c = 0; c < 3; c++) { double yv = v[i * 3 + c] + 1.9 * (s[c] - v[i * 3 + c]); deg = Math.Max(deg, Math.Abs(yv - v[i * 3 + c])); v[i * 3 + c] = (float)yv; } }
      if (deg < 0.05) break; }
    foreach (int i in liste) { int o = i * 4; for (int c = 0; c < 3; c++) p[o + c] = (byte)Math.Round(Math.Max(0, Math.Min(255, v[i * 3 + c]))); p[o + 3] = 255; }
    // bölgede: alfa = yumuşak silüet, kontur bandı
    int nk = 0;
    for (int i = 0; i < N; i++) { if (b[i] <= 0) continue; int o = i * 4; float a0 = Y[i]; if (a0 <= 0) { p[o + 3] = (byte)Math.Round(p[o + 3] * (1 - b[i])); continue; }
      float ka = Math.Max(0, Math.Min(1, w + 0.5f - (d[i] - 0.5f))) * b[i];
      if (p[o + 3] < 250 && ka <= 0) { /* yumuşak kenar: rengi en yakın iç renkten al (zaten dolgu) */ }
      if (ka > 0) { nk++; p[o + 2] = (byte)Math.Round(r.R * ka + p[o + 2] * (1 - ka)); p[o + 1] = (byte)Math.Round(r.G * ka + p[o + 1] * (1 - ka)); p[o] = (byte)Math.Round(r.B * ka + p[o] * (1 - ka)); }
      else if (p[o + 3] < 250) { p[o + 2] = (byte)r.R; p[o + 1] = (byte)r.G; p[o] = (byte)r.B; }
      p[o + 3] = (byte)Math.Round(255 * (b[i] * a0 + (1 - b[i]) * p[o + 3] / 255f)); }
    Yaz(p, W, H, cikti); return string.Format("kok: doldur {0}, kontur {1}", liste.Count, nk);
  }
/// şekil içinde yalnız süzgeçten geçen (ör. turuncu kürk) pikselleri siler; yarı karışık kenarlar oranla saydamlaşır
  public static string SilRenk(string hedef, string sekil, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { if (m[i] <= 0) continue; int o = i * 4; int B = p[o], G = p[o + 1], R = p[o + 2];
      bool tur = R > 150 && G > 70 && B < 110 && R - G > 30 && G - B > 30; if (!tur) continue;
      p[o + 3] = (byte)Math.Round(p[o + 3] * (1 - m[i])); n++; }
    Yaz(p, W, H, cikti); return "silrenk " + n;
  }
/// Ön katmanın (on) keskin alt kenarının altındaki geçiş (yumuşatma) pikselleri arka katmandan ön katmana yarı saydam çizgi olarak devredilir:
  /// O = a·L + (1−a)·S (S = aşağıdaki temiz arka renk). Ön: L rengi, a alfa; arka: S. Dinlenme bileşimi ≈ özgün; arka dönünce hayalet kenar kalmaz.
  public static string KenarDevret(string arkaYol, string onYol, string bolge, int bant, string renk) {
    int W, H, W2, H2; var p = Oku(arkaYol, out W, out H); var q = Oku(onYol, out W2, out H2); var m = Maske(W, H, bolge, 0); var L = ColorTranslator.FromHtml(renk); int N = W * H;
    var d = new int[N]; var kq = new Queue<int>(); for (int i = 0; i < N; i++) { d[i] = q[i * 4 + 3] >= 250 ? 0 : int.MaxValue; if (d[i] == 0) kq.Enqueue(i); }
    while (kq.Count > 0) { int j = kq.Dequeue(); if (d[j] >= bant + 3) continue; int x = j % W; int[] kom = { x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, j >= W ? j - W : -1, j < N - W ? j + W : -1 };
      foreach (int u in kom) if (u >= 0 && d[u] == int.MaxValue) { d[u] = d[j] + 1; kq.Enqueue(u); } }
    int n = 0; double[] Lc = { L.B, L.G, L.R };
    var yeniP = (byte[])p.Clone(); var yeniQ = (byte[])q.Clone();
    for (int i = 0; i < N; i++) { if (m[i] < 0.5f || d[i] < 1 || d[i] > bant || p[i * 4 + 3] < 250 || q[i * 4 + 3] > 0) continue;
      int x = i % W, y = i / W; int s = -1; for (int yy = y + 1; yy < Math.Min(H, y + bant + 8); yy++) { int t2 = yy * W + x; if (d[t2] > bant && p[t2 * 4 + 3] >= 250) { s = t2; break; } }
      if (s < 0) continue; double[] O = new double[3], S = new double[3]; for (int c = 0; c < 3; c++) { O[c] = p[i * 4 + c]; S[c] = p[s * 4 + c]; }
      double num = 0, den = 0; for (int c = 0; c < 3; c++) { num += (O[c] - S[c]) * (Lc[c] - S[c]); den += (Lc[c] - S[c]) * (Lc[c] - S[c]); }
      double a = den > 0 ? Math.Max(0, Math.Min(1, num / den)) : 0;
      for (int c = 0; c < 3; c++) yeniP[i * 4 + c] = (byte)S[c];
      if (a >= 0.06) { for (int c = 0; c < 3; c++) yeniQ[i * 4 + c] = (byte)Lc[c]; yeniQ[i * 4 + 3] = (byte)Math.Round(a * 255); }
      n++; }
    Yaz(yeniP, W, H, arkaYol); Yaz(yeniQ, W, H, onYol); return "devret " + n;
  }
/// katman görselini (cx,cy) etrafında 'aci' derece (saat yönü +) döndürüp yerine yazar (bikübik, önçarpımlı alfa)
  public static string Dondur(string yol, float cx, float cy, float aci) {
    using (var b0 = new Bitmap(yol)) using (var src = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppPArgb)) {
      using (var g0 = Graphics.FromImage(src)) g0.DrawImage(b0, 0, 0, b0.Width, b0.Height);
      using (var dst = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppPArgb)) {
        using (var g = Graphics.FromImage(dst)) { g.Clear(Color.Transparent); g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.PixelOffsetMode = PixelOffsetMode.HighQuality; g.SmoothingMode = SmoothingMode.AntiAlias;
          g.TranslateTransform(cx, cy); g.RotateTransform(aci); g.TranslateTransform(-cx, -cy); g.DrawImage(src, 0, 0, src.Width, src.Height); }
        using (var o = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppArgb)) { using (var g2 = Graphics.FromImage(o)) { g2.CompositingMode = CompositingMode.SourceCopy; g2.DrawImage(dst, 0, 0, dst.Width, dst.Height); }
          b0.Dispose(); o.Save(yol, ImageFormat.Png); } } }
    return "dondur " + aci;
  }
/// şekil içinde hedefin ALTINA kaynağı koyar (hedef OVER kaynak): hedefin yarı saydam/boş kenarları kaynaktaki çizgiyle dolar.
  /// Dinlenmede kaynak hedefin altındaysa bileşim değişmez.
  public static string AltinaKopyala(string hedef, string kaynak, string sekil, string cikti) {
    int W, H, W2, H2; var p = Oku(hedef, out W, out H); var k = Oku(kaynak, out W2, out H2); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { float a = m[i]; if (a <= 0) continue; int o = i * 4; float ah = p[o + 3] / 255f, ak = k[o + 3] / 255f * a; if (ak <= 0 || ah >= 1) continue;
      float A = ah + ak * (1 - ah); for (int c = 0; c < 3; c++) p[o + c] = (byte)Math.Round((p[o + c] * ah + k[o + c] * ak * (1 - ah)) / A); p[o + 3] = (byte)Math.Round(A * 255); n++; }
    Yaz(p, W, H, cikti); return "altina " + n;
  }
/// şekil içinde kaynağı hedefin ÜSTÜNE koyar (kaynak OVER hedef)
  public static string Ustune(string hedef, string kaynak, string sekil, string cikti) {
    int W, H, W2, H2; var p = Oku(hedef, out W, out H); var k = Oku(kaynak, out W2, out H2); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { float a = m[i]; if (a <= 0) continue; int o = i * 4; float ak = k[o + 3] / 255f * a, ah = p[o + 3] / 255f; if (ak <= 0) continue;
      float A = ak + ah * (1 - ak); for (int c = 0; c < 3; c++) p[o + c] = (byte)Math.Round((k[o + c] * ak + p[o + c] * ah * (1 - ak)) / A); p[o + 3] = (byte)Math.Round(A * 255); n++; }
    Yaz(p, W, H, cikti); return "ustune " + n;
  }
/// şekil içinde süzgeçten geçen pikselleri kaynak katmandan hedef katmana taşır (hedefin üstüne yazılır, kaynaktan silinir). süzgeç "sac": kahve saç tonları
  public static string Tasi(string kaynak, string hedef, string sekil, string suzgec) {
    int W, H, W2, H2; var k = Oku(kaynak, out W, out H); var h = Oku(hedef, out W2, out H2); var m = Maske(W, H, sekil, 0); int n = 0;
    for (int i = 0; i < W * H; i++) { if (m[i] < 0.5f) continue; int o = i * 4; if (k[o + 3] == 0) continue; int B = k[o], G = k[o + 1], R = k[o + 2]; int lum = (R * 3 + G * 6 + B) / 10;
      bool ok = suzgec == "sac" ? (lum >= 40 && lum < 150 && R > G && G >= B - 6 && R - B > 20 && R < 200) : suzgec == "mavi" ? (B > R + 40 && B > 120) : suzgec == "koyu" ? (lum < 150 || B > R + 30) : suzgec == "kontur" ? (lum < 95) : suzgec == "aa" ? (R - G >= 12 || lum < 215) : suzgec == "acik" ? (lum >= 150 && R - G < 20) : suzgec == "kontursuz" ? (lum >= 95) : suzgec == "acik2" ? (lum >= 218 && R - G < 12) : suzgec == "golge" ? (lum >= 150 && lum < 222) : true; if (!ok) continue;
      float ak = k[o + 3] / 255f, ah = h[o + 3] / 255f, A = ak + ah * (1 - ak);
      for (int c = 0; c < 3; c++) h[o + c] = (byte)Math.Round((k[o + c] * ak + h[o + c] * ah * (1 - ak)) / A); h[o + 3] = (byte)Math.Round(A * 255); k[o + 3] = 0; n++; }
    Yaz(k, W, H, kaynak); Yaz(h, W, H, hedef); return "tasi " + n;
  }
/// bölgedeki gölge tonlu kürk pikselleri (lum 95..150, sıcak kahve) harmonik olarak çevredeki açık kürkle (kopek süzgeci) doldurulur
  public static string GolgeDoldur(string hedef, string bolge, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var m = Maske(W, H, bolge, 0); int N = W * H;
    var bil = new sbyte[N]; int nu = 0;
    for (int i = 0; i < N; i++) { if (m[i] < 0.5f) continue; int o = i * 4; if (p[o + 3] < 250) continue; int B = p[o], G = p[o + 1], R = p[o + 2]; int lum = (R * 3 + G * 6 + B) / 10;
      if (lum >= 95 && lum < 150 && R > G && G > B && R - G >= 30 && R - G <= 95) { bil[i] = 1; nu++; } }
    var v = new float[N * 3]; var q = new Queue<int>(); var dol = new bool[N];
    for (int i = W; i < N - W; i++) { if (bil[i] != 0 || !Gecer(p, i * 4, "kopek")) continue;
      if (bil[i - 1] == 1 || bil[i + 1] == 1 || bil[i - W] == 1 || bil[i + W] == 1) { bil[i] = 2; dol[i] = true; for (int c = 0; c < 3; c++) v[i * 3 + c] = p[i * 4 + c]; q.Enqueue(i); } }
    while (q.Count > 0) { int j = q.Dequeue(); foreach (int u in new[] { j - 1, j + 1, j - W, j + W }) { if (u < 0 || u >= N || bil[u] != 1 || dol[u]) continue; dol[u] = true; for (int c = 0; c < 3; c++) v[u * 3 + c] = v[j * 3 + c]; q.Enqueue(u); } }
    var liste = new List<int>(); for (int i = 0; i < N; i++) if (bil[i] == 1 && dol[i]) liste.Add(i);
    for (int it = 0; it < 500; it++) { double deg = 0;
      foreach (int i in liste) { double s0 = 0, s1 = 0, s2 = 0; int n = 0; foreach (int u in new[] { i - 1, i + 1, i - W, i + W }) { if (bil[u] == 0 || !dol[u]) continue; n++; s0 += v[u * 3]; s1 += v[u * 3 + 1]; s2 += v[u * 3 + 2]; }
        if (n == 0) continue; double[] sv = { s0 / n, s1 / n, s2 / n }; for (int c = 0; c < 3; c++) { double y = v[i * 3 + c] + 1.9 * (sv[c] - v[i * 3 + c]); deg = Math.Max(deg, Math.Abs(y - v[i * 3 + c])); v[i * 3 + c] = (float)y; } }
      if (deg < 0.05) break; }
    foreach (int i in liste) for (int c = 0; c < 3; c++) p[i * 4 + c] = (byte)Math.Round(Math.Max(0, Math.Min(255, v[i * 3 + c])));
    Yaz(p, W, H, cikti); return "golge " + liste.Count + "/" + nu;
  }
/// hedefin opak kenarına en çok 'uzak' px mesafedeki kaynak koyu pikselleri (lum < esik) hedefe, yalnız hedefin saydam yerine (altına) kopyalar (bolge içinde)
  public static string KenarAl(string hedef, string kaynak, string bolge, float uzak, int esik, string cikti) {
    int W, H, W2, H2; var p = Oku(hedef, out W, out H); var k = Oku(kaynak, out W2, out H2); var m = Maske(W, H, bolge, 0); int N = W * H;
    var d = new float[N]; for (int i = 0; i < N; i++) d[i] = p[i * 4 + 3] >= 128 ? 0 : 1e9f;
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i - 1] + 1, d[i - W] + 1), Math.Min(d[i - W - 1] + 1.414f, d[i - W + 1] + 1.414f))); }
    for (int y = H - 2; y >= 1; y--) for (int x = W - 2; x >= 1; x--) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i + 1] + 1, d[i + W] + 1), Math.Min(d[i + W + 1] + 1.414f, d[i + W - 1] + 1.414f))); }
    int n = 0;
    for (int i = 0; i < N; i++) { if (m[i] < 0.5f || d[i] == 0 || d[i] > uzak) continue; int o = i * 4; if (k[o + 3] < 128) continue; int lum = (k[o + 2] * 3 + k[o + 1] * 6 + k[o]) / 10; if (lum >= esik) continue;
      float ah = p[o + 3] / 255f, ak = k[o + 3] / 255f, A = ah + ak * (1 - ah); for (int c = 0; c < 3; c++) p[o + c] = (byte)Math.Round((p[o + c] * ah + k[o + c] * ak * (1 - ah)) / A); p[o + 3] = (byte)Math.Round(A * 255); n++; }
    Yaz(p, W, H, cikti); return "kenaral " + n;
  }
/// kaynaktaki (ör. gövde) piksellerden hedefin (ör. kanat) opak kenarına en çok 'uzak' px mesafede olup süzgeçten geçenleri hedefe taşır (kenar yumuşatma artıkları)
  public static string KenarTasi(string kaynak, string hedef, string bolge, float uzak, string suzgec) {
    int W, H, W2, H2; var k = Oku(kaynak, out W, out H); var h = Oku(hedef, out W2, out H2); var m = Maske(W, H, bolge, 0); int N = W * H;
    var d = new float[N]; for (int i = 0; i < N; i++) d[i] = h[i * 4 + 3] >= 128 ? 0 : 1e9f;
    for (int y = 1; y < H - 1; y++) for (int x = 1; x < W - 1; x++) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i - 1] + 1, d[i - W] + 1), Math.Min(d[i - W - 1] + 1.414f, d[i - W + 1] + 1.414f))); }
    for (int y = H - 2; y >= 1; y--) for (int x = W - 2; x >= 1; x--) { int i = y * W + x; if (d[i] == 0) continue; d[i] = Math.Min(d[i], Math.Min(Math.Min(d[i + 1] + 1, d[i + W] + 1), Math.Min(d[i + W + 1] + 1.414f, d[i + W - 1] + 1.414f))); }
    int n = 0;
    for (int i = 0; i < N; i++) { if (m[i] < 0.5f || d[i] == 0 || d[i] > uzak) continue; int o = i * 4; if (k[o + 3] == 0) continue; int B = k[o], G = k[o + 1], R = k[o + 2]; int lum = (R * 3 + G * 6 + B) / 10;
      bool ok = suzgec == "aa" ? (lum < 225 && (R - B >= 10 || lum < 200)) : suzgec == "koyu" ? lum < 200 : suzgec == "golge" ? (lum >= 150 && lum < 226) : true; if (!ok) continue;
      float ak = k[o + 3] / 255f, ah = h[o + 3] / 255f, A = ak + ah * (1 - ak); for (int c = 0; c < 3; c++) h[o + c] = (byte)Math.Round((k[o + c] * ak + h[o + c] * ah * (1 - ak)) / A); h[o + 3] = (byte)Math.Round(A * 255); k[o + 3] = 0; n++; }
    Yaz(k, W, H, kaynak); Yaz(h, W, H, hedef); return "kenartasi " + n;
  }
/// üst kenarı yumuşak geçişli yapar: noktalar (soldan sağa üst sınır çizgisi) altında 'gen' px boyunca alfa 0→1 (smoothstep).
  /// Çizginin üstündeki pikseller silinir. Önde duran parçanın üst ucu arkadaki gövdeye dikişsiz karışsın diye.
  public static string Solgun(string hedef, string noktalar, float gen, string cikti) {
    int W, H; var p = Oku(hedef, out W, out H); var pts = new List<PointF>();
    foreach (var s in noktalar.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries)) { var v = s.Split(','); pts.Add(new PointF(float.Parse(v[0], C), float.Parse(v[1], C))); }
    int n = 0;
    for (int x = (int)pts[0].X; x <= (int)pts[pts.Count - 1].X; x++) {
      float yt = pts[0].Y; for (int k = 0; k < pts.Count - 1; k++) if (x >= pts[k].X && x <= pts[k + 1].X) { float u = (x - pts[k].X) / Math.Max(1, pts[k + 1].X - pts[k].X); yt = pts[k].Y + u * (pts[k + 1].Y - pts[k].Y); break; }
      for (int y = 0; y < H && y < yt + gen; y++) { int o = (y * W + x) * 4; if (p[o + 3] == 0) continue; float a;
        if (y < yt) a = 0; else { float s = (y - yt) / gen; a = s * s * (3 - 2 * s); }
        p[o + 3] = (byte)Math.Round(p[o + 3] * a); n++; } }
    Yaz(p, W, H, cikti); return "solgun " + n;
  }
}