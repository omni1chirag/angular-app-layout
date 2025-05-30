import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { NotificationService } from '@service/notification.service';
import { RolePermissionService } from '@service/role-permission.service';
import { TextareaModule } from 'primeng/textarea';
import { UtilityService } from '@service/utility.service';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';

@Component({
  selector: 'app-role-add-edit',
  imports: [ButtonModule,
    InputTextModule,
    TextareaModule,
    ReactiveFormsModule,
    FormsModule,
    MandatoryFieldLabelDirective,
    ToolbarModule,
  ],
  templateUrl: './role-add-edit.component.html',
  styleUrl: './role-add-edit.component.scss'
})
export class RoleAddEditComponent implements OnInit {

  roleForm: FormGroup;
  alphaNumeric: RegExp = new RegExp(/^[a-zA-Z0-9]+$/)
  alphaNumericSpace: RegExp = new RegExp(/^[a-zA-Z0-9\s]+$/)

  constructor(private rolePermissionService: RolePermissionService,
    private notificationService: NotificationService,
    private ref: DynamicDialogRef,
    private utilityService: UtilityService,
    private _fb: FormBuilder
  ) { }
  
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.roleForm = this._fb.group({
      roleName: new FormControl<string | null>(undefined, [Validators.required, Validators.maxLength(50), Validators.pattern(this.alphaNumericSpace)]),
      description: new FormControl<string | null>(undefined, [Validators.maxLength(300), Validators.pattern(this.alphaNumericSpace)]),
      status: new FormControl<string | null>('1', [Validators.required]),
    });
  }
  createRole() {
    if (this.roleForm.invalid) {
      this.utilityService.markControlsAsDirtyAndTouched(this.roleForm);
      return;
    }
    this.rolePermissionService.createRole(this.roleForm.value).subscribe({
      next: (resp: any) => {
        this.notificationService.showSuccess(resp.message);
        this.ref.close(resp.data);
      },
      error: () => {

      }
    })
  }

}
