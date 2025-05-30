import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '@constants/app-routes.constant';
import { KeycloakService } from '@service/keycloak.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading',
  imports: [ProgressSpinnerModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  constructor(private router: Router,
    private keycloakService: KeycloakService,
  ) {

  }
  ngOnInit(): void {
    this.keycloakService.init().then(() => {
      if (this.keycloakService.isAuthenticated()) {
        console.log('User is authenticated, redirecting to dashboard...');
        this.router.navigateByUrl(ROUTES.HOME+ROUTES.DASHBOARD)
      } else {
        console.log('User is not authenticated, redirecting to home...');
        this.keycloakService.login(ROUTES.HOME);
      }
    });
  }

}
