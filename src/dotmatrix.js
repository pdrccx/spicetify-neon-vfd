// Copia de C:\reproductor\renderer\js\dotmatrix.js.
// build.mjs le quita import/export para meterlo en theme.js.
// Display de matriz de puntos, como los estéreos japoneses de gama alta: un
// display de 16 segmentos solo sabe dibujar el alfabeto latino, así que para
// kanji, kana, hangul y demás escrituras se usa una rejilla de puntos.
//
// Truco: se escribe el texto con una fuente de Windows que ya trae esas
// escrituras, a la altura del display en píxeles, y cada píxel se vuelve un
// punto encendido o apagado. Funciona con cualquier idioma.
import { motionAllowed } from './motion.js';
import { hasSegmentGlyph } from './segment16.js';

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
export const needsDotMatrix = (text) =>
  [...String(text ?? '')].some((ch) => NON_LATIN.test(ch) && !hasSegmentGlyph(ch));

/**
 * Convierte texto en un mapa de bits de `rows` puntos de alto.
 * Devuelve { width, rows, bits } donde bits[y * width + x] es 1 si el punto va encendido.
 */
export function rasterize(text, rows) {
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
export function createDotMatrixDisplay(host, { rows = 14, stepMs = 45, pauseMs = 1600 } = {}) {
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
