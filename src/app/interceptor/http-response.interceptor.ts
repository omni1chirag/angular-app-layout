import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CUSTOM_ROUTES } from '@constants/app-routes.constant';
import { ApiResponse } from '@interface/api-response.interface';
import { KeycloakService } from '@service/keycloak.service';
import { MultiLangService } from '@service/multi-lang.service';
import { NotificationService } from '@service/notification.service';
import { tap, catchError, throwError } from 'rxjs';

export const HttpResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  const langService = inject(MultiLangService);
  const keycloak = inject(KeycloakService);
  const LOGOUT_DELAY_MS = 3000;

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.body) {
        const resp = event.body as ApiResponse<unknown>;
        const localizedKey = resp.localizedKey;
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
      let localizedKey: string | null = null;
      let fallbackMessage = 'An unexpected error occurred';

      const isApiResponse = <T>(res: unknown): res is ApiResponse<T> => {
        return !!res
          && typeof res === 'object'
          && res !== null
          && 'data' in (res as Record<string, unknown>)
          && 'message' in (res as Record<string, unknown>)
          && 'status' in (res as Record<string, unknown>)
          && 'localizedKey' in (res as Record<string, unknown>);
      }

      // Try to extract key and message


      try {
        const resp = error.error;
        if (isApiResponse(resp)) {
          localizedKey = resp.localizedKey ?? null;
          fallbackMessage = resp.message ?? fallbackMessage;
        } else if (typeof resp === 'object') {
          fallbackMessage = resp.message ?? fallbackMessage;
        } else if (typeof resp === 'string') {
          fallbackMessage = resp;
        }
      } catch (e) {
        console.error('Error while parsing error object:', e);
      }

      // Use localized key if available
      langService.getTranslateMsgFromKey(localizedKey).then((translated) => {
        let finalMessage = translated ?? fallbackMessage;
        if (!translated) {
          switch (true) {
            case error.status === 0:
              finalMessage = 'Network error - please check your connection';
              break;
            case error.status === 401:
              finalMessage = 'Session expired - please login again';
              break;
            case error.status === 404:
              finalMessage = 'Requested resource not found';
              break;
            case error.status >= 400 && error.status < 500:
              finalMessage = fallbackMessage || 'Invalid request';
              break;
            case error.status >= 500:
              finalMessage = fallbackMessage || 'Server error - please try again later';
              break;
            default:
              finalMessage = fallbackMessage;
          }
        }
        notifications.showError(finalMessage);

      });
      if (error.status === 401) {
        setTimeout(() => {
          keycloak.logout(CUSTOM_ROUTES.HOME);
        }, LOGOUT_DELAY_MS);
      }

      return throwError(() => error);
    })
  );
};