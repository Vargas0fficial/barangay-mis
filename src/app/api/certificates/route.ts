// src/app/api/certificates/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Log from "@/models/Log"; // 🎯 Isama natin ang Log model para sa automatic audit trail

// 1. GET - Kunin ang lahat ng hininging clearances/certificates
export async function GET() {
  try {
    await connectToDatabase();
    // I-sort natin base sa pinakabago (latest requests muna)
    const requests = await Certificate.find({}).sort({ createdAt: -1 });
    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error("GET Certificates Error:", error);
    return NextResponse.json({ error: "Failed to fetch document requests." }, { status: 500 });
  }
}

// 2. POST - Mag-log ng bagong document request
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // 🛠️ FIX: Ginawa nating "certificateType", at isinama natin sina orNumber at amountPaid galing sa frontend
    const { residentName, certificateType, purpose, orNumber, amountPaid } = body;

    if (!residentName || !certificateType || !purpose) {
      return NextResponse.json({ error: "Missing required documentation parameters." }, { status: 400 });
    }

    // Isave sa 'certificates' collection
    const newRequest = await Certificate.create({
      residentName: residentName.trim().toUpperCase(),
      certificateType,
      purpose,
      orNumber: orNumber || "N/A",
      amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
      status: "Pending", // Default kapag bagong gawa
    });

    // 🎯 AUTOMATIC AUDIT TRAIL: Isabay na natin dito para rekta sulat sa 'logs' collection!
    await Log.create({
      action: `Issued ${certificateType}`,
      target: residentName.trim().toUpperCase(),
    });

    return NextResponse.json({ message: "Success", id: newRequest._id }, { status: 201 });
  } catch (error) {
    console.error("POST Certificate Error:", error);
    return NextResponse.json({ error: "Failed to log document request." }, { status: 500 });
  }
}

// 3. PUT - Mag-update ng status (e.g., Pending -> Ready -> Issued)
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

    // 🎯 COOP LOG: Mag-iwan din ng bakas sa logs kapag binago ang status ng clearance
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