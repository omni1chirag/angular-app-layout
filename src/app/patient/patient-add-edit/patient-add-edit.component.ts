import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToolbarModule } from 'primeng/toolbar';
import { PageHeaderDirective } from '../../directive/page-header.directive';
import { Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { Patient } from '../patient.model';
@Component({
  selector: 'app-patient-add-edit',
  imports: [ToolbarModule,
    InputNumberModule,
    InputMaskModule,
    DividerModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    CheckboxModule,
    ButtonModule,
    CommonModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
    SelectButtonModule,
    DividerModule,
    PageHeaderDirective,
    TranslateModule
  ],
  templateUrl: './patient-add-edit.component.html',
  styleUrl: './patient-add-edit.component.scss'
})
export class PatientAddEditComponent implements OnInit {

  patient: Patient = new Patient({});
  isBrowser: boolean = false;
  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private _router: Router) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  titleOption = [
    { name: 'Dr.', code: 'Dr.' },
    { name: 'Prof', code: 'Prof' },
    { name: 'Mr.', code: 'Mr.' },
    { name: 'Mrs.', code: 'Mrs.' },
    { name: 'Ms.', code: 'Ms.' },
    { name: 'Master', code: 'Master' },
    { name: 'Hon', code: 'Hon' },
  ];
  genderList = [
    { name: 'Male', code: 'Male' },
    { name: 'Female', code: 'FeMale' },
    { name: 'Unknown', code: 'Unknown' },
    { name: 'Prefer Not to Say', code: 'Prefer Not to Say' },
    { name: 'Others', code: 'Others' },
  ];
  maritalStatusOption = [
    { "name": "Single", "code": "Single" },
    { "name": "Married", "code": "Married" },
    { "name": "Divorced", "code": "Divorced" },
    { "name": "Widowed", "code": "Widowed" },
    { "name": "Separated", "code": "Separated" },
    { "name": "Other", "code": "Other" },
    { "name": "Prefer Not to Say", "code": "Prefer Not to Say" }
  ]
  languageOption = [
    { "name": "Assamese", "code": "as" },
    { "name": "Bengali", "code": "bn" },
    { "name": "Bodo", "code": "brx" },
    { "name": "Dogri", "code": "doi" },
    { "name": "Gujarati", "code": "gu" },
    { "name": "Hindi", "code": "hi" },
    { "name": "Kannada", "code": "kn" },
    { "name": "Kashmiri", "code": "ks" },
    { "name": "Konkani", "code": "kok" },
    { "name": "Maithili", "code": "mai" },
    { "name": "Malayalam", "code": "ml" },
    { "name": "Manipuri", "code": "mni" },
    { "name": "Marathi", "code": "mr" },
    { "name": "Nepali", "code": "ne" },
    { "name": "Odia", "code": "or" },
    { "name": "Punjabi", "code": "pa" },
    { "name": "Sanskrit", "code": "sa" },
    { "name": "Santali", "code": "sat" },
    { "name": "Sindhi", "code": "sd" },
    { "name": "Tamil", "code": "ta" },
    { "name": "Telugu", "code": "te" },
    { "name": "Urdu", "code": "ur" },
    { "name": "English", "code": "en" }
  ]
  countries = [
    { name: 'India', code: 'IN' },
    { name: 'United States', code: 'USA' },
    { name: 'United Kingdom', code: 'UK' },
  ];
  patientRelationOption = [
    { "name": "Self", "code": "Self" },
    { "name": "Spouse", "code": "Spouse" },
    { "name": "Parent", "code": "Parent" },
    { "name": "Child", "code": "Child" },
    { "name": "Sibling", "code": "Sibling" },
    { "name": "Grandparent", "code": "Grandparent" },
    { "name": "Grandchild", "code": "Grandchild" },
    { "name": "Guardian", "code": "Guardian" },
    { "name": "Relative", "code": "Relative" },
    { "name": "Friend", "code": "Friend" },
    { "name": "Caregiver", "code": "Caregiver" },
    { "name": "Other", "code": "Other" }
  ]
  bloodGroupOption = [
    { "name": "A+", "code": "A+" },
    { "name": "A-", "code": "A-" },
    { "name": "B+", "code": "B+" },
    { "name": "B-", "code": "B-" },
    { "name": "O+", "code": "O+" },
    { "name": "O-", "code": "O-" },
    { "name": "AB+", "code": "AB+" },
    { "name": "AB-", "code": "AB-" }
  ]
  knownAllergiesOption = [

    {
      "name": "Drug Allergies",
      "code": "Drug Allergies",
      "child": [
        { "name": "Penicillin Allergy", "code": "Penicillin Allergy" },
        { "name": "Aspirin Allergy", "code": "Aspirin Allergy" },
        { "name": "Sulfa Drugs Allergy", "code": "Sulfa Drugs Allergy" },
        { "name": "NSAIDs Allergy", "code": "NSAIDs Allergy" }
      ]
    },
    {
      "name": "Food Allergies",
      "code": "Food Allergies",
      "child": [
        { "name": "Egg Allergy", "code": "Egg Allergy" },
        { "name": "Milk Allergy", "code": "Milk Allergy" },
        { "name": "Peanut Allergy", "code": "Peanut Allergy" },
        { "name": "Tree Nut Allergy", "code": "Tree Nut Allergy" },
        { "name": "Shellfish Allergy", "code": "Shellfish Allergy" },
        { "name": "Wheat Allergy", "code": "Wheat Allergy" },
        { "name": "Soy Allergy", "code": "Soy Allergy" }
      ]
    },
    {
      "name": "Environmental Allergies",
      "code": "Environmental Allergies",
      "child": [
        { "name": "Pollen Allergy", "code": "Pollen Allergy" },
        { "name": "Dust Mite Allergy", "code": "Dust Mite Allergy" },
        { "name": "Pet Dander Allergy", "code": "Pet Dander Allergy" },
        { "name": "Mold Allergy", "code": "Mold Allergy" },
        { "name": "Insect Sting Allergy", "code": "Insect Sting Allergy" }
      ]
    },
    { "name": "Other Allergies", "code": "Other Allergies" },
    { "name": "No Known Allergies", "code": "No Known Allergies" }
  ]
  ChronicConditionsOption = [
    { "name": "Hypertension", "code": "Hypertension" },
    { "name": "Coronary Artery Disease", "code": "Coronary Artery Disease" },
    { "name": "Congestive Heart Failure", "code": "Congestive Heart Failure" },
    { "name": "Arrhythmia", "code": "Arrhythmia" },
    { "name": "Stroke", "code": "Stroke" },
    { "name": "Peripheral Artery Disease", "code": "Peripheral Artery Disease" },
    { "name": "Diabetes Mellitus – Type 1", "code": "Diabetes Mellitus – Type 1" },
    { "name": "Diabetes Mellitus – Type 2", "code": "Diabetes Mellitus – Type 2" },
    { "name": "Thyroid Disorders", "code": "Thyroid Disorders" },
    { "name": "Obesity & Metabolic Syndrome", "code": "Obesity & Metabolic Syndrome" },
    { "name": "Polycystic Ovary Syndrome", "code": "Polycystic Ovary Syndrome" },
    { "name": "Asthma", "code": "Asthma" },
    { "name": "Chronic Obstructive Pulmonary Disease", "code": "Chronic Obstructive Pulmonary Disease" },
    { "name": "Bronchitis", "code": "Bronchitis" },
    { "name": "Tuberculosis (TB)", "code": "Tuberculosis (TB)" },
    { "name": "Sleep Apnea", "code": "Sleep Apnea" },
    { "name": "Gastroesophageal Reflux Disease", "code": "Gastroesophageal Reflux Disease" },
    { "name": "Irritable Bowel Syndrome", "code": "Irritable Bowel Syndrome" },
    { "name": "Inflammatory Bowel Disease (IBD)", "code": "Inflammatory Bowel Disease (IBD)" },
    { "name": "Hepatitis", "code": "Hepatitis" },
    { "name": "Cirrhosis of the Liver", "code": "Cirrhosis of the Liver" },
    { "name": "Chronic Pancreatitis", "code": "Chronic Pancreatitis" },
    { "name": "Migraine & Chronic Headaches", "code": "Migraine & Chronic Headaches" },
    { "name": "Epilepsy & Seizure Disorders", "code": "Epilepsy & Seizure Disorders" },
    { "name": "Parkinson’s Disease", "code": "Parkinson’s Disease" },
    { "name": "Alzheimer’s Disease & Dementia", "code": "Alzheimer’s Disease & Dementia" },
    { "name": "Depression", "code": "Depression" },
    { "name": "Anxiety Disorders", "code": "Anxiety Disorders" },
    { "name": "Bipolar Disorder", "code": "Bipolar Disorder" },
    { "name": "Schizophrenia & Psychotic Disorders", "code": "Schizophrenia & Psychotic Disorders" },
    { "name": "Rheumatoid Arthritis (RA)", "code": "Rheumatoid Arthritis (RA)" },
    { "name": "Osteoarthritis (OA)", "code": "Osteoarthritis (OA)" },
    { "name": "Lupus", "code": "Lupus" },
    { "name": "Psoriasis & Psoriatic Arthritis", "code": "Psoriasis & Psoriatic Arthritis" },
    { "name": "Multiple Sclerosis (MS)", "code": "Multiple Sclerosis (MS)" },
    { "name": "Chronic Kidney Disease", "code": "Chronic Kidney Disease" },
    { "name": "Kidney Stones", "code": "Kidney Stones" },
    { "name": "Urinary Incontinence", "code": "Urinary Incontinence" },
    { "name": "Benign Prostatic Hyperplasia", "code": "Benign Prostatic Hyperplasia" },
    { "name": "Breast Cancer", "code": "Breast Cancer" },
    { "name": "Lung Cancer", "code": "Lung Cancer" },
    { "name": "Prostate Cancer", "code": "Prostate Cancer" },
    { "name": "Colorectal Cancer", "code": "Colorectal Cancer" },
    { "name": "Leukemia & Lymphoma", "code": "Leukemia & Lymphoma" },
    { "name": "HIV/AIDS", "code": "HIV/AIDS" },
    { "name": "Chronic Hepatitis B or C", "code": "Chronic Hepatitis B or C" },
    { "name": "Leprosy", "code": "Leprosy" },
    { "name": "Sickle Cell Disease", "code": "Sickle Cell Disease" },
    { "name": "Thalassemia (Major/Minor)", "code": "Thalassemia (Major/Minor)" },
    { "name": "Hemophilia & Other Clotting Disorders", "code": "Hemophilia & Other Clotting Disorders" },
    { "name": "Anemia", "code": "Anemia" },
    { "name": "Fibromyalgia", "code": "Fibromyalgia" },
    { "name": "Chronic Back Pain", "code": "Chronic Back Pain" },
    { "name": "Osteoporosis", "code": "Osteoporosis" },
    { "name": "Gout & Uric Acid Disorders", "code": "Gout & Uric Acid Disorders" },
    { "name": "Vitiligo", "code": "Vitiligo" },
    { "name": "Eczema / Atopic Dermatitis", "code": "Eczema / Atopic Dermatitis" },
    { "name": "Psoriasis", "code": "Psoriasis" },
    { "name": "Hidradenitis Suppurativa", "code": "Hidradenitis Suppurativa" },
    { "name": "Glaucoma", "code": "Glaucoma" },
    { "name": "Cataracts", "code": "Cataracts" },
    { "name": "Diabetic Retinopathy", "code": "Diabetic Retinopathy" },
    { "name": "Macular Degeneration", "code": "Macular Degeneration" },
    { "name": "Hearing Loss", "code": "Hearing Loss" },
    { "name": "Tinnitus", "code": "Tinnitus" },
    { "name": "Chronic Fatigue Syndrome", "code": "Chronic Fatigue Syndrome" },
    { "name": "Amyotrophic Lateral Sclerosis", "code": "Amyotrophic Lateral Sclerosis" },
    { "name": "Cystic Fibrosis", "code": "Cystic Fibrosis" }
  ]
  currentMedications = [
    { "name": "Metformin", "code": "Metformin" },
    { "name": "Insulin", "code": "Insulin" },
    { "name": "Lisinopril", "code": "Lisinopril" },
    { "name": "Amlodipine", "code": "Amlodipine" },
    { "name": "Atorvastatin", "code": "Atorvastatin" },
    { "name": "Simvastatin", "code": "Simvastatin" },
    { "name": "Losartan", "code": "Losartan" },
    { "name": "Hydrochlorothiazide", "code": "Hydrochlorothiazide" },
    { "name": "Aspirin", "code": "Aspirin" },
    { "name": "Clopidogrel", "code": "Clopidogrel" },
    { "name": "Warfarin", "code": "Warfarin" },
    { "name": "Dapagliflozin", "code": "Dapagliflozin" },
    { "name": "Empagliflozin", "code": "Empagliflozin" },
    { "name": "Levothyroxine", "code": "Levothyroxine" },
    { "name": "Omeprazole", "code": "Omeprazole" },
    { "name": "Pantoprazole", "code": "Pantoprazole" },
    { "name": "Ranitidine", "code": "Ranitidine" },
    { "name": "Albuterol", "code": "Albuterol" },
    { "name": "Salbutamol", "code": "Salbutamol" },
    { "name": "Prednisone", "code": "Prednisone" },
    { "name": "Methotrexate", "code": "Methotrexate" },
    { "name": "Hydroxychloroquine", "code": "Hydroxychloroquine" },
    { "name": "Ibuprofen", "code": "Ibuprofen" },
    { "name": "Paracetamol", "code": "Paracetamol" },
    { "name": "Gabapentin", "code": "Gabapentin" },
    { "name": "Duloxetine", "code": "Duloxetine" },
    { "name": "Sertraline", "code": "Sertraline" },
    { "name": "Fluoxetine", "code": "Fluoxetine" },
    { "name": "Risperidone", "code": "Risperidone" },
    { "name": "Aripiprazole", "code": "Aripiprazole" },
    { "name": "Metoprolol", "code": "Metoprolol" },
    { "name": "Carvedilol", "code": "Carvedilol" },
    { "name": "Furosemide", "code": "Furosemide" },
    { "name": "Spironolactone", "code": "Spironolactone" },
    { "name": "Amoxicillin", "code": "Amoxicillin" },
    { "name": "Azithromycin", "code": "Azithromycin" },
    { "name": "Ciprofloxacin", "code": "Ciprofloxacin" },
    { "name": "Doxycycline", "code": "Doxycycline" },
    { "name": "Cetirizine", "code": "Cetirizine" },
    { "name": "Fexofenadine", "code": "Fexofenadine" },
    { "name": "Montelukast", "code": "Montelukast" },
    { "name": "Epinephrine", "code": "Epinephrine" }
  ]
  insuranceProviders = [
    { name: "Aditya Birla Health Insurance Co. Ltd.", code: "ADITYA_BIRLA" },
    { name: "Care Health Insurance Ltd.", code: "CARE_HEALTH" },
    { name: "ManipalCigna Health Insurance Co. Ltd.", code: "MANIPAL_CIGNA" },
    { name: "Niva Bupa Health Insurance Co. Ltd.", code: "NIVA_BUPA" },
    { name: "Star Health & Allied Insurance Co. Ltd.", code: "STAR_HEALTH" },
    { name: "Bajaj Allianz General Insurance Co. Ltd.", code: "BAJAJ_ALLIANZ" },
    { name: "Bharti AXA General Insurance Co. Ltd.", code: "BHARTI_AXA" },
    { name: "Cholamandalam MS General Insurance Co. Ltd.", code: "CHOLAMANDALAM_MS" },
    { name: "Future Generali India Insurance Co. Ltd.", code: "FUTURE_GENERALI" },
    { name: "HDFC ERGO General Insurance Co. Ltd.", code: "HDFC_ERGO" },
    { name: "ICICI Lombard General Insurance Co. Ltd.", code: "ICICI_LOMBARD" },
    { name: "IFFCO Tokio General Insurance Co. Ltd.", code: "IFFCO_TOKIO" },
    { name: "Kotak Mahindra General Insurance Co. Ltd.", code: "KOTAK_MAHINDRA" },
    { name: "Liberty General Insurance Co. Ltd.", code: "LIBERTY_GENERAL" },
    { name: "National Insurance Co. Ltd.", code: "NATIONAL_INSURANCE" },
    { name: "New India Assurance Co. Ltd.", code: "NEW_INDIA_ASSURANCE" },
    { name: "Oriental Insurance Co. Ltd.", code: "ORIENTAL_INSURANCE" },
    { name: "Reliance General Insurance Co. Ltd.", code: "RELIANCE_GENERAL" },
    { name: "Royal Sundaram General Insurance Co. Ltd.", code: "ROYAL_SUNDARAM" },
    { name: "SBI General Insurance Co. Ltd.", code: "SBI_GENERAL" },
    { name: "Tata AIG General Insurance Co. Ltd.", code: "TATA_AIG" },
    { name: "United India Insurance Co. Ltd.", code: "UNITED_INDIA" },
    { name: "Universal Sompo General Insurance Co. Ltd.", code: "UNIVERSAL_SOMPO" }
  ];
  
  knownAllergiesChange($event) {
    if ($event?.value.find((item) => item == 'No Known Allergies')) {
      this.patient.knownAllergies = ['No Known Allergies']
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem('patient');
      if (data) {
        this.patient = new Patient(JSON.parse(data))
      }
    }
  }

  navigateTo(route: string) {
    this._router.navigate([route]);
  }

  save() {
    if (this.isBrowser) {
      try {
        const currentListString: string = localStorage.getItem('patients') || '[]';
        let list: any[] = JSON.parse(currentListString);
        list = list.filter((item) => item.patientId !== this.patient.patientId);
        list.push(this.patient);
        localStorage.setItem('patients', JSON.stringify(list))
        localStorage.removeItem('patient');
      } catch (error) {

      }
    }
    this.navigateTo('/home/patient/list')
  }

  cancel() {
    localStorage.removeItem('patient');
    this.navigateTo('/home/patient/list')
  }

}