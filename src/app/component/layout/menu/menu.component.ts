import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '@component/layout/menuitem/menuitem.component';
import { LayoutService } from '@service/layout.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { KeycloakService } from '@service/keycloak.service';
import { MenuService } from '@service/menu.service';
import { MenuItem } from '@interface/common.interface';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, MenuitemComponent, RouterModule],
  templateUrl: './menu.component.html',
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

export class MenuComponent implements OnInit {

  private readonly menuService = inject(MenuService);
  private readonly keycloakService = inject(KeycloakService);

  menuItems: MenuItem[] = [];

  ngOnInit(): void {

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
            routerLink: ['/home/dashboard']
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
            routerLink: ['/home/clinical-summary'],
          },
          {
            label: 'Appointment',
            tooltip: 'Appointment List',
            icon: 'pi pi-fw pi-calendar-plus',
            routerLink: ['/home/appointment/list'],
            // singleItem: {
            //   label: 'Add Appointment',
            //   tooltip: 'Add Appointment',
            //   icon: 'pi pi-fw pi-plus-circle',
            //   routerLink: ['/home/appointment/add-edit']
            // },
          },
          {
            label: 'Vitals',
            tooltip: 'Vitals',
            icon: 'pi pi-briefcase',
            routerLink: ['/home/vitals/list'],
          },
          {
            label: 'Medication',
            tooltip: 'Medication List',
            icon: 'pi pi-plus',
            routerLink: ['/home/medication/list'],
          },
          {
            label: 'Immunization',
            tooltip: 'Immunization List',
            icon: 'pi pi-plus',
            routerLink: ['/home/immunization/list'],
          },
        ]
      }
    ];  
  }
}
