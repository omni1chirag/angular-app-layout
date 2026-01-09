import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@constants/app.constants';
import { ErrorState } from '@interface/error-state.interface';
import { KeycloakService } from '@service/keycloak.service';
import { NotificationService } from '@service/notification.service';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-logout',
  imports: [ButtonModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent implements OnInit {
  errorState: ErrorState | null = null;
  private readonly router = inject(Router);
  private readonly platformService = inject(PlatformService);
  private readonly notificationService = inject(NotificationService);
  private readonly keycloakService = inject(KeycloakService);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    this.errorState = navigation?.extras?.state as ErrorState | null;

  }

  ngOnInit(): void {
    if (this.platformService.isBrowser()) {
      if (this.errorState) {
        this.notificationService.showError(this.errorState.summary, this.errorState.severity);
      }
    }
  }

  goToLogin(): void {
    this.keycloakService.login(APP_ROUTES.APP);
  }

}
