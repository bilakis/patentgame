# Vekil Masası

Patent ve marka vekilliği sınav sorularına dayanan, *Papers, Please* tarzı bir büro simülasyonu.

Moda'da küçük bir vekillik bürosu açtın. Bekleme salonundaki müvekkilleri tek tek masana çağırıyorsun. Masaya müvekkil talepleri, kurum yazıları, rüçhan belgeleri ve stajyer notları geliyor. Belgeleri inceleyip Mevzuat Klasörüne bakıyor, kararını Karar Formuna mühürlüyorsun. Doğru kararlar ücret ve itibar getirir. Yanlış kararlar müvekkil kaybettirir. Etik dışı kestirmeler ise disiplin dosyana işlenir.

## Oynamak

Derleme adımı yok. `index.html` dosyasını tarayıcıda açman yeterli. İstersen yerel bir sunucuyla da açabilirsin:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Tek dosyalık çevrimdışı sürüm (CSS, JS ve görseller içine gömülü):

```sh
python3 scripts/build_single.py   # → dist/vekil-masasi.html
```

### Yayımlama

Site tamamen statiktir; derleme adımı yoktur.

- **Vercel:** vercel.com → *Add New → Project* → bu depoyu içe aktar. *Framework Preset* "Other" kalsın, *Build Command* ve *Output Directory* boş bırakılsın. Her `git push` otomatik yeniden yayımlanır. `.vercelignore`, betikleri ve ham veriyi yayımın dışında tutar.
- **GitHub Pages:** *Settings → Pages → Deploy from a branch* → dal ve `/ (root)` seç.

## Modlar

| Mod | Ne yapar |
|---|---|
| **Kariyer** | 10 iş günü. Her sabah *Sınai Mülkiyet Postası* günün konusunu ve yeni protokolleri duyurur. Mesai 09:00–18:00 arasında sürer. Akşam hesap defterinde kira, maaş ve faturalar ödenir; ertesi gün için stajyer ve veri tabanı aboneliği seçilir. Etik ikilemler sonraki günlerde sonuç doğurur. Yedi farklı son var. |
| **Serbest çalışma** | Konu, yıl ve filtre (tümü / görmediklerim / yanlışlarım) seçilir. Saat ve kasa yoktur, her dosyadan sonra gerekçe gösterilir. |
| **Sınav provası** | Gerçek kitapçıklar kendi soru sıralarıyla ve süreleriyle çözülür. Sonunda karne ve soru soru inceleme gelir. |
| **Mevzuat Klasörü** | Süreler, ret nedenleri, rüçhan, itiraz, yenileme ve Nice cetveli gibi büro özet notları. Kariyerde bölümler günlere göre açılır. |
| **İstatistikler** | Konu ve yıl bazında isabet oranı. İlerleme tarayıcıda (`localStorage`) tutulur. |

## Dosya türleri

**Sınav dosyaları (465 soru).** Kaynaklar 2015, 2017, 2019, 2021 ve 2024 Patent ve Marka Vekilliği sınavlarının A kitapçıkları ve resmî cevap anahtarlarıdır. Her soru bir müvekkil talebine, kurum yazısına, süre takip kartına, stajyer notuna ya da dava dosyasına dönüştürülmüştür. Soru metni ve seçenekler kitapçıktaki ifadeyle korunmuştur. 2015 soruları mülga 551/556/554 sayılı KHK dönemine aittir. Kariyerde kullanılmazlar; serbest çalışmada isteğe bağlıdır ve sonuç fişinde mevzuat notu gösterilir.

**Protokol dosyaları.** Rastgele üretilir ve sınırsızdır. Belgeleri karşılaştırıp uyuşmazlık bulmaya dayanırlar:

