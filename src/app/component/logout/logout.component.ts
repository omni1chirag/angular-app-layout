import { Component, OnInit } from '@angular/core';
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

  constructor(private router: Router,
    private platformService: PlatformService,
    private notificationService: NotificationService,
    private keycloakService: KeycloakService) {
    const navigation = this.router.getCurrentNavigation();
    this.errorState = navigation?.extras?.state as ErrorState | null;

  }

  ngOnInit() {
    if (this.platformService.isBrowser()) {
      if (this.errorState) {
        this.notificationService.showError(this.errorState.detail, this.errorState.summary);
      }
    }
  }

  goToLogin() {
    this.keycloakService.login(APP_ROUTES.APP);
  }



}
