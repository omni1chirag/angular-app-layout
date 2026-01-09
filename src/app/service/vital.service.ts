import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { VitalConfig, VitalField } from '@interface/vital-interface';

@Injectable({
  providedIn: 'root'
})
export class VitalsService {

  private readonly fb = inject(FormBuilder);

  referenceRanges = {
    bodyTemperature: { min: 97.0, max: 99.0 }, // °F
    heartRate: { min: 60, max: 100 }, // bpm
    respiratoryRate: { min: 12, max: 20 }, // breaths/min
    bloodPressure: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } }, // mmHg
    spo2: { min: 95, max: 100 }, // %
    bmi: { underweight: 18.5, normal: 24.9, overweight: 29.9 }, // kg/m²
    bloodGlucose: { min: 70, max: 99 } // mg/dL (fasting)
  };

  vitalList: string[] = [
    'bodyTemperature',
    'weight',
    'height',
    'bmi',
    'heartRate',
    'spo2',
    'respiratoryRate',
    'bloodPressure',
    'bloodGlucose'
  ]


  vitalMap = new Map<string, VitalConfig>([
    ['bodyTemperature', {
      label: 'BODY_TEMPERATURE',
      placeHolder: 'e.g. 98.6',
      defaultUnit: '°F',
      pattern: /^\d{1,3}(\.\d{0,2})?$/,
      validators: [
        Validators.min(80),
        Validators.max(110),
        Validators.pattern(/^\d{1,3}(\.\d{0,2})?$/)
      ],
      checkFnKey: 'checkBodyTemperature',
      unit: [
        { label: '°F', value: 'F' },
        { label: '°C', value: 'C' }
      ]
    }],
    ['weight', {
      label: 'WEIGHT',
      placeHolder: 'e.g. 70.5',
      defaultUnit: 'kg',
      pattern: /^\d{1,3}(\.\d{0,2})?$/,
      validators: [
        Validators.min(0),
        Validators.max(500),
        Validators.pattern(/^\d{1,3}(\.\d{0,2})?$/)
      ],
      checkFnKey: 'calculateBMI',
      unit: [
        { label: 'kg', value: 'kg' },
        { label: 'lbs', value: 'lbs' }
      ]
    }],
    ['height', {
      label: 'HEIGHT',
      placeHolder: 'e.g. 175.3',
      defaultUnit: 'cm',
      pattern: /^\d{1,3}(\.\d{0,2})?$/,
      validators: [
        Validators.min(0),
        Validators.max(300),
        Validators.pattern(/^\d{1,3}(\.\d{0,2})?$/)
      ],
      checkFnKey: 'calculateBMI',
      unit: [
        { label: 'feet', value: 'feet' },
        { label: 'cm', value: 'cm' },
        { label: 'inches', value: 'inches' }
      ]
    }],
    ['heartRate', {
      label: 'HEART_RATE',
      placeHolder: 'e.g. 72',
      defaultUnit: 'bpm',
      pattern: /^\d{1,3}$/,
      validators: [
        Validators.min(0),
        Validators.max(300),
        Validators.pattern(/^\d{1,3}$/)
      ],
      checkFnKey: 'checkHeartRate',
      unit: [
        { label: 'bpm', value: 'bpm' }
      ]
    }],
    ['spo2', {
      label: 'SPO2',
      placeHolder: 'e.g. 98',
      defaultUnit: '%',
      pattern: /^\d{1,3}$/,
      validators: [
        Validators.min(0),
        Validators.max(100),
        Validators.pattern(/^\d{1,3}$/)
      ],
      checkFnKey: 'checkSpo2',
      unit: [
        { label: '%', value: '%' }
      ]
    }],
    ['respiratoryRate', {
      label: 'RESPIRATORY_RATE',
      placeHolder: 'e.g. 18',
      defaultUnit: 'breaths/min',
      pattern: /^\d{0,2}$/,
      validators: [
        Validators.min(0),
        Validators.max(60),
        Validators.pattern(/^\d{0,2}$/)
      ],
      checkFnKey: 'checkRespiratoryRate',
      unit: [
        { label: 'breaths/min', value: 'breaths/min' }
      ]
    }],
    ['bloodPressure', {
      label: 'BLOOD_PRESSURE',
      placeHolder: 'e.g. 120/80',
      isBloodPressure: true,
      defaultUnit: 'mmHg',
      pattern: /^\d{0,3}(\/\d{0,3})?$/,
      validators: [
        Validators.pattern(/^\d{1,3}\/\d{1,3}$/)
      ],
      checkFnKey: 'checkBloodPressure',
      unit: [
        { label: 'mmHg', value: 'mmHg' }
      ]
    }],
    ['bmi', {
      label: 'BMI',
      placeHolder: 'Auto calculated',
      defaultUnit: 'kg/m²',
      validators: [],
      checkFnKey: 'checkBmi',
      isDisabled: true,
      unit: [
        { label: 'kg/m²', value: 'kg/m²' }
      ]
    }],
    ['bloodGlucose', {
      label: 'BLOOD_GLUCOSE',
      placeHolder: 'e.g. 95',
      defaultUnit: 'mg/dL',
      pattern: /^\d{1,3}$/,
      validators: [
        Validators.min(0),
        Validators.max(1000),
        Validators.pattern(/^\d{1,3}$/)
      ],
      checkFnKey: 'checkBloodGlucose',
      unit: [
        { label: 'mg/dL', value: 'mg/dL' }
      ]
    }]
  ]);

  getCheckFnByKey(
    key: 'checkHeartRate' | 'checkSpo2' | 'checkBodyTemperature' | 'checkBloodPressure' | 'calculateBMI' | 'checkBmi' | 'checkBloodGlucose' | 'checkRespiratoryRate'
  ): ((form: FormGroup) => void) {
    const fnMap = {
      checkHeartRate: this.checkHeartRate.bind(this),
      checkSpo2: this.checkSpo2.bind(this),
      checkBodyTemperature: this.checkBodyTemperature.bind(this),
      checkBloodPressure: this.checkBloodPressure.bind(this),
      calculateBMI: this.calculateBMI.bind(this),
      checkBmi: this.checkBmi.bind(this),
      checkBloodGlucose: this.checkBloodGlucose.bind(this),
      checkRespiratoryRate: this.checkRespiratoryRate.bind(this),
    };

    return fnMap[key];
  }


  getVitalFieldForm(vital: VitalField, validatiors: ValidatorFn[], defaultUnit: string, checkIsNormalReading: ((form: FormGroup) => void) | undefined, form: FormGroup, isdisabled = false): FormGroup {
    const fieldForm = this.fb.group({
      value: new FormControl<number>({ value: vital.value, disabled: isdisabled }, [...validatiors]),
      unit: new FormControl<string>(vital.unit ?? defaultUnit),
      status: new FormControl<string>(vital.status)
    });
    if (checkIsNormalReading) {
      fieldForm.valueChanges.subscribe(() => checkIsNormalReading(form));
    }
    return fieldForm;
  }

  calculateBMI(form: FormGroup): void {
    const heightForm = form.get('height');
    const weightForm = form.get('weight');
    const bmiForm = form.get('bmi');
    if (!heightForm || !weightForm || !bmiForm) {
      return;
    }

    const height = heightForm.get('value')?.value;
    const weight = weightForm.get('value')?.value;

    const heightUnit = heightForm.get('unit')?.value;
    const weightUnit = weightForm.get('unit')?.value;

    if (height && weight) {
      // Convert to metric if needed
      let heightInMeters = height;
      let weightInKg = weight;

      // Convert height to meters
      if (heightUnit === 'in') {
        heightInMeters = height * 0.0254; // inches to meters
      } else if (heightUnit === 'ft') {
        heightInMeters = height * 0.3048; // feet to meters
      } else if (heightUnit === 'cm') {
        heightInMeters = height / 100; // cm to meters
      }

      // Convert weight to kg
      if (weightUnit === 'lbs') {
        weightInKg = weight * 0.453592; // pounds to kg
      }

      const bmi = weightInKg / (heightInMeters * heightInMeters);
      bmiForm.get('value')?.setValue(parseFloat(bmi.toFixed(2)));
    } else {
      bmiForm.get('value')?.setValue(null);
    }
  }

  checkBodyTemperature(form: FormGroup): void {
    const vital = form.get('bodyTemperature') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const unit = vital.get('unit')?.value;
    const temp = unit === '°C' ? (value * 9 / 5) + 32 : value;
    const isNormal = temp >= this.referenceRanges.bodyTemperature.min &&
      temp <= this.referenceRanges.bodyTemperature.max;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkSpo2(form: FormGroup): void {
    const vital = form.get('spo2') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const isNormal = value >= this.referenceRanges.spo2.min;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkRespiratoryRate(form: FormGroup): void {
    const vital = form.get('respiratoryRate') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const isNormal = value >= this.referenceRanges.respiratoryRate.min &&
      value <= this.referenceRanges.respiratoryRate.max;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkBloodPressure(form: FormGroup): void {
    const vital = form.get('bloodPressure') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const [systolic, diastolic] = value.split('/').map(Number);
    const isNormal = systolic >= this.referenceRanges.bloodPressure.systolic.min &&
      systolic <= this.referenceRanges.bloodPressure.systolic.max &&
      diastolic >= this.referenceRanges.bloodPressure.diastolic.min &&
      diastolic <= this.referenceRanges.bloodPressure.diastolic.max;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkBmi(form: FormGroup): void {
    const vital = form.get('bmi') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const isNormal = value >= this.referenceRanges.bmi.underweight &&
      value <= this.referenceRanges.bmi.normal;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkBloodGlucose(form: FormGroup): void {
    const vital = form.get('bloodGlucose') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const isNormal = value >= this.referenceRanges.bloodGlucose.min &&
      value <= this.referenceRanges.bloodGlucose.max;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }

  checkHeartRate(form: FormGroup): void {
    const vital = form.get('heartRate') as FormGroup;
    const value = vital.get('value')?.value;
    if (value === null || value === undefined) {
      vital.get('status')?.setValue('', { emitEvent: false });
      return;
    }
    const isNormal = value >= this.referenceRanges.heartRate.min &&
      value <= this.referenceRanges.heartRate.max;
    vital.get('status')?.setValue(isNormal ? 'Normal' : 'Abnormal', { emitEvent: false });
  }
}
