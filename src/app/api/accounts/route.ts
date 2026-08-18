// src/app/api/accounts/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Account from "@/models/Account";
import Log from "@/models/Log";

export const dynamic = "force-dynamic";

// 📄 GET ROUTINE: list all system accounts
export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await Account.find({}).sort({ createdAt: -1 });
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ➕ POST ROUTINE: create a new system account
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.fullName || !body.username || !body.password) {
      return NextResponse.json(
        { error: "Full name, username, and password are required." },
        { status: 400 }
      );
    }

    const existing = await Account.findOne({ username: body.username.trim() });
    if (existing) {
      return NextResponse.json(
        { error: `Username "${body.username}" is already taken.` },
        { status: 400 }
      );
    }

    // Auto-generate a sequential userId, same style as the Resident ID generator
    const totalAccounts = await Account.countDocuments();
    const userId = `ACC-${String(totalAccounts + 1).padStart(3, "0")}`;

    // ⚠️ NOTE: password is currently stored as-is (plain text), matching how the
    // rest of this system stores passwords (e.g. Resident default password).
    // For a production barangay system this should be hashed with bcrypt before
    // saving. Flagging this here since Accounts holds login credentials — happy
    // to add bcrypt hashing + a login route as a follow-up if you want it, gar.
    const newAccount = await Account.create({
      ...body,
      userId,
      fullName: body.fullName.trim(),
      username: body.username.trim(),
    });

    await Log.create({
      action: `Created System Account (${body.role || "Secretary"})`,
      target: body.fullName.trim().toUpperCase(),
    }).catch((err) => console.error("Failed to write creation log:", err));

    return NextResponse.json({ success: true, record: newAccount }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 📝 PUT ROUTINE: update an existing account (e.g. role, status, password reset)
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const { id, ...updateData } = await request.json();
    if (!id) return NextResponse.json({ error: "Account ID is required" }, { status: 400 });

    const updated = await Account.findByIdAndUpdate(id, updateData, { returnDocument: "after" });
    if (!updated) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    await Log.create({
      action: "Updated System Account",
      target: (updated.fullName || "").trim().toUpperCase(),
    }).catch((err) => console.error("Failed to write update log:", err));

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🗑️ DELETE ROUTINE: remove an account, identified by Mongo _id or userId
export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Account ID is required" }, { status: 400 });

    const account = id.startsWith("ACC-")
      ? await Account.findOne({ userId: id })
      : await Account.findById(id);

    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    await Account.findByIdAndDelete(account._id);

    await Log.create({
      action: "Deleted System Account",
      target: (account.fullName || "").trim().toUpperCase(),
    }).catch((err) => console.error("Failed to write deletion log:", err));

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
