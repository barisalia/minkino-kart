// Karakter iskeleti: raster çizimi konturlarına göre parçalara ayırır, gizli kalan yerleri tamamlar (her parça tam çizili),
// katman PNG'leri yazar ve yeniden birleştirip doğrular.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class Rig {
  public int N = 2048; public byte[] P;             // tuval BGRA (düz alfa)
  public List<string> Adlar = new List<string>();    // üyelik önceliği sırası
  List<bool[]> Poli = new List<bool[]>(); List<bool> Ozel = new List<bool>(); List<bool> Kes = new List<bool>();
  public Dictionary<string, int> Z = new Dictionary<string, int>(); // büyük = önde
  public int[] Sahip;                                  // piksel → parça (-1 şeffaf)
  public Dictionary<string, byte[]> Katman = new Dictionary<string, byte[]>();
  string Varsayilan;

  public Rig(string kaynak, float olcek, float ox, float oy) {
    using (var src0 = new Bitmap(kaynak)) using (var src = new Bitmap(src0.Width, src0.Height, PixelFormat.Format32bppPArgb))
    using (var dst = new Bitmap(N, N, PixelFormat.Format32bppPArgb)) {
      using (var g = Graphics.FromImage(src)) { g.CompositingMode = CompositingMode.SourceCopy; g.DrawImage(src0, 0, 0, src0.Width, src0.Height); }
      using (var g = Graphics.FromImage(dst)) {
        g.Clear(Color.Transparent); g.CompositingMode = CompositingMode.SourceCopy;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        using (var ia = new ImageAttributes()) { ia.SetWrapMode(WrapMode.Clamp);
          g.DrawImage(src, new Rectangle((int)Math.Round(ox), (int)Math.Round(oy), (int)Math.Round(src0.Width * olcek), (int)Math.Round(src0.Height * olcek)), 0, 0, src0.Width, src0.Height, GraphicsUnit.Pixel, ia); }
      }
      using (var d2 = new Bitmap(N, N, PixelFormat.Format32bppArgb)) {
        using (var g = Graphics.FromImage(d2)) { g.CompositingMode = CompositingMode.SourceCopy; g.DrawImage(dst, 0, 0, N, N); }
        P = Oku(d2);
      }
    }
  }
  static byte[] Oku(Bitmap b) {
    var p = new byte[b.Width * b.Height * 4];
    var d = b.LockBits(new Rectangle(0, 0, b.Width, b.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    for (int y = 0; y < b.Height; y++) Marshal.Copy(d.Scan0 + y * d.Stride, p, y * b.Width * 4, b.Width * 4);
    b.UnlockBits(d); return p;
  }
  static void Yaz(byte[] p, int W, int H, string yol) {
    using (var b = new Bitmap(W, H, PixelFormat.Format32bppArgb)) {
      var d = b.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
      for (int y = 0; y < H; y++) Marshal.Copy(p, y * W * 4, d.Scan0 + y * d.Stride, W * 4);
      b.UnlockBits(d); b.Save(yol, ImageFormat.Png);
    }
  }
  public void KaynakYaz(string yol) { Yaz(P, N, N, yol); }

  /// şekil: "e:cx,cy,rx,ry" elips ya da "p:x,y,x,y,..." çokgen (tuval koordinatı); ';' ile birden çok
  public bool[] Sekil(string tanim) {
    var m = new bool[N * N];
    using (var b = new Bitmap(N, N, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) {
        g.Clear(Color.Black); g.SmoothingMode = SmoothingMode.None;
        foreach (var t in tanim.Split(';')) { var s = t.Trim(); if (s.Length < 3) continue;
          var v = Sayilar(s.Substring(2));
          if (s[0] == 'e') g.FillEllipse(Brushes.White, v[0] - v[2], v[1] - v[3], v[2] * 2, v[3] * 2);
          else { var pts = new PointF[v.Length / 2]; for (int k = 0; k < pts.Length; k++) pts[k] = new PointF(v[2 * k], v[2 * k + 1]); g.FillPolygon(Brushes.White, pts); }
        }
      }
      var p = Oku(b); for (int i = 0; i < N * N; i++) m[i] = p[i * 4 + 2] > 127;
    }
    return m;
  }
  static float[] Sayilar(string s) { var a = s.Split(','); var r = new float[a.Length]; for (int i = 0; i < a.Length; i++) r[i] = float.Parse(a[i].Trim(), System.Globalization.CultureInfo.InvariantCulture); return r; }

  /// üyelik sırasıyla parça ekle (ilk eklenen önceliklidir). ozel: koyu pikseller yalnız poligon içindeyse bu parçaya gider
  /// kes: çizgisiz birleşik dolgu alanını (ör. baş-gövde) çokgeniyle kesebilir; değilse yalnız bileşen oyuyla parça alır
  public void Parca(string ad, string sekil, bool ozel, bool kes) { Adlar.Add(ad); Poli.Add(sekil == "" ? null : Sekil(sekil)); Ozel.Add(ozel); Kes.Add(kes); }
  public int Pay = 45; // çokgen sınırından tohum çekirdeğine uzaklık (px)
  /// maske aşındırma (ic=true: sınırdan ≥m içeride) ya da genişletme (ic=false: sınıra <m dışarıda dahil); 2 geçişli yaklaşık mesafe
  bool[] Mesafe(bool[] m, bool ic, int mm) {
    int n = N * N; var d = new int[n]; const int INF = 1 << 28;
    for (int i = 0; i < n; i++) d[i] = (m[i] == ic) ? INF : 0;
    for (int y = 0; y < N; y++) for (int x = 0; x < N; x++) { int i = y * N + x; if (d[i] == 0) continue; int v = d[i];
      if (x > 0) v = Math.Min(v, d[i - 1] + 3); if (y > 0) { v = Math.Min(v, d[i - N] + 3); if (x > 0) v = Math.Min(v, d[i - N - 1] + 4); if (x < N - 1) v = Math.Min(v, d[i - N + 1] + 4); } d[i] = v; }
    for (int y = N - 1; y >= 0; y--) for (int x = N - 1; x >= 0; x--) { int i = y * N + x; if (d[i] == 0) continue; int v = d[i];
      if (x < N - 1) v = Math.Min(v, d[i + 1] + 3); if (y < N - 1) { v = Math.Min(v, d[i + N] + 3); if (x < N - 1) v = Math.Min(v, d[i + N + 1] + 4); if (x > 0) v = Math.Min(v, d[i + N - 1] + 4); } d[i] = v; }
    var r = new bool[n];
    for (int i = 0; i < n; i++) r[i] = ic ? (m[i] && d[i] >= mm * 3) : (m[i] || d[i] < mm * 3);
    return r;
  }
  List<KeyValuePair<string, bool[]>> zorla = new List<KeyValuePair<string, bool[]>>();
  List<KeyValuePair<string, bool[]>> sert = new List<KeyValuePair<string, bool[]>>();
  public void Sert(string ad, string sekil) { sert.Add(new KeyValuePair<string, bool[]>(ad, Sekil(sekil))); }
  /// şekil içindeki koyu pikselleri (çizgileri) doğrudan bu parçaya ver
  public void Zorla(string ad, string sekil) { zorla.Add(new KeyValuePair<string, bool[]>(ad, Sekil(sekil))); }
  public void Sira(string arkadanOne) { var a = arkadanOne.Split(','); for (int i = 0; i < a.Length; i++) Z[a[i].Trim()] = i; }

  /// kontur sıcaklık eşiği: r - b bundan küçük koyu pikseller kontur sayılmaz (ör. inekteki nötr kara benekler dolgu kalır)
  public int KonturSicak = -999;
  /// kontur kenar halkası eşiği (parlaklık); 0 = kapalı
  public int KenarLum = 0;
  bool Koyu(int i, int esik) { int o = i * 4; int b = P[o], g = P[o + 1], r = P[o + 2];
    int lum = (r * 3 + g * 6 + b) / 10; int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
    return P[o + 3] > 110 && lum < esik && mx - mn < 90 && r - b >= KonturSicak; }

  /// piksel atama. koyuEsik: kontur parlaklık eşiği; W: kontur kalınlığı (tuval px); pay: bileşen oy eşiği
  public string Ata(string varsayilan, int koyuEsik, int W, double pay) {
    Varsayilan = varsayilan; if (!Adlar.Contains(varsayilan)) { Adlar.Add(varsayilan); Poli.Add(null); Ozel.Add(false); Kes.Add(true); }
    int n = N * N; Sahip = new int[n]; for (int i = 0; i < n; i++) Sahip[i] = -1;
    var koyu = new bool[n]; var dolu = new bool[n];
    for (int i = 0; i < n; i++) { if (P[i * 4 + 3] < 8) continue; if (Koyu(i, koyuEsik)) koyu[i] = true; else if (P[i * 4 + 3] >= 200) dolu[i] = true; }
    int vIdx = Adlar.IndexOf(varsayilan);
    Func<int, int> poliParca = i => { for (int k = 0; k < Adlar.Count; k++) if (Poli[k] != null && Poli[k][i]) return k; return vIdx; };
    // 1) dolgu bileşenleri (4-komşuluk), çoğunluk oyu
    var etk = new int[n]; var q = new int[n]; int no = 0; var rapor = new System.Text.StringBuilder();
    // 1a) bileşenler ve oyları
    var bilesen = new List<int[]>(); var oylar = new List<int[]>(); var toplamOy = new int[Adlar.Count];
    for (int s = 0; s < n; s++) {
      if (!dolu[s] || etk[s] != 0) continue; no++; int bas = 0, son = 0; q[son++] = s; etk[s] = no;
      while (bas < son) { int j = q[bas++]; int x = j % N;
        if (x > 0 && dolu[j - 1] && etk[j - 1] == 0) { etk[j - 1] = no; q[son++] = j - 1; }
        if (x < N - 1 && dolu[j + 1] && etk[j + 1] == 0) { etk[j + 1] = no; q[son++] = j + 1; }
        if (j >= N && dolu[j - N] && etk[j - N] == 0) { etk[j - N] = no; q[son++] = j - N; }
        if (j < n - N && dolu[j + N] && etk[j + N] == 0) { etk[j + N] = no; q[son++] = j + N; } }
      var uye = new int[son]; Array.Copy(q, uye, son); bilesen.Add(uye);
      var sy = new int[Adlar.Count]; for (int k = 0; k < son; k++) sy[poliParca(uye[k])]++;
      oylar.Add(sy); for (int k = 0; k < sy.Length; k++) toplamOy[k] += sy[k];
    }
    // 1b) atama. Bölünen bileşende aday: kesebilen, bu bileşende ≥%3 payı olan ve toplam oyunun ≥%30'u burada olan parçalar.
    //     Çokgenlerin yalnız iç çekirdeği (sınırdan ≥M px) tohum; kalan pikseller tohumlardan dolgu içinde büyüyerek
    //     (koyu çizgiler engel) atanır → sınırlar çizilmiş çizgileri izler.
    var asinmis = new Dictionary<int, bool[]>(); var genis = new Dictionary<int, bool[]>();
    for (int bi = 0; bi < bilesen.Count; bi++) {
      var uye = bilesen[bi]; int son = uye.Length; var say = oylar[bi];
      int en = 0; for (int k = 1; k < say.Length; k++) if (say[k] > say[en]) en = k;
      bool bol = say[en] < pay * son;
      if (!bol) { for (int k = 0; k < son; k++) Sahip[uye[k]] = en; continue; }
      var aday = new List<int>(); for (int k = 0; k < Adlar.Count; k++) if (Kes[k] && k != vIdx && say[k] >= 0.03 * son && say[k] >= 0.30 * toplamOy[k]) aday.Add(k);
      foreach (int c in aday) if (!asinmis.ContainsKey(c)) { asinmis[c] = Mesafe(Poli[c], true, Pay); genis[c] = Mesafe(Poli[c], false, Pay); }
      bool varsayilanAday = say[vIdx] >= 0.03 * son;
      int bas = 0, qs = 0;
      for (int k = 0; k < son; k++) { int i = uye[k]; int sec = -1;
        foreach (int c in aday) if (asinmis[c][i]) { sec = c; break; }
        if (sec < 0 && varsayilanAday) { bool disari = true; foreach (int c in aday) if (genis[c][i]) { disari = false; break; } if (disari) sec = vIdx; }
        if (sec >= 0) { Sahip[i] = sec; q[qs++] = i; } }
      if (qs == 0) { for (int k = 0; k < son; k++) Sahip[uye[k]] = en; continue; }
      while (bas < qs) { int j = q[bas++]; int x = j % N;
        int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
        foreach (int t in kom) if (t >= 0 && dolu[t] && Sahip[t] < 0 && etk[t] == bi + 1) { Sahip[t] = Sahip[j]; q[qs++] = t; } }
      for (int k = 0; k < son; k++) if (Sahip[uye[k]] < 0) Sahip[uye[k]] = en;
      if (bol && son > 2000) rapor.AppendFormat("bolunen bilesen {0} px: {1}\n", son, Dagilim(say));
    }
    // 1c) sert bölgeler: şekil içindeki dolgu pikselleri doğrudan bu parçaya (çizgisiz birleşimde kesin kesim)
    foreach (var z in sert) { int sk = Adlar.IndexOf(z.Key); for (int i = 0; i < n; i++) if (dolu[i] && z.Value[i] && !Ozel[Sahip[i] < 0 ? 0 : Sahip[i]]) Sahip[i] = sk; }
    // 2) özel parçalar (göz gibi kendi içinde kapalı): poligon içindeki TÜM pikseller (koyu ve dolgu) bu parçanın
    for (int i = 0; i < n; i++) if (koyu[i] || dolu[i]) for (int k = 0; k < Adlar.Count; k++) if (Ozel[k] && Poli[k] != null && Poli[k][i]) { Sahip[i] = k; break; }
    // 2b) zorla atanan koyu çizgiler (ör. gövdeye ait boyun çizgisi): Zorla(ad, şekil) ile verilir
    foreach (var z in zorla) for (int i = 0; i < n; i++) if (koyu[i] && z.Value[i]) Sahip[i] = Adlar.IndexOf(z.Key);
    // 3) kalan koyu pikseller: W içinde dolgusu olan parçalardan en öndeki (özel parçalar hariç); yoksa en yakın
    var enYakin = new int[n]; var mesafe = new int[n]; for (int i = 0; i < n; i++) { mesafe[i] = int.MaxValue; enYakin[i] = -1; }
    var yakinlar = new List<int>[1];
    // her parça için koyu pikseller üzerinden BFS (W sınırlı), en öndeki kazanır
    var enOn = new int[n]; for (int i = 0; i < n; i++) enOn[i] = -1;
    for (int k = 0; k < Adlar.Count; k++) {
      if (Ozel[k]) continue; int zk = Z.ContainsKey(Adlar[k]) ? Z[Adlar[k]] : 0;
      var d = new int[n]; for (int i = 0; i < n; i++) d[i] = -1; int bas = 0, son = 0;
      for (int i = 0; i < n; i++) if (dolu[i] && Sahip[i] == k) { d[i] = 0; q[son++] = i; }
      while (bas < son) { int j = q[bas++]; if (d[j] >= W * 4) continue; int x = j % N;
        int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
        foreach (int t in kom) { if (t < 0 || !koyu[t] || d[t] >= 0) continue; d[t] = d[j] + 1; q[son++] = t;
          if (Sahip[t] < 0) { if (d[t] <= W) { if (enOn[t] < 0 || zk > Z[Adlar[enOn[t]]]) enOn[t] = k; }
            if (d[t] < mesafe[t]) { mesafe[t] = d[t]; enYakin[t] = k; } } } }
    }
    int sahipsiz = 0;
    for (int i = 0; i < n; i++) if (koyu[i] && Sahip[i] < 0) { Sahip[i] = enOn[i] >= 0 ? enOn[i] : enYakin[i]; if (Sahip[i] < 0) { Sahip[i] = vIdx; sahipsiz++; } }
    // 4) yarı saydam kenar pikselleri: en yakın sahipli piksel (katman katman BFS; aynı uzaklıkta en öndeki).
    //    Tarama sırasıyla zincirleme yayılma olmasın diye her tur yalnız önceki turun sınırından ilerler.
    { var aday = new int[n]; for (int i = 0; i < n; i++) aday[i] = -1;
      var sinir = new List<int>(); for (int i = 0; i < n; i++) if (Sahip[i] >= 0) sinir.Add(i);
      while (sinir.Count > 0) { var yeni = new List<int>();
        foreach (int j in sinir) { int x = j % N;
          int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
          foreach (int t in kom) { if (t < 0 || Sahip[t] >= 0 || P[t * 4 + 3] == 0) continue;
            if (aday[t] < 0) { aday[t] = Sahip[j]; yeni.Add(t); } else if (Z[Adlar[Sahip[j]]] > Z[Adlar[aday[t]]]) aday[t] = Sahip[j]; } }
        foreach (int t in yeni) Sahip[t] = aday[t];
        sinir = yeni; } }
    for (int i = 0; i < n; i++) if (Sahip[i] < 0 && P[i * 4 + 3] > 0) Sahip[i] = vIdx;
    // 5) kopuk adacık temizliği: bir parçanın en büyük parçasından kopuk küçük adacıkları (8-komşu) en çok temas ettiği parçaya ver
    int devredilen = 0;
    for (int tur = 0; tur < 2; tur++) {
      var gor = new bool[n];
      var enBuyuk = new int[Adlar.Count];
      var adaciklar = new List<KeyValuePair<int, int[]>>();
      for (int s = 0; s < n; s++) { if (gor[s] || Sahip[s] < 0) continue; int p = Sahip[s]; int bs = 0, sn = 0; q[sn++] = s; gor[s] = true;
        while (bs < sn) { int j = q[bs++]; int x = j % N, y = j / N;
          for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; int t = yy * N + xx; if (!gor[t] && Sahip[t] == p) { gor[t] = true; q[sn++] = t; } } }
        var u = new int[sn]; Array.Copy(q, u, sn); adaciklar.Add(new KeyValuePair<int, int[]>(p, u)); if (sn > enBuyuk[p]) enBuyuk[p] = sn; }
      foreach (var ad in adaciklar) { int p = ad.Key; var u = ad.Value;
        if (u.Length >= enBuyuk[p] || u.Length > Math.Max(4000, enBuyuk[p] / 50)) continue;
        if (Ozel[p]) continue;
        var temas = new int[Adlar.Count];
        foreach (int j in u) { int x = j % N; int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
          foreach (int t in kom) if (t >= 0 && Sahip[t] >= 0 && Sahip[t] != p) temas[Sahip[t]]++; }
        int en2 = -1; for (int c = 0; c < temas.Length; c++) if (temas[c] > 0 && (en2 < 0 || temas[c] > temas[en2])) en2 = c;
        if (en2 < 0) continue;
        foreach (int j in u) Sahip[j] = en2; devredilen += u.Length; }
    }
    // 6) kontur kenar halkası: koyu çizginin yumuşatma halkasındaki (orta koyulukta) pikseller, çizgiyi sahiplenen öndeki
    //    parçaya geçer (arkadaki parçada "hayalet çizgi" kalmasın). KenarLum = 0 ise kapalı.
    int halka = 0;
    if (KenarLum > 0) for (int tur = 0; tur < 3; tur++) { var yeni = (int[])Sahip.Clone();
      for (int i = 0; i < n; i++) { if (Sahip[i] < 0 || koyu[i] || Ozel[Sahip[i]]) continue; int o = i * 4; int lum = (P[o + 2] * 3 + P[o + 1] * 6 + P[o]) / 10; if (lum >= KenarLum) continue;
        int x = i % N, y = i / N; int zi = Z[Adlar[Sahip[i]]];
        for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) { int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) continue; int t = yy * N + xx;
          if (Sahip[t] >= 0 && (koyu[t] || yeni[t] != Sahip[t]) && !Ozel[Sahip[t]] && Z[Adlar[Sahip[t]]] > zi) { yeni[i] = Sahip[t]; zi = Z[Adlar[Sahip[t]]]; } } }
      for (int i = 0; i < n; i++) if (yeni[i] != Sahip[i]) { Sahip[i] = yeni[i]; halka++; } }
    rapor.Append("kenar halkasi px: " + halka + " | ");
    rapor.Append("devredilen adacik px: " + devredilen + " | ");
    var top = new int[Adlar.Count]; for (int i = 0; i < n; i++) if (Sahip[i] >= 0) top[Sahip[i]]++;
    rapor.Append("piksel: " + Dagilim(top) + " | sahipsiz koyu: " + sahipsiz);
    // katmanlar: görünür pikseller
    foreach (var ad in Adlar) Katman[ad] = new byte[n * 4];
    for (int i = 0; i < n; i++) if (Sahip[i] >= 0) { var L = Katman[Adlar[Sahip[i]]]; for (int c = 0; c < 4; c++) L[i * 4 + c] = P[i * 4 + c]; }
    return rapor.ToString();
  }
  string Dagilim(int[] say) { var s = new List<string>(); for (int k = 0; k < say.Length; k++) if (say[k] > 0) s.Add(Adlar[k] + "=" + say[k]); return string.Join(" ", s.ToArray()); }

  /// Gizli kalan yeri tamamla: tam şekil ∩ (önündeki parçaların pikselleri) − kendi görünür pikselleri.
  /// renk: "#RRGGBB" ya da "" (görünür dolgunun ortancası). kontur: tam şeklin kenarına W px koyu çizgi (gizli kısımda)
  public string Tamamla(string ad, string sekil, string renk, string konturRenk, int W) {
    if (!Katman.ContainsKey(ad)) { Adlar.Add(ad); Poli.Add(null); Ozel.Add(false); Kes.Add(false); Katman[ad] = new byte[N * N * 4]; }
    int n = N * N; int zk = Z[ad]; int k = Adlar.IndexOf(ad); var L = Katman[ad];
    var tam = Sekil(sekil); for (int i = 0; i < n; i++) if (Sahip != null && Sahip[i] == k) tam[i] = true;
    byte[] c = renk != "" ? Hex(renk) : Ortanca(k);
    byte[] kc = Hex(konturRenk);
    // tam şeklin dışına uzaklık (W'ye kadar)
    var d = new int[n]; var q = new int[n]; int bas = 0, son = 0;
    for (int i = 0; i < n; i++) { if (!tam[i]) { d[i] = 0; } else d[i] = -1; }
    for (int i = 0; i < n; i++) if (tam[i]) { int x = i % N; bool kenar = x == 0 || x == N - 1 || i < N || i >= n - N || !tam[i - 1] || !tam[i + 1] || !tam[i - N] || !tam[i + N]; if (kenar) { d[i] = 1; q[son++] = i; } }
    while (bas < son) { int j = q[bas++]; if (d[j] >= W + 2) continue; int x = j % N;
      int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
      foreach (int t in kom) if (t >= 0 && d[t] < 0) { d[t] = d[j] + 1; q[son++] = t; } }
    int eklenen = 0;
    // doldurulacak (gizli) pikseller
    var gizli = new bool[n];
    for (int i = 0; i < n; i++) {
      if (!tam[i] || (Sahip != null && Sahip[i] == k)) continue;
      int sah = Sahip != null ? Sahip[i] : -1;
      if (sah < 0 || Z[Adlar[sah]] <= zk) continue;                 // yalnız öndeki parçaların altı (dinlenmede görünmez)
      if (P[i * 4 + 3] < 250) continue;                              // dış kenarın yarı saydam pikselleri altına dolgu yok
      if (Katman[Adlar[sah]][i * 4 + 3] < 250) continue;             // öndeki katman orada kısmi (eğri kesim/yumuşatma) → altı görünür
      if (L[i * 4 + 3] > 0) continue;                                // yumuşatma bandındaki özgün pikseller korunur
      gizli[i] = true;
    }
    // renk verilmediyse yerel renk: parçanın görünür dolgusundan en yakın pikselin rengi yayılır (gölgeyle uyumlu)
    // renk verilmediyse yerel renk: parçanın temiz görünür dolgusundan (açık, düşük doygun) en yakın renk yayılır,
    // sonra gizli alan komşu ortalamasıyla yumuşatılır (kaynaklar sabit) → çevre gölgesiyle pürüzsüz birleşir
    var R = new float[n]; var G = new float[n]; var Bl = new float[n]; var kaynak = new bool[n]; var ulasti = new bool[n];
    if (renk == "" && Sahip != null) {
      int bs = 0, sn = 0;
      for (int i = 0; i < n; i++) if (Sahip[i] == k && P[i * 4 + 3] > 250) { int o = i * 4;
        int mx = Math.Max(P[o], Math.Max(P[o + 1], P[o + 2])), mn = Math.Min(P[o], Math.Min(P[o + 1], P[o + 2]));
        int lum = (P[o + 2] * 3 + P[o + 1] * 6 + P[o]) / 10;
        if (lum >= 110 && KenarUzak(i, k)) { kaynak[i] = true; ulasti[i] = true; R[i] = P[o + 2]; G[i] = P[o + 1]; Bl[i] = P[o]; q[sn++] = i; } }
      while (bs < sn) { int j = q[bs++]; int x = j % N;
        int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
        foreach (int t in kom) if (t >= 0 && !ulasti[t] && (gizli[t] || Sahip[t] == k)) { ulasti[t] = true; R[t] = R[j]; G[t] = G[j]; Bl[t] = Bl[j]; q[sn++] = t; } }
      for (int tur = 0; tur < 20; tur++) for (int i = 0; i < n; i++) { if (!gizli[i] || !ulasti[i]) continue; int x = i % N;
        float sr = 0, sg = 0, sb = 0; int m = 0;
        int[] kom = { x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1, i >= N ? i - N : -1, i < n - N ? i + N : -1 };
        foreach (int t in kom) if (t >= 0 && ulasti[t] && (gizli[t] || kaynak[t])) { sr += R[t]; sg += G[t]; sb += Bl[t]; m++; }
        if (m > 0) { R[i] = sr / m; G[i] = sg / m; Bl[i] = sb / m; } }
    }
    for (int i = 0; i < n; i++) {
      if (!gizli[i]) continue;
      float t = W == 0 ? 0f : (d[i] > 0 && d[i] <= W ? 1f : (d[i] == W + 1 ? 0.5f : 0f));   // konturu kapalı dolguda kenar çizgisi yok
      byte[] cc = c; if (ulasti[i]) cc = new byte[] { (byte)Math.Round(Bl[i]), (byte)Math.Round(G[i]), (byte)Math.Round(R[i]) };
      int o = i * 4; for (int ch = 0; ch < 3; ch++) L[o + ch] = (byte)Math.Round(cc[ch] + (kc[ch] - cc[ch]) * t);
      L[o + 3] = (byte)(d[i] == 1 && W > 0 ? 150 : 255); eklenen++;  // dış kenar pikseli yarı saydam (tırtık azalsın); konturu kapalı dolguda tam opak
    }
    return ad + ": +" + eklenen + " px, renk " + c[2] + "," + c[1] + "," + c[0];
  }
  // kontrol noktalarından Catmull-Rom eğrisi, uçları teğet yönünde uzatılmış çoklu çizgi
  static void Egri(string egri, List<double> ex, List<double> ey) {
    var sv = egri.Split(','); int pc = sv.Length / 2; var px = new double[pc + 2]; var py = new double[pc + 2];
    for (int i = 0; i < pc; i++) { px[i + 1] = double.Parse(sv[2 * i], System.Globalization.CultureInfo.InvariantCulture); py[i + 1] = double.Parse(sv[2 * i + 1], System.Globalization.CultureInfo.InvariantCulture); }
    px[0] = 2 * px[1] - px[2]; py[0] = 2 * py[1] - py[2]; px[pc + 1] = 2 * px[pc] - px[pc - 1]; py[pc + 1] = 2 * py[pc] - py[pc - 1];
    for (int s = 1; s < pc; s++) for (int j = 0; j < 40; j++) { double t = j / 40.0, t2 = t * t, t3 = t2 * t;
      ex.Add(0.5 * (2 * px[s] + (-px[s - 1] + px[s + 1]) * t + (2 * px[s - 1] - 5 * px[s] + 4 * px[s + 1] - px[s + 2]) * t2 + (-px[s - 1] + 3 * px[s] - 3 * px[s + 1] + px[s + 2]) * t3));
      ey.Add(0.5 * (2 * py[s] + (-py[s - 1] + py[s + 1]) * t + (2 * py[s - 1] - 5 * py[s] + 4 * py[s + 1] - py[s + 2]) * t2 + (-py[s - 1] + 3 * py[s] - 3 * py[s + 1] + py[s + 2]) * t3)); }
    ex.Add(px[pc]); ey.Add(py[pc]);
    { double dx = ex[1] - ex[0], dy = ey[1] - ey[0], l = Math.Sqrt(dx * dx + dy * dy); ex.Insert(0, ex[0] - dx / l * 400); ey.Insert(0, ey[0] - dy / l * 400); }
    { int e = ex.Count - 1; double dx = ex[e] - ex[e - 1], dy = ey[e] - ey[e - 1], l = Math.Sqrt(dx * dx + dy * dy); ex.Add(ex[e] + dx / l * 400); ey.Add(ey[e] + dy / l * 400); }
  }
  static double IsaretliUzaklik(List<double> ex, List<double> ey, double qx, double qy) { double en = double.MaxValue, sg = 1;
    for (int s = 0; s + 1 < ex.Count; s++) { double ax = ex[s], ay = ey[s], bx = ex[s + 1] - ax, by = ey[s + 1] - ay, ll = bx * bx + by * by;
      double t = ll > 0 ? Math.Max(0, Math.Min(1, ((qx - ax) * bx + (qy - ay) * by) / ll)) : 0; double cx = ax + bx * t - qx, cy = ay + by * t - qy, dd = cx * cx + cy * cy;
      if (dd < en) { en = dd; sg = (bx * (qy - ay) - by * (qx - ax)) >= 0 ? 1 : -1; } }
    return sg * Math.Sqrt(en); }
  /// İki parça arasındaki kesimi yumuşak eğriye oturtur (piksel basamağı kalmasın): şekil içindeki on/arka pikselleri eğrinin
  /// iki yanına dağıtılır; sınır pikseli önde kısmi alfa, arkada tam kopya → dinlenme bileşimi değişmez.
  public string EgriKes(string on, string arka, string sekil, string egri) {
    int n = N * N; int f = Adlar.IndexOf(on), b = Adlar.IndexOf(arka); var LF = Katman[on]; var LB = Katman[arka]; var m = Sekil(sekil);
    var ex = new List<double>(); var ey = new List<double>(); Egri(egri, ex, ey);
    var sd = new Dictionary<int, double>(); int arti = 0, eksi = 0;
    for (int i = 0; i < n; i++) if (m[i] && P[i * 4 + 3] > 0 && (Sahip[i] == f || Sahip[i] == b)) { double d = IsaretliUzaklik(ex, ey, i % N + 0.5, i / N + 0.5); sd[i] = d;
      if (Sahip[i] == f && Math.Abs(d) > 2) { if (d > 0) arti++; else eksi++; } }
    double yon = arti >= eksi ? 1 : -1; int degisen = 0;
    foreach (var kv in sd) { int i = kv.Key, o = i * 4; double cov = Math.Max(0, Math.Min(1, 0.5 + yon * kv.Value));
      if (P[o + 3] < 255) cov = cov >= 0.5 ? 1 : 0;                    // yarı saydam kenar bölünemez (bileşim bozulur)
      int eskiF = LF[o + 3], eskiB = LB[o + 3];
      for (int c = 0; c < 3; c++) { LF[o + c] = P[o + c]; LB[o + c] = P[o + c]; }
      LF[o + 3] = (byte)Math.Round(P[o + 3] * cov); LB[o + 3] = cov < 1 ? P[o + 3] : (byte)0;
      Sahip[i] = cov >= 0.5 ? f : b; if (eskiF != LF[o + 3] || eskiB != LB[o + 3]) degisen++; }
    return on + "/" + arka + ": " + degisen + " px (yon " + yon + ")";
  }
  /// Gizli dolguda iki renk alanı sınırı (ör. alın akıtmasının göz altından geçen kenarı): şekil içindeki gizli dolgu,
  /// kontrol noktalarından geçen yumuşak eğrinin (Catmull-Rom) iki yanına göre, o yandaki görünür dolgunun ortanca rengiyle boyanır.
  public string IkiRenk(string ad, string sekil, string egri) {
    int n = N * N; int k = Adlar.IndexOf(ad); var L = Katman[ad]; var m = Sekil(sekil);
    var sv = egri.Split(','); int pc = sv.Length / 2; var px = new double[pc + 2]; var py = new double[pc + 2];
    for (int i = 0; i < pc; i++) { px[i + 1] = double.Parse(sv[2 * i], System.Globalization.CultureInfo.InvariantCulture); py[i + 1] = double.Parse(sv[2 * i + 1], System.Globalization.CultureInfo.InvariantCulture); }
    px[0] = 2 * px[1] - px[2]; py[0] = 2 * py[1] - py[2]; px[pc + 1] = 2 * px[pc] - px[pc - 1]; py[pc + 1] = 2 * py[pc] - py[pc - 1];
    var ex = new List<double>(); var ey = new List<double>();
    for (int s = 1; s < pc; s++) for (int j = 0; j < 40; j++) { double t = j / 40.0, t2 = t * t, t3 = t2 * t;
      ex.Add(0.5 * (2 * px[s] + (-px[s - 1] + px[s + 1]) * t + (2 * px[s - 1] - 5 * px[s] + 4 * px[s + 1] - px[s + 2]) * t2 + (-px[s - 1] + 3 * px[s] - 3 * px[s + 1] + px[s + 2]) * t3));
      ey.Add(0.5 * (2 * py[s] + (-py[s - 1] + py[s + 1]) * t + (2 * py[s - 1] - 5 * py[s] + 4 * py[s + 1] - py[s + 2]) * t2 + (-py[s - 1] + 3 * py[s] - 3 * py[s + 1] + py[s + 2]) * t3)); }
    ex.Add(px[pc]); ey.Add(py[pc]);
    // uçları teğet yönünde uzat (şeklin her yerinde işaret tanımlı olsun)
    { double dx = ex[1] - ex[0], dy = ey[1] - ey[0], l = Math.Sqrt(dx * dx + dy * dy); ex.Insert(0, ex[0] - dx / l * 400); ey.Insert(0, ey[0] - dy / l * 400); }
    { int e = ex.Count - 1; double dx = ex[e] - ex[e - 1], dy = ey[e] - ey[e - 1], l = Math.Sqrt(dx * dx + dy * dy); ex.Add(ex[e] + dx / l * 400); ey.Add(ey[e] + dy / l * 400); }
    int x0 = N, y0 = N, x1 = 0, y1 = 0; for (int i = 0; i < n; i++) if (m[i]) { int x = i % N, y = i / N; x0 = Math.Min(x0, x); x1 = Math.Max(x1, x); y0 = Math.Min(y0, y); y1 = Math.Max(y1, y); }
    x0 = Math.Max(0, x0 - 40); y0 = Math.Max(0, y0 - 40); x1 = Math.Min(N - 1, x1 + 40); y1 = Math.Min(N - 1, y1 + 40);
    Func<double, double, double> isaretli = (qx, qy) => { double en = double.MaxValue, sg = 1;
      for (int s = 0; s + 1 < ex.Count; s++) { double ax = ex[s], ay = ey[s], bx = ex[s + 1] - ax, by = ey[s + 1] - ay, ll = bx * bx + by * by;
        double t = ll > 0 ? Math.Max(0, Math.Min(1, ((qx - ax) * bx + (qy - ay) * by) / ll)) : 0; double cx = ax + bx * t - qx, cy = ay + by * t - qy, dd = cx * cx + cy * cy;
        if (dd < en) { en = dd; sg = (bx * (qy - ay) - by * (qx - ax)) >= 0 ? 1 : -1; } }
      return sg * Math.Sqrt(en); };
    var sdA = new double[(x1 - x0 + 1) * (y1 - y0 + 1)];
    var ya = new List<int>[] { new List<int>(), new List<int>() };
    for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) { int i = y * N + x; double sd = isaretli(x + 0.5, y + 0.5); sdA[(y - y0) * (x1 - x0 + 1) + x - x0] = sd;
      if (m[i] || Sahip[i] != k || P[i * 4 + 3] < 250) continue; int o = i * 4; int lum = (P[o + 2] * 3 + P[o + 1] * 6 + P[o]) / 10;
      if (lum < 110 || Math.Abs(sd) < 3 || Math.Abs(sd) > 40) continue; ya[sd < 0 ? 0 : 1].Add(i); }
    if (ya[0].Count < 50 || ya[1].Count < 50) return ad + ": ornek az (" + ya[0].Count + "/" + ya[1].Count + ")";
    var renk = new byte[2][];
    for (int s = 0; s < 2; s++) { renk[s] = new byte[3]; for (int ch = 0; ch < 3; ch++) { var d = new List<byte>(); foreach (int i in ya[s]) d.Add(P[i * 4 + ch]); d.Sort(); renk[s][ch] = d[d.Count / 2]; } }
    int boyanan = 0;
    for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) { int i = y * N + x; if (!m[i] || Sahip[i] == k) continue; int o = i * 4; if (L[o + 3] == 0) continue;
      int lum = (L[o + 2] * 3 + L[o + 1] * 6 + L[o]) / 10; if (lum < 110) continue;       // kontur bandı korunur
      double t = Math.Max(0, Math.Min(1, 0.5 + sdA[(y - y0) * (x1 - x0 + 1) + x - x0] / 1.5));
      for (int ch = 0; ch < 3; ch++) L[o + ch] = (byte)Math.Round(renk[0][ch] + (renk[1][ch] - renk[0][ch]) * t); boyanan++; }
    return ad + ": " + boyanan + " px, renkler " + renk[0][2] + "," + renk[0][1] + "," + renk[0][0] + " / " + renk[1][2] + "," + renk[1][1] + "," + renk[1][0];
  }
  /// Eklem payı (omuz/kalça kapağı): şekil içinde ARKADAKİ parçalara ait pikselleri bu parçaya özgün hâliyle kopyalar,
  /// şeklin kenarına doğru saydamlaşır. Dinlenmede bileşim değişmez; parça dönünce eklemde boşluk görünmez.
  public string Kapak(string ad, string sekil, int bant) {
    int n = N * N; int k = Adlar.IndexOf(ad); int zk = Z[ad]; var L = Katman[ad]; var m = Sekil(sekil);
    // şeklin dışına uzaklık (içeride), bant'a kadar
    var d = new int[n]; var q = new int[n]; int bas = 0, son = 0;
    for (int i = 0; i < n; i++) { d[i] = -1; if (!m[i]) continue; int x = i % N;
      bool kenar = x == 0 || x == N - 1 || i < N || i >= n - N || !m[i - 1] || !m[i + 1] || !m[i - N] || !m[i + N]; if (kenar) { d[i] = 1; q[son++] = i; } }
    while (bas < son) { int j = q[bas++]; if (d[j] >= bant) continue; int x = j % N;
      int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
      foreach (int t in kom) if (t >= 0 && m[t] && d[t] < 0) { d[t] = d[j] + 1; q[son++] = t; } }
    int eklenen = 0;
    for (int i = 0; i < n; i++) {
      if (!m[i] || Sahip[i] < 0 || Sahip[i] == k) continue;
      if (Z[Adlar[Sahip[i]]] >= zk) continue;            // yalnız arkadaki parçaların pikselleri
      if (L[i * 4 + 3] > 0) continue;
      if (P[i * 4 + 3] < 250 || Koyu(i, 150)) continue;   // yalnız açık dolgu: kontur/kenar parçası kola taşınmasın
      float t = d[i] < 0 ? 1f : Math.Min(1f, d[i] / (float)bant);
      int o = i * 4; for (int c = 0; c < 3; c++) L[o + c] = P[o + c]; L[o + 3] = (byte)Math.Round(P[o + 3] * t); eklenen++;
    }
    return ad + " kapak: +" + eklenen + " px";
  }

  /// Çizgisiz kesim yumuşatması: ön parçanın, arka parçaya dolgu üzerinden değen kenarında bant px'lik geçiş.
  /// Bantta ön parça saydamlaşır, arka parça özgün pikseli taşır → dinlenmede bileşim özgünle aynı.
  public string Yumusat(string on, string arka, int bant) {
    int n = N * N; int f = Adlar.IndexOf(on), b = Adlar.IndexOf(arka); var LF = Katman[on]; var LB = Katman[arka];
    var d = new int[n]; for (int i = 0; i < n; i++) d[i] = -1; var q = new int[n]; int bas = 0, son = 0;
    Func<int, bool> dolguF = i => Sahip[i] == f && !Koyu(i, 95) && P[i * 4 + 3] > 200;
    for (int i = 0; i < n; i++) if (Sahip[i] == b && !Koyu(i, 95) && P[i * 4 + 3] > 200) { int x = i % N;
      int[] kom = { x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1, i >= N ? i - N : -1, i < n - N ? i + N : -1 };
      foreach (int t in kom) if (t >= 0 && d[t] < 0 && dolguF(t)) { d[t] = 1; q[son++] = t; } }
    int temas = son;
    while (bas < son) { int j = q[bas++]; if (d[j] >= bant) continue; int x = j % N;
      int[] kom = { x > 0 ? j - 1 : -1, x < N - 1 ? j + 1 : -1, j >= N ? j - N : -1, j < n - N ? j + N : -1 };
      foreach (int t in kom) if (t >= 0 && d[t] < 0 && Sahip[t] == f) { d[t] = d[j] + 1; q[son++] = t; } }
    for (int k = 0; k < son; k++) { int i = q[k]; int o = i * 4; float t = (d[i] - 0.5f) / bant;
      LF[o + 3] = (byte)Math.Round(P[o + 3] * t); for (int c = 0; c < 4; c++) LB[o + c] = P[o + c]; }
    return on + "/" + arka + ": temas " + temas + " px, bant " + son + " px";
  }
  /// piksel, parçanın başka bir parçaya ya da koyu çizgiye 3 px'ten yakın değil mi (kenar karışımı kaynak olmasın)
  bool KenarUzak(int i, int k) { int x = i % N, y = i / N;
    for (int dy = -3; dy <= 3; dy += 3) for (int dx = -3; dx <= 3; dx += 3) { int xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= N || yy >= N) return false;
      int j = yy * N + xx; if (Sahip[j] != k || P[j * 4 + 3] < 250) return false; int o = j * 4; if ((P[o + 2] * 3 + P[o + 1] * 6 + P[o]) / 10 < 100) return false; }
    return true; }
  static byte[] Hex(string h) { h = h.TrimStart('#'); return new byte[] { Convert.ToByte(h.Substring(4, 2), 16), Convert.ToByte(h.Substring(2, 2), 16), Convert.ToByte(h.Substring(0, 2), 16) }; } // BGR
  byte[] Ortanca(int k) {
    var r = new List<int>(); var g = new List<int>(); var b = new List<int>();
    for (int i = 0; i < N * N; i += 3) if (Sahip[i] == k && P[i * 4 + 3] > 250) { int o = i * 4; int lum = (P[o + 2] * 3 + P[o + 1] * 6 + P[o]) / 10; if (lum < 110) continue; b.Add(P[o]); g.Add(P[o + 1]); r.Add(P[o + 2]); }
    if (r.Count == 0) return new byte[] { 200, 200, 200 };
    r.Sort(); g.Sort(); b.Sort(); int m = r.Count / 2; return new byte[] { (byte)b[m], (byte)g[m], (byte)r[m] };
  }

  /// gizli ek katman: kapalı göz yayları. yaylar: "x1,y1,x2,y2,sarkma;..." (tuval), kalınlık px
  public void Yay(string ad, string yaylar, string renk, float kalinlik) {
    using (var b = new Bitmap(N, N, PixelFormat.Format32bppArgb)) {
      using (var g = Graphics.FromImage(b)) {
        g.Clear(Color.Transparent); g.SmoothingMode = SmoothingMode.AntiAlias;
        var c = Hex(renk); using (var kalem = new Pen(Color.FromArgb(255, c[2], c[1], c[0]), kalinlik)) {
          kalem.StartCap = LineCap.Round; kalem.EndCap = LineCap.Round;
          foreach (var t in yaylar.Split(';')) { var v = Sayilar(t); float mx = (v[0] + v[2]) / 2, my = (v[1] + v[3]) / 2 + v[4] * 2f;
            g.DrawBezier(kalem, v[0], v[1], (v[0] + mx) / 2, my, (mx + v[2]) / 2, my, v[2], v[3]); } }
      }
      Katman[ad] = Oku(b);
    }
  }

  /// gizli ek çizimi: şekil(ler)i dolgu + kontur ile katmana çizer (katman yoksa oluşturur). sekil: "e:..;p:.." (tuval)
  public void Boya(string ad, string sekil, string dolgu, string kontur, float kalinlik) {
    if (!Katman.ContainsKey(ad)) Katman[ad] = new byte[N * N * 4];
    using (var b = new Bitmap(N, N, PixelFormat.Format32bppArgb)) {
      var L = Katman[ad];
      var d0 = b.LockBits(new Rectangle(0, 0, N, N), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb); Marshal.Copy(L, 0, d0.Scan0, L.Length); b.UnlockBits(d0);
      using (var g = Graphics.FromImage(b)) {
        g.SmoothingMode = SmoothingMode.AntiAlias; var c = Hex(dolgu); var k = Hex(kontur);
        using (var fir = new SolidBrush(Color.FromArgb(255, c[2], c[1], c[0]))) using (var kal = new Pen(Color.FromArgb(255, k[2], k[1], k[0]), kalinlik)) {
          kal.LineJoin = LineJoin.Round;
          foreach (var t in sekil.Split(';')) { var s = t.Trim(); if (s.Length < 3) continue; var v = Sayilar(s.Substring(2));
            using (var yol = new GraphicsPath()) {
              if (s[0] == 'e') yol.AddEllipse(v[0] - v[2], v[1] - v[3], v[2] * 2, v[3] * 2);
              else { var pts = new PointF[v.Length / 2]; for (int j = 0; j < pts.Length; j++) pts[j] = new PointF(v[2 * j], v[2 * j + 1]); yol.AddClosedCurve(pts, 0.5f); }
              g.FillPath(fir, yol); if (kalinlik > 0) g.DrawPath(kal, yol); } }
        }
      }
      Katman[ad] = Oku(b);
    }
  }
  public string KatmanYaz(string ad, string yol) { Yaz(Katman[ad], N, N, yol); return yol; }

  /// sahiplik haritası: her parça bir renk, kaynağın koyu pikselleri koyulaştırılmış (sınır kontrolü için)
  public void Harita(string yol) {
    int[][] renk = { new[]{230,80,80}, new[]{80,160,230}, new[]{90,200,90}, new[]{230,180,60}, new[]{170,90,220}, new[]{60,200,200}, new[]{240,120,190}, new[]{140,140,60}, new[]{100,100,230}, new[]{220,140,90}, new[]{150,220,160} };
    var o1 = new byte[N * N * 4];
    for (int i = 0; i < N * N; i++) { int o = i * 4;
      if (Sahip[i] < 0) { o1[o] = o1[o + 1] = o1[o + 2] = 255; o1[o + 3] = 255; continue; }
      var c = renk[Sahip[i] % renk.Length]; float lum = (P[o + 2] * 0.3f + P[o + 1] * 0.59f + P[o] * 0.11f) / 255f; float k = 0.35f + 0.65f * lum;
      o1[o + 2] = (byte)(c[0] * k); o1[o + 1] = (byte)(c[1] * k); o1[o] = (byte)(c[2] * k); o1[o + 3] = 255; }
    Yaz(o1, N, N, yol);
  }
  /// dolgu bileşenlerini (verilen koyu eşiğiyle) rastgele renkle boyar; en büyük 12 bileşenin boyutu döner
  public string Bilesenler(int koyuEsik, string yol) {
    int n = N * N; var dolu = new bool[n]; for (int i = 0; i < n; i++) dolu[i] = P[i * 4 + 3] >= 8 && !Koyu(i, koyuEsik);
    var etk = new int[n]; var q = new int[n]; int no = 0; var boy = new List<int> { 0 };
    for (int s = 0; s < n; s++) { if (!dolu[s] || etk[s] != 0) continue; no++; int bas = 0, son = 0; q[son++] = s; etk[s] = no;
      while (bas < son) { int j = q[bas++]; int x = j % N;
        if (x > 0 && dolu[j - 1] && etk[j - 1] == 0) { etk[j - 1] = no; q[son++] = j - 1; }
        if (x < N - 1 && dolu[j + 1] && etk[j + 1] == 0) { etk[j + 1] = no; q[son++] = j + 1; }
        if (j >= N && dolu[j - N] && etk[j - N] == 0) { etk[j - N] = no; q[son++] = j - N; }
        if (j < n - N && dolu[j + N] && etk[j + N] == 0) { etk[j + N] = no; q[son++] = j + N; } }
      boy.Add(son); }
    var o1 = new byte[n * 4]; var rnd = new Random(3); var rk = new byte[no + 1, 3]; for (int k = 1; k <= no; k++) for (int c = 0; c < 3; c++) rk[k, c] = (byte)(60 + rnd.Next(190));
    for (int i = 0; i < n; i++) { int o = i * 4; o1[o + 3] = 255; if (etk[i] > 0) { o1[o] = rk[etk[i], 0]; o1[o + 1] = rk[etk[i], 1]; o1[o + 2] = rk[etk[i], 2]; } else if (P[o + 3] >= 8) { o1[o] = o1[o + 1] = o1[o + 2] = 0; } else { o1[o] = o1[o + 1] = o1[o + 2] = 255; } }
    Yaz(o1, N, N, yol);
    var sirali = new List<int>(boy); sirali.Sort(); sirali.Reverse(); var s2 = new List<string>(); for (int k = 0; k < Math.Min(12, sirali.Count); k++) s2.Add(sirali[k].ToString());
    return "bilesen: " + no + " | en buyukler: " + string.Join(",", s2.ToArray());
  }
  public string Lejant() { var s = new List<string>(); for (int k = 0; k < Adlar.Count; k++) s.Add(k + "=" + Adlar[k]); return string.Join(" ", s.ToArray()); }

  /// dinlenme bileşimi (arkadan öne, gizliler hariç) ile kaynak farkı
  public string Dogrula(string arkadanOne, string cikti) {
    int n = N * N; var c = new float[n * 4];
    foreach (var ad in arkadanOne.Split(',')) { var L = Katman[ad.Trim()];
      for (int i = 0; i < n; i++) { int o = i * 4; float a = L[o + 3] / 255f; if (a <= 0) continue;
        for (int ch = 0; ch < 3; ch++) c[o + ch] = L[o + ch] * a + c[o + ch] * (1 - a); c[o + 3] = a + c[o + 3] * (1 - a); } }
    int fark = 0; var out1 = new byte[n * 4]; var farkH = new byte[n * 4];
    for (int i = 0; i < n; i++) { int o = i * 4; float a = c[o + 3];
      for (int ch = 0; ch < 3; ch++) out1[o + ch] = (byte)Math.Round(Math.Min(255f, c[o + ch] + 255 * (1 - a)));
      out1[o + 3] = 255;
      float ka = P[o + 3] / 255f; int m = 0;
      for (int ch = 0; ch < 3; ch++) { float kv = P[o + ch] * ka + 255 * (1 - ka); m = Math.Max(m, (int)Math.Abs(kv - out1[o + ch])); }
      byte gri = (byte)(out1[o] / 2 + 100); farkH[o] = gri; farkH[o + 1] = gri; farkH[o + 2] = gri; farkH[o + 3] = 255;
      if (m > 40) { fark++; farkH[o] = 0; farkH[o + 1] = 0; farkH[o + 2] = 255; } }
    Yaz(out1, N, N, cikti); Yaz(farkH, N, N, cikti.Replace(".png", "-fark.png"));
    return "dinlenme farki: " + fark + " px (>40)";
  }
}
