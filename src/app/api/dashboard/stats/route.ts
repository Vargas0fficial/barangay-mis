import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Resident from "@/models/Resident";
import Log from "@/models/Log";
import Blotter from "@/models/Blotter"; 
import Official from "@/models/Official"; 
import FourPs from "@/models/FourPs"; // Selyadong 4Ps model track

export async function GET() {
  try {
    await connectToDatabase();

    // 1. 📊 RESIDENTS GENERAL STATS
    const totalResidents = await Resident.countDocuments({});
    const fourPsMembers = await FourPs.countDocuments({}).catch(() => 0);

    // 2. 🛡️ OFFICIALS COUNT 
    const activeOfficials = await Official.countDocuments({ status: "Active" }).catch(() => 0);

    // 3. ⚖️ BLOTTER STATS 
    const totalCases = await Blotter.countDocuments({}).catch(() => 0);
    
    const activeCases = await Blotter.countDocuments({ 
      $or: [
        { status: "Active" }, { caseStatus: "Active" },
        { status: "Pending" }, { caseStatus: "Pending" },
        { status: "Scheduled" }, { caseStatus: "Scheduled" },
        { status: "Referred to Court" }, { caseStatus: "Referred to Court" } 
      ] 
    }).catch(() => 0);
    
    const settledCases = await Blotter.countDocuments({ 
      $or: [{ status: "Settled" }, { caseStatus: "Settled" }] 
    }).catch(() => 0);
    
    const referredCases = await Blotter.countDocuments({ 
      $or: [{ status: "Referred to Court" }, { caseStatus: "Referred to Court" }] 
    }).catch(() => 0);

    // 4. 👥 DEMOGRAPHICS CALCULATION
    const seniorCitizens = await Resident.countDocuments({ 
      $or: [{ age: { $gte: 60 } }, { classification: "Senior Citizen" }] 
    });

    // 💡 IN-EDIT PARA SALUHIN ANG BAGONG ISREGISTEREDVOTER FIELD PERO WALANG BINABAGO SA NATAPOS NA
    const voters = await Resident.countDocuments({ 
      $or: [
        { isRegisteredVoter: "Yes" }, 
        { isVoter: true }, 
        { voterStatus: "Active" }
      ],
      status: "Active" // Bibilangin lang ang mga kasalukuyang active residents
    });

    const minors = await Resident.countDocuments({ age: { $lt: 18 } });

    // 5. 📝 RECENT SYSTEM LOGS ROUTINE
    const rawLogs = await Log.find({}).sort({ createdAt: -1 }).limit(5);

    const formattedLogs = rawLogs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      target: log.target,
      time: formatTimeAgo(log.createdAt),
    }));

    // 6. 🚀 COMPREHENSIVE CONTROL INTEL METRICS RESPONSE
    return NextResponse.json({
      stats: {
        totalResidents,
        activeOfficials,
        fourPsMembers,
        totalHouseholds: Math.ceil(totalResidents / 4), 
      },
      blotter: {
        totalCases,
        activeCases,
        settledCases,
        referredCases
      },
      demographics: { // 💡 FIXED: Itinugma sa 'demographics' para salong-salo ng frontend
        voters,
        seniorCitizens,
        minors
      },
      logs: formattedLogs
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}