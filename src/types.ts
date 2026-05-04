export interface DrugInfo {
  name: string;
  originalFormula: string;
  medicalFormula: string;
  information: string;
  sideEffects?: string[];
  contraindications?: string[];
  interactions?: string[];
  mechanismOfAction?: string;
  usage: string;
  ageGroup?: string;
  frequency?: string;
  precautions?: string;
  adultDosage?: string;
  childDosage?: string;
  form?: string;
  dosageTable: {
    ageGroup: string;
    dosage: string;
    form: string;
  }[];
  imageUrl?: string;
}

export interface ScanResult {
  drugName: string;
  confidence: number;
  details?: DrugInfo;
}
