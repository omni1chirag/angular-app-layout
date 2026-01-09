import { FormValidationDirective } from '@directive/common/form-validation.directive';
import { InputDirective } from '@directive/common/input.directive';
import { SelectConfigDirective } from '@directive/common/select-config.directive';

export const GLOBAL_CONFIG_IMPORTS = [
  SelectConfigDirective,
  InputDirective,
  FormValidationDirective,
];
