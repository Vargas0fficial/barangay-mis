// src/app/api/logs/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Log from "@/models/Log";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { action, target } = await request.json();

    // 1. Validation kung may kulang na detalye
    if (!action || !target) {
      return NextResponse.json({ error: "Action and Target are required" }, { status: 400 });
    }

    // 2. 🎯 REKTA CREATE AT SAVE: Isang bagsakan gamit ang Log.create()
    // Mas mabilis ito at gagamitin nito ang timestamps (createdAt) ng schema mo para sa oras.
    const newLog = await Log.create({
      action: action.trim(),
      target: target.trim().toUpperCase(),
    });

    // 3. I-return ang tagumpay pabalik sa frontend
    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    // Para makita mo sa VS Code Terminal mo kung bakit nag-error ang database connection!
    console.error("Backend logging failed", error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}