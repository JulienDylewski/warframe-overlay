const { app, BrowserWindow, globalShortcut, ipcMain, screen, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

let overlayWindow = null;
let clickThrough = false;

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width: 420,
    height: 560,
    x: width - 440,
    y: 40,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Reste au-dessus meme des jeux en plein ecran fenetre (borderless) sur la plupart des setups
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  overlayWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Decommente pour debug :
  // overlayWindow.webContents.openDevTools({ mode: 'detach' });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function toggleOverlay() {
  if (!overlayWindow) return;
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    overlayWindow.show();
  }
}

function toggleClickThrough() {
  if (!overlayWindow) return;
  clickThrough = !clickThrough;
  overlayWindow.setIgnoreMouseEvents(clickThrough, { forward: true });
  overlayWindow.webContents.send('click-through-changed', clickThrough);
}

app.whenReady().then(() => {
  createOverlayWindow();

  // Raccourcis globaux : fonctionnent meme quand le jeu a le focus
  globalShortcut.register('Control+Shift+O', toggleOverlay);
  globalShortcut.register('Control+Shift+L', toggleClickThrough);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createOverlayWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// --- IPC : recherche d'items, favoris, position fenetre ---

ipcMain.handle('get-favorites', () => {
  return store.get('favorites', []);
});

ipcMain.handle('toggle-favorite', (event, uniqueName) => {
  const favorites = store.get('favorites', []);
  const idx = favorites.indexOf(uniqueName);
  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(uniqueName);
  }
  store.set('favorites', favorites);
  return favorites;
});

ipcMain.on('close-overlay', () => {
  if (overlayWindow) overlayWindow.hide();
});

ipcMain.on('open-external', (event, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    shell.openExternal(url);
  }
});
