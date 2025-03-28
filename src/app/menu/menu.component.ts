import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../service/layout.service';
import { animate, state, style, transition, trigger } from '@angular/animations';

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

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Home',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-fw pi-home',
            routerLink: ['/home/admin-dashboard']
          }
        ]
      },
      {
        label: 'Menu',
        items: [
          {
            label: 'Organization',
            svgIcon: '/assets/svg/organization-svg-icon.svg',
            routerLink: ['/home/oraganization-list'],
            singleItem: {
              label: 'Add Organization',
              icon: 'pi pi-fw pi-plus-circle',
              routerLink: ['/home/organization']
            },

            // items: [
            //   {
            //     label: 'Add Organization',
            //     icon: 'pi pi-fw pi-bookmark',
            //     routerLink: ['/home/organization']
            //   },
            //   {
            //     label: 'Organization List',
            //     icon: 'pi pi-fw pi-bookmark',
            //   },
            // ]

          },
          {
            label: 'Practice',
            svgIcon: '/assets/svg/clinic-svg-icon.svg',
            routerLink: ['/home/practice/list'],
            singleItem: {
              label: 'Add Practice',
              icon: 'pi pi-fw pi-plus-circle',
              routerLink: ['/home/practice/add-edit']
            },
            // items: [
            //   {
            //     label: 'Add Practice',
            //     svgIcon: '/assets/svg/clinic-svg-icon.svg',
            //     routerLink: ['/home/practice/add-edit']
            //   },
            //   {
            //     label: 'Practice List',
            //     icon: 'pi pi-fw pi-bookmark',
            //     svgIcon: '/assets/svg/clinic-svg-icon.svg',
                
            //   },
            // ]
          },
          {
            label: 'Provider',
            svgIcon: '/assets/svg/clinic-svg-icon.svg',
            routerLink: ['/home/provider/list'],
            singleItem: {
              label: 'Add Provider',
              icon: 'pi pi-fw pi-plus-circle',
              routerLink: ['/home/provider/add-edit']
            },
            // items: [
            //   {
            //     label: 'Add Provider',
            //     svgIcon: '/assets/svg/clinic-svg-icon.svg',
            //     routerLink: ['/home/provider/add-edit']
            //   },
            //   {
            //     label: 'Provider List',
            //     icon: 'pi pi-fw pi-bookmark',
            //     svgIcon: '/assets/svg/clinic-svg-icon.svg',
                
            //   },
            // ]
          },
          {
            label: 'User',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/home/user/list'],
            singleItem: {
              label: 'Add User',
              icon: 'pi pi-fw pi-plus-circle',
              routerLink: ['/home/user/add-edit']
            },
            // items: [
            //   {
            //     label: 'Add User',
            //     icon: 'pi pi-fw pi-user-plus',
            //     routerLink: ['/home/user/add-edit']
            //   },
            //   {
            //     label: 'User List',
            //     icon: 'pi pi-fw pi-users',
               
            //   }
            // ]
          },
          {
            label: 'Role Permisssion',
            svgIcon: '/assets/svg/user-role-svg-icon.svg',
            routerLink: ['/home/role/list'],
            items: [
            //   {
            //     label: 'Add Role',
            //     icon: 'pi pi-fw pi-bookmark',
            //     routerLink: ['/home/role/add-edit']
            //   },
            //   {
            //     label: 'Role List',
            //     icon: 'pi pi-fw pi-bookmark',
                
            //   },
            //   {
            //     label: 'Manage Permissions',
            //     svgIcon: '/assets/svg/permission-svg-icon.svg',
            //     routerLink: ['/home/role/permissions']
            //   },
            {
              label: 'Manage Permissions',
              svgIcon: '/assets/svg/permission-svg-icon.svg',
              routerLink: ['/home/role/permissions']
            },
            ]
          },
          // {
          //   label: 'Manage Permissions',
          //   svgIcon: '/assets/svg/permission-svg-icon.svg',
          //   routerLink: ['/home/role/permissions']
          // },
          {
            label: 'Notification Alert Setup',
            icon: 'pi pi-fw pi-bell',
            routerLink: ['/home/notification/list']
            // items: [
            //   {
            //     label: 'Add Alert',
            //     icon: 'pi pi-fw pi-bookmark',
            //     routerLink: ['/home/notification/add-edit']
            //   },
            //   {
            //     label: 'Alert List',
            //     icon: 'pi pi-fw pi-bookmark',
                
            //   }
            // ]
          },
          {
            label: 'Master Setup',
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/home/setup/commission/list']
            // items: [
            //   {
            //     label: 'Add Commission',
            //     icon: 'pi pi-fw pi-bookmark',
            //     routerLink: ['/home/setup/commission/add-edit']
            //   },
            //   {
            //     label: 'Commission List',
            //     icon: 'pi pi-fw pi-bookmark',
                
            //   }
            // ]
          },
          {
            label: 'Patient',
            icon: 'pi pi-fw pi-user',
            routerLink: ['/home/patient/list']
          }
        ]
      }
    ];
  }
}
