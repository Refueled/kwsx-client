const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

// Quit right away when the Windows Squirrel installer/uninstaller runs us.
if (require('electron-squirrel-startup')) {
  app.quit();
}

// Must match the AppUserModelID used by the Windows installer so that taskbar
// pinning and notifications associate with this app.
const APP_ID = 'com.sharp.kwsx-client';

// The only origin the window may navigate to. Anything else is handed off to the
// user's default browser.
const STATION_ORIGIN = 'https://radio.cock.institute';

// Windows wants an .ico for window/taskbar icons, everything else a .png.
const WINDOW_ICON = path.join(
  __dirname,
  'assets',
  process.platform === 'win32' ? 'favicon.ico' : 'favicon.png'
);

let mainWindow = null;

// Compare origins rather than using a prefix match, which would also accept
// look-alike hosts such as https://radio.cock.institute.example.com.
function isStationUrl(rawUrl) {
  try {
    return new URL(rawUrl).origin === STATION_ORIGIN;
  } catch {
    return false;
  }
}

function openExternally(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return;
  }

  if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
    shell.openExternal(rawUrl);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#000000',
    icon: WINDOW_ICON,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Show the splash screen, which fades into the remote player.
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));

  const { webContents } = mainWindow;

  // Keep the window pinned to the station. Page-initiated navigation to any
  // other origin is cancelled and opened in the default browser instead.
  webContents.on('will-navigate', (event, url) => {
    if (isStationUrl(url)) {
      return;
    }

    event.preventDefault();
    openExternally(url);
  });

  // Same for anything that asks for a new window (target="_blank", window.open).
  webContents.setWindowOpenHandler(({ url }) => {
    openExternally(url);

    return { action: 'deny' };
  });
}

// Only ever run a single instance; a second launch focuses the existing window
// rather than starting a second audio stream.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.setAppUserModelId(APP_ID);

  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
      return;
    }

    // The window is gone (or never finished opening): bring up a fresh one.
    if (app.isReady()) {
      createWindow();
    }
  });

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
}
