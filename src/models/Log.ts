import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ILog extends Document {
  action: string;
  target: string;
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<ILog>({
  action: { type: String, required: true },
  target: { type: String, required: true },
}, { 
  timestamps: true, 
  collection: "logs" // 🎯 Siguraduhing "logs" ang nakasulat dito, gar!
}); 

// 🛠️ ANTI-CACHE FIX: Burahin muna natin sa models list kung nag-eexist para mapuwersang basahin ang bago
if (models.Log) {
  delete models.Log;
}

export default model<ILog>("Log", LogSchema);