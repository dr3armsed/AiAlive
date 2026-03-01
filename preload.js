const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process (the web app)
// to securely communicate with the main process for file system operations.
contextBridge.exposeInMainWorld('electronAPI', {
  // Options
  getOptions: () => ipcRenderer.invoke('get-options'),
  saveOptions: (options) => ipcRenderer.invoke('save-options', options),
  
  // Save/Load
  getSaveSlots: () => ipcRenderer.invoke('get-save-slots'),
  loadFromSlot: (id) => ipcRenderer.invoke('load-from-slot', id),
  createNewSave: (state, name) => ipcRenderer.invoke('create-new-save', { state, name }),
  overwriteSave: (id, state) => ipcRenderer.invoke('overwrite-save', { id, state }),
  renameSave: (id, newName) => ipcRenderer.invoke('rename-save', { id, newName }),
  deleteSave: (id) => ipcRenderer.invoke('delete-save', id),
  
  // Users
  getUsers: () => ipcRenderer.invoke('get-users'),
  saveUsers: (users) => ipcRenderer.invoke('save-users', users),
  
  // Spectre State
  getSpectreState: () => ipcRenderer.invoke('get-spectre-state'),
  saveSpectreState: (state) => ipcRenderer.invoke('save-spectre-state', state)
});

console.log('Metacosm Preload Script successfully loaded with File System API.');