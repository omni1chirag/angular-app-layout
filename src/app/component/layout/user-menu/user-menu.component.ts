import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { APP_ROUTES } from '@constants/app.constants';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { CommonMaster, LabelValue } from '@interface/common.interface';
import {
  OptForUserOtpDTO,
  PatientMapping,
} from '@interface/patient-profile.interface';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimeUtilityService } from '@service/date-time-utility.service';
import { KeycloakService } from '@service/keycloak.service';
import { LayoutService } from '@service/layout.service';
import { LocalStorageService } from '@service/local-storage.service';
import { MasterService } from '@service/master.service';
import { MultiLangService } from '@service/multi-lang.service';
import { PatientService } from '@service/patient.service';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { UtilityService } from '@service/utility.service';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PanelMenuModule } from 'primeng/panelmenu';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-menu',
  imports: [
    CommonModule,
    DrawerModule,
    PanelMenuModule,
    DividerModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MandatoryFieldLabelDirective,
    PhoneNumberMaskDirective,
    TranslateModule,
    InputNumberModule,
    InputTextModule,
    InputOtpModule,
    InputGroupModule,
    SelectButtonModule,
    ConfirmDialogModule,
    CheckboxModule,
    InputGroupAddonModule,
  ],
  templateUrl: './user-menu.component.html',
  providers: [ConfirmationService],
  styles: [
    '::ng-deep .opt-user {.p-button-link{padding-left: 2px !important;} .p-dialog-content{ padding-bottom: 5px !important; }}',
  ],
})
export class UserMenuComponent implements OnInit {
  public layoutService = inject(LayoutService);
  private readonly platformService = inject(PlatformService);
  private readonly _fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly multiLangService = inject(MultiLangService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly utilityService = inject(UtilityService);
  private readonly masterService = inject(MasterService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly patientService = inject(PatientService);
  private readonly userService = inject(UserService);
  private readonly keycloakService = inject(KeycloakService);
  private readonly dateTimeUtilityService = inject(DateTimeUtilityService);
  topItems = signal<MenuItem[]>([
    {
      label: 'Language',
      icon: 'pi pi-fw pi-language',
      items: [
        {
          label: 'English',
          command: () => {
            this.languageChange('en');
          },
        },
        {
          label: 'हिंदी',
          command: () => {
            this.languageChange('hi');
          },
        },
        {
          label: 'ગુજરાતી',
          command: () => {
            this.languageChange('gu');
          },
        },
      ],
    },
  ]);
  bottomItems: MenuItem[] | undefined;
  language = 'en';
  isOptDialogVisible = signal<boolean>(false);
  optUserForm: FormGroup;
  yesNoOptions: LabelValue<boolean>[] = [];
  isOTPSent = false;
  formattedTime = signal<string>('');
  countdownTime = 60;
  smsOtp = '';
  emailOtp = '';
  subscription!: Subscription;
  isMemberAdded: Signal<boolean>;
  isProfileChanged: Signal<boolean>;
  isBrowser = false;

  constructor() {
    this.isBrowser = this.platformService.isBrowser();

    this.isMemberAdded = this.userService.isMemberAdded;
    this.isProfileChanged = this.userService.isProfileChanged;

    effect(() => {
      if (this.isMemberAdded() || this.isProfileChanged()) {
        this.setUserMenu();
        if (this.isProfileChanged()) {
          this.userService.isProfileChanged.set(false);
        }
      }
    });

    this.bottomItems = [
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => {
          this.onSignOut();
        },
      },
    ];
  }

  private setUserMenu() {
    const patientProfiles =
      this.localStorageService.getItem<PatientMapping[]>('patientProfiles') ||
      [];
    const savedPatientId = this.localStorageService.getItem<string>(
      'activePatientProfile'
    );
    const totalProfile = patientProfiles.length || 0;
    if (!patientProfiles.length || !savedPatientId) return;

    const activeProfile = patientProfiles.find(
      (p) => p.patientId === savedPatientId
    );
    if (!activeProfile) return;

    const menu: MenuItem[] = [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user-edit',
        command: () => {
          this.editProfile();
        },
      },
      {
        label: 'Add Family Member',
        icon: 'pi pi-fw pi-users',
        visible: totalProfile < 6,

        command: () => {
          this.addFamilyMember();
        },
      },
      {
        label: 'Opt for User',
        visible: activeProfile.eligibleForOptIn,
        icon: 'pi pi-fw pi-user-plus',
        command: () => {
          this.openOptForUserDialog();
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
            },
          },
          {
            label: 'हिंदी',
            command: () => {
              this.languageChange('hi');
            },
          },
          {
            label: 'ગુજરાતી',
            command: () => {
              this.languageChange('gu');
            },
          },
        ],
      },
    ];

    this.topItems.set(menu);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.initializeMasterData();
    this.setUserMenu();
    this.optUserForm = this._fb.group({
      patientId: new FormControl<string | null>({ value: '', disabled: true }),
      profileName: new FormControl<string | null>({
        value: '',
        disabled: true,
      }),
      email: new FormControl<string | null>('', [
        Validators.email,
        Validators.maxLength(100),
      ]),
      mobileNumber: new FormControl<string | null>('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(10),
      ]),
      stillFamilyMember: new FormControl<boolean>(true, [Validators.required]),
    });
  }

  openOptForUserDialog(): void {
    const patientProfiles =
      this.localStorageService.getItem<PatientMapping[]>('patientProfiles') ||
      [];
    const savedPatientId = this.localStorageService.getItem(
      'activePatientProfile'
    );

    if (!patientProfiles.length || !savedPatientId) return;

    const activeProfile = patientProfiles.find(
      (p) => p.patientId === savedPatientId
    );
    if (!activeProfile) return;

    this.optUserForm.reset();
    this.optUserForm.patchValue({
      patientId: activeProfile.patientId,
      profileName: activeProfile.patientName,
      stillFamilyMember: true,
    });
    this.isOptDialogVisible.set(true);
  }

  hideUserMenu(): void {
    this.layoutService.onToggleUserMenu();
  }

  editProfile(): void {
    this.hideUserMenu();
    this.router.navigate([APP_ROUTES.PROFILE]);
  }

  addFamilyMember(): void {
    this.hideUserMenu();
    this.router.navigate([APP_ROUTES.FAMILY_ADD]);
  }

  languageChange(language?: string): void {
    if (language != this.language) {
      this.language = language;
      this.multiLangService.updateLanguageSignal(this.language);
      this.hideUserMenu();
    }
  }

  onSignOut(): void {
    this.hideUserMenu();
    this.keycloakService.logout(APP_ROUTES.APP);
  }

  onCancelKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.isOptDialogVisible.set(false);
      event.preventDefault(); // prevent space from scrolling
    }
  }

  applyOptForUser(): void {
    if (this.optUserForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.optUserForm);
      return;
    }
    const patientId = this.optUserForm.get('patientId')?.value;
    if (patientId) {
      this.emailOtp = undefined;
      this.smsOtp = undefined;
      this.confirmationService.confirm({
        header: 'User Verification',
        key: 'opt-user',
        rejectVisible: false,
        acceptVisible: false,
      });
      this.isOTPSent = false;
      this.isOptDialogVisible.set(false);
    }
  }

  initializeMasterData(): void {
    const params = ['YES_NO_BOOLEAN'];

    this.masterService
      .getCommonMasterData<CommonMaster<unknown>[]>(params)
      .subscribe({
        next: (data) => {
          data.forEach((res) => {
            if (res.name === 'YES_NO_BOOLEAN') {
              this.yesNoOptions = res.value as LabelValue<boolean>[];
            } else {
              console.error('name not found', res.name);
            }
          });
        },
        error: (error) => {
          console.error('Error fetching master data:', error);
        },
      });
  }

  resendOTP(): void {
    const json: OptForUserOtpDTO = {
      otpType: this.optUserForm.get('email')?.value ? 'BOTH' : 'SMS',
      mobileNumber: this.optUserForm.get('mobileNumber')?.value,
      email: this.optUserForm.get('email')?.value,
    };
    this.patientService.sendOPTForUserOTP(json).subscribe(() => {
      this.isOTPSent = true;
      this.subscription?.unsubscribe();
      this.subscription = this.dateTimeUtilityService
        .startCountdown(this.countdownTime)
        .subscribe((time) => {
          this.formattedTime.set(time);
        });
      this.confirmationService.close();

      this.confirmationService.confirm({
        header: 'User Verification',
        key: 'opt-user',
        rejectVisible: false,
        acceptVisible: false,
      });
    });
  }

  submitOTP(): void {
    this.patientService
      .optForUser(this.optUserForm.get('patientId')?.value, {
        emailOtp: this.emailOtp,
        smsOtp: this.smsOtp,

        ...this.optUserForm.value,
      })
      .subscribe(() => {
        this.confirmationService.close();
        this.userService.isMemberAdded.set(true);
        this.hideUserMenu();
      });
  }
}
