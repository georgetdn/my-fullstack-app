const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      console.log(`Sending IPC message on channel: ${channel}`);
      ipcRenderer.send(channel, data);
    },
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
  }
});
