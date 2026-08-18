import mongoose, { Schema, model, models } from "mongoose";

const BlotterSchema = new Schema(
  {
    caseNumber: { type: String, required: true, unique: true },
    complainant: { type: String, required: true }, 
    respondent: { type: String, required: true },  
    incidentType: { type: String, required: true }, 
    incidentDate: { type: String, required: true },
    location: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["Pending", "Scheduled", "Settled", "Dismissed", "Active", "Referred to Court"], 
      default: "Pending" 
    },
    narrative: { type: String, required: true }, 
  },
  { 
    timestamps: true, 
    collection: "blotters" 
  }
);

// Prevent model duplication re-compilation artifacts across Next.js hot-reloads
const Blotter = models.Blotter || model("Blotter", BlotterSchema);
export default Blotter;