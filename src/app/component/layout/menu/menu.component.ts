import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '@component/layout/menuitem/menuitem.component';
import { LayoutService } from '@service/layout.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Observable } from 'rxjs';
import { MenuService } from '@service/menu.service';
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
  menuItems$: Observable<any[]>;
  constructor(
    private menuService: MenuService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {

    this.menuItems$ = this.menuService.menuItems$;
    this.menuItems$.subscribe((items) => {
      // console.log('Menu items:', items);
      this.menuItems = items;
    });

    if (!this.keycloakService.isInitialized) {
      this.keycloakService.init();
    }


    // this.menuItems = [
    //   {
    //     label: 'Home',
    //     items: [
    //       {
    //         label: 'Dashboard',
    //         icon: 'pi pi-fw pi-home',
    //         routerLink: ['/home/admin-dashboard']
    //       },
    //       {
    //         label: 'Doctor-Dashboard',
    //         icon: 'pi pi-fw pi-home',
    //         routerLink: ['/home/doctor-dashboard']
    //       }
    //     ]
    //   },
    //   {
    //     label: 'Menu',
    //     items: [
    //       {
    //         label: 'Organization',
    //         tooltip: 'Organization List',
    //         svgIcon: '/assets/svg/organization-svg-icon.svg',
    //         routerLink: ['/home/organization/list'],
    //         singleItem: {
    //           label: 'Add Organization',
    //           tooltip: 'Add Organization',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/organization/add']
    //         },

    //         items: [
    //           {
    //             label: 'Add Organization',
    //             icon: 'pi pi-fw pi-bookmark',
    //             routerLink: ['/home/organization']
    //           },
    //           {
    //             label: 'Organization List',
    //             icon: 'pi pi-fw pi-bookmark',
    //           },
    //         ]

    //       },
    //       {
    //         label: 'Practice',
    //         tooltip: 'Practice List',
    //         svgIcon: '/assets/svg/clinic-svg-icon.svg',
    //         routerLink: ['/home/practice/list'],
    //         singleItem: {
    //           label: 'Add Practice',
    //           tooltip: 'Add Practice',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/practice/add']
    //         },
    //         items: [
    //           {
    //             label: 'Add Practice',
    //             svgIcon: '/assets/svg/clinic-svg-icon.svg',
    //             routerLink: ['/home/practice/add-edit']
    //           },
    //           {
    //             label: 'Practice List',
    //             icon: 'pi pi-fw pi-bookmark',
    //             svgIcon: '/assets/svg/clinic-svg-icon.svg',
                
    //           },
    //         ]
    //       },
    //       {
    //         label: 'Doctor',
    //         tooltip: 'Doctor List',
    //         svgIcon: '/assets/svg/clinic-svg-icon.svg',
    //         routerLink: ['/home/doctor/list'],
    //         singleItem: {
    //           label: 'Add Doctor',
    //           tooltip: 'Add Doctor',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/doctor/add']
    //         },
    //         items: [
    //           {
    //             label: 'Add Doctor',
    //             svgIcon: '/assets/svg/clinic-svg-icon.svg',
    //             routerLink: ['/home/doctor/add-edit']
    //           },
    //           {
    //             label: 'Doctor List',
    //             icon: 'pi pi-fw pi-bookmark',
    //             svgIcon: '/assets/svg/clinic-svg-icon.svg',
                
    //           },
    //         ]
    //       },
    //       {
    //         label: 'User',
    //         tooltip: ' User List',
    //         icon: 'pi pi-fw pi-user',
    //         routerLink: ['/home/user/list'],
    //         singleItem: {
    //           label: 'Add User',
    //           tooltip: 'Add User',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/user/add']
    //         },
    //         items: [
    //           {
    //             label: 'Add User',
    //             icon: 'pi pi-fw pi-user-plus',
    //             routerLink: ['/home/user/add-edit']
    //           },
    //           {
    //             label: 'User List',
    //             icon: 'pi pi-fw pi-users',
               
    //           }
    //         ]
    //       },
    //       {
    //         label: 'Role Permisssion',
    //         svgIcon: '/assets/svg/user-role-svg-icon.svg',
    //         routerLink: ['/home/role/list'],
    //         items: [
    //           {
    //             label: 'Add Role',
    //             icon: 'pi pi-fw pi-bookmark',
    //             routerLink: ['/home/role/add-edit']
    //           },
    //           {
    //             label: 'Role List',
    //             icon: 'pi pi-fw pi-bookmark',
                
    //           },
    //           {
    //             label: 'Manage Permissions',
    //             svgIcon: '/assets/svg/permission-svg-icon.svg',
    //             routerLink: ['/home/role/permissions']
    //           },
    //         {
    //           label: 'Manage Permissions',
    //           svgIcon: '/assets/svg/permission-svg-icon.svg',
    //           routerLink: ['/home/role/permissions']
    //         },
    //         ]
    //       },
    //       {
    //         label: 'Manage Permissions',
    //         svgIcon: '/assets/svg/permission-svg-icon.svg',
    //         routerLink: ['/home/role/permissions']
    //       },
    //       {
    //         label: 'Notification Alert Setup',
    //         icon: 'pi pi-fw pi-bell',
    //         routerLink: ['/home/notification/list'],
    //         items: [
    //           {
    //             label: 'Add Alert',
    //             icon: 'pi pi-fw pi-bookmark',
    //             routerLink: ['/home/notification/add-edit']
    //           },
    //           {
    //             label: 'Alert List',
    //             icon: 'pi pi-fw pi-bookmark',
                
    //           }
    //         ]
    //       },
    //       {
    //         label: 'Master Setup',
    //         icon: 'pi pi-fw pi-cog',
    //         routerLink: ['/home/setup/commission/list'],
    //         items: [
    //           {
    //             label: 'Add Commission',
    //             icon: 'pi pi-fw pi-bookmark',
    //             routerLink: ['/home/setup/commission/add-edit']
    //           },
    //           {
    //             label: 'Commission List',
    //             icon: 'pi pi-fw pi-bookmark',
                
    //           }
    //         ]
    //       },
    //       {
    //         label: 'Patient',
    //         tooltip: 'Patient List',
    //         icon: 'pi pi-fw pi-user',
    //         routerLink: ['/home/patient/list'],
    //         singleItem: {
    //           label: 'Add Patient',
    //           tooltip: 'Add Patient',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/patient/add-edit']
    //         },
    //       },
    //       {
    //         label: 'Appointment',
    //         tooltip: 'Appointment List',
    //         icon: 'pi pi-fw pi-calendar-plus',
    //         routerLink: ['/home/appointment/list'],
    //         singleItem: {
    //           label: 'Add Appointment',
    //           tooltip: 'Add Appointment',
    //           icon: 'pi pi-fw pi-plus-circle',
    //           routerLink: ['/home/appointment/add-edit']
    //         },
    //       }
    //     ]
    //   }
    // ];  
  }
}
