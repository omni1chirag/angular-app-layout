import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('startTime')?.value;
  const end = group.get('endTime')?.value;

  if (!start || !end) return null; // don't validate if empty

  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);

  if (start && end && start >= end) {
    group.get('startTime')?.setErrors({ invalidTimeRange: true });
    group.get('endTime')?.setErrors({ invalidTimeRange: true });
    return { invalidTimeRange: true };
  } else {
    group.get('startTime')?.setErrors(null);
    group.get('endTime')?.setErrors(null);
    return null;
  }
};
