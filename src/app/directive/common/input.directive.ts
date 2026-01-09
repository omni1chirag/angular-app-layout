import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { distinctUntilChanged, filter, Subject, takeUntil } from 'rxjs';

@Directive({
  selector: `input[formControlName], input[formControl]`,
})
export class InputDirective implements OnInit, OnDestroy {
  private readonly control = inject(NgControl, { optional: true });
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.control.control?.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((value) => typeof value === 'string' && value.trim() === ''),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.control.control?.setValue(undefined, { emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
