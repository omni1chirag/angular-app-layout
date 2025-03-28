import { Component, inject } from '@angular/core';
import { LayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MultiLangService } from '../service/multi-lang.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, StyleClassModule, DrawerModule, PanelMenuModule, ButtonModule, DividerModule, SelectButtonModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  layoutService: LayoutService;
  visibleProfile: boolean = false;
  items: MenuItem[] | undefined;
  language: string = 'en';
  stateOptions = [
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Gujarati', code: 'gj' }

  ];

  multiLangService = inject(MultiLangService)
  constructor(layoutService: LayoutService,
    private router: Router,

  ) {
    this.layoutService = layoutService;
  }

  ngOnInit() {
    this.items = [
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
              this.languageChange('gj');
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
              this.visibleProfile = false;
            }
          },
          {
            label: 'Consultation Charges',
            command: () => {
              this.router.navigate(['home/setup/consultation-charges']);
              this.visibleProfile = false;
            }
          },
          {
            label: 'Subscription',
            command: () => {
              this.router.navigate(['home/setup/subscription']);
              this.visibleProfile = false;
            }
          }
        ]
      }
    ];
  }
  languageChange(language?: any) {
    if(language !=  this.language){
      this.language = language;
      this.multiLangService.updateLanguageSignal(this.language);
    }
  }

  editProfile() {
    this.router.navigate(['home/profile']);
    this.visibleProfile = false;
  }

  workingHours() {
    this.router.navigate(['home/setup/working-hours']);
    this.visibleProfile = false;
  }

  consultationCharges() {
    this.router.navigate(['home/setup/consultation-charges']);
    this.visibleProfile = false;
  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

}
