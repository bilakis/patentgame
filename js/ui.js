/* VEKİL — Arayüz yardımcıları: modal, onay, görsel büyütme, Mevzuat Klasörü, Süre Cetveli. */
(function () {
  'use strict';
  const VK = window.VK;
  const h = VK.h;
  const D = VK.D;
  const UI = (VK.UI = {});

  /* ---------- Modal ---------- */
  UI.modal = function (content, opts) {
    opts = opts || {};
    const prevFocus = document.activeElement;
    const box = h('div.modal' + (opts.wide ? '.wide' : ''), { role: 'dialog', 'aria-modal': 'true' }, content);
    const scrim = h('div.modal-scrim', box);
    const close = () => {
      scrim.remove();
      if (opts.onClose) opts.onClose();
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    };
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim && opts.dismissable !== false) close();
    });
    scrim._close = close;
    document.body.appendChild(scrim);
    const f = box.querySelector('input, button.primary, button');
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
    return { close, el: box };
  };

  UI.confirm = function (title, text, okLabel, cancelLabel) {
    return new Promise((res) => {
      let m;
      const done = (v) => {
        res(v); // önce sonuç; kapatmanın tetiklediği onClose(false) artık etkisiz
        m.close();
      };
      m = UI.modal(
        [
          h('h3', title),
          h('div', { html: VK.rich(text) }),
          h(
            'div.actions',
            h('button.btn', { type: 'button', onclick: () => done(false) }, cancelLabel || 'Vazgeç'),
            h('button.btn.primary', { type: 'button', onclick: () => done(true) }, okLabel || 'Tamam'),
          ),
        ],
        { onClose: () => res(false) },
      );
    });
  };

  UI.alert = function (title, html, okLabel) {
    return new Promise((res) => {
      let m;
      m = UI.modal([h('h3', title), h('div', { html }), h('div.actions', h('button.btn.primary', { type: 'button', onclick: () => m.close() }, okLabel || 'Tamam'))], { onClose: res });
    });
  };

  UI.zoom = function (src, alt) {
    let m;
    m = UI.modal([h('img.zoom', { src, alt: alt || '' }), h('div.actions', h('button.btn.primary', { type: 'button', onclick: () => m.close() }, 'Kapat'))], { wide: true });
  };

  UI.closeTop = function () {
    const scrims = document.querySelectorAll('.modal-scrim');
    if (scrims.length) {
      scrims[scrims.length - 1]._close();
      return true;
    }
    if (document.querySelector('.drawer')) {
      UI.closeRulebook();
      return true;
    }
    if (document.querySelector('.calc')) {
      UI.closeCalc();
      return true;
    }
    return false;
  };
  UI.overlayOpen = () => !!document.querySelector('.modal-scrim, .drawer');

  /* ---------- Mevzuat Klasörü ---------- */
  let drawerEls = null;
  let lastTab = null;
  UI.rulebook = function (opts) {
    opts = opts || {};
    if (drawerEls) {
      UI.closeRulebook();
      return;
    }
    const day = opts.day || 99;
    const fresh = new Set(opts.fresh || []);
    const book = VK.RULEBOOK;
    const scrim = h('div.drawer-scrim', { onclick: () => UI.closeRulebook() });
    const tabs = h('nav.binder-tabs', { 'aria-label': 'Bölümler' });
    const page = h('div.binder-page', { tabindex: '-1' });
    const drawer = h(
      'aside.drawer',
      { role: 'dialog', 'aria-label': 'Mevzuat Klasörü' },
      h('div.drawer-head', h('h2', 'Mevzuat Klasörü'), h('button.btn.small', { type: 'button', onclick: () => UI.closeRulebook() }, 'Kapat (Esc)')),
      h('div.binder', tabs, page),
    );
    const open = (sec) => {
      lastTab = sec.id;
      tabs.querySelectorAll('.binder-tab').forEach((t) => t.classList.toggle('active', t.dataset.id === sec.id));
      page.innerHTML = '';
      page.appendChild(h('h3', sec.title));
      sec.blocks.forEach((b) => {
        page.appendChild(h('h4', b.h));
        if (b.list) page.appendChild(h('ul', b.list.map((li) => h('li', li))));
        if (b.table) page.appendChild(tableEl(b.table));
      });
      if (sec.nice) {
        page.appendChild(h('h4', 'Cetvel'));
        page.appendChild(
          tableEl({
            headers: ['Sınıf', 'Kapsam', 'Örnek mal/hizmetler'],
            rows: VK.NICE.map((n) => [String(n.no), n.title, n.goods.join(', ')]),
          }),
        );
      }
      page.appendChild(h('p.disclaimer', 'Bu klasör oyun için hazırlanmış özet notlardan oluşur; resmî mevzuat metni ve güncel Uygulama Yönetmeliği esastır.'));
      page.scrollTop = 0;
    };
    let first = null;
    book.forEach((sec) => {
      const locked = sec.unlock > day;
      const t = h(
        'button.binder-tab' + (locked ? '.locked' : ''),
        { type: 'button', dataset: { id: sec.id }, disabled: locked, title: locked ? sec.unlock + '. günde açılır' : '' },
        sec.tab,
        fresh.has(sec.id) ? h('span.new', 'YENİ') : null,
      );
      if (!locked) {
        t.addEventListener('click', () => open(sec));
        if (!first || sec.id === (opts.tab || lastTab)) first = sec;
      }
      tabs.appendChild(t);
    });
    document.body.append(scrim, drawer);
    drawerEls = [scrim, drawer];
    if (first) open(first);
  };
  UI.closeRulebook = function () {
    if (!drawerEls) return;
    drawerEls.forEach((e) => e.remove());
    drawerEls = null;
  };
  function tableEl(t) {
    return h(
      'div.tbl-scroll',
      h('table', h('thead', h('tr', t.headers.map((x) => h('th', x)))), h('tbody', t.rows.map((r) => h('tr', r.map((x) => h('td', x)))))),
    );
  }

  /* ---------- Süre Cetveli ---------- */
  let calcEl = null;
  let calcState = { start: '', n: 2, unit: 'ay', sign: 1 };
  UI.calc = function (today) {
    if (calcEl) {
      UI.closeCalc();
      return;
    }
    const todayStr = today ? D.fmt(today) : D.fmt(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())));
    if (!calcState.start) calcState.start = todayStr;
    const start = h('input#calc-start', { type: 'text', inputmode: 'numeric', value: calcState.start, 'aria-label': 'Başlangıç tarihi (gg.aa.yyyy)', placeholder: 'gg.aa.yyyy' });
    const sign = h('select#calc-sign', { 'aria-label': 'Yön' }, h('option', { value: '1' }, '+ ekle'), h('option', { value: '-1' }, '− çıkar'));
    sign.value = String(calcState.sign);
    const n = h('input#calc-n', { type: 'number', min: '0', value: String(calcState.n), 'aria-label': 'Miktar' });
    const unit = h('select#calc-unit', { 'aria-label': 'Birim' }, ['gün', 'ay', 'yıl'].map((u) => h('option', { value: u }, u)));
    unit.value = calcState.unit;
    const out = h('div.out', { 'aria-live': 'polite' });
    const compute = () => {
      calcState = { start: start.value.trim(), n: +n.value || 0, unit: unit.value, sign: +sign.value };
      if (!D.valid(calcState.start)) {
        out.innerHTML = '—<small>Tarihi gg.aa.yyyy biçiminde yaz</small>';
        return;
      }
      const s = D.parse(calcState.start);
      const k = calcState.n * calcState.sign;
      const r = calcState.unit === 'gün' ? D.addDays(s, k) : calcState.unit === 'ay' ? D.addMonths(s, k) : D.addYears(s, k);
      let rel = '';
      if (today) {
        const d = D.diff(today, r);
        rel = d === 0 ? ' · bugün' : d > 0 ? ' · bugünden ' + d + ' gün sonra' : ' · bugünden ' + -d + ' gün önce';
      }
      out.innerHTML = VK.esc(D.fmt(r)) + '<small>' + VK.esc(D.dayName(r) + rel) + (D.isWeekend(r) ? ' · hafta sonu: son gün ' + D.fmt(D.nextWorkday(r)) : '') + '</small>';
    };
    [start, n].forEach((x) => x.addEventListener('input', compute));
    [unit, sign].forEach((x) => x.addEventListener('change', compute));
    const quick = (label, k, u) =>
      h(
        'button',
        {
          type: 'button',
          onclick: () => {
            n.value = Math.abs(k);
            unit.value = u;
            sign.value = k < 0 ? '-1' : '1';
            compute();
          },
        },
        label,
      );
    const head = h('div.calc-head', h('span', 'Süre Cetveli'), h('button', { type: 'button', 'aria-label': 'Kapat', onclick: () => UI.closeCalc() }, '×'));
    calcEl = h(
      'div.calc',
      { role: 'dialog', 'aria-label': 'Süre Cetveli' },
      head,
      h(
        'div.calc-body',
        h('label', { for: 'calc-start' }, 'Başlangıç'),
        h('div.row', start, h('button.btn.small', { type: 'button', onclick: () => ((start.value = todayStr), compute()) }, 'Bugün')),
        h('div.row3', sign, h('div.row', n, unit)),
        h('div.quick', quick('+2 ay', 2, 'ay'), quick('+3 ay', 3, 'ay'), quick('+6 ay', 6, 'ay'), quick('−6 ay', -6, 'ay'), quick('+12 ay', 12, 'ay'), quick('+18 ay', 18, 'ay'), quick('+30 ay', 30, 'ay'), quick('+10 yıl', 10, 'yıl')),
        out,
      ),
    );
    document.body.appendChild(calcEl);
    // sürüklenebilir başlık
    head.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const r = calcEl.getBoundingClientRect();
      const dx = e.clientX - r.left,
        dy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
      const mv = (ev) => {
        calcEl.style.left = Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx)) + 'px';
        calcEl.style.top = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy)) + 'px';
        calcEl.style.right = 'auto';
        calcEl.style.bottom = 'auto';
      };
      const up = () => {
        head.removeEventListener('pointermove', mv);
        head.removeEventListener('pointerup', up);
      };
      head.addEventListener('pointermove', mv);
      head.addEventListener('pointerup', up);
    });
    compute();
    setTimeout(() => start.focus({ preventScroll: true }), 30);
  };
  UI.closeCalc = function () {
    if (calcEl) calcEl.remove();
    calcEl = null;
  };

  /* ---------- Küçük yardımcılar ---------- */
  UI.topicBars = function (map) {
    const keys = Object.keys(VK.TOPICS).filter((k) => map[k] && map[k].n);
    if (!keys.length) return h('p.inline-help', 'Henüz veri yok.');
    return h(
      'div.topic-bars',
      keys.map((k) => {
        const m = map[k];
        const p = Math.round((100 * m.c) / m.n);
        return h('div.topic-bar', h('span', VK.TOPICS[k]), h('span.bar', h('i', { style: { width: p + '%' } })), h('span', m.c + '/' + m.n));
      }),
    );
  };

  UI.mistakeList = function (log) {
    const wrong = log.filter((x) => !x.correct);
    if (!wrong.length) return h('p.inline-help', 'Hata yok. Temiz bir gün.');
    return h(
      'div.mistakes',
      wrong.map((x) =>
        h(
          'details',
          h('summary', x.title + ' — doğru: ' + x.answer + ', senin: ' + x.choice),
          h('div', { html: '<p><b>Doğru karar:</b> ' + VK.inline(x.answerText) + '</p>' + VK.rich(x.explanation || '') }),
          x.src ? h('p.inline-help', x.src) : null,
        ),
      ),
    );
  };
})();
