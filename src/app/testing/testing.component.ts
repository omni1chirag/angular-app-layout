import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image';
import { PasswordModule } from 'primeng/password';
import { TabsModule } from 'primeng/tabs';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectButtonModule } from 'primeng/selectbutton';
@Component({
    selector: 'app-testing',
    standalone: true,
    imports: [CommonModule, FormsModule, ImageModule, TabsModule, PasswordModule, ButtonModule, SelectButtonModule],
    templateUrl: './testing.component.html',
    styleUrl: './testing.component.scss'
})
export class TestingComponent {
  checked: boolean = true;
  currentTab = "login";
  loginwithOtp = false;
  selectedOptions: any[] = [];
  stateOptions: any[] = [{ label: 'Provider', value: 'provider' },{ label: 'Patient', value: 'patient' }];

  loginMode: string = 'provider';

  constructor(private router: Router) { }

  onLogin() {
    if (this.loginwithOtp) {
      // this.sendOTP();
    } else {
      this.router.navigate(['home/admin-dashboard']);
    }

  }


}
