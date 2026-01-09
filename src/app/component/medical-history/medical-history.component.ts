import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { FamilyHistoryListComponent } from "./family-history/family-history-list/family-history-list.component";
import { PastMedicalHistoryListComponent } from "./past-medical-history/past-medical-history-list/past-medical-history-list.component";
import { SocialHistoryListComponent } from "./social-history/social-history-list/social-history-list.component";
import { SurgicalHistoryListComponent } from "./surgical-history/surgical-history-list/surgical-history-list.component";
import { LocalStorageService } from '@service/local-storage.service';

@Component({
  selector: 'app-medical-history',
  imports: [DividerModule,
    CommonModule,
    TabsModule, PastMedicalHistoryListComponent, FamilyHistoryListComponent, SocialHistoryListComponent, SurgicalHistoryListComponent],
  templateUrl: './medical-history.component.html',
})
export class MedicalHistoryComponent {
  private readonly localStorageService = inject(LocalStorageService);
  patientId = this.localStorageService.getPatientId();
  appointmentId = input.required<string>();
  readonly signOff = input.required<number>();
  readonly isModifiable = input.required<boolean>();
  activeTabIndex = 0;
}
