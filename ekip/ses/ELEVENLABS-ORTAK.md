# ElevenLabs ortak ses envanteri

**ElevenLabs’ta replik uzunluğu · 15 Kasım 2026.** Uzun paragraflar ses kalitesini düşürdüğü için metni ses üretiminden önce doğal duraklardan bölün. Her parçayı ayrı bir ElevenLabs isteğiyle seslendirin. Bir parça en fazla üç kısa cümle içerebilir. Tek cümlelik bir replik tek başına kaydedilebilir. Bu kural oyun, çizgi film, kitap ve etkinliklerdeki tüm karakter ve anlatıcı sesleri için geçerlidir.

2026-11-06: Yerel dosyalardan kurtarılan eşleştirmeler. Hesap üzerinden henüz doğrulanmadı; yerelde API anahtarı yok. Anahtar bu dosyaya veya sohbetlere yazılmaz. Tüm ekip ELEVENLABS_API_KEY kullanır.

| Karakter | Voice ID |
|---|---|
| anlatici | ft8ETnGK5wfQHpkjnVP2 |
| kino | mnd0d7jTJaLJl0qbeAyG |
| anne | WqGM7U04GnQsqgVyumSY |
| baba | BPGao31oIDrNIkpHSZGL |
| lokum | k4FgffsVVBqLkYX9lS2v |
| babaanne | eFLhEWprT6lK0nO7xQtw |
| dede | IDXxPYTQNZ9qnoBgBvbH |
| mino | 12iZbH1fuWoWnJWOJZ1W |
| nehir | IXH6rJkyynxn3lD5O7yQ |
| bidik | gXsMWz0XRvtPDZitHMkd |
| bidicik | srpMpX0gd4MeawzKMJwC |
| lokumun-arkadasi | srpMpX0gd4MeawzKMJwC |
| seftali-patisi | srpMpX0gd4MeawzKMJwC |
| bidik-baba | yunBEZzZP7dVOPKOFHgX |
| tuhaf-teyze | bZkL6S2LOLDywNXYyrNk |
| palyaco-tavsan | Ym8UraPAeEVc7BphgK3C |
| zipzip | zCieqqNJvrBIGmXON5an |
| zipzip-erkek | zCieqqNJvrBIGmXON5an |
| kelime-yutan-tavsan | 9cnHYPv4XMmx4NVWn178 |
| tombi | rI3n1hS7mby0ND3tKl1u |
| bulut | ZyHU3tm4hc4VPnxh6jni |
| disci | 0b0ZDvYSNwuOMaEfkt1z |

Kaynak: content/film2/sesler.json. Kitap konuşmacıları: content/kitap-ses.json.

Belirsizlikler:
- Oyun Kino: eoOuf4kLj2cCEuSIJD4C; film/kitap Kino: mnd0d7jTJaLJl0qbeAyG. Barışa soruldu; değiştirilmedi.
- Kitap öğretmeni Nehir sesini, çocuklar Zıpzıp sesini kullanıyor. Ayrı ses olup olmadığı doğrulanacak.
- Oyunun genel anlatım sesi U5Yg9Cl0WUYCovjolhzm, film anlatıcısı ft8ETnGK5wfQHpkjnVP2.
- Dosyalarda eleven_v4 yazıyor; API model listesiyle doğrulanmadan üretim başlatılmamalı.

Henüz ses üretilmedi; kredi harcanmadı.

## 2026-11-06 — Canlı API doğrulaması
Bağlantı başarılı. Hesapta 53 ses var; 20 karakterin tamamı bulundu. eleven_v4 modeli API tarafından destekleniyor.
Barış Kino için film/kitap sesini onayladı: mnd0d7jTJaLJl0qbeAyG (Kino 5 yaş). content/seslendirme.json güncellendi. Önceki çelişki çözüldü. Eski MP3 kayıtları değiştirilmedi; yeniden üretim yapılmadı.

Tüm yerel ajanlar anahtarı ekrana yazdırmadan şu komutla kendi işlemlerine yükleyebilir:
```powershell
. ./scripts/elevenlabs-ortam.ps1
```
Anahtar masaüstündeki api key elevenlabs.txt dosyasından okunur. Betik anahtar içermez. Üretim betiği aynı PowerShell işleminde çağrılmalıdır.

| Karakter | ElevenLabs hesap adı |
|---|---|
| anlatici | Anlatıcı kadın |
| kino | Kino 5 yaş |
| anne | kino anne yeni bunu kullan |
| baba | kino dad |
| lokum | Kinos sister |
| babaanne | grandma |
| dede | Cartoon grandpa |
| mino | mino (7 Kasım 2026 tarihinde kullanıcı tarafından Mino karakteri için seçildi ve hesapta doğrulandı) |
| nehir | ati Dükkânı’ndan Nehir abla |
| bidik | yan karakter komik |
| bidicik | Bıdık Bebek |
| lokumun-arkadasi | Bıdık Bebek (Lokum’un erkek bebek arkadaşı için kullanıcı seçimi) |
| seftali-patisi | Bıdık Bebek (Mila, Lokum’un yavru kedi arkadaşı) |
| bidik-baba | komşu keçi büyük |
| tuhaf-teyze | tuhaf kadın karakter |
| palyaco-tavsan | joker tarzı palyaço sesli yan karakter erkek |
| zipzip | zıpzıp erkek (10 Kasım 2026, kullanıcı tarafından doğrulandı) |
| zipzip-erkek | zıpzıp erkek |
| kelime-yutan-tavsan | tatlı kelime  yutan çocuk karakter rabbit kız |
| tombi | Tombi (ayı yavrusu, 6 yaş, tok sesli oğlan) |
| bulut | Bulut (kuzu, 5 yaş, utangaç oğlan) |
| disci | dentist |
