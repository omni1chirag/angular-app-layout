import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { APP_ROUTES } from '@constants/app.constants';
import { KeycloakService } from '@service/keycloak.service';
import { NotificationWebsocketService } from '@service/notification-websocket.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const keycloakService = inject(KeycloakService);
    const platform = inject(PlatformService);
    const router = inject(Router);
    const norificationService = inject(NotificationService);
    const notificationWebsocketService = inject(NotificationWebsocketService)

    if (!platform.isBrowser()) {
        return true;
    }
    try {
        console.log('authGuard triggered...');
        await keycloakService.init();

        if (keycloakService.isAuthenticated()) {
            // return router.navigate([APP_ROUTES.ERROR], {
            //     state: {
            //         severity: 'error',
            //         summary: 'Access Denied',
            //         detail: 'You are not authorized to access this application. Please contact support.',
            //     }
            // });

            console.log('User is authenticated');
            if (keycloakService.isPatient()) {
                keycloakService.getUserProfile();
                // notificationWebsocketService.connect();
                return true;
            }
            return router.navigate([APP_ROUTES.ERROR], {
                state: {
                    errorCode: 'not_authorized',
                    message: 'You are not authorized to access this application. Please contact support.',
                    timestamp: Date.now()
                }
            });
        }

        // keycloakService.login(APP_ROUTES.APP);
        keycloakService.login(APP_ROUTES.APP);
        return false;
    } catch (error) {
        console.error('Authentication error:', error);
        return router.navigate(['/error'], {
            state: {
                errorCode: 'auth_error',
                message: 'User is not authenticated.',
                error: error,
                timestamp: Date.now()
            }
        });
    }
};
