import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '@component/layout/menuitem/menuitem.component';
import { LayoutService } from '@service/layout.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs';
// import { MenuService } from '@service/menu.service';
import { KeycloakService } from '@service/keycloak.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MenuitemComponent, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  providers: [LayoutService],
  animations: [
    trigger('children', [
      state('collapsed', style({
        height: '0'
      })),
      state('expanded', style({
        height: '*'
      })),
      transition('collapsed <=> expanded', animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class MenuComponent {
  menuItems: any[] = [];  // Use `any[]` if you don't want strict typing
  // menuItems$: Observable<any[]>;
  constructor(
    // private menuService: MenuService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {

    // this.menuItems$ = this.menuService.menuItems$;
    // this.menuItems$.subscribe((items) => {
    //   // console.log('Menu items:', items);
    //   this.menuItems = items;
    // });

    if (!this.keycloakService.isInitialized) {
      this.keycloakService.init();
    }


    this.menuItems = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/patient-portal/dashboard']
          }
        ]
      },
      {
        label: 'Menu',
        items: [
          {
            label: 'Clinical Summary',
            tooltip: 'Clinical Summary',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/patient-portal/summary'],
          },
          {
            label: 'Appointment',
            tooltip: 'Appointment List',
            icon: 'pi pi-fw pi-calendar-plus',
            routerLink: ['/patient-portal/appointment/list'],
            singleItem: {
              label: 'Add Appointment',
              tooltip: 'Add Appointment',
              icon: 'pi pi-fw pi-plus-circle',
              routerLink: ['/patient-portal/appointment/add-edit']
            },
          }
        ]
      }
    ];  
  }
}
