const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('overlayAPI', {
  getFavorites: () => ipcRenderer.invoke('get-favorites'),
  toggleFavorite: (uniqueName) => ipcRenderer.invoke('toggle-favorite', uniqueName),
  closeOverlay: () => ipcRenderer.send('close-overlay'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onClickThroughChanged: (callback) => {
    ipcRenderer.on('click-through-changed', (_event, value) => callback(value));
  },
});
