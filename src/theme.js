// NEON//VFD para Spotify: mete un display de autoestéreo (16 segmentos) en la
// barra de reproducción. build.mjs pega aquí arriba el motor de glifos
// (segment16.js) y envuelve todo en una función para no ensuciar el global.

/* @@SEGMENT16@@ */

/* @@DOTMATRIX@@ */

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
