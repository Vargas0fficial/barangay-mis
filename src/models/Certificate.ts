import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ICertificate extends Document {
  residentId?: mongoose.Types.ObjectId; 
  residentCustomId?: string;
  residentName: string;
  certificateType: string;
  purpose: string;
  // 🎯 Ginawa nating optional (?) sa TypeScript interface para safe
  orNumber?: string;
  amountPaid?: number;
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>({
  residentId: { 
    type: Schema.Types.ObjectId, 
    ref: "Resident" 
  },
  residentCustomId: { 
    type: String, 
    default: "RES-2026-001" 
  },
  residentName: { type: String, required: true },
  certificateType: { type: String, required: true },
  purpose: { type: String, required: true },
  
  // 🎯 FIX: Ginawang default values imbes na required: true para tanggapin agad ang bagong request
  orNumber: { type: String, default: "N/A" },
  amountPaid: { type: Number, default: 0 },
}, { 
  timestamps: true,
  collection: "certificates" 
});

export default models.Certificate || model<ICertificate>("Certificate", CertificateSchema);