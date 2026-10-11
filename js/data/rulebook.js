/* VEKİL — Mevzuat Klasörü (oyun içi özet notlar) ve Nice sınıf cetveli.
   Not: Bunlar oyun için hazırlanmış özetlerdir; güncel mevzuat metni esastır. */
(function () {
  'use strict';
  const VK = window.VK;

  // Nice sınıflandırması — oyunda kullanılan sınıfların özeti ve örnek mal/hizmetler
  VK.NICE = [
    { no: 3, title: 'Kozmetik ve temizlik müstahzarları', goods: ['Şampuanlar', 'Parfümler', 'El kremleri', 'Sabunlar', 'Çamaşır deterjanları'] },
    { no: 5, title: 'Eczacılık ürünleri, ilaçlar, gıda takviyeleri', goods: ['Ağrı kesici ilaçlar', 'Vitamin takviyeleri', 'Tıbbi merhemler'] },
    { no: 9, title: 'Bilimsel cihazlar, kayıtlı yazılımlar, gözlükler', goods: ['Bilgisayar yazılımları (indirilebilir)', 'Cep telefonları', 'Güneş gözlükleri'] },
    { no: 12, title: 'Taşıtlar ve aksamı', goods: ['Bisikletler', 'Otomobiller', 'Otomobil lastikleri'] },
    { no: 14, title: 'Kıymetli madenler, mücevherler, saatler', goods: ['Kol saatleri', 'Altın kolyeler', 'Gümüş yüzükler'] },
    { no: 16, title: 'Kâğıt, kırtasiye, basılı yayınlar', goods: ['Defterler', 'Kitaplar', 'Tükenmez kalemler'] },
    { no: 18, title: 'Deri ürünleri, çantalar, şemsiyeler', goods: ['El çantaları', 'Sırt çantaları', 'Şemsiyeler'] },
    { no: 20, title: 'Mobilyalar, aynalar, yastıklar', goods: ['Mobilyalar', 'Aynalar', 'Yastıklar'] },
    { no: 21, title: 'Ev ve mutfak gereçleri, cam eşya', goods: ['Tencereler', 'Cam bardaklar', 'Diş fırçaları'] },
    { no: 24, title: 'Dokumalar ve ev tekstili', goods: ['Havlular', 'Nevresim takımları', 'Masa örtüleri'] },
    { no: 25, title: 'Giysiler, ayak giysileri, baş giysileri', goods: ['Tişörtler', 'Ayakkabılar', 'Şapkalar'] },
    { no: 28, title: 'Oyunlar, oyuncaklar, spor malzemeleri', goods: ['Oyuncak bebekler', 'Futbol topları', 'Satranç takımları'] },
    { no: 29, title: 'Et, süt ürünleri, yemeklik yağlar, reçeller', goods: ['Peynirler', 'Zeytinyağı', 'Sucuklar', 'Reçeller'] },
    { no: 30, title: 'Kahve, çay, unlu mamuller, şekerlemeler, bal, baharat', goods: ['Kahve', 'Çay', 'Lokum', 'Bal', 'Dondurmalar'] },
    { no: 31, title: 'Taze meyve-sebze, tohumlar, hayvan yemleri', goods: ['Taze meyveler', 'Tohumlar', 'Evcil hayvan mamaları'] },
    { no: 32, title: 'Biralar, alkolsüz içecekler, meyve suları', goods: ['Biralar', 'Maden suları', 'Meyve suları'] },
    { no: 33, title: 'Alkollü içkiler (biralar hariç)', goods: ['Şaraplar', 'Rakı'] },
    { no: 35, title: 'Reklamcılık, işletme yönetimi, büro işleri', goods: ['Reklamcılık hizmetleri', 'Muhasebe hizmetleri'] },
    { no: 36, title: 'Finans, sigorta, gayrimenkul hizmetleri', goods: ['Sigortacılık hizmetleri', 'Bankacılık hizmetleri', 'Emlakçılık hizmetleri'] },
    { no: 37, title: 'İnşaat, tamir ve kurulum hizmetleri', goods: ['Bina inşaatı hizmetleri', 'Taşıt tamiri hizmetleri'] },
    { no: 38, title: 'Telekomünikasyon hizmetleri', goods: ['İnternet erişimi sağlama hizmetleri', 'Mobil iletişim hizmetleri'] },
    { no: 39, title: 'Taşımacılık, depolama, seyahat düzenleme', goods: ['Kargo taşımacılığı', 'Tur ve seyahat düzenleme hizmetleri'] },
    { no: 41, title: 'Eğitim, eğlence, spor ve kültürel faaliyetler', goods: ['Eğitim hizmetleri', 'Konser organizasyonu', 'Spor salonu hizmetleri'] },
    { no: 42, title: 'Bilimsel ve teknolojik hizmetler, yazılım tasarımı', goods: ['Yazılım geliştirme hizmetleri', 'Mühendislik hizmetleri'] },
    { no: 43, title: 'Yiyecek-içecek sağlama, geçici konaklama', goods: ['Restoran hizmetleri', 'Kafe hizmetleri', 'Otel hizmetleri'] },
    { no: 44, title: 'Tıbbi hizmetler, güzellik ve bakım hizmetleri', goods: ['Diş hekimliği hizmetleri', 'Kuaför hizmetleri'] },
    { no: 45, title: 'Hukuki hizmetler, güvenlik hizmetleri', goods: ['Hukuki danışmanlık hizmetleri', 'Özel güvenlik hizmetleri'] },
  ];
  VK.niceOf = (good) => {
    const row = VK.NICE.find((c) => c.goods.includes(good));
    return row ? row.no : null;
  };

  // Her bölüm: id, sekme adı, başlık, kariyerde açıldığı gün, bloklar
  VK.RULEBOOK = [
    {
      id: 'buro',
      tab: 'Büro',
      title: 'Büro El Kitabı',
      unlock: 1,
      blocks: [
        {
          h: 'Bir dosya nasıl işlenir',
          list: [
            'Bekleme salonundaki zile bas ya da Boşluk tuşuna dokun: sıradaki müvekkil masaya gelir.',
            'Masadaki belgeleri üst şeritlerinden tutup sürükleyebilirsin. Üstteki belge öne gelir.',
            'Sağdaki Karar Formu\'nda bir karar işaretle ve MÜHÜRLE. Mühür vurulan karar geri alınmaz.',
            'Sonuç fişi doğru kararı ve gerekçesini gösterir. Hatalardan öğrenmek en ucuz eğitimdir.',
          ],
        },
        {
          h: 'İnceleme modu (protokol dosyaları)',
          list: [
            'Form kontrolü, rüçhan, itiraz süresi ve yenileme dosyalarında belgeler birbiriyle çelişebilir.',
            'İNCELE düğmesine bas (ya da I tuşu), sonra çelişen iki alana sırayla tıkla.',
            'Gerçek bir uyuşmazlık bulursan masada kırmızı çizgiyle işaretlenir ve titizlik primi kazanırsın.',
          ],
        },
        {
          h: 'Para, itibar, disiplin',
          list: [
            'Doğru işlenen dosya vekalet ücreti getirir. Ücret itibarınla artar ya da azalır.',
            'Günde iki hata yalnızca uyarıyla geçer; sonrakiler için müvekkile tazminat ödersin.',
            'Akşam kira, maaş ve faturalar düşülür. Birikimin iki akşam üst üste eksiye düşerse büro kapanır.',
            'Meslek etiğine aykırı tercihler disiplin dosyana işlenir. Üç disiplin kaydı meslekten men demektir.',
          ],
        },
        {
          h: 'Kısayollar',
          list: ['Boşluk: sıradaki müvekkil', 'A–E ya da 1–5: karar seç', 'Enter: mühürle / fişi kapat', 'M: Mevzuat Klasörü · T: Süre Cetveli · I: İnceleme modu'],
        },
      ],
    },
    {
      id: 'sure',
      tab: 'Süreler',
      title: 'Süre Hesabı',
      unlock: 1,
      blocks: [
        {
          h: 'Temel kurallar',
          list: [
            'Ay ya da yıl olarak belirlenen süre, başlangıç gününe karşılık gelen günde biter. Örnek: 14.02.2024 + 2 ay = 14.04.2024.',
            'Son ayda karşılık gelen gün yoksa süre o ayın son günü biter. Örnek: 31.01.2025 + 1 ay = 28.02.2025.',
            'Kurum kararlarına karşı süreler kararın tarihinden değil, tebliğ tarihinden işlemeye başlar.',
            'Son gün resmî tatile denk gelirse süre izleyen ilk iş günü biter.',
            'Sınav sorularında aksi belirtilmedikçe tüm tarihler iş günü kabul edilir.',
          ],
        },
        {
          h: 'Büronun sık kullandığı süreler',
          table: {
            headers: ['İşlem', 'Süre', 'Başlangıç'],
            rows: [
              ['Patent / faydalı model rüçhanı', '12 ay', 'İlk başvuru tarihi'],
              ['Marka / tasarım rüçhanı', '6 ay', 'İlk başvuru tarihi'],
              ['Kurum kararına itiraz', '2 ay', 'Kararın tebliği'],
              ['YİDK kararına karşı dava', '2 ay', 'Kararın tebliği'],
              ['Marka başvurusunun yayımına itiraz', '2 ay', 'Bültende yayım'],
              ['Tasarım başvurusunun yayımına itiraz', '3 ay', 'Bültende yayım'],
              ['Coğrafi işaret başvurusunun yayımına itiraz', '3 ay', 'Bültende yayım'],
              ['Patent verilmesine itiraz', '6 ay', 'Patent verilmesi kararının Bültende yayımı'],
              ['Marka yenileme', 'Bitişten önceki 6 ay; ek ücretle bitişten sonraki 6 ay', 'Koruma süresinin sonu'],
            ],
          },
        },
      ],
    },
    {
      id: 'marka',
      tab: 'Marka',
      title: 'Marka',
      unlock: 1,
      blocks: [
        {
          h: 'Başvuru ve koruma',
          list: [
            'Marka; kişilerin mal veya hizmetlerini diğerlerinden ayırt etmeye yarayan ve sicilde gösterilebilen her türlü işarettir (kelime, şekil, renk, harf, rakam, ses, ambalaj vb.).',
            'Başvuru tarihi; talep dilekçesi, kimlik bilgileri, marka örneği, mal/hizmet listesi ve başvuru ücretinin ödendiğine ilişkin bilginin Kuruma ulaştığı an kesinleşir.',
            'Koruma süresi başvuru tarihinden başlar ve 10 yıldır; 10\'ar yıllık dönemlerle yenilenir.',
            'Mal ve hizmetler Nice sınıflandırmasına göre gösterilir: 1–34 mallar, 35–45 hizmetler.',
          ],
        },
        {
          h: 'Mutlak ret nedenleri (Kurum kendiliğinden inceler)',
          list: [
            'Marka olamayacak işaretler; ayırt edici niteliği bulunmayan işaretler.',
            'Malın/hizmetin cinsini, kalitesini, miktarını, amacını, değerini, coğrafi kaynağını vb. tanımlayan işaretler.',
            'Ticarette herkesçe kullanılan, belirli bir meslek grubunu tanımlayan işaretler.',
            'Aynı veya aynı türdeki mal/hizmetler için önceden tescil edilmiş ya da başvurusu yapılmış markayla aynı veya ayırt edilemeyecek kadar benzer işaretler.',
            'Malın doğasından kaynaklanan, teknik sonuç için zorunlu ya da mala esaslı değer veren şekiller.',
            'Halkı yanıltacak işaretler; kamu düzenine veya genel ahlaka aykırı işaretler; dini değer taşıyan semboller.',
            'Paris Sözleşmesi 6ter kapsamındaki devlet armaları, bayraklar, resmî damga ve işaretler (izinsiz).',
          ],
        },
        {
          h: 'Nispi ret nedenleri (yalnızca itiraz üzerine)',
          list: [
            'Önceki marka ile aynılık/benzerlik ve buna bağlı karıştırılma ihtimali.',
            'Tanınmış markalar ve itibarlı markalardan haksız yararlanma ya da itibarın zedelenmesi.',
            'Vekil veya temsilcinin, marka sahibinin izni olmadan kendi adına yaptığı başvuru.',
            'Tescilsiz olarak ticarette kullanılan önceki markalar, ticaret unvanı, ad, telif gibi önceki haklar.',
            'Kötü niyetle yapılan başvurular.',
          ],
        },
        {
          h: 'İtiraz, kullanım ispatı, iptal',
          list: [
            'Bültende yayımlanan başvuruya yayım tarihinden itibaren 2 ay içinde itiraz edilir.',
            'İtiraz, başvuru tarihi itibarıyla 5 yıldan uzun süredir tescilli bir markaya dayanıyorsa başvuru sahibi kullanım ispatı isteyebilir.',
            'Tescilden itibaren 5 yıl içinde haklı neden olmaksızın ciddi kullanım yoksa ya da kullanım 5 yıl kesintiye uğrarsa marka iptal edilebilir. 10.01.2024\'ten bu yana iptal talepleri Kuruma yapılır.',
            'Kurum kararlarına tebliğden itibaren 2 ay içinde itiraz edilir; itirazı YİDK karara bağlar. YİDK kararlarına karşı tebliğden itibaren 2 ay içinde Ankara Fikri ve Sınai Haklar Hukuk Mahkemesinde dava açılır.',
          ],
        },
        {
          h: 'Devir, lisans, özel marka türleri',
          list: [
            'Sınai mülkiyet haklarının devri yazılı yapılır ve noterce onaylanır; sicile kayıt üçüncü kişilere karşı ileri sürülebilirlik sağlar.',
            'Ortak marka ve garanti markası başvurularında markanın kullanım şartlarını gösteren teknik şartname sunulur.',
          ],
        },
      ],
    },
    {
      id: 'nice',
      tab: 'Nice',
      title: 'Nice Sınıf Cetveli (büro özeti)',
      unlock: 1,
      nice: true,
      blocks: [
        {
          h: 'Sık karıştırılanlar',
          list: [
            'Bira 32. sınıftadır; rakı, şarap gibi diğer alkollü içkiler 33. sınıftadır.',
            'Kayıtlı/indirilebilir yazılım bir maldır (9); yazılım tasarım ve geliştirme bir hizmettir (42).',
            'Ayakkabı ve şapka giysiyle birlikte 25. sınıftadır; çanta ve şemsiye deri ürünleriyle 18. sınıftadır.',
            'Zeytinyağı, peynir, reçel 29; kahve, çay, bal, lokum 30. sınıftadır.',
            'Restoran ve otel 43; tur ve seyahat düzenleme 39; reklamcılık 35. sınıftadır.',
          ],
        },
      ],
    },
    {
      id: 'patent',
      tab: 'Patent',
      title: 'Patent ve Faydalı Model',
      unlock: 1,
      blocks: [
        {
          h: 'Koruma koşulları ve süreler',
          list: [
            'Patent: yenilik + buluş basamağı + sanayiye uygulanabilirlik. Koruma başvuru tarihinden itibaren 20 yıl; uzatılamaz.',
            'Faydalı model: yenilik + sanayiye uygulanabilirlik. Koruma başvuru tarihinden itibaren 10 yıl; uzatılamaz.',
            'Faydalı modelle korunamaz: usuller ve bu usullerle elde edilen ürünler, kimyasal ve biyolojik maddeler/usuller, farmasötik maddeler, biyoteknolojik buluşlar.',
            'Başvuru tarihi için: talep, başvuru sahibinin kimlik/iletişim bilgisi ve tarifname (herhangi bir dilde) ya da önceki bir başvuruya atıf yeterlidir.',
          ],
        },
        {
          h: 'Buluş sayılmayanlar (kendileri)',
          list: [
            'Keşifler, bilimsel teoriler, matematik yöntemleri.',
            'Estetik yaratımlar; zihni faaliyet, iş ve oyun plan, kural ve yöntemleri.',
            'Bilgisayar programları; bilginin sunumu.',
          ],
        },
        {
          h: 'Patent verilmeyecek konular',
          list: [
            'Kamu düzenine veya genel ahlaka aykırı buluşlar.',
            'Bitki ve hayvan türleri ile esas itibarıyla biyolojik olan üretim yöntemleri.',
            'İnsan veya hayvan vücuduna uygulanacak teşhis, tedavi ve cerrahi yöntemleri.',
            'İnsan vücudunun oluşum ve gelişiminin çeşitli aşamaları; insan klonlama ve benzeri süreçler.',
          ],
        },
        {
          h: 'Süreç',
          list: [
            'Başvuru, başvuru (varsa rüçhan) tarihinden itibaren 18 ay geçince yayımlanır; erken yayım istenebilir.',
            'Başvuru tarihinden önceki 12 ay içinde buluşu yapanın kendi açıklaması yeniliği bozmaz.',
            'Araştırma raporu, ardından inceleme raporu; patent verilmesine Bültende yayımdan itibaren 6 ay içinde itiraz edilebilir.',
            'Yıllık ücret süresinde ödenmezse 6 ay içinde ek ücretle ödenebilir; o da ödenmezse hak sona erer.',
            'Hizmet buluşunu çalışan işverenine yazılı ve gecikmeksizin bildirir.',
          ],
        },
      ],
    },
    {
      id: 'rucan',
      tab: 'Rüçhan',
      title: 'Rüçhan Protokolü',
      unlock: 2,
      blocks: [
        {
          h: 'Rüçhan hakkı nedir',
          list: [
            'Paris Sözleşmesine taraf bir ülkede (veya DTÖ üyesinde) usulüne uygun ilk başvuruyu yapan ya da halefi, aynı konu için Türkiye\'de belirli süre içinde başvururken ilk başvurunun tarihini öne sürebilir.',
            'Süreler: patent ve faydalı model için 12 ay; marka ve tasarım için 6 ay. Süre ilk başvuru tarihinden işler.',
          ],
        },
        {
          h: 'Masada kontrol et',
          list: [
            'Rüçhan belgesindeki başvuru sahibi ile Türkiye başvurusunun sahibi aynı mı? Farklıysa devir/halefiyet belgesi şart.',
            'Taslaktaki rüçhan numarası ve tarihi, onaylı belgedeki bilgilerle birebir aynı mı?',
            'Bugün, ilk başvuru tarihine süre eklenerek bulunan son günden sonra mı? Sonraysa rüçhan talep edilemez.',
            'Rüçhan belgesinin başvuruyla aynı gün masada olması gerekmez; belge sonradan sunulabilir.',
          ],
        },
      ],
    },
    {
      id: 'intl',
      tab: 'PCT/EPC',
      title: 'Uluslararası Patent Sistemleri',
      unlock: 3,
      blocks: [
        {
          h: 'PCT',
          list: [
            'Tek bir uluslararası başvuru, sözleşmeye taraf devletlerin tamamında ulusal başvuru etkisi doğurur; patenti ulusal/bölgesel ofisler verir.',
            'Uluslararası araştırma raporu ve yazılı görüş düzenlenir; başvuru, rüçhan tarihinden itibaren 18 ay geçince WIPO tarafından yayımlanır.',
            'Türkiye\'de ulusal aşamaya geçiş süresi rüçhan tarihinden itibaren 30 aydır.',
            'TÜRKPATENT, Türk vatandaşları ve Türkiye\'de yerleşikler için kabul ofisi olarak görev yapar.',
          ],
        },
        {
          h: 'Avrupa Patenti (EPC)',
          list: [
            'Türkiye Avrupa Patent Sözleşmesine taraftır; Avrupa Patent Ofisi (EPO) tek başvuruyla birden çok ülke için patent verir.',
            'Avrupa patentinin Türkiye\'de geçerli olması için verilme ilanından itibaren 3 ay içinde Türkçe çeviri Kuruma sunulur ve ücret ödenir.',
            'EPO\'da patent verilmesine karşı itiraz süresi, verilme ilanından itibaren 9 aydır.',
          ],
        },
      ],
    },
    {
      id: 'tasarim',
      tab: 'Tasarım',
      title: 'Tasarım',
      unlock: 4,
      blocks: [
        {
          h: 'Koruma koşulları',
          list: [
            'Tasarım korumasının koşulları yenilik ve ayırt edici niteliktir.',
            'Bileşik ürünün normal kullanımında görünmeyen parçaları korunmaz.',
            'Başvuru tarihinden önceki 12 ay içinde tasarımcı ya da halefi tarafından kamuya sunulması yeniliği bozmaz.',
          ],
        },
        {
          h: 'Süreler',
          list: [
            'Tescilli tasarım: başvuru tarihinden itibaren 5 yıl; 5\'er yıllık dönemlerle yenilenerek toplam 25 yıla kadar.',
            'Tescilsiz tasarım: Türkiye\'de kamuya ilk sunulduğu tarihten itibaren 3 yıl.',
            'Rüçhan süresi 6 ay; yayımın ertelenmesi en fazla 30 ay istenebilir.',
            'Yayımlanan tasarım başvurusuna yayım tarihinden itibaren 3 ay içinde itiraz edilir.',
          ],
        },
        {
          h: 'Uluslararası',
          list: ['Lahey Anlaşması ile tek uluslararası başvuruyla birden çok ülkede tasarım koruması istenebilir (WIPO).'],
        },
      ],
    },
    {
      id: 'itiraz',
      tab: 'İtiraz',
      title: 'İtiraz ve Dava Protokolü',
      unlock: 4,
      blocks: [
        {
          h: 'Hangi yol, hangi süre',
          table: {
            headers: ['Durum', 'Yol', 'Süre'],
            rows: [
              ['Kurum bir başvuruyu reddetti', 'Kuruma itiraz (YİDK inceler)', 'Tebliğden itibaren 2 ay'],
              ['YİDK itirazı karara bağladı', 'Ankara FSHHM\'de dava', 'Tebliğden itibaren 2 ay'],
              ['Rakip marka başvurusu yayımlandı', 'Yayıma itiraz', 'Yayımdan itibaren 2 ay'],
              ['Tasarım başvurusu yayımlandı', 'Yayıma itiraz', 'Yayımdan itibaren 3 ay'],
            ],
          },
        },
        {
          h: 'Masada kontrol et',
          list: [
            'Süreyi karar tarihinden değil tebliğ tarihinden say.',
            'Kurum kararına karşı doğrudan dava açılmaz; önce itiraz yolu tüketilir.',
            'Marka yayımına itiraz 2 ay, tasarım yayımına itiraz 3 aydır; ikisini karıştırma.',
          ],
        },
      ],
    },
    {
      id: 'yenileme',
      tab: 'Yenileme',
      title: 'Marka Yenileme Protokolü',
      unlock: 6,
      blocks: [
        {
          h: 'Hesap',
          list: [
            'Koruma, tescil tarihinden değil başvuru tarihinden başlar: bitiş = başvuru tarihi + 10 yıl (her yenilemede +10 yıl).',
            'Olağan yenileme: bitişten önceki 6 ay içinde.',
            'Ek süre: bitişten itibaren 6 ay içinde, ek ücretle.',
            'Ek süre de geçtiyse tescil yenilenemez; yeni başvuru gerekir.',
            'Yenileme talebi marka sahibi ya da onun yetkilendirdiği kişi tarafından yapılır.',
          ],
        },
      ],
    },
    {
      id: 'madrid',
      tab: 'Madrid',
      title: 'Madrid Sistemi',
      unlock: 6,
      blocks: [
        {
          h: 'Temel ilkeler',
          list: [
            'Uluslararası marka başvurusu, menşe ofisteki temel başvuru veya tescile dayanır ve menşe ofis aracılığıyla WIPO\'ya yapılır.',
            'Uluslararası tescil, tescil tarihinden itibaren 5 yıl boyunca temel başvuru/tescile bağımlıdır; bu dönemde temel hak düşerse uluslararası tescil de o ölçüde düşer.',
            'Belirlenen ülke ofisleri kendi mevzuatlarına göre koruma reddi bildirebilir.',
          ],
        },
      ],
    },
    {
      id: 'cografi',
      tab: 'Coğrafi İşaret',
      title: 'Coğrafi İşaret ve Geleneksel Ürün Adı',
      unlock: 7,
      blocks: [
        {
          h: 'Türler',
          list: [
            'Menşe adı: ürünün üretimi, işlenmesi ve diğer bütün işlemleri belirlenmiş coğrafi sınırlar içinde gerçekleşir; özellikleri esasen o yöreye ait doğal ve beşerî unsurlardan kaynaklanır.',
            'Mahreç işareti: üretim, işleme ve diğer işlemlerden en az biri belirlenmiş coğrafi sınırlar içinde gerçekleşir; ürün bir niteliği, ünü veya diğer özellikleriyle o yöreyle özdeşleşmiştir.',
            'Geleneksel ürün adı: coğrafi işaret niteliği olmayan, kamuoyunda en az 30 yıldır kullanıldığı ispat edilen ad.',
          ],
        },
        {
          h: 'Süreç ve kullanım',
          list: [
            'Başvuruyu üreticiler, üretici grupları, tüketici dernekleri, ürünle ilgili kamu kurum ve kuruluşları ve meslek kuruluşları yapabilir.',
            'Yayımlanan başvuruya yayım tarihinden itibaren 3 ay içinde itiraz edilebilir.',
            'Tescilli coğrafi işaretin koruması süresizdir; ürünler amblemle birlikte kullanılır.',
            'Denetim en az yılda bir kez yapılır ve denetim raporları Kuruma sunulur.',
          ],
        },
      ],
    },
    {
      id: 'vekillik',
      tab: 'Vekillik',
      title: 'Vekillik ve Meslek Etiği',
      unlock: 8,
      blocks: [
        {
          h: 'Temsil',
          list: [
            'Patent vekilliği ve marka vekilliği ayrı sicillere kayıtlı ayrı mesleklerdir.',
            'Türkiye\'de yerleşik olmayanlar Kurum nezdindeki işlemlerini vekil aracılığıyla yürütür.',
            'Vekil, müvekkilinin işini özenle ve sadakatle yürütür; öğrendiği sırları saklar.',
          ],
        },
        {
          h: 'Etik pusula (büro politikası)',
          list: [
            'Aynı uyuşmazlıkta karşı tarafı temsil etmek çıkar çatışmasıdır.',
            'Başkasına ait bilinen bir markayı, sahibinden önce tescil ettirmeye çalışmak kötü niyetli başvurudur.',
            'Kaçırılan süreyi müvekkilden saklamak, hatanın kendisinden ağırdır.',
            'Kurumda "tanıdık" vaat eden aracılar meslekten men sebebidir.',
          ],
        },
      ],
    },
    {
      id: 'hukuk',
      tab: 'Genel Hukuk',
      title: 'Genel Hukuk Notları',
      unlock: 8,
      blocks: [
        {
          h: 'Kişiler hukuku (TMK)',
          list: [
            'Her insanın hak ehliyeti vardır; ayırt etme gücüne sahip, ergin ve kısıtlı olmayan kişinin fiil ehliyeti vardır.',
            'Erginlik 18 yaşın doldurulmasıyla başlar; evlenme ve mahkeme kararıyla da ergin olunabilir.',
          ],
        },
        {
          h: 'Vekâlet sözleşmesi (TBK)',
          list: [
            'Vekil, üstlendiği işi vekâlet verenin haklı menfaatlerine uygun olarak özenle yürütür ve hesap verir.',
            'Dava açma, sulh olma, hakeme başvurma, kambiyo taahhüdü, bağışlama, kefil olma ve taşınmaz devri gibi işler için özel yetki gerekir.',
            'Taraflar vekâlet sözleşmesini her zaman sona erdirebilir; uygun olmayan zamanda sona erdiren zarardan sorumludur.',
          ],
        },
        {
          h: 'Ticaret hukuku (TTK)',
          list: [
            'Gerçek kişi tacirin ticaret unvanı, kısaltılmamış ad ve soyadından oluşur; ek yapılabilir.',
            'İşletme adı, işletmeyi tanıtmak için kullanılan addır ve tacirin unvanından ayrıdır.',
            'Haksız rekabet; dürüstlük kuralına aykırı aldatıcı davranış ve uygulamalardır. Davalar öğrenmeden itibaren 1 yıl, her hâlde 3 yıl içinde açılır.',
          ],
        },
      ],
    },
  ];
})();
