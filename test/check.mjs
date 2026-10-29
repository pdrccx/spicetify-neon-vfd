// Prueba el tema en la página falsa (sin Spotify): revisa que el display se
// monte y responda, y guarda capturas en test/shots/.
// Uso: node test/check.mjs   (variable ELECTRON con la ruta a electron.exe)
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// Electron para abrir la página de prueba: variable ELECTRON, o el del reproductor de Pedro.
const electron = process.env.ELECTRON ?? 'C:/reproductor/node_modules/electron/dist/electron.exe';
// Puerto al azar: si una corrida anterior aún está cerrando, no choca con ella.
const PORT = 9400 + Math.floor(Math.random() * 500);
const shots = path.join(here, 'shots');
mkdirSync(shots, { recursive: true });

const app = spawn(electron, [path.join(here, 'electron-main.cjs'), `--remote-debugging-port=${PORT}`], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let page;
  for (let i = 0; i < 50 && !page; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page'); } catch {}
    await sleep(200);
  }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let next = 0;
  const errors = [];
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++next;
    const on = (e) => {
      const m = JSON.parse(e.data);
      if (m.id === id) { ws.removeEventListener('message', on); resolve(m.result); }
    };
    ws.addEventListener('message', on);
    ws.send(JSON.stringify({ id, method, params }));
  });
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description);
    return r.result.value;
  };
  const shot = async (name) => {
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(shots, `${name}.png`), Buffer.from(data, 'base64'));
  };
  const check = async (label, fn) => { await fn(); console.log('  ok ', label); };

  await send('Runtime.enable');
  await send('Page.reload');
  await sleep(2500);

  console.log('Tema NEON//VFD (página falsa)');
  await check('el display se mete en la barra, antes del progreso', async () => {
    assert.equal(await evaluate("document.querySelector('.main-nowPlayingBar-center .nvfd + .playback-bar') !== null"), true);
  });
  await check('detecta la canción aunque "songchange" no llegue al abrir', async () => {
    assert.equal(await evaluate('neonVfd.shownUri'), 'spotify:track:1');
  });
  await check('controles de Spotify ocultos; los del display sí están', async () => {
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-testid=general-controls]')).display"), 'none');
    assert.equal(await evaluate("document.querySelectorAll('.nvfd [data-act]').length"), 5);
  });
  await check('botones del display: play pausa, aleatorio y repetir cambian', async () => {
    const state = () => evaluate(`[Spicetify.Player.isPlaying(), Spicetify.Player.getShuffle(), Spicetify.Player.getRepeat(),
      document.querySelector('[data-act=play]').getAttribute('aria-label'),
      document.querySelector('[data-act=shuffle]').getAttribute('aria-pressed'),
      document.querySelector('[data-act=repeat]').dataset.mode]`);
    assert.deepEqual(await state(), [true, true, 1, 'Pausa', 'true', 'all']);
    await evaluate("['play', 'shuffle', 'repeat'].forEach((a) => document.querySelector(`[data-act=${a}]`).click())");
    await sleep(1200); // repintado: al clic (150 ms) y repaso de cada segundo
    assert.deepEqual(await state(), [false, false, 2, 'Reproducir', 'false', 'one']);
    // regresa al estado original para las pruebas que siguen
    await evaluate("['play', 'shuffle', 'repeat', 'repeat'].forEach((a) => document.querySelector(`[data-act=${a}]`).click())");
    await sleep(1200); // repintado: al clic (150 ms) y repaso de cada segundo
    assert.deepEqual(await state(), [true, true, 1, 'Pausa', 'true', 'all']);
  });
  await check('muestra artista y título en 16 segmentos', async () => {
    assert.ok(await evaluate("document.querySelectorAll('[data-host=main] .seg.on').length") > 40);
  });
  await check('indicadores: PLAY, RDM y RPT encendidos', async () => {
    const on = await evaluate("[...document.querySelectorAll('.nvfd-flag.on')].map((f) => f.dataset.flag).join()");
    assert.equal(on, 'play,rdm,rpt');
  });
  await check('el medidor se mueve con el análisis de la canción', async () => {
    assert.equal(await evaluate("document.querySelector('.nvfd').classList.contains('nvfd-no-analysis')"), false);
  });
  await check('los tiempos originales de Spotify se ocultan', async () => {
    assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-testid=playback-position]')).visibility"), 'hidden');
  });
  await shot('playing');

  await check('pausa: se apaga PLAY y se enciende PAUSE', async () => {
    await evaluate('Spicetify.Player._toggle()');
    await sleep(200);
    const on = await evaluate("[...document.querySelectorAll('.nvfd-flag.on')].map((f) => f.dataset.flag).join()");
    assert.equal(on, 'pause,rdm,rpt');
    await evaluate('Spicetify.Player._toggle()');
  });
  await check('Spotify redibuja la barra: el display vuelve a aparecer', async () => {
    await evaluate("document.querySelector('.nvfd').remove()");
    await sleep(300);
    assert.equal(await evaluate("!!document.querySelector('.main-nowPlayingBar-center .nvfd')"), true);
  });
  await check('cambio de canción y tiempo restante', async () => {
    await evaluate("Spicetify.Player._next(); document.querySelector('.nvfd-time').click()");
    await sleep(600);
    assert.equal(await evaluate("document.querySelector('.nvfd-label').textContent"), 'REM');
  });
  await check('menú de perfil cambia el modo de animaciones', async () => {
    await evaluate('window.__menuItem.onClick(window.__menuItem)');
    assert.match(await evaluate('window.__menuItem.name'), /Animaciones: Seguir a Windows/);
    await evaluate("localStorage.setItem('neonvfd.motion', 'on'); neonVfd.refresh()");
  });
  await sleep(1500);
  await shot('next-song');

  const mode = () => evaluate("document.querySelector('.nvfd').dataset.mode");
  const litDots = () => evaluate('neonVfd.dotMain.litDots()');
  await check('kanji (Ado - 唱): cambia a matriz de puntos', async () => {
    await evaluate('Spicetify.Player._next()');
    await sleep(500);
    assert.equal(await mode(), 'dots');
    assert.ok(await litDots() > 40);
    assert.equal(await evaluate("document.querySelector('[data-host=main]').hidden"), true);
  });
  await shot('kanji');
  await check('hangul (aespa - 도깨비불): sigue en matriz de puntos', async () => {
    await evaluate('Spicetify.Player._next()');
    await sleep(500);
    assert.equal(await mode(), 'dots');
  });
  await shot('hangul');
  await check('de vuelta a alfabeto latino: 16 segmentos', async () => {
    await evaluate('Spicetify.Player._next()');
    await sleep(500);
    assert.equal(await mode(), 'segments');
    assert.equal(await evaluate("document.querySelector('[data-host=dots]').hidden"), true);
  });

  await check('con el API de Spicetify roto (Spotify 1.3.3) todo sigue funcionando', async () => {
    await evaluate('window.__breakSpicetify(); neonVfd.refresh()');
    assert.equal((await evaluate('neonVfd.debug()')).apiSpicetifyFunciona, false);
    await sleep(1300);
    const d = await evaluate('neonVfd.debug()');
    assert.ok(d.cancionLeida?.title, 'no leyó la canción');
    assert.equal(await evaluate("document.querySelector('[data-flag=play]').classList.contains('on')"), true, 'PLAY apagado');
    assert.ok(await evaluate("document.querySelectorAll('[data-host=time] .seg.on').length") > 5, 'sin tiempo');
    await evaluate("document.querySelector('[data-act=play]').click()");
    await sleep(1300);
    assert.equal(await evaluate("document.querySelector('[data-flag=pause]').classList.contains('on')"), true, 'el botón no pausó');
    await evaluate("document.querySelector('[data-act=play]').click()");
  });

  assert.deepEqual(errors, [], `errores en la página: ${errors.join('\n')}`);
  console.log('  ok  sin errores en la página\n\nCapturas en', shots);
  ws.close();
} finally {
  app.kill();
}
