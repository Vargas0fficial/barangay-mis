// src/app/api/blotter/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Blotter from "@/models/Blotter";
import Log from "@/models/Log"; 

// 🗑️ DELETE ROUTINE: Purges a record using its unique ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 GINAWANG PROMISE ANG TYPE PARA PASADO SA NEXT.JS BUILD
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const caseToDelete = await Blotter.findById(id);
    if (!caseToDelete) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await Blotter.findByIdAndDelete(id);

    await Log.create({
      action: `Deleted Blotter Case (${caseToDelete.incidentType})`,
      target: caseToDelete.respondent.trim().toUpperCase(),
    });

    return NextResponse.json({ success: true, message: "Record purged successfully" });
  } catch (error: any) {
    console.error("CRITICAL ERROR DURING BLOTTER DB DELETION:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 📝 PUT ROUTINE: Handles Edit/Update operations for a record
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 GINAWANG PROMISE DIN ANG TYPE DITO GAR
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const updatedCase = await Blotter.findByIdAndUpdate(
      id,
      {
        complainant: body.complainant,
        respondent: body.respondent,
        incidentType: body.incidentType,
        incidentDate: body.incidentDate,
        narrative: body.narrative,
        status: body.status,
      },
      { new: true }
    );

    if (!updatedCase) {
      return NextResponse.json({ error: "Record not found to update" }, { status: 404 });
    }

    await Log.create({
      action: `Updated Blotter Case Status to [${body.status}]`,
      target: body.respondent.trim().toUpperCase(), 
    });

    return NextResponse.json({ success: true, data: updatedCase });
  } catch (error: any) {
    console.error("CRITICAL ERROR DURING BLOTTER DB UPDATE:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}