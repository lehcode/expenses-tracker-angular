import { AbstractControl, ValidatorFn } from "@angular/forms"

// Validator for 2 decimal places
export const decimalPrecisionValidator = (precision: number): ValidatorFn => {
  return (control: AbstractControl): Record<string, unknown> | null => {
    if (!control.value) return null;
    
    const regex = new RegExp(`^\\d+\\.\\d{${precision}}$`);
    const valid = regex.test(control.value.toString());
    return valid ? null : {'decimalPrecision': {value: control.value}};
  };
};