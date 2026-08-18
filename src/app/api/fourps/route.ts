// src/app/api/4ps/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import FourPs from "@/models/FourPs"; 
import Log from "@/models/Log"; // 🎯 Swak sa tamang path ng iyong Log model, gar!

export const dynamic = 'force-dynamic';
// 1. GET METHOD - Kunin ang lahat ng 4Ps beneficiaries
export async function GET() {
  try {
    await connectToDatabase();
    const beneficiaries = await FourPs.find({}).sort({ householdHead: 1 });
    return NextResponse.json(beneficiaries, { status: 200 });
  } catch (error) {
    console.error("Database error inside GET /api/fourps:", error);
    return NextResponse.json({ error: "Failed to fetch 4Ps registry data." }, { status: 500 });
  }
}

// 2. POST METHOD - Magdagdag ng bagong 4Ps Household
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { householdHead, householdId, barangay, dependentsCount, monthlySubsidy, status } = body;

    if (!householdHead || !householdId || !barangay) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const newRecord = await FourPs.create({
      householdHead,
      householdId,
      barangay,
      dependentsCount: Number(dependentsCount) || 0,
      monthlySubsidy: Number(monthlySubsidy) || 0,
      status: status || "Active"
    });

    // 🔥 SYSTEM AUDIT TRAIL: Gamit ang Log model mo, gar!
    try {
      await Log.create({
        action: "4PS_BENEFICIARY_REGISTRATION",
        target: `Registered household head: ${householdHead} (ID: ${householdId}) in Brgy. ${barangay} with ₱${monthlySubsidy} subsidy.`
      });
    } catch (logErr) {
      console.error("🚨 Non-blocking Audit Trail Failure (POST):", logErr);
    }

    return NextResponse.json({ message: "Household registered successfully", id: newRecord._id }, { status: 201 });
  } catch (error) {
    console.error("Database error inside POST /api/fourps:", error);
    return NextResponse.json({ error: "Failed to commit record." }, { status: 500 });
  }
}

// 3. PUT METHOD - Mag-update ng existing profile base sa ID
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { id, householdHead, householdId, barangay, dependentsCount, monthlySubsidy, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Record ID is required." }, { status: 400 });
    }

    // Kinukuha ang lumang data bago i-update para makita ang pagbabago sa log
    const oldRecord = await FourPs.findById(id);

    const updatedRecord = await FourPs.findByIdAndUpdate(
      id,
      {
        householdHead,
        householdId,
        barangay,
        dependentsCount: Number(dependentsCount) || 0,
        monthlySubsidy: Number(monthlySubsidy) || 0,
        status,
      },
      { returnDocument: 'after' }
    );

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    // 🔥 SYSTEM AUDIT TRAIL: Gamit ang Log model mo, gar!
    try {
      let changeDetails = `Updated profile of ${householdHead} (${householdId}).`;
      if (oldRecord) {
        if (oldRecord.status !== status) {
          changeDetails += ` Status changed from "${oldRecord.status}" to "${status}".`;
        }
        if (oldRecord.monthlySubsidy !== Number(monthlySubsidy)) {
          changeDetails += ` Subsidy changed from ₱${oldRecord.monthlySubsidy} to ₱${monthlySubsidy}.`;
        }
      }

      await Log.create({
        action: "4PS_BENEFICIARY_UPDATE",
        target: changeDetails
      });
    } catch (logErr) {
      console.error("🚨 Non-blocking Audit Trail Failure (PUT):", logErr);
    }

    return NextResponse.json({ message: "Updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Database error inside PUT /api/fourps:", error);
    return NextResponse.json({ error: "Failed to update record." }, { status: 500 });
  }
}

// 4. DELETE METHOD - Magtanggal ng profile mula sa index
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing document ID." }, { status: 400 });
    }

    const deletedRecord = await FourPs.findByIdAndDelete(id);

    if (!deletedRecord) {
      return NextResponse.json({ error: "Target entry not found." }, { status: 404 });
    }

    // 🔥 SYSTEM AUDIT TRAIL: Gamit ang Log model mo, gar!
    try {
      await Log.create({
        action: "4PS_BENEFICIARY_DELETION",
        target: `Permanently removed 4Ps household entry of ${deletedRecord.householdHead} (ID: ${deletedRecord.householdId}).`
      });
    } catch (logErr) {
      console.error("🚨 Non-blocking Audit Trail Failure (DELETE):", logErr);
    }

    return NextResponse.json({ message: "Purged successfully." }, { status: 200 });
  } catch (error) {
    console.error("Database error inside DELETE /api/fourps:", error);
    return NextResponse.json({ error: "Failed to delete record." }, { status: 500 });
  }
}