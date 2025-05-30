import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ErrorState } from '@interface/error-state.interface';
import { KeycloakService } from '@service/keycloak.service';
import { ROUTES } from '@constants/app-routes.constant';


@Component({
  selector: 'app-error',
  imports: [CommonModule, DividerModule, ButtonModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  errorState: ErrorState | null = null;

  constructor(private router: Router,
    private platformService: PlatformService,
    private keycloakService: KeycloakService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.errorState = navigation?.extras?.state as ErrorState | null;

    if (this.platformService.isBrowser() && !this.errorState) {
      this.errorState = history.state;
    }
  }

  navigateToHome() {
    this.keycloakService.logout(ROUTES.HOME);
  }
}
