import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlatformService } from '@service/platform.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DoctorCardComponent } from "@component/doctor-card/doctor-card.component";
import { DoctorVisitDTO } from '@interface/doctor.interface';
import { CommonModule } from '@angular/common';
import { PatientService } from '@service/patient.service';
import { LocalStorageService } from '@service/local-storage.service';
import { environment } from '@environment/environment';
import { DashboardStateService } from '@service/dashboard-state.service';
@Component({
  selector: 'app-dashboard',
  imports: [DialogModule, InputNumberModule, ButtonModule, FormsModule, InputTextModule, DoctorCardComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly platformService = inject(PlatformService);
  private readonly patientService = inject(PatientService);
  private readonly localStorageService = inject(LocalStorageService);

  private readonly dashboardStateService = inject(DashboardStateService);

  showLeftBtn = false;
  showRightBtn = false;
  @ViewChild('doctorCardContainer', { read: ElementRef }) readonly doctorCardContainer!: ElementRef<HTMLElement>;
  private resizeObserver!: ResizeObserver;

  isBrowser = false;
  visitedDoctors: DoctorVisitDTO[] = [];
  patientId = this.localStorageService.getPatientId();
  doctorsLimit = 5;
  host = environment.host;
  constructor() {
    this.isBrowser = this.platformService.isBrowser();

    this.dashboardStateService.reload$.subscribe(value => {
      if (value) {
        this.ngOnInit();
      }
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.patientId = this.localStorageService.getPatientId();
    this.loadLastVisitedDoctors();
  }

  loadLastVisitedDoctors(): void {
    this.patientService.getLastVisitedDoctors<DoctorVisitDTO[]>(this.patientId, this.doctorsLimit).subscribe({
      next: (data) => {
        this.visitedDoctors = data;
      }
    })
  }

  scrollTimeline(direction: number): void {
    const container = this.doctorCardContainer.nativeElement;
    const distance = container.clientWidth * 0.6;
    container.scrollTo({ left: container.scrollLeft + distance * direction, behavior: 'smooth' });
    setTimeout(() => this.updateScrollButtons(), 250);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/default-doctor.png';
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.resizeObserver = new ResizeObserver(() => this.updateScrollButtons());
    this.resizeObserver.observe(this.doctorCardContainer.nativeElement);
    setTimeout(() => {
      this.updateScrollButtons();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
  updateScrollButtons(): void {
    const el = this.doctorCardContainer.nativeElement;
    const canScroll = el.scrollWidth > el.clientWidth;

    if (!canScroll) {
      this.showLeftBtn = false;
      this.showRightBtn = false;
      return;
    }

    this.showLeftBtn = el.scrollLeft > 5;
    this.showRightBtn = el.scrollLeft + el.clientWidth < el.scrollWidth - 5;
  }

  onScroll(): void {
    this.updateScrollButtons();
  }
}
