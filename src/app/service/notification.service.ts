import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private messageService = inject(MessageService);

  showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }

  showInfo(detail: string): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }

  showError(detail: string, summary?: string): void {
    console.log('notification error:', detail);
    this.messageService.add({
      severity: 'error',
      detail,
      summary: summary ? summary : 'Error',
      life: 8000,
      key: 'notification-toaster'
    });
  }

  showWarning(detail: string,summary:string = 'Warning'): void {
    this.messageService.add({
      severity: 'warn',
      summary: summary,
      detail,
      life: 5000,
      key: 'notification-toaster'
    });
  }
}
