const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
const blockedDomains = [
  'effectivegatecpm.com',
  'adsterra.com',
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com/tr',
  'ads.',
  'ad.',
  'tracking.',
  'analytics.',
  'pixel.',
  'beacon.'
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'build/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      partition: 'persist:browserh'
    }
  });

  mainWindow.loadFile('index.html');

  // Block ads, trackers, and cookies
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const isBlocked = blockedDomains.some(domain => 
      details.url.includes(domain)
    );
    callback({ cancel: isBlocked });
  });

  // Block third-party cookies
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const headers = details.responseHeaders || {};
    delete headers['set-cookie'];
    callback({ responseHeaders: headers });
  });

  // Anti-fingerprinting
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const deniedPermissions = ['media', 'geolocation', 'notifications', 'midi', 'midiSysex'];
    callback(!deniedPermissions.includes(permission));
  });
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
