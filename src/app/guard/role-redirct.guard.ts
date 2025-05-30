import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../service/keycloak.service';
import { inject } from '@angular/core';

export const roleRedirectGuard: CanActivateFn = async () => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  try {
    console.log('roleRedirectGuard triggered...');
    await keycloakService.init();

    if (!keycloakService.isAuthenticated()) {
      return router.parseUrl('/loading');
    }

    const userProfile = await keycloakService.getUserProfile();

    if(userProfile) {
      const redirectUrl = (userProfile as any)?.dashboardRoute;
      return router.parseUrl(redirectUrl);
    }
    return router.navigate(['/error'], {
      state: {
        errorCode: 'no_profile',
        message: 'User profile not found',
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Role redirect error:', error);
    return router.navigate(['/error'], {
      state: {
        errorCode: 'role_guard_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        error
      }
    });
  }
};
