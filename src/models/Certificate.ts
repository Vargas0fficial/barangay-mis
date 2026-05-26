import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ICertificate extends Document {
  residentName: string;
  certificateType: string;
  purpose: string;
  orNumber: string;
  amountPaid: number;
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  residentName: { type: String, required: true },
  certificateType: { type: String, required: true },
  purpose: { type: String, required: true },
  orNumber: { type: String, required: true },
  amountPaid: { type: Number, required: true },
}, { 
  timestamps: true,
  collection: "certificates" // 🗂️ Dito lang dapat ang mga tunay na resibo at clearance!
});

export default models.Certificate || model<ICertificate>("Certificate", CertificateSchema);