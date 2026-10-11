/* VEKİL — tohumlu piksel portreler ve bekleme salonu çizimi. */
(function () {
  'use strict';
  const VK = window.VK;

  const SKIN = ['#f0c9a4', '#e2b08a', '#cf9670', '#b07650', '#8c5b3d'];
  const HAIR = ['#1c1510', '#3a281c', '#5e4129', '#8f6a42', '#bdb6aa', '#6e2c1b', '#2b2b30'];
  const SUIT = ['#2e3a4b', '#3b3b3e', '#574430', '#284539', '#652d2b', '#47506b', '#6f6249', '#1f2a2e'];
  const SHIRT = ['#e9e5da', '#cdd7db', '#efe0bd', '#d9e4cf'];
  const TIE = ['#8e2b25', '#264d73', '#4d6b2f', '#7a5c1e', '#5b2f6b'];
  const SCARF = ['#7b3045', '#2f5d6b', '#6b5a2f', '#3d4f7a', '#8a6d8f', '#4a6b4f'];

  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255,
      g = (n >> 8) & 255,
      b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * f)));
    g = Math.max(0, Math.min(255, Math.round(g * f)));
    b = Math.max(0, Math.min(255, Math.round(b * f)));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  // Portre: 24x30 piksel ızgara
  VK.drawPortrait = function (canvas, seed, opts) {
    opts = opts || {};
    const W = 24,
      H = 30;
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, W, H);
    const r = VK.rng('portrait:' + seed);
    const skin = opts.skin || r.pick(SKIN);
    const skinD = shade(skin, 0.86);
    const hair = r.pick(HAIR);
    const suit = opts.suit || r.pick(SUIT);
    const shirt = r.pick(SHIRT);
    let style = opts.style != null ? opts.style : r.int(0, 5); // 0 kısa, 1 uzun, 2 kel, 3 başörtüsü, 4 topuz, 5 dalgalı
    const glasses = opts.glasses != null ? opts.glasses : r.chance(0.3);
    const mustache = opts.mustache != null ? opts.mustache : (style === 0 || style === 2) && r.chance(0.45);
    const tie = opts.tie != null ? opts.tie : style !== 3 && r.chance(0.55);
    const scarf = r.pick(SCARF);
    const cap = !!opts.cap;
    const px = (x, y, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, 1, 1);
    };
    const rect = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    };
    const inHead = (x, y) => {
      const dx = (x + 0.5 - 12) / 5.6,
        dy = (y + 0.5 - 12.5) / 7.2;
      return dx * dx + dy * dy <= 1;
    };

    // Omuzlar / ceket
    for (let y = 22; y < H; y++) {
      const spread = Math.min(11, 6 + (y - 22) * 1.6);
      for (let x = Math.round(12 - spread); x < Math.round(12 + spread); x++) px(x, y, suit);
    }
    // Gömlek yakası (V)
    for (let y = 22; y < H; y++) {
      const w = Math.max(0, 3 - Math.floor((y - 22) / 2.5));
      if (w > 0) rect(12 - w, y, w * 2, 1, shirt);
    }
    if (tie) {
      const tc = r.pick(TIE);
      rect(11, 22, 2, 1, tc);
      rect(11, 23, 2, 7, tc);
    }
    // Arka saç (uzun / başörtüsü)
    if (style === 1) {
      for (let y = 6; y < 23; y++) for (let x = 5; x < 19; x++) if (!inHead(x, y) && Math.abs(x + 0.5 - 12) < 7) px(x, y, hair);
    }
    if (style === 3) {
      for (let y = 3; y < 26; y++)
        for (let x = 3; x < 21; x++) {
          const dx = (x + 0.5 - 12) / 7.6,
            dy = (y + 0.5 - 13) / 10;
          if (dx * dx + dy * dy <= 1) px(x, y, scarf);
        }
    }
    // Boyun
    rect(10, 18, 4, 4, skinD);
    // Kafa
    for (let y = 4; y < 21; y++) for (let x = 5; x < 19; x++) if (inHead(x, y)) px(x, y, x >= 14 ? skinD : skin);
    // Kulaklar
    if (style !== 3 && style !== 1) {
      px(6, 12, skinD);
      px(6, 13, skinD);
      px(17, 12, skinD);
      px(17, 13, skinD);
    }
    // Saç
    const hairTop = (fromY, toY) => {
      for (let y = fromY; y <= toY; y++) for (let x = 5; x < 19; x++) if (inHead(x, y)) px(x, y, hair);
    };
    if (style === 0) {
      hairTop(4, 7);
      rect(6, 8, 1, 3, hair);
      rect(17, 8, 1, 3, hair);
    } else if (style === 1) {
      hairTop(4, 7);
      rect(6, 8, 2, 5, hair);
      rect(16, 8, 2, 5, hair);
    } else if (style === 2) {
      rect(6, 9, 1, 4, hair);
      rect(17, 9, 1, 4, hair);
      px(7, 8, hair);
      px(16, 8, hair);
    } else if (style === 3) {
      // başörtüsü yüzü çerçeveler
      for (let y = 4; y < 21; y++)
        for (let x = 5; x < 19; x++) {
          if (!inHead(x, y)) continue;
          const dx = (x + 0.5 - 12) / 4.4,
            dy = (y + 0.5 - 13.4) / 6.0;
          if (dx * dx + dy * dy > 1) px(x, y, scarf);
        }
    } else if (style === 4) {
      hairTop(4, 7);
      for (let y = 1; y < 5; y++) for (let x = 9; x < 15; x++) if ((x - 11.5) ** 2 + (y - 2.8) ** 2 < 6) px(x, y, hair);
      rect(6, 8, 1, 3, hair);
      rect(17, 8, 1, 3, hair);
    } else {
      hairTop(3, 8);
      for (let y = 3; y < 9; y++) {
        px(5, y + 2, hair);
        px(18, y + 2, hair);
      }
      for (let x = 6; x < 18; x += 2) px(x, 3, hair);
    }
    if (cap) {
      const capc = '#3d4a5c';
      for (let y = 2; y < 8; y++) for (let x = 5; x < 19; x++) if (inHead(x, y + 2) || y < 4) if (Math.abs(x + 0.5 - 12) < 6.5) px(x, y, capc);
      rect(5, 7, 15, 1, shade(capc, 0.7));
      rect(10, 4, 4, 2, '#c8a24a');
    }
    // Kaşlar
    const brow = style === 3 ? '#2a1d14' : shade(hair, 0.8);
    rect(8, 10, 3, 1, brow);
    rect(13, 10, 3, 1, brow);
    // Gözler
    const eye = '#1a1412';
    px(9, 12, eye);
    px(14, 12, eye);
    px(10, 12, '#f4efe6');
    px(15, 12, '#f4efe6');
    // Burun
    px(12, 13, skinD);
    px(12, 14, skinD);
    px(11, 15, skinD);
    // Ağız
    const mouthCol = shade(skin, 0.62);
    const mood = opts.mood || 'neutral';
    if (mood === 'happy') {
      px(10, 17, mouthCol);
      rect(11, 18, 2, 1, mouthCol);
      px(13, 17, mouthCol);
    } else if (mood === 'angry') {
      px(10, 18, mouthCol);
      rect(11, 17, 2, 1, mouthCol);
      px(13, 18, mouthCol);
      rect(8, 9, 1, 1, brow);
      rect(15, 9, 1, 1, brow);
    } else rect(10, 17, 4, 1, mouthCol);
    if (mustache) rect(9, 16, 6, 1, shade(hair, 0.9));
    if (glasses) {
      const g = '#20262b';
      rect(8, 11, 4, 1, g);
      rect(13, 11, 4, 1, g);
      rect(8, 13, 4, 1, g);
      rect(13, 13, 4, 1, g);
      px(8, 12, g);
      px(11, 12, g);
      px(13, 12, g);
      px(16, 12, g);
      px(12, 11, g);
    }
  };

  // Masadaki ince belli çay bardağı (dekor)
  VK.drawTea = function (canvas) {
    const W = 20,
      H = 25;
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, W, H);
    // tabak
    c.fillStyle = 'rgba(0,0,0,0.25)';
    c.fillRect(2, 22, 17, 2);
    c.fillStyle = '#d9d2c2';
    c.fillRect(1, 20, 18, 2);
    c.fillStyle = '#b9b1a0';
    c.fillRect(2, 22, 16, 1);
    // bardak profili: her satır için yarı genişlik
    const half = [5, 5, 4.5, 4, 3.5, 3, 3, 3, 3.5, 4, 4.5, 4.5, 4, 3.5, 3.5, 3.5];
    for (let i = 0; i < half.length; i++) {
      const y = 4 + i;
      const w = half[i];
      const x0 = Math.round(10 - w),
        x1 = Math.round(10 + w);
      for (let x = x0; x < x1; x++) {
        let col;
        if (i < 1) col = 'rgba(235,240,240,0.55)';
        else if (i < 2) col = '#c0622a';
        else col = i < 9 ? '#a8441a' : '#8a3212';
        if (x === x0 || x === x1 - 1) col = 'rgba(240,245,245,0.75)';
        c.fillStyle = col;
        c.fillRect(x, y, 1, 1);
      }
    }
    c.fillStyle = 'rgba(255,255,255,0.55)';
    c.fillRect(7, 7, 1, 4);
    c.fillRect(8, 14, 1, 3);
    // kaşık
    c.fillStyle = '#cfcfcf';
    c.fillRect(13, 1, 1, 6);
    c.fillRect(14, 20, 4, 1);
  };

  // Bekleme salonu: koridor ve sırada bekleyen silüetler
  VK.drawHall = function (canvas, count, seed, step) {
    const W = 120,
      H = 44;
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext('2d');
    // duvar
    c.fillStyle = '#39443f';
    c.fillRect(0, 0, W, H);
    c.fillStyle = '#323c38';
    for (let x = 0; x < W; x += 8) c.fillRect(x, 0, 1, 30);
    // pencere
    c.fillStyle = '#5d6f73';
    c.fillRect(84, 6, 26, 14);
    c.fillStyle = '#8fa7a6';
    c.fillRect(86, 8, 10, 10);
    c.fillRect(98, 8, 10, 10);
    // pano
    c.fillStyle = '#7b5e3a';
    c.fillRect(8, 6, 22, 12);
    c.fillStyle = '#e9e0c8';
    c.fillRect(10, 8, 6, 4);
    c.fillRect(18, 8, 9, 7);
    c.fillRect(11, 13, 5, 3);
    // zemin
    c.fillStyle = '#4b3a2c';
    c.fillRect(0, 30, W, 14);
    c.fillStyle = '#433326';
    for (let x = (step || 0) % 10; x < W; x += 10) c.fillRect(x, 30, 1, 14);
    c.fillStyle = '#2a201a';
    c.fillRect(0, 30, W, 1);
    const r = VK.rng('hall:' + seed);
    const shown = Math.min(count, 9);
    for (let i = 0; i < shown; i++) {
      const x = W - 12 - i * 12 - r.int(0, 2);
      const tone = r.pick(['#1f2427', '#262b22', '#2c2324', '#20262f', '#2a2a2a']);
      const tall = r.int(0, 3);
      c.fillStyle = tone;
      // gövde
      c.fillRect(x - 3, 20 - tall, 7, 14 + tall);
      // bacaklar
      c.fillRect(x - 3, 34, 3, 7);
      c.fillRect(x + 1, 34, 3, 7);
      // kafa
      c.fillRect(x - 2, 13 - tall, 5, 6);
      c.fillRect(x - 1, 12 - tall, 3, 1);
      if (r.chance(0.3)) {
        // çanta / dosya
        c.fillStyle = '#7d6440';
        c.fillRect(x + 4, 26 - tall, 3, 5);
      }
    }
    if (count > shown) {
      c.fillStyle = '#e9e0c8';
      c.font = '7px monospace';
      c.fillText('+' + (count - shown), 2, 40);
    }
  };
})();
