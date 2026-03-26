// ============================================
// Executive Village Health Dashboard — Types
// 6 Core Data Domains
// ============================================

export interface SourceProvider {
  id: string;
  name: string;
  nameEn: string;
  type: "hospital" | "health_center";
  status: "online" | "offline" | "degraded";
  lastSync: string;
  totalSubmissions: number;
  errorRate: number;
}

export interface Village {
  id: string;
  moo: number;
  name: string;
  totalHouses: number;
  totalPopulation: number;
  elderlyCount: number;
  ncdCount: number;
  lat: number;
  lng: number;
}

export interface House {
  id: string;
  houseCode: string;
  villageId: string;
  moo: number;
  address: string;
  lat: number;
  lng: number;
  memberCount: number;
  elderlyCount: number;
  ncdCount: number;
  riskLevel: "low" | "medium" | "high";
}

export interface Family {
  id: string;
  houseId: string;
  headPersonId: string;
  memberCount: number;
}

export interface Person {
  id: string;
  hn: string;
  cid: string;
  prefix: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  birthDate: string;
  age: number;
  houseId: string;
  familyId: string;
  moo: number;
  healthCoverage: string;
  chronicDiseases: ChronicDisease[];
  riskLevel: "low" | "medium" | "high";
  isElderly: boolean;
  lastVisit: string;
  healthEvents: HealthEvent[];
  vaccinations: Vaccination[];
}

export interface ChronicDisease {
  code: string;
  name: string;
  nameEn: string;
  diagnosedDate: string;
  status: "controlled" | "uncontrolled" | "monitoring";
}

export interface HealthEvent {
  id: string;
  date: string;
  type: "visit" | "lab" | "referral" | "screening" | "vaccination";
  title: string;
  description: string;
  provider: string;
}

export interface SubmissionLog {
  id: string;
  providerId: string;
  providerName: string;
  timestamp: string;
  recordCount: number;
  successCount: number;
  failedCount: number;
  severity: "info" | "warning" | "error";
  status: "success" | "partial" | "failed";
  errorType?: string;
  message: string;
}

export interface KPIData {
  label: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: string;
}

export interface NCDStats {
  disease: string;
  diseaseEn: string;
  moo11: number;
  moo12: number;
  total: number;
}

export type VaccineGroup = "epi_child" | "school" | "risk" | "pilot" | "optional";

export interface Vaccination {
  id: string;
  vaccineName: string;
  vaccineNameEn: string;
  vaccineCode: string;
  group: VaccineGroup;
  dose: string;
  date: string;
  provider: string;
  lot?: string;
}

export interface OutbreakCase {
  houseId: string;
  personId: string;
  disease: string;
  reportDate: string;
  status: "confirmed" | "suspected" | "recovered";
}
