// src/app/api/residents/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Resident from "@/models/Resident";
import Log from "@/models/Log"; 

// 1. GET ALL RESIDENTS
export async function GET() {
  try {
    await connectToDatabase();
    const residents = await Resident.find({}).sort({ createdAt: -1 });
    return NextResponse.json(residents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. CREATE NEW RESIDENT (WALA NANG KAWALANG ANTIDUPLICATE HARANG, GAR!)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Alisin ang magkakadikit na space sa gitna at dulo para pareho silang malinis
    const cleanFirstName = (body.firstName || "").trim().replace(/\s+/g, " ");
    const cleanLastName = (body.lastName || "").trim().replace(/\s+/g, " ");

    // Kuhanin muna natin ang lahat ng may kaparehong Last Name sa DB para mas mabilis
    const candidates = await Resident.find({
      lastName: { $regex: new RegExp(`^${cleanLastName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") }
    });

    // JavaScript level side-by-side comparison para walang lusot na spaces, casing, o middle name mismatches
    const isDuplicate = candidates.some((res) => {
      const dbFirstName = (res.firstName || "").trim().replace(/\s+/g, " ");
      return dbFirstName.toLowerCase() === cleanFirstName.toLowerCase();
    });

    
    if (isDuplicate) {
      return NextResponse.json(
        { error: `Warning: Resident ${cleanFirstName.toUpperCase()} ${cleanLastName.toUpperCase()} is already registered in the database.` },
        { status: 400 }
      );
    }

    // 💡 Siguraduhing Number ang age kung may pinasa mula sa frontend form
    if (body.age !== undefined && body.age !== "") {
      body.age = Number(body.age);
    }

    // I-save ang nilinis na format para iwas kalat sa data views
    const newResident = await Resident.create({
      ...body,
      firstName: cleanFirstName,
      lastName: cleanLastName,
      middleName: (body.middleName || "").trim()
    });

    // 🎯 AUDIT TRAIL: Mag-log kapag may bagong rehistrong residente
    await Log.create({
      action: "New Resident Profile Created",
      target: `${newResident.firstName} ${newResident.lastName}`.trim().toUpperCase()
    }).catch((err) => console.error("Failed to write creation log:", err));

    return NextResponse.json({ success: true, data: newResident }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. UPDATE RESIDENT RECORD
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Resident ID is required" }, { status: 400 });
    }

    if (updateData.age !== undefined && updateData.age !== "") {
      updateData.age = Number(updateData.age);
    }

    const updatedResident = await Resident.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });

    if (updatedResident) {
      await Log.create({
        action: "Updated Resident Information",
        target: `${updatedResident.firstName || ""} ${updatedResident.lastName || ""}`.trim().toUpperCase()
      }).catch((err) => console.error("Failed to write update log:", err));
    }

    return NextResponse.json({ success: true, data: updatedResident });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. DELETE RESIDENT
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Resident ID is required" }, { status: 400 });
    }

    const residentToDelete = await Resident.findById(id);
    await Resident.findByIdAndDelete(id);

    if (residentToDelete) {
      await Log.create({
        action: "Deleted Resident Profile",
        target: `${residentToDelete.firstName || ""} ${residentToDelete.lastName || ""}`.trim().toUpperCase()
      }).catch((err) => console.error("Failed to write deletion log:", err));
    }

    return NextResponse.json({ success: true, message: "Resident profile deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}