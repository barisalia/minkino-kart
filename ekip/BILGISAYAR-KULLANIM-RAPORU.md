# Bilgisayar kullanım raporu

20 Kasım 2026, 18:20–19:45 arası ölçüldü. Amaç, yeni masaüstü kasa seçilirken şu anki dizüstünün gerçek iş yükünü göstermek. Bütün sayılar bu bilgisayarda ölçüldü; ölçülemeyen yerler ayrıca yazıldı.

## Özet

- **En çok zorlanan parça işlemci.** 16 çekirdeğin 14'ünü arka planda çalışan Blender tek başına dolduruyor. Üstüne tarayıcı testleri, yapay zekâ oturumları ve antivirüs biniyor.
- **Bellek yetmiyor.** Programların istediği bellek 37,6 GB, takılı bellek 32 GB. Fark diske taşıyor.
- **Ekran kartı ve disk rahat.** Ekran kartı çoğu zaman %7–19 yükte, bellek kullanımı en çok 4,1 GB. Disk yarı boş ve yükü düşük.
- **Isınmanın nedeni sürekli yük.** Bilgisayar saatlerce toplam 100 watt civarında çalışıyor. Bu, ince bir dizüstü kasası için sürekli tam yük demek.
- **Dizüstü şu an kendi gücünün altında çalışıyor.** Şarj adaptörünün ucu değiştiği için bilgisayar adaptörü zayıf sayıyor ve işlemciyi 45 watta tutuyor. Aşağıdaki hız sayıları bu kısıtla ölçüldü.

## Şu anki bilgisayar

| Parça | Değer |
|---|---|
| Model | Lenovo Legion Pro 5 16ADR10 (83LT) |
| İşlemci | AMD Ryzen 9 8940HX, 16 çekirdek / 32 iş parçacığı |
| Bellek | 32 GB (2 × 16 GB DDR5 5200), iki yuva da dolu, bilgisayarın bildirdiği üst sınır 32 GB |
| Ekran kartı | NVIDIA RTX 5070 Laptop, 8 GB bellek |
| Disk | 1 TB NVMe SSD (Samsung), 492 GB boş |
| Ekran | 2560 × 1600, 240 Hz |
| Sistem | Windows 11 Home, ölçüm sırasında 22 saattir açık |

## Ne iş yapılıyor

Bilgisayarda aynı anda birçok yapay zekâ ajanı çalışıyor. Ajanların zekâ kısmı bulutta, ama verdikleri işler bu bilgisayarda dönüyor:

- **Blender, penceresiz ve arka planda.** Ajanlar bir 3D oyun projesi için Blender'ı komut satırından Python betikleriyle çalıştırıyor. Ölçüm sırasında iki Blender açıktı.
- **Tarayıcı testleri.** Oyun testleri için penceresiz Edge açılıyor (Playwright). Ölçümde 57 Edge işlemi vardı, kullanıcının açtığı Edge penceresi yoktu.
- **Ajan uygulamaları.** 20 Claude işlemi, 15 ChatGPT işlemi, 10 Antigravity işlemi, 4 Codex işlemi, 20 Node işlemi, 14 kabuk.
- **Toplam:** 468 işlem, 11.349 iş parçacığı.

## Ölçümler

### İşlemci

| Ölçüm | Değer |
|---|---|
| Yük (40 saniyede 8 ölçüm) | %43–78 |
| Çekilen güç | 44–46 watt, hiç değişmiyor |
| Hız | taban hızın %77–114'ü (yaklaşık 1,85–2,75 GHz) |
| Fiş çekilip pilde ölçülen güç | yine 45 watt |

İşlemciyi kullananlar (12 saniyelik ortalama, çekirdek sayısı olarak):

| Program | Çekirdek |
|---|---|
| Blender | 14,0 |
| Edge (testler) | 2,0 |
| Antigravity | 1,3 |
| Norton (iki işlem toplamı) | 2,2 |
| Claude | 0,9 |
| Windows çekirdeği | 0,6 |
| Diğerleri | 2 civarı |

