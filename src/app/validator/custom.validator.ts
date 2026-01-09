import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { REGEX } from '@constants/regex.constant';

export class CustomValidators {
  static readonly mobileNumber = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const value: string = control.value?.toString().trim() ?? '';

    if (!value) {
      return null;
    }

    const regex = /^(\+91)?\d{10}$/;

    return regex.test(value) ? null : { mobileNumber: true };
  };

  static addressValidator(
    errorKey: 'invalidAddress'
  ): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {

      const value = control.value;
      const addressLineRegex: RegExp = REGEX.ADDRESS_LINE_REGEX;

      if (!value) {
        return null;
      }

      if (typeof value !== 'string') {
        return null;
      }

      if (!addressLineRegex.test(value)) {
        return { [errorKey]: true };
      }

      return null;
    };
  }
}
