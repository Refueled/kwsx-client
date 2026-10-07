const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  let win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1500,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Use preload script
      contextIsolation: true, // Enable context isolation
      nodeIntegration: false // Disable node integration
    },
    frame: true, // Use the native frame
    transparent: false, // Disable window transparency
    resizable: true, // Allow window resizing
    backgroundColor: '#000000' // Set the background color to black
  });

  win.loadFile('loading.html'); // Load your external website
  win.setIcon(path.join(__dirname, 'assets', 'favicon.ico'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.minimize();
});

ipcMain.on('maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window.isMaximized()) {
    window.unmaximize();
  } else {
    window.maximize();
  }
});

ipcMain.on('close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.close();
});