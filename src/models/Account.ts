// src/models/Account.ts
import mongoose, { Schema, model, models } from "mongoose";

const AccountSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true }, // e.g. ACC-001
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ⚠️ stored in plain text for now — see note in route.ts
    role: {
      type: String,
      enum: ["Admin", "Secretary", "Treasurer", "Staff"],
      default: "Secretary",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
    collection: "accounts",
  }
);

// 🔥 ANTI-CACHE FIX: same pattern as the other models, avoids stale schema on hot reload
if (models.Account) {
  delete (mongoose as any).models.Account;
}

const Account = model("Account", AccountSchema);
export default Account;
