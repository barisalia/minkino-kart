const hikaye = {
  "B1": {
    "title": "Sabah kapıda",
    "lines": [
      {
        "who": "anne",
        "text": "Kino! Bak pencereden gördüm, Mino’yla Zıpzıp parka çıktı bile! Hadi çık, ben de pencereden sana bakıyorum."
      },
      {
        "who": "kino",
        "text": "Yaşasın! Gidip saklambaç oynayalım diyeceğim!"
      },
      {
        "who": "lokum",
        "text": "Abi gitme! Bak çuf çuf getirdim, gel beraber oynayalım! Köprü hep düşüyor..."
      },
      {
        "who": "kino",
        "text": "Ama Lokum, şimdi gitmezsem Mino’yla Zıpzıp bensiz oyuna başlar..."
      }
    ],
    "question": "Kino şimdi ne yapsın?",
    "choices": [
      {
        "code": "1A",
        "label": "Parka çık",
        "target": "B2A",
        "action": "\"Söz dönünce oynayacağız\" de ve hemen parka çık",
        "say": "Dönünce oynayacağız Lokum, söz!",
        "withLokum": false
      },
      {
        "code": "1B",
        "label": "Trenle oyna",
        "target": "B1_5",
        "action": "\"Beş dakikacık oynayayım\" de ve halıya otur",
        "say": "Beş dakikacık oynayayım."
      }
    ]
  },
  "B1_5": {
    "title": "Minder tüneli",
    "lines": [
      {
        "who": "lokum",
        "text": "Çuuuf! Abi bak, tren tünele girdi! Bir daha sür!"
      },
      {
        "who": "kino",
        "text": "Aa! Benim Mino’larla parkta buluşmam vardı! Ama tren de çok güzel oldu... Şimdi ne yapsam?"
      }
    ],
    "question": "Kino ne yapsın?",
    "choices": [
      {
        "code": "1.5A",
        "label": "Yalnız git",
        "target": "B2B",
        "action": "Lokum’a \"Sen burada kal\" de ve yalnız parka koş",
        "say": "Sen burada kal Lokum. Ben parka gidiyorum.",
        "withLokum": false
      },
      {
        "code": "1.5B",
        "label": "Lokum’la git",
        "target": "B2B",
        "action": "Lokum’u elinden tutup beraber parka götür",
        "say": "Elimi tut Lokum. Beraber gidelim!",
        "withLokum": true
      },
      {
        "code": "1.5C",
        "label": "Evde oyna",
        "target": "B2C",
        "action": "\"Ben burada biraz daha oynayayım!\" de ve oyuna devam et",
        "say": "Tren çok güzel oldu, ben burada biraz daha oynayayım!",
        "withLokum": true
      }
    ]
  },
  "B2A": {
    "title": "Parkta buluşma",
    "lines": [
      {
        "who": "mino",
        "text": "Yaşasın, Kino hemen geldi! Şimdi ne oynayacağımızı beraber seçebiliriz! Hadi saklambaç oynayalım!"
      },
      {
        "who": "zipzip",
        "text": "Hayır, iki ağacın arasını kale yapıp maç oynayalım! Kino, iyi ki erken geldin, hadi sen seç: Saklambaç mı, top mu?"
      }
    ],
    "question": "Hangi oyunu oynasınlar?",
    "choices": [
      {
        "code": "2A-1",
        "label": "Saklambaç oyna",
        "target": "B3A",
        "action": "\"Saklambaç oynayalım!\"",
        "say": "Saklambaç oynayalım!"
      },
      {
        "code": "2A-2",
        "label": "Top oyna",
        "target": "B3B",
        "action": "\"Top (Maç) oynayalım!\"",
        "say": "Top oynayalım!"
      }
    ]
  },
  "B2B": {
    "title": "Maç başlamış",
    "lines": [
      {
        "who": "kino",
        "text": "Aa... Oyuna başlamışsınız bile! Hani beraber seçecektik? Ben saklambaç oynamak istiyordum..."
      },
      {
        "who": "mino",
        "text": "Seni bekledik Kino ama sen gelmeyince Zıpzıp top oynamaya başladı..."
      },
      {
        "who": "zipzip",
        "text": "Evet, geciktin Kino! Şutları ben çekiyorum. İstersen sen çalıların arkasına kaçan topları toplayıp bize at!"
      },
      {
        "who": "lokum",
        "text": "Abi, niye topu bize vermiyorlar?",
        "onlyLokum": true
      }
    ],
    "question": "Kino şimdi ne yapsın?",
    "choices": [
      {
        "code": "2B-1",
        "label": "Mino’yla saklan",
        "target": "B3A",
        "action": "Mino’yu ikna et: \"Top toplamam! Mino, gel saklambaç oynayalım!\"",
        "say": "Top toplamam! Mino, gel saklambaç oynayalım!"
      },
      {
        "code": "2B-2",
        "label": "Maça katıl",
        "target": "B3B",
        "action": "Maça katıl: \"Önce kaçan topu tutarım, sonra şutu ben çekerim!\"",
        "say": "Önce kaçan topu tutarım, sonra şutu ben çekerim!"
      },
      {
        "code": "2B-3",
        "label": "Küsüp dön",
        "target": "B2B_KUS",
        "action": "Üzülüp küsüp dön: \"Bensiz başladıysanız ben de oynamıyorum!\"",
        "say": "Bensiz başladıysanız ben de oynamıyorum!"
      }
    ]
  },
  "B2B_KUS": {
    "title": "Bahçe kapısı",
    "lines": [
      {
        "who": "kino",
        "text": "Bensiz maça başladılar... Hiç eğlenceli değil. Odamıza mı gitsem, yoksa arka bahçeye Dede’nin yanına mı geçsem?"
      }
    ],
    "question": "Kino nereye gitsin?",
    "choices": [
      {
        "code": "2B-KA",
        "label": "Odana git",
        "target": "ERKEN2",
        "action": "Doğrudan eve gir ve odana git",
        "say": "Ben odama gidiyorum."
      },
      {
        "code": "2B-KB",
        "label": "Bahçeye geç",
        "target": "B3C",
        "action": "Üzüntüyü unut, arka bahçeye Dede ve Lokum’un yanına geç",
        "say": "Dede! Bekle, ben de geliyorum!"
      }
    ]
  },
  "B2C": {
    "title": "Kurabiye kokusu",
    "lines": [
      {
        "who": "anne",
        "text": "Kino, Lokum! Fırından taze kurabiye çıktı, sütlerinizi de koydum!"
      },
      {
        "who": "dede",
        "text": "Hava dışarıda çok güzel çocuklar, bahçeyi sulayacağım, gelin treninizi bahçeye çıkarın!"
      },
      {
        "who": "lokum",
        "text": "Abi, kurabiye mi yiyelim, bahçeye mi çıkalım?"
      }
    ],
    "question": "Kino ve Lokum ne yapsın?",
    "choices": [
      {
        "code": "2C-1",
        "label": "Kurabiye taşı",
        "target": "ERKEN1",
        "action": "\"İçeride kalalım, trenimiz mutfaktan kurabiye taşısın!\"",
        "say": "İçeride kalalım, trenimiz mutfaktan kurabiye taşısın!"
      },
      {
        "code": "2C-2",
        "label": "Treni bahçeye çıkar",
        "target": "B3C",
        "action": "\"Trenimizi alıp Dede’yle arka bahçeye çıkalım!\"",
        "say": "Trenimizi alıp Dede’yle arka bahçeye çıkalım!"
      }
    ]
  },
  "B3A": {
    "title": "Saklambaç",
    "lines": [
      {
        "who": "zipzip",
        "text": "Bir, iki, üç, dört... On olunca geliyorum, sağım solum sobe!"
      },
      {
        "who": "mino",
        "text": "Kino! Çabuk kaydırağın arkasındaki çalıya gel!"
      },
      {
        "who": "kino",
        "text": "Çalıya mı saklansam, yoksa şu örtülü salıncak koltuğun içine mi girsem? Orada kimse beni bulamaz!"
      }
    ],
    "question": "Kino nereye saklansın?",
    "choices": [
      {
        "code": "3A-1",
        "label": "Çalıya saklan",
        "target": "SON1",
        "action": "Mino’nun yanına, kaydırağın arkasındaki çalıya saklan ve sobele!",
        "say": "Mino, bekle beni!"
      },
      {
        "code": "3A-2",
        "label": "Salıncağa saklan",
        "target": "ERKEN3",
        "action": "Kimse bulamasın diye salıncak koltuğun örtüsü altına saklan!",
        "say": "Şu örtünün altına saklanayım!"
      }
    ]
  },
  "B3B": {
    "title": "Çamurdaki top",
    "lines": [
      {
        "who": "zipzip",
        "text": "Eyvah! Top çamur göletinin ortasına kaçtı! Şimdi kim çıkaracak onu?"
      },
      {
        "who": "kino",
        "text": "Koşup doğrudan çamurun içindeki topa mı vursam, yoksa yerdeki uzun dalla topu çekip kurtarsam mı?"
      }
    ],
    "question": "Kino topu nasıl alsın?",
    "choices": [
      {
        "code": "3B-1",
        "label": "Çamura gir",
        "target": "ERKEN4",
        "action": "Hiç beklemeden koşup çamurun içindeki topa vur!",
        "say": "Topa buradan vurabilirim!"
      },
      {
        "code": "3B-2",
        "label": "Dalla çek",
        "target": "SON2",
        "action": "Yerdeki uzun dal parçasıyla topu çamurdan çekip kurtar!",
        "say": "Bu dalla topu çekebilirim!"
      }
    ]
  },
  "B3C": {
    "title": "Erik ağacının altında",
    "lines": [
      {
        "who": "bulut",
        "text": "Kino, çadırınız çok güzel olmuş! Gel önüne tren yolunu ve su taslarını dizelim!"
      },
      {
        "who": "lokum",
        "text": "Abi, çadırın içinde bana resimli kitaptan masal okur musun?"
      }
    ],
    "question": "Bahçede ne yapsınlar?",
    "choices": [
      {
        "code": "3C-1",
        "label": "Masal anlat",
        "target": "ERKEN5",
        "action": "Çadırın içine girip Lokum’a masal anlat",
        "say": "Gel Lokum, şu kitabı açalım."
      },
      {
        "code": "3C-2",
        "label": "Arkadaşlarını çağır",
        "target": "SON3",
        "action": "Bahçeye büyük tren ve su oyunu kur; parktan dönen Mino’ları da çağır!",
        "say": "Mino! Zıpzıp! Treni bahçeye kurduk, siz de gelin!"
      }
    ]
  },
  "ERKEN1": {
    "title": "Kurabiye İstasyonu",
    "lines": [
      {
        "who": "kino",
        "text": "Dışarı çıkmadık ama kurabiye trenimiz çok lezzetli oldu!"
      }
    ],
    "kapanis": "Kino ile Lokum bütün gün kurabiye istasyonunda oynadılar. Tren her durduğunda vagona bir kurabiye daha koydular.",
    "ending": "Erken son"
  },
  "ERKEN2": {
    "title": "Pencereden İzleme",
    "lines": [
      {
        "who": "kino",
        "text": "Keşke küsüp gelmeseydim ya da sabah hemen çıksaydım..."
      }
    ],
    "kapanis": "Kino eve döndü. Pencereden Mino ile Zıpzıp’ın top oynayışını izledi. Bu kez parkta kalmayı isterdi.",
    "ending": "Erken son"
  },
  "ERKEN3": {
    "title": "Saklanırken Uyuyakaldı!",
    "lines": [
      {
        "who": "zipzip",
        "text": "Kino neredesin? Çık ortaya!"
      },
      {
        "who": "kino",
        "text": "Mışıl mışıl..."
      }
    ],
    "kapanis": "Zıpzıp her yere baktı. Meğer Kino, salıncağın örtüsünün altında sallana sallana uyuyakalmış!",
    "ending": "Erken son"
  },
  "ERKEN4": {
    "title": "Çamur Adam ve Köpüklü Banyo!",
    "lines": [
      {
        "who": "baba",
        "text": "Seni gidi çamur şampiyonu, doğru köpüklü banyoya!"
      }
    ],
    "kapanis": "Kino topa vurunca burnuna kadar çamur oldu. O günkü top oyunu, köpüklerle dolu bir banyoda bitti.",
    "ending": "Erken son"
  },
  "ERKEN5": {
    "title": "Çadırda Tatlı Öğle Uykusu",
    "lines": [
      {
        "who": "anne",
        "text": "Tatlı rüyalar benim küçük kampçılarım..."
      }
    ],
    "kapanis": "Kino çadırda Lokum’a bir masal anlattı. Son sayfaya geldiklerinde ikisinin de gözleri kapandı. Anneleri üstlerini örttü.",
    "ending": "Erken son"
  },
  "SON1": {
    "title": "Saklambaç Şampiyonları!",
    "lines": [
      {
        "who": "kino",
        "text": "Sobe! En güzel saklambaç günü oldu!"
      }
    ],
    "kapanis": "Kino çalıdan çıkıp ağaca koştu. Sobe! Zıpzıp gülmeye başladı. Akşama kadar sırayla ebe oldular.",
    "lokumluKapanis": "Kino ağaca koştu, Lokum da peşinden yetişti. İkisi birden sobe yaptı! Akşama kadar sırayla ebe oldular.",
    "ending": "Ana final"
  },
  "SON2": {
    "title": "Günün Altın Golü ve Karpuz Keyfi!",
    "lines": [
      {
        "who": "dede",
        "text": "Bu güzel gole soğuk karpuz gider! Afiyet olsun şampiyonlar!"
      }
    ],
    "kapanis": "Kino topu çamurdan çıkardı ve golünü attı. Maç bitince herkes dedenin getirdiği serin karpuzdan bir dilim yedi.",
    "ending": "Ana final"
  },
  "SON3": {
    "title": "Herkes Kino’nun Bahçesinde!",
    "lines": [
      {
        "who": "mino",
        "text": "Kino, sizin bahçe parktan bile güzel olmuş! İyi ki bizi de çağırdın!"
      }
    ],
    "kapanis": "Kino kapıyı açınca Mino ile Zıpzıp da bahçeye geldi. Çocuklar çadırın önüne rayları dizip treni sırayla sürdüler.",
    "ending": "Ana final"
  }
};
