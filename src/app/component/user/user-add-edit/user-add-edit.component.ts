import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { Subject, takeUntil } from 'rxjs';
import { AddressComponent } from '@component/common/address/address.component';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PageHeaderDirective } from '@directive/page-header.directive';
import { UserService } from '@service/user.service';
import { NotificationService } from '@service/notification.service';
import { FileUploadComponent } from '@component/common/file-upload/file-upload.component';
import { UtilityService } from '@service/utility.service';
import { TreeModule } from 'primeng/tree';
import { RolePermissionService } from '@service/role-permission.service';
import { DateMaskDirective } from '@directive/date-mask.directive';
import { MasterService } from '@service/master.service';

interface LabelValue {
  label: string;
  value: any;
}
@Component({
  selector: 'app-user-add-edit',
  imports: [AutoCompleteModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    AvatarModule,
    ButtonModule,
    FileUploadModule,
    CommonModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    DividerModule,
    InputNumberModule,
    SelectButtonModule,
    PasswordModule,
    MultiSelectModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    SplitButtonModule,
    PageHeaderDirective,
    AddressComponent,
    MandatoryFieldLabelDirective,
    FileUploadComponent,
    TreeModule,
    DateMaskDirective,
    DividerModule],
  templateUrl: './user-add-edit.component.html',
  providers: [MessageService],
  styleUrl: './user-add-edit.component.scss'
})
export class UserAddEditComponent implements OnInit, OnDestroy {

