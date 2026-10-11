/* VEKİL — Kariyer modu: günler, sabah bülteni, olaylar ve sonlar. */
(function () {
  'use strict';
  const VK = window.VK;

  VK.CAMPAIGN = {
    start: '03.03.2025', // Pazartesi
    startMoney: 6000,
    startRep: 50,
    dayStart: 9 * 60, // 09:00
    dayEnd: 18 * 60, // 18:00
    fixedCosts: [
      { id: 'kira', label: 'Büro kirası (Moda, 2. kat)', amount: 3200 },
      { id: 'personel', label: 'Sekreter maaşı — Nermin Hanım', amount: 2100 },
      { id: 'fatura', label: 'Elektrik, internet, telefon', amount: 500 },
    ],
    dailyOptions: [
      { id: 'stajyer', label: 'Stajyer Deniz', amount: 900, desc: 'Yarın 2 kez "Stajyere sor": iki yanlış seçeneği eler.' },
      { id: 'abonelik', label: 'Mevzuat veri tabanı aboneliği', amount: 450, desc: 'Yarın her dosyada bir ipucu notu açabilirsin.' },
    ],
    oneTime: [{ id: 'kahve', label: 'Espresso makinesi (tek sefer)', amount: 2600, desc: 'Sabahları daha erken başlarsın: mesai 08:15\'te açılır.' }],

    days: [
      {
        n: 1,
        title: 'Kapıda tabela',
        topics: { marka: 3, patent: 3 },
        maxDiff: 2,
        exam: 4,
        proc: ['sinif', 'sinif'],
        unlock: ['buro', 'sure', 'marka', 'nice', 'patent'],
        memo: 'Bugün ağırlıklı olarak marka başvuruları ve temel patent soruları var. Nermin Hanım\'ın hazırladığı başvuru formlarını Nice cetveliyle karşılaştır. İlk gün stajyer Deniz ve mevzuat veri tabanı deneme amaçlı ücretsiz; yarından sonrası için akşam karar verirsin.',
        news: {
          headline: 'Moda\'da yeni bir vekil bürosu açıldı',
          deck: 'Sicile yeni kaydolan vekil, ilk müvekkillerini bekliyor',
          items: [
            ['Başvurular rekor kırdı', 'Geçen yıl marka başvurularında yine yüksek bir sayıya ulaşıldı. Uzmanlar, doğru sınıf seçiminin itiraz riskini azalttığını hatırlatıyor.'],
            ['Hatırlatma', 'Bira 32., rakı ve şarap 33. sınıftadır. Sınıf hatası bir başvuruyu en baştan zayıflatır.'],
          ],
        },
      },
      {
        n: 2,
        title: 'Yurt dışından gelenler',
        topics: { patent: 5, marka: 1 },
        maxDiff: 2,
        exam: 5,
        proc: ['rucan', 'rucan', 'sinif'],
        unlock: ['rucan'],
        protocol: 'YENİ PROTOKOL: Rüçhan kontrolü. Yabancı başvuruya dayanan taleplerde süreyi, başvuru sahibini ve rüçhan bilgilerini doğrula.',
        memo: 'Yurt dışında ilk başvurusunu yapmış müvekkiller geliyor. Patent ve faydalı modelde 12, marka ve tasarımda 6 ay.',
        news: {
          headline: 'Yerli Ar-Ge yurt dışına açılıyor',
          deck: 'Firmalar Almanya ve Japonya\'daki ilk başvurularını Türkiye\'ye taşıyor',
          items: [
            ['Rüçhan uyarısı', 'Rüçhan süresi ilk başvuru tarihinden işler. Patentte 12 ay, markada 6 ay.'],
            ['Kısa kısa', 'Bir müvekkil, rüçhan belgesi gelmeden başvuru yapılamayacağını sanıyordu. Belge sonradan sunulabilir.'],
          ],
        },
      },
      {
        n: 3,
        title: 'İstemler ve sınırlar',
        topics: { patent: 4, patent_intl: 3 },
        exam: 6,
        proc: ['rucan'],
        unlock: ['intl'],
        event: { id: 'kotuNiyet', at: 3 },
        memo: 'PCT ve Avrupa patenti dosyaları masada. İstem yorumlarına dikkat.',
        news: {
          headline: 'PCT başvurularında Türkiye çıkışı',
          deck: 'Ulusal aşamaya geçişte 30 aylık süre yine gündemde',
          items: [
            ['Uzman görüşü', 'Avrupa patentinin Türkiye\'de geçerli olması için çeviri ve ücret süresi kaçırılmamalı.'],
            ['Piyasa', 'Yurt dışında ünlü olup Türkiye\'de tescilsiz kalan markalar için "kapmaca" teklifleri artıyor.'],
          ],
        },
      },
      {
        n: 4,
        title: 'Biçim ve görünüm',
        topics: { tasarim: 5, patent: 1, marka: 1 },
        exam: 6,
        proc: ['itiraz', 'itiraz'],
        unlock: ['tasarim', 'itiraz'],
        protocol: 'YENİ PROTOKOL: İtiraz süresi kontrolü. Süreyi tebliğ ya da yayım tarihinden say; marka 2, tasarım 3 ay.',
        memo: 'Tasarım günü. Yenilik, ayırt edicilik ve süreler.',
        news: {
          headline: 'Mobilya fuarında tasarım kavgası',
          deck: 'Tescilsiz tasarımın 3 yıllık koruması mahkemelik oldu',
          items: [
            ['Not', 'Tasarım tescili 5 yıllık dönemlerle en fazla 25 yıl korunur.'],
            ['Büro duyurusu', 'Kurum kararlarına itiraz süresi tebliğden işler. Karar tarihine bakıp süreyi kaçırmayın.'],
          ],
        },
      },
      {
        n: 5,
        title: 'Karıştırılma ihtimali',
        topics: { marka: 6 },
        exam: 6,
        proc: ['itiraz', 'sinif'],
        event: { id: 'cikarCatismasi', at: 2 },
        memo: 'Marka ret nedenleri ve itirazlar. Mutlak ile nispi ret nedenlerini ayırt et.',
        news: {
          headline: 'Benzer markalar savaşı büyüyor',
          deck: 'Yayıma itiraz başvurularında artış',
          items: [
            ['Hatırlatma', 'Nispi ret nedenleri yalnızca itiraz üzerine incelenir.'],
            ['Kulis', 'Bir tekstil firması, rakibinin vekilini kendi tarafına çekmeye çalıştığı iddiasıyla gündemde.'],
          ],
        },
      },
      {
        n: 6,
        title: 'On yılın sonu',
        topics: { marka: 4, marka_intl: 3 },
        exam: 6,
        proc: ['yenileme', 'yenileme', 'itiraz'],
        unlock: ['yenileme', 'madrid'],
        protocol: 'YENİ PROTOKOL: Marka yenileme. Bitiş = başvuru tarihi + 10 yıl. Olağan dönem bitişten önceki 6 ay, ek süre bitişten sonraki 6 ay.',
        memo: 'Yenileme ve Madrid dosyaları. Koruma başvuru tarihinden başlar, tescil tarihinden değil.',
        consequences: ['kotuNiyet'],
        news: {
          headline: 'Eski markalar yenilenmeyi bekliyor',
          deck: '2015\'te başvurusu yapılan binlerce marka için yenileme dönemi açıldı',
          items: [
            ['Madrid', 'Uluslararası tescil 5 yıl boyunca temel başvuru veya tescile bağlı kalır.'],
            ['Kısa kısa', 'Yenilemeyi kaçıran firmalara 6 aylık ek süre, ek ücretle tanınıyor.'],
          ],
        },
      },
      {
        n: 7,
        title: 'Yöreden gelen lezzet',
        topics: { cografi: 5, marka: 2 },
        exam: 6,
        proc: ['yenileme', 'sinif'],
        unlock: ['cografi'],
        event: { id: 'kacanSure', at: 1 },
        memo: 'Coğrafi işaret dosyaları. Menşe adı mı, mahreç işareti mi?',
        news: {
          headline: 'Yöresel ürünlerde tescil seferberliği',
          deck: 'Belediyeler ve ticaret odaları coğrafi işaret başvurularını hızlandırdı',
          items: [
            ['Bilgi', 'Menşe adında tüm üretim aşamaları yörede gerçekleşir; mahreç işaretinde en az biri yeterlidir.'],
            ['Denetim', 'Tescilli coğrafi işaretlerin denetimi en az yılda bir kez yapılır.'],
          ],
        },
      },
      {
        n: 8,
        title: 'Kural kitabı',
        topics: { vekillik: 3, genel_hukuk: 5 },
        exam: 6,
        proc: ['itiraz', 'rucan'],
        unlock: ['vekillik', 'hukuk'],
        event: { id: 'tanidik', at: 3 },
        consequences: ['cikarCatismasi'],
        memo: 'Vekâlet, ehliyet, ticaret unvanı… Meslek hukuku ve genel hukuk günü.',
        news: {
          headline: 'Disiplin Kurulu\'ndan uyarı',
          deck: 'Meslek etiğine aykırı davranan vekillere yaptırımlar ağırlaşıyor',
          items: [
            ['Hatırlatma', 'Dava açmak, sulh olmak ve hakeme başvurmak için vekâletnamede özel yetki gerekir.'],
            ['Kulis', 'Kurumda "tanıdığı olduğunu" söyleyen aracılara karşı vekiller uyarıldı.'],
          ],
        },
      },
      {
        n: 9,
        title: 'Ağırlaşan dosyalar',
        topics: { patent: 3, tasarim: 2, marka: 3, cografi: 1 },
        minDiff: 2,
        exam: 7,
        proc: ['yenileme', 'itiraz'],
        consequences: ['kacanSure', 'tanidik'],
        memo: 'Karma ve zor dosyalar. Acele etme, hesabı iki kez yap.',
        news: {
          headline: 'Büronuzun adı duyulmaya başladı',
          deck: 'Müvekkiller artık daha karmaşık dosyalarla geliyor',
          items: [
            ['Not', 'Patent verilmesine itiraz süresi, verilme kararının yayımından itibaren 6 aydır.'],
            ['Takvim', 'Yarın büronun ilk iki haftasının değerlendirmesi yapılacak.'],
          ],
        },
      },
      {
        n: 10,
        title: 'Büyük gün',
        topics: { patent: 2, patent_intl: 1, tasarim: 1, marka: 2, marka_intl: 1, cografi: 1, vekillik: 1, genel_hukuk: 1 },
        minDiff: 2,
        exam: 8,
        proc: ['sinif', 'rucan', 'itiraz', 'yenileme'],
        memo: 'Son gün: her türden dosya. Büro ortaklığı teklifi bu günün sonuna bağlı.',
        news: {
          headline: 'Köklü büro ortak arıyor',
          deck: 'Kıdemli vekil Aydan Ertürk, genç bir ortakla yola devam etmek istiyor',
          items: [
            ['Kulis', 'Ertürk\'ün ölçütü belli: doğru iş, temiz sicil, sağlam kasa.'],
            ['Hatırlatma', 'Bütün protokoller bugün masada.'],
          ],
        },
      },
    ],

    // Etik olaylar: masaya özel bir "müvekkil" olarak gelir
    events: {
      kotuNiyet: {
        title: 'Cazip bir teklif',
        client: { name: 'Mert Başaran', sector: 'İthalat', kind: 'kişi' },
        line: 'Ücretinizi üç katı öderim. Kimse bir şey anlamaz.',
        body:
          'Yurt dışında çok satan LUMERA kozmetik markası Türkiye\'de henüz tescilli değil. Mert Bey, markayı kendi adına tescil ettirmek, gerçek sahibi Türkiye\'ye girmek istediğinde de markayı ona yüksek bir bedelle satmak istiyor. Başvuruyu senin yapmanı istiyor.',
        choices: [
          { id: 'kabul', label: 'Kabul et, başvuruyu hazırla', money: 9000, rep: 0, flag: 'kotuNiyet', reply: 'Mert Bey zarfı masaya bırakıp gidiyor.' },
          { id: 'red', label: 'Reddet: bu kötü niyetli bir başvuru olur', money: 0, rep: 3, reply: 'Mert Bey homurdanarak çıkıyor.' },
          {
            id: 'yonlendir',
            label: 'Reddet ve özgün bir marka yaratmasını öner',
            money: 1200,
            rep: 5,
            reply: 'Mert Bey ikna oluyor; özgün marka için danışmanlık ücreti ödüyor.',
          },
        ],
      },
      cikarCatismasi: {
        title: 'İki taraf, bir vekil',
        client: { name: 'Delta Örme Tekstil A.Ş.', sector: 'Tekstil', kind: 'firma' },
        line: 'Sizin müvekkilinizin başvurusuna itiraz edeceğiz. En iyi siz bilirsiniz.',
        body:
          'Delta Örme, müvekkilin Sedir Tekstil\'in yeni marka başvurusunun yayımına itiraz etmek istiyor ve seni vekil olarak tutmak istiyor. Dosyanın ayrıntılarını zaten biliyorsun.',
        choices: [
          { id: 'kabul', label: 'Kabul et: iş iştir', money: 6000, rep: 0, flag: 'cikarCatismasi', reply: 'Delta\'nın temsilcisi memnun ayrılıyor.' },
          { id: 'red', label: 'Reddet: bu bir çıkar çatışması', money: 0, rep: 3, reply: 'Temsilci başka bir büroya gidiyor.' },
          { id: 'yonlendir', label: 'Reddet ve bağımsız bir meslektaşa yönlendir', money: 0, rep: 5, reply: 'Temsilci teşekkür ediyor; meslektaşın da sana minnettar.' },
        ],
      },
      kacanSure: {
        title: 'Nermin Hanım\'ın itirafı',
        client: { name: 'Nermin Hanım (sekreter)', sector: 'Büro içi', kind: 'büro' },
        portrait: { style: 3, glasses: true },
        line: 'Ajandaya yanlış tarih yazmışım… Çok özür dilerim.',
        body:
          'Bir müvekkilin marka başvurusuna ilişkin ret kararına itiraz süresi dün dolmuş. Tarih ajandaya yanlış işlenmiş. Müvekkil henüz bir şey bilmiyor.',
        choices: [
          {
            id: 'bildir',
            label: 'Müvekkili hemen ara, durumu dürüstçe anlat',
            money: -2000,
            rep: -2,
            reply: 'Müvekkil kızgın ama dürüstlüğünü takdir ediyor. Mesleki sorumluluk sigortası zararın bir kısmını karşılıyor.',
          },
          { id: 'sakla', label: 'Şimdilik sakla, belki fark etmez', money: 0, rep: 0, flag: 'kacanSure', reply: 'Nermin Hanım rahatlamış görünmüyor.' },
        ],
      },
      tanidik: {
        title: 'Kurumda tanıdık',
        client: { name: 'Adı verilmeyen bir aracı', sector: '—', kind: 'kişi' },
        portrait: { glasses: true, mustache: true, tie: false },
        line: 'Dosyanızı öne aldırırım. Yarısı benden, yarısı sizden.',
        body:
          'Ziyaretçi, Kurumda bir tanıdığı olduğunu, bekleyen bir dosyanı "hızlandırabileceğini" söylüyor. Karşılığında para istiyor ve senin de pay alacağını ima ediyor.',
        choices: [
          { id: 'kabul', label: 'Teklifi kabul et', money: 5000, rep: 0, flag: 'tanidik', reply: 'Ziyaretçi gülümseyerek ayrılıyor.' },
          { id: 'red', label: 'Kesinlikle reddet ve kapıyı göster', money: 0, rep: 4, reply: 'Ziyaretçi sessizce çıkıyor.' },
        ],
      },
    },

    // Kötü tercihlerin sonradan gelen bedeli (sabah bülteninde)
    consequences: {
      kotuNiyet: {
        headline: 'LUMERA\'nın gerçek sahibi harekete geçti',
        text: 'Yabancı kozmetik firması, Türkiye\'deki başvurunun kötü niyetle yapıldığını ileri sürdü. Başvuruyu yapan vekil hakkında disiplin şikâyetinde bulunuldu.',
        rep: -15,
        discipline: 1,
        money: 0,
      },
      cikarCatismasi: {
        headline: 'Disiplin Kurulu\'ndan çıkar çatışması kararı',
        text: 'Sedir Tekstil, kendi vekilinin karşı tarafı temsil ettiğini öğrendi. Şikâyet üzerine disiplin kaydı işlendi; Sedir Tekstil dosyalarını geri çekti.',
        rep: -12,
        discipline: 1,
        money: 0,
      },
      kacanSure: {
        headline: 'Saklanan süre ortaya çıktı',
        text: 'Müvekkil, itiraz süresinin kaçırıldığını ve kendisinden saklandığını öğrendi. Tazminat talebi ve disiplin şikâyeti peş peşe geldi.',
        rep: -15,
        discipline: 1,
        money: -6000,
      },
      tanidik: {
        headline: 'Kurumda aracılık soruşturması',
        text: 'Kurum adına çıkar vaat eden aracı yakalandı. İfadesinde iş yaptığı vekillerin adlarını verdi.',
        rep: -20,
        discipline: 2,
        money: 0,
      },
    },

    endings: {
      men: {
        title: 'Meslekten men',
        tone: 'bad',
        text: 'Disiplin Kurulu kararını verdi: sicilinden silinmene karar verildi. Büronun tabelası indirildi. Etik dışı her kestirme yol, sonunda dosyanın en ağır sayfası oldu.',
      },
      iflas: {
        title: 'Büro kapandı',
        tone: 'bad',
        text: 'Kirayı iki ay üst üste ödeyemedin. Ev sahibi anahtarı geri istedi, Nermin Hanım başka bir büroda işe başladı. Mesleğin mali tarafı da en az hukuki tarafı kadar ciddi.',
      },
      itibar: {
        title: 'Müvekkilsiz kaldın',
        tone: 'bad',
        text: 'Hatalı tavsiyeler kulaktan kulağa yayıldı; bekleme salonu boş kaldı. Belki birkaç ay bir büroda kıdemli bir vekilin yanında çalışmak iyi gelir.',
      },
      ortak: {
        title: 'Ortaklık teklifi',
        tone: 'good',
        text: 'Aydan Ertürk dosyalarını inceledi, sicilini kontrol etti, kasaya baktı ve elini uzattı: "Ertürk & Ortağı. Tabelada senin adın da olacak." İki haftada temiz bir sicil, isabetli kararlar ve sağlam bir kasa kurdun.',
      },
      saglam: {
        title: 'Kendi yolunda bir vekil',
        tone: 'good',
        text: 'Ortaklık teklifi gelmedi ama müvekkillerin seni tavsiye ediyor. Büron ayakta, sicilin temiz. Önümüzdeki aylar daha büyük dosyalar getirecek.',
      },
      lekeli: {
        title: 'Lekeli kasa',
        tone: 'mixed',
        text: 'Kasa dolu ama koridorlarda adın fısıltıyla anılıyor. Aydan Ertürk dosyana baktı ve teklifini geri çekti: "Ben müvekkillerimin güvenini satın alamam."',
      },
      zor: {
        title: 'Zor bir başlangıç',
        tone: 'mixed',
        text: 'İki haftayı atlattın ama hatalar da az değildi. Mevzuat Klasörü ve Serbest Çalışma masası seni bekliyor; bir sonraki dönemde daha hazırlıklı olacaksın.',
      },
    },

    // Masadaki küçük tepkiler
    reactions: {
      good: [
        'İçim rahatladı, teşekkürler.',
        'Tam da duymak istediğim buydu.',
        'Sizi herkese tavsiye edeceğim.',
        'Harika, hemen işlemlere başlayalım.',
        'Dosya emin ellerde.',
        'Çok net anlattınız, sağ olun.',
      ],
      bad: [
        'Emin misiniz? Bir de başka büroya soracağım.',
        'Bu tavsiyeyle başımız derde girmesin…',
        'Hmm. Yönetim kuruluna nasıl anlatacağım bunu?',
        'Geçen sefer de böyle demiştiniz.',
        'Pek ikna olmadım açıkçası.',
      ],
    },
  };
})();
