/* VEKİL — Oyun akışı: başlık, kariyer (bülten → mesai → hesap defteri → son), serbest çalışma,
   sınav provası, istatistikler, ayarlar. */
(function () {
  'use strict';
  const VK = window.VK;
  const h = VK.h;
  const D = VK.D;
  const UI = VK.UI;
  const Desk = VK.Desk;
  const C = VK.CAMPAIGN;

  /* ---------- Ayarlar ---------- */
  const DEFAULTS = { sound: true, pace: 'normal', bigText: false, reduceMotion: false, vekil: '' };
  VK.settings = Object.assign({}, DEFAULTS, VK.store.get('settings', {}));
  const PACE = { relaxed: 0, normal: 720, fast: 480 }; // 09:00–18:00 kaç gerçek saniye sürer
  const PACE_LABEL = { relaxed: 'Rahat (saat işlemez)', normal: 'Normal (~12 dk/gün)', fast: 'Hızlı (~8 dk/gün)' };
  function applySettings() {
    document.documentElement.classList.toggle('big-text', !!VK.settings.bigText);
    document.documentElement.classList.toggle('reduce-motion', !!VK.settings.reduceMotion);
  }
  function saveSettings() {
    VK.store.set('settings', VK.settings);
    applySettings();
  }
  applySettings();

  /* ---------- Soru havuzu ve istatistik ---------- */
  const Q = (VK.QUESTIONS || []).slice();
  const byId = new Map(Q.map((q) => [q.id, q]));
  let stats = VK.store.get('stats', { q: {}, proc: {} });
  if (!stats.q) stats = { q: {}, proc: {} };
  function record(file, correct) {
    if (file.kind === 'exam') {
      const s = stats.q[file.id] || (stats.q[file.id] = { s: 0, c: 0, w: 0 });
      s.s++;
      correct ? s.c++ : s.w++;
      s.last = correct ? 1 : 0;
      s.t = Date.now();
    } else {
      const s = stats.proc[file.gen] || (stats.proc[file.gen] = { s: 0, c: 0, w: 0 });
      s.s++;
      correct ? s.c++ : s.w++;
    }
    VK.store.set('stats', stats);
  }

  /* ---------- Ekran yönetimi ---------- */
  const app = document.getElementById('app');
  let keyHandler = null;
  let teardown = null;
  function show(el, handler, cls) {
    if (teardown) {
      try {
        teardown();
      } catch (e) {}
      teardown = null;
    }
    UI.closeRulebook();
    UI.closeCalc();
    app.innerHTML = '';
    app.className = cls || '';
    app.appendChild(el);
    keyHandler = handler || null;
    window.scrollTo(0, 0);
    el.scrollTop = 0;
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && UI.closeTop()) {
      e.preventDefault();
      return;
    }
    if (e.target.closest && e.target.closest('input, select, textarea')) return;
    // Odaktaki düğmede Enter/Boşluk düğmenin kendi işini yapsın (karar seçenekleri hariç)
    const btn = e.target.closest && e.target.closest('button, a');
    if (btn && !btn.classList.contains('opt') && (e.key === 'Enter' || e.key === ' ')) return;
    if (UI.overlayOpen()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (keyHandler) keyHandler(e);
  });

  /* ---------- Başlık ekranı ---------- */
  function titleScreen() {
    const save = VK.store.get('career', null);
    const counts = Q.reduce((a, q) => ((a[q.year] = (a[q.year] || 0) + 1), a), {});
    const years = Object.keys(counts).sort();
    const folder = (title, desc, onclick, tag, alt) =>
      h('button.folder-btn' + (alt ? '.alt' : ''), { type: 'button', onclick }, h('span.fb-title', title), h('span.fb-desc', desc), tag ? h('span.fb-tag', tag) : null);
    const menu = h('div.menu-folders');
    if (save && save.day <= C.days.length && !save.over)
      menu.appendChild(folder('Devam et', save.vekil + ' · ' + save.day + '. gün sabahı · Kasa ' + VK.money(save.money), () => resumeCareer(save), 'KAYITLI'));
    menu.append(
      folder('Yeni kariyer', '10 iş günü. Dosyaları işle, kirayı öde, sicilini temiz tut.', () => newCareerScreen()),
      folder('Serbest çalışma', 'Konu ve yıl seç; saat ve kasa yok, her dosyada gerekçe var.', () => practiceSetup(), null, true),
      folder('Sınav provası', 'Gerçek kitapçıkları süreli çöz, sonunda karne al.', () => examSetup(), null, true),
      folder('Mevzuat Klasörü', 'Büronun özet notları: süreler, ret nedenleri, Nice cetveli.', () => UI.rulebook({}), null, true),
      folder('İstatistikler', 'Hangi konuda ne kadar isabetlisin?', () => statsScreen(), null, true),
      folder('Ayarlar', 'Ses, mesai temposu, yazı boyu.', () => settingsModal(), null, true),
    );
    const el = h(
      'div.screen.title-screen',
      h(
        'div.title-wrap',
        h(
          'div.title-hero',
          h('div.logo-stamp', { role: 'img', 'aria-label': 'VEKİL' }, 'VEKİL'),
          h('h1.title-sub', 'Patent ve marka vekilinin masası'),
          h(
            'p.title-lede',
            'Moda\'da küçük bir büro, bir sekreter, bir stajyer ve kapıda sıra bekleyen müvekkiller. Her dosya gerçek bir vekillik sınavı sorusundan ya da büronun kontrol protokollerinden geliyor. Belgeleri incele, Mevzuat Klasörüne bak, kararını mühürle.',
          ),
          h(
            'div.title-facts',
            h('span', h('b', String(Q.length)), ' sınav dosyası'),
            h('span', h('b', years.length ? years[0] + '–' + years[years.length - 1] : '—'), ' sınav yılları'),
            h('span', h('b', '4'), ' protokol türü'),
            h('span', h('b', String(C.days.length)), ' iş günü'),
          ),
        ),
        menu,
        h(
          'p.title-foot',
          'Sorular, Türk Patent ve Marka Kurumunun 2015, 2017, 2019, 2021 ve 2024 Patent ve Marka Vekilliği sınavlarının A kitapçıklarından ve resmî cevap anahtarlarından alınmıştır. Dosya çerçeveleri, isimler ve gerekçeler oyun için hazırlanmış kurgusal/özet içeriktir; mevzuat değişmiş olabilir, resmî metinler esastır.',
        ),
      ),
    );
    show(el, null);
  }

  /* ---------- Ayarlar ---------- */
  function settingsModal() {
    const s = VK.settings;
    const seg = (name, opts, val) =>
      h(
        'div.seg',
        { role: 'radiogroup' },
        Object.entries(opts).map(([k, label]) => h('label', h('input', { type: 'radio', name, value: k, checked: k === val }), h('span', label))),
      );
    const form = h(
      'form',
      { onsubmit: (e) => e.preventDefault() },
      h('h3', 'Ayarlar'),
      h('div.field-row', h('label', { for: 'set-name' }, 'Vekil adı'), h('input#set-name', { type: 'text', value: s.vekil, maxlength: '40', placeholder: 'Ad Soyad' })),
      h('fieldset', h('legend', 'Mesai temposu'), seg('pace', PACE_LABEL, s.pace)),
      h(
        'fieldset',
        h('legend', 'Görünüm ve ses'),
        h(
          'div.check-grid',
          h('label', h('input#set-sound', { type: 'checkbox', checked: s.sound }), 'Ses efektleri'),
          h('label', h('input#set-big', { type: 'checkbox', checked: s.bigText }), 'Büyük belge yazısı'),
          h('label', h('input#set-motion', { type: 'checkbox', checked: s.reduceMotion }), 'Animasyonları azalt'),
        ),
      ),
    );
    let m;
    const save = () => {
      s.vekil = form.querySelector('#set-name').value.trim();
      s.pace = (form.querySelector('input[name=pace]:checked') || {}).value || 'normal';
      s.sound = form.querySelector('#set-sound').checked;
      s.bigText = form.querySelector('#set-big').checked;
      s.reduceMotion = form.querySelector('#set-motion').checked;
      saveSettings();
      m.close();
    };
    form.appendChild(h('div.actions', h('button.btn', { type: 'button', onclick: () => m.close() }, 'Vazgeç'), h('button.btn.primary', { type: 'button', onclick: save }, 'Kaydet')));
    m = UI.modal(form);
  }

  /* =====================================================================
     KARİYER
     ===================================================================== */
  let S = null; // kariyer durumu (kalıcı)
  let W = null; // günün çalışma durumu (geçici)

  function saveCareer() {
    VK.store.set('career', S);
  }

  function newCareerScreen() {
    const input = h('input#vekil-name', { type: 'text', maxlength: '40', value: VK.settings.vekil || '', placeholder: 'Ad Soyad', autocomplete: 'name' });
    const go = () => {
      const name = input.value.trim() || 'Ece Yalın';
      VK.settings.vekil = name;
      saveSettings();
      S = {
        v: 1,
        vekil: name,
        day: 1,
        date: D.iso(D.parse(C.start)),
        money: C.startMoney,
        rep: C.startRep,
        discipline: 0,
        flags: {},
        applied: {},
        negDays: 0,
        owned: {},
        tomorrow: { stajyer: false, abonelik: false },
        fileNo: 0,
        totals: { files: 0, correct: 0 },
        topics: {},
        seen: {},
        seed: Math.floor(Math.random() * 1e9),
      };
      saveCareer();
      bulletinScreen();
    };
    const el = h(
      'div.screen.paper-screen',
      h(
        'article.sheet',
        h('p', { style: { textAlign: 'right', margin: 0 } }, D.fmt(D.addDays(D.parse(C.start), -3))),
        h('h1', { style: { fontSize: 'clamp(30px,5vw,44px)', textTransform: 'uppercase' } }, 'Sicil kaydınız tamamlandı'),
        h('p', 'Patent ve Marka Vekilliği sınavını geçtiniz; adınız vekil siciline işlendi. Moda\'da, bir kırtasiyenin üstünde iki odalı bir büro kiraladınız. Sekreteriniz Nermin Hanım evrakı hazırlıyor. İsterseniz stajyer Deniz de yardıma hazır.'),
        h('p', 'Önünüzde 10 iş günü var. Her sabah gelen bülteni okuyun, bekleme salonundaki müvekkilleri tek tek masanıza alın, belgeleri inceleyin ve Karar Formuna mührünüzü vurun. Akşam kira, maaş ve faturalar ödenir.'),
        h('p', 'Doğru kararlar ücret ve itibar getirir. Yanlış kararlar müvekkil kaybettirir. Etik dışı kestirmeler ise disiplin dosyanıza işlenir.'),
        h('div.field-row', { style: { marginTop: '18px', maxWidth: '420px' } }, h('label', { for: 'vekil-name' }, 'Kapıdaki tabelaya yazılacak ad'), input),
        h(
          'div.actions',
          h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Geri'),
          h('button.btn.primary', { type: 'button', onclick: go }, 'Büroyu aç'),
        ),
        h('p.inline-help', { style: { marginTop: '14px' } }, 'Mesai temposu: ' + PACE_LABEL[VK.settings.pace] + '. Ayarlardan değiştirebilirsin. İlerleme her sabah bu tarayıcıya kaydedilir.'),
      ),
    );
    show(el, (e) => {
      if (e.key === 'Enter') go();
    });
    setTimeout(() => input.focus(), 50);
  }

  function resumeCareer(save) {
    S = save;
    bulletinScreen();
  }

  /* ---------- Sabah bülteni ---------- */
  function bulletinScreen() {
    const day = C.days[S.day - 1];
    const today = D.fromIso(S.date);
    // Geçmiş tercihlerin bedeli
    const breaking = [];
    (day.consequences || []).forEach((id) => {
      if (S.flags[id] && !S.applied[id]) {
        const c = C.consequences[id];
        S.applied[id] = true;
        S.rep = Math.max(0, Math.min(100, S.rep + c.rep));
        S.discipline += c.discipline;
        S.money += c.money;
        breaking.push(c);
      }
    });
    saveCareer();
    const over = S.discipline >= 3 ? 'men' : S.rep <= 0 ? 'itibar' : null;
    const fresh = VK.RULEBOOK.filter((s) => s.unlock === S.day).map((s) => s.title);
    const n = day.news;
    const sheet = h(
      'article.sheet.news',
      h(
        'header.masthead',
        h('div.mh-title', 'SINAİ MÜLKİYET POSTASI'),
        h('div.mh-line', h('span', D.longDay(today)), h('span', S.day + '. gün · ' + day.title), h('span', 'Fiyatı: bir dosya')),
      ),
      breaking.map((b) =>
        h(
          'div.breaking',
          h('h4', 'Son dakika: ' + b.headline),
          h('p', { style: { margin: 0 } }, b.text),
          h(
            'p',
            { style: { margin: '6px 0 0', fontFamily: 'var(--f-ui)', fontWeight: 600 } },
            ['İtibar ' + VK.signed(b.rep), b.discipline ? 'Disiplin kaydı +' + b.discipline : '', b.money ? 'Kasa ' + VK.money(b.money) : ''].filter(Boolean).join(' · '),
          ),
        ),
      ),
      h('h2.headline', n.headline),
      h('p.deck', n.deck),
      h('div.news-cols', n.items.map(([t, p]) => h('div', h('h4', t), h('p', p)))),
      h('div.memo-box', h('b', 'Nermin Hanım\'ın notu'), h('p', { style: { margin: '4px 0 0' } }, day.memo)),
      day.protocol ? h('div.protocol-box', day.protocol) : null,
      fresh.length ? h('p', { style: { marginTop: '12px' } }, 'Mevzuat Klasörüne eklenen bölümler: ', h('b', fresh.join(', '))) : null,
      h(
        'div.actions',
        h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Ana menü'),
        h('button.btn', { type: 'button', onclick: () => UI.rulebook({ day: S.day, fresh: VK.RULEBOOK.filter((s) => s.unlock === S.day).map((s) => s.id) }) }, 'Mevzuat Klasörü'),
        over
          ? h('button.btn.primary', { type: 'button', onclick: () => endingScreen(over) }, 'Devam')
          : h('button.btn.primary', { type: 'button', onclick: () => startDay() }, 'Büroyu aç ↵'),
      ),
    );
    show(h('div.screen.paper-screen', sheet), (e) => {
      if (e.key === 'Enter') over ? endingScreen(over) : startDay();
    });
  }

  /* ---------- Gün kuyruğu ---------- */
  function pickQuestions(rng, day, count, excludeSeen) {
    const pool = Q.filter((q) => q.year !== 2015);
    const weights = day.topics;
    const keys = Object.keys(weights);
    const totalW = keys.reduce((a, k) => a + weights[k], 0);
    // en büyük kalan yöntemiyle dağıt
    const raw = keys.map((k) => ({ k, x: (count * weights[k]) / totalW }));
    raw.forEach((r) => (r.n = Math.floor(r.x)));
    let left = count - raw.reduce((a, r) => a + r.n, 0);
    raw.sort((a, b) => b.x - b.n - (a.x - a.n)).forEach((r) => {
      if (left > 0) {
        r.n++;
        left--;
      }
    });
    const chosen = [];
    const taken = new Set();
    const okDiff = (q, strict) => !strict || ((!day.maxDiff || q.difficulty <= day.maxDiff) && (!day.minDiff || q.difficulty >= day.minDiff));
    const score = (q) => (excludeSeen[q.id] ? 100 : 0) + (stats.q[q.id] ? Math.min(5, stats.q[q.id].s) : 0) + rng();
    raw.forEach((r) => {
      for (const strict of [true, false]) {
        if (r.n <= 0) break;
        const cand = pool.filter((q) => q.topic === r.k && !taken.has(q.id) && okDiff(q, strict)).sort((a, b) => score(a) - score(b));
        while (r.n > 0 && cand.length) {
          const q = cand.shift();
          taken.add(q.id);
          chosen.push(q.id);
          r.n--;
        }
      }
    });
    // eksik kalırsa herhangi bir konudan tamamla
    if (chosen.length < count) {
      const rest = pool.filter((q) => !taken.has(q.id)).sort((a, b) => score(a) - score(b));
      while (chosen.length < count && rest.length) chosen.push(rest.shift().id);
    }
    return chosen;
  }

  function startDay() {
    const day = C.days[S.day - 1];
    const today = D.fromIso(S.date);
    const rng = VK.rng('day:' + S.day + ':' + S.seed);
    const examCount = Math.max(2, day.exam + (S.rep >= 70 ? 1 : 0) - (S.rep < 30 ? 1 : 0));
    const exams = pickQuestions(rng, day, examCount, S.seen).map((id) => ({ type: 'exam', id }));
    const procs = day.proc.map((g, i) => ({ type: 'proc', gen: g, seed: S.seed + '-' + S.day + '-' + i }));
    let queue = rng.shuffle(exams.concat(procs));
    if (S.day === 1) {
      // ilk gün yumuşak başlangıç: önce bir form kontrolü
      const i = queue.findIndex((x) => x.type === 'proc');
      if (i > 0) queue.unshift(queue.splice(i, 1)[0]);
      queue[0].scenario = 'ok';
    }
    if (day.event && !S.applied['ev:' + day.event.id]) queue.splice(Math.min(day.event.at, queue.length), 0, { type: 'event', id: day.event.id });
    W = {
      day,
      today,
      queue,
      total: queue.length,
      clock: S.owned.kahve ? 8 * 60 + 15 : C.dayStart,
      end: C.dayEnd,
      mistakes: 0,
      correct: 0,
      files: 0,
      fees: 0,
      bonus: 0,
      fines: 0,
      eventNet: 0,
      repStart: S.rep,
      moneyStart: S.money,
      log: [],
      topics: {},
      // ilk gün Deniz ve veri tabanı deneme amaçlı ücretsiz
      stajyer: S.tomorrow.stajyer || S.day === 1 ? 2 : 0,
      abonelik: !!S.tomorrow.abonelik || S.day === 1,
      closing: false,
      paused: false,
      active: false,
      over: false,
    };
    officeScreen('career');
  }

  /* ---------- Ofis ekranı (kariyer + serbest çalışma) ---------- */
  let O = null; // ofis DOM referansları
  function officeScreen(mode) {
    const career = mode === 'career';
    const hud = h('header.hud');
    const cell = (label, id, cls) => h('div.cell' + (cls ? '.' + cls : ''), h('small', label), h('b', { id }, '—'));
    hud.appendChild(h('span.brand', 'VEKİL'));
    if (career) {
      hud.append(
        cell(W.day.n + '. gün · ' + D.dayName(W.today), 'hud-date'),
        cell('Saat', 'hud-clock', 'clock'),
        cell('Kasa', 'hud-money'),
        cell('İtibar', 'hud-rep'),
        h('div.cell', h('small', 'Uyarı'), h('div.pips#hud-warn')),
        h('div.cell', h('small', 'Disiplin'), h('div.pips#hud-disc')),
        cell('Salonda', 'hud-queue'),
      );
    } else {
      hud.append(cell('Serbest çalışma', 'hud-date'), cell('İlerleme', 'hud-queue'), cell('Doğru', 'hud-correct'));
    }
    hud.append(h('span.spacer'));
    const btns = h('div.hud-btns');
    if (career) btns.appendChild(h('button.btn.small', { type: 'button', onclick: () => togglePause(), title: 'Mola (P)' }, 'Mola'));
    btns.appendChild(
      h(
        'button.btn.small#hud-sound',
        {
          type: 'button',
          onclick: (e) => {
            VK.settings.sound = !VK.settings.sound;
            saveSettings();
            e.currentTarget.textContent = VK.settings.sound ? 'Ses açık' : 'Ses kapalı';
          },
        },
        VK.settings.sound ? 'Ses açık' : 'Ses kapalı',
      ),
    );
    btns.appendChild(h('button.btn.small', { type: 'button', onclick: () => officeMenu(mode) }, 'Menü'));
    hud.appendChild(btns);

    const hall = h('canvas.hall', { 'aria-hidden': 'true' });
    const hallLabel = h('span.hall-label');
    const portrait = h('canvas', { 'aria-hidden': 'true' });
    const pframe = h('div.portrait-frame.empty', portrait, h('div.empty-msg', 'Tezgâh boş'));
    const np = h('div.nameplate', h('div.np-name', '—'), h('div.np-sector', 'Sıradaki müvekkili çağır'));
    const speech = h('div.speech', { 'aria-live': 'polite' });
    const bell = h('button.bell', { type: 'button', onclick: () => onBell() }, h('span.bell-label', 'Sıradaki!'), h('span.kbd', 'Boşluk'));
    const tool = (label, key, fn, id) => h('button.tool' + (id ? '#' + id : ''), { type: 'button', onclick: fn }, h('span', label), key ? h('kbd', key) : null);
    const tools = h(
      'div.tools',
      tool('Mevzuat', 'M', () => openRulebook()),
      tool('Süre cetveli', 'T', () => UI.calc(career ? W.today : P.today)),
      tool('İncele', 'I', () => toggleInspect(), 'tool-inspect'),
      tool('Stajyere sor', null, () => askIntern(), 'tool-intern'),
      tool('İpucu', null, () => showHint(), 'tool-hint'),
      tool('Masayı topla', null, () => tidyDesk(), 'tool-tidy'),
    );
    const booth = h(
      'aside.booth',
      h('div.hall-wrap', hall, hallLabel),
      h('div.counter', pframe, h('div.counter-info', np, speech, bell)),
      tools,
    );
    const desk = h('main.desk', { 'aria-label': 'Masa' });
    const office = h('div.office', booth, desk);
    const screen = h('div.screen.office-screen', hud, office);
    show(screen, officeKeys, 'in-office');
    Desk.mount(desk);
    O = { mode, hud, hall, hallLabel, portrait, pframe, np, speech, bell, tools, desk, screen, step: 0 };
    updateHud();
    updateHall();
    updateTools();
    Desk.empty(career ? 'Günaydın' : 'Çalışma masası', career ? 'Bekleme salonunda ' + W.queue.length + ' kişi var. İlkini çağırmak için zile bas.' : 'İlk dosyayı almak için zile bas.');
    if (career) startClock();
    teardown = () => {
      stopClock();
      O = null;
    };
  }

  function officeKeys(e) {
    const k = e.key.toLowerCase();
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (Desk.slipOpen()) Desk.closeSlip();
      else onBell();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (Desk.slipOpen()) Desk.closeSlip();
      else Desk.stamp();
      return;
    }
    const map = { a: 0, b: 1, c: 2, d: 3, e: 4, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 };
    if (k in map && Desk.currentFile() && !Desk.isStamped()) {
      Desk.selectIndex(map[k]);
      return;
    }
    if (k === 'm') openRulebook();
    else if (k === 't') UI.calc(O && O.mode === 'career' ? W.today : P && P.today);
    else if (k === 'i') toggleInspect();
    else if (k === 'p' && O && O.mode === 'career') togglePause();
  }

  function openRulebook() {
    if (O && O.mode === 'career') UI.rulebook({ day: S.day, fresh: VK.RULEBOOK.filter((s) => s.unlock === S.day).map((s) => s.id) });
    else UI.rulebook({});
  }

  function updateHud() {
    if (!O) return;
    const $ = (id) => O.hud.querySelector('#' + id);
    if (O.mode === 'career') {
      $('hud-date').textContent = D.fmt(W.today);
      $('hud-money').textContent = VK.money(S.money);
      $('hud-rep').textContent = String(S.rep);
      $('hud-queue').textContent = String(W.queue.length);
      const warn = $('hud-warn');
      warn.innerHTML = '';
      for (let i = 0; i < 2; i++) warn.appendChild(h('span.pip' + (W.mistakes > i ? '.on' : '')));
      if (W.mistakes > 2) warn.appendChild(h('span.badge', '+' + (W.mistakes - 2)));
      const disc = $('hud-disc');
      disc.innerHTML = '';
      for (let i = 0; i < 3; i++) disc.appendChild(h('span.pip.sq.red' + (S.discipline > i ? '.on' : '')));
      updateClock();
    } else {
      $('hud-date').textContent = P.label;
      $('hud-queue').textContent = P.done + '/' + P.list.length;
      $('hud-correct').textContent = String(P.correct);
    }
  }
  function pop(text, good) {
    if (!O) return;
    const target = O.hud.querySelector(O.mode === 'career' ? '#hud-money' : '#hud-correct');
    if (!target) return;
    const r = target.getBoundingClientRect();
    const el = h('div.money-pop', { style: { left: r.left + 'px', top: r.bottom + 4 + 'px', color: good ? '#9bd48f' : '#ff8a6e', position: 'fixed' } }, text);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }
  function updateHall() {
    if (!O) return;
    const n = O.mode === 'career' ? W.queue.length : P.list.length - P.done - (P.active ? 1 : 0);
    VK.drawHall(O.hall, Math.max(0, n), O.mode === 'career' ? S.seed + ':' + S.day : 'practice', O.step);
    O.hallLabel.textContent = 'Bekleme salonu · ' + Math.max(0, n) + ' kişi';
    if (O.mode === 'career') O.hud.querySelector('#hud-queue').textContent = String(W.queue.length);
  }
  function updateTools() {
    if (!O) return;
    const f = Desk.currentFile();
    const live = f && !Desk.isStamped();
    const career = O.mode === 'career';
    const ins = O.tools.querySelector('#tool-inspect');
    ins.disabled = !(live && f.inspectable);
    ins.title = f && !f.inspectable ? 'Bu dosyada karşılaştırılacak alan yok' : 'Çelişen iki alana sırayla tıkla';
    ins.classList.toggle('on', Desk.inspecting());
    const intern = O.tools.querySelector('#tool-intern');
    const left = career ? W.stajyer : Infinity;
    intern.disabled = !live || left <= 0 || (f && f._interned);
    intern.querySelector('span').textContent = career ? 'Stajyere sor (' + left + ')' : 'Stajyere sor';
    intern.title = career && !S.tomorrow.stajyer && W.stajyer <= 0 ? 'Stajyer bugün yok. Akşam hesap defterinden çağırabilirsin.' : 'İki yanlış seçeneği eler';
    const hint = O.tools.querySelector('#tool-hint');
    hint.disabled = !(live && f.hint) || (career && !W.abonelik);
    hint.title = career && !W.abonelik ? 'Mevzuat veri tabanı aboneliği gerekir' : 'Dosya için bir ipucu notu';
  }
  function toggleInspect() {
    const f = Desk.currentFile();
    if (!f || !f.inspectable || Desk.isStamped()) {
      if (O) Desk.toast(f ? 'Bu dosyada inceleme modu kullanılmaz; belgeleri oku ve karar ver.' : 'Masada dosya yok.');
      return;
    }
    const on = Desk.setInspect(!Desk.inspecting());
    if (on) Desk.toast('İnceleme modu: çelişen iki alana sırayla tıkla.');
    updateTools();
  }
  function askIntern() {
    const f = Desk.currentFile();
    if (!f || Desk.isStamped() || f._interned) return;
    if (O.mode === 'career') {
      if (W.stajyer <= 0) return;
      W.stajyer--;
    }
    f._interned = true;
    Desk.eliminate(Math.min(2, f.options.length - 2));
    Desk.toast('Deniz: "Şu ikisi olamaz, eminim. Gerisi sizde."');
    updateTools();
  }
  function showHint() {
    const f = Desk.currentFile();
    if (!f || !f.hint) return;
    Desk.sticky('İpucu', f.hint);
  }
  function tidyDesk() {
    const docs = Array.from(document.querySelectorAll('.desk-surface .doc'));
    docs.forEach((d, i) => {
      d.style.left = 14 + i * 26 + 'px';
      d.style.top = 14 + i * 26 + 'px';
    });
  }

  /* ---------- Saat ---------- */
  let clockTimer = null;
  let lastTick = 0;
  function startClock() {
    stopClock();
    lastTick = performance.now();
    clockTimer = setInterval(tickClock, 250);
    document.addEventListener('visibilitychange', onVis);
  }
  function stopClock() {
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = null;
    document.removeEventListener('visibilitychange', onVis);
  }
  function onVis() {
    if (document.hidden && W && !W.paused && !W.over) togglePause(true);
  }
  function tickClock() {
    const now = performance.now();
    const dt = (now - lastTick) / 1000;
    lastTick = now;
    const secs = PACE[VK.settings.pace];
    if (!W || W.paused || W.over || !secs) {
      updateClock();
      return;
    }
    W.clock += dt * ((C.dayEnd - C.dayStart) / secs);
    if (W.clock >= W.end && !W.closing) {
      W.clock = W.end;
      W.closing = true;
      if (O) {
        Desk.toast('<b>18:00.</b> Mesai bitti. ' + (W.active ? 'Elindeki dosyayı tamamla.' : 'Salondakiler yarın tekrar gelecek.'), null, 4000);
        O.bell.disabled = true;
      }
      if (!W.active) setTimeout(endDay, 900);
    }
    updateClock();
  }
  function updateClock() {
    if (!O || O.mode !== 'career') return;
    const el = O.hud.querySelector('#hud-clock');
    const secs = PACE[VK.settings.pace];
    const m = Math.floor(W.clock);
    el.textContent = secs ? String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0') : '—:—';
    el.parentElement.classList.toggle('late', !!secs && W.clock >= W.end - 60);
  }
  function togglePause(force) {
    if (!O || O.mode !== 'career' || W.over) return;
    if (W.paused && force !== true) {
      W.paused = false;
      const p = O.screen.querySelector('.pause-scrim');
      if (p) p.remove();
      lastTick = performance.now();
      return;
    }
    if (W.paused) return;
    W.paused = true;
    const cont = h('button.btn.primary', { type: 'button', onclick: () => togglePause() }, 'Mesaiye dön');
    O.screen.appendChild(h('div.pause-scrim', h('div', h('h2', 'MOLA'), h('p', 'Saat durdu. Çayını iç, sonra devam et.'), cont)));
    setTimeout(() => cont.focus(), 30);
  }

  function officeMenu(mode) {
    if (mode === 'career' && !W.paused) togglePause(true);
    let m;
    const items =
      mode === 'career'
        ? [
            h('p', 'Kariyer her sabah kaydedilir. Ana menüye dönersen bugünkü ilerleme kaybolur; kaldığın gün sabahından devam edebilirsin.'),
            h(
              'div.actions',
              h('button.btn', { type: 'button', onclick: () => (m.close(), settingsModal()) }, 'Ayarlar'),
              h('button.btn', { type: 'button', onclick: () => (m.close(), titleScreen()) }, 'Ana menüye dön'),
              h('button.btn.primary', { type: 'button', onclick: () => m.close() }, 'Masaya dön'),
            ),
          ]
        : [
            h('p', 'Çalışmayı şimdi bitirirsen o ana kadarki karneni görürsün.'),
            h(
              'div.actions',
              h('button.btn', { type: 'button', onclick: () => (m.close(), settingsModal()) }, 'Ayarlar'),
              h('button.btn', { type: 'button', onclick: () => (m.close(), practiceSummary()) }, 'Çalışmayı bitir'),
              h('button.btn.primary', { type: 'button', onclick: () => m.close() }, 'Masaya dön'),
            ),
          ];
    m = UI.modal([h('h3', 'Menü')].concat(items));
  }

  /* ---------- Müvekkil gelişi / gidişi ---------- */
  function showClient(client, line, portraitOpts) {
    if (!O) return;
    const seed = client.contact || client.name;
    const opts = Object.assign({}, portraitOpts || {});
    if (client.name === 'Stajyer Deniz') Object.assign(opts, { style: 5, glasses: true, tie: false, mustache: false, skin: '#e2b08a', suit: '#47506b' });
    VK.drawPortrait(O.portrait, seed, opts);
    O.pframe.classList.remove('empty', 'leaving');
    O.np.querySelector('.np-name').textContent = client.name;
    O.np.querySelector('.np-sector').textContent = [client.contact, client.sector].filter(Boolean).join(' · ') || ' ';
    O.speech.textContent = line || '';
    O.step += 12;
    updateHall();
  }
  function clientMood(client, mood, portraitOpts) {
    if (!O) return;
    const opts = Object.assign({}, portraitOpts || {}, { mood });
    if (client.name === 'Stajyer Deniz') Object.assign(opts, { style: 5, glasses: true, tie: false, mustache: false, skin: '#e2b08a', suit: '#47506b' });
    VK.drawPortrait(O.portrait, client.contact || client.name, opts);
  }
  async function clientLeave() {
    if (!O) return;
    O.pframe.classList.add('leaving');
    await VK.sleep(VK.reducedMotion() || VK.settings.reduceMotion ? 30 : 420);
    if (!O) return;
    O.pframe.classList.remove('leaving');
    O.pframe.classList.add('empty');
    O.np.querySelector('.np-name').textContent = '—';
    O.np.querySelector('.np-sector').textContent = O.mode === 'career' && W.queue.length === 0 ? 'Salon boş' : 'Sıradaki müvekkili çağır';
    O.speech.textContent = '';
  }

  /* ---------- Zil ---------- */
  function onBell() {
    if (!O) return;
    if (O.mode === 'career') {
      if (W.active || W.over) return;
      if (W.closing || W.queue.length === 0) {
        endDay();
        return;
      }
      if (W.paused) return;
      nextCareerItem();
    } else {
      if (P.active) return;
      if (P.done >= P.list.length) {
        practiceSummary();
        return;
      }
      nextPracticeItem();
    }
  }
  function setBell(label, disabled) {
    if (!O) return;
    O.bell.querySelector('.bell-label').textContent = label;
    O.bell.disabled = !!disabled;
  }

  /* ---------- Kariyer: dosya işleme ---------- */
  const repMult = () => 0.7 + S.rep * 0.006;
  const baseFee = (f) => (f.kind === 'proc' ? f.fee || 1200 : { 1: 1500, 2: 2200, 3: 3000 }[f.difficulty] || 2200);

  async function nextCareerItem() {
    W.active = true;
    setBell('Görüşmede', true);
    const item = W.queue.shift();
    VK.sfx.bell();
    updateHall();
    updateHud();
    if (item.type === 'event') {
      const ev = C.events[item.id];
      showClient(ev.client, ev.line, ev.portrait);
      const choice = await Desk.eventCard(ev);
      S.applied['ev:' + item.id] = true;
      S.money += choice.money;
      W.eventNet += choice.money;
      S.rep = Math.max(0, Math.min(100, S.rep + choice.rep));
      if (choice.flag) S.flags[choice.flag] = true;
      if (choice.money) pop((choice.money > 0 ? '+' : '') + VK.money(choice.money), choice.money > 0);
      if (O) O.speech.textContent = choice.reply;
      W.log.push({ event: true, title: ev.title, choice: choice.label });
      updateHud();
      await VK.sleep(1400);
      await Desk.clear();
      await clientLeave();
    } else {
      S.fileNo++;
      const fileNo = 'Dosya ' + W.today.getUTCFullYear() + '/' + String(S.fileNo).padStart(3, '0');
      let file;
      if (item.type === 'exam') file = VK.examFile(byId.get(item.id), { fileNo, today: W.today });
      else file = VK.makeProc(item.gen, item.seed, { today: W.today, vekil: S.vekil, scenario: item.scenario });
      file.fileNo = fileNo;
      showClient(file.client, file.line);
      const loaded = Desk.load(file);
      updateTools();
      const res = await loaded;
      Desk.setInspect(false);
      updateTools();
      const out = evaluateCareer(file, res);
      Desk.reveal(file.answer, res.choice);
      clientMood(file.client, out.correct ? 'happy' : 'angry');
      if (O) O.speech.textContent = out.reaction;
      updateHud();
      await Desk.slip(out.slip);
      await Desk.clear();
      await clientLeave();
    }
    if (!O) return;
    W.active = false;
    updateTools();
    if (W.closing) {
      setBell('Mesai bitti', true);
      setTimeout(endDay, 600);
      return;
    }
    if (W.queue.length === 0) {
      setBell('Günü bitir', false);
      Desk.empty('Salon boş', 'Bugünkü bütün müvekkiller gitti. Günü bitirmek için zile bas.');
    } else setBell('Sıradaki!', false);
  }

  function slipFor(file, choice, correct, extra) {
    const why = file.explanation || '';
    const notes = [];
    if (file.outdated) notes.push('Mevzuat notu: ' + file.outdated);
    if (file.keyNote) notes.push('Cevap anahtarı notu: ' + file.keyNote);
    const ct = VK.optionText(file, file.answer);
    const yours = VK.optionText(file, choice);
    return Object.assign(
      {
        correct: correct
          ? 'Kararın: <b>' + choice + ')</b> ' + VK.inline(yours)
          : 'Senin kararın: <b>' + choice + ')</b> ' + VK.inline(yours) + '<br>Doğru karar: <b>' + file.answer + ')</b> ' + VK.inline(ct),
        why,
        law: file.law || '',
        src: file.kind === 'exam' ? 'Kaynak: ' + file.src : 'Protokol dosyası · ' + (VK.PROC_LABELS[file.gen] || ''),
        notes,
      },
      extra,
    );
  }

  function evaluateCareer(file, res) {
    const correct = res.choice === file.answer;
    const r = VK.rng(file.id + ':react');
    let fee = 0,
      bonus = 0,
      fine = 0,
      rep = 0;
    if (correct) {
      fee = Math.round((baseFee(file) * repMult()) / 50) * 50;
      if (file.kind === 'proc' && res.found && res.found === file.answer) bonus = 300;
      rep = file.kind === 'proc' ? 2 : { 1: 2, 2: 3, 3: 4 }[file.difficulty] || 3;
      W.correct++;
    } else {
      W.mistakes++;
      rep = file.kind === 'proc' ? -4 : -5;
      if (W.mistakes > 2) fine = 1000;
    }
    S.money += fee + bonus - fine;
    S.rep = Math.max(0, Math.min(100, S.rep + rep));
    W.fees += fee;
    W.bonus += bonus;
    W.fines += fine;
    W.files++;
    S.totals.files++;
    if (correct) S.totals.correct++;
    const t = file.topic;
    (W.topics[t] = W.topics[t] || { n: 0, c: 0 }).n++;
    (S.topics[t] = S.topics[t] || { n: 0, c: 0 }).n++;
    if (correct) {
      W.topics[t].c++;
      S.topics[t].c++;
    }
    if (file.kind === 'exam') S.seen[file.id] = 1;
    record(file, correct);
    W.log.push({
      title: file.title,
      choice: res.choice,
      answer: file.answer,
      answerText: VK.optionText(file, file.answer),
      explanation: file.explanation,
      src: file.kind === 'exam' ? file.src : VK.PROC_LABELS[file.gen],
      correct,
      topic: t,
    });
    if (fee + bonus) pop('+' + VK.money(fee + bonus), true);
    if (fine) pop('−' + VK.money(fine), false);
    VK.sfx[correct ? 'good' : 'bad']();
    const meta = [];
    if (correct) {
      meta.push({ text: 'Vekalet ücreti +' + VK.money(fee), cls: 'pos' });
      if (bonus) meta.push({ text: 'Titizlik primi +' + VK.money(bonus), cls: 'pos' });
    } else if (fine) meta.push({ text: 'Tazminat −' + VK.money(fine), cls: 'neg' });
    meta.push({ text: 'İtibar ' + VK.signed(rep), cls: rep >= 0 ? 'pos' : 'neg' });
    const reaction = r.pick(C.reactions[correct ? 'good' : 'bad']);
    const title = correct
      ? r.pick(['MÜVEKKİL MEMNUN', 'İŞLEM DOĞRU', 'DOSYA TAMAM'])
      : fine
        ? 'HATALI KARAR · TAZMİNAT'
        : 'HATALI KARAR · UYARI ' + W.mistakes + '/2';
    return { correct, reaction, slip: slipFor(file, res.choice, correct, { tone: correct ? 'good' : 'bad', title, meta, quote: reaction }) };
  }

  /* ---------- Gün sonu ---------- */
  function endDay() {
    if (!W || W.over) return;
    W.over = true;
    stopClock();
    ledgerScreen();
  }

  function ledgerScreen() {
    const left = W.queue.filter((x) => x.type !== 'event').length;
    const optState = { stajyer: S.day > 1 && !!S.tomorrow.stajyer, abonelik: S.day > 1 && !!S.tomorrow.abonelik, kahve: false };
    const fixed = C.fixedCosts.reduce((a, c) => a + c.amount, 0);
    const tbody = h('tbody');
    const totalCell = h('td.amt');
    const row = (label, amt, cls) => h('tr' + (cls ? '.' + cls : ''), h('td', label), h('td.amt' + (amt < 0 ? '.neg' : amt > 0 ? '.pos' : ''), amt === null ? '' : (amt > 0 ? '+' : '') + VK.money(amt)));
    const lastDay = S.day >= C.days.length;
    const complaint = W.mistakes >= 6;
    const recompute = () => {
      let t = S.money - fixed;
      if (!lastDay) {
        C.dailyOptions.forEach((o) => {
          if (optState[o.id]) t -= o.amount;
        });
        C.oneTime.forEach((o) => {
          if (optState[o.id]) t -= o.amount;
        });
      }
      totalCell.textContent = VK.money(t);
      totalCell.className = 'amt' + (t < 0 ? ' neg' : '');
      return t;
    };
    [
      h('tr', h('td', 'Sabah kasası'), h('td.amt', VK.money(W.moneyStart))),
      row('Vekalet ücretleri (' + W.correct + ' doğru dosya)', W.fees),
      W.bonus ? row('Titizlik primleri', W.bonus) : null,
      W.eventNet ? row('Özel görüşmeler', W.eventNet) : null,
      W.fines ? row('Müvekkil tazminatları', -W.fines) : null,
      h('tr.sub', h('td', 'Akşam kasası'), h('td.amt', VK.money(S.money))),
    ]
      .concat(C.fixedCosts.map((c) => row(c.label, -c.amount)))
      .forEach((tr) => tr && tbody.appendChild(tr));
    if (!lastDay) {
      C.dailyOptions.forEach((o) => {
        const cb = h('input', {
          type: 'checkbox',
          id: 'opt-' + o.id,
          checked: optState[o.id],
          onchange: (e) => {
            optState[o.id] = e.target.checked;
            recompute();
          },
        });
        tbody.appendChild(h('tr', h('td', h('label', { for: 'opt-' + o.id }, cb, h('span', o.label, h('small', o.desc)))), h('td.amt.neg', '−' + VK.money(o.amount))));
      });
      C.oneTime.forEach((o) => {
        if (S.owned[o.id]) return;
        const cb = h('input', {
          type: 'checkbox',
          id: 'opt-' + o.id,
          onchange: (e) => {
            optState[o.id] = e.target.checked;
            recompute();
          },
        });
        tbody.appendChild(h('tr', h('td', h('label', { for: 'opt-' + o.id }, cb, h('span', o.label, h('small', o.desc)))), h('td.amt.neg', '−' + VK.money(o.amount))));
      });
    }
    tbody.appendChild(h('tr.total', h('td', 'Kalan'), totalCell));
    recompute();
    const repDelta = S.rep - W.repStart;
    const card = h(
      'div',
      h('h3', 'Günün karnesi'),
      h(
        'p',
        h('span.stamp-inline.' + (W.files && W.correct / W.files >= 0.7 ? 'good' : W.files && W.correct / W.files >= 0.5 ? 'violet' : 'bad'), W.correct + ' / ' + W.files),
        '  doğru dosya · İtibar ' + S.rep + ' (' + VK.signed(repDelta) + ')',
      ),
      left ? h('p.inline-help', left + ' müvekkil mesai bitiminde salonda kaldı.') : null,
      complaint ? h('p', { style: { color: 'var(--red)', fontWeight: 700 } }, 'Bugünkü hatalar Disiplin Kurulu\'na şikâyet olarak ulaştı: disiplin kaydı +1.') : null,
      UI.topicBars(W.topics),
      h('h3', { style: { marginTop: '16px' } }, 'Hatalı dosyalar'),
      UI.mistakeList(W.log.filter((x) => !x.event)),
    );
    const go = () => {
      const remaining = recompute();
      S.money = remaining;
      if (!lastDay) {
        S.tomorrow = { stajyer: optState.stajyer, abonelik: optState.abonelik };
        if (optState.kahve) S.owned.kahve = true;
      }
      if (complaint) S.discipline += 1;
      S.negDays = S.money < 0 ? S.negDays + 1 : 0;
      let over = null;
      if (S.discipline >= 3) over = 'men';
      else if (S.negDays >= 2) over = 'iflas';
      else if (S.rep <= 0) over = 'itibar';
      if (over) return endingScreen(over);
      if (lastDay) return endingScreen(finalEnding());
      S.day++;
      S.date = D.iso(D.addWorkdays(W.today, 1));
      saveCareer();
      bulletinScreen();
    };
    const sheet = h(
      'article.sheet.ledger',
      h('h1', { style: { textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,40px)' } }, S.day + '. gün · Hesap defteri'),
      h('p', { style: { marginTop: '-4px' } }, D.longDay(W.today) + ' · ' + S.vekil + ' Vekillik Bürosu'),
      h('div.ledger-grid', h('div', h('table', tbody), S.money < 0 || recompute() < 0 ? h('p', { style: { color: 'var(--red)' } }, 'Kasa eksiye düşerse kira borcu birikir. İki akşam üst üste eksi kapatırsan büro kapanır.') : null), card),
      h('div.actions', h('button.btn.primary', { type: 'button', onclick: go }, lastDay ? 'Değerlendirmeyi gör ↵' : 'Işıkları kapat, eve git ↵')),
    );
    show(h('div.screen.paper-screen', sheet), (e) => {
      if (e.key === 'Enter') go();
    });
  }

  function finalEnding() {
    const bad = ['kotuNiyet', 'cikarCatismasi', 'kacanSure', 'tanidik'].filter((f) => S.flags[f]).length;
    const acc = S.totals.files ? S.totals.correct / S.totals.files : 0;
    if (bad >= 2) return 'lekeli';
    if (bad === 0 && acc >= 0.72 && S.money >= 12000 && S.rep >= 60) return 'ortak';
    if (acc >= 0.55) return 'saglam';
    return 'zor';
  }

  function endingScreen(id) {
    const e = C.endings[id];
    S.over = true;
    VK.store.del('career');
    const acc = S.totals.files ? Math.round((100 * S.totals.correct) / S.totals.files) : 0;
    const weak = Object.keys(S.topics)
      .filter((k) => S.topics[k].n >= 2)
      .sort((a, b) => S.topics[a].c / S.topics[a].n - S.topics[b].c / S.topics[b].n)
      .slice(0, 2);
    const sheet = h(
      'article.sheet',
      h('p', { style: { margin: 0, fontFamily: 'var(--f-ui)', letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '12px' } }, S.vekil + ' · ' + S.day + '. gün'),
      h('h1', { style: { margin: '14px 0 18px' } }, h('span.stamp-inline.' + (e.tone === 'good' ? 'good' : e.tone === 'bad' ? 'bad' : 'violet'), { style: { fontSize: 'clamp(30px,6vw,52px)' } }, e.title)),
      h('p', e.text),
      h(
        'div.stat-tiles',
        h('div.stat-tile', h('small', 'İşlenen dosya'), h('b', String(S.totals.files))),
        h('div.stat-tile', h('small', 'İsabet'), h('b', '%' + acc)),
        h('div.stat-tile', h('small', 'Kasa'), h('b', VK.money(S.money))),
        h('div.stat-tile', h('small', 'İtibar'), h('b', String(S.rep))),
        h('div.stat-tile', h('small', 'Disiplin kaydı'), h('b', String(S.discipline))),
      ),
      h('h3', 'Konulara göre'),
      UI.topicBars(S.topics),
      weak.length ? h('p', { style: { marginTop: '12px' } }, 'Çalışılacak konular: ', h('b', weak.map((k) => VK.TOPICS[k]).join(', '))) : null,
      h(
        'div.actions',
        h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Ana menü'),
        weak.length ? h('button.btn', { type: 'button', onclick: () => practiceSetup({ topics: weak }) }, 'Zayıf konuları çalış') : null,
        h('button.btn.primary', { type: 'button', onclick: () => newCareerScreen() }, 'Yeni kariyer'),
      ),
    );
    show(h('div.screen.paper-screen', sheet), null);
  }

  /* =====================================================================
     SERBEST ÇALIŞMA
     ===================================================================== */
  let P = null;
  function practiceSetup(preset) {
    preset = preset || {};
    const topicKeys = Object.keys(VK.TOPICS);
    const years = Array.from(new Set(Q.map((q) => q.year))).sort();
    const tCount = (k) => Q.filter((q) => q.topic === k).length;
    const yCount = (y) => Q.filter((q) => q.year === y).length;
    const topicBoxes = h(
      'div.check-grid',
      topicKeys.map((k) =>
        h('label', h('input', { type: 'checkbox', name: 'topic', value: k, checked: preset.topics ? preset.topics.includes(k) : true }), VK.TOPICS[k], h('span.cnt', '(' + tCount(k) + ')')),
      ),
    );
    const yearBoxes = h(
      'div.check-grid',
      years.map((y) => h('label', h('input', { type: 'checkbox', name: 'year', value: y, checked: y !== 2015 }), String(y) + (y === 2015 ? ' · mülga KHK dönemi' : ''), h('span.cnt', '(' + yCount(y) + ')'))),
    );
    const procBoxes = h(
      'div.check-grid',
      Object.entries(VK.PROC_LABELS).map(([k, l]) => h('label', h('input', { type: 'checkbox', name: 'proc', value: k, checked: !preset.topics }), l)),
    );
    const seg = (name, opts, val) =>
      h(
        'div.seg',
        Object.entries(opts).map(([k, label]) => h('label', h('input', { type: 'radio', name, value: k, checked: String(k) === String(val) }), h('span', label))),
      );
    const countLine = h('p.inline-help', { 'aria-live': 'polite' });
    const form = h(
      'form',
      { onsubmit: (e) => e.preventDefault(), onchange: () => update() },
      h('fieldset', h('legend', 'Konular'), topicBoxes),
      h('fieldset', h('legend', 'Sınav yılları'), yearBoxes),
      h('fieldset', h('legend', 'Filtre'), seg('filter', { all: 'Tümü', unseen: 'Görmediklerim', wrong: 'Yanlış yaptıklarım' }, preset.filter || 'all')),
      h('fieldset', h('legend', 'Protokol dosyaları (rastgele üretilir)'), procBoxes),
      h('fieldset', h('legend', 'Dosya sayısı'), seg('count', { 10: '10', 20: '20', 40: '40', 0: 'Hepsi' }, preset.count != null ? preset.count : 20)),
      countLine,
    );
    function collect() {
      const fd = (n) => Array.from(form.querySelectorAll('input[name=' + n + ']:checked')).map((x) => x.value);
      const topics = fd('topic');
      const yrs = fd('year').map(Number);
      const filter = (form.querySelector('input[name=filter]:checked') || {}).value || 'all';
      const count = +((form.querySelector('input[name=count]:checked') || {}).value || 20);
      const procs = fd('proc');
      let pool = Q.filter((q) => topics.includes(q.topic) && yrs.includes(q.year));
      if (filter === 'unseen') pool = pool.filter((q) => !stats.q[q.id]);
      if (filter === 'wrong') pool = pool.filter((q) => stats.q[q.id] && stats.q[q.id].last === 0);
      return { pool, procs, count, filter };
    }
    function update() {
      const c = collect();
      const n = c.count ? Math.min(c.count, c.pool.length + (c.procs.length ? c.count : 0)) : c.pool.length;
      countLine.textContent = 'Uygun sınav dosyası: ' + c.pool.length + (c.procs.length ? ' · protokol dosyaları da karışık gelecek' : '') + '. Masaya gelecek: ' + n + ' dosya.';
      startBtn.disabled = n === 0;
    }
    const start = () => {
      const c = collect();
      const r = VK.rng(Date.now());
      let exams = r.shuffle(c.pool).map((q) => ({ type: 'exam', id: q.id }));
      let procN;
      if (!c.count) {
        // "Hepsi": bütün sınav dosyaları + biraz protokol
        procN = c.procs.length ? Math.max(c.procs.length, Math.round(exams.length * 0.15)) : 0;
      } else {
        procN = c.procs.length ? Math.max(1, Math.round(c.count * (exams.length ? 0.25 : 1))) : 0;
        if (exams.length < c.count - procN) procN = c.procs.length ? c.count - exams.length : 0;
        exams = exams.slice(0, c.count - procN);
      }
      const procs = [];
      for (let i = 0; i < procN; i++) procs.push({ type: 'proc', gen: c.procs[i % c.procs.length], seed: Date.now() + '-' + i });
      const list = r.shuffle(exams.concat(procs));
      if (!list.length) return;
      const now = new Date();
      P = { list, done: 0, correct: 0, log: [], topics: {}, active: false, label: 'Serbest çalışma', today: D.make(now.getFullYear(), now.getMonth() + 1, now.getDate()), fileNo: 0 };
      officeScreen('practice');
      setBell('Sıradaki!', false);
    };
    const startBtn = h('button.btn.primary', { type: 'button', onclick: start }, 'Masaya otur ↵');
    const sheet = h(
      'article.sheet',
      h('h1', { style: { textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,40px)' } }, 'Serbest çalışma'),
      h('p', 'Saat işlemez, kasa tutulmaz. Her dosyadan sonra gerekçe ve dayanak gelir. Stajyer ve ipucu notu sınırsız.'),
      form,
      h('div.actions', h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Geri'), startBtn),
    );
    show(h('div.screen.paper-screen', sheet), (e) => {
      if (e.key === 'Enter') start();
    });
    update();
  }

  async function nextPracticeItem() {
    P.active = true;
    setBell('Görüşmede', true);
    const item = P.list[P.done];
    VK.sfx.bell();
    updateHall();
    P.fileNo++;
    const fileNo = 'Çalışma ' + P.fileNo + '/' + P.list.length;
    const file = item.type === 'exam' ? VK.examFile(byId.get(item.id), { fileNo, today: P.today }) : VK.makeProc(item.gen, item.seed, { today: P.today, vekil: VK.settings.vekil || 'Vekil' });
    file.fileNo = fileNo;
    showClient(file.client, file.line);
    const loaded = Desk.load(file);
    updateTools();
    const res = await loaded;
    Desk.setInspect(false);
    updateTools();
    const correct = res.choice === file.answer;
    record(file, correct);
    if (correct) P.correct++;
    const t = file.topic;
    (P.topics[t] = P.topics[t] || { n: 0, c: 0 }).n++;
    if (correct) P.topics[t].c++;
    P.log.push({
      id: file.id,
      kind: file.kind,
      title: file.title,
      choice: res.choice,
      answer: file.answer,
      answerText: VK.optionText(file, file.answer),
      explanation: file.explanation,
      src: file.kind === 'exam' ? file.src : VK.PROC_LABELS[file.gen],
      correct,
      topic: t,
    });
    Desk.reveal(file.answer, res.choice);
    VK.sfx[correct ? 'good' : 'bad']();
    pop(correct ? '+1' : '✕', correct);
    clientMood(file.client, correct ? 'happy' : 'angry');
    const reaction = VK.rng(file.id + ':r').pick(C.reactions[correct ? 'good' : 'bad']);
    if (O) O.speech.textContent = reaction;
    P.done++;
    updateHud();
    const meta = [{ text: P.correct + ' / ' + P.done + ' doğru', cls: correct ? 'pos' : 'neg' }];
    await Desk.slip(slipFor(file, res.choice, correct, { tone: correct ? 'good' : 'bad', title: correct ? 'DOĞRU KARAR' : 'HATALI KARAR', meta, button: P.done >= P.list.length ? 'Karneyi gör ↵' : 'Dosyayı kapat ↵' }));
    await Desk.clear();
    await clientLeave();
    if (!O) return;
    P.active = false;
    updateTools();
    updateHall();
    if (P.done >= P.list.length) {
      setBell('Karneyi gör', false);
      practiceSummary();
    } else setBell('Sıradaki!', false);
  }

  function practiceSummary() {
    if (!P) return titleScreen();
    const acc = P.done ? Math.round((100 * P.correct) / P.done) : 0;
    const wrongIds = P.log.filter((x) => !x.correct && x.kind === 'exam').map((x) => x.id);
    const sheet = h(
      'article.sheet.ledger',
      h('h1', { style: { textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,40px)' } }, 'Çalışma karnesi'),
      h(
        'div.stat-tiles',
        h('div.stat-tile', h('small', 'Dosya'), h('b', String(P.done))),
        h('div.stat-tile', h('small', 'Doğru'), h('b', String(P.correct))),
        h('div.stat-tile', h('small', 'İsabet'), h('b', '%' + acc)),
      ),
      UI.topicBars(P.topics),
      h('h3', { style: { marginTop: '16px' } }, 'Hatalı dosyalar'),
      UI.mistakeList(P.log),
      h(
        'div.actions',
        h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Ana menü'),
        wrongIds.length
          ? h(
              'button.btn',
              {
                type: 'button',
                onclick: () => {
                  const now = new Date();
                  P = { list: wrongIds.map((id) => ({ type: 'exam', id })), done: 0, correct: 0, log: [], topics: {}, active: false, label: 'Yanlışları tekrar', today: D.make(now.getFullYear(), now.getMonth() + 1, now.getDate()), fileNo: 0 };
                  officeScreen('practice');
                },
              },
              'Yanlışları tekrar çalış',
            )
          : null,
        h('button.btn.primary', { type: 'button', onclick: () => practiceSetup() }, 'Yeni çalışma'),
      ),
    );
    show(h('div.screen.paper-screen', sheet), null);
  }

  /* =====================================================================
     SINAV PROVASI
     ===================================================================== */
  function booklets() {
    const range = (prefix, a, b) => {
      const out = [];
      for (let i = a; i <= b; i++) out.push(prefix + String(i).padStart(3, '0'));
      return out;
    };
    const list = [
      { id: '2024p', label: '2024 · Patent Vekilliği Sınavı', desc: 'Patent, faydalı model, PCT/EPC, tasarım, vekillik, genel hukuk', ids: range('2024-p', 1, 60), min: 120 },
      { id: '2024m', label: '2024 · Marka Vekilliği Sınavı', desc: 'Marka, Madrid, coğrafi işaret, tasarım, vekillik, genel hukuk', ids: range('2024-m', 1, 40).concat(range('2024-p', 41, 60)), min: 120 },
    ];
    [2021, 2019, 2017].forEach((y) => {
      list.push({ id: y + '-1', label: y + ' · Genel Yeterlik 1. kitapçık', desc: 'Patent, tasarım, vekillik, genel hukuk', ids: range(y + '-', 1, 60), min: 90 });
      list.push({ id: y + '-2', label: y + ' · Genel Yeterlik 2. kitapçık', desc: 'Marka, Madrid, coğrafi işaret', ids: range(y + '-', 61, 100), min: 60 });
    });
    list.push({ id: '2015p', label: '2015 · Patent bölümü', desc: 'Mülga 551 sayılı KHK dönemi', ids: range('2015-p', 1, 25), min: 38 });
    list.push({ id: '2015m', label: '2015 · Marka bölümü', desc: 'Mülga 556 sayılı KHK dönemi', ids: range('2015-m', 1, 25), min: 38 });
    return list.map((b) => Object.assign(b, { ids: b.ids.filter((id) => byId.has(id)) })).filter((b) => b.ids.length);
  }

  function examSetup() {
    const list = booklets();
    const best = VK.store.get('examBest', {});
    const sheet = h(
      'article.sheet',
      h('h1', { style: { textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,40px)' } }, 'Sınav provası'),
      h('p', 'Gerçek kitapçıkları kendi sıralarıyla ve süreleriyle çöz. Cevaplar sınav bitince açıklanır; sonra her soruyu gerekçesiyle inceleyebilirsin.'),
      h(
        'div.menu-folders',
        { style: { marginTop: '18px' } },
        list.map((b) =>
          h(
            'button.folder-btn' + (b.id.startsWith('2015') ? '.alt' : ''),
            { type: 'button', onclick: () => startExam(b) },
            h('span.fb-title', b.label),
            h('span.fb-desc', b.desc + ' · ' + b.ids.length + ' soru · ' + b.min + ' dk'),
            best[b.id] != null ? h('span.fb-tag', 'EN İYİ ' + best[b.id] + '/' + b.ids.length) : null,
          ),
        ),
      ),
      h('div.actions', h('button.btn', { type: 'button', onclick: () => titleScreen() }, 'Geri')),
    );
    show(h('div.screen.paper-screen', sheet), null);
  }

  let X = null;
  function startExam(b) {
    X = { b, ids: b.ids, answers: {}, i: 0, endsAt: Date.now() + b.min * 60000, finished: false, timer: null };
    examScreen();
  }
  function examScreen() {
    const hud = h(
      'header.hud',
      h('span.brand', 'VEKİL'),
      h('div.cell', h('small', 'Sınav provası'), h('b', X.b.label)),
      h('div.cell.clock', h('small', X.finished ? 'Sonuç' : 'Kalan süre'), h('b#ex-timer', '—')),
      h('div.cell', h('small', X.finished ? 'Doğru' : 'Cevaplanan'), h('b#ex-count', '—')),
      h('span.spacer'),
      h(
        'div.hud-btns',
        X.finished
          ? h('button.btn.small', { type: 'button', onclick: () => examSetup() }, 'Kitapçıklar')
          : h('button.btn.small', { type: 'button', onclick: () => finishExam(false) }, 'Sınavı bitir'),
        h('button.btn.small', { type: 'button', onclick: () => leaveExam() }, 'Ana menü'),
      ),
    );
    const main = h('div.exam-main');
    const grid = h('div.qgrid');
    const side = h('aside.exam-side', h('h4', 'Sorular'), grid, h('p.kbd-hint', { style: { marginTop: '12px' } }, 'A–E: işaretle · ← →: gezin'));
    const layout = h('div.exam-layout', main, side);
    show(h('div.screen', hud, layout), examKeys, 'in-office');
    X.els = { main, grid, hud };
    renderExamQ();
    if (!X.finished) {
      X.timer = setInterval(updateExamTimer, 500);
      teardown = () => clearInterval(X.timer);
    }
    updateExamTimer();
  }
  function leaveExam() {
    if (X && !X.finished && Object.keys(X.answers).length) {
      UI.confirm('Sınavdan çık', 'İşaretlediğin cevaplar kaydedilmeyecek.', 'Çık').then((ok) => ok && titleScreen());
    } else titleScreen();
  }
  function examKeys(e) {
    const k = e.key.toLowerCase();
    if (e.key === 'ArrowRight') return examGo(X.i + 1);
    if (e.key === 'ArrowLeft') return examGo(X.i - 1);
    const map = { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' };
    if (k in map && !X.finished) {
      X.answers[X.ids[X.i]] = map[k];
      renderExamQ();
    }
  }
  function examGo(i) {
    if (i < 0 || i >= X.ids.length) return;
    X.i = i;
    renderExamQ();
    X.els.main.scrollTop = 0;
  }
  function updateExamTimer() {
    if (!X || !X.els) return;
    const t = X.els.hud.querySelector('#ex-timer');
    const c = X.els.hud.querySelector('#ex-count');
    if (X.finished) {
      t.textContent = X.score + ' / ' + X.ids.length;
      c.textContent = '%' + Math.round((100 * X.score) / X.ids.length);
      return;
    }
    const ms = Math.max(0, X.endsAt - Date.now());
    const m = Math.floor(ms / 60000),
      s = Math.floor((ms % 60000) / 1000);
    t.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    t.parentElement.classList.toggle('late', ms < 5 * 60000);
    c.textContent = Object.keys(X.answers).length + ' / ' + X.ids.length;
    if (ms <= 0) finishExam(true);
  }
  function renderExamQ() {
    const q = byId.get(X.ids[X.i]);
    const f = VK.examFile(q, {});
    const chosen = X.answers[q.id];
    const sheet = h('article.sheet.exam-sheet');
    sheet.appendChild(h('div.qhead', h('span', 'Soru ' + (X.i + 1) + ' / ' + X.ids.length), h('span', X.finished ? VK.TOPICS[q.topic] : '')));
    if (q.context) sheet.appendChild(h('div', { html: VK.rich(q.context) }));
    if (q.items && q.items.length) sheet.appendChild(h('ol.items', { html: q.items.map((i) => '<li>' + VK.inline(i) + '</li>').join('') }));
    if (q.table)
      sheet.appendChild(
        h(
          'div.tbl-scroll',
          h('table.grid', { html: '<thead><tr>' + q.table.headers.map((x) => '<th>' + VK.esc(x) + '</th>').join('') + '</tr></thead><tbody>' + q.table.rows.map((r) => '<tr>' + r.map((x) => '<td>' + VK.inline(x) + '</td>').join('') + '</tr>').join('') + '</tbody>' }),
        ),
      );
    if (q.figure) sheet.appendChild(h('figure', h('img', { src: VK.figureSrc(q.figure), alt: 'Soruya ait görsel', style: { maxWidth: '100%', background: '#fff', cursor: 'zoom-in' }, onclick: (e) => UI.zoom(e.target.src) })));
    sheet.appendChild(h('div', { style: { marginTop: '10px', fontWeight: 700 }, html: VK.rich(q.ask) }));
    const list = h('ol.opts');
    if (f.optionHeaders) list.appendChild(h('li', { 'aria-hidden': 'true', html: '<div class="opt cells" style="--cols:' + f.optionHeaders.length + ';cursor:default;background:none;border-color:transparent;font-family:var(--f-ui);font-size:.8em;font-weight:600"><span></span><span></span>' + f.optionHeaders.map((x) => '<span>' + VK.esc(x) + '</span>').join('') + '</div>' }));
    f.options.forEach((o) => {
      const b = h('button.opt' + (chosen === o.key ? '.selected' : ''), { type: 'button', 'aria-pressed': chosen === o.key ? 'true' : 'false' }, h('span.box'), h('span.key', o.key + ')'));
      if (o.cells) {
        b.classList.add('cells');
        b.style.setProperty('--cols', f.optionHeaders.length);
        o.cells.forEach((c) => b.appendChild(h('span.txt', c)));
      } else b.appendChild(h('span.txt', { html: VK.inline(o.text) }));
      if (X.finished) {
        b.disabled = true;
        if (o.key === q.answer) b.classList.add('correct');
        else if (o.key === chosen) b.classList.add('wrong');
      } else
        b.addEventListener('click', () => {
          X.answers[q.id] = X.answers[q.id] === o.key ? undefined : o.key;
          if (!X.answers[q.id]) delete X.answers[q.id];
          VK.sfx.tick();
          renderExamQ();
        });
      list.appendChild(h('li', b));
    });
    sheet.appendChild(list);
    if (X.finished) {
      sheet.appendChild(
        h(
          'div.slip.' + (chosen === q.answer ? 'good' : 'bad'),
          { style: { marginTop: '16px', width: '100%', maxHeight: 'none', animation: 'none', boxShadow: 'none', border: '1px solid rgba(0,0,0,.15)', borderTopWidth: '8px' } },
          h('h4', chosen === q.answer ? 'DOĞRU' : chosen ? 'YANLIŞ' : 'BOŞ'),
          h('div.why', { html: VK.rich(q.explanation || '') }),
          q.law ? h('div.law', 'Dayanak: ' + q.law) : null,
          h('div.src', 'Kaynak: ' + VK.sourceLabel(q)),
          q.outdated ? h('div.note', 'Mevzuat notu: ' + q.outdated) : null,
          q.keyNote ? h('div.note', 'Cevap anahtarı notu: ' + q.keyNote) : null,
        ),
      );
    }
    sheet.appendChild(
      h(
        'div.exam-nav',
        h('button.btn', { type: 'button', disabled: X.i === 0, onclick: () => examGo(X.i - 1) }, '← Önceki'),
        X.i === X.ids.length - 1 && !X.finished
          ? h('button.btn.primary', { type: 'button', onclick: () => finishExam(false) }, 'Sınavı bitir')
          : h('button.btn.primary', { type: 'button', disabled: X.i === X.ids.length - 1, onclick: () => examGo(X.i + 1) }, 'Sonraki →'),
      ),
    );
    X.els.main.innerHTML = '';
    X.els.main.appendChild(sheet);
    // ızgara
    X.els.grid.innerHTML = '';
    X.ids.forEach((id, i) => {
      const a = X.answers[id];
      let cls = '';
      if (X.finished) cls = a === byId.get(id).answer ? '.right' : '.wrongq';
      else if (a) cls = '.answered';
      if (i === X.i) cls += '.current';
      X.els.grid.appendChild(h('button' + cls, { type: 'button', onclick: () => examGo(i), 'aria-label': 'Soru ' + (i + 1) }, String(i + 1)));
    });
    updateExamTimer();
  }
  async function finishExam(timeUp) {
    if (X.finished) return;
    if (!timeUp) {
      const blank = X.ids.length - Object.keys(X.answers).length;
      const ok = await UI.confirm('Sınavı bitir', blank ? blank + ' soru boş. Yine de bitirmek istiyor musun?' : 'Cevaplar kontrol edilecek.', 'Bitir');
      if (!ok) return;
    }
    clearInterval(X.timer);
    X.finished = true;
    X.score = X.ids.filter((id) => X.answers[id] === byId.get(id).answer).length;
    X.ids.forEach((id) => {
      if (X.answers[id]) record({ kind: 'exam', id }, X.answers[id] === byId.get(id).answer);
    });
    const best = VK.store.get('examBest', {});
    if (best[X.b.id] == null || X.score > best[X.b.id]) best[X.b.id] = X.score;
    VK.store.set('examBest', best);
    const topics = {};
    X.ids.forEach((id) => {
      const q = byId.get(id);
      const t = (topics[q.topic] = topics[q.topic] || { n: 0, c: 0 });
      t.n++;
      if (X.answers[id] === q.answer) t.c++;
    });
    const pct = Math.round((100 * X.score) / X.ids.length);
    let m;
    m = UI.modal([
      h('h3', timeUp ? 'Süre doldu' : 'Sınav bitti'),
      h('p', h('span.stamp-inline.' + (pct >= 70 ? 'good' : pct >= 50 ? 'violet' : 'bad'), { style: { fontSize: '28px' } }, X.score + ' / ' + X.ids.length), '   %' + pct + ' doğru'),
      UI.topicBars(topics),
      h('p.inline-help', { style: { marginTop: '10px' } }, 'Şimdi soruları tek tek gezerek doğru cevapları ve gerekçeleri görebilirsin.'),
      h('div.actions', h('button.btn.primary', { type: 'button', onclick: () => m.close() }, 'İncele')),
    ]);
    X.i = 0;
    examScreen();
  }

  /* =====================================================================
     İSTATİSTİKLER
     ===================================================================== */
  function statsScreen() {
    const seen = Object.keys(stats.q).filter((id) => byId.has(id));
    let c = 0,
      w = 0;
    const topics = {};
    const years = {};
    seen.forEach((id) => {
      const s = stats.q[id];
      const q = byId.get(id);
      c += s.c;
      w += s.w;
      const t = (topics[q.topic] = topics[q.topic] || { n: 0, c: 0 });
      t.n += s.c + s.w;
      t.c += s.c;
      const y = (years[q.year] = years[q.year] || { n: 0, c: 0 });
      y.n += s.c + s.w;
      y.c += s.c;
    });
    const acc = c + w ? Math.round((100 * c) / (c + w)) : 0;
    const procRows = Object.entries(VK.PROC_LABELS).map(([k, l]) => {
      const s = stats.proc[k] || { c: 0, w: 0 };
      return h('tr', h('td', l), h('td.amt', s.c + ' / ' + (s.c + s.w)));
    });
    const sheet = h(
      'article.sheet.ledger',
      h('h1', { style: { textTransform: 'uppercase', fontSize: 'clamp(28px,4vw,40px)' } }, 'İstatistikler'),
      h(
        'div.stat-tiles',
        h('div.stat-tile', h('small', 'Görülen soru'), h('b', seen.length + ' / ' + Q.length)),
        h('div.stat-tile', h('small', 'Cevap'), h('b', String(c + w))),
        h('div.stat-tile', h('small', 'İsabet'), h('b', '%' + acc)),
        h('div.stat-tile', h('small', 'Son denemede yanlış'), h('b', String(seen.filter((id) => stats.q[id].last === 0).length))),
      ),
      h('h3', 'Konulara göre'),
      UI.topicBars(topics),
      h('h3', { style: { marginTop: '16px' } }, 'Sınav yıllarına göre'),
      h(
        'div.topic-bars',
        Object.keys(years)
          .sort()
          .map((y) => {
            const m = years[y];
            const p = Math.round((100 * m.c) / m.n);
            return h('div.topic-bar', h('span', y), h('span.bar', h('i', { style: { width: p + '%' } })), h('span', m.c + '/' + m.n));
          }),
      ),
      h('h3', { style: { marginTop: '16px' } }, 'Protokol dosyaları'),
      h('table', h('tbody', procRows)),
      h(
        'div.actions',
        h(
          'button.btn',
          {
            type: 'button',
            onclick: async () => {
              if (await UI.confirm('İstatistikleri sıfırla', 'Bu tarayıcıdaki bütün çalışma kayıtları silinecek. Kariyer kaydın etkilenmez.', 'Sıfırla')) {
                stats = { q: {}, proc: {} };
                VK.store.set('stats', stats);
                VK.store.del('examBest');
                statsScreen();
              }
            },
          },
          'Sıfırla',
        ),
        h('button.btn.primary', { type: 'button', onclick: () => titleScreen() }, 'Ana menü'),
      ),
    );
    show(h('div.screen.paper-screen', sheet), null);
  }

  /* ---------- Başlat ---------- */
  function boot() {
    const missing = [
      ['js/data/questions.js', Q.length],
      ['js/data/rulebook.js', VK.RULEBOOK],
      ['js/data/campaign.js', C],
    ]
      .filter(([, ok]) => !ok)
      .map(([f]) => f);
    if (missing.length) {
      app.innerHTML = '<div class="screen title-screen"><p>Oyun verisi yüklenemedi. Eksik dosya: ' + VK.esc(missing.join(', ')) + '</p></div>';
      return;
    }
    titleScreen();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
