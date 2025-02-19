const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the frontend build files
  mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  // Start the backend server
  exec('node dist/backend/server.js', (err, stdout, stderr) => {
    if (err) {
      console.error('Failed to start server:', err);
      return;
    }
    console.log('Server started:', stdout);
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
