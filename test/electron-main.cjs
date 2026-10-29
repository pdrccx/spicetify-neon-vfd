// Abre test/mock.html en una ventana de Electron (solo para probar el tema).
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1280, height: 720, backgroundColor: '#0a0a0d',
    // Si la ventana de prueba queda tapada, Chromium frena sus temporizadores y
    // las pruebas de tiempos fallan al azar. Solo para esta ventana de prueba.
    webPreferences: { backgroundThrottling: false },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'mock.html'));
});
app.on('window-all-closed', () => app.quit());
