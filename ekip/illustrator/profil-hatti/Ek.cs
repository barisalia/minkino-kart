// Başka bir çizimden (ör. üzgün yüz) alınan katmanları birleştirir, kaydırır ve kenarını yumuşatır.
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Ek {
  static byte[] Oku(string yol, out int W, out int H) {
    using (var b0 = new Bitmap(yol)) using (var b = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) { g.DrawImage(b0, 0, 0, b0.Width, b0.Height); }
      W = b.Width; H = b.Height; var p = new byte[W * H * 4];
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(d.Scan0 + y * d.Stride, p, y * W * 4, W * 4);
      b.UnlockBits(d); return p;
    }
  }
  static void Yaz(byte[] p, int W, int H, string yol) {
    using (var b = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(p, y * W * 4, d.Scan0 + y * d.Stride, W * 4);
      b.UnlockBits(d); b.Save(yol, ImageFormat.Png);
    }
  }
  /// girdiler: ';' ile ayrılmış PNG yolları (üst üste konur), dx/dy tam sayı kaydırma, tuy: kenar yumuşatma bandı (px, 0 = yok)
  public static string Birlestir(string girdiler, string cikti, int dx, int dy, int tuy) {
    int W = 0, H = 0; byte[] o = null;
    foreach (var yol in girdiler.Split(';')) {
      int w, h; var p = Oku(yol, out w, out h); if (o == null) { W = w; H = h; o = new byte[W * H * 4]; }
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        int sx = x - dx, sy = y - dy; if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
        int i = (y * W + x) * 4, s = (sy * W + sx) * 4; if (p[s + 3] == 0) continue;
        float a = p[s + 3] / 255f, oa = o[i + 3] / 255f, na = a + oa * (1 - a);
        for (int c = 0; c < 3; c++) o[i + c] = (byte)Math.Round((p[s + c] * a + o[i + c] * oa * (1 - a)) / Math.Max(na, 1e-4f));
        o[i + 3] = (byte)Math.Round(na * 255);
      }
    }
    if (tuy > 0) {
      // saydam alana uzaklık (tuy'a kadar), alfa ile çarpılır
      var d = new int[W * H]; var q = new int[W * H]; int bas = 0, son = 0;
      for (int i = 0; i < W * H; i++) { d[i] = -1; if (o[i * 4 + 3] == 0) continue; int x = i % W;
        bool kenar = x == 0 || x == W - 1 || i < W || i >= W * H - W || o[(i - 1) * 4 + 3] == 0 || o[(i + 1) * 4 + 3] == 0 || o[(i - W) * 4 + 3] == 0 || o[(i + W) * 4 + 3] == 0;
        if (kenar) { d[i] = 1; q[son++] = i; } }
      while (bas < son) { int j = q[bas++]; if (d[j] >= tuy) continue; int x = j % W;
        int[] kom = { x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, j >= W ? j - W : -1, j < W * H - W ? j + W : -1 };
        foreach (int t in kom) if (t >= 0 && d[t] < 0 && o[t * 4 + 3] > 0) { d[t] = d[j] + 1; q[son++] = t; } }
      for (int i = 0; i < W * H; i++) if (d[i] > 0) { float t = d[i] / (float)tuy; t = t * t * (3 - 2 * t); o[i * 4 + 3] = (byte)Math.Round(o[i * 4 + 3] * t); }
    }
    Yaz(o, W, H, cikti);
    return cikti;
  }
}
