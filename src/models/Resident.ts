// frontend/src/models/Resident.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

// 📜 TYPESCRIPT INTERFACE MATRIX
export interface IResident extends Document {
  residentId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  contactNo: string;
  age: number;
  zoneAssignment: string; // Ito yung pinipili sa select dropdown (e.g., Zone I)
  streetAddress: string;
  gender: string;
  civilStatus: string;
  isVoter: string;        // "Yes" o "No" base sa selection mo
  accountStatus: string;   // "Active" o "Inactive"
  password?: string;       // Default structural key para sa login portal
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResidentSchema = new Schema<IResident>(
  {
    residentId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true }, // Pinagsamang First Name + Last Name
    contactNo: { type: String, required: true },
    age: { type: Number, required: true },
    zoneAssignment: { type: String, required: true },
    streetAddress: { type: String, required: true },
    gender: { type: String, required: true },
    civilStatus: { type: String, required: true },
    isVoter: { type: String, default: "No" },
    accountStatus: { type: String, default: "Active" },
    password: { type: String, required: true, default: "password123" }, // Default password key
    role: { type: String, default: "Resident" }
  },
  { timestamps: true }
);

// Selyadong Next.js compilation strategy para maiwasan ang "OverwriteModelError" sa factory re-renderings
export default models.Resident || model<IResident>("Resident", ResidentSchema);