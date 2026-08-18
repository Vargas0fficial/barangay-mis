// src/lib/mongodb.ts
import mongoose from "mongoose";


function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file (and to your Vercel project's Environment Variables)."
    );
  }
  return uri;
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: false,
    }).then((m) => m);
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}