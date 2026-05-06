/**
 * UPDATE MANAGER
 * Handles auto-updates for Electron app
 */

import { app, dialog } from 'electron';

export class UpdateManager {
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly UPDATE_URL = process.env.REACT_APP_UPDATE_URL || 'https://api.baluarte.com/updates';

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion?: string;
  }> {
    try {
      const currentVersion = app.getVersion();

      const response = await fetch(`${this.UPDATE_URL}/latest`);
      const data = (await response.json()) as any;

      const updateAvailable = this.compareVersions(currentVersion, data.version) < 0;

      return {
        updateAvailable,
        currentVersion,
        latestVersion: data.version,
      };
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        updateAvailable: false,
        currentVersion: app.getVersion(),
      };
    }
  }

  /**
   * Start periodic update checks
   */
  startPeriodicChecks() {
    this.updateCheckInterval = setInterval(() => {
      this.checkForUpdates().then((result) => {
        if (result.updateAvailable) {
          this.promptUserForUpdate(result.latestVersion || '');
        }
      });
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop periodic checks
   */
  stopPeriodicChecks() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }

  /**
   * Prompt user for update
   */
  private async promptUserForUpdate(latestVersion: string) {
    const result = await dialog.showMessageBox({
      type: 'info',
      title: 'Atualização Disponível',
      message: `Nova versão ${latestVersion} disponível`,
      detail: 'Deseja baixar e instalar a atualização agora?',
      buttons: ['Atualizar', 'Depois', 'Nunca'],
    });

    if (result.response === 0) {
      this.downloadAndInstallUpdate();
    } else if (result.response === 2) {
      this.disableUpdates();
    }
  }

  /**
   * Download and install update
   */
  private async downloadAndInstallUpdate() {
    try {
      const response = await fetch(`${this.UPDATE_URL}/download`);
      const buffer = await response.arrayBuffer();

      // Save update file
      const fs = require('fs').promises;
      const updatePath = require('path').join(
        require('electron').app.getPath('temp'),
        'baluarte-update.exe'
      );

      await fs.writeFile(updatePath, Buffer.from(buffer));

      // Execute update
      require('child_process').exec(updatePath);
    } catch (error) {
      console.error('Failed to download update:', error);
      dialog.showErrorBox('Erro', 'Falha ao baixar atualização');
    }
  }

  /**
   * Disable updates
   */
  private disableUpdates() {
    const store = require('electron-store');
    const config = new store();
    config.set('disableUpdates', true);
  }

  /**
   * Compare semantic versions
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  }
}
