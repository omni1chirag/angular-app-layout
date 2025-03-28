import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-component-list',
    standalone:true,
    imports: [ButtonModule],
    templateUrl: './component-list.component.html',
    styleUrl: './component-list.component.scss'
})
export class ComponentListComponent {

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
  navigateToTesting() {
    this.router.navigate(['/testing']);
  }
  navigateToAdminDashboard() {
    this.router.navigate(['/home']);
  }
}
