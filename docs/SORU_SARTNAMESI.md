# VEKİL — soru zenginleştirme şartnamesi

Bir "Papers, Please" tarzı patent & marka vekili simülasyon oyunu yapıyoruz (Türkçe, web).
Oyunda vekilin masasına "dosyalar" gelir; her dosya, resmi Patent ve Marka Vekilliği sınav
sorularından birine dayanır. Oyuncu belgeleri inceler, Mevzuat klasörüne bakar ve Karar Formunda
A–E seçeneklerinden birini mühürler. Senin görevin: sana verilen soru aralığını oyun verisine çevirmek.

## Girdiler
- Ham sorular: `scripts/extract/split.py` çıktısı (`raw_questions.json`). Her kayıt: id, year, section, num, pages, raw, answer.
  `raw` pdf'ten sütun sütun çıkarılmış ham metindir: satır kırılmaları, heceleme tireleri, tablo
  kaymaları, sayfa sonu çöpleri (ör. "SINAVDA UYULMASI GEREKEN KURALLAR", sayfa numaraları) içerebilir.
- `answer` RESMÎ cevap anahtarıdır ve DEĞİŞTİRİLEMEZ.
- PDF dosyası ve sayfa numarası (`pages`): soruların tablo, şekil, altı çizili/kalın vurgularını
  Read aracıyla (pages parametresiyle) PDF sayfasına bakarak MUTLAKA doğrula. Tablolu ya da şekilli
  sorularda pdf görüntüsü esastır.

## Çıktı: JSON dizisi (UTF-8), her soru için bir nesne
```jsonc
{
  "id": "2021-034",            // raw ile aynı
  "year": 2021, "num": 34, "section": "main",
  "topic": "patent",           // patent | patent_intl | tasarim | marka | marka_intl | cografi | vekillik | genel_hukuk
  "subtopic": "Rüçhan hakkı",  // kısa Türkçe alt konu (2-4 kelime)
  "kind": "sure",              // sure (tarih/süre hesabı) | vaka (olaylı vaka) | bilgi (doğrudan bilgi) | hata (yanlış/olmayan ifadeyi bul) | kombinasyon (numaralı öncüllerden seçim)
  "docType": "Süre Takip Kartı", // Müvekkil Talebi | Müvekkil Sorusu | Kurum Yazısı | Süre Takip Kartı | Stajyer Notu | Meslektaş Danışması | Dava Dosyası | İç Eğitim Notu
  "title": "Alman başvurusundan rüçhan",  // dosya başlığı, ≤ 50 karakter
  "client": {"name": "Kaya Yapı İnşaat A.Ş.", "sector": "İnşaat", "kind": "firma"}, // kind: firma | kişi | kurum | büro
  "intro": "…",                // 1-3 cümle, oyun içi çerçeve (aşağıya bak)
  "line": "…",                 // müvekkilin masada söylediği tek kısa cümle (konuşma balonu), ≤ 90 karakter
  "context": "…",              // sorunun olay/bilgi kısmı, ORİJİNAL METİN (temizlenmiş). Paragraflar \n\n ile. Boş olabilir ("").
  "items": ["…", "…"],         // (varsa) numaralı öncüller, numarasız metin olarak, sırayla. Yoksa alanı hiç koyma.
  "table": {"headers": ["…"], "rows": [["…"]]},   // (varsa) soru kökündeki tablo. Yoksa koyma.
  "ask": "Buna göre, … hangisidir?",  // asıl soru cümlesi, ORİJİNAL METİN. Kalın/altı çizili vurgu **…** ile.
  "optionHeaders": ["Başvuru Tarihi", "Rüçhan Talebi", "Belge Teslimi"], // (yalnızca seçenekler tablo ise) sütun başlıkları
  "options": {"A": "…", "B": "…", "C": "…", "D": "…", "E": "…"},     // ORİJİNAL. optionHeaders varsa her seçenek bir dizi: {"A": ["14.12.2019","14.02.2020","14.02.2020"], …}
  "answer": "C",               // resmi anahtar (raw.answer) — aynen
  "explanation": "…",          // 1-4 cümle gerekçe (aşağıya bak)
  "law": "6769 SMK m. 94",     // (varsa) dayanak madde(ler), emin değilsen boş bırak ""
  "hint": "…",                 // cevabı vermeyen 1 cümlelik ipucu (ör. "Rüçhan süresinin patent için kaç ay olduğunu ve belgelerin ne zaman verileceğini hatırla.")
  "difficulty": 2,             // 1 kolay, 2 orta, 3 zor
  "figure": "assets/fig/2017-042.png", // (yalnızca soruyu anlamak için görsel ŞARTSA) — yoksa koyma
  "outdated": "…",             // (varsa) mevzuat değişikliği notu; yoksa koyma
  "keyNote": "…"               // (yalnızca resmi cevaba ciddi itirazın varsa) kısa not; yoksa koyma
}
```

