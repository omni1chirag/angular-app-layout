import { CommonModule } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { AddressResponse } from '@interface/master.interface';
import { TranslateModule } from '@ngx-translate/core';
import { MasterService } from '@service/master.service';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';
import { CustomValidators } from '../../../validator/custom.validator';

@Component({
  selector: 'app-address',
  imports: [
    ...GLOBAL_CONFIG_IMPORTS,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CommonModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    InputNumberModule,
    IconFieldModule,
    TranslateModule,
    InputIconModule,
    MandatoryFieldLabelDirective,
    DividerModule,
    InputMaskModule,
    InputGroupModule,
    InputGroupAddonModule,
    PhoneNumberMaskDirective,
  ],
  templateUrl: './address.component.html'
})
export class AddressComponent implements OnInit, OnDestroy {

  group = input<FormGroup | undefined>(undefined);
  address2Mandatory = input<string>('false');

  private readonly parentForm = inject(FormGroupDirective, { optional: true });
  private readonly masterService = inject(MasterService);

  readonly blackListControl = input<string[]>([]);
  private readonly subs: Subscription[] = [];

  cities: { label: string; value: string }[] = [];
  states: { label: string; value: string }[] = [];
  countries: { label: string; value: string }[] = [];

  get fg(): FormGroup | undefined {
    return this.group() ?? this.parentForm?.form;
  }

  get address1(): FormControl | null { return this.control('address1'); }
  get address2(): FormControl | null { return this.control('address2'); }
  get street(): FormControl | null { return this.control('street'); }
  get pincode(): FormControl | null { return this.control('pincode'); }
  get city(): FormControl | null { return this.control('city'); }
  get state(): FormControl | null { return this.control('state'); }
  get country(): FormControl | null { return this.control('country'); }
  get mobileNumber(): FormControl | null { return this.control('mobileNumber'); }
  get alternateMobileNumber(): FormControl | null { return this.control('alternateMobileNumber'); }
  get contactNumber(): FormControl | null { return this.control('contactNumber'); }
  get email(): FormControl | null { return this.control('email'); }

  isAddress1Required(): boolean { return this.isRequired('address1'); }
  isAddress2Required(): boolean { return this.isRequired('address2'); }
  isStreetRequired(): boolean { return this.isRequired('street'); }
  isPincodeRequired(): boolean { return this.isRequired('pincode'); }
  isCityRequired(): boolean { return this.isRequired('city'); }
  isStateRequired(): boolean { return this.isRequired('state'); }
  isCountryRequired(): boolean { return this.isRequired('country'); }
  isMobileNumberRequired(): boolean { return this.isRequired('mobileNumber'); }
  isAlternateMobileNumberRequired(): boolean { return this.isRequired('alternateMobileNumber'); }
  isContactNumberRequired(): boolean { return this.isRequired('contactNumber'); }
  isEmailRequired(): boolean { return this.isRequired('email'); }


  ngOnInit(): void {
    if (!this.fg) {
      console.warn('AddressComponent: no FormGroup found/passed');
      return;
    }

    if (!this.isBlacklisted('pincode')) {
      const pincodeCtrl = this.fg.get('pincode');
      if (pincodeCtrl) {
        const s = pincodeCtrl.valueChanges.subscribe((val: string) => {
          const v = (val ?? '').toString();
          if (v.length === 6) {
            this.setPincode(v);
          } else if (v.length < 6) {
            this.resetPincode();
          }
        });
        this.subs.push(s);

        if ((pincodeCtrl.value ?? '').toString().length === 6) {
          this.setPincode(pincodeCtrl.value);
        }
      }
    }
    if (this.mobileNumber) {
      this.mobileNumber.addValidators(CustomValidators.mobileNumber);
    }
    if (this.alternateMobileNumber) {
      this.alternateMobileNumber.addValidators(CustomValidators.mobileNumber);
    }
  }

  private setPincode(pincode: string) {
    const skipAllResults = this.isBlacklisted('city') && this.isBlacklisted('state') && this.isBlacklisted('country');
    if (skipAllResults) {
      return;
    }

    this.masterService.getAddress<AddressResponse>(pincode).subscribe({
      next: (data: AddressResponse) => {
        const { cities = [], states = [], countries = [] } = data ?? {};
        this.cities = cities.map((c: string) => ({ label: c, value: c }));
        this.states = states.map((s: string) => ({ label: s, value: s }));
        this.countries = countries.map((c: string) => ({ label: c, value: c }));

        // Only set controls that are NOT blacklisted
        if (!this.isBlacklisted('city') && this.cities[0]) {
          const cityCtrl = this.fg?.get('city');
          if (this.cities.length && cityCtrl) cityCtrl.setValue(this.cities[0].value);
        }
        if (!this.isBlacklisted('state') && this.states[0]) {
          const stateCtrl = this.fg?.get('state');
          if (this.states.length && stateCtrl) stateCtrl.setValue(this.states[0].value);
        }
        if (!this.isBlacklisted('country') && this.countries[0]) {
          const countryCtrl = this.fg?.get('country');
          if (this.countries.length && countryCtrl) countryCtrl.setValue(this.countries[0].value);
        }
      },
      error: () => this.resetPincode()
    });
  }

  private resetPincode() {
    this.cities = [];
    this.states = [];
    this.countries = [];

    if (!this.isBlacklisted('city')) {
      const cityCtrl = this.fg?.get('city');
      if (cityCtrl) cityCtrl.setValue(undefined);
    }
    if (!this.isBlacklisted('state')) {
      const stateCtrl = this.fg?.get('state');
      if (stateCtrl) stateCtrl.setValue(undefined);
    }
    if (!this.isBlacklisted('country')) {
      const countryCtrl = this.fg?.get('country');
      if (countryCtrl) countryCtrl.setValue(undefined);
    }
  }

  private getBlackList(): string[] {
    try {
      // handle both signal (function) and plain array passed via @Input
      const value = (typeof this.blackListControl === 'function')
        ? (this.blackListControl() as unknown)
        : (this.blackListControl as unknown);
      return Array.isArray(value) ? (value as string[]) : [];
    } catch {
      return [];
    }
  }

  private isBlacklisted(key: string): boolean {
    return this.getBlackList().includes(key);
  }

  private control(name: string): FormControl | null {
    if (!this.fg) return null;
    if (this.isBlacklisted(name)) return null;
    const c = this.fg.get(name);
    return (c instanceof FormControl) ? c : null;
  }

  private isRequired(controlName: string): boolean {
    const validatorResult = this.control(controlName)?.validator?.({} as AbstractControl);
    return validatorResult?.['required'] === true;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

}
