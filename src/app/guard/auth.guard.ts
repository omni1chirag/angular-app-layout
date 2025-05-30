import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { PlatformService } from '../service/platform.service';

export const authGuard: CanActivateFn = async (route, state) => {
    const keycloakService = inject(KeycloakService);
    const platform = inject(PlatformService);
    const router = inject(Router);

    if (!platform.isBrowser()) {
        return true;
    }
    try {
        console.log('authGuard triggered...');
        await keycloakService.init();

        if (keycloakService.isAuthenticated()) {
            return true;
        }

        const redirectUrl = state.url === '/' ? '/home' : state.url;
        keycloakService.login(redirectUrl);
        return false;
    } catch (error) {
        console.error('Authentication error:', error);
        keycloakService.logout();
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