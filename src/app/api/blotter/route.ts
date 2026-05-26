// src/app/api/blotter/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Blotter from "@/models/Blotter";
import Log from "@/models/Log"; // 🎯 Integrated for audit trail entry

// 📄 GET ROUTINE: Fetches all blotter records sorted by the newest entry
export async function GET() {
  try {
    await connectToDatabase();
    const cases = await Blotter.find({}).sort({ createdAt: -1 });
    return NextResponse.json(cases, { status: 200 });
  } catch (error: any) {
    console.error("GET BLOTTER ERROR:", error.message);
    return NextResponse.json({ error: "Failed to fetch blotter cases" }, { status: 500 });
  }
}

// ➕ POST ROUTINE: Logs a brand new blotter case into the system
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { caseNumber, complainant, respondent, incidentType, incidentDate, location, narrative } = body;

    if (!caseNumber || !complainant || !respondent || !incidentType) {
      return NextResponse.json({ error: "Missing critical blotter parameters" }, { status: 400 });
    }

    const newCase = await Blotter.create({
      caseNumber,
      complainant,
      respondent,
      incidentType,
      incidentDate,
      location,
      narrative,
      status: "Pending" // Default initialization state
    });

    // 🎯 AUTOMATIC AUDIT TRAIL: Logs the creation event instantly to 'logs' collection
    await Log.create({
      action: `Created New Blotter Record (${incidentType})`,
      target: respondent.trim().toUpperCase()
    });

    return NextResponse.json({ success: true, data: newCase }, { status: 201 });
  } catch (error: any) {
    console.error("POST BLOTTER ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}