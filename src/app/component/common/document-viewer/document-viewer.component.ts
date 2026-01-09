import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DocumentService } from '@service/document.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-document-viewer',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ImageModule,
    ButtonModule
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit {

  blank(): void {
    throw new Error('Method not implemented.');
  }

  private readonly documentService = inject(DocumentService);
  public ref = inject(DynamicDialogRef);

  readonly url = input.required<string>();
  readonly documentId = input<string>();
  readonly title = input<string>('Document');

  @ViewChild('previewImg', { read: ElementRef }) previewImg!: ElementRef<HTMLImageElement>;
  blobUrl: SafeResourceUrl | SafeUrl | null = null;
  isZoomIn = false;
  isZoomOut = false;
  isPanning = false;
  private startX = 0;
  private startY = 0;
  private initialTranslateX = 0;
  private initialTranslateY = 0;
  translateX = 0;
  translateY = 0;
  private readonly step = 0.1;
  scale = 1;

  ngOnInit(): void {
    this.blobUrl = this.documentService.toTrustedResourceUrl(this.url());
  }

  onClose(): void {
    URL.revokeObjectURL(this.url());
    this.ref.close();
  }

  activateZoom(zoomType: 'In' | 'Out'): void {
    this.isZoomIn = zoomType === 'In' ? !this.isZoomIn : false;
    this.isZoomOut = zoomType === 'Out' ? !this.isZoomOut : false;
  }

  zoomIn(): void {
    this.scale = Math.min(this.scale + this.step, 5);  // max 5×
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale - this.step, 0.2); // min 0.2×
    if (this.scale === 1) {
      this.translateY = this.translateX = 0
    }
  }

  onPreviewClick(event: MouseEvent): void {
    if ((!this.isZoomIn && !this.isZoomOut) || this.isPanning) return;

    const imgEl = this.previewImg.nativeElement;
    const rect = imgEl.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    imgEl.style.transformOrigin = `${offsetX}px ${offsetY}px`;
    const oldScale = this.scale;

    if (this.isZoomIn) {
      this.zoomIn();
    }
    if (this.isZoomOut) {
      this.zoomOut();
    }

    const newScale = this.scale;

    const deltaX = offsetX * (oldScale - newScale);
    const deltaY = offsetY * (oldScale - newScale);

    this.translateX += deltaX;
    this.translateY += deltaY;

    this.applyTransform();
  }

  startPan(event: MouseEvent): void {
    this.isPanning = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.initialTranslateX = this.translateX;
    this.initialTranslateY = this.translateY;
    event.preventDefault();
  }

  doPan(event: MouseEvent): void {
    if (!this.isPanning) return;

    const deltaX = (event.clientX - this.startX) / this.scale;
    const deltaY = (event.clientY - this.startY) / this.scale;

    this.translateX = this.initialTranslateX + deltaX;
    this.translateY = this.initialTranslateY + deltaY;

    this.applyTransform();
  }

  endPan(event: MouseEvent): void {
    this.isPanning = false;
    event?.preventDefault();
  }

  private applyTransform() {
    const imgEl = this.previewImg.nativeElement;
    imgEl.style.transform = `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }

}
