// src/app/api/certificates/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Log from "@/models/Log"; 

export const dynamic = 'force-dynamic';

// 1. GET - Kunin ang lahat ng hininging clearances/certificates (SAFE POPULATE ENGINE 🛡️)
export async function GET() {
  try {
    await connectToDatabase();
    
    // 🌟 SAFE CHECKPOINT:
    // Kung may lumang data na bumarado sa database populate structure,
    // gagamit muna tayo ng safe find. Kung mag-error pa rin ang strict populate,
    // may catch block tayo sa ibaba na kukuha ng raw records para hindi mag-crash ang server.
    const requests = await Certificate.find({})
      .populate({
        path: "residentId",
        select: "fullName contact address gender age", // Piliin lang ang kailangang fields
        options: { strictPopulate: false } // 🎯 HUWAG MAG-CRASH KUNG HINDI VALID OBJECTID ANG CODES!
      })
      .sort({ createdAt: -1 });
      
    return NextResponse.json(requests, { status: 200 });
  } catch (error: any) {
    console.error("🚨 DETECTED POPULATE CRASH, FALLING BACK TO RAW FIND:", error.message);
    
    try {
      // 🔄 EMERGENCY FALLBACK: Kapag sumabog ang collection schema mapping,
      // i-bato ang hilaw na data nang walang populate para mabuhay at hindi mag-fail ang API response link!
      const rawRequests = await Certificate.find({}).sort({ createdAt: -1 });
      return NextResponse.json(rawRequests, { status: 200 });
    } catch (fallbackError) {
      return NextResponse.json({ error: "Failed to fetch document requests completely." }, { status: 500 });
    }
  }
}

// 2. POST - Mag-log ng bagong document request (THE ULTIMATE SHIELD FIX 🛡️)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    const { 
      residentName, 
      certificateType, 
      documentType, 
      purpose, 
      orNumber, 
      amountPaid, 
      residentCustomId, 
      residentId 
    } = body;

    if (!residentName || (!certificateType && !documentType) || !purpose) {
      return NextResponse.json({ error: "Missing required documentation parameters." }, { status: 400 });
    }

    const finalCustomId = residentCustomId || residentId || "PENDING-ID";
    const finalCertificateType = certificateType || documentType;

    const isValidObjectId = residentId && typeof residentId === "string" && residentId.length === 24 && /^[0-9a-fA-F]{24}$/.test(residentId);

    const certificatePayload: any = {
      residentCustomId: finalCustomId, 
      residentName: residentName.trim().toUpperCase(),
      certificateType: finalCertificateType,
      purpose: purpose,
      orNumber: orNumber || "N/A",
      amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
      status: "Pending", 
    };

    if (isValidObjectId) {
      certificatePayload.residentId = residentId;
    } else {
      delete certificatePayload.residentId; 
    }

    const newRequest = await Certificate.create(certificatePayload);

    await Log.create({
      action: `Issued ${finalCertificateType}`,
      target: residentName.trim().toUpperCase(),
    });

    return NextResponse.json({ message: "Success", id: newRequest._id }, { status: 201 });
  } catch (error: any) {
    console.error("🚨 DETECTED MONGOOSE VALIDATION CRASH:", error.message);
    return NextResponse.json({ 
      error: "Transaction rejected by database validation.",
      details: error.message 
    }, { status: 400 });
  }
}

// 3. PUT - Mag-update ng status
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required update fields." }, { status: 400 });
    }

    const updatedRequest = await Certificate.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after' }
    );

    if (!updatedRequest) {
      return NextResponse.json({ error: "Document request not found." }, { status: 404 });
    }

    await Log.create({
      action: `Updated Status to ${status}`,
      target: updatedRequest.residentName,
    });

    return NextResponse.json({ message: "Status shifted successfully." }, { status: 200 });
  } catch (error) {
    console.error("PUT Certificate Error:", error);
    return NextResponse.json({ error: "Failed to transition document status." }, { status: 500 });
  }
}