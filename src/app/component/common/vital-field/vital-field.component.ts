import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnDestroy } from '@angular/core';
import { FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { VitalConfig, VitalField } from '@interface/vital-interface';
import { TranslateModule } from '@ngx-translate/core';
import { VitalsService } from '@service/vital.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-vital-field',
  imports: [ReactiveFormsModule,
    CommonModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    TranslateModule],
  templateUrl: './vital-field.component.html',
})
export class VitalFieldComponent implements OnDestroy {

  private readonly parentForm = inject(FormGroupDirective);

  readonly vitalName = input.required<string>();
  readonly displayLabel = input<boolean>(true);
  readonly initialData = input<VitalField>();
  readonly required = input<boolean>(false);

  private form = this.parentForm.form;
  private priviousVitalName: string | undefined;

  vitalConfig: VitalConfig | undefined;
  vitalFieldForm: FormGroup | undefined;
  vitalColorMap = new Map([
    ['Normal', 'text-green-600'],
    ['Abnormal', 'text-red-600']
  ]);

  private readonly vitalService = inject(VitalsService);

  constructor() {
    this.form = this.parentForm.form;

    effect(() => {
      if (!this.vitalName()) {
        this.vitalConfig = undefined;
        this.vitalFieldForm = undefined;
        return;
      }
      if (!this.form) {
        this.form = this.parentForm.form;
      }
      const name = this.vitalName();
      if (this.priviousVitalName) {
        if (this.form.contains(this.priviousVitalName)) {
          this.form.removeControl(this.priviousVitalName);
        }
      }
      if (this.form.contains(name)) {
        this.form.removeControl(name);
      }

      this.vitalConfig = this.vitalService.vitalMap.get(this.vitalName());
      if (!this.vitalConfig) {
        throw new Error(`Vital config not found for: ${this.vitalName()}`);
      }
      this.priviousVitalName = this.vitalName();

      const checkFn = this.vitalConfig.checkFnKey
        ? this.vitalService.getCheckFnByKey(this.vitalConfig.checkFnKey)
        : undefined;
      const validators = this.vitalConfig.validators ? [...this.vitalConfig.validators] : [];
      if (this.required()) {
        validators.push(Validators.required)
      }
      const control = this.vitalService.getVitalFieldForm(
        this.initialData() ?? {} as VitalField,
        validators,
        this.vitalConfig.defaultUnit,
        checkFn,
        this.form,
        this.vitalConfig.isDisabled ?? false,

      );
      this.vitalFieldForm = control;
      this.form.addControl(this.vitalName(), control);
    });
  }

  ngOnDestroy(): void {
    const name = this.vitalName();
    const form = this.parentForm.form;
    if (form.contains(name)) {
      form.removeControl(name);
    }
  }

  allowKeyCheck(event: KeyboardEvent): void {
    const inputChar = event.key;
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(inputChar);

    if (isControlKey) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const currentValue = input.value;
    const newValue = currentValue.slice(0, input.selectionStart ?? 0) + inputChar + currentValue.slice(input.selectionEnd ?? 0);
    if (!this.vitalConfig?.pattern?.test(newValue)) {
      event.preventDefault();
    }
  }


  formatCheckOnBlur(event: FocusEvent): void {

    const input = (event.target as HTMLInputElement);
    const value = input.value;

    const match = this.vitalConfig?.pattern?.exec(value);

    if (!match) {
      input.value = '';
      this.vitalFieldForm?.get('value')?.setValue('');
    }
  }

}
