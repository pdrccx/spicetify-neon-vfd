// Generado por build.mjs — editar src/, no este archivo.
(function neonVfd() {
'use strict';
// NEON//VFD para Spotify: mete un display de autoestéreo (16 segmentos) en la
// barra de reproducción. build.mjs pega aquí arriba el motor de glifos
// (segment16.js) y envuelve todo en una función para no ensuciar el global.

// Copia de C:\reproductor\renderer\js\segment16.js.
// build.mjs le quita import/export para meterlo en theme.js.
// Display de 16 segmentos (como los de los autoestéreos de los 2000), en SVG.
//
//   ─a1─ ─a2─          Cada carácter enciende una combinación de 16 segmentos.
//  │╲    │    ╱│        Los apagados se ven tenues ("fantasma"), como un VFD real.
//  f  h  i  j  b
//  │    ╲│╱    │
//   ─g1─ ─g2─
//  │    ╱│╲    │
//  e  k  l  m  c
//  │╱    │    ╲│
//   ─d1─ ─d2─  •dp



const SEGMENTS = ['a1', 'a2', 'b', 'c', 'd1', 'd2', 'e', 'f', 'g1', 'g2', 'h', 'i', 'j', 'k', 'l', 'm'];

// Qué segmentos enciende cada carácter.
const GLYPHS = {
  A: 'a1 a2 b c e f g1 g2', B: 'a1 a2 b c d1 d2 g2 i l', C: 'a1 a2 d1 d2 e f',
  D: 'a1 a2 b c d1 d2 i l', E: 'a1 a2 d1 d2 e f g1', F: 'a1 a2 e f g1',
  G: 'a1 a2 c d1 d2 e f g2', H: 'b c e f g1 g2', I: 'a1 a2 d1 d2 i l',
  J: 'b c d1 d2 e', K: 'e f g1 j m', L: 'd1 d2 e f', M: 'b c e f h j',
  N: 'b c e f h m', O: 'a1 a2 b c d1 d2 e f', P: 'a1 a2 b e f g1 g2',
  Q: 'a1 a2 b c d1 d2 e f m', R: 'a1 a2 b e f g1 g2 m', S: 'a1 a2 c d1 d2 f g1 g2',
  T: 'a1 a2 i l', U: 'b c d1 d2 e f', V: 'e f j k', W: 'b c e f k m',
  X: 'h j k m', Y: 'h j l', Z: 'a1 a2 d1 d2 j k',
  Ñ: 'a1 a2 b c e f h m',
  0: 'a1 a2 b c d1 d2 e f', 1: 'b c j', 2: 'a1 a2 b d1 d2 e g1 g2',
  3: 'a1 a2 b c d1 d2 g2', 4: 'b c f g1 g2', 5: 'a1 a2 c d1 d2 f g1 g2',
  6: 'a1 a2 c d1 d2 e f g1 g2', 7: 'a1 a2 b c', 8: 'a1 a2 b c d1 d2 e f g1 g2',
  9: 'a1 a2 b c d1 d2 f g1 g2',
  '-': 'g1 g2', _: 'd1 d2', '+': 'g1 g2 i l', '*': 'g1 g2 h i j k l m',
  '/': 'j k', '\\': 'h m', '=': 'd1 d2 g1 g2', "'": 'i', '"': 'f i', '`': 'h',
  '(': 'j m', ')': 'h k', '[': 'a2 d2 i l', ']': 'a1 d1 i l', '<': 'j m', '>': 'h k',
  '?': 'a1 a2 b g2 l', '!': 'b c', ',': 'k', '#': 'b c d1 d2 g1 g2 i l',
  '$': 'a1 a2 c d1 d2 f g1 g2 i l', '%': 'a1 c d2 f g1 g2 i j k l', '&': 'a1 d1 d2 e g1 h i m',
  '@': 'a1 a2 b d1 d2 e f g2 i', '|': 'i l', '^': 'k m', '~': 'g1 h j', '¿': 'a1 d1 d2 e g1 i',
  '¡': 'e f', '†': 'g1 g2 i l',

  // Cirílico (como en el tubo VFD soviético ИВ-17, de 16 segmentos). Las letras
  // que comparten forma con el latín (А В Е К М Н О Р С Т Х) usan la misma.
  А: 'a1 a2 b c e f g1 g2', В: 'a1 a2 b c d1 d2 g2 i l', Е: 'a1 a2 d1 d2 e f g1',
  К: 'e f g1 j m', М: 'b c e f h j', Н: 'b c e f g1 g2', О: 'a1 a2 b c d1 d2 e f',
  Р: 'a1 a2 b e f g1 g2', С: 'a1 a2 d1 d2 e f', Т: 'a1 a2 i l', Х: 'h j k m',
  Б: 'a1 a2 c d1 d2 e f g1 g2', Г: 'a1 a2 e f', Д: 'a2 b c d1 d2 i k',
  Ж: 'h i j k l m', З: 'a1 a2 c d1 d2 g2 j', И: 'b c e f j k', Л: 'a2 b c i k',
  П: 'a1 a2 b c e f', У: 'b c d1 d2 f g1 g2', Ф: 'a1 a2 b f g1 g2 i l',
  Ц: 'b c d1 d2 e f m', Ч: 'b c f g1 g2', Ш: 'b c d1 d2 e f l', Щ: 'b c d1 d2 e f l m',
  Ъ: 'a1 c d1 d2 g2 i l', Ы: 'b c d1 e f g1 l', Ь: 'c d1 d2 e f g1 g2',
  Э: 'a1 a2 b c d1 d2 g2', Ю: 'a2 b c d2 e f g1 i l', Я: 'a1 a2 b c f g1 g2 k',
  // Ucraniano y otras
  Є: 'a1 a2 d1 d2 e f g1', І: 'a1 a2 d1 d2 i l', Ґ: 'a1 a2 e f', Ѕ: 'a1 a2 c d1 d2 f g1 g2', Ј: 'b c d1 d2 e',
};

// Signos tipográficos que llegan en títulos y se dibujan con su equivalente simple.
const LOOKALIKE = {
  '‘': "'", '’': "'", '´': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', '·': '.', '×': 'X',
  // Variantes de cruz (††† / ✝✝✝ en Crosses, según quién escriba la etiqueta) se dibujan como †.
  '✝': '†', '✞': '†', '✟': '†', '☦': '†', '✙': '†', '✚': '†', '‡': '†', '⸸': '†',
};
const BITS = Object.fromEntries(Object.entries(GLYPHS).map(([ch, segs]) => [ch, new Set(segs.split(' '))]));

// ---------------------------------------------------------------- geometría
// Celda de 44 × 64 unidades. Los segmentos son hexágonos con las puntas en bisel.
const CELL_W = 44;
const CELL_H = 64;
const L = 6, R = 34, T = 4, M = 32, B = 60, C = 20;
const THICK = 4.2;
const GAP = 1.6;

const POINTS = {
  a1: [L, T, C, T], a2: [C, T, R, T],
  f: [L, T, L, M], b: [R, T, R, M],
  e: [L, M, L, B], c: [R, M, R, B],
  g1: [L, M, C, M], g2: [C, M, R, M],
  d1: [L, B, C, B], d2: [C, B, R, B],
  i: [C, T, C, M], l: [C, M, C, B],
  h: [L, T, C, M], j: [R, T, C, M],
  k: [L, B, C, M], m: [R, B, C, M],
};
const DIAGONAL = new Set(['h', 'j', 'k', 'm']);

// Hexágono alargado de (x0,y0) a (x1,y1), recortado `gap` en cada punta.
function bar([x0, y0, x1, y1], gap) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len; // dirección
  const nx = -uy, ny = ux;                           // normal
  const h = THICK / 2;
  const ax = x0 + ux * gap, ay = y0 + uy * gap;
  const bx = x1 - ux * gap, by = y1 - uy * gap;
  const pts = [
    [ax, ay],
    [ax + ux * h + nx * h, ay + uy * h + ny * h],
    [bx - ux * h + nx * h, by - uy * h + ny * h],
    [bx, by],
    [bx - ux * h - nx * h, by - uy * h - ny * h],
    [ax + ux * h - nx * h, ay + uy * h - ny * h],
  ];
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
}

// El dibujo de una celda se calcula una sola vez y se reutiliza.
const CELL_SVG =
  SEGMENTS.map((s) => `<polygon class="seg" data-s="${s}" points="${bar(POINTS[s], DIAGONAL.has(s) ? THICK * 1.1 : GAP)}"/>`).join('') +
  `<circle class="seg" data-s="dp" cx="${R + 5}" cy="${B - 1}" r="3.2"/>` +
  `<circle class="seg" data-s="colon" cx="${R + 8}" cy="21" r="3.2"/>` +
  `<circle class="seg" data-s="colon" cx="${R + 8}" cy="45" r="3.2"/>`;

// ---------------------------------------------------------------- texto
// Convierte texto a celdas: { segs, dp, colon }. "." y ":" no ocupan celda:
// se pegan a la anterior, como en los displays reales.
// Texto como lo dibuja el display: mayúsculas, sin acentos, signos simplificados.
// (Й → И y Ё → Е pierden su marca, igual que los acentos latinos.)
function normalize(text) {
  return String(text ?? '')
    .replace(/[‘’´“”–—…·×✝✞✟☦✙✚‡⸸]/gu, (ch) => LOOKALIKE[ch])
    .toUpperCase()
    .replace(/Ñ/g, '\u0000') // se protege antes de quitar acentos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0000/g, 'Ñ');
}

/** ¿El display de 16 segmentos sabe dibujar este carácter (o texto)? */
function hasSegmentGlyph(text) {
  return [...normalize(text)].every((c) => c === ' ' || c === '.' || c === ':' || c in GLYPHS);
}

function toCells(text) {
  const clean = normalize(text);

  const cells = [];
  for (const ch of clean) {
    const prev = cells[cells.length - 1];
    if (ch === '.' && prev && !prev.dp) { prev.dp = true; continue; }
    if (ch === ':' && prev && !prev.colon) { prev.colon = true; continue; }
    const cell = { segs: BITS[ch] ?? new Set(), dp: ch === '.', colon: ch === ':' };
    cells.push(cell);
  }
  return cells;
}

const BLANK = { segs: new Set(), dp: false, colon: false };

/**
 * Crea un display de `size` caracteres dentro de `container`.
 * Devuelve { setText(text, { align, scroll }), clear() }.
 * Con scroll, el texto más largo que el display avanza carácter por carácter.
 */
function createSegmentDisplay(container, { size = 16, stepMs = 320, pauseMs = 1600 } = {}) {
  const width = size * CELL_W;
  container.innerHTML =
    `<svg class="seg16" viewBox="-4 0 ${width + 8} ${CELL_H}" aria-hidden="true" focusable="false">` +
    // Ligera inclinación, como los displays de esa época.
    `<g transform="translate(6 0) skewX(-6)">` +
    Array.from({ length: size }, (_, i) => `<g transform="translate(${i * CELL_W} 0)">${CELL_SVG}</g>`).join('') +
    `</g></svg>`;

  const slots = [...container.querySelectorAll('svg > g > g')].map((g) => ({
    segs: Object.fromEntries(SEGMENTS.map((s) => [s, g.querySelector(`[data-s="${s}"]`)])),
    dp: g.querySelector('[data-s="dp"]'),
    colon: [...g.querySelectorAll('[data-s="colon"]')],
  }));

  let timer = null;

  function paint(cells) {
    slots.forEach((slot, i) => {
      const cell = cells[i] ?? BLANK;
      for (const s of SEGMENTS) slot.segs[s].classList.toggle('on', cell.segs.has(s));
      slot.dp.classList.toggle('on', cell.dp);
      for (const dot of slot.colon) dot.classList.toggle('on', cell.colon);
    });
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
  }

  function setText(text, { align = 'left', scroll = false } = {}) {
    stop();
    const cells = toCells(text);

    // Con marquesina el texto siempre avanza, aunque quepa (como en los estéreos).
    if (!scroll || !cells.length || !motionAllowed()) {
      const pad = Math.max(0, size - cells.length);
      paint(align === 'right' ? [...Array(pad).fill(BLANK), ...cells] : cells.slice(0, size));
      return;
    }

    // Marquesina: muestra el inicio, pausa, avanza de a un carácter y vuelve a empezar.
    // El hueco entre vueltas es de al menos el ancho del display, para que un texto
    // corto salga por la izquierda y vuelva a entrar por la derecha sin verse doble.
    const gap = Math.max(4, size - cells.length + 1);
    const loop = [...cells, ...Array(gap).fill(BLANK)];
    let offset = 0;
    const step = () => {
      paint(Array.from({ length: size }, (_, i) => loop[(offset + i) % loop.length]));
      offset = (offset + 1) % loop.length;
      timer = setTimeout(step, offset === 1 ? pauseMs : stepMs);
    };
    step();
  }

  return { setText, clear: () => setText(''), stop };
}


// Copia de C:\reproductor\renderer\js\dotmatrix.js.
// build.mjs le quita import/export para meterlo en theme.js.
// Display de matriz de puntos, como los estéreos japoneses de gama alta: un
// display de 16 segmentos solo sabe dibujar el alfabeto latino, así que para
// kanji, kana, hangul y demás escrituras se usa una rejilla de puntos.
//
// Truco: se escribe el texto con una fuente de Windows que ya trae esas
// escrituras, a la altura del display en píxeles, y cada píxel se vuelve un
// punto encendido o apagado. Funciona con cualquier idioma.



// Japonés primero (Yu Gothic); si una letra no está ahí (hangul), el navegador
// pasa a la siguiente fuente (Malgun Gothic), y así.
const FONT_STACK = '"Yu Gothic UI", "Yu Gothic", "Malgun Gothic", "Microsoft YaHei", "Meiryo", "MS Gothic", sans-serif';

// ¿Necesita matriz de puntos? Sí, si trae alguna letra no latina que el display
// de 16 segmentos no sepa dibujar (kanji, kana, hangul, griego…) o símbolos de
// escritura asiática (puntuación CJK 、。「」 y caracteres de ancho completo).
// Latín con acentos, ñ y cirílico se quedan en 16 segmentos.
const NON_LATIN = /[\p{L}--\p{Script=Latin}]|[　-〿＀-￯]/v;
// El cirílico sí cabe en 16 segmentos (tiene glifos en segment16.js), así que
// solo pasa a puntos un carácter no latino que el display de segmentos no sepa dibujar.
const needsDotMatrix = (text) =>
  [...String(text ?? '')].some((ch) => NON_LATIN.test(ch) && !hasSegmentGlyph(ch));

/**
 * Convierte texto en un mapa de bits de `rows` puntos de alto.
 * Devuelve { width, rows, bits } donde bits[y * width + x] es 1 si el punto va encendido.
 */
function rasterize(text, rows) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const font = `600 ${rows - 1}px ${FONT_STACK}`;
  ctx.font = font;
  const width = Math.max(1, Math.ceil(ctx.measureText(text).width) + 2);
  canvas.width = width;
  canvas.height = rows;
  ctx.font = font; // cambiar el tamaño del canvas reinicia la fuente
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, 1, rows / 2 + 0.5);

  const alpha = ctx.getImageData(0, 0, width, rows).data;
  const bits = new Uint8Array(width * rows);
  // Umbral: el borde suavizado de la letra cuenta como encendido si es más de ~40 % opaco.
  for (let i = 0; i < bits.length; i++) bits[i] = alpha[i * 4 + 3] > 100 ? 1 : 0;
  return { width, rows, bits };
}

