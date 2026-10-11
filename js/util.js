/* VEKİL — ortak yardımcılar: DOM, tarih/süre hesabı, rastgelelik, kayıt, ses. */
(function () {
  'use strict';
  const VK = (window.VK = window.VK || {});

  /* ---------- DOM ---------- */
  VK.$ = (sel, root) => (root || document).querySelector(sel);
  VK.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // h('div.cls#id', {attrs}, ...children)
  VK.h = function (spec, attrs, ...kids) {
    const m = spec.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) {
      m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => {
        if (t === '.') el.classList.add(v);
        else el.id = v;
      });
    }
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
      kids.unshift(attrs);
      attrs = null;
    }
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    const add = (k) => {
      if (k == null || k === false) return;
      if (Array.isArray(k)) k.forEach(add);
      else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    };
    kids.forEach(add);
    return el;
  };

  VK.esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Çok sınırlı biçimlendirme: **kalın**, satır sonları -> paragraf
  VK.rich = function (s) {
    const esc = VK.esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return esc
      .split(/\n{2,}/)
      .map((p) => '<p>' + p.replace(/\n/g, '<br>') + '</p>')
      .join('');
  };
  VK.inline = (s) => VK.esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  VK.money = (n) => {
    const sign = n < 0 ? '−' : '';
    return sign + '₺' + Math.abs(Math.round(n)).toLocaleString('tr-TR');
  };
  VK.signed = (n) => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(n);

  /* ---------- Rastgelelik ---------- */
  VK.hash = function (str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
  VK.rng = function (seed) {
    let a = typeof seed === 'number' ? seed >>> 0 : VK.hash(String(seed));
    const r = function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    r.pick = (arr) => arr[Math.floor(r() * arr.length)];
    r.chance = (p) => r() < p;
    r.shuffle = (arr) => {
      const a2 = arr.slice();
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    };
    return r;
  };

  /* ---------- Tarih ve süre hesabı ----------
     Tarihler UTC gece yarısı Date nesneleri olarak tutulur.
     Ay/yıl ile belirlenen süreler, başlangıç gününe karşılık gelen günde biter;
     o ayda karşılık gelen gün yoksa ayın son günü esas alınır. */
  const D = (VK.D = {});
  D.DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  D.MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  D.make = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
  D.parse = (s) => {
    const p = String(s).trim().split('.').map(Number);
    return D.make(p[2], p[1], p[0]);
  };
  D.valid = (s) => /^\d{1,2}\.\d{1,2}\.\d{4}$/.test(String(s).trim()) && !isNaN(D.parse(s));
  const pad = (n) => String(n).padStart(2, '0');
  D.fmt = (dt) => pad(dt.getUTCDate()) + '.' + pad(dt.getUTCMonth() + 1) + '.' + dt.getUTCFullYear();
  D.iso = (dt) => dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
  D.fromIso = (s) => {
    const p = s.split('-').map(Number);
    return D.make(p[0], p[1], p[2]);
  };
  D.dim = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate(); // m: 1-12
  D.addDays = (dt, n) => new Date(dt.getTime() + n * 86400000);
  D.addMonths = (dt, n) => {
    const y0 = dt.getUTCFullYear(),
      m0 = dt.getUTCMonth(),
      d0 = dt.getUTCDate();
    const total = m0 + n;
    const y = y0 + Math.floor(total / 12);
    const m = ((total % 12) + 12) % 12;
    return D.make(y, m + 1, Math.min(d0, D.dim(y, m + 1)));
  };
  D.addYears = (dt, n) => D.addMonths(dt, 12 * n);
  D.dow = (dt) => dt.getUTCDay();
  D.dayName = (dt) => D.DAYS[D.dow(dt)];
  D.long = (dt) => dt.getUTCDate() + ' ' + D.MONTHS[dt.getUTCMonth()] + ' ' + dt.getUTCFullYear();
  D.longDay = (dt) => D.long(dt) + ', ' + D.dayName(dt);
  D.diff = (a, b) => Math.round((b - a) / 86400000); // b - a gün
  D.isWeekend = (dt) => D.dow(dt) === 0 || D.dow(dt) === 6;
  D.nextWorkday = (dt) => {
    let x = dt;
    while (D.isWeekend(x)) x = D.addDays(x, 1);
    return x;
  };
  D.addWorkdays = (dt, n) => {
    let x = dt;
    while (n > 0) {
      x = D.addDays(x, 1);
      if (!D.isWeekend(x)) n--;
    }
    return x;
  };

  /* ---------- Kalıcı kayıt (tarayıcı) ---------- */
  const PREFIX = 'vekil.v1.';
  VK.store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem(PREFIX + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, val) {
      try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(val));
      } catch (e) {
        /* depolama kapalı olabilir; oyun yine de çalışır */
      }
    },
    del(key) {
      try {
        window.localStorage.removeItem(PREFIX + key);
      } catch (e) {}
    },
  };

  /* ---------- Ses (WebAudio ile üretilir, dosya yok) ---------- */
  let ctx = null;
  const audio = () => {
    if (!VK.settings || !VK.settings.sound) return null;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    } catch (e) {
      return null;
    }
  };
  function noise(ac, dur, gain, freq, q) {
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ac.createGain();
    g.gain.value = gain;
    src.connect(f).connect(g).connect(ac.destination);
    src.start();
  }
  function tone(ac, freq, dur, gain, type, when) {
    const t0 = ac.currentTime + (when || 0);
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }
  VK.sfx = {
    stamp() {
      const ac = audio();
      if (!ac) return;
      tone(ac, 70, 0.18, 0.6, 'sine');
      noise(ac, 0.08, 0.5, 900, 0.7);
    },
    paper() {
      const ac = audio();
      if (!ac) return;
      noise(ac, 0.22, 0.25, 3200, 0.6);
    },
    bell() {
      const ac = audio();
      if (!ac) return;
      tone(ac, 1318, 0.9, 0.18, 'sine');
      tone(ac, 1976, 0.6, 0.06, 'sine');
    },
    good() {
      const ac = audio();
      if (!ac) return;
      tone(ac, 660, 0.15, 0.12, 'triangle');
      tone(ac, 880, 0.25, 0.12, 'triangle', 0.1);
    },
    bad() {
      const ac = audio();
      if (!ac) return;
      tone(ac, 220, 0.3, 0.16, 'square');
      tone(ac, 196, 0.35, 0.12, 'square', 0.12);
    },
    print() {
      const ac = audio();
      if (!ac) return;
      for (let i = 0; i < 5; i++) setTimeout(() => noise(ac, 0.05, 0.18, 1800, 2), i * 70);
    },
    tick() {
      const ac = audio();
      if (!ac) return;
      tone(ac, 1200, 0.03, 0.05, 'square');
    },
  };

  VK.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  VK.reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
