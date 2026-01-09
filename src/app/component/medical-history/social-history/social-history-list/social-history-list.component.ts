import { CommonModule } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Component, inject, input, OnInit } from '@angular/core';
import { SocialHistoryInterface } from '@interface/social-history.interface';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformService } from '@service/platform.service';
import { SocialHistoryService } from '@service/social-history-service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from "primeng/card";
import { ChipModule } from "primeng/chip";
import { DividerModule } from 'primeng/divider';
import { SocialHistoryAddEditComponent } from "../social-history-add-edit/social-history-add-edit.component";
import { GLOBAL_CONFIG_IMPORTS } from 'src/app/global-config-import';

@Component({
  selector: 'app-social-history-list',
  imports: [SocialHistoryAddEditComponent,
    ButtonModule,
    TranslateModule,
    ChipModule,
    DividerModule,
    CommonModule,
    CardModule,
    ...GLOBAL_CONFIG_IMPORTS
  ],
  templateUrl: './social-history-list.component.html',
})
export class SocialHistoryListComponent implements OnInit {

  socialHistoryId: string;
  visible = false;
  patientId = input.required<string>();
  appointmentId = input.required<string>();
  readonly isModifiable = input.required<boolean>();
  records: { key: string; value: string | number | boolean | null }[] = [];
  socialHistoryData: SocialHistoryInterface;
  // selectedSocialHistory: SocialHistoryInterface;
  readonly signOff = input.required<number>();
  isBrowser = false;

  private readonly platformService = inject(PlatformService);
  private readonly socialHistoryService = inject(SocialHistoryService);

  constructor() {
    this.isBrowser = this.platformService.isBrowser();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadData();
  }

  addSocialHistory(): void {
    this.visible = true;
    this.socialHistoryId = null;
  }

  editSocialHistory(socialHistoryId: string): void {
    this.visible = true;
    this.socialHistoryId = socialHistoryId;
  }

  castToString(value: unknown): string {
    return value as string;
  }

  loadData(): void {
    if (!this.isBrowser) return;

    let params = new HttpParams();
    if (this.appointmentId?.()) {
      params = params.append('appointment', this.appointmentId());
    }
    params.append('source', 'PATIENT_APP')

    this.socialHistoryService.getAllSocialHistory<SocialHistoryInterface>(this.patientId(), params).subscribe({
      next: (data) => {
        this.socialHistoryData = data;

        if (this.socialHistoryData) {
          this.records = Object.entries(this.socialHistoryData)
            .filter(([key]) => key !== 'socialHistoryId')   // ⬅️ exclude id
            .map(([key, value]) => ({
              key: this.formatKey(key),
              value: value ?? 'N/A'
            }));
        } else {
          this.records = [];
        }
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.socialHistoryData = null;
        this.records = [];
      }
    });
  }

  private formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

}
