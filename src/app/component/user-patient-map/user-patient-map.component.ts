import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PlatformService } from '@service/platform.service';
import { UserService } from '@service/user.service';
import { ButtonModule } from 'primeng/button';

type TemplateState =
  | 'invalidLink'
  | 'loading'
  | 'expireLink'
  | 'reject'
  | 'confirm'
  | 'alreadyUsed'
  | 'error';


@Component({
  selector: 'app-user-patient-map',
  imports: [
    CommonModule,
    ButtonModule,
    RouterModule
  ],
  templateUrl: './user-patient-map.component.html',
  styleUrl: './user-patient-map.component.scss'
})
export class UserPatientMapComponent implements OnInit {
  secretKey: string | null = null;
  action: string | null = null;
  activeTemplate: TemplateState = 'loading';
  isBrowser: boolean = false;
  constructor(private route: ActivatedRoute,
    private platformService: PlatformService,
    private userService: UserService
  ) {
    this.isBrowser = platformService.isBrowser();

  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.secretKey = this.route.snapshot.queryParamMap.get('secretkey');
    this.action = this.route.snapshot.queryParamMap.get('action');
    if (!this.secretKey || this.secretKey.length != 12 || !this.action || (this.action != 'reject' && this.action != 'confirm')) {
      this.activeTemplate = 'invalidLink'
    } else {
      this.verifyMapping()
    }
  }

  verifyMapping() {
    this.userService.verifyMapping({ 'secretKey': this.secretKey, 'action': this.action }).subscribe({
      next: (resp) => {
        const data = resp.data;
        this.activeTemplate = this.mapStatusToTemplate(data.status);
      },
      error: (error) => {
        this.activeTemplate = 'error';
      }
    })
  }

  private mapStatusToTemplate(status: string): TemplateState {
    switch (status) {
      case 'EXPIRED_LINK': return 'expireLink';
      case 'INVALID_SECRET_KEY': return 'invalidLink';
      case 'LINK_ALREADY_USED': return 'alreadyUsed';
      case 'CONFIRM': return 'confirm';
      case 'REJECT': return 'reject';
      default: return 'error';
    }
  }


}
