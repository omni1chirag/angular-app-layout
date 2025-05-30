import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabsModule } from 'primeng/tabs';
import { interval, Subscription } from 'rxjs';
import { ImageModule } from 'primeng/image';
import { StyleClassModule } from 'primeng/styleclass';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageModule,
    TabsModule,
    PasswordModule,
    ButtonModule,
    SelectButtonModule,
    CheckboxModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputOtpModule,
    StyleClassModule,
    ProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  selectedOptions: any[] = [];
  currentTab = "login";
  otp: number | undefined = undefined;
  formattedTime = '01:30';
  stateOptions: any[] = [{ label: 'Doctor', value: 'doctor' }, { label: 'Patient', value: 'patient' }];
  loginMode: string = 'doctor';
  loginwithOtp = false;
  registrationForm: {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  } = {
      firstName: '',
      lastName: '',
      email: '',
      mobile: ''
    }
  private countdownTime = 90;
  private subscription!: Subscription;

  constructor(private router: Router) {
  }
  
  submitOTP() {
    if (this.loginwithOtp) {
      this.router.navigate(['home']);
    } else {
      localStorage.setItem('doctor', JSON.stringify(this.registrationForm));
      this.router.navigate(['registration']);
    }
  }

  sendOTP() {
    this.currentTab = "otpVerification";
    this.startCountdown();
  }
  startCountdown() {
    this.subscription = interval(1000).subscribe(() => {
      if (this.countdownTime > 0) {
        this.countdownTime--;
        this.formattedTime = this.formatTime(this.countdownTime);
      } else {
        this.subscription.unsubscribe();
      }
    });
  }
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.padZero(minutes)}:${this.padZero(secs)}`;
  }
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
  onLogin() {
    if (this.loginwithOtp) {
      this.sendOTP();
    } else {
      this.router.navigate(['home']);
    }

  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
