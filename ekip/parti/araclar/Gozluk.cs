using System; using System.Drawing; using System.Drawing.Imaging; using System.Runtime.InteropServices; using System.Collections.Generic;
public static class Gozluk {
  // kırmızı gözlük çerçevesi: yüz ortasının (xm) solu/sağı ayrı; her halkanın dış sınır kutusu merkezi ve eni
  public static string Olc(string yol, int y0, int y1, int xm, int kopru) {
    using (var b0 = new Bitmap(yol)) using (var b = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) g.DrawImage(b0, 0, 0, b0.Width, b0.Height);
      int W = b.Width, H = b.Height; var p = new byte[W * H * 4];
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(d.Scan0 + y * d.Stride, p, y * W * 4, W * 4); b.UnlockBits(d);
      var s = new List<string>();
      for (int yan = 0; yan < 2; yan++) { int mx = int.MaxValue, Mx = -1, my = int.MaxValue, My = -1, n = 0;
        for (int y = Math.Max(0, y0); y < Math.Min(H, y1); y++) for (int x = 0; x < W; x++) {
          if (yan == 0 ? x > xm - kopru : x < xm + kopru) continue; int o = (y * W + x) * 4;
          int B = p[o], G = p[o + 1], R = p[o + 2], A = p[o + 3];
          if (A < 200 || R < 170 || G > 90 || B > 100 || R - G < 110) continue;
          n++; mx = Math.Min(mx, x); Mx = Math.Max(Mx, x); my = Math.Min(my, y); My = Math.Max(My, y); }
        s.Add(string.Format(System.Globalization.CultureInfo.InvariantCulture, "{0}: merkez {1:0.0},{2:0.0} en {3} boy {4} n={5}", yan == 0 ? "sol" : "sag", (mx + Mx) / 2.0, (my + My) / 2.0, Mx - mx + 1, My - my + 1, n)); }
      return string.Join(" | ", s.ToArray());
    }
  }
}
