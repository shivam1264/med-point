export type HospitalStatus = 'available' | 'moderate' | 'full';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  distance: string;
  status: HospitalStatus;
  lat: number;
  lng: number;
  icuTotal: number;
  icuFree: number;
  generalTotal: number;
  generalFree: number;
  otTotal: number;
  otFree: number;
  specialists: string[];
  contact?: {
    phone?: string;
    email?: string;
  };
  emergencyServices?: boolean;
  rating?: number;
}

export type CaseSeverity = 'critical' | 'serious' | 'moderate';
export type CaseStatus = 'enroute' | 'admitted';

export interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  gcs: number;
}

export interface CaseItem {
  id: string;
  type: string;
  severity: CaseSeverity;
  patientAge: number;
  patientGender: string;
  ambulanceId: string;
  location: string;
  assignedHospital: string;
  eta: string;
  status: CaseStatus;
  vitals: Vitals;
}

export type AlertType = 'critical' | 'warning' | 'info' | 'success';

export interface AlertItem {
  id: number;
  type: AlertType;
  message: string;
  time: string;
}

export interface TimelineItem {
  label: string;
  sub: string;
  done: boolean;
}

export interface FamilyPatient {
  name: string;
  caseId: string;
  status: string;
  hospital: string;
  ward: string;
  doctor: string;
  timeline: TimelineItem[];
}

export type AuthRole = 'ambulance' | 'family';
