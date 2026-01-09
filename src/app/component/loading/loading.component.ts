import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@constants/app.constants';
import { KeycloakService } from '@service/keycloak.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit{

  private readonly router = inject(Router);
  private readonly keycloakService = inject(KeycloakService);

  ngOnInit(): void {
    this.keycloakService.init().then(() => {
      if (this.keycloakService.isAuthenticated()) {
        console.debug('User is authenticated, redirecting to dashboard...');
        const dashboardRoute = localStorage.getItem('dashboardRoute');
        this.router.navigateByUrl(dashboardRoute ?? (APP_ROUTES.HOME + APP_ROUTES.DASHBOARD));

      } else {
        console.debug('User is not authenticated, redirecting to home...');
        this.keycloakService.login(APP_ROUTES.APP);
      }
    });
  }

}
