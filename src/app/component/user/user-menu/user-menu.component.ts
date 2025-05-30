import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { LayoutService } from '@service/layout.service';
import { Router } from '@angular/router';
import { MultiLangService } from '@service/multi-lang.service';
import { KeycloakService } from '@service/keycloak.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule, DrawerModule, PanelMenuModule, DividerModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss'
})
export class UserMenuComponent {
  topItems: MenuItem[] | undefined;
  bottomItems: MenuItem[] | undefined;
  language: string = 'en';

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private multiLangService: MultiLangService,
    private keycloakService: KeycloakService,
    private renderer: Renderer2,
  ) { }

  ngOnInit() {
    this.topItems = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user-edit',
        command: () => {
          this.editProfile();
        },
      },
      {
        label: 'Language',
        icon: 'pi pi-fw pi-language',
        items: [
          {
            label: 'English',
            command: () => {
              this.languageChange('en');
            }
          },
          {
            label: 'हिंदी',
            command: () => {
              this.languageChange('hi');
            }
          },
          {
            label: 'ગુજરાતી',
            command: () => {
              this.languageChange('gu');
            }
          }
        ]
      },
      {
        label: 'Setup',
        icon: 'pi pi-fw pi-cog',
        items: [
          {
            label: 'Working Hours',
            command: () => {
              this.router.navigate(['home/setup/working-hours']);
              this.hideUserMenu();
            }
          },
          {
            label: 'Consultation Charges',
            command: () => {
              this.router.navigate(['home/setup/consultation-charges']);
              this.hideUserMenu();
            }
          },
          {
            label: 'Subscription',
            command: () => {
              this.router.navigate(['home/setup/subscription']);
              this.hideUserMenu();
            }
          }
        ]
      }
    ];

    this.bottomItems = [
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => {
          this.onSignOut();
        }
      }
    ]
  }


  hideUserMenu() {
    this.layoutService.onToggleUserMenu();
  }

  editProfile() {
    this.hideUserMenu();
    this.router.navigate(['home/profile']);
  }

  languageChange(language?: any) {
    if (language != this.language) {
      this.language = language;
      this.multiLangService.updateLanguageSignal(this.language);
      this.hideUserMenu();
    }
  }

  onSignOut() {
    this.hideUserMenu();
    this.keycloakService.logout('/logout');
  }
}
