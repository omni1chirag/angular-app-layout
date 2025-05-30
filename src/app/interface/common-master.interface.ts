export interface CommonMasterOptions {
    name: string,
    languageCode: string,
    value: LabelValue[]
}

export interface LabelValue {
  label: string;
  value: any;
}