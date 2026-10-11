/* VEKİL — Masa: sürüklenebilir belgeler, Karar Formu, mühür, sonuç fişi, inceleme modu. */
(function () {
  'use strict';
  const VK = window.VK;
  const h = VK.h;
  const SVGNS = 'http://www.w3.org/2000/svg';

  const Desk = (VK.Desk = {});
  let root, surface, svg, verdictEl, slipLayer;
  let z = 10;
  let file = null;
  let chosen = null;
  let stamped = false;
  let resolveStamp = null;
  let inspect = false;
  let sel = null;
  let lines = [];
  let slipResolve = null;
  let optionKeys = [];

  Desk.isMobile = () => window.matchMedia('(max-width: 860px)').matches;

  Desk.mount = function (deskEl) {
    root = deskEl;
    root.innerHTML = '';
    surface = h('div.desk-surface');
    svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'inspect-lines');
    verdictEl = h('section.verdict', { 'aria-label': 'Karar formu' });
    slipLayer = h('div.slip-layer');
    root.append(surface, svg, verdictEl, slipLayer);
    surface.addEventListener('click', onSurfaceClick);
    Desk.empty();
  };

  Desk.empty = function (title, msg) {
    file = null;
    chosen = null;
    stamped = false;
    surface.innerHTML = '';
    surface.appendChild(h('div.desk-empty', h('div', h('b', title || 'Masa boş'), msg || 'Sıradaki müvekkili çağırmak için zile bas.')));
    addProp();
    renderVerdict(null);
    clearLines();
  };

  function addProp() {
    if (surface.querySelector('.desk-prop')) return;
    const c = h('canvas.desk-prop', { 'aria-hidden': 'true' });
    if (VK.drawTea) VK.drawTea(c);
    surface.appendChild(c);
  }

  /* ---------- Belgeler ---------- */
  function docEl(d, i) {
    const body = h('div.doc-body', { html: (d.title ? '<h3 class="doc-title">' + VK.esc(d.title) + '</h3>' : '') + d.html });
    const grip = h('header.doc-grip', h('span', d.kicker || ''), h('span.grip-dots', { 'aria-hidden': 'true' }, '⋮⋮'));
    const el = h('article.doc.v-' + (d.variant || 'letter'), { dataset: { id: d.id } }, grip, body);
    if (d.wide) el.classList.add('wide');
    const rot = (VK.rng(d.id + (file ? file.id : ''))() * 3 - 1.5).toFixed(2);
    el.style.setProperty('--rot', rot + 'deg');
    el.style.setProperty('--delay', i * 0.09 + 's');
    el.style.zIndex = ++z;
    el.addEventListener('pointerdown', () => {
      el.style.zIndex = ++z;
    });
    grip.addEventListener('pointerdown', (e) => startDrag(e, el));
    return el;
  }

  function startDrag(e, el) {
    if (Desk.isMobile() || e.button > 0) return;
    e.preventDefault();
    const sr = surface.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    const dx = e.clientX - er.left,
      dy = e.clientY - er.top;
    el.classList.add('dragging');
    el.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const maxX = sr.width - 40,
        maxY = sr.height - 30;
      let x = ev.clientX - sr.left - dx,
        y = ev.clientY - sr.top - dy;
      x = Math.max(-el.offsetWidth + 60, Math.min(maxX, x));
      y = Math.max(0, Math.min(maxY, y));
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      redrawLines();
    };
    const up = () => {
      el.classList.remove('dragging');
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      VK.sfx.paper();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  }

  function layout(els) {
    if (Desk.isMobile()) return;
    const W = surface.clientWidth,
      H = surface.clientHeight;
    const n = els.length;
    const widths = els.map((e) => e.offsetWidth);
    const total = widths.reduce((a, b) => a + b, 0) + (n + 1) * 14;
    const place = (e, x, y) => {
      e.style.left = Math.round(x) + 'px';
      e.style.top = Math.round(y) + 'px';
      e.style.maxHeight = Math.max(160, H - y - 14) + 'px';
    };
    if (total <= W) {
      let x = 14;
      els.forEach((e, i) => {
        place(e, x, 14 + (i % 2) * 10);
        x += widths[i] + 14;
      });
      return;
    }
    // Kalabalık masa: iki sütun; alt sıradaki belgeler üsttekilerin alt kısmına biner
    const cols = Math.max(1, Math.min(n, Math.floor((W - 14) / (Math.max(...widths) * 0.62 + 14))));
    const colW = (W - 28) / Math.min(cols, 2);
    const rows = Math.ceil(n / Math.min(cols, 2));
    const rowStep = rows > 1 ? Math.min(H * 0.46, (H - 180) / (rows - 1)) : 0;
    els.forEach((e, i) => {
      const c = i % Math.min(cols, 2),
        r = Math.floor(i / Math.min(cols, 2));
      const x = Math.min(W - widths[i] - 14, 14 + c * colW + r * 26);
      place(e, Math.max(10, x), 14 + r * rowStep);
    });
  }

  /* ---------- Dosyayı masaya yükle ---------- */
  Desk.load = function (f, opts) {
    opts = opts || {};
    file = f;
    file._found = null;
    chosen = null;
    stamped = false;
    sel = null;
    clearLines();
    surface.innerHTML = '';
    const els = f.docs.map(docEl);
    els.forEach((e) => surface.appendChild(e));
    layout(els);
    renderVerdict(f, opts);
    VK.sfx.paper();
    return new Promise((res) => (resolveStamp = res));
  };

  Desk.currentFile = () => file;
  Desk.isStamped = () => stamped;

  /* ---------- Karar Formu ---------- */
  function renderVerdict(f, opts) {
    verdictEl.innerHTML = '';
    optionKeys = [];
    const paper = h('div.verdict-paper');
    verdictEl.append(h('div.clip', { 'aria-hidden': 'true' }), paper);
    const head = h('div.verdict-head', h('span', 'Karar Formu'), h('span', f ? f.fileNo || '' : ''));
    const body = h('div.verdict-body');
    paper.append(head, body);
    const btn = h('button.stamp-btn', { type: 'button', disabled: true, onclick: () => Desk.stamp() }, 'MÜHÜRLE');
    const foot = h('div.verdict-foot', btn);
    verdictEl.append(foot);
    if (!f) {
      body.appendChild(h('p.empty', 'Masada işlem bekleyen dosya yok.'));
      return;
    }
    body.appendChild(h('div.ask', { html: VK.rich(f.ask || '') }));
    const list = h('ol.opts');
    const oh = f.optionHeaders;
    if (oh) {
      const headRow = h('li.opt-headers', { 'aria-hidden': 'true' });
      headRow.innerHTML =
        '<div class="opt cells" style="--cols:' + oh.length + ';cursor:default;background:none;border-color:transparent;font-family:var(--f-ui);font-size:.78em;font-weight:600"><span></span><span></span>' +
        oh.map((x) => '<span>' + VK.esc(x) + '</span>').join('') +
        '</div>';
      list.appendChild(headRow);
    }
    f.options.forEach((o) => {
      optionKeys.push(o.key);
      const b = h('button.opt', { type: 'button', dataset: { key: o.key }, 'aria-pressed': 'false' }, h('span.box', { 'aria-hidden': 'true' }), h('span.key', o.key + ')'));
      if (oh && Array.isArray(o.cells)) {
        b.classList.add('cells');
        b.style.setProperty('--cols', oh.length);
        o.cells.forEach((c) => b.appendChild(h('span.txt', c)));
      } else b.appendChild(h('span.txt', { html: VK.inline(o.text) }));
      b.addEventListener('click', () => Desk.select(o.key));
      list.appendChild(h('li', b));
    });
    body.appendChild(list);
    if (opts && opts.note) body.appendChild(h('p.small', { style: { marginTop: '10px', fontSize: '.8em', color: 'var(--paper-dim)' } }, opts.note));
  }

  Desk.select = function (key) {
    if (!file || stamped) return;
    const b = verdictEl.querySelector('.opt[data-key="' + key + '"]');
    if (!b || b.classList.contains('elim')) return;
    chosen = key;
    verdictEl.querySelectorAll('.opt[data-key]').forEach((x) => {
      const on = x.dataset.key === key;
      x.classList.toggle('selected', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    verdictEl.querySelector('.stamp-btn').disabled = false;
    VK.sfx.tick();
  };
  Desk.selectIndex = function (i) {
    if (optionKeys[i]) Desk.select(optionKeys[i]);
  };

  Desk.stamp = function () {
    if (!file || stamped || !chosen) return;
    stamped = true;
    verdictEl.querySelectorAll('.opt').forEach((x) => (x.disabled = true));
    verdictEl.querySelector('.stamp-btn').disabled = true;
    const mark = h('div.stamp-mark', h('small', 'VEKİL KARARI'), chosen);
    verdictEl.querySelector('.verdict-paper').appendChild(mark);
    VK.sfx.stamp();
    const res = resolveStamp;
    resolveStamp = null;
    setTimeout(() => res && res({ choice: chosen, found: file._found }), VK.reducedMotion() ? 50 : 420);
  };

  Desk.reveal = function (answer, choice) {
    verdictEl.querySelectorAll('.opt[data-key]').forEach((x) => {
      if (x.dataset.key === answer) x.classList.add('correct');
      else if (x.dataset.key === choice) x.classList.add('wrong');
    });
  };

  Desk.eliminate = function (count) {
    if (!file || stamped) return false;
    const wrong = optionKeys.filter((k) => k !== file.answer && k !== chosen && !verdictEl.querySelector('.opt[data-key="' + k + '"]').classList.contains('elim'));
    const r = VK.rng(file.id + ':elim');
    const pick = r.shuffle(wrong).slice(0, count);
    pick.forEach((k) => {
      const b = verdictEl.querySelector('.opt[data-key="' + k + '"]');
      b.classList.add('elim');
      b.disabled = true;
    });
    return pick.length > 0;
  };

  /* ---------- Sonuç fişi ---------- */
  Desk.slip = function (spec) {
    slipLayer.innerHTML = '';
    const oldToast = root.querySelector('.toast');
    if (oldToast) oldToast.remove();
    const s = h('div.slip.' + (spec.tone || 'neutral'), { role: 'dialog', 'aria-live': 'polite' });
    s.appendChild(h('h4', spec.title));
    if (spec.meta && spec.meta.length) s.appendChild(h('div.slip-meta', spec.meta.map((m) => h('span' + (m.cls ? '.' + m.cls : ''), m.text))));
    if (spec.quote) s.appendChild(h('p.quote', '“' + spec.quote + '”'));
    if (spec.correct) s.appendChild(h('div.correct-line', { html: spec.correct }));
    if (spec.why) s.appendChild(h('div.why', { html: VK.rich(spec.why) }));
    if (spec.law) s.appendChild(h('div.law', 'Dayanak: ' + spec.law));
    if (spec.src) s.appendChild(h('div.src', spec.src));
    (spec.notes || []).forEach((n) => s.appendChild(h('div.note', n)));
    const close = h('button.btn.primary', { type: 'button' }, spec.button || 'Dosyayı kapat ↵');
    s.appendChild(h('div.slip-actions', close));
    slipLayer.appendChild(s);
    VK.sfx.print();
    setTimeout(() => close.focus({ preventScroll: true }), 50);
    return new Promise((res) => {
      slipResolve = () => {
        slipResolve = null;
        slipLayer.innerHTML = '';
        res();
      };
      close.addEventListener('click', () => slipResolve && slipResolve());
    });
  };
  Desk.slipOpen = () => !!slipResolve;
  Desk.closeSlip = () => slipResolve && slipResolve();

  /* ---------- Masayı temizle ---------- */
  Desk.clear = function () {
    const docs = surface.querySelectorAll('.doc, .sticky, .event-card');
    docs.forEach((d) => d.classList.add('leaving'));
    clearLines();
    setInspectClass(false);
    return VK.sleep(docs.length ? 320 : 0).then(() => {
      file = null;
      Desk.empty();
    });
  };

  /* ---------- Olay kartı (etik ikilem) ---------- */
  Desk.eventCard = function (ev) {
    surface.innerHTML = '';
    renderVerdict(null);
    verdictEl.querySelector('.verdict-body').innerHTML = '<p class="empty">Bu bir dosya değil, bir karar. Kartın üzerindeki seçeneklerden birini seç.</p>';
    return new Promise((res) => {
      const card = h(
        'div.event-card',
        { role: 'dialog' },
        h('div.ev-tab', 'Masaya bırakılan zarf'),
        h('h3', ev.title),
        h('div', { html: VK.rich(ev.body) }),
        h(
          'div.choices',
          ev.choices.map((c) =>
            h(
              'button.choice',
              {
                type: 'button',
                onclick: () => {
                  VK.sfx.stamp();
                  res(c);
                },
              },
              c.label,
            ),
          ),
        ),
      );
      surface.appendChild(card);
      const first = card.querySelector('.choice');
      if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
    });
  };

  /* ---------- İpucu notu ---------- */
  Desk.sticky = function (title, text) {
    const old = surface.querySelector('.sticky');
    if (old) old.remove();
    const n = h('div.sticky', h('b', title), text, h('button', { type: 'button', 'aria-label': 'Notu kaldır', onclick: () => n.remove() }, '×'));
    n.style.left = '18px';
    n.style.bottom = '18px';
    surface.appendChild(n);
  };

  /* ---------- Bildirim ---------- */
  let toastTimer = null;
  Desk.toast = function (html, cls, ms) {
    const old = root.querySelector('.toast');
    if (old) old.remove();
    const t = h('div.toast' + (cls ? '.' + cls : ''), { html, role: 'status' });
    root.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), ms || 2800);
  };

  /* ---------- İnceleme modu ---------- */
  function setInspectClass(on) {
    inspect = on;
    root && root.classList.toggle('inspecting', on);
    if (!on && sel) {
      sel.classList.remove('sel');
      sel = null;
    }
  }
  Desk.setInspect = function (on) {
    setInspectClass(on);
    return inspect;
  };
  Desk.inspecting = () => inspect;

  function onSurfaceClick(e) {
    const img = e.target.closest('figure img');
    if (img && !inspect) {
      VK.UI.zoom(img.src, img.alt);
      return;
    }
    if (!inspect || !file) return;
    const f = e.target.closest('.fld');
    if (!f) return;
    e.preventDefault();
    e.stopPropagation();
    if (!file.check) {
      Desk.toast('Bu dosyada karşılaştırılacak alan yok.');
      return;
    }
    if (!sel) {
      sel = f;
      f.classList.add('sel');
      VK.sfx.tick();
      return;
    }
    if (sel === f) {
      f.classList.remove('sel');
      sel = null;
      return;
    }
    const a = sel,
      b = f;
    a.classList.remove('sel');
    sel = null;
    const res = file.check(a.dataset.k, b.dataset.k);
    if (res && res.found) {
      a.classList.add('conflict');
      b.classList.add('conflict');
      lines.push([a, b]);
      redrawLines();
      Desk.toast('<b>UYUŞMAZLIK:</b> ' + VK.esc(res.msg), 'conflict', 4200);
      VK.sfx.bad();
      if (!file._found) file._found = res.option;
      if (!stamped && res.option) Desk.select(res.option);
    } else if (res) {
      Desk.toast(VK.esc(res.msg));
      VK.sfx.tick();
    } else {
      Desk.toast('Bu iki alan arasında karşılaştırılacak bir bağ yok.');
    }
  }

  function clearLines() {
    lines = [];
    if (svg) svg.innerHTML = '';
  }
  function redrawLines() {
    if (!svg) return;
    svg.innerHTML = '';
    if (!lines.length) return;
    const rr = root.getBoundingClientRect();
    lines.forEach(([a, b]) => {
      if (!a.isConnected || !b.isConnected) return;
      const ra = a.getBoundingClientRect(),
        rb = b.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - rr.left,
        y1 = ra.top + ra.height / 2 - rr.top;
      const x2 = rb.left + rb.width / 2 - rr.left,
        y2 = rb.top + rb.height / 2 - rr.top;
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', x1);
      l.setAttribute('y1', y1);
      l.setAttribute('x2', x2);
      l.setAttribute('y2', y2);
      svg.appendChild(l);
      [
        [x1, y1],
        [x2, y2],
      ].forEach(([x, y]) => {
        const c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('cx', x);
        c.setAttribute('cy', y);
        c.setAttribute('r', 4);
        svg.appendChild(c);
      });
    });
  }
  window.addEventListener('resize', () => redrawLines());

  /* ---------- Sınav sorusundan dosya ---------- */
  const VARIANT = {
    'Müvekkil Talebi': ['letter', 'MÜVEKKİL TALEBİ'],
    'Müvekkil Sorusu': ['memo', 'TELEFON NOTU · Nermin Hanım'],
    'Kurum Yazısı': ['kurum', 'KURUM YAZISI'],
    'Süre Takip Kartı': ['card', 'SÜRE TAKİP KARTI'],
    'Stajyer Notu': ['stajyer', 'STAJYER NOTU · Deniz'],
    'Meslektaş Danışması': ['mail', 'MESLEKTAŞ DANIŞMASI'],
    'Dava Dosyası': ['dava', 'DAVA DOSYASI'],
    'İç Eğitim Notu': ['memo', 'İÇ EĞİTİM NOTU'],
  };
  VK.TOPICS = {
    patent: 'Patent & faydalı model',
    patent_intl: 'PCT & Avrupa patenti',
    tasarim: 'Tasarım',
    marka: 'Marka',
    marka_intl: 'Madrid sistemi',
    cografi: 'Coğrafi işaret',
    vekillik: 'Vekillik mevzuatı',
    genel_hukuk: 'Genel hukuk',
  };
  VK.sourceLabel = function (q) {
    let s;
    if (q.section === 'patent' && q.year === 2024) s = '2024 Patent Vekilliği Sınavı';
    else if (q.section === 'marka' && q.year === 2024) s = '2024 Marka Vekilliği Sınavı';
    else if (q.year === 2015) s = '2015 Genel Yeterlik Sınavı · ' + { patent: 'Patent', marka: 'Marka', ortak: 'Ortak' }[q.section] + ' bölümü';
    else s = q.year + ' Genel Yeterlik Sınavı';
    return s + ', soru ' + q.num + (q.year !== 2015 && q.section === 'main' ? ' (' + (q.num <= 60 ? '1.' : '2.') + ' kitapçık)' : '');
  };

  VK.examFile = function (q, ctx) {
    const [variant, kicker] = VARIANT[q.docType] || ['letter', q.docType.toLocaleUpperCase('tr-TR')];
    const c = q.client || { name: '—' };
    const meta =
      '<dl class="meta">' +
      '<dt>Dosya</dt><dd>' + VK.esc(ctx.fileNo || '') + '</dd>' +
      '<dt>' + (q.docType === 'Stajyer Notu' ? 'Hazırlayan' : 'Müvekkil') + '</dt><dd>' + VK.esc(c.name) + '</dd>' +
      (c.sector && c.sector !== 'Büro içi' ? '<dt>Sektör</dt><dd>' + VK.esc(c.sector) + '</dd>' : '') +
      '<dt>Konu</dt><dd>' + VK.esc(q.subtopic || VK.TOPICS[q.topic] || '') + '</dd>' +
      (ctx.today ? '<dt>Tarih</dt><dd>' + VK.D.fmt(ctx.today) + '</dd>' : '') +
      '</dl>';
    let coverHtml = meta + VK.rich(q.intro || '');
    if (q.outdated) coverHtml += '<div class="notice">Mülga/değişmiş mevzuat dönemine ait soru. Ayrıntı sonuç fişinde.</div>';
    coverHtml += '<div class="src">Kaynak: ' + VK.esc(VK.sourceLabel(q)) + '</div>';
    const docs = [{ id: 'kapak', variant, kicker, title: q.title, html: coverHtml }];
    const hasEk = (q.context && q.context.trim()) || (q.items && q.items.length) || q.table || q.figure;
    if (hasEk) {
      let html = q.context ? VK.rich(q.context) : '';
      if (q.items && q.items.length) html += '<ol class="items">' + q.items.map((i) => '<li>' + VK.inline(i) + '</li>').join('') + '</ol>';
      if (q.table) {
        html +=
          '<div class="tbl-wrap"><table class="grid"><thead><tr>' +
          q.table.headers.map((x) => '<th>' + VK.esc(x) + '</th>').join('') +
          '</tr></thead><tbody>' +
          q.table.rows.map((r) => '<tr>' + r.map((x) => '<td>' + VK.inline(x) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>';
      }
      if (q.figure) html += '<figure><img src="' + VK.esc(VK.figureSrc(q.figure)) + '" alt="Soruya ait görsel (büyütmek için tıkla)"></figure>';
      const kick = q.docType === 'Kurum Yazısı' ? 'EK · YAZININ İÇERİĞİ' : q.docType === 'Stajyer Notu' ? 'NOTUN DAYANAĞI' : 'EK-1 · DOSYA ÖZETİ';
      const long = (q.context || '').length > 650 || q.table || q.figure;
      docs.push({ id: 'ek', variant: 'ek', kicker: kick, title: '', html, wide: !!long });
    }
    if (docs.length === 1) docs[0].wide = true;
    const options = Object.keys(q.options)
      .sort()
      .map((k) => (q.optionHeaders ? { key: k, cells: q.options[k] } : { key: k, text: q.options[k] }));
    return {
      kind: 'exam',
      id: q.id,
      q,
      topic: q.topic,
      subtopic: q.subtopic,
      title: q.title,
      client: c,
      line: q.line,
      intro: q.intro,
      ask: q.ask,
      docs,
      options,
      optionHeaders: q.optionHeaders,
      answer: q.answer,
      explanation: q.explanation,
      law: q.law,
      hint: q.hint,
      difficulty: q.difficulty || 2,
      src: VK.sourceLabel(q),
      outdated: q.outdated,
      keyNote: q.keyNote,
    };
  };
  // Tek dosya derlemesinde görseller gömülü gelir
  VK.figureSrc = (p) => (VK.FIGURES && VK.FIGURES[p]) || p;

  VK.optionText = function (f, key) {
    const o = f.options.find((x) => x.key === key);
    if (!o) return '';
    if (o.cells) return o.cells.map((c, i) => (f.optionHeaders ? f.optionHeaders[i] + ': ' : '') + c).join(' · ');
    return o.text;
  };
})();
