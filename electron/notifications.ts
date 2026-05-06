/**
 * NOTIFICATION MANAGER
 * Handles desktop notifications
 */

import { Notification } from 'electron';

export class NotificationManager {
  /**
   * Show notification
   */
  show(title: string, options?: { body?: string; icon?: string; tag?: string }) {
    if (!Notification.isSupported()) {
      console.warn('Notifications not supported on this platform');
      return;
    }

    const notification = new Notification({
      title,
      body: options?.body,
      icon: options?.icon,
      tag: options?.tag,
    });

    notification.show();
    return notification;
  }

  /**
   * Show sync notification
   */
  showSyncNotification(status: 'syncing' | 'completed' | 'failed', details?: string) {
    const titles = {
      syncing: 'Sincronizando dados...',
      completed: 'Sincronização concluída',
      failed: 'Erro na sincronização',
    };

    const bodies = {
      syncing: 'Seus dados estão sendo sincronizados com o servidor',
      completed: `Seus dados foram sincronizados com sucesso${details ? `: ${details}` : ''}`,
      failed: `Falha ao sincronizar dados${details ? `: ${details}` : ''}`,
    };

    return this.show(titles[status], { body: bodies[status] });
  }

  /**
   * Show update notification
   */
  showUpdateNotification(version: string) {
    return this.show('Atualização Disponível', {
      body: `Nova versão ${version} está disponível. Clique para atualizar.`,
      tag: 'update-notification',
    });
  }

  /**
   * Show error notification
   */
  showError(message: string, details?: string) {
    return this.show('Erro', {
      body: `${message}${details ? `: ${details}` : ''}`,
      tag: 'error-notification',
    });
  }

  /**
   * Show success notification
   */
  showSuccess(message: string, details?: string) {
    return this.show('Sucesso', {
      body: `${message}${details ? `: ${details}` : ''}`,
      tag: 'success-notification',
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, details?: string) {
    return this.show('Aviso', {
      body: `${message}${details ? `: ${details}` : ''}`,
      tag: 'warning-notification',
    });
  }

  /**
   * Show calculation complete notification
   */
  showCalculationComplete(calculationType: string, resultSummary?: string) {
    return this.show('Cálculo Concluído', {
      body: `${calculationType} foi calculado com sucesso${resultSummary ? `: ${resultSummary}` : ''}`,
      tag: 'calculation-complete',
    });
  }

  /**
   * Show project saved notification
   */
  showProjectSaved(projectName: string) {
    return this.show('Projeto Salvo', {
      body: `Projeto "${projectName}" foi salvo com sucesso`,
      tag: 'project-saved',
    });
  }

  /**
   * Show offline mode notification
   */
  showOfflineMode(isOffline: boolean) {
    if (isOffline) {
      return this.show('Modo Offline', {
        body: 'Você está em modo offline. Os dados serão sincronizados quando conectado.',
        tag: 'offline-mode',
      });
    } else {
      return this.show('Conexão Restaurada', {
        body: 'Você está online novamente. Iniciando sincronização...',
        tag: 'online-mode',
      });
    }
  }
}