Güç fişte ve pilde aynı 45 watt çıktı. Lenovo'nun kendi kaydı da adaptörü "yüksek güce uygun değil" gösteriyor (`IsACFitForOC` = 0). Bilgisayarın kutusundan 245 wattlık adaptör çıkıyor.

### Bellek

| Ölçüm | Değer |
|---|---|
| Takılı | 32 GB |
| Boş kalan | 8,4–10,1 GB |
| Programların istediği toplam (taahhüt) | 34,7–37,6 GB |
| Taahhüt sınırı (bellek + sayfa dosyası) | 42,9 GB |
| Diskten geri okuma | saniyede 0–67 sayfa |

Belleği en çok tutanlar (programa özel bellek):

| Program | Adet | Bellek |
|---|---|---|
| Claude | 20 | 6,0 GB |
| ChatGPT | 15 | 4,3 GB |
| Edge (testler) | 57 | 3,6 GB |
| Blender | 2 | 2,6 GB |
| Node | 20 | 2,3 GB |
| Chrome | 21 | 2,2 GB |
| Codex | 4 | 1,5 GB |

### Ekran kartı

| Ölçüm | Değer |
|---|---|
| Yük | çoğu zaman %7–19, bir ölçümde %87 |
| Bellek kullanımı | 1,9–4,1 GB (toplam 8 GB) |
| Çekilen güç | 24–60 watt |
| Sıcaklık | 70–75 °C |

Ekran kartı belleğini en çok pencere yöneticisi (1,2 GB) ve Blender (1,1 GB) kullanıyor.

### Disk

Yük düşük (%0–27), kuyruk sıfır. 952 GB'ın 492 GB'ı boş.

### Isı ve güç

- Pilde ölçülen toplam çekiş 96–105 watt. Bilgisayar bu yükte saatlerce çalışıyor.
- Ekran kartı neredeyse boşken 70 °C. Kasa sıcak.
- Son 30 günde ısıdan ya da başka nedenle beklenmedik kapanma kaydı yok.
- Windows'ta "işlemci hızı sınırlandı" kaydı yok.

## Ölçülemeyenler

- **İşlemci sıcaklığı.** Lenovo'nun sıcaklık değeri bu modelde 0 döndü. Isınmanın işlemciyi ayrıca kısıp kısmadığı bilinmiyor.
- **Sağlam adaptörle hız.** Adaptör düzelince işlemcinin kaç watta çıkacağı ölçülmedi.
- **Başka günler.** Bu tek bir akşamın ölçümü. Blender'ın her gün bu kadar çalışıp çalışmadığı bilinmiyor.

## Yeni kasa için ölçümlerden çıkanlar

Bunlar yalnız yukarıdaki ölçümlere dayanıyor. Fiyat ve piyasa araştırması yapılmadı.

| Parça | Ölçüm ne diyor |
|---|---|
| İşlemci | En önemli parça. İş yükü çok çekirdekli ve sürekli: tek bir Blender 14 çekirdek istiyor, yanında 6–8 çekirdeklik başka iş dönüyor. Çekirdek sayısı ve sürekli yükte soğutma belirleyici. |
| Bellek | 64 GB gerekli. Bugünkü istek 37,6 GB ve 32 GB'a sığmıyor. Bellek hızının bu işte fark ettiğine dair bir ölçüm yok. |
| Ekran kartı | Bugünkü işte darboğaz değil. Kullanım düşük, bellek 4,1 GB'ı geçmedi. Daha güçlü kart ancak Blender'da ekran kartıyla render, oyun ya da bilgisayarda yapay zekâ modeli çalıştırma planı varsa anlamlı. |
| Disk | Darboğaz değil. 460 GB dolu, 2 TB rahat yeter. |
| Soğutma | Sürekli tam yükte çalışılacağı için önemli. Dizüstünün asıl sıkıntısı burada. |

Kasadan bağımsız iki bulgu:

- **Norton sürekli 2 çekirdekten fazla kullanıyor.** Ajanlar çok dosya okuyup yazdığı için her dosyayı tarıyor. Yeni kasada da aynısı olur.
- **Blender'ın işi işlemcide dönüyor.** Ekran kartı boş dururken 14 çekirdek dolu. Betiklerdeki iş ekran kartına alınabiliyorsa işlemci rahatlar.
