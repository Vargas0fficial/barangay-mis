// Central place for the shapes shared between pages and API routes.
// Previously these interfaces were re-declared (slightly differently) inside
// each page.tsx file — keeping them here avoids drift between pages.

export interface Resident {
  _id?: string;
  residentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  contactNo: string;
  streetAddress: string;
  zoneAssignment: string;
  gender: string;
  civilStatus: string;
  accountStatus: string;
  age?: number | string;
  isVoter?: string;
}

export interface Official {
  _id?: string;
  fullName: string;
  position: string;
  termStart: string;
  termEnd: string;
  contact?: string;
  status: string;
}

export interface BlotterCase {
  _id?: string;
  caseNumber?: string;
  complainant: string;
  respondent: string;
  incidentType: string;
  incidentDate: string;
  narrative: string;
  status: string;
}

export interface FourPsBeneficiary {
  _id?: string;
  householdHead: string;
  householdId: string;
  barangay: string;
  dependentsCount: number;
  monthlySubsidy: number;
  status: string;
}

export interface CertificateRecord {
  _id?: string;
  residentName: string;
  certificateType: string;
  purpose: string;
  orNumber: string;
  amountPaid: number;
  dateIssued: string;
}

export interface Account {
  _id?: string;
  userId: string;
  fullName: string;
  username: string;
  role: string;
  status: string;
  passwordPreview?: string;
}

export const ZONES = ["Zone I", "Zone II", "Zone III", "Zone IV", "Zone V", "Zone VI", "Zone VII"];