## Metin kuralları
- `context`, `items`, `table`, `ask`, `options`: sınavdaki ifadeyi KORU (anlam ve hukuki olgular aynen kalmalı).
  Yalnızca temizlik yap: satır sonlarını birleştir, heceleme tirelerini kaldır ("Yönet-\nmelik" → "Yönetmelik"),
  bozuk karakterleri düzelt, sayfa çöplerini at. "Buna göre …", "… hangisidir?" kısmı `ask`'e gider; olaylar `context`'e.
- Numaralı öncüller (1., 2., 3. … ya da I., II.) `items` dizisine numarasız girer; seçeneklerde "1 ve 2" gibi atıflar aynen kalır.
- Seçenekler tablo halindeyse (sütun başlıklı tarih/karar tabloları) `optionHeaders` + dizi seçenek kullan.
- Şekil/logo/tasarım çizimi gibi metne dökülemeyen görseller varsa: kırp ve kaydet:
  `python3 -I scripts/extract/crop.py "<pdf>" <sayfa> <x0> <y0> <x1> <y1> assets/fig/<id>.png`
  (koordinatlar sayfanın 0–1 oranı, sol-üst köşe orijin). Sonucu Read ile aç, doğru bölgeyi aldığını kontrol et.
  Yalnızca görsel kısmı kırp (soru metnini değil). Metinle ifade edilebiliyorsa görsel kullanma.
- Vurgulu (kalın/altı çizili) "yanlıştır", "değildir", "olamaz", "yer almaz" gibi kelimeleri `ask` içinde **…** ile işaretle.

## Oyun çerçevesi (intro, line, title, client, docType)
- Türkçe, profesyonel ama sıcak; oyun dünyasında geçer: sen bir patent & marka vekilisin, büronda dosya işliyorsun.
- Kurgusal isimler kullan (gerçek şirket/marka/kişi adı YOK). Sektörü sorudan çıkar (ör. otomotiv, gıda, tekstil).
  Soruda "A firması", "K", "X" gibi harfler geçiyorsa `context`'te aynen kalır; intro'da "dosyada 'A firması' olarak geçen
  müvekkiliniz …" gibi bağ kurabilirsin.
- intro hukuki olguyu DEĞİŞTİRMEZ, yeni olgu EKLEMEZ, cevabı SIZDIRMAZ. Sadece kim, neden, ne istiyor çerçevesi.
- docType seçimi: olaylı müvekkil işi → "Müvekkil Talebi"; müvekkilin genel bilgi sorusu → "Müvekkil Sorusu";
  Kurum bildirimi/karar/eksiklik yazısı → "Kurum Yazısı"; tarih/süre hesabı → "Süre Takip Kartı";
  "hangisi yanlıştır/değildir" tipi → çoğunlukla "Stajyer Notu" (intro: stajyerin hazırladığı notta hatalı ifadeyi bul);
  dava/mahkeme/tecavüz/hükümsüzlük → "Dava Dosyası"; vekillik/genel hukuk bilgi → "Meslektaş Danışması" veya "İç Eğitim Notu".
  Çeşitlilik iyi, ama uyum önemli. Stajyer adı her zaman "Deniz" (client: {"name": "Stajyer Deniz", "sector": "Büro içi", "kind": "büro"}).
- line: müvekkilin/konuşanın ağzından doğal, kısa, karakterli bir cümle (Papers, Please'teki gibi). Cevabı sızdırma.

## Gerekçe (explanation) kuralları
- Resmi cevabın NEDEN doğru olduğunu açıkla; gerekiyorsa en çekici yanlış seçeneğin neden yanlış olduğunu da söyle.
- Süre sorularında hesabı açıkça yaz (ör. "Tebliğ 14.02.2024 + 2 ay = 14.04.2024").
- Kanun maddesi numarasını yalnızca EMİNSEN yaz (`law` alanına da). Emin değilsen maddesiz anlat. Uydurma madde YOK.
- Resmi cevapla çelişen bir gerekçe yazma. Resmi cevabın yanlış olduğunu ya da mevzuatın değiştiğini düşünüyorsan
  gerekçeyi yine resmi cevaba göre yaz ve `keyNote`/`outdated` alanına kısa not düş.
- 2015 soruları mülga KHK'lar (551 patent, 556 marka, 554 tasarım) dönemine aittir: hepsine
  `"outdated": "Bu soru mülga 5xx sayılı KHK dönemine aittir; 6769 sayılı SMK ile kurallar değişmiştir."` benzeri not koy
  ve gerekçeyi o dönemin kuralına göre yaz; mümkünse güncel kuralın ne olduğunu da bir cümleyle ekle.

## Doğrulama
- Çıktını yazdıktan sonra çalıştır: `python3 scripts/validate_questions.py <çıktı.json>` → "OK 0" görmelisin.
- Görselleri yalnızca `assets/fig/` altına yaz.