  isCallInitiated: boolean = false;

  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  numeric: RegExp = new RegExp(/^[0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)
  documentTypes = ".jpeg,.png,.jpg";

  mode: 'Add' | 'Edit' = 'Add';
  userForm: FormGroup;
  currentDate: Date | undefined;

  formSubscription$ = new Subject<void>();

  departments: LabelValue[] = [];
  genders: LabelValue[] = [];
  titles: LabelValue[] = [];
  languages: LabelValue[] = [];
  communicationModes: LabelValue[] = [];
  roles: LabelValue[] = [];
  clinics: LabelValue[] = [];
  organizations: LabelValue[] = [];
  statuses: LabelValue[] = [];
  sourcePermissions: TreeNode[] = [];
  selectedPermissions: TreeNode[] = [];
  isPermissionLoading: false;
  get gender(): boolean {  
    return 0 == this.userForm?.get('gender').value ;
  }

  get userId(): string {
    return this.userForm?.get('userId')?.value;
  }

  get maxYearOfExperience(): string {
    return this.userForm?.get('age')?.value ?? 100;
  }

  constructor(private userService: UserService,
    private router: Router,
    private _fb: FormBuilder,
    private notificationService: NotificationService,
    private utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private masterService:MasterService,
    private rolePermissionService: RolePermissionService
  ) {

  }

  ngOnInit() {
    this.initializeMasterData();
    const { params } = this.activatedRoute.snapshot;
    const userId = params['id'];
    if (userId) {
      this.mode = 'Edit';
      this.getUser(userId);
    } else {
      this.initializeForm();
    }
  }

  getUser(userId) {
    this.userService.getUser(userId).subscribe({
      next: ({ data, message }) => { this.initializeForm(data) },
      error: (error) => { this.cancel() }
    })
  }

  ngOnDestroy(): void {
    this.formSubscription$.next();
    this.formSubscription$.complete();
  }

  initializeForm(user?): void {
    this.userForm = this._fb.group({
      userId: new FormControl<string | null>({ value: user?.userId, disabled: true }),
      role: new FormGroup({
        roleId: new FormControl<string | null>(user?.role?.roleId, [Validators.required]),
      }),
      organization: new FormGroup({
        organizationId: new FormControl<string | null>({ value: user?.organization?.organizationId, disabled: user?.userId ? true : false }, [Validators.required]),
      }),
      clinics: new FormControl<string[] | null>(user?.clinics, [Validators.required]),
      title: new FormControl<string | null>(user?.title),
      firstName: new FormControl<string | null>(user?.firstName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      middleName: new FormControl<string | null>(user?.middleName, [Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      lastName: new FormControl<string | null>(user?.lastName, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumeric)]),
      gender: new FormControl<any | null>(user?.gender, [Validators.required]),
      genderFreeText: new FormControl<string | null>(user?.genderFreeText, [Validators.maxLength(64), Validators.pattern(this.alphaNumeric)]),
      dateOfBirth: new FormControl<Date | null>(user?.dateOfBirth ? new Date(user?.dateOfBirth) : undefined, [Validators.required]),
      age: new FormControl<string | null>({ value: null, disabled: true }),
      departmentId: new FormControl<string | null>(user?.departmentId),
      yearOfExperience: new FormControl<number | null>(user?.yearOfExperience, [Validators.required]),
      address1: new FormControl<string | null>(user?.address1, [Validators.required, Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      address2: new FormControl<string | null>(user?.address2, [Validators.maxLength(255), Validators.pattern(this.alphaNumericSpace)]),
      city: new FormControl<string | null>(user?.city, [Validators.required, Validators.maxLength(50)]),
      state: new FormControl<string | null>(user?.state, [Validators.required, Validators.maxLength(50)]),
      country: new FormControl<string | null>(user?.country, [Validators.required, Validators.maxLength(100)]),
      pincode: new FormControl<string | null>(user?.pincode, [Validators.required, Validators.maxLength(6), Validators.pattern(this.numeric)]),
      email: new FormControl<string | null>(user?.email, [Validators.required, Validators.email, Validators.maxLength(100)]),
      mobileNumber: new FormControl<string | null>(user?.mobileNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      status: new FormControl<String | null>(user?.status ?? 1, [Validators.required]),
      preferredLanguages: new FormControl<string[] | null>(user?.preferredLanguages ?? ['en-US'], [Validators.required]),
      communicationModes: new FormControl<string[] | null>(user?.communicationModes ?? [1], [Validators.required]),

      profilePicture: new FormControl<String | null>(undefined),
      idProof: new FormControl<String | null>(undefined),
      nursingLicense: new FormControl<String | null>(undefined),
      certificationDocument: new FormControl<String | null>(undefined),

    });

    const addOrRemoveValidation = (gender) => {
      if (!gender && gender != 0) return;
      const genderFreeText = this.userForm.get('genderFreeText') as FormControl;
      if (0 == gender) {
        if (!genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.addValidators(Validators.required);
        }
      } else {
        if (genderFreeText.hasValidator(Validators.required)) {
          genderFreeText.removeValidators(Validators.required);
        }
      }
    }

    const setClinics = (organizationId, firstLoad?) => {
      if (!organizationId) {
        this.clinics = [];
        this.userForm.get('clinics').setValue([]);
        return;
      }
      this.userService.getClinicLabels(organizationId).subscribe((resp: any) => {
        this.clinics = resp.data;
        if (!firstLoad) {
          this.userForm.get('clinics').setValue([]);
        }
      })
    }

    this.calculateAge();
    addOrRemoveValidation(this.userForm.get('gender').value);
    setClinics(this.userForm.get('organization').get('organizationId').value, true);
    this.loadPermissions(user?.menuPermissions,this.userForm.get('role').get('roleId').value);
    this.userForm.get('gender')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => addOrRemoveValidation(value));
    this.userForm.get('organization').get('organizationId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => setClinics(value));
    this.userForm.get('role').get('roleId')?.valueChanges.pipe(takeUntil(this.formSubscription$)).subscribe((value) => this.loadRolePermission(value));

  }
  calculateAge() {
    if (this.userForm.get('dateOfBirth').value) {
      const birthDate = new Date(this.userForm.get('dateOfBirth').value);
      const fixedDate = new Date(Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()));
      this.userForm.get('dateOfBirth').patchValue(fixedDate);
      let age = this.utilityService.convertDateToAgePSP(fixedDate);
      this.userForm.get('age').setValue(age);
    }
  }

  initializeMasterData() {
    this.currentDate = new Date();
    this.userService.getRoleLabels().subscribe((resp: any) => {
      this.roles = resp.data;
    })

    this.userService.getOrganizationLabels().subscribe((resp: any) => {
      this.organizations = resp.data;
    })

    this.masterService.getDepartmentData().subscribe((resp: any) => {
      this.departments = resp.data;
    })
    const params = ['TITLE', 'GENDER', 'LANGUAGE', 'COMMUNICATION_MODE', 'STATUS']
    this.masterService.getCommonMasterData(params).subscribe((resp: any) => {
      (resp.data as Array<any>).forEach((res: any) => {
        switch (res.name) {
          case 'TITLE':
            this.titles = res.value
            break;
          case 'GENDER':
            this.genders = res.value;
            break;
          case 'LANGUAGE':
            this.languages = res.value
            break;
          case 'COMMUNICATION_MODE':
            this.communicationModes = res.value
            break;
          case 'STATUS':
            this.statuses = res.value
            break;
          default:
            console.log('name not found', res.name);
            break;
        }

      })
    })
  }

  cancel() {
    this.router.navigateByUrl('/home/user/list');
  }

  save() {
    if (this.userForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.userForm);
      return;
    }
    const finalData = this.selectedPermissions.filter(item => item.leaf).map(item => item.key);
    if (finalData.length == 0) {
      this.notificationService.showWarning("Please select at least one permission.")
      return;
    }

    const userId = this.userForm.get('userId').value;
    const organizationId = this.userForm.get('organization').get('organizationId').value;
    const user = this.userForm.value;
    user['organization'] = { organizationId: organizationId }
    user['menuPermissions'] = finalData
    this.isCallInitiated = true;

    const subsription = userId ? this.userService.updateUser(userId, user) :this.userService.saveUser(user);
    subsription.subscribe({
        next: (resp: any) => {
          this.isCallInitiated = false
          this.notificationService.showSuccess(resp.message);
          this.cancel();
        },
        error: async (error: any) => {
          this.isCallInitiated = false;
          this.notificationService.showError(error.message);

        },
        complete: () => { this.isCallInitiated = false }
      })
  }

  loadPermissions(permissions?, roleId?) {
    this.rolePermissionService.getPermissions().subscribe((resp: any) => {
      this.sourcePermissions = resp.data;
      if (permissions && permissions.length > 0) {
        this.resetTree(this.sourcePermissions);
        this.setPermissions(permissions)
      } else if (roleId) {
        this.loadRolePermission(roleId)
      }
    })
  }

  loadRolePermission(roleId) {
    if (!roleId) {
      return;
    }
    this.resetTree(this.sourcePermissions);
    this.rolePermissionService.getRolePermission(roleId).subscribe(
      {
        next: (resp: any) => {
          const permissions = resp.data?.permissions || [];
          if (permissions.length == 0) {
            this.selectedPermissions = [];
            this.isPermissionLoading = false;
            return;
          }
          this.setPermissions(permissions);
          this.isPermissionLoading = false;
        },
        error: (error: any) => {
          this.isPermissionLoading = false;
        }
      });
  }

  private setPermissions(permissions) {
    if (!permissions) return;
    const allowedKeys = new Set<string>(permissions);
    this.selectedPermissions = this.filterPermissions(this.sourcePermissions, allowedKeys);
    this.updateTreeSelection(this.sourcePermissions, new Set(this.selectedPermissions.map(p => p.key)));
    this.isPermissionLoading = false;
  }

  private filterPermissions(nodes: TreeNode[], allowedKeys: Set<string>, parent?: TreeNode): TreeNode[] {
    const result: TreeNode[] = [];
    nodes.forEach(node => {
      if (allowedKeys.has(node.key)) {
        result.push({ ...node, parent: parent ? { ...parent } : null });
      }
      if (node.children?.length) {
        result.push(...this.filterPermissions(node.children, allowedKeys, node));
      }
    });
    return result;
  }

  private resetTree(tree: TreeNode[]) {
    tree.forEach(node => {
      node.partialSelected = false;
      node.expanded = true;
      if (node.children) {
        this.resetTree(node.children)
      }
    });
  }

  private updateTreeSelection(tree: TreeNode[], selectedKeys: Set<string>) {
    tree.forEach(node => {
      if (node.children?.length) {
        this.updateTreeSelection(node.children, selectedKeys);

        const leafKeys = this.getLeafKeys(node.children);
        const selectedCount = leafKeys.filter(key => selectedKeys.has(key)).length;
        const totalCount = leafKeys.length;

        node.partialSelected = selectedCount > 0 && selectedCount < totalCount;

        if (selectedCount === totalCount && !selectedKeys.has(node.key)) {
          this.selectedPermissions.push({ ...node });
          selectedKeys.add(node.key);
        }
      }
    });
  }

  private getLeafKeys(nodes: TreeNode[]): string[] {
    return nodes.flatMap(node =>
      node.leaf ? [node.key] : (node.children && node.children.length > 0 ? this.getLeafKeys(node.children) : [])
    );
  }

}
