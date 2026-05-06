/**
 * DATABASE MANAGER
 * SQLite database for offline data storage
 */

import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { app } from 'electron';

export class DatabaseManager {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'baluarte-engineering.db');
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    const tables = [
      `CREATE TABLE IF NOT EXISTS calculations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        data JSON NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        data JSON NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        data JSON NOT NULL,
        lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        itemId TEXT NOT NULL,
        data JSON NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        synced BOOLEAN DEFAULT 0
      )`,

      `CREATE TABLE IF NOT EXISTS offline_cache (
        key TEXT PRIMARY KEY,
        data JSON NOT NULL,
        expiresAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS user_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS sync_conflicts (
        id TEXT PRIMARY KEY,
        itemId TEXT NOT NULL,
        localData JSON NOT NULL,
        remoteData JSON NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved BOOLEAN DEFAULT 0
      )`,
    ];

    for (const table of tables) {
      await this.run(table);
    }
  }

  /**
   * Execute SQL query
   */
  async query(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db?.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Execute SQL run command
   */
  async run(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db?.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingSync(): Promise<any[]> {
    return this.query('SELECT * FROM sync_queue WHERE synced = 0 ORDER BY createdAt ASC');
  }

  /**
   * Mark item as synced
   */
  async markAsSynced(itemId: string): Promise<void> {
    await this.run('UPDATE sync_queue SET synced = 1 WHERE id = ?', [itemId]);
  }

  /**
   * Save calculation offline
   */
  async saveCalculationOffline(data: any): Promise<string> {
    const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.run(
      'INSERT INTO calculations (id, type, data, synced) VALUES (?, ?, ?, 0)',
      [id, data.type, JSON.stringify(data)]
    );
    return id;
  }

  /**
   * Get calculation history
   */
  async getCalculationHistory(limit: number = 100): Promise<any[]> {
    return this.query(
      'SELECT * FROM calculations ORDER BY createdAt DESC LIMIT ?',
      [limit]
    );
  }

  /**
   * Get offline data by type
   */
  async getOfflineData(type: string): Promise<any[]> {
    return this.query('SELECT * FROM materials WHERE category = ? ORDER BY name ASC', [type]);
  }

  /**
   * Get total calculations
   */
  async getTotalCalculations(): Promise<number> {
    const result = await this.query('SELECT COUNT(*) as count FROM calculations');
    return result[0]?.count || 0;
  }

  /**
   * Get total projects
   */
  async getTotalProjects(): Promise<number> {
    const result = await this.query('SELECT COUNT(*) as count FROM projects');
    return result[0]?.count || 0;
  }

  /**
   * Get storage size in GB
   */
  async getStorageSize(): Promise<number> {
    const fs = require('fs').promises;
    const stats = await fs.stat(this.dbPath);
    return stats.size / (1024 * 1024 * 1024); // Convert to GB
  }

  /**
   * Get auth token
   */
  async getAuthToken(): Promise<string> {
    const result = await this.query(
      'SELECT value FROM user_settings WHERE key = ?',
      ['auth_token']
    );
    return result[0]?.value || '';
  }

  /**
   * Save user setting
   */
  async saveSetting(key: string, value: string): Promise<void> {
    await this.run(
      'INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(itemId: string, resolution: 'local' | 'remote'): Promise<void> {
    await this.run(
      'UPDATE sync_conflicts SET resolved = 1 WHERE itemId = ?',
      [itemId]
    );
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    await this.run('DELETE FROM sync_queue WHERE synced = 1');
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db?.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
