/**
 * PRELOAD SCRIPT
 * Secure bridge between main and renderer processes
 */

import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  /**
   * Sync operations
   */
  sync: {
    getStatus: () => ipcRenderer.invoke('get-sync-status'),
    triggerSync: () => ipcRenderer.invoke('trigger-sync'),
    getStats: () => ipcRenderer.invoke('get-sync-stats'),
  },

  /**
   * Database operations
   */
  database: {
    query: (sql: string, params?: any[]) =>
      ipcRenderer.invoke('db-query', sql, params || []),
    getOfflineData: (type: string) =>
      ipcRenderer.invoke('get-offline-data', type),
    saveCalculation: (data: any) =>
      ipcRenderer.invoke('save-calculation-offline', data),
    getHistory: () =>
      ipcRenderer.invoke('get-calculation-history'),
  },

  /**
   * Update operations
   */
  updates: {
    checkForUpdates: () =>
      ipcRenderer.invoke('check-for-updates'),
    getVersion: () =>
      ipcRenderer.invoke('get-app-version'),
  },

  /**
   * Notification operations
   */
  notifications: {
    show: (title: string, options?: any) =>
      ipcRenderer.invoke('show-notification', title, options),
  },

  /**
   * Event listeners
   */
  on: {
    syncStatusChanged: (callback: (status: any) => void) =>
      ipcRenderer.on('sync-status-changed', (event, status) => callback(status)),
    showSyncStatus: (callback: () => void) =>
      ipcRenderer.on('show-sync-status', callback),
    openSettings: (callback: () => void) =>
      ipcRenderer.on('open-settings', callback),
  },

  /**
   * Remove event listeners
   */
  off: {
    syncStatusChanged: () =>
      ipcRenderer.removeAllListeners('sync-status-changed'),
    showSyncStatus: () =>
      ipcRenderer.removeAllListeners('show-sync-status'),
    openSettings: () =>
      ipcRenderer.removeAllListeners('open-settings'),
  },
};

// Expose API to renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
