import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@environment/environment';
import { Doctor, DoctorVisitDTO } from '@interface/doctor.interface';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-doctor-card',
  imports: [CardModule, CommonModule],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.scss'
})
export class DoctorCardComponent implements OnInit {

  private readonly _router = inject(Router);

  @Input() visitedDoctor!: DoctorVisitDTO;
  readonly host = environment.host;

  doctorImageUrl = '';
  imageLoadError = false;
  defaultImageUrl = 'assets/images/client.jpg';


  ngOnInit(): void {
    this.doctorImageUrl = `${this.host}/document-api/documents/modules/4/sub-modules/4/documents/${this.visitedDoctor.doctor.doctorId}/original`;
  }

  onImageError(event: Event): void {
    this.imageLoadError = true;
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImageUrl;
  }

  getDoctorFullName(): string {
    const { title, firstName, lastName } = this.visitedDoctor.doctor;
    return `${title || ''} ${firstName || ''} ${lastName || ''}`.trim();
  }

  doctorCardClickEvent(doctor: Doctor): void {
    if(!doctor) return;
    this.navigateTo(`/home/doctor/${doctor.doctorId}`);
  }

  navigateTo(path: string, queryParams?: { query: string, city: string }): void {
    this._router.navigate(path.split('/').filter(Boolean), {
      queryParams,
      replaceUrl: true
    });
  }
}
