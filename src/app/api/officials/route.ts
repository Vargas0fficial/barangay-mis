// src/app/api/officials/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Official from "@/models/Official"; // 🎯 Gagamitin na natin ang iisang malinis na model!
import Log from "@/models/Log"; 

// 📄 GET ROUTINE: Fetches all barangay officials ordered by term start date
export async function GET() {
  try {
    await connectToDatabase();
    const officials = await Official.find({}).sort({ termStart: -1 });
    return NextResponse.json(officials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ➕ POST ROUTINE: Adds a brand new official and logs the event
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Naka-allow na rito ang body.contact dahil kasama na ito sa Official model natin sa itaas!
    const newOfficial = await Official.create(body);

    // 🎯 AUDIT TRAIL
    await Log.create({
      action: `Added Barangay Official (${body.position})`,
      target: body.fullName.trim().toUpperCase(),
    });

    return NextResponse.json({ success: true, data: newOfficial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 📝 PUT ROUTINE: Modifies an official's profile or status configuration
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { id, ...updateData } = await request.json();
    if (!id) return NextResponse.json({ error: "Official ID required" }, { status: 400 });

    const updated = await Official.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    if (!updated) return NextResponse.json({ error: "Official record not found" }, { status: 404 });

    // 🎯 AUDIT TRAIL
    await Log.create({
      action: `Updated Official Profile/Status [${updateData.status || "Modified"}]`,
      target: updated.fullName.trim().toUpperCase(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🗑️ DELETE ROUTINE: Removes an official record permanently
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Official ID required" }, { status: 400 });

    const officialToDelete = await Official.findById(id);
    if (!officialToDelete) return NextResponse.json({ error: "Official record not found" }, { status: 404 });

    await Official.findByIdAndDelete(id);

    // 🎯 AUDIT TRAIL
    await Log.create({
      action: `Deleted Barangay Official (${officialToDelete.position})`,
      target: officialToDelete.fullName.trim().toUpperCase(),
    });

    return NextResponse.json({ success: true, message: "Official record deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}