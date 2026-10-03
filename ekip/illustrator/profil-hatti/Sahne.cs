// Ä°skelet katmanlarÄ±nÄ± dÃ¶nÃ¼ÅŸÃ¼mlerle Ã§izer (hareket testi) ve katman kÄ±rpÄ±mlarÄ± Ã§Ä±karÄ±r.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class Sahne {
  /// sira: arkadan Ã¶ne katman adlarÄ±; gizli: gÃ¶sterilmeyecekler; aci: "ad=derece;..."; pivot: "ad=x,y;..."; bagli: "cocuk=ebeveyn;..."
  /// olcekY: "ad=oran;..." (gÃ¶z kÄ±rpma gibi dikey Ã¶lÃ§ek)
  public static void Ciz(string klasor, string sira, string gizli, string aci, string pivot, string bagli, string olcekY, string zemin, string cikti, int boyut) {
    var A = Sozluk(aci); var Pv = new Dictionary<string, float[]>(); foreach (var kv in Sozluk2(pivot)) Pv[kv.Key] = kv.Value;
    var B = new Dictionary<string, string>(); foreach (var t in bagli.Split(';')) { var p = t.Split('='); if (p.Length == 2) B[p[0].Trim()] = p[1].Trim(); }
    var Oy = Sozluk(olcekY); var G = new HashSet<string>(gizli.Split(','));
    using (var c = new Bitmap(2048, 2048, PixelFormat.Format32bppPArgb)) {
      using (var g = Graphics.FromImage(c)) {
        g.Clear(ColorTranslator.FromHtml(zemin)); g.InterpolationMode = InterpolationMode.HighQualityBilinear; g.PixelOffsetMode = PixelOffsetMode.HighQuality; g.SmoothingMode = SmoothingMode.AntiAlias;
        foreach (var ad0 in sira.Split(',')) { var ad = ad0.Trim(); if (G.Contains(ad)) continue;
          using (var im = new Bitmap(klasor + "/" + ad + ".png")) {
            var m = new Matrix();
            // kendi dÃ¶nÃ¼ÅŸÃ¼ (Ã¶lÃ§ek + aÃ§Ä±) kendi pivotu etrafÄ±nda, sonra ebeveynin dÃ¶nÃ¼ÅŸÃ¼
            Uygula(m, ad, A, Pv, Oy);
            if (B.ContainsKey(ad)) Uygula(m, B[ad], A, Pv, Oy);
            g.Transform = m; g.DrawImage(im, 0, 0, 2048, 2048); g.ResetTransform();
          }
        }
      }
      using (var o = new Bitmap(boyut, boyut)) { using (var g = Graphics.FromImage(o)) { g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.DrawImage(c, 0, 0, boyut, boyut); } o.Save(cikti, ImageFormat.Png); }
    }
  }
  static void Uygula(Matrix m, string ad, Dictionary<string, float> A, Dictionary<string, float[]> Pv, Dictionary<string, float> Oy) {
    if (!Pv.ContainsKey(ad)) return; var p = Pv[ad];
    float a = A.ContainsKey(ad) ? A[ad] : 0, s = Oy.ContainsKey(ad) ? Oy[ad] : 1;
    if (a == 0 && s == 1) return;
    var k = new Matrix(); k.Translate(-p[0], -p[1]); k.Scale(1, s, MatrixOrder.Append); k.Rotate(a, MatrixOrder.Append); k.Translate(p[0], p[1], MatrixOrder.Append);
    m.Multiply(k, MatrixOrder.Append);
  }
  static Dictionary<string, float> Sozluk(string s) { var d = new Dictionary<string, float>(); foreach (var t in s.Split(';')) { var p = t.Split('='); if (p.Length == 2) d[p[0].Trim()] = float.Parse(p[1], System.Globalization.CultureInfo.InvariantCulture); } return d; }
  static Dictionary<string, float[]> Sozluk2(string s) { var d = new Dictionary<string, float[]>(); foreach (var t in s.Split(';')) { var p = t.Split('='); if (p.Length != 2) continue; var v = p[1].Split(','); d[p[0].Trim()] = new[] { float.Parse(v[0], System.Globalization.CultureInfo.InvariantCulture), float.Parse(v[1], System.Globalization.CultureInfo.InvariantCulture) }; } return d; }

  /// katmanÄ± sÄ±nÄ±r kutusuna kÄ±rpÄ±p PNG yazar; "x,y,w,h" dÃ¶ner (boÅŸsa "")
  public static string Kirp(string girdi, string cikti, int pay) {
    using (var b = new Bitmap(girdi)) {
      int W = b.Width, H = b.Height; var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      var px = new byte[W * H * 4]; System.Runtime.InteropServices.Marshal.Copy(d.Scan0, px, 0, px.Length); b.UnlockBits(d);
      int x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) return "";
      x0 = Math.Max(0, x0 - pay); y0 = Math.Max(0, y0 - pay); x1 = Math.Min(W - 1, x1 + pay); y1 = Math.Min(H - 1, y1 + pay);
      using (var k = b.Clone(new Rectangle(x0, y0, x1 - x0 + 1, y1 - y0 + 1), PixelFormat.Format32bppArgb)) k.Save(cikti, ImageFormat.Png);
      return x0 + "," + y0 + "," + (x1 - x0 + 1) + "," + (y1 - y0 + 1);
    }
  }
}

