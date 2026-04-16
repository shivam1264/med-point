// ─── Auth ─────────────────────────────────────────────────
export type AuthRole = 'user' | 'ambulance';

export interface AuthUser {
  id: string;
  name?: string;
  phone?: string;
  role: 'user';
}

export interface AuthAmbulance {
  id: string;
  driverId: string;
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  hospitalName: string;
  isOnline: boolean;
  isAvailable: boolean;
  role: 'ambulance';
}

// ─── Hospital ──────────────────────────────────────────────
export type HospitalStatus = 'green' | 'amber' | 'red';

export interface Hospital {
  _id: string;
  hospitalName: string;
  fullName?: string;
  type?: string;
  category?: string;
  area?: string;
  address: string;
  phone?: string;
  emergency?: boolean;
  open24x7?: boolean;
  totalBeds: number;
  availableBeds?: number;
  icuBeds: number;
  icuAvailable?: number;
  ventilators?: number;
  ventilatorsAvailable?: number;
  specialties?: string[];
  location?: { type: 'Point'; coordinates: [number, number] };
  coordinates?: { lat: number; lng: number }; // Kept for backward compatibility
  rating?: number;
  ratingCount?: number;
  status: HospitalStatus;
  distanceKm?: number;
}

// ─── Doctor ───────────────────────────────────────────────
export type DoctorStatus = 'available' | 'busy' | 'off-duty';

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification?: string;
  experience?: number;
  phone?: string;
  email?: string;
  consultationFee?: number;
  availableStatus: DoctorStatus;
  hospitalName?: string;
  hospital?: string | { _id: string; hospitalName: string; address: string };
  schedule?: {
    mon?: string; tue?: string; wed?: string; thu?: string;
    fri?: string; sat?: string; sun?: string;
  };
}

// ─── Emergency ────────────────────────────────────────────
export type EmergencyStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Emergency {
  _id: string;
  user?: string;
  userName?: string;
  userPhone?: string;
  location: { type: 'Point'; coordinates: [number, number]; address?: string };
  ambulanceDriverName?: string;
  ambulanceVehicleNumber?: string;
  ambulanceDrivrePhone?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  hospitalLat?: number;
  hospitalLng?: number;
  status: EmergencyStatus;
  severity?: 'critical' | 'moderate' | 'mild';
  createdAt?: string;
  acceptedAt?: string;
}

// ─── Ambulance (driver view) ──────────────────────────────
export interface Ambulance {
  _id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType: string;
  hospitalName?: string;
  isOnline: boolean;
  isAvailable: boolean;
  location?: { type: 'Point'; coordinates: [number, number] };
  currentLocation?: { lat: number; lng: number };
}

// ─── UI / Mock Data Types ────────────────────────────────
export interface CaseItem {
  id: string;
  type: string;
  severity: 'critical' | 'serious' | 'moderate' | 'mild';
  patientAge: number;
  patientGender: string;
  ambulanceId: string;
  location: string;
  assignedHospital: string;
  eta: string;
  status: string;
  vitals: { hr: number; bp: string; spo2: number; gcs: number };
}

export interface AlertItem {
  id: number;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: string;
}

export interface FamilyPatient {
  name: string;
  caseId: string;
  status: string;
  hospital: string;
  ward: string;
  doctor: string;
  timeline: { label: string; sub: string; done: boolean }[];
}
