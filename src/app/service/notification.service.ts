import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly messageService = inject(MessageService);

  showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }

  showInfo(detail: string, summary?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: summary ?? 'Info',
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }

  showError(detail: string, summary?: string): void {
    console.error('notification error:', detail);
    this.messageService.add({
      severity: 'error',
      detail,
      summary: summary ?? 'Error',
      life: 8000,
      key: 'notification-toaster'
    });
  }

  showWarning(detail: string, summary = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }
}
