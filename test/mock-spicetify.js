// Spicetify falso para probar el tema en un navegador, sin tocar Spotify.
// Simula una canción de 3:30 que avanza, aleatorio, repetir y un análisis de
// audio con 12 tonos por fragmento.
(function () {
  const listeners = {};
  let playing = true;
  let progress = 42_000;
  const duration = 210_000;
  let shuffle = true;
  let repeat = 1;

  const songs = [
    { uri: 'spotify:track:1', name: 'Change (In the House of Flies)', artists: [{ name: 'Deftones' }] },
    { uri: 'spotify:track:2', name: 'Numb', artists: [{ name: 'Linkin Park' }] },
    { uri: 'spotify:track:3', name: '唱', artists: [{ name: 'Ado' }] },
    { uri: 'spotify:track:4', name: '도깨비불 (Illusion)', artists: [{ name: 'aespa' }] },
  ];
  let index = 0;

  const emit = (type, data) => (listeners[type] ?? []).forEach((fn) => fn({ data }));

  setInterval(() => {
    if (!playing) return;
    progress = Math.min(duration, progress + 250);
    emit('onprogress', progress);
  }, 250);

  // Análisis inventado: cada 0.25 s un fragmento con tonos y volumen que cambian.
  const segments = Array.from({ length: 900 }, (_, i) => ({
    start: i * 0.25,
    duration: 0.25,
    loudness_max: -18 + 14 * Math.sin(i / 3),
    pitches: Array.from({ length: 12 }, (_, p) => Math.abs(Math.sin(i / 2 + p * 0.7)) ** 2),
  }));

  // Como en Spotify real: el tema arranca antes de que cargue la canción, y
  // "songchange" no llega para esa primera canción.
  let loaded = false;
  setTimeout(() => { loaded = true; }, 800);

  // Estado interno de Spotify (Platform.PlayerAPI), como el real: es el que el
  // tema usa cuando Spicetify.Player truena.
  const PlayerAPI = {
    get _state() {
      if (!loaded) return null;
      return { item: songs[index], isPaused: !playing, shuffle, repeat, duration,
        positionAsOfTimestamp: progress, timestamp: Date.now(), speed: 1 };
    },
    resume() { playing = true; },
    pause() { playing = false; },
    skipToNext() { index = (index + 1) % songs.length; progress = 0; },
    skipToPrevious() { index = (index + songs.length - 1) % songs.length; progress = 0; },
    setShuffle(v) { shuffle = v; },
    setRepeat(v) { repeat = v; },
  };

  // Modo "API de Spicetify roto", como en el Spotify 1.3.3 de Pedro: todo
  // Spicetify.Player truena menos addEventListener, y data viene vacío.
  window.__breakSpicetify = () => {
    const broken = () => { throw new TypeError("Cannot read properties of undefined (reading '_state')"); };
    const old = window.Spicetify.Player;
    window.Spicetify.Player = {
      data: null,
      addEventListener: old.addEventListener,
      isPlaying: broken, getProgress: broken, getDuration: broken, getShuffle: broken, getRepeat: broken,
      togglePlay: broken, next: broken, back: broken, toggleShuffle: broken, toggleRepeat: broken,
      getMute: () => false,
    };
  };

  window.Spicetify = {
    Platform: { PlayerAPI },
    Player: {
      get data() { return loaded ? { item: songs[index], isPaused: !playing } : null; },
      togglePlay() { this._toggle(); },
      next() { this._next(); },
      back() { index = (index + songs.length - 1) % songs.length; progress = 0; emit('songchange', this.data); },
      toggleShuffle() { shuffle = !shuffle; },
      toggleRepeat() { repeat = (repeat + 1) % 3; },
      addEventListener: (type, fn) => (listeners[type] ??= []).push(fn),
      isPlaying: () => playing,
      getProgress: () => progress,
      getDuration: () => duration,
      formatTime: (ms) => {
        const s = Math.floor(ms / 1000);
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      },
      getShuffle: () => shuffle,
      getRepeat: () => repeat,
      getMute: () => false,
      // controles para las pruebas
      _toggle() { playing = !playing; emit('onplaypause', this.data); },
      _next() { index = (index + 1) % songs.length; progress = 0; emit('songchange', this.data); },
      _setShuffle(v) { shuffle = v; },
      _setRepeat(v) { repeat = v; },
    },
    getAudioData: async () => ({ segments }),
    Menu: {
      Item: class {
        constructor(name, enabled, onClick) { this.name = name; this.onClick = onClick; }
        setName(name) { this.name = name; }
        register() { window.__menuItem = this; }
      },
    },
  };
})();