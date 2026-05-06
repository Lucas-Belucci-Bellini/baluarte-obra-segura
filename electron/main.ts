/**
 * BALUARTE ENGINEERING HUB - ELECTRON MAIN PROCESS
 * Desktop application with offline sync capabilities
 */

import { app, BrowserWindow, Menu, ipcMain, Tray, nativeImage } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { OfflineSync } from './offlineSync';
import { DatabaseManager } from './database';
import { UpdateManager } from './updateManager';
import { NotificationManager } from './notifications';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let offlineSync: OfflineSync;
let db: DatabaseManager;
let updateManager: UpdateManager;
let notificationManager: NotificationManager;

/**
 * Create main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.ts'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

/**
 * Create tray icon
 */
function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      },
    },
    {
      label: 'Status de Sincronização',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('show-sync-status');
        }
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Configurações',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('open-settings');
        }
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Sair',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
}

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    // Initialize database
    db = new DatabaseManager();
    await db.initialize();

    // Initialize offline sync
    offlineSync = new OfflineSync(db);
    await offlineSync.startSync();

    // Initialize update manager
    updateManager = new UpdateManager();
    updateManager.checkForUpdates();

    // Initialize notification manager
    notificationManager = new NotificationManager();

    // Setup IPC handlers
    setupIpcHandlers();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    notificationManager?.showError('Erro ao inicializar aplicação');
  }
}

/**
 * Setup IPC handlers for renderer process communication
 */
function setupIpcHandlers() {
  // Sync status
  ipcMain.handle('get-sync-status', async () => {
    return offlineSync.getStatus();
  });

  // Manual sync trigger
  ipcMain.handle('trigger-sync', async () => {
    return offlineSync.forceSync();
  });

  // Database queries
  ipcMain.handle('db-query', async (event, query: string, params: any[]) => {
    return db.query(query, params);
  });

  // Get offline data
  ipcMain.handle('get-offline-data', async (event, type: string) => {
    return db.getOfflineData(type);
  });

  // Save calculation offline
  ipcMain.handle('save-calculation-offline', async (event, data: any) => {
    return db.saveCalculationOffline(data);
  });

  // Get calculation history
  ipcMain.handle('get-calculation-history', async () => {
    return db.getCalculationHistory();
  });

  // Check for updates
  ipcMain.handle('check-for-updates', async () => {
    return updateManager.checkForUpdates();
  });

  // Get app version
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // Get sync statistics
  ipcMain.handle('get-sync-stats', async () => {
    return offlineSync.getStatistics();
  });

  // Notification handlers
  ipcMain.handle('show-notification', (event, title: string, options: any) => {
    notificationManager.show(title, options);
  });
}

/**
 * App event handlers
 */
app.on('ready', async () => {
  await initializeApp();
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', async () => {
  // Perform final sync before quitting
  await offlineSync.finalSync();
});

// Allow only one instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

export { mainWindow, tray, offlineSync, db, updateManager, notificationManager };
