const sahneler = {
  "F1": {
    "title": "Fırtına alarmı",
    "lines": [
      {
        "who": "anlatici",
        "text": "Bir öğleden sonra gökyüzü birden karardı. Rüzgâr yaprakları havalandırdı.",
        "audio": "F1-1"
      },
      {
        "who": "anne",
        "text": "Çocuklar! Yağmur geliyor. Hadi, içeri!",
        "audio": "F1-2"
      },
      {
        "who": "lokum",
        "text": "Kuzu! Kuzu kumda kaldı!",
        "audio": "F1-3"
      },
      {
        "who": "kino",
        "text": "Babamın ekmekleri de masada! İkisi de ıslanacak!",
        "audio": "F1-4"
      }
    ],
    "question": "Kino önce hangisine koşsun?",
    "choices": [
      {
        "c": "A",
        "label": "Kuzu’yu al",
        "say": "Önce Kuzu! Geliyorum Kuzu!",
        "to": "F2A",
        "art": "kuzy"
      },
      {
        "c": "B",
        "label": "Ekmeği al",
        "say": "Önce ekmekler! Babam çok uğraştı.",
        "to": "F2B",
        "art": "bread"
      },
      {
        "c": "C",
        "label": "Lokum’la paylaş",
        "say": "Lokum, sen Kuzu’yu al, ben ekmeği!",
        "to": "F2C",
        "art": "kaptan-el",
        "when": "unlocked"
      }
    ]
  },
  "F2A": {
    "title": "Kuzu kurtuldu",
    "lines": [
      {
        "who": "kino",
        "text": "Al Lokum! Kuzu kupkuru.",
        "audio": "F2A-1"
      },
      {
        "who": "lokum",
        "text": "Kuzu geldi!",
        "audio": "F2A-2"
      },
      {
        "who": "kino",
        "text": "Eyvah, yağmur başladı! Ekmekler ıslanıyor!",
        "audio": "F2A-3"
      },
      {
        "who": "mino",
        "text": "Kino! Ben eve koşuyorum, yağmur geliyor!",
        "audio": "F2A-4"
      },
      {
        "who": "kino",
        "text": "Şapkam! Şapkam uçtu!",
        "audio": "F2A-5"
      }
    ],
    "question": "Kino şimdi ne yapsın?",
    "choices": [
      {
        "c": "A1",
        "label": "Mino’yu çağır",
        "say": "Mino! Tepsinin ucundan tut, beraber taşıyalım!",
        "to": "F3",
        "art": "kedi-mont"
      },
      {
        "c": "A2",
        "label": "Tek başına taşı",
        "say": "Ben hallederim!",
        "to": "F3",
        "art": "kino-tepsi"
      },
      {
        "c": "A3",
        "label": "Şapkanı kovala",
        "say": "Dur şapkam, dur!",
        "to": "E1",
        "art": "hat"
      }
    ]
  },
  "F2B": {
    "title": "Ekmek kurtuldu",
    "lines": [
      {
        "who": "kino",
        "text": "Çok ağır... ama başardım!",
        "audio": "F2B-1"
      },
      {
        "who": "baba",
        "text": "Aferin Kino! Ekmeklerimiz kurtuldu.",
        "audio": "F2B-2"
      },
      {
        "who": "lokum",
        "text": "Kuzu! Kuzu ıslandı!",
        "audio": "F2B-3"
      },
      {
        "who": "kino",
        "text": "Ağlama Lokum. Kuzu’yu orada bırakmam.",
        "audio": "F2B-4"
      }
    ],
    "question": "Kino Kuzu’yu nasıl kurtarsın?",
    "choices": [
      {
        "c": "B1",
        "label": "Koş, kap gel",
        "say": "Hemen dönüyorum!",
        "to": "F3",
        "art": "kino-kuzu"
      },
      {
        "c": "B2",
        "label": "Yağmurluğunu giy",
        "say": "Önce yağmurluğum, sonra Kuzu!",
        "to": "F3",
        "art": "yagmurluk"
      },
      {
        "c": "B3",
        "label": "Yarın alırız",
        "say": "Yağmur çok. Kuzu’yu yarın alırız Lokum.",
        "to": "E2",
        "art": "wety"
      }
    ]
  },
  "F2C": {
    "title": "Kaptan Lokum",
    "lines": [
      {
        "who": "kino",
        "text": "Lokum, sen kaptansın! Sen Kuzu’yu al, ben tepsiyi. Koş!",
        "audio": "F2C-1"
      },
      {
        "who": "lokum",
        "text": "Kaptan Lokum!",
        "audio": "F2C-2"
      },
      {
        "who": "lokum",
        "text": "Abi... gök bağırdı!",
        "audio": "F2C-3"
      },
      {
        "who": "kino",
        "text": "Lokum durdu! Tepsi de elimde...",
        "audio": "F2C-4"
      }
    ],
    "question": "Kino ne yapsın?",
    "choices": [
      {
        "c": "C1",
        "label": "Yanına git",
        "say": "Geliyorum Lokum, korkma!",
        "to": "F3",
        "art": "kaptan-el"
      },
      {
        "c": "C2",
        "label": "Birlikte say",
        "say": "Kaptan Lokum, bana bak! Bir, iki, üç... koş!",
        "to": "F3",
        "art": "sayi"
      }
    ]
  },
  "F3": {
    "title": "Kapı kapandı",
    "lines": [
      {
        "who": "anne",
        "text": "Oh! Hepiniz içeridesiniz.",
        "audio": "F3-1"
      },
      {
        "who": "lokum",
        "text": "Kuzu kuru!",
        "when": "dry",
        "audio": "F3-2"
      },
      {
        "who": "anne",
        "text": "Kuzu biraz kurusun.",
        "when": "wet",
        "audio": "F3-3"
      },
      {
        "who": "lokum",
        "text": "Kuzu asıldı...",
        "when": "wet",
        "audio": "F3-4"
      },
      {
        "who": "anne",
        "text": "İşte, tertemiz oldu.",
        "when": "mud",
        "audio": "F3-5"
      },
      {
        "who": "lokum",
        "text": "Kuzu banyo yaptı!",
        "when": "mud",
        "audio": "F3-6"
      },
      {
        "who": "baba",
        "text": "Ekmeklerin hepsi sıcacık.",
        "when": "full",
        "audio": "F3-7"
      },
      {
        "who": "baba",
        "text": "Ekmek az kaldı ama yeter. Paylaşırız.",
        "when": "half",
        "audio": "F3-8"
      },
      {
        "who": "mino",
        "text": "Ben de sizdeyim! Annem biliyor.",
        "when": "mino",
        "audio": "F3-9"
      },
      {
        "who": "kino",
        "text": "Hapşu!",
        "when": "towel",
        "audio": "F3-10"
      },
      {
        "who": "anne",
        "text": "Fırtına büyüyor. Elektrik gidebilir. Hadi bir şey hazırlayalım.",
        "audio": "F3-11"
      }
    ],
    "question": "Kino neyi hazırlasın?",
    "choices": [
      {
        "c": "P1",
        "label": "Feneri hazırla",
        "say": "Feneri masaya koyuyorum!",
        "to": "F4",
        "art": "hazir-masa"
      },
      {
        "c": "P2",
        "label": "Minderleri diz",
        "say": "Minderleri halıya diziyorum!",
        "to": "F4",
        "art": "hazir-minder"
      },
      {
        "c": "P3",
        "label": "Kuzu’yu kurut",
        "say": "Kuzu’ya saç kurutma!",
        "to": "F4",
        "art": "kurut",
        "when": "damp"
      }
    ]
  },
  "F4": {
    "title": "Işıklar gitti",
    "lines": [
      {
        "who": "lokum",
        "text": "Işık gitti! Canavar!",
        "when": "ordinary",
        "audio": "F4-1"
      },
      {
        "who": "lokum",
        "text": "Abi... Kaptan azıcık korktu.",
        "when": "captain",
        "audio": "F4-2"
      },
      {
        "who": "baba",
        "text": "Korkmayın! Elektrik kesildi. Ben sigortaya bakıyorum. Kino, kardeşinin yanında kal.",
        "audio": "F4-3"
      },
      {
        "who": "kino",
        "text": "Karanlık oldu... Ne yapsam?",
        "audio": "F4-4"
      },
      {
        "who": "kino",
        "text": "Fener burada, biliyorum!",
        "when": "light",
        "audio": "F4-5"
      }
    ],
    "question": "Kino karanlıkta ne yapsın?",
    "choices": [
      {
        "c": "4A",
        "label": "Lokum’a sarıl",
        "say": "Geliyorum Lokum!",
        "to": "F5A",
        "art": "saril"
      },
      {
        "c": "4B",
        "label": "Feneri bul",
        "say": "Çekmecede fener vardı!",
        "to": "F5B",
        "art": "torch",
        "readySay": "Masadaki feneri alayım!",
        "readyLabel": "Feneri al"
      },
      {
        "c": "4C",
        "label": "Gök gürültüsüne cevap ver",
        "say": "Gök bize bağırıyorsa biz de ona çalarız!",
        "to": "S3",
        "art": "kapak"
      }
    ]
  },
  "F5A": {
    "title": "Masanın altında",
    "lines": [
      {
        "who": "kino",
        "text": "Geldim Lokum. Buradayım.",
        "audio": "F5A-1"
      },
      {
        "who": "lokum",
        "text": "Kuzu da burada.",
        "when": "dry",
        "audio": "F5A-2"
      },
      {
        "who": "lokum",
        "text": "Kuzu yok... Kuzu ipte.",
        "when": "damp",
        "audio": "F5A-3"
      },
      {
        "who": "kino",
        "text": "Kuzu kuruyor. O gelene kadar ben varım.",
        "when": "damp",
        "audio": "F5A-4"
      },
      {
        "who": "mino",
        "text": "Bana da yer var mı? Bakın, gözlerim parlıyor!",
        "when": "mino",
        "audio": "F5A-5"
      },
      {
        "who": "kino",
        "text": "Burası küçücük bir ev gibi...",
        "audio": "F5A-6"
      }
    ],
    "question": "Masanın altında ne yapsınlar?",
    "choices": [
      {
        "c": "5A1",
        "label": "Kale kur",
        "say": "Burayı kale yapalım! Battaniyeyi getiriyorum.",
        "to": "S2",
        "art": "buyuk-kale"
      },
      {
        "c": "5A2",
        "label": "Sarıl, bekle",
        "say": "Babam gelene kadar sarılalım.",
        "to": "E3",
        "art": "saril"
      },
      {
        "c": "5A3",
        "label": "Fener getir",
        "say": "Bekle Lokum, ışık getiriyorum!",
        "to": "F5B",
        "art": "fener-elde"
      }
    ]
  },
  "F5B": {
    "title": "Fener bulundu",
    "lines": [
      {
        "who": "kino",
        "text": "İyi ki hazırlamışım!",
        "when": "light",
        "audio": "F5B-1"
      },
      {
        "who": "mino",
        "text": "Ben karanlıkta görürüm! Sağdaki çekmece!",
        "when": "catSearch",
        "audio": "F5B-2"
      },
      {
        "who": "kino",
        "text": "Pardon! Kimdi o?",
        "when": "soloSearch",
        "audio": "F5B-3"
      },
      {
        "who": "kino",
        "text": "Buldum! Işığımız var.",
        "audio": "F5B-4"
      },
      {
        "who": "lokum",
        "text": "Abi! Canavar orada!",
        "audio": "F5B-5"
      }
    ],
    "question": "Kino feneri ne yapsın?",
    "choices": [
      {
        "c": "5B1",
        "label": "Gölgeye tut",
        "say": "Bakalım neymiş bu canavar!",
        "to": "S1",
        "art": "askilik"
      },
      {
        "c": "5B2",
        "label": "Kaleye as",
        "say": "Bu ışıkla masanın altını ev yapalım!",
        "to": "S2",
        "art": "fener-as"
      },
      {
        "c": "5B3",
        "label": "Lokum’a ver",
        "say": "Kaptan, fener sende. Yolu sen göster.",
        "to": "S4",
        "art": "cap-mini",
        "when": "captain"
      }
    ]
  },
  "E1": {
    "title": "Şapka Ağaçta",
    "lines": [
      {
        "who": "kino",
        "text": "Şapkam da ıslandı, ekmekler de...",
        "audio": "E1-1"
      },
      {
        "who": "baba",
        "text": "Olsun. Şapkayı yarın merdivenle alırız. Islak ekmek de kuşlara ziyafet olur.",
        "audio": "E1-2"
      },
      {
        "who": "anlatici",
        "text": "Şapka bekleyebilirdi. Ekmekler bekleyemedi.",
        "audio": "E1-3"
      }
    ]
  },
  "E2": {
    "title": "Kuzu’nun Yağmur Banyosu",
    "lines": [
      {
        "who": "kino",
        "text": "Üzgünüm Lokum. Sabah ilk iş Kuzu’yu alacağım. Söz.",
        "audio": "E2-1"
      },
      {
        "who": "lokum",
        "text": "Kuzu üşüdü...",
        "audio": "E2-2"
      },
      {
        "who": "lokum",
        "text": "Kuzu kurudu!",
        "audio": "E2-3"
      },
      {
        "who": "anlatici",
        "text": "Kuzu o gece biraz üşüdü. Ama sabah güneşte kurudu, yine Lokum’un kucağına döndü.",
        "audio": "E2-4"
      }
    ]
  },
  "E3": {
    "title": "Sarıl ve Bekle",
    "lines": [
      {
        "who": "kino",
        "text": "Korkunca sarılmak iyi gelir.",
        "audio": "E3-1"
      },
      {
        "who": "lokum",
        "text": "Sıkı sarıl.",
        "audio": "E3-2"
      },
      {
        "who": "baba",
        "text": "Demek buradasınız! Saklambaç mı oynuyorsunuz?",
        "audio": "E3-3"
      },
      {
        "who": "anlatici",
        "text": "Bazen yapılacak en iyi şey, sarılıp beklemektir.",
        "audio": "E3-4"
      }
    ]
  },
  "S1": {
    "title": "Işık Dedektifleri",
    "lines": [
      {
        "who": "kino",
        "text": "Canavar değilmiş! Benim montum, bir de şapkam!",
        "audio": "S1-1"
      },
      {
        "who": "lokum",
        "text": "Şapka canavar!",
        "audio": "S1-2"
      },
      {
        "who": "lokum",
        "text": "Tavşan! Havuç yiyor!",
        "audio": "S1-3"
      },
      {
        "who": "mino",
        "text": "Bu da kedi! Yani ben!",
        "when": "mino",
        "audio": "S1-4"
      },
      {
        "who": "lokum",
        "text": "Kuzu da oynuyor!",
        "when": "damp",
        "audio": "S1-5"
      },
      {
        "who": "baba",
        "text": "Benimki de kurt: Auuu!",
        "audio": "S1-6"
      },
      {
        "who": "anlatici",
        "text": "Işık gelince canavar gitti. Yerine tavşan geldi.",
        "audio": "S1-7"
      }
    ]
  },
  "S2": {
    "title": "Fırtına Kalesi",
    "lines": [
      {
        "who": "baba",
        "text": "Bu kalede büyüklere de yer varmış!",
        "when": "cushion",
        "audio": "S2-1"
      },
      {
        "who": "anne",
        "text": "Kalenize ışık getirdim.",
        "when": "lantern",
        "audio": "S2-2"
      },
      {
        "who": "anne",
        "text": "Kale pikniği!",
        "when": "full",
        "audio": "S2-3"
      },
      {
        "who": "kino",
        "text": "Yarısı senin Lokum.",
        "when": "half",
        "audio": "S2-4"
      },
      {
        "who": "kino",
        "text": "Üçe bölelim!",
        "when": "shareThree",
        "audio": "S2-5"
      },
      {
        "who": "anne",
        "text": "Bakın kim kurudu!",
        "when": "damp",
        "audio": "S2-6"
      },
      {
        "who": "lokum",
        "text": "Kuzu geldi!",
        "when": "damp",
        "audio": "S2-7"
      },
      {
        "who": "mino",
        "text": "Bu kalede kedi de olur mu?",
        "when": "mino",
        "audio": "S2-8"
      },
      {
        "who": "kino",
        "text": "Olur! Nöbetçi kedi!",
        "when": "mino",
        "audio": "S2-9"
      },
      {
        "who": "lokum",
        "text": "Yağmur dışarıda. Biz içeride.",
        "audio": "S2-10"
      },
      {
        "who": "anlatici",
        "text": "Dışarıda fırtına vardı. İçeride sıcacık bir kale.",
        "audio": "S2-11"
      }
    ]
  },
  "S3": {
    "title": "Gök Gürültüsü Orkestrası",
    "lines": [
      {
        "who": "kino",
        "text": "Şimşek çaktı! Sayıyoruz: bir, iki, üç...",
        "audio": "S3-1"
      },
      {
        "who": "lokum",
        "text": "Güm! Bir daha!",
        "audio": "S3-2"
      },
      {
        "who": "mino",
        "text": "Miyaaav!",
        "when": "mino",
        "audio": "S3-3"
      },
      {
        "who": "kino",
        "text": "Kuzu da tempo tutuyor!",
        "when": "damp",
        "audio": "S3-4"
      },
      {
        "who": "anlatici",
        "text": "Gök gürledi, ev güldü. O gece en çok ses fırtınadan değil, bu evden çıktı.",
        "audio": "S3-5"
      }
    ]
  },
  "S4": {
    "title": "Küçük Kaptan’ın Işığı",
    "lines": [
      {
        "who": "kino",
        "text": "Biliyor musun Lokum? Ben de azıcık korktum.",
        "audio": "S4-1"
      },
      {
        "who": "lokum",
        "text": "Korkma abi. Kaptan burada!",
        "audio": "S4-2"
      },
      {
        "who": "lokum",
        "text": "Mont! Canavar yok!",
        "audio": "S4-3"
      },
      {
        "who": "baba",
        "text": "Teşekkürler Kaptan! Işığın sayesinde buldum.",
        "audio": "S4-4"
      },
      {
        "who": "anne",
        "text": "Evin en küçüğü, en büyük ışığı tuttu.",
        "audio": "S4-5"
      },
      {
        "who": "anlatici",
        "text": "O gece Kino bir şey öğrendi. Bazen büyükler de korkar. Bazen de yolu küçükler gösterir.",
        "audio": "S4-6"
      }
    ]
  }
};
const sonuclar = {
  "A1": [
    {
      "who": "mino",
      "text": "Bir, iki, üç... kaldır!",
      "audio": "A1-result-1"
    },
    {
      "who": "anne",
      "text": "Mino, annene haber verdim. Yağmur dinene kadar bizdesin.",
      "audio": "A1-result-2"
    }
  ],
  "A2": [
    {
      "who": "kino",
      "text": "Of! İkisi düştü. Ama gerisi kurtuldu.",
      "audio": "A2-result-1"
    },
    {
      "who": "baba",
      "text": "Tek başına taşıdın ha! Eline sağlık. Düşenler de yarın kuşların olur.",
      "audio": "A2-result-2"
    }
  ],
  "B1": [
    {
      "who": "anne",
      "text": "Sırılsıklam olmuşsun! Gel, kurulayalım.",
      "audio": "B1-result-1"
    },
    {
      "who": "lokum",
      "text": "Abi ıslak! Kuzu ıslak!",
      "audio": "B1-result-2"
    }
  ],
  "B2": [
    {
      "who": "kino",
      "text": "Kuzu çamur olmuş! Ama ben kupkuruyum.",
      "audio": "B2-result-1"
    },
    {
      "who": "anne",
      "text": "Kuzu’ya güzel bir banyo lazım.",
      "audio": "B2-result-2"
    },
    {
      "who": "lokum",
      "text": "Kuzu banyo!",
      "audio": "B2-result-3"
    }
  ],
  "C1": [
    {
      "who": "lokum",
      "text": "Abi geldi.",
      "audio": "C1-result-1"
    },
    {
      "who": "baba",
      "text": "Üsttekiler ıslanmış. Olsun, kardeşinin elini bırakmadın.",
      "audio": "C1-result-2"
    }
  ],
  "C2": [
    {
      "who": "lokum",
      "text": "Kaptan koştu!",
      "audio": "C2-result-1"
    },
    {
      "who": "kino",
      "text": "İkisini de kurtardık!",
      "audio": "C2-result-2"
    }
  ],
  "P3": [
    {
      "who": "lokum",
      "text": "Kuzu kabardı!",
      "audio": "P3-result-1"
    },
    {
      "who": "kino",
      "text": "Kuaför Kino hizmetinizde!",
      "audio": "P3-result-2"
    }
  ]
};

