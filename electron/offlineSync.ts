/**
 * OFFLINE SYNC ENGINE
 * Manages synchronization between local SQLite and remote server
 */

import { DatabaseManager } from './database';
import * as fetch from 'node-fetch';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  syncedItems: number;
  errors: string[];
}

export class OfflineSync {
  private db: DatabaseManager;
  private syncInterval: NodeJS.Timeout | null = null;
  private status: SyncStatus = {
    isOnline: navigator?.onLine ?? true,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    syncedItems: 0,
    errors: [],
  };

  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

  constructor(db: DatabaseManager) {
    this.db = db;
    this.setupNetworkListeners();
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.status.isOnline = true;
        this.forceSync();
      });

      window.addEventListener('offline', () => {
        this.status.isOnline = false;
      });
    }
  }

  /**
   * Start automatic sync
   */
  async startSync() {
    this.syncInterval = setInterval(() => {
      if (this.status.isOnline && !this.status.isSyncing) {
        this.performSync();
      }
    }, this.SYNC_INTERVAL);

    // Initial sync
    if (this.status.isOnline) {
      await this.performSync();
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync() {
    if (this.status.isSyncing) return;
    return this.performSync();
  }

  /**
   * Perform synchronization
   */
  private async performSync() {
    if (!this.status.isOnline) return;

    this.status.isSyncing = true;
    this.status.errors = [];

    try {
      // Get pending items from local database
      const pendingItems = await this.db.getPendingSync();
      this.status.pendingItems = pendingItems.length;

      if (pendingItems.length === 0) {
        this.status.isSyncing = false;
        return;
      }

      // Sync each item
      let syncedCount = 0;
      for (const item of pendingItems) {
        try {
          const result = await this.syncItem(item);
          if (result) {
            await this.db.markAsSynced(item.id);
            syncedCount++;
          }
        } catch (error) {
          this.status.errors.push(`Erro ao sincronizar ${item.type}: ${error}`);
        }
      }

      this.status.syncedItems = syncedCount;
      this.status.lastSyncTime = new Date();
    } catch (error) {
      this.status.errors.push(`Erro geral de sincronização: ${error}`);
    } finally {
      this.status.isSyncing = false;
    }
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: any): Promise<boolean> {
    const endpoint = `${this.API_BASE_URL}/sync/${item.type}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.db.getAuthToken()}`,
      },
      body: JSON.stringify(item.data),
    });

    return response.ok;
  }

  /**
   * Final sync before app closes
   */
  async finalSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    if (this.status.isOnline) {
      await this.performSync();
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Get sync statistics
   */
  async getStatistics() {
    const totalCalculations = await this.db.getTotalCalculations();
    const totalProjects = await this.db.getTotalProjects();
    const storageSizeGB = await this.db.getStorageSize();

    return {
      totalCalculations,
      totalProjects,
      storageSizeGB,
      pendingSync: this.status.pendingItems,
      lastSync: this.status.lastSyncTime,
      isOnline: this.status.isOnline,
    };
  }

  /**
   * Resolve sync conflicts
   */
  async resolveConflict(itemId: string, resolution: 'local' | 'remote') {
    return this.db.resolveConflict(itemId, resolution);
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue() {
    return this.db.clearSyncQueue();
  }
}
