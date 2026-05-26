// src/models/Official.ts
import mongoose, { Schema, model, models } from "mongoose";

const OfficialSchema = new Schema(
  {
    fullName: { type: String, required: true },
    position: { type: String, required: true }, // e.g., Barangay Captain, Barangay Kagawad
    termStart: { type: String, required: true },
    termEnd: { type: String, required: true },
    contact: { type: String, default: "N/A" }, // 🎯 KINABIT NA RITO PARA SIGURADONG SASAMA SA DB!
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    },
  },
  { 
    timestamps: true, 
    collection: "officials" 
  }
);

// 🔥 ANTI-CACHE FIX: Siguraduhing mabubura ang lumang configuration sa local server reload
if (models.Official) {
  delete (mongoose as any).models.Official;
}

const Official = model("Official", OfficialSchema);
export default Official;