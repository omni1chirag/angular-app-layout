import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
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
import { MandatoryFieldLabelDirective } from '@directive/mandatory-field-label.directive';
import { PhoneNumberMaskDirective } from '@directive/phone-number-mask.directive';
import { ApiService } from '@service/api.service';
import { NotificationService } from '@service/notification.service';

@Component({
  selector: 'app-address',
  imports: [
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
    PhoneNumberMaskDirective,
    InputGroupModule,
    InputGroupAddonModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.scss'
})
export class AddressComponent implements OnInit {

  private parentForm = inject(FormGroupDirective);
  private apiService = inject(ApiService);
  private notification = inject(NotificationService);

  readonly blackListControl = input<Array<string>>([]);

  address1: FormControl;
  address2: FormControl;
  pincode: FormControl;
  city: FormControl;
  state: FormControl;
  country: FormControl;
  mobileNumber: FormControl;
  alternateMobileNumber:FormControl;
  contactNumber:FormControl;
  email: FormControl;

  cities: any[] = [];
  states: any[] = [];
  countries: any[] = [];

  onPincodeChange($event) {
    const pincode = $event.value;
    if (pincode == null || (pincode + "").length < 6) {
      this.resetPincode()
      return;
    }
    this.setPincode(pincode);
  }

  setPincode(pincode) {
    this.apiService.get(`master-api/master/address/${pincode}`).subscribe({
      next: (response: any) => {
        const { cities = [], states = [], countries = [] } = response.data
        this.cities = cities.map(city => { return { label: city, value: city } });
        this.states = states.map(state => { return { label: state, value: state } });
        this.countries = countries.map(country => { return { label: country, value: country } });
        this.city?.setValue(this.cities[0].value)
        this.state?.setValue(this.states[0].value)
        this.country?.setValue(this.countries[0].value)
      },
      error: (error) => {
        if (error?.originalError?.status === 404) {
          this.resetPincode();
        } else {
          this.notification.showError(error?.error?.error || 'Unknown error occurred');
          console.error('Other error handling:', error);
        }
      }
    }
    )
  }

  resetPincode() {
    this.cities = [];
    this.city?.setValue(undefined)
    this.states = [];
    this.state?.setValue(undefined)
    this.countries = [];
    this.country?.setValue(undefined)
  }

  ngOnInit(): void {
    if (this.parentForm && this.parentForm.form) {
      ['address1', 'address2', 'pincode', 'city', 'state', 'country', 'mobileNumber', 'email','contactNumber','alternateMobileNumber'].forEach(key => {
        if (this.parentForm.form.get(key)) {
          if(!this.blackListControl().some(name => name == key)){
            this[key] = this.parentForm.form.get(key) as FormControl;
          }
        }
      })
      if (this.pincode && (this.pincode.value + "").length == 6) {
        this.setPincode(this.pincode.value);
      }
    }
  }
}
