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

import { motionAllowed } from './motion.js';

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
export function hasSegmentGlyph(text) {
  return [...normalize(text)].every((c) => c === ' ' || c === '.' || c === ':' || c in GLYPHS);
}

export function toCells(text) {
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
export function createSegmentDisplay(container, { size = 16, stepMs = 320, pauseMs = 1600 } = {}) {
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
