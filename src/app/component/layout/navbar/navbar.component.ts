import { Component, OnInit } from '@angular/core';
import { LayoutService } from '@service/layout.service';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { KeycloakService } from '@service/keycloak.service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { APP_ROUTES } from '@constants/app.constants';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,
    StyleClassModule,
    DrawerModule,
    PanelMenuModule,
    ButtonModule,
    DividerModule,
    SelectButtonModule,
    FormsModule,
    CommonModule,
    TranslateModule,
    MenuModule,
    SelectModule,
    ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  visibleProfile: boolean = false;
  isBrowser = false;
  preferredClinicId
  userClinics: any[] = [];
  userId;
  
  constructor(
    public layoutService: LayoutService,
    private platformService: PlatformService,
    private userService: UserService,
    private keycloakService: KeycloakService,
    private confirmationService: ConfirmationService,
    private _router: Router
  ) {
    this.isBrowser = platformService.isBrowser();
    this.layoutService = layoutService;
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const storedClinics = localStorage.getItem('userClinics');
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      this.userId = JSON.parse(userProfile)['userId']
    }
    if (!storedClinics) return;

    this.userClinics = JSON.parse(storedClinics);

    if (this.userClinics?.length === 1) {
      this.preferredClinicId = this.userClinics[0].value;
    } else {
      const savedClinicId = localStorage.getItem('currentlyUsedClinic');
      if (savedClinicId) {
        this.preferredClinicId = savedClinicId;
      }
    }
  }

  clinicChange($event) {
    const priviousClinicId = localStorage.getItem('currentlyUsedClinic');
    this.confirmationService.confirm({
      header: 'Confirm',
      message: 'Are you sure that you want to change clinic?',
      key: 'clinic-change',
      rejectVisible: true,
      acceptVisible: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Yes',
      },
      accept: async () => {
        if (this.userId) {
          this.userService.updatePreferredClinic(this.userId, { 'preferredClinicId': this.preferredClinicId }).subscribe({
            next: async (resp) => {
              localStorage.setItem('currentlyUsedClinic', $event.value);
              if (this.keycloakService.isAuthenticated()) {
                const flag = await this.keycloakService.updateToken(-1)
                if (flag) {
                  this._router.navigate([APP_ROUTES.APP + APP_ROUTES.DASHBOARD]);
                }
              }

            },
            error: (error) => {
              this.preferredClinicId = priviousClinicId;
            }
          })
        }
      },
      reject: () => {
        this.preferredClinicId = priviousClinicId;
      }
    });

  }

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  navigateToDashboard() {
    this._router.navigateByUrl(localStorage.getItem('dashboardRoute'));
  }

}
