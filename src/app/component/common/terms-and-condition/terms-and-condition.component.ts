import { CommonModule } from '@angular/common';
import { HttpParams } from "@angular/common/http";
import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TermsAndConditionService } from '@service/terms-and-condition.service';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TermsAndCondition, TermsConent, TermsStatusResponse } from 'src/app/terms-and-condition.interface';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-terms-and-condition',
  imports: [CheckboxModule, CommonModule, ReactiveFormsModule, FormsModule,
    DialogModule
  ],
  templateUrl: './terms-and-condition.component.html',
  styles: ['::ng-deep .p-dialog .p-dialog-header {  padding: 0.5rem 0.75rem;  font-size: 0.95rem;}']
})
export class TermsAndConditionComponent implements OnInit {

  termsForm: FormGroup

  private readonly parentForm = inject(FormGroupDirective);
  private readonly termsService = inject(TermsAndConditionService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);

  groupType = input.required<string>();
  module = input.required<string>();
  entityId = input.required<string>();

  termsAndConditions = signal<TermsAndCondition[]>([]);
  isDialogVisible = signal<boolean>(false);
  selectedTerm = signal<TermsAndCondition | undefined>(undefined);

  constructor() {
    effect(() => {
      if (this.entityId()) {
        this.checkTermsStatus();
      }
    })
  }

  ngOnInit(): void {
    this.getLatestTerms();
  }

  private checkTermsStatus() {
    const params = new HttpParams().append("groupType", this.groupType())
      .append("module", this.module()).append("entityId", this.entityId());

    this.termsService.checkTermsStatus<TermsStatusResponse[]>(params).subscribe((data: TermsStatusResponse[] = []) => {
      const updates = data.reduce((acc, item) => {
        acc[`term_${item.termsId}`] = item.accepted;
        return acc;
      }, {} as Record<string, boolean>);
      this.termsForm.patchValue(updates);
    });
  }

  private generateForm(): FormGroup {
    return this.fb.group({
      groupType: new FormControl<string | null>(this.groupType(), [Validators.required]),
    });
  }

  private getLatestTerms() {
    const params = new HttpParams().append("groupType", this.groupType()).append("module", this.module());

    this.termsService.getLatestTerms<TermsAndCondition[]>(params).subscribe((data: TermsAndCondition[]) => {
      data.forEach(e => {
        e.title = e.title ? DOMPurify.sanitize(e.title) : e.title;
        e.label = e.label ? DOMPurify.sanitize(e.label) : e.label;
        e.sanitizeContent = e.content ? DOMPurify.sanitize(e.content) : e.content;
      });
      this.termsAndConditions.set(data);


      const form = this.parentForm.form;
      if (form.contains('terms')) {
        form.removeControl('terms')
      }
      this.termsForm = this.generateForm();
      this.termsAndConditions().forEach(term => {
        this.termsForm.addControl(`term_${term.id}`, new FormControl<boolean>(false, term.mandatory ? Validators.requiredTrue : []
        ));
      });
      form.addControl('terms', this.termsForm);
    })
  }

  openDialog(item: TermsAndCondition): void {
    this.selectedTerm.set(item);
    this.isDialogVisible.set(true)
  }

  closeDialog(): void {
    this.isDialogVisible.set(false);
    this.selectedTerm.set(undefined);
  }


  public getSelectedTerms(): { groupType: string, terms: TermsConent[] } {
    const termsIds = Object.entries(this.termsForm.controls)
      .filter(([key, control]) => key.startsWith('term_') && control.valid)
      .map(([key]) => key.split('_')[1])
      .filter((e): e is string => e !== undefined)
      .map(e => +e);

    const terms = termsIds
      .map(id => {
        const found = this.termsAndConditions().find(f => f.id === id);
        return found ? { termsId: id, content: found.content } : null;
      })
      .filter(Boolean);

    return { groupType: this.groupType(), terms: terms.length ? terms as TermsConent[] : [] };
  }


}