/**
 * Crea un display de matriz de puntos dentro de `host` (ocupa todo su ancho).
 * Devuelve { setText(text, { scroll }), stop() }.
 */
function createDotMatrixDisplay(host, { rows = 14, stepMs = 45, pauseMs = 1600 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'dotmatrix';
  canvas.setAttribute('aria-hidden', 'true');
  host.replaceChildren(canvas);
  const ctx = canvas.getContext('2d');

  let bitmap = { width: 0, rows, bits: new Uint8Array(0) };
  let loopWidth = 1;   // ancho del texto + espacio antes de repetir (marquesina)
  let offset = 0;
  let scrolling = false;
  let timer = null;

  // Tamaño en puntos según el espacio disponible.
  function geometry() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const pitch = h / rows;
    return { dpr, pitch, cols: Math.max(1, Math.floor(w / pitch)) };
  }

  const bitAt = (x, y) => (x >= 0 && x < bitmap.width ? bitmap.bits[y * bitmap.width + x] : 0);

  function paint() {
    const { dpr, pitch, cols } = geometry();
    // Vuelta de la marquesina: el texto más un hueco de al menos el ancho del
    // display, para que un texto corto salga y vuelva a entrar sin verse doble.
    loopWidth = Math.max(bitmap.width + rows * 2, cols + 1);
    offset %= loopWidth;
    const color = getComputedStyle(host).color || '#00f0ff';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    // Puntos grandes (casi se tocan) para que brillen parejo con los segmentos.
    const radius = pitch * 0.44;

    // Dos pasadas: primero los puntos apagados (fantasma), luego los encendidos.
    for (const lit of [0, 1]) {
      ctx.globalAlpha = lit ? 1 : 0.08;
      ctx.beginPath();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const sx = scrolling ? (x + offset) % loopWidth : x;
          if (bitAt(sx, y) !== lit) continue;
          const cx = x * pitch + pitch / 2;
          const cy = y * pitch + pitch / 2;
          ctx.moveTo(cx + radius, cy);
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function stop() {
    clearTimeout(timer);
    timer = null;
  }

  function setText(text, { scroll = false } = {}) {
    stop();
    bitmap = rasterize(String(text ?? ''), rows);
    offset = 0;
    // Con marquesina el texto siempre avanza, aunque quepa (como en los estéreos).
    scrolling = scroll && bitmap.width > 2 && motionAllowed();
    paint(); // paint() calcula loopWidth con el ancho actual
    if (!scrolling) return;

    // Marquesina: pausa al inicio y luego avanza un punto a la vez.
    const step = () => {
      offset = (offset + 1) % loopWidth;
      paint();
      timer = setTimeout(step, offset === 0 ? pauseMs : stepMs);
    };
    timer = setTimeout(step, pauseMs);
  }

  // Si cambia el tamaño de la ventana, se redibuja con el ancho nuevo.
  new ResizeObserver(() => paint()).observe(canvas);

  return {
    setText,
    stop,
    // Puntos encendidos que se ven ahora (para las pruebas).
    litDots() {
      const { cols } = geometry();
      let n = 0;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) n += bitAt(scrolling ? (x + offset) % loopWidth : x, y);
      return n;
    },
  };
}


// ------------------------------------------------------- animaciones
// Igual que en el reproductor: por defecto SIEMPRE (decisión de Pedro); también
// se puede elegir "Seguir a Windows" o "Nunca" desde el menú de perfil de Spotify.
const MOTION_KEY = 'neonvfd.motion';
const MOTION_LABEL = { on: 'Siempre', system: 'Seguir a Windows', off: 'Nunca' };

function motionPref() {
  try {
    const value = localStorage.getItem(MOTION_KEY);
    return value in MOTION_LABEL ? value : 'on';
  } catch {
    return 'on';
  }
}
function motionAllowed() {
  const pref = motionPref();
  return pref === 'on' || (pref === 'system' && !matchMedia('(prefers-reduced-motion: reduce)').matches);
}

// ------------------------------------------------------- reproductor
// En algunas versiones de Spotify casi todo Spicetify.Player truena (le falta
// su "origin" interno): isPlaying, getShuffle, getProgress… Cada lectura y cada
// acción intenta primero Spicetify.Player y, si falla, usa el estado interno de
// Spotify (Platform.PlayerAPI), que sí funciona.
const internalAPI = () => window.Spicetify?.Platform?.PlayerAPI;
const internalState = () => internalAPI()?._state;
function attempt(fromSpicetify, fromSpotify) {
  try {
    const value = fromSpicetify();
    if (value !== undefined && value !== null) return value;
  } catch { /* API de Spicetify roto: se usa el respaldo */ }
  try { return fromSpotify(); } catch { return undefined; }
}
const P = () => window.Spicetify.Player;

const sp = {
  isPlaying: () => attempt(() => P().isPlaying(), () => internalState() ? !internalState().isPaused : false) ?? false,
  shuffle: () => attempt(() => P().getShuffle(), () => !!internalState()?.shuffle) ?? false,
  repeat: () => attempt(() => P().getRepeat(), () => internalState()?.repeat ?? 0) ?? 0,
  mute: () => attempt(() => P().getMute(), () => false) ?? false,
  duration: () => attempt(() => P().getDuration(), () => internalState()?.duration ?? 0) ?? 0,
  progress: () => attempt(() => P().getProgress(), () => {
    const st = internalState();
    if (!st) return 0;
    // La posición se guarda con su hora; si está sonando, se calcula la actual.
    const elapsed = st.isPaused ? 0 : (Date.now() - st.timestamp) * (st.speed ?? 1);
    return Math.min(st.duration ?? Infinity, st.positionAsOfTimestamp + elapsed);
  }) ?? 0,
  formatTime(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  },
  // Acciones: primero Spicetify; si truena, el reproductor interno de Spotify.
  togglePlay: () => attempt(() => { P().togglePlay(); return true; },
    () => (internalState()?.isPaused ? internalAPI().resume() : internalAPI().pause())),
  next: () => attempt(() => { P().next(); return true; }, () => internalAPI().skipToNext()),
  back: () => attempt(() => { P().back(); return true; }, () => internalAPI().skipToPrevious()),
  toggleShuffle: () => attempt(() => { P().toggleShuffle(); return true; }, () => internalAPI().setShuffle(!sp.shuffle())),
  toggleRepeat: () => attempt(() => { P().toggleRepeat(); return true; }, () => internalAPI().setRepeat((sp.repeat() + 1) % 3)),
};

// ------------------------------------------------------- medidor
// Spotify no deja leer el audio (viene cifrado). En su lugar se usa el análisis
// de la canción: cada fragmento trae 12 valores de tono (C, C#, D…) y su
// volumen. Eso alimenta 12 barras. Si el análisis no está disponible, el
// medidor se queda apagado.
const BARS = 12;
const BLOCKS = 7;

function createMeter(canvas) {
  const ctx = canvas.getContext('2d');
  let levels = new Array(BARS).fill(0);
  let segments = null;
  let frame = null;
  let lastDraw = 0;
  let palette = null;

  // Los colores se leen una sola vez: getComputedStyle en cada cuadro obliga a
  // Spotify a recalcular los estilos de toda la página 60 veces por segundo.
  function colors() {
    if (!palette) {
      const css = getComputedStyle(canvas);
      palette = {
        on: css.getPropertyValue('--nvfd-accent').trim() || '#00f0ff',
        peak: css.getPropertyValue('--nvfd-accent-2').trim() || '#ff9d3d',
      };
    }
    return palette;
  }

  function draw() {
    const dpr = devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const c = colors();
    const gap = 2;
    const bw = (w - gap * (BARS - 1)) / BARS;
    const bh = (h - gap * (BLOCKS - 1)) / BLOCKS;
    for (let b = 0; b < BARS; b++) {
      const lit = Math.round(levels[b] * BLOCKS);
      for (let k = 0; k < BLOCKS; k++) {
        ctx.globalAlpha = k < lit ? 1 : 0.1;
        ctx.fillStyle = k >= BLOCKS - 2 ? c.peak : c.on;
        ctx.fillRect(b * (bw + gap), h - (k + 1) * bh - k * gap, bw, bh);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Fragmento del análisis que corresponde al segundo actual (búsqueda binaria).
  function segmentAt(t) {
    let lo = 0, hi = segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segments[mid].start <= t) lo = mid; else hi = mid - 1;
    }
    return segments[lo];
  }

  function tick(now) {
    // Sin análisis no hay nada que mover: el ciclo se apaga solo.
    if (!segments) { frame = null; levels.fill(0); draw(); return; }
    frame = requestAnimationFrame(tick);
    // ~30 cuadros por segundo bastan para un medidor de bloques.
    if (now - lastDraw < 33) return;
    lastDraw = now;
    if (sp.isPlaying()) {
      const seg = segmentAt(sp.progress() / 1000);
      // loudness_max va de ~-60 dB (silencio) a 0 dB (máximo).
      const loud = Math.min(1, Math.max(0, (seg.loudness_max + 40) / 40));
      for (let b = 0; b < BARS; b++) {
        const target = (seg.pitches?.[b] ?? 0) * loud;
        levels[b] = target > levels[b] ? target : levels[b] * 0.88;
      }
    } else {
      levels = levels.map((l) => l * 0.88);
    }
    draw();
  }

  return {
    async load(uri) {
      segments = null;
      try {
        const data = await Spicetify.getAudioData(uri);
        segments = Array.isArray(data?.segments) && data.segments.length ? data.segments : null;
      } catch {
        segments = null; // sin análisis: el medidor se queda apagado
      }
      return segments !== null;
    },
    start() {
      if (frame || !segments || !motionAllowed()) return;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = null;
      levels = new Array(BARS).fill(0);
      draw();
    },
  };
}

// ------------------------------------------------------- display
function buildVfd() {
  const el = document.createElement('div');
  el.className = 'nvfd';
  // Controles propios dentro del display (los de Spotify se esconden en user.css).
  el.innerHTML = `
    <div class="nvfd-transport" role="group" aria-label="Controles de reproducción">
      <button class="nvfd-btn" type="button" data-act="shuffle" aria-pressed="false" aria-label="Aleatorio" title="Aleatorio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3.5c2 0 3.2 1 4.3 2.6l2.4 3.8c1 1.6 2.3 2.6 4.3 2.6H21M3 17h3.5c1.3 0 2.3-.5 3.1-1.3M14 8.3c.8-.8 1.8-1.3 3.1-1.3H21M18 4l3 3-3 3M18 14l3 3-3 3"/></svg>
      </button>
      <button class="nvfd-btn" type="button" data-act="back" aria-label="Anterior" title="Anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M6 5v14M19 5l-10 7 10 7z"/></svg>
      </button>
      <button class="nvfd-btn nvfd-btn-play" type="button" data-act="play" aria-label="Reproducir" title="Reproducir / pausa">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="nvfd-icon-play"><path class="fill" d="M7 4.5v15l12.5-7.5z"/></svg>
        <svg viewBox="0 0 24 24" aria-hidden="true" class="nvfd-icon-pause"><path class="fill" d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>
      </button>
      <button class="nvfd-btn" type="button" data-act="next" aria-label="Siguiente" title="Siguiente">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill" d="M18 5v14M5 5l10 7-10 7z"/></svg>
      </button>
      <button class="nvfd-btn" type="button" data-act="repeat" aria-pressed="false" aria-label="Repetir: no" title="Repetir">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11V9a3 3 0 0 1 3-3h13M17 3l3 3-3 3M20 13v2a3 3 0 0 1-3 3H4M7 21l-3-3 3-3"/></svg>
        <span class="nvfd-rpt1" aria-hidden="true">1</span>
      </button>
    </div>
    <div class="nvfd-cell nvfd-main">
      <div class="nvfd-flags" aria-hidden="true">
        <span class="nvfd-flag" data-flag="play">▶ PLAY</span>
        <span class="nvfd-flag" data-flag="pause">❚❚ PAUSE</span>
        <span class="nvfd-flag nvfd-flag-amber" data-flag="rdm">RDM</span>
        <span class="nvfd-flag nvfd-flag-amber" data-flag="rpt">RPT</span>
        <span class="nvfd-flag nvfd-flag-amber" data-flag="rpt1">RPT 1</span>
        <span class="nvfd-flag" data-flag="mute">MUTE</span>
      </div>
      <div class="nvfd-host" data-host="main"></div>
      <div class="nvfd-host nvfd-dots" data-host="dots" hidden></div>
    </div>
    <canvas class="nvfd-levels" aria-hidden="true"></canvas>
    <button class="nvfd-cell nvfd-time" type="button" title="Transcurrido / restante"
            aria-label="Cambiar entre tiempo transcurrido y restante">
      <span class="nvfd-label">TIME</span>
      <div class="nvfd-host" data-host="time"></div>
    </button>`;
  return el;
}

// Display de 16 segmentos que calcula cuántos caracteres caben en el ancho
// disponible y se redibuja si cambia (igual que en el reproductor).
function createFittingDisplay(host, { min = 8, max = 40 } = {}) {
  let display = createSegmentDisplay(host, { size: min });
  let size = min;
  let last = ['', {}];
  function fit() {
    const height = host.querySelector('svg')?.getBoundingClientRect().height || 26;
    const cellPx = (44 * height) / 64;
    const next = Math.max(min, Math.min(max, Math.floor((host.clientWidth - cellPx * 0.3) / cellPx)));
    if (!host.clientWidth || next === size) return;
    size = next;
    display.stop();
    display = createSegmentDisplay(host, { size });
    display.setText(...last);
  }
  new ResizeObserver(fit).observe(host);
  return {
    setText(text, opts = {}) { last = [text, opts]; display.setText(text, opts); },
    stop: () => display.stop(),
    get size() { return size; },
  };
}

(async function start() {
  // Spicetify no está listo cuando carga el script: se espera a que exista.
  while (!window.Spicetify?.Player?.addEventListener || !Spicetify.Platform || !document.body) {
    await new Promise((r) => setTimeout(r, 300));
  }
  const vfd = buildVfd();
  const segMain = createFittingDisplay(vfd.querySelector('[data-host="main"]'));
  const dotMain = createDotMatrixDisplay(vfd.querySelector('[data-host="dots"]'));

  // Alfabeto latino → 16 segmentos; kanji, kana, hangul u otra escritura → matriz de puntos.
  function showMain(text, opts = {}) {
    const dots = needsDotMatrix(text);
    vfd.querySelector('[data-host="main"]').hidden = dots;
    vfd.querySelector('[data-host="dots"]').hidden = !dots;
    vfd.dataset.mode = dots ? 'dots' : 'segments';
    if (dots) { segMain.stop(); dotMain.setText(text, opts); }
    else { dotMain.stop(); segMain.setText(text, opts); }
  }
  const segTime = createSegmentDisplay(vfd.querySelector('[data-host="time"]'), { size: 5 });
  const meter = createMeter(vfd.querySelector('.nvfd-levels'));
  const timeLabel = vfd.querySelector('.nvfd-label');
  let showRemaining = false;

  const flag = (name, on) => vfd.querySelector(`[data-flag="${name}"]`).classList.toggle('on', on);

  // Spotify redibuja su barra seguido (React): si el display desaparece, se vuelve a meter.
  let pending = false;
  function mount() {
    pending = false;
    const center = document.querySelector('.main-nowPlayingBar-center');
    if (!center || center.contains(vfd)) return;
    // La barra de progreso puede estar anidada (Spotify 1.3 la mete dentro de
    // div[data-testid=player-controls]): se inserta en SU contenedor, justo antes.
    const bar = center.querySelector('.playback-bar') ?? center.querySelector('[data-testid="playback-progressbar"]');
    try {
      if (bar?.parentElement) bar.parentElement.insertBefore(vfd, bar);
      else center.appendChild(vfd);
      document.documentElement.classList.add('nvfd-mounted');
    } catch (err) {
      console.warn('[NEON//VFD] no se pudo meter el display:', err);
    }
  }
  new MutationObserver(() => {
    // Temporizador y no requestAnimationFrame: este se pausa si la ventana está tapada.
    if (!pending) { pending = true; setTimeout(mount, 50); }
  }).observe(document.body, { childList: true, subtree: true });
  mount();

  // Datos de la canción. Spicetify.Player.data viene vacío cuando su API está
  // roto (Spotify 1.3.3), así que se cae al estado interno de Spotify.
  function current() {
    const data = attempt(() => P().data, () => null);
    const item = data?.item ?? data?.track ?? internalState()?.item ?? internalState()?.track;
    if (!item) return null;
    const meta = item.metadata ?? {};
    return {
      uri: item.uri,
      title: item.name ?? meta.title ?? '',
      artist: item.artists?.map((a) => a.name).join(', ') || meta.artist_name || '',
    };
  }

  let shownTime = '';
  function paintTime() {
    if (!current()) return;
    const progress = sp.progress();
    const duration = sp.duration();
    const value = showRemaining && duration > 0
      ? `-${sp.formatTime(duration - progress)}`
      : sp.formatTime(progress);
    // "onprogress" llega varias veces por segundo: solo se repinta si cambió.
    if (value === shownTime) return;
    shownTime = value;
    segTime.setText(value, { align: 'right' });
  }

  const REPEAT_LABEL = ['Repetir: no', 'Repetir: toda la lista', 'Repetir: esta canción'];
  const btn = (act) => vfd.querySelector(`[data-act="${act}"]`);

  function paintFlags() {
    const playing = sp.isPlaying();
    const shuffle = sp.shuffle();
    const repeat = sp.repeat();
    flag('play', playing);
    flag('pause', !playing && !!current());
    flag('rdm', shuffle);
    flag('rpt', repeat === 1);
    flag('rpt1', repeat === 2);
    flag('mute', sp.mute());
    // Botones del display: mismo estado que los indicadores.
    btn('play').classList.toggle('is-playing', playing);
    btn('play').setAttribute('aria-label', playing ? 'Pausa' : 'Reproducir');
    btn('shuffle').setAttribute('aria-pressed', String(shuffle));
    btn('repeat').setAttribute('aria-pressed', String(repeat > 0));
    btn('repeat').dataset.mode = repeat === 2 ? 'one' : repeat === 1 ? 'all' : 'off';
    btn('repeat').setAttribute('aria-label', REPEAT_LABEL[repeat] ?? REPEAT_LABEL[0]);
    if (playing) meter.start(); else meter.stop();
  }

  // Los botones del display mandan a Spotify; el estado se repinta al momento.
  const ACTIONS = {
    shuffle: () => sp.toggleShuffle(),
    back: () => sp.back(),
    play: () => sp.togglePlay(),
    next: () => sp.next(),
    repeat: () => sp.toggleRepeat(),
  };
  vfd.querySelector('.nvfd-transport').addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    ACTIONS[act]();
    setTimeout(paintFlags, 150);
  });

  let shownUri; // la canción que el display está mostrando

  async function onSong() {
    const song = current();
    shownUri = song?.uri ?? null;
    vfd.classList.remove('nvfd-flash');
    void vfd.offsetWidth;
    vfd.classList.add('nvfd-flash');
    if (!song) {
      showMain('NO DISC');
      segTime.setText('-:--', { align: 'right' });
      shownTime = '-:--';
      return;
    }
    showMain(`${song.artist} - ${song.title}`, { scroll: true });
    paintTime();
    paintFlags();
    const ok = await meter.load(song.uri);
    vfd.classList.toggle('nvfd-no-analysis', !ok);
    if (ok) paintFlags(); // arranca el medidor ahora que hay análisis
  }

  // Avisos de Spicetify (si su API está roto, el repaso de cada segundo los cubre).
  try {
    P().addEventListener('songchange', onSong);
    P().addEventListener('onplaypause', paintFlags);
    P().addEventListener('onprogress', paintTime);
  } catch (err) {
    console.warn('[NEON//VFD] sin avisos de Spicetify.Player:', err);
  }
  // Cada segundo: aleatorio, repetir y silencio (no tienen evento propio), y si la
  // canción que suena no es la del display. Pasa al abrir Spotify: el tema carga
  // antes que la canción y "songchange" nunca llega para la primera.
  setInterval(() => {
    if ((current()?.uri ?? null) !== shownUri) onSong();
    else { paintFlags(); paintTime(); }
  }, 1000);

  vfd.querySelector('.nvfd-time').addEventListener('click', () => {
    showRemaining = !showRemaining;
    timeLabel.textContent = showRemaining ? 'REM' : 'TIME';
    paintTime();
  });

  // Menú de perfil de Spotify → "NEON//VFD · Animaciones: …" (clic para cambiar).
  try {
    const order = Object.keys(MOTION_LABEL);
    const label = () => `NEON//VFD · Animaciones: ${MOTION_LABEL[motionPref()]}`;
    const item = new Spicetify.Menu.Item(label(), false, (self) => {
      const next = order[(order.indexOf(motionPref()) + 1) % order.length];
      try { localStorage.setItem(MOTION_KEY, next); } catch { /* sin almacenamiento */ }
      self.setName(label());
      onSong();
    });
    item.register();
  } catch { /* versión sin Spicetify.Menu: se queda en "Siempre" */ }

  // Acceso para depurar desde DevTools de Spotify: neonVfd.debug().
  window.neonVfd = {
    segMain, dotMain, showMain, segTime, meter, motionPref, refresh: onSong,
    get shownUri() { return shownUri; },
    debug: () => ({
      apiSpicetifyFunciona: attempt(() => { P().isPlaying(); return true; }, () => false),
      cancionLeida: current(),
      mostrando: shownUri,
    }),
  };
  onSong();
})();

})();
