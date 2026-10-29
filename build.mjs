// Arma el tema en NeonVFD/ a partir de src/:
//   color.ini → se copia
//   user.css  → se le incrustan las fuentes (base64) para que funcionen sin internet
//   theme.js  → se le pegan el motor de 16 segmentos y la matriz de puntos, y se envuelve en una función
// Uso: node build.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = (f) => path.join(root, 'src', f);
const out = path.join(root, 'NeonVFD');
mkdirSync(out, { recursive: true });

// Fuentes: van en fonts/ (licencia OFL, ver fonts/LICENSE-*.txt).
const FONT_DIR = path.join(root, 'fonts');
const FONTS = [
  ['Orbitron', 'orbitron', 500], ['Orbitron', 'orbitron', 700],
  ['Inter', 'inter', 400], ['Inter', 'inter', 600],
  ['JetBrains Mono', 'jetbrains-mono', 400],
];

function fontFaces() {
  return FONTS.map(([family, pkg, weight]) => {
    const file = path.join(FONT_DIR, `${pkg}-latin-${weight}-normal.woff2`);
    if (!existsSync(file)) throw new Error(`Falta la fuente ${file}`);
    const data = readFileSync(file).toString('base64');
    return `@font-face { font-family: "${family}"; font-style: normal; font-weight: ${weight}; font-display: swap; ` +
      `src: url(data:font/woff2;base64,${data}) format("woff2"); }`;
  }).join('\n');
}

// color.ini
writeFileSync(path.join(out, 'color.ini'), readFileSync(src('color.ini')));

// user.css
const css = readFileSync(src('user.css'), 'utf8').replace('/* @@FONTS@@ */', () => fontFaces());
writeFileSync(path.join(out, 'user.css'), css);

// theme.js
const engine = readFileSync(src('segment16.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '');
const dots = readFileSync(src('dotmatrix.js'), 'utf8')
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '');
// Reemplazo con función: si no, "$'" dentro del código se toma como patrón especial.
const theme = readFileSync(src('theme.js'), 'utf8')
  .replace('/* @@SEGMENT16@@ */', () => engine)
  .replace('/* @@DOTMATRIX@@ */', () => dots);
writeFileSync(path.join(out, 'theme.js'), `// Generado por build.mjs — editar src/, no este archivo.\n(function neonVfd() {\n'use strict';\n${theme}\n})();\n`);

const kb = (f) => (readFileSync(path.join(out, f)).length / 1024).toFixed(0);
console.log(`Tema listo en ${out}: user.css ${kb('user.css')} KB, theme.js ${kb('theme.js')} KB`);
