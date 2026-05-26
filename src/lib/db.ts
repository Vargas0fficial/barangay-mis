// src/lib/mongodb.ts
import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mbvargas91_db_user:Markminard1@cluster0.2oeqdzm.mongodb.net/barangay_db?appName=Cluster0";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}