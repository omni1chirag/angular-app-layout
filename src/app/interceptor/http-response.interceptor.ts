import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from '@service/keycloak.service';
import { MultiLangService } from '@service/multi-lang.service';
import { NotificationService } from '@service/notification.service';
import { tap, catchError, throwError } from 'rxjs';

export const HttpResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const langService = inject(MultiLangService);
  const keycloak = inject(KeycloakService);
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.body) {
        const localizedKey = event.body['localizedKey'];
        if (localizedKey) {
          langService.getTranslateMsgFromKey(localizedKey).then((msg) => {
            if (msg) {
              notifications.showSuccess(msg);
            }
          });
        }
      }
    }),
    // Error responses
    catchError((error: HttpErrorResponse) => {
      const defaultErrorMessage = 'An unexpected error occurred';
      let localizedKey: string | null = null;
      let fallbackMessage: string = defaultErrorMessage;

      // Try to extract key and message
      try {
        if (error.error && typeof error.error === 'object') {
          localizedKey = error.error.localizedKey ?? null;
          fallbackMessage = error.error.message ?? fallbackMessage;
        } else if (typeof error === 'object' && 'localizedKey' in error) {
          localizedKey = (error as any).localizedKey ?? null;
          fallbackMessage = (error as any).message ?? fallbackMessage;
        } else if (typeof error.error === 'string') {
          fallbackMessage = error.error;
        }
      } catch (e) {
        console.error('Error while parsing error object:', e);
      }

      // Use localized key if available
      langService.getTranslateMsgFromKey(localizedKey).then((message) => {

        if (!message) {
          switch (true) {
            case error.status === 0:
              message = 'Network error - please check your connection';
              break;
            case error.status === 401:
              message = 'Session expired - please login again';
              keycloak.logout();
              break;
            case error.status === 404:
              message = 'Requested resource not found';
              break;
            case error.status >= 400 && error.status < 500:
              message = fallbackMessage || 'Invalid request';
              break;
            case error.status >= 500:
              message = fallbackMessage || 'Server error - please try again later';
              break;
            default:
              message = fallbackMessage;
          }
        }
        notifications.showError(message);
      });
      return throwError(() => error);
    })
  );
};