- **Başvuru formu & Nice sınıfı:** talimat, vekaletname, form ve sınıf cetveli karşılaştırılır.
- **Rüçhan kontrolü:** patent/faydalı model için 12, marka/tasarım için 6 ay. Sahip ve rüçhan bilgileri de kontrol edilir.
- **İtiraz/dava süresi:** süre tebliğden işler. Marka yayımına itiraz 2, tasarım yayımına itiraz 3 aydır.
- **Marka yenileme:** bitiş = başvuru tarihi + 10 yıl. Olağan dönem bitişten önceki 6 ay, ek süre bitişten sonraki 6 aydır.

İnceleme modunda (`I`) çelişen iki alana sırayla tıklanır. Gerçek bir uyuşmazlık bulunursa masada kırmızı çizgiyle işaretlenir ve titizlik primi kazanılır.

## Kısayollar

`Boşluk` sıradaki müvekkil · `A–E` / `1–5` karar seç · `Enter` mühürle / fişi kapat · `M` Mevzuat Klasörü · `T` Süre Cetveli · `I` İnceleme modu · `P` mola

## Proje yapısı

```
index.html              giriş noktası (klasik <script> dosyaları; file:// ile de çalışır)
css/style.css           tek görsel dünya: ceviz masa, deri sümen, kâğıt türleri, mor mühür
js/util.js              DOM, tarih/süre hesabı (TR ay kuralı), tohumlu rastgelelik, kayıt, ses
js/portrait.js          tohumlu piksel portreler, bekleme salonu, çay bardağı
js/procedural.js        protokol dosyası üreticileri ve inceleme modu karşılaştırmaları
js/desk.js              masa: sürüklenebilir belgeler, Karar Formu, mühür, sonuç fişi
js/ui.js                modal, Mevzuat Klasörü, Süre Cetveli
js/game.js              ekran akışları: kariyer, serbest çalışma, sınav provası, istatistik
js/data/questions.js    üretilir (scripts/build_data.py)
js/data/rulebook.js     Mevzuat Klasörü ve Nice cetveli
js/data/campaign.js     günler, bülten, olaylar, sonlar
data/questions.json     soru verisinin kaynağı
data/answer_keys.json   resmî cevap anahtarları
assets/fig/             metne dökülemeyen soru görselleri
docs/SORU_SARTNAMESI.md soru verisi şeması ve yazım kuralları
scripts/                veri derleme, doğrulama, tek dosya paketleme, PDF çıkarım betikleri
```

## Soru verisini güncellemek

1. `data/questions.json` dosyasını düzenle ya da yeni bir yılın sorularını `docs/SORU_SARTNAMESI.md` şemasına göre hazırla. PDF'ten çıkarım için `scripts/extract/` altındaki betikler kullanılabilir. Sayfa aralıkları her kitapçık için uyarlanmalıdır.
2. `python3 scripts/validate_questions.py` komutunu çalıştır. Komut, şemayı ve cevapların resmî anahtarla aynı olduğunu kontrol eder.
3. `python3 scripts/build_data.py [zenginleştirilmiş_klasör]` ile `js/data/questions.js` dosyasını yeniden üret.

## Önemli notlar

- Sorular ve cevaplar Türk Patent ve Marka Kurumunun yayımladığı sınav kitapçıklarından alınmıştır. Kitapçıklarda, Kurumun yazılı izni olmadan çoğaltma ve yayımlamanın yasak olduğu belirtilir. Oyunu herkese açık yayımlamadan önce bu kısıtı dikkate alın.
- Gerekçeler, ipuçları, Mevzuat Klasörü notları ve müvekkil çerçeveleri oyun için hazırlanmış özetlerdir. Hata içerebilirler. Doğru cevap her zaman resmî cevap anahtarıdır. Gerekçe yazarlarının tartışmalı bulduğu birkaç soruda sonuç fişinde "cevap anahtarı notu" gösterilir.
- Mevzuat değişmiş olabilir; örneğin 10.01.2024'ten bu yana marka iptal kararlarını Kurum verir. Güncel durum için resmî metinler esastır.
- İsimler, firmalar ve markalar kurgusaldır.
