// src/models/FourPs.ts
import mongoose, { Schema, model, models } from "mongoose";

const FourPsSchema = new Schema({
  householdHead: { type: String, required: true },
  householdId: { type: String, required: true },
  barangay: { type: String, required: true },
  dependentsCount: { type: Number, default: 0 },
  monthlySubsidy: { type: Number, default: 0 },
  status: { type: String, default: "Active" },
}, { timestamps: true });

// Kung may existing na model, buburahin muna natin sa memory para hindi mag-cache ang lumang 'fullName'
if (models.FourPs) {
  delete (mongoose as any).models.FourPs;
}

export default model("FourPs", FourPsSchema, "fourps");