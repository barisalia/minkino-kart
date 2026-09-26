// Parti pozları araçları: beyaz zemin silme (kenara bağlı + büyük kapalı boşluklar, kenar rengi beyazdan ayrılır),
// alfa ile doğru ölçekleme, tuvale yerleştirme ve kayıpsız WebP (VP8L) kodlayıcı.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public class Rgba {
  public int W, H; public byte[] P; // BGRA sırası (System.Drawing ile aynı)
  public Rgba(int w, int h) { W = w; H = h; P = new byte[w * h * 4]; }
  public static Rgba Oku(string yol) {
    using (var b0 = new Bitmap(yol)) using (var b = new Bitmap(b0.Width, b0.Height, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) { g.DrawImage(b0, 0, 0, b0.Width, b0.Height); }
      var r = new Rgba(b.Width, b.Height);
      var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < b.Height; y++) Marshal.Copy(d.Scan0 + y * d.Stride, r.P, y * r.W * 4, r.W * 4);
      b.UnlockBits(d); return r;
    }
  }
  public void Yaz(string yol) {
    using (var b = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(P, y * W * 4, d.Scan0 + y * d.Stride, W * 4);
      b.UnlockBits(d); b.Save(yol, ImageFormat.Png);
    }
  }
  /// opak piksellerin sınırı: sol, üst, sağ, alt (alfa > esik)
  public int[] Sinir(int esik) {
    int x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) if (P[(y * W + x) * 4 + 3] > esik) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    return new int[] { x0, y0, x1, y1 };
  }
}

public static class Parti {
  static bool Beyaz(byte[] p, int i, int esik) { return p[i] > esik && p[i + 1] > esik && p[i + 2] > esik; }

