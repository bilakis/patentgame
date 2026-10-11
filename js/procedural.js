/* VEKİL — Protokol dosyaları: belgeleri karşılaştırıp uyuşmazlık bulma (Papers, Please tarzı).
   Her üretici bir "dosya" döndürür: belgeler, karar seçenekleri, doğru karar, gerekçe ve
   inceleme modunda iki alanı karşılaştıran check(a, b) işlevi. Tarihler sınırdan en az 10 gün
   uzakta üretilir; böylece her vaka tek bir doğru cevaba sahiptir. */
(function () {
  'use strict';
  const VK = window.VK;
  const D = VK.D;

  /* ---------- İsim üreticileri ---------- */
  const FIRM_ROOTS = [
    'Sedirhan', 'Karaçam', 'Mavikuş', 'Toprakana', 'Gümüşsu', 'Akyel', 'Ilgaz', 'Defne', 'Narçiçeği', 'Çamlıbel',
    'Erguvan', 'Lodos', 'Poyraz', 'Ayçin', 'Beyazkule', 'Kırmızıtaş', 'Mercan', 'Lavanta', 'Turna', 'Sarmaşık',
    'Yeşilvadi', 'Altınbaşak', 'Kuzeyrüzgârı', 'Tunçel', 'Gökçeada', 'Bademli', 'Ardıç', 'Selvi', 'Kestane', 'Atlas',
  ];
  const FIRST = ['Selin', 'Murat', 'Elif', 'Kerem', 'Zeynep', 'Burak', 'Ayşe', 'Emre', 'Derya', 'Hakan', 'Gül', 'Tolga', 'Nur', 'Barış', 'Sevgi', 'Cem', 'İpek', 'Onur', 'Leyla', 'Serkan', 'Hülya', 'Okan', 'Melis', 'Yusuf'];
  const LAST = ['Aksoy', 'Demirtaş', 'Kaplan', 'Yalçın', 'Erdem', 'Toprak', 'Uçar', 'Sarı', 'Karaca', 'Ateş', 'Önal', 'Bilgin', 'Turan', 'Keskin', 'Aydın', 'Güneş', 'Tekin', 'Polat', 'Çetin', 'Koral'];
  const SYL = ['VE', 'LO', 'RA', 'NO', 'VA', 'Kİ', 'TE', 'LU', 'Mİ', 'SO', 'DA', 'ZE', 'NA', 'PA', 'Rİ', 'TO', 'MA', 'KA', 'LE', 'SU', 'NE', 'BO', 'RE', 'TA', 'Lİ', 'MO', 'SE', 'DU'];
  const FOREIGN = [
    { cc: 'DE', office: 'Alman Patent ve Marka Ofisi', owner: ['Hoffner Werkzeug GmbH', 'Brandt & Lenz AG', 'Kessler Optik GmbH'] },
    { cc: 'FR', office: 'Fransa Ulusal Sınai Mülkiyet Enstitüsü', owner: ['Maison Clavel SAS', 'Duret Industries SA', 'Atelier Morin SARL'] },
    { cc: 'IT', office: 'İtalya Patent ve Marka Ofisi', owner: ['Fratelli Corsini S.p.A.', 'Bellandi Design S.r.l.', 'Officine Riva S.p.A.'] },
    { cc: 'JP', office: 'Japonya Patent Ofisi', owner: ['Kitamura Seiki K.K.', 'Hoshino Denki K.K.', 'Aoyama Kogyo K.K.'] },
    { cc: 'KR', office: 'Kore Fikri Mülkiyet Ofisi', owner: ['Hanseo Materials Co., Ltd.', 'Daewon Lighting Co., Ltd.'] },
    { cc: 'ES', office: 'İspanya Patent ve Marka Ofisi', owner: ['Industrias Larrea S.L.', 'Cerámicas Ortuño S.A.'] },
  ];
  const SUBJECTS = {
    Patent: ['Isı geri kazanımlı endüstriyel kurutma fırını', 'Titreşim sönümleyen matkap ucu', 'Biyobozunur gıda ambalaj filmi', 'Su kaçağı algılayan akıllı vana'],
    'Faydalı model': ['Katlanabilir bisiklet kilidi', 'Kablo düzenleyici masa klipsi', 'Tek elle açılan saklama kabı'],
    Marka: ['Kelime markası', 'Şekil + kelime markası'],
    Tasarım: ['Seramik vazo', 'Masa lambası', 'Çocuk koltuğu', 'Parfüm şişesi'],
  };

  const makeMark = (r) => {
    const n = r.int(2, 3);
    let s = '';
    for (let i = 0; i < n; i++) s += r.pick(SYL);
    return s;
  };
  const person = (r) => r.pick(FIRST) + ' ' + r.pick(LAST);
  const firm = (r, sector, suffix) => r.pick(FIRM_ROOTS) + ' ' + sector + ' ' + (suffix || r.pick(['A.Ş.', 'Ltd. Şti.', 'San. ve Tic. A.Ş.']));
  const altSuffix = (name) => (name.endsWith('Ltd. Şti.') ? name.replace('Ltd. Şti.', 'A.Ş.') : name.replace(/(San\. ve Tic\. )?A\.Ş\.$/, 'Ltd. Şti.'));
  const appNo = (r, cc, y) => cc + ' ' + y + ' ' + String(r.int(100000, 999999));
  const regNo = (r, y) => y + '/' + String(r.int(10000, 99999));

  const F = (key, value, cls) => '<span class="fld' + (cls ? ' ' + cls : '') + '" data-k="' + key + '">' + VK.esc(value) + '</span>';
  const row = (label, valueHtml) => '<div class="kv"><span class="k">' + VK.esc(label) + '</span><span class="v">' + valueHtml + '</span></div>';

  // r ile [lo, hi] gün aralığında; koşul sağlanana kadar dener
  function pickDate(r, lo, hi, ok) {
    for (let i = 0; i < 200; i++) {
      const d = r.int(lo, hi);
      if (!ok || ok(d)) return d;
    }
    return lo;
  }

  /* ---------- 1) Marka başvuru formu / Nice sınıf kontrolü ---------- */
  const SECTORS = [
    { name: 'Gıda', classes: [29, 30, 32] },
    { name: 'İçecek', classes: [32, 33, 30] },
    { name: 'Restoran', classes: [43, 30, 29] },
    { name: 'Tekstil', classes: [25, 18, 24] },
    { name: 'Kozmetik', classes: [3, 5, 44] },
    { name: 'Yazılım', classes: [9, 42, 38] },
    { name: 'Otomotiv', classes: [12, 37, 35] },
    { name: 'Turizm', classes: [39, 43, 41] },
    { name: 'Ev Gereçleri', classes: [20, 21, 24] },
    { name: 'Spor', classes: [28, 25, 41] },
    { name: 'Yayıncılık', classes: [16, 41, 35] },
    { name: 'Kuyumculuk', classes: [14, 18, 35] },
  ];
  // Sık yapılan sınıf hataları: doğru → yanlış
  const TRAPS = { 32: [33, 30], 33: [32], 43: [35, 39], 25: [18, 24], 18: [25], 29: [30, 31], 30: [29], 9: [42], 42: [9, 35], 39: [43], 20: [21], 24: [25], 3: [5], 5: [3], 12: [37], 37: [12, 42], 14: [18], 16: [41], 41: [35], 21: [20], 28: [25], 38: [9], 35: [41], 44: [3] };

  function genSinif(r, ctx) {
    const sector = r.pick(SECTORS);
    const company = firm(r, sector.name);
    const mark = makeMark(r);
    const goods = sector.classes.map((c) => ({ cls: c, good: r.pick(VK.NICE.find((n) => n.no === c).goods) }));
    const scenario = ctx.scenario || r.pick(['ok', 'ok', 'class', 'class', 'class', 'owner', 'mark', 'missing']);
    const formRows = goods.map((g) => ({ ...g, shown: g.cls }));
    let wrongIdx = -1,
      missingIdx = -1;
    if (scenario === 'class') {
      wrongIdx = r.int(0, formRows.length - 1);
      const tr = TRAPS[formRows[wrongIdx].cls] || [formRows[wrongIdx].cls + 1];
      formRows[wrongIdx].shown = r.pick(tr);
    }
    if (scenario === 'missing') missingIdx = r.int(0, formRows.length - 1);
    const vekName = scenario === 'owner' ? altSuffix(company) : company;
    let formMark = mark;
    if (scenario === 'mark') {
      const i = r.int(1, mark.length - 2);
      formMark = mark.slice(0, i) + mark[i] + mark.slice(i); // harf tekrarı
    }
    const today = ctx.today;
    const vekDate = D.addDays(today, -r.int(3, 40));
    const vekil = ctx.vekil;
    const sign = person(r);

    const talimat = {
      id: 'talimat',
      variant: 'letter',
      kicker: 'MÜVEKKİL TALİMATI',
      title: company,
      html:
        '<p class="dateline">' + D.fmt(today) + '</p>' +
        '<p>Sayın ' + VK.esc(vekil) + ',</p>' +
        '<p>' + F('talimat.marka', mark, 'mark') + ' ibaresinin aşağıdaki mal ve hizmetler için marka olarak tescili amacıyla başvurumuzun yapılmasını rica ederiz:</p>' +
        '<ul class="goods">' + goods.map((g, i) => '<li>' + F('talimat.g' + i, g.good) + '</li>').join('') + '</ul>' +
        '<p class="sign">Saygılarımızla,<br>' + VK.esc(sign) + '<br>' + F('talimat.sahip', company) + '</p>',
    };
    const vek = {
      id: 'vek',
      variant: 'cert',
      kicker: 'VEKALETNAME',
      title: 'Marka işlemleri için vekaletname',
      html:
        row('Vekil eden', F('vek.sahip', vekName)) +
        row('Vekil', VK.esc(vekil)) +
        row('Konu', 'Türk Patent ve Marka Kurumu nezdinde marka başvuru ve tescil işlemleri') +
        row('Düzenlenme', D.fmt(vekDate)) +
        '<p class="seal">ONAYLI SURET</p>',
    };
    const shownRows = formRows.filter((_, i) => i !== missingIdx);
    const form = {
      id: 'form',
      variant: 'form',
      kicker: 'MARKA BAŞVURU FORMU — TASLAK',
      title: 'Hazırlayan: Nermin Hanım',
      html:
        row('Başvuru sahibi', F('form.sahip', company)) +
        row('Marka', F('form.marka', formMark, 'mark')) +
        row('Marka örneği', 'Ekli (1 adet)') +
        '<div class="subhead">' + F('form.liste', 'Mal / hizmet listesi (' + shownRows.length + ' kalem)') + '</div>' +
        '<table class="grid"><thead><tr><th>Sınıf</th><th>Mal / hizmet</th></tr></thead><tbody>' +
        shownRows.map((g) => '<tr>' + '<td>' + F('form.c' + formRows.indexOf(g), String(g.shown)) + '</td><td>' + VK.esc(g.good) + '</td></tr>').join('') +
        '</tbody></table>',
    };
    // Nice cetveli: ilgili sınıflar + birkaç çeldirici
    const show = new Set(sector.classes);
    formRows.forEach((g) => show.add(g.shown));
    while (show.size < 6) show.add(r.pick(VK.NICE).no);
    const niceRows = VK.NICE.filter((n) => show.has(n.no));
    const nice = {
      id: 'nice',
      variant: 'card',
      kicker: 'NICE CETVELİ — BÜRO KOPYASI',
      title: 'İlgili sınıflar',
      html: '<table class="grid nice"><tbody>' + niceRows.map((n) => '<tr><td>' + F('nice.' + n.no, String(n.no)) + '</td><td>' + VK.esc(n.title) + '<div class="eg">' + VK.esc(n.goods.join(', ')) + '</div></td></tr>').join('') + '</tbody></table>',
    };

    const options = [
      { key: 'A', text: 'DOSYALA — Başvuru eksiksiz, Kuruma gönder' },
      { key: 'B', text: 'İADE — Sınıf numarası hatalı' },
      { key: 'C', text: 'İADE — Vekaletname ile başvuru sahibi uyumsuz' },
      { key: 'D', text: 'İADE — Marka ibaresi talimattan farklı' },
      { key: 'E', text: 'İADE — Mal/hizmet listesi talimattan eksik' },
    ];
    const answer = { ok: 'A', class: 'B', owner: 'C', mark: 'D', missing: 'E' }[scenario];
    let explanation;
    if (scenario === 'ok') explanation = 'Talimat, vekaletname ve form birbiriyle uyumlu; her mal/hizmet doğru Nice sınıfında. Başvuru Kuruma gönderilebilir.';
    if (scenario === 'class') {
      const g = formRows[wrongIdx];
      explanation = '"' + g.good + '" ' + g.cls + '. sınıftadır; formda ' + g.shown + ' yazılmış. Yanlış sınıf gösterilen mal için koruma doğmaz, form düzeltilmeli.';
    }
    if (scenario === 'owner') explanation = 'Vekaletnamedeki vekil eden "' + vekName + '", başvuru sahibi ise "' + company + '". Farklı tüzel kişiler; başvuru sahibinden alınmış geçerli bir vekaletname gerekir.';
    if (scenario === 'mark') explanation = 'Talimattaki ibare "' + mark + '", formdaki ise "' + formMark + '". Tek harf farkı bile farklı bir işaret demektir; başvurudan sonra marka örneği esaslı biçimde değiştirilemez.';
    if (scenario === 'missing') explanation = 'Müvekkil "' + goods[missingIdx].good + '" için de koruma istemiş, formda bu kalem yok. Başvurudan sonra listeye yeni mal/hizmet eklenemez.';

    const check = (a, b) => {
      const pair = [a, b].sort().join('|');
      const has = (x, y) => pair === [x, y].sort().join('|');
      if (scenario === 'class') {
        const g = formRows[wrongIdx];
        if (has('form.c' + wrongIdx, 'nice.' + g.cls) || has('form.c' + wrongIdx, 'nice.' + g.shown) || has('form.c' + wrongIdx, 'talimat.g' + wrongIdx))
          return { found: true, option: 'B', msg: '"' + g.good + '" için doğru sınıf ' + g.cls + '; formda ' + g.shown + '.' };
      }
      if (scenario === 'owner' && (has('vek.sahip', 'talimat.sahip') || has('vek.sahip', 'form.sahip')))
        return { found: true, option: 'C', msg: 'Vekil eden ile başvuru sahibi aynı kişi değil.' };
      if (scenario === 'mark' && has('form.marka', 'talimat.marka')) return { found: true, option: 'D', msg: 'Formdaki ibare talimattakinden farklı.' };
      if (scenario === 'missing' && (has('talimat.g' + missingIdx, 'form.liste') || /form\.c/.test(a + b) && pair.includes('talimat.g' + missingIdx)))
        return { found: true, option: 'E', msg: '"' + goods[missingIdx].good + '" formda yok.' };
      // Bilgi amaçlı: tutarlı eşleşmeler
      const m = pair.match(/^form\.c(\d)\|nice\.(\d+)$/);
      if (m) {
        const g = formRows[+m[1]];
        return { found: false, msg: g.shown === +m[2] && g.cls === +m[2] ? 'Sınıf doğru görünüyor.' : 'Bu iki alan doğrudan çelişmiyor.' };
      }
      return null;
    };

    return {
      kind: 'proc',
      gen: 'sinif',
      topic: 'marka',
      subtopic: 'Başvuru formu kontrolü',
      title: mark + ' marka başvurusu',
      client: { name: company, sector: sector.name, kind: 'firma', contact: sign },
      line: r.pick(['Fuar yaklaşıyor, başvuruyu bugün yapabilir miyiz?', 'Formu Nermin Hanım hazırladı, siz bir göz atın yeter.', 'Rakipler bizden önce davranmasın.', 'Tüm ürün gamımızı kapsasın lütfen.']),
      intro: 'Nermin Hanım başvuru formunu hazırlamış. Talimat, vekaletname ve formu Nice cetveliyle karşılaştır; tutarsızlık varsa iade et.',
      ask: 'Başvuru formuyla ilgili kararın nedir?',
      docs: [talimat, vek, form, nice],
      options,
      answer,
      explanation,
      law: 'Nice sınıflandırması; 6769 SMK marka başvuru şartları',
      hint: 'Önce her malın sınıfını cetvelle, sonra isimleri ve ibareyi talimatla karşılaştır.',
      difficulty: scenario === 'ok' ? 1 : 2,
      inspectable: true,
      check,
      debug: { scenario, formRows, goods, company, vekName, mark, formMark, missingIdx },
    };
  }

  /* ---------- 2) Rüçhan kontrolü ---------- */
  function genRucan(r, ctx) {
    const today = ctx.today;
    const type = r.pick(['Patent', 'Patent', 'Faydalı model', 'Marka', 'Tasarım']);
    const months = type === 'Patent' || type === 'Faydalı model' ? 12 : 6;
    const other = months === 12 ? 6 : 12;
    const scenario = ctx.scenario || r.pick(['ok', 'ok', 'late', 'late', 'owner', 'data']);
    const fo = r.pick(FOREIGN);
    const owner = r.pick(fo.owner);
    const trap = r.chance(0.5);
    let first;
    // ok: son gün bugünden ≥10 gün sonra; late: son gün bugünden ≥10 gün önce
    const deadlineOf = (f) => D.addMonths(f, months);
    for (let i = 0; i < 400; i++) {
      let back;
      if (scenario === 'late') {
        back = trap && months === 6 ? r.int(200, 330) : r.int(months * 30 + 20, months * 30 + 120);
      } else {
        back = trap && months === 12 ? r.int(200, 330) : r.int(30, months * 30 - 25);
      }
      const f = D.nextWorkday(D.addDays(today, -back));
      const dd = D.diff(today, deadlineOf(f));
      if (scenario === 'late' ? dd <= -10 : dd >= 10) {
        first = f;
        break;
      }
    }
    if (!first) first = D.addMonths(today, -Math.floor(months / 2));
    const deadline = deadlineOf(first);
    const no = appNo(r, fo.cc, first.getUTCFullYear());
    let trNo = no,
      trDate = first;
    if (scenario === 'data') {
      if (r.chance(0.5)) {
        const digits = no.slice(-6);
        const i = r.int(0, 4);
        const sw = digits.slice(0, i) + digits[i + 1] + digits[i] + digits.slice(i + 2);
        trNo = no.slice(0, -6) + (sw === digits ? String((+digits + 1) % 1000000).padStart(6, '0') : sw);
      } else trDate = D.addMonths(first, r.pick([-1, 1]));
    }
    const trOwner = scenario === 'owner' ? owner.replace(/ (GmbH|AG|SAS|SA|SARL|S\.p\.A\.|S\.r\.l\.|K\.K\.|Co\., Ltd\.|S\.L\.|S\.A\.)$/, '') + ' Türkiye Ltd. Şti.' : owner;
    const subject = r.pick(SUBJECTS[type === 'Tasarım' ? 'Tasarım' : type === 'Marka' ? 'Marka' : type]);
    const markName = type === 'Marka' ? makeMark(r) : null;
    const title = markName || subject;

    const belge = {
      id: 'yb',
      variant: 'cert',
      kicker: 'RÜÇHAN BELGESİ — ONAYLI SURET',
      title: fo.office,
      html:
        row('Başvuru no', F('yb.no', no)) +
        row('Başvuru tarihi', F('yb.tarih', D.fmt(first))) +
        row('Başvuru türü', F('yb.tur', type)) +
        row('Başvuru sahibi', F('yb.sahip', owner)) +
        row(type === 'Marka' ? 'İşaret' : 'Konu', VK.esc(title)) +
        '<p class="seal">' + fo.cc + ' · CERTIFIED COPY</p>',
    };
    const taslak = {
      id: 'tr',
      variant: 'form',
      kicker: 'TÜRKİYE BAŞVURU TASLAĞI',
      title: type + ' başvurusu',
      html:
        row('Başvuru türü', F('tr.tur', type)) +
        row('Başvuru sahibi', F('tr.sahip', trOwner)) +
        row(type === 'Marka' ? 'İşaret' : 'Konu', VK.esc(title)) +
        row('Başvuru tarihi', F('tr.tarih', D.fmt(today) + ' (bugün)')) +
        '<div class="subhead">Rüçhan talebi</div>' +
        row('Ülke', fo.cc) +
        row('Rüçhan no', F('tr.rno', trNo)) +
        row('Rüçhan tarihi', F('tr.rtarih', D.fmt(trDate))),
    };
    const contact = person(r);
    const mektup = {
      id: 'mektup',
      variant: 'mail',
      kicker: 'E-POSTA ÇIKTISI',
      title: 'Konu: Türkiye başvurusu',
      html:
        '<p class="mailhead">Kimden: ' + VK.esc(contact) + ' (' + VK.esc(trOwner) + ')<br>Tarih: ' + D.fmt(today) + '</p>' +
        '<p>Merhaba, ' + VK.esc(fo.office) + ' nezdindeki ilk başvurumuza dayanarak Türkiye\'de bugün rüçhanlı ' + type.toLowerCase() + ' başvurusu yapmanızı rica ediyoruz. Onaylı rüçhan belgesi ektedir.</p>',
    };
    const options = [
      { key: 'A', text: 'Rüçhanlı başvuruyu bugün yap' },
      { key: 'B', text: 'Rüçhan talep edilemez — rüçhan süresi dolmuş' },
      { key: 'C', text: 'İADE — Başvuru sahibi farklı, devir belgesi yok' },
      { key: 'D', text: 'İADE — Taslaktaki rüçhan bilgileri belgeyle uyumsuz' },
      { key: 'E', text: 'BEKLET — Rüçhan belgesinin aslı gelmeden başvuru yapılamaz' },
    ];
    const answer = { ok: 'A', late: 'B', owner: 'C', data: 'D' }[scenario];
    const calc = D.fmt(first) + ' + ' + months + ' ay = ' + D.fmt(deadline);
    let explanation = {
      ok: type + ' için rüçhan süresi ' + months + ' ay: ' + calc + '. Bugün (' + D.fmt(today) + ') süre içinde; sahip ve rüçhan bilgileri tutarlı.',
      late: type + ' için rüçhan süresi ' + months + ' ay: ' + calc + '. Bugün (' + D.fmt(today) + ') bu tarih geçmiş; rüçhan hakkından yararlanılamaz.',
      owner: 'Rüçhan hakkı ilk başvuruyu yapana veya halefine aittir. Belgedeki sahip "' + owner + '", taslaktaki "' + trOwner + '". Devir belgesi olmadan rüçhan talep edilemez.',
      data: 'Rüçhan talebindeki numara ve tarih onaylı belgeyle birebir aynı olmalı. Belgede ' + no + ' / ' + D.fmt(first) + ', taslakta ' + trNo + ' / ' + D.fmt(trDate) + '.',
    }[scenario];
    if (trap && (scenario === 'ok' || scenario === 'late'))
      explanation += ' Dikkat: ' + type.toLowerCase() + ' için süre ' + months + ' aydır, ' + other + ' değil.';

    const check = (a, b) => {
      const pair = [a, b].sort().join('|');
      const has = (x, y) => pair === [x, y].sort().join('|');
      if (has('tr.tarih', 'yb.tarih') || has('tr.rtarih', 'tr.tarih')) {
        if (scenario === 'late') return { found: true, option: 'B', msg: 'Süre dolmuş: ' + calc + '.' };
        return { found: false, msg: 'Süre içinde: son gün ' + D.fmt(deadline) + '.' };
      }
      if (has('tr.sahip', 'yb.sahip')) return scenario === 'owner' ? { found: true, option: 'C', msg: 'İlk başvuru sahibi ile Türkiye başvurusunun sahibi farklı.' } : { found: false, msg: 'Sahipler aynı.' };
      if (has('tr.rno', 'yb.no')) return scenario === 'data' && trNo !== no ? { found: true, option: 'D', msg: 'Rüçhan numarası belgeyle uyuşmuyor.' } : { found: false, msg: 'Numaralar aynı.' };
      if (has('tr.rtarih', 'yb.tarih'))
        return scenario === 'data' && +trDate !== +first ? { found: true, option: 'D', msg: 'Rüçhan tarihi belgeyle uyuşmuyor.' } : { found: false, msg: 'Tarihler aynı.' };
      if (has('tr.tur', 'yb.tur')) return { found: false, msg: 'Başvuru türleri aynı: ' + type + ' (' + months + ' ay).' };
      return null;
    };

    return {
      kind: 'proc',
      gen: 'rucan',
      topic: type === 'Marka' ? 'marka' : type === 'Tasarım' ? 'tasarim' : 'patent',
      subtopic: 'Rüçhan kontrolü',
      title: 'Rüçhanlı ' + type.toLowerCase() + ': ' + title,
      client: { name: trOwner, sector: 'Yabancı başvuru', kind: 'firma', contact },
      line: r.pick(['İlk başvurumuz ' + fo.cc + '\'de yapıldı, Türkiye\'de de koruma istiyoruz.', 'Rüçhan tarihimizi kaybetmek istemiyoruz.', 'Belgeler tamam sanırım, değil mi?']),
      intro: 'Yurt dışındaki ilk başvuruya dayanan bir rüçhan talebi. Türü, süreyi, sahibi ve rüçhan bilgilerini belgeyle karşılaştır.',
      ask: 'Rüçhanlı başvuru talebiyle ilgili kararın nedir?',
      docs: [mektup, belge, taslak],
      options,
      answer,
      explanation,
      law: 'Paris Sözleşmesi; 6769 SMK rüçhan hükümleri',
      hint: 'Önce başvuru türüne göre süreyi seç, sonra ilk başvuru tarihine ekle ve bugünle karşılaştır.',
      difficulty: trap ? 2 : 1,
      inspectable: true,
      check,
      debug: { scenario, type, months, first, today, owner, trOwner, no, trNo, trDate },
    };
  }

  /* ---------- 3) İtiraz / dava süresi kontrolü ---------- */
  function genItiraz(r, ctx) {
    const today = ctx.today;
    const variant = ctx.variant || r.pick(['kurum', 'kurum', 'markaYayim', 'tasarimYayim', 'yidk']);
    const scenario = ctx.scenario || r.pick(['ok', 'late', 'trap']);
    const clientName = firm(r, r.pick(['Gıda', 'Tekstil', 'Mobilya', 'Kozmetik', 'Elektronik', 'Seramik']));
    const contact = person(r);
    const months = variant === 'tasarimYayim' ? 3 : 2;
    let start, decisionDate, deadline, isOk;
    // start: sürenin başladığı tarih (tebliğ ya da yayım)
    for (let i = 0; i < 400; i++) {
      let back;
      if (scenario === 'ok') back = r.int(15, months * 30 - 20);
      else if (scenario === 'late') back = r.int(months * 30 + 15, months * 30 + 90);
      else back = variant === 'markaYayim' ? r.int(72, 82) : variant === 'tasarimYayim' ? r.int(68, 80) : r.int(30, months * 30 - 20);
      const s = D.nextWorkday(D.addDays(today, -back));
      const dl = D.addMonths(s, months);
      const dd = D.diff(today, dl);
      let decision = null;
      if (variant === 'kurum' || variant === 'yidk') {
        // tuzak: karar tarihi eski, tebliğ yeni — karar tarihinden sayılırsa süre geçmiş görünür
        const gap = scenario === 'trap' ? r.int(25, 50) : r.int(5, 20);
        decision = D.addDays(s, -gap);
        if (scenario === 'trap' && D.diff(today, D.addMonths(decision, months)) > -8) continue;
      }
      const want = scenario === 'late' ? dd <= -10 : scenario === 'ok' ? dd >= 10 : variant === 'markaYayim' ? dd <= -10 : dd >= 10;
      if (variant === 'tasarimYayim' && scenario === 'trap' && D.diff(today, D.addMonths(s, 2)) > -8) continue;
      if (want) {
        start = s;
        decisionDate = decision;
        deadline = dl;
        isOk = dd >= 10;
        break;
      }
    }
    if (!start) {
      start = D.addDays(today, -20);
      decisionDate = D.addDays(start, -7);
      deadline = D.addMonths(start, months);
      isOk = true;
    }
    const rejected = r.pick(['marka', 'patent', 'tasarım']);
    const mark = makeMark(r);
    const no = regNo(r, start.getUTCFullYear());
    let docs, ask, options, answer, explanation, law, title, line, intro;
    const calc = D.fmt(start) + ' + ' + months + ' ay = ' + D.fmt(deadline);
    const mektup = (txt) => ({
      id: 'm',
      variant: 'letter',
      kicker: 'MÜVEKKİL TALİMATI',
      title: clientName,
      html: '<p class="dateline">' + F('m.tarih', D.fmt(today)) + '</p><p>' + txt + '</p><p class="sign">' + VK.esc(contact) + '</p>',
    });
    if (variant === 'kurum' || variant === 'yidk') {
      const yidk = variant === 'yidk';
      title = yidk ? 'YİDK kararına karşı dava' : 'Ret kararına itiraz';
      const karar = {
        id: 'k',
        variant: 'kurum',
        kicker: yidk ? 'YİDK KARARI — TEBLİGAT' : 'KURUM KARARI — TEBLİGAT',
        title: 'Başvuru no ' + no,
        html:
          row('Konu', VK.esc(yidk ? 'İtirazın nihai reddi (' + rejected + ' başvurusu)' : 'Başvurunun reddi (' + rejected + ')')) +
          row('Karar tarihi', F('k.karar', D.fmt(decisionDate))) +
          row('Tebliğ tarihi', F('k.teblig', D.fmt(start))) +
          row('Muhatap', VK.esc(clientName) + ' / vekili') +
          '<p class="small">Karara karşı süresi içinde ' + (yidk ? 'yetkili mahkemede dava açılabilir.' : 'Kuruma itiraz edilebilir.') + '</p>',
      };
      docs = [mektup(yidk ? 'YİDK kararını kabul etmiyoruz. Yargı yoluna gidelim; gereğini rica ederiz.' : 'Başvurumuzun reddedildiğini öğrendik. Karara itiraz etmenizi rica ederiz.'), karar];
      ask = yidk ? 'YİDK kararına karşı dava açma talebiyle ilgili kararın nedir?' : 'Ret kararına itiraz talebiyle ilgili kararın nedir?';
      options = yidk
        ? [
            { key: 'A', text: 'Süresinde — Ankara Fikri ve Sınai Haklar Hukuk Mahkemesinde dava aç' },
            { key: 'B', text: 'Süre dolmuş — dava yolunun kapandığını müvekkile bildir' },
            { key: 'C', text: 'Önce YİDK\'ya yeniden itiraz et' },
          ]
        : [
            { key: 'A', text: 'Süresinde — itiraz dilekçesini hazırla, ücreti öde' },
            { key: 'B', text: 'Süre dolmuş — itiraz yolunun kapandığını müvekkile bildir' },
            { key: 'C', text: 'Kurum kararına karşı doğrudan mahkemede dava aç' },
          ];
      answer = isOk ? 'A' : 'B';
      explanation =
        (yidk ? 'YİDK kararlarına karşı dava süresi' : 'Kurum kararlarına itiraz süresi') +
        ' tebliğden itibaren 2 aydır: ' + calc + '. Bugün ' + D.fmt(today) + (isOk ? '; süre içindeyiz.' : '; süre dolmuş.') +
        (scenario === 'trap' ? ' Karar tarihinden (' + D.fmt(decisionDate) + ') sayan kişi yanılırdı: süre tebliğden işler.' : '') +
        (yidk ? '' : ' Kurum kararına karşı doğrudan dava açılamaz; önce itiraz edilir.');
      law = yidk ? '6769 SMK m. 156/3' : '6769 SMK m. 117';
      line = r.pick(['Bu karar haksız, sonuna kadar gideceğiz.', 'Hâlâ vaktimiz var, değil mi?', 'Kararı ne zaman tebliğ aldığımızı hatırlamıyorum bile.']);
      intro = 'Müvekkil karara karşı yasal yola gitmek istiyor. Süreyi doğru tarihten başlatarak hesapla.';
    } else {
      const tasarim = variant === 'tasarimYayim';
      title = tasarim ? 'Tasarım yayımına itiraz' : 'Marka yayımına itiraz';
      const ilan = {
        id: 'b',
        variant: 'bulletin',
        kicker: tasarim ? 'RESMÎ TASARIM BÜLTENİ — İLAN' : 'RESMÎ MARKA BÜLTENİ — İLAN',
        title: tasarim ? 'Tasarım başvurusu ' + no : 'Marka başvurusu ' + no,
        html:
          row('Bülten yayım tarihi', F('b.yayim', D.fmt(start))) +
          (tasarim ? row('Ürün', VK.esc(r.pick(SUBJECTS['Tasarım']))) + row('Tasarım adedi', String(r.int(1, 4))) : row('İşaret', '<b class="mark">' + VK.esc(mark) + '</b>') + row('Sınıflar', r.pick(['25, 35', '29, 30', '3, 44', '9, 42']))) +
          row('Başvuru sahibi', VK.esc(firm(r, r.pick(['Dış Ticaret', 'Tekstil', 'Gıda'])))),
      };
      docs = [
        mektup(
          tasarim
            ? 'Bültende yayımlanan bu tasarım bizim ürünümüzün aynısı. Yayıma itiraz etmenizi istiyoruz.'
            : 'Bültende yayımlanan bu marka bizim tescilli markamıza çok benziyor. Yayıma itiraz etmenizi istiyoruz.',
        ),
        ilan,
      ];
      ask = 'Yayıma itiraz talebiyle ilgili kararın nedir?';
      options = [
        { key: 'A', text: 'Süresinde — yayıma itiraz dilekçesini hazırla' },
        { key: 'B', text: 'Süre dolmuş — yayıma itiraz edilemez, müvekkile bildir' },
        { key: 'C', text: 'Önce tescil kararını bekle, sonra itiraz et' },
      ];
      answer = isOk ? 'A' : 'B';
      explanation =
        (tasarim ? 'Tasarım' : 'Marka') + ' başvurusunun yayımına itiraz süresi Bültende yayımdan itibaren ' + months + ' aydır: ' + calc + '. Bugün ' + D.fmt(today) + (isOk ? '; süre içinde.' : '; süre dolmuş.') +
        (scenario === 'trap' ? (tasarim ? ' Marka için süre 2 ay olurdu; tasarımda 3 aydır.' : ' Tasarım için süre 3 ay olurdu; markada 2 aydır.') : '');
      law = tasarim ? '6769 SMK tasarım yayımına itiraz' : '6769 SMK m. 18';
      line = r.pick(['Bu bizim işaretimizin kopyası!', 'Bülteni geç gördük, umarım geç kalmadık.', 'Rakip yine aynı numarayı deniyor.']);
      intro = 'Müvekkil, yayımlanan bir başvuruya itiraz etmek istiyor. Yayım tarihine ve başvurunun türüne bak.';
    }
    const check = (a, b) => {
      const pair = [a, b].sort().join('|');
      const has = (x, y) => pair === [x, y].sort().join('|');
      if (has('k.teblig', 'm.tarih') || has('b.yayim', 'm.tarih'))
        return isOk ? { found: false, msg: 'Süre içinde: son gün ' + D.fmt(deadline) + '.' } : { found: true, option: 'B', msg: 'Süre dolmuş: ' + calc + '.' };
      if (has('k.karar', 'm.tarih')) return { found: false, msg: 'Süre karar tarihinden değil tebliğ tarihinden işler.' };
      if (has('k.karar', 'k.teblig')) return { found: false, msg: 'Tebliğ, karardan ' + D.diff(decisionDate, start) + ' gün sonra yapılmış.' };
      return null;
    };
    return {
      kind: 'proc',
      gen: 'itiraz',
      topic: variant === 'tasarimYayim' ? 'tasarim' : 'marka',
      subtopic: 'Süre kontrolü',
      title,
      client: { name: clientName, sector: 'İtiraz', kind: 'firma', contact },
      line,
      intro,
      ask,
      docs,
      options,
      answer,
      explanation,
      law,
      hint: 'Sürenin hangi tarihten başladığını ve kaç ay olduğunu belirle; sonra bugünle karşılaştır.',
      difficulty: scenario === 'trap' ? 2 : 1,
      inspectable: true,
      check,
      debug: { scenario, variant, months, start, decisionDate, today },
    };
  }

  /* ---------- 4) Marka yenileme ---------- */
  function genYenileme(r, ctx) {
    const today = ctx.today;
    const scenario = ctx.scenario || r.pick(['normal', 'normal', 'grace', 'early', 'late', 'owner']);
    const renewedOnce = r.chance(0.3);
    const years = renewedOnce ? 20 : 10;
    // bitiş tarihini bugüne göre seç
    let expiry;
    const ranges = {
      normal: [12, 170], // bugün bitişten 12–170 gün önce
      owner: [12, 170],
      early: [200, 420],
      grace: [-170, -12], // bugün bitişten 12–170 gün sonra
      late: [-480, -200],
    };
    for (let i = 0; i < 400; i++) {
      const ahead = r.int(ranges[scenario][0], ranges[scenario][1]);
      const e = D.addDays(today, ahead);
      const sixBefore = D.addMonths(e, -6),
        sixAfter = D.addMonths(e, 6);
      const okFor = {
        normal: D.diff(sixBefore, today) >= 10 && D.diff(today, e) >= 10,
        owner: D.diff(sixBefore, today) >= 10 && D.diff(today, e) >= 10,
        early: D.diff(today, sixBefore) >= 10,
        grace: D.diff(e, today) >= 10 && D.diff(today, sixAfter) >= 10,
        late: D.diff(sixAfter, today) >= 10,
      }[scenario];
      if (okFor) {
        expiry = e;
        break;
      }
    }
    const filing = D.addYears(expiry, -years);
    const regDate = D.nextWorkday(D.addDays(filing, r.int(150, 420)));
    const owner = firm(r, r.pick(['Gıda', 'Tekstil', 'Kozmetik', 'Mobilya', 'Kırtasiye']));
    const requester = scenario === 'owner' ? firm(r, r.pick(['Pazarlama', 'Dağıtım', 'Ticaret'])) : owner;
    const mark = makeMark(r);
    const contact = person(r);
    const cert = {
      id: 't',
      variant: 'cert',
      kicker: 'MARKA TESCİL BELGESİ',
      title: mark,
      html:
        row('Tescil no', VK.esc(regNo(r, filing.getUTCFullYear()))) +
        row('Başvuru tarihi', F('t.bas', D.fmt(filing))) +
        row('Tescil tarihi', F('t.tescil', D.fmt(regDate))) +
        row('Marka sahibi', F('t.sahip', owner)) +
        row('Sınıflar', r.pick(['29, 30', '25', '3, 35', '20, 21', '16, 41'])) +
        row('Yenileme kaydı', F('t.yen', renewedOnce ? '1 kez yenilendi (+10 yıl)' : 'Yenileme yok')) +
        '<p class="seal">' + VK.esc(mark) + '</p>',
    };
    const req = {
      id: 'm',
      variant: 'letter',
      kicker: 'YENİLEME TALİMATI',
      title: requester,
      html:
        '<p class="dateline">' + F('m.tarih', D.fmt(today)) + '</p>' +
        '<p>' + VK.esc(mark) + ' markasının koruma süresinin yenilenmesi için gerekli işlemlerin yapılmasını rica ederiz.</p>' +
        (scenario === 'owner' ? '<p>Markayı ' + VK.esc(r.pick(['bölge distribütörü', 'satış ortağı', 'lisans alanı'])) + ' olarak yıllardır kullanıyoruz.</p>' : '') +
        '<p class="sign">' + VK.esc(contact) + '<br>' + F('m.sahip', requester) + '</p>',
    };
    const options = [
      { key: 'A', text: 'YENİLE — Olağan yenileme süresi içinde' },
      { key: 'B', text: 'YENİLE — Ek ücretle, 6 aylık ek süre içinde' },
      { key: 'C', text: 'ERKEN — Yenileme dönemi başlamadı, ajandaya kaydet' },
      { key: 'D', text: 'YENİLENEMEZ — Ek süre de dolmuş, yeni başvuru öner' },
      { key: 'E', text: 'İADE — Talep eden marka sahibi değil' },
    ];
    const answer = { normal: 'A', grace: 'B', early: 'C', late: 'D', owner: 'E' }[scenario];
    const calc = 'Başvuru ' + D.fmt(filing) + ' + ' + years + ' yıl = ' + D.fmt(expiry);
    const win = 'olağan dönem ' + D.fmt(D.addMonths(expiry, -6)) + '–' + D.fmt(expiry) + ', ek süre ' + D.fmt(expiry) + '–' + D.fmt(D.addMonths(expiry, 6));
    let explanation = {
      normal: calc + '; ' + win + '. Bugün (' + D.fmt(today) + ') olağan yenileme döneminde.',
      grace: calc + '; ' + win + '. Bugün (' + D.fmt(today) + ') koruma bitmiş ama 6 aylık ek süre içinde: ek ücretle yenilenir.',
      early: calc + '; ' + win + '. Bugün (' + D.fmt(today) + ') yenileme dönemi henüz açılmadı.',
      late: calc + '; ' + win + '. Bugün (' + D.fmt(today) + ') ek süre de geçmiş; tescil yenilenemez.',
      owner: 'Yenileme talebi marka sahibi ya da onun yetkilendirdiği kişi tarafından yapılır. Tescil belgesinde sahip "' + owner + '", talep eden "' + requester + '".',
    }[scenario];
    const fromReg = D.addYears(regDate, years);
    if (scenario !== 'owner' && D.diff(expiry, fromReg) > 30) explanation += ' Süre tescil tarihinden değil başvuru tarihinden hesaplanır.';
    const check = (a, b) => {
      const pair = [a, b].sort().join('|');
      const has = (x, y) => pair === [x, y].sort().join('|');
      if (has('m.sahip', 't.sahip')) return scenario === 'owner' ? { found: true, option: 'E', msg: 'Talep eden, tescil belgesindeki marka sahibi değil.' } : { found: false, msg: 'Talep eden marka sahibi.' };
      if (has('m.tarih', 't.bas') || has('t.bas', 't.yen')) {
        const msg = calc + '; ' + win + '.';
        if (scenario === 'late') return { found: true, option: 'D', msg: 'Ek süre de dolmuş. ' + msg };
        if (scenario === 'early') return { found: true, option: 'C', msg: 'Dönem henüz açılmadı. ' + msg };
        if (scenario === 'grace') return { found: true, option: 'B', msg: 'Koruma bitmiş; ek süre içinde. ' + msg };
        return { found: false, msg };
      }
      if (has('m.tarih', 't.tescil')) return { found: false, msg: 'Koruma tescil tarihinden değil başvuru tarihinden başlar.' };
      return null;
    };
    return {
      kind: 'proc',
      gen: 'yenileme',
      topic: 'marka',
      subtopic: 'Marka yenileme',
      title: mark + ' yenilemesi',
      client: { name: requester, sector: 'Yenileme', kind: 'firma', contact },
      line: r.pick(['On yıl ne çabuk geçmiş…', 'Markamızı kaybetmek istemiyoruz.', 'Muhasebe yenileme ücretini sordu.', 'Geçen ay hatırlatma yazısı gelmişti galiba.']),
      intro: 'Yenileme talimatı geldi. Koruma bitiş tarihini hesapla, bugünü yenileme pencereleriyle karşılaştır, talep edeni kontrol et.',
      ask: 'Yenileme talebiyle ilgili kararın nedir?',
      docs: [req, cert],
      options,
      answer,
      explanation,
      law: '6769 SMK m. 23–24',
      hint: 'Bitiş = başvuru tarihi + 10 yıl (yenilendiyse +10 daha). Önceki 6 ay olağan, sonraki 6 ay ek süredir.',
      difficulty: renewedOnce || scenario === 'grace' ? 2 : 1,
      inspectable: true,
      check,
      debug: { scenario, filing, years, today, owner, requester },
    };
  }

  VK.PROC = { sinif: genSinif, rucan: genRucan, itiraz: genItiraz, yenileme: genYenileme };
  VK.PROC_LABELS = { sinif: 'Başvuru formu & Nice sınıfı', rucan: 'Rüçhan kontrolü', itiraz: 'İtiraz/dava süresi', yenileme: 'Marka yenileme' };

  VK.makeProc = function (gen, seed, ctx) {
    const r = VK.rng('proc:' + gen + ':' + seed);
    const f = VK.PROC[gen](r, ctx);
    f.id = 'proc-' + gen + '-' + seed;
    f.fee = 1200;
    return f;
  };
})();
