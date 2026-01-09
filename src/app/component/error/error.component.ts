import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@constants/app.constants';
import { ErrorState } from '@interface/error-state.interface';
import { KeycloakService } from '@service/keycloak.service';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-error',
  imports: [CommonModule, DividerModule, ButtonModule, ImageModule, MessageModule],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent {
  errorState: ErrorState | null = null;
  imageSrc = "/assets/images/login-bg-2-ghibli.png";
  logoSrc = "/assets/images/logo-white.png";

  private readonly router = inject(Router);
  private readonly platformService = inject(PlatformService);
  private readonly keycloakService = inject(KeycloakService);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    this.errorState = navigation?.extras?.state as ErrorState | null;

    if (this.platformService.isBrowser() && !this.errorState) {
      this.errorState = history.state;
    }
  }

  navigateToHome():void {
    this.keycloakService.logout(APP_ROUTES.APP);
  }
}