  /// Zemin silme. esik: beyaz sayılma (232). buyukBosluk: kenara bağlı olmayan beyaz bölge bu alandan büyükse zemin sayılır
  /// (kol-gövde arası gibi). korunacak: "x,y;x,y" noktalarını içeren bölgeler silinmez (göz akı vb.). Rapor döner.
  public static string ZeminSil(string girdi, string cikti, int esik, int buyukBosluk, string korunacak) {
    return ZeminSil(girdi, cikti, esik, buyukBosluk, korunacak, "");
  }
  /// silNo: ayrıca silinecek kapalı boşluk numaraları ("13,14"): kol-gövde arası gibi zemin boşlukları
  public static string ZeminSil(string girdi, string cikti, int esik, int buyukBosluk, string korunacak, string silNo) {
    var silSet = new HashSet<int>();
    if (!string.IsNullOrEmpty(silNo)) foreach (var s in silNo.Split(',')) { int v; if (int.TryParse(s.Trim(), out v)) silSet.Add(v); }
    var r = Rgba.Oku(girdi); int W = r.W, H = r.H; var p = r.P;
    var etiket = new int[W * H]; // 0: işlenmedi, -1: beyaz değil, >0 bölge no
    var alanlar = new List<int>(); alanlar.Add(0);
    var kenara = new List<bool>(); kenara.Add(false);
    var sinirlar = new List<int[]>(); sinirlar.Add(null);
    var kuyruk = new int[W * H];
    for (int s = 0; s < W * H; s++) {
      if (etiket[s] != 0) continue;
      if (!Beyaz(p, s * 4, esik)) { etiket[s] = -1; continue; }
      int no = alanlar.Count; int bas = 0, son = 0; kuyruk[son++] = s; etiket[s] = no;
      int alan = 0; bool kenar = false; int bx0 = W, by0 = H, bx1 = 0, by1 = 0;
      while (bas < son) {
        int i = kuyruk[bas++]; alan++; int x = i % W, y = i / W;
        if (x == 0 || y == 0 || x == W - 1 || y == H - 1) kenar = true;
        if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
        int[] k = { x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1 };
        foreach (int j in k) { if (j < 0 || etiket[j] != 0) continue; if (Beyaz(p, j * 4, esik)) { etiket[j] = no; kuyruk[son++] = j; } else etiket[j] = -1; }
      }
      alanlar.Add(alan); kenara.Add(kenar); sinirlar.Add(new int[] { bx0, by0, bx1, by1 });
      // -1 işaretlenen beyaz-olmayanlar sonraki taramada yeniden bakılır; sorun değil
    }
    var koru = new HashSet<int>();
    if (!string.IsNullOrEmpty(korunacak)) foreach (var parca in korunacak.Split(';')) {
      var xy = parca.Split(','); if (xy.Length != 2) continue;
      int e = etiket[int.Parse(xy[1]) * W + int.Parse(xy[0])]; if (e > 0) koru.Add(e);
    }
    var silinecek = new bool[alanlar.Count];
    var rapor = new System.Text.StringBuilder();
    // her bölgenin "saf beyaz" oranı (üç kanal da >= 253) ve ortalama parlaklığı
    var saf = new int[alanlar.Count]; var toplam = new long[alanlar.Count];
    for (int i = 0; i < W * H; i++) { int e = etiket[i]; if (e <= 0) continue; int o = i * 4;
      int mn = Math.Min(p[o], Math.Min(p[o + 1], p[o + 2])); if (mn >= 253) saf[e]++; toplam[e] += (p[o] + p[o + 1] + p[o + 2]) / 3; }
    for (int n = 1; n < alanlar.Count; n++) {
      bool sil = !koru.Contains(n) && (kenara[n] || alanlar[n] > buyukBosluk || silSet.Contains(n));
      silinecek[n] = sil;
      if (!kenara[n] && alanlar[n] > 600) {
        var b = sinirlar[n];
        rapor.AppendFormat("bosluk#{0} alan={1} kutu={2},{3}-{4},{5} saf={6:F2} ort={7:F1} {8}\n", n, alanlar[n], b[0], b[1], b[2], b[3],
          (double)saf[n] / alanlar[n], (double)toplam[n] / alanlar[n], sil ? "SILINDI" : (koru.Contains(n) ? "korundu" : "kaldi"));
      }
    }
    { int kn = 0; long ks = 0, kt = 0; for (int n = 1; n < alanlar.Count; n++) if (kenara[n]) { kn += alanlar[n]; ks += saf[n]; kt += toplam[n]; }
      if (kn > 0) rapor.AppendFormat("KENAR ZEMIN saf={0:F3} ort={1:F1}\n", (double)ks / kn, (double)kt / kn); }
    var sil2 = new bool[W * H];
    for (int i = 0; i < W * H; i++) if (etiket[i] > 0 && silinecek[etiket[i]]) sil2[i] = true;
    // Kenar pikselleri: silinen alana 2 px içindeki açık pikselleri koyu kontur rengiyle beyazdan ayır (koyu zeminde hale kalmasın)
    int[] F = { 30, 38, 66 }; // B,G,R: koyu kahve kontur yaklaşık (66,38,30)
    var yakin = new bool[W * H];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int i = y * W + x; if (sil2[i]) continue;
      for (int dy = -2; dy <= 2 && !yakin[i]; dy++) for (int dx = -2; dx <= 2; dx++) {
        int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        if (sil2[yy * W + xx]) { yakin[i] = true; break; }
      }
    }
    for (int i = 0; i < W * H; i++) {
      int o = i * 4;
      if (sil2[i]) { p[o] = p[o + 1] = p[o + 2] = 0; p[o + 3] = 0; continue; }
      if (!yakin[i]) continue;
      // C = a*F + (1-a)*255  →  a = (255 - C) / (255 - F), kanalların en büyüğü
      double a = 0;
      for (int c = 0; c < 3; c++) a = Math.Max(a, (255.0 - p[o + c]) / (255.0 - F[c]));
      if (a >= 1) continue;
      if (a < 0.02) { p[o] = p[o + 1] = p[o + 2] = 0; p[o + 3] = 0; continue; }
      for (int c = 0; c < 3; c++) { double v = (p[o + c] - (1 - a) * 255.0) / a; p[o + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(v))); }
      p[o + 3] = (byte)Math.Round(a * 255);
    }
    r.Yaz(cikti);
    var sb = r.Sinir(8);
    return rapor.ToString() + "sinir=" + sb[0] + "," + sb[1] + "," + sb[2] + "," + sb[3] + " boyut=" + W + "x" + H;
  }

  /// Kaynağı (şeffaf PNG) s ölçeğiyle küçültüp tuvale koyar: kaynaktaki (ax, ay) noktası tuvalde (tx, ty)'ye gelir.
  public static void Yerlestir(string girdi, string cikti, int tw, int th, double s, double ax, double ay, double tx, double ty) {
    using (var src = new Bitmap(girdi)) using (var srcP = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppPArgb))
    using (var dst = new Bitmap(tw, th, PixelFormat.Format32bppPArgb)) {
      using (var g = Graphics.FromImage(srcP)) { g.CompositingMode = CompositingMode.SourceCopy; g.DrawImage(src, 0, 0, src.Width, src.Height); }
      using (var g = Graphics.FromImage(dst)) {
        g.Clear(Color.Transparent);
        g.CompositingMode = CompositingMode.SourceCopy;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        float x = (float)(tx - ax * s), y = (float)(ty - ay * s);
        using (var ia = new ImageAttributes()) {
          ia.SetWrapMode(WrapMode.Clamp); // kaynak dışı şeffaf (döşeme yok)
          g.DrawImage(srcP, new Rectangle(0, 0, tw, th), (float)(-x / s), (float)(-y / s), (float)(tw / s), (float)(th / s), GraphicsUnit.Pixel, ia);
        }
      }
      using (var outB = new Bitmap(tw, th, PixelFormat.Format32bppArgb)) {
        using (var g = Graphics.FromImage(outB)) { g.CompositingMode = CompositingMode.SourceCopy; g.DrawImage(dst, 0, 0, tw, th); }
        outB.Save(cikti, ImageFormat.Png);
      }
    }
  }

  /// Zemini önceden silinmiş (eski boru hattı) çizimin kenar halesini temizler: saydam alana 2 px içindeki pikseller
  /// beyaz üstüne karışmış sayılır, koyu kontur rengiyle beyazdan ayrılır (renk ve alfa yeniden hesaplanır).
  public static string KenarTemizle(string girdi, string cikti) {
    var r = Rgba.Oku(girdi); int W = r.W, H = r.H; var p = r.P;
    int[] F = { 30, 38, 66 };
    var saydam = new bool[W * H]; for (int i = 0; i < W * H; i++) saydam[i] = p[i * 4 + 3] < 10;
    int degisen = 0;
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int i = y * W + x; if (saydam[i]) continue;
      bool yakin = false;
      for (int dy = -2; dy <= 2 && !yakin; dy++) for (int dx = -2; dx <= 2; dx++) {
        int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        if (saydam[yy * W + xx]) { yakin = true; break; }
      }
      if (!yakin) continue;
      int o = i * 4; double a = 0;
      for (int c = 0; c < 3; c++) a = Math.Max(a, (255.0 - p[o + c]) / (255.0 - F[c]));
      if (a >= 1) continue;
      double yeniA = Math.Min(a, p[o + 3] / 255.0);
      if (yeniA < 0.02) { p[o] = p[o + 1] = p[o + 2] = 0; p[o + 3] = 0; degisen++; continue; }
      for (int c = 0; c < 3; c++) { double v = (p[o + c] - (1 - a) * 255.0) / Math.Max(a, 0.02); p[o + c] = (byte)Math.Max(0, Math.Min(255, Math.Round(v))); }
      p[o + 3] = (byte)Math.Round(yeniA * 255); degisen++;
    }
    r.Yaz(cikti);
    return "kenar temizlendi: " + degisen + " piksel";
  }

  /// Kalın koyu bölgelerin (gözbebekleri) merkezleri: yarıçap r'lik kare içinde en az oran kadarı koyu olan pikseller
  /// bölgelere ayrılır; her bölgenin ağırlık merkezi ve piksel sayısı döner. Arama kutusu: x0,y0,x1,y1.
  public static string KoyuMerkezler(string png, int r, double oran, int x0, int y0, int x1, int y1) {
    var g = Rgba.Oku(png); int W = g.W, H = g.H; var p = g.P;
    var koyu = new int[(W + 1) * (H + 1)]; // integral görüntü
    for (int y = 0; y < H; y++) { int satir = 0; for (int x = 0; x < W; x++) {
      int o = (y * W + x) * 4; bool k = p[o + 3] > 200 && p[o + 2] < 95 && p[o + 1] < 70 && p[o] < 65;
      satir += k ? 1 : 0; koyu[(y + 1) * (W + 1) + x + 1] = koyu[y * (W + 1) + x + 1] + satir; } }
    var isaret = new bool[W * H]; int alan = (2 * r + 1) * (2 * r + 1);
    for (int y = Math.Max(y0, r); y <= Math.Min(y1, H - r - 1); y++) for (int x = Math.Max(x0, r); x <= Math.Min(x1, W - r - 1); x++) {
      int s = koyu[(y + r + 1) * (W + 1) + x + r + 1] - koyu[(y - r) * (W + 1) + x + r + 1] - koyu[(y + r + 1) * (W + 1) + x - r] + koyu[(y - r) * (W + 1) + x - r];
      if (s >= oran * alan) isaret[y * W + x] = true;
    }
    var gorulen = new bool[W * H]; var sb = new System.Text.StringBuilder(); var q = new Queue<int>();
    for (int i = 0; i < W * H; i++) {
      if (!isaret[i] || gorulen[i]) continue;
      long sx = 0, sy = 0; int n = 0; q.Enqueue(i); gorulen[i] = true;
      while (q.Count > 0) { int j = q.Dequeue(); int x = j % W, y = j / W; sx += x; sy += y; n++;
        foreach (int k in new[] { j - 1, j + 1, j - W, j + W }) if (k >= 0 && k < W * H && isaret[k] && !gorulen[k]) { gorulen[k] = true; q.Enqueue(k); } }
      sb.AppendFormat("({0:F1},{1:F1}) n={2}\n", (double)sx / n, (double)sy / n, n);
    }
    var bb = g.Sinir(8);
    return sb.ToString() + "sinir=" + bb[0] + "," + bb[1] + "," + bb[2] + "," + bb[3];
  }

  // ---------------- Kayıpsız WebP (VP8L): yeşil çıkarma + tahmin (mod 12) + LZ77 (sol/üst) + Huffman ----------------
  class Bitler {
    public List<byte> B = new List<byte>(); ulong acc; int n;
    public void Yaz(uint v, int k) { if (k == 0) return; acc |= (ulong)v << n; n += k; while (n >= 8) { B.Add((byte)acc); acc >>= 8; n -= 8; } }
    public void Bitir() { if (n > 0) { B.Add((byte)acc); acc = 0; n = 0; } }
  }
  static readonly int[] KodSirasi = { 17, 18, 0, 1, 2, 3, 4, 5, 16, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 };

  static int[] Uzunluklar(long[] frek, int sinir) {
    int n = frek.Length; var len = new int[n];
    var kullanilan = new List<int>(); for (int i = 0; i < n; i++) if (frek[i] > 0) kullanilan.Add(i);
    if (kullanilan.Count == 0) return len;
    if (kullanilan.Count == 1) { len[kullanilan[0]] = 1; return len; }
    long enAz = 1;
    while (true) {
      // basit Huffman: (frekans, düğüm) listesi
      var agirlik = new List<long>(); var sol = new List<int>(); var sag = new List<int>(); var yaprak = new List<int>();
      var acik = new List<int>();
      foreach (int s in kullanilan) { agirlik.Add(Math.Max(frek[s], enAz)); sol.Add(-1); sag.Add(-1); yaprak.Add(s); acik.Add(agirlik.Count - 1); }
      while (acik.Count > 1) {
        acik.Sort((a, b) => agirlik[a] != agirlik[b] ? agirlik[a].CompareTo(agirlik[b]) : a.CompareTo(b));
        int a1 = acik[0], a2 = acik[1]; acik.RemoveRange(0, 2);
        agirlik.Add(agirlik[a1] + agirlik[a2]); sol.Add(a1); sag.Add(a2); yaprak.Add(-1); acik.Add(agirlik.Count - 1);
      }
      int enDerin = 0; var yig = new Stack<int[]>(); yig.Push(new[] { acik[0], 0 });
      var gecici = new int[n];
      while (yig.Count > 0) {
        var t = yig.Pop(); int d = t[0], dr = t[1];
        if (yaprak[d] >= 0) { gecici[yaprak[d]] = Math.Max(1, dr); enDerin = Math.Max(enDerin, Math.Max(1, dr)); }
        else { yig.Push(new[] { sol[d], dr + 1 }); yig.Push(new[] { sag[d], dr + 1 }); }
      }
      if (enDerin <= sinir) return gecici;
      enAz *= 2;
    }
  }
  static int[] Kodlar(int[] len) {
    int maxL = 0; foreach (int l in len) maxL = Math.Max(maxL, l);
    var say = new int[maxL + 2]; foreach (int l in len) if (l > 0) say[l]++;
    var sonraki = new int[maxL + 2]; int kod = 0;
    for (int b = 1; b <= maxL; b++) { kod = (kod + say[b - 1]) << 1; sonraki[b] = kod; }
    // deflate ile aynı kanonik atama (say[0] sayılmaz)
    kod = 0; say[0] = 0;
    for (int b = 1; b <= maxL; b++) { kod = (kod + say[b - 1]) << 1; sonraki[b] = kod; }
    var kodlar = new int[len.Length];
    for (int s = 0; s < len.Length; s++) if (len[s] > 0) { int c = sonraki[len[s]]++; int r = 0; for (int i = 0; i < len[s]; i++) r |= ((c >> i) & 1) << (len[s] - 1 - i); kodlar[s] = r; }
    return kodlar;
  }
  class Kod { public int[] L; public int[] C; public bool Tek; public int TekSembol; }
  static Kod KodYaz(Bitler w, long[] frek) {
    var k = new Kod(); int kullanilan = 0, son = 0;
    for (int i = 0; i < frek.Length; i++) if (frek[i] > 0) { kullanilan++; son = i; }
    if (kullanilan <= 1) {
      // basit kod, tek sembol: 0 bit
      int s = kullanilan == 1 ? son : 0;
      w.Yaz(1, 1); w.Yaz(0, 1);
      if (s < 2) { w.Yaz(0, 1); w.Yaz((uint)s, 1); } else { w.Yaz(1, 1); w.Yaz((uint)s, 8); }
      k.Tek = true; k.TekSembol = s; return k;
    }
    k.L = Uzunluklar(frek, 15); k.C = Kodlar(k.L);
    w.Yaz(0, 1);
    var kf = new long[19]; foreach (int l in k.L) kf[l]++;
    int kk = 0; for (int i = 0; i < 19; i++) if (kf[i] > 0) kk++;
    int[] kl; int[] kc;
    if (kk == 1) { kl = new int[19]; for (int i = 0; i < 19; i++) if (kf[i] > 0) kl[i] = 1; kc = new int[19]; }
    else { kl = Uzunluklar(kf, 7); kc = Kodlar(kl); }
    int adet = 19; while (adet > 4 && kl[KodSirasi[adet - 1]] == 0) adet--;
    w.Yaz((uint)(adet - 4), 4);
    for (int i = 0; i < adet; i++) w.Yaz((uint)kl[KodSirasi[i]], 3);
    w.Yaz(0, 1); // max_symbol = alfabe boyu
    foreach (int l in k.L) { if (kk == 1) continue; w.Yaz((uint)kc[l], kl[l]); }
    return k;
  }
  static void Sembol(Bitler w, Kod k, int s) { if (k.Tek) return; w.Yaz((uint)k.C[s], k.L[s]); }
  static void Onek(int deger, out int onek, out int ekBit, out int ekDeger) {
    int v = deger - 1;
    if (v < 4) { onek = v; ekBit = 0; ekDeger = 0; return; }
    int h = 31; while (((v >> h) & 1) == 0) h--;
    int ikinci = (v >> (h - 1)) & 1;
    onek = 2 * h + ikinci; ekBit = h - 1; ekDeger = v & ((1 << (h - 1)) - 1);
  }

  // Sembol akışı: literal ARGB ya da (uzunluk, mesafe kodu)
  struct Oge { public bool Geri; public uint Argb; public int Uz; public int MesKod; }

  static void GoruntuKodla(Bitler w, uint[] px, int W, int H, bool anaGoruntu) {
    // LZ77: yalnız sol (mesafe kodu 2) ve üst (mesafe kodu 1) eşleşmeleri
    var ogeler = new List<Oge>(); int i = 0, N = px.Length;
    while (i < N) {
      int enIyi = 0, enKod = 0;
      if (i >= 1) { int l = 0; while (i + l < N && l < 4096 && px[i + l] == px[i + l - 1]) l++; if (l > enIyi) { enIyi = l; enKod = 2; } }
      if (i >= W) { int l = 0; while (i + l < N && l < 4096 && px[i + l] == px[i + l - W]) l++; if (l > enIyi) { enIyi = l; enKod = 1; } }
      if (enIyi >= 3) { ogeler.Add(new Oge { Geri = true, Uz = enIyi, MesKod = enKod }); i += enIyi; }
      else { ogeler.Add(new Oge { Argb = px[i] }); i++; }
    }
    var fG = new long[280]; var fR = new long[256]; var fB = new long[256]; var fA = new long[256]; var fD = new long[40];
    foreach (var o in ogeler) {
      if (o.Geri) { int on, eb, ed; Onek(o.Uz, out on, out eb, out ed); fG[256 + on]++; Onek(o.MesKod, out on, out eb, out ed); fD[on]++; }
      else { fG[(o.Argb >> 8) & 255]++; fR[(o.Argb >> 16) & 255]++; fB[o.Argb & 255]++; fA[o.Argb >> 24]++; }
    }
    w.Yaz(0, 1);              // renk önbelleği yok
    if (anaGoruntu) w.Yaz(0, 1); // tek önek kod grubu
    var kG = KodYaz(w, fG); var kR = KodYaz(w, fR); var kB = KodYaz(w, fB); var kA = KodYaz(w, fA); var kD = KodYaz(w, fD);
    foreach (var o in ogeler) {
      if (o.Geri) {
        int on, eb, ed; Onek(o.Uz, out on, out eb, out ed); Sembol(w, kG, 256 + on); w.Yaz((uint)ed, eb);
        Onek(o.MesKod, out on, out eb, out ed); Sembol(w, kD, on); w.Yaz((uint)ed, eb);
      } else {
        Sembol(w, kG, (int)((o.Argb >> 8) & 255)); Sembol(w, kR, (int)((o.Argb >> 16) & 255)); Sembol(w, kB, (int)(o.Argb & 255)); Sembol(w, kA, (int)(o.Argb >> 24));
      }
    }
  }
  static uint Kanal(uint a, uint b, uint c, Func<int, int, int, int> f) {
    uint r = 0; for (int s = 0; s < 32; s += 8) { int v = f((int)((a >> s) & 255), (int)((b >> s) & 255), (int)((c >> s) & 255)); r |= (uint)(v & 255) << s; } return r;
  }
  static uint Fark(uint a, uint b) { uint r = 0; for (int s = 0; s < 32; s += 8) r |= (uint)((((a >> s) & 255) - ((b >> s) & 255)) & 255) << s; return r; }

  public static string WebpYaz(string pngYol, string webpYol) {
    var r = Rgba.Oku(pngYol); int W = r.W, H = r.H;
    var px = new uint[W * H];
    for (int i = 0; i < W * H; i++) {
      int o = i * 4; uint b = r.P[o], g = r.P[o + 1], rr = r.P[o + 2], a = r.P[o + 3];
      if (a == 0) { b = g = rr = 0; }
      px[i] = (a << 24) | (rr << 16) | (g << 8) | b;
    }
    var orijinal = (uint[])px.Clone();
    // 1) yeşil çıkarma
    for (int i = 0; i < px.Length; i++) { uint p = px[i]; uint g = (p >> 8) & 255; uint rr = (((p >> 16) & 255) - g) & 255; uint b = ((p & 255) - g) & 255; px[i] = (p & 0xff00ff00u) | (rr << 16) | b; }
    // 2) tahmin: tek blok modu 12 (ClampAddSubtractFull)
    var art = new uint[px.Length];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int i = y * W + x; uint tah;
      if (x == 0 && y == 0) tah = 0xff000000u;
      else if (y == 0) tah = px[i - 1];
      else if (x == 0) tah = px[i - W];
      else tah = Kanal(px[i - 1], px[i - W], px[i - W - 1], (l, t, tl) => Math.Max(0, Math.Min(255, l + t - tl)));
      art[i] = Fark(px[i], tah);
    }
    var w = new Bitler();
    w.Yaz(0x2f, 8); w.Yaz((uint)(W - 1), 14); w.Yaz((uint)(H - 1), 14); w.Yaz(1, 1); w.Yaz(0, 3);
    w.Yaz(1, 1); w.Yaz(2, 2);                 // dönüşüm: yeşil çıkarma
    int boyBit = 9; int bw = (W + (1 << boyBit) - 1) >> boyBit, bh = (H + (1 << boyBit) - 1) >> boyBit;
    w.Yaz(1, 1); w.Yaz(0, 2); w.Yaz((uint)(boyBit - 2), 3); // dönüşüm: tahmin
    var tahminGoruntu = new uint[bw * bh]; for (int i = 0; i < tahminGoruntu.Length; i++) tahminGoruntu[i] = 0xff000000u | (12u << 8);
    GoruntuKodla(w, tahminGoruntu, bw, bh, false);
    w.Yaz(0, 1);                              // başka dönüşüm yok
    GoruntuKodla(w, art, W, H, true);
    w.Bitir();
    var veri = w.B.ToArray();
    using (var fs = File.Create(webpYol)) using (var bw2 = new BinaryWriter(fs)) {
      int pad = veri.Length & 1;
      bw2.Write(new[] { (byte)'R', (byte)'I', (byte)'F', (byte)'F' }); bw2.Write((uint)(4 + 8 + veri.Length + pad));
      bw2.Write(new[] { (byte)'W', (byte)'E', (byte)'B', (byte)'P', (byte)'V', (byte)'P', (byte)'8', (byte)'L' }); bw2.Write((uint)veri.Length);
      bw2.Write(veri); if (pad == 1) bw2.Write((byte)0);
    }
    return W + "x" + H + " " + (veri.Length / 1024) + " KB";
  }
}
