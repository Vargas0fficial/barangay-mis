// src/models/Resident.ts
import mongoose, { Schema, model, models } from "mongoose";

const ResidentSchema = new Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String, default: "" },
    lastName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    purok: { type: String, required: true },
    gender: { type: String, required: true },
    civilStatus: { type: String, required: true },
    status: { type: String, default: "Active" },
    age: { type: Number, required: true }, 
    isRegisteredVoter: { type: String, default: "No" }, 
  },
  { timestamps: true }
);

export default models.Resident || model("Resident", ResidentSchema);