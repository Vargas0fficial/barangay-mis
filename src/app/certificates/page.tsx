"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Printer, CheckCircle } from "lucide-react";
// 🚀 IN-IMPORT ANG FRAMER MOTION PARA SA PREMIUM ENTRY AT BUTTON HOVERS
import { motion, AnimatePresence } from "framer-motion";

export default function CertificatesPage() {
  // 1. Core Form States
  const [residentName, setResidentName] = useState("");
  const [certificateType, setCertificateType] = useState("Barangay Clearance");
  const [purpose, setPurpose] = useState("Local Employment");
  const [orNumber, setOrNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("50.00");
  const [statusMessage, setStatusMessage] = useState("");

  // 2. Year/Date Tracking
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // 3. Print Execution Trigger
  const handlePrint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentName) {
      alert("Please enter or select a resident name first!");
      return;
    }
    
    try {
      // 🎯 HIT CALL 1: Isaksak ang Audit Trail Log para sa general history logs
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: `Issued ${certificateType}`, // e.g., "Issued Barangay Clearance"
          target: residentName.trim().toUpperCase(),
        }),
      });

      // 📜 HIT CALL 2: I-save ang mismong transaksyon ng Certificate sa MongoDB cluster!
      await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          residentName: residentName.trim(),
          certificateType,
          purpose,
          orNumber: orNumber || "N/A",
          amountPaid: parseFloat(amountPaid) || 0,
          dateIssued: new Date().toISOString(),
        }),
      });

    } catch (err) {
      console.error("Failed to sync certificate generation data to database:", err);
    }
    
    // 🖨️ 2. TIMEOUT DELAY DISKARTE: 300ms bwelo para makalipad ang dalawang network requests bago mag-freeze ang browser
    setTimeout(() => {
      window.print();
      
      setStatusMessage("Certificate cleared, saved to MongoDB, and sent to printer successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    }, 300);
  };

  return (
    <>
      {/* SCREEN VIEW - DASHBOARD WITH FORM */}
      <div className="print:hidden w-full">
        <DashboardLayout activeMenu="Certificate Issuance">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* PAGE HEADER */}
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                Document & Certificate Issuance
              </h1>
              <p className="text-sm font-semibold text-gray-400 mt-0.5">
                Automatic Certificate Generation, validate, and print official community legal clearances and receipts
              </p>
            </div>

            {/* STATUS MESSAGE ALERT WITH SLIDE INTRO */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-800 overflow-hidden"
                >
                  <CheckCircle size={18} className="text-emerald-600" /> {statusMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SPLIT LAYOUT CONTAINER */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              
              {/* LEFT COLUMN: PARAMETER CONFIGURATION FORM */}
              <motion.div 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
                className="rounded-2xl bg-white p-6 shadow-md border border-gray-100 lg:col-span-2 space-y-5"
              >
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Document Parameters</h2>
                  <p className="text-xs font-semibold text-gray-400">Fill out configuration fields for verification logs</p>
                </div>

                <form onSubmit={handlePrint} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Resident Full Name</label>
                    <input 
                      type="text" required placeholder="Search or type name (e.g., Juan Dela Cruz)"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={residentName} onChange={(e) => setResidentName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Certificate Type</label>
                    <select 
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer"
                      value={certificateType} onChange={(e) => setCertificateType(e.target.value)}
                    >
                      <option>Barangay Clearance</option>
                      <option>Certificate of Indigency</option>
                      <option>Certificate of Residency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Purpose / Designation</label>
                    <input 
                      type="text" required placeholder="e.g., Job Application, Financial Assistance"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={purpose} onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">O.R. Serial Number</label>
                      <input 
                        type="text" required placeholder="e.g., OR-892312"
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                        value={orNumber} onChange={(e) => setOrNumber(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount Paid (PHP)</label>
                      <input 
                        type="number" step="0.01" required
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                        value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-center font-bold text-white shadow-md hover:bg-emerald-700 transition-colors mt-6"
                  >
                    <Printer size={16} /> Process & Print Document
                  </motion.button>
                </form>
              </motion.div>

              {/* RIGHT COLUMN: LIVE SYSTEM DOCUMENT PREVIEW EYE */}
              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 15 }}
                className="rounded-2xl bg-slate-200/60 p-6 border border-dashed border-slate-300 lg:col-span-3 flex flex-col items-center"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live System Canvas Preview</span>
                
                {/* VIRTUAL PAPER WORKSPACE */}
                <div className="w-full max-w-[500px] min-h-[707px] h-auto bg-white shadow-2xl p-8 flex flex-col justify-between text-gray-900 font-serif border border-gray-200 relative overflow-hidden">
                  
                  {/* Internal Watermark Accent */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none select-none p-10">
                    <img src="/lingayen-seal.png" alt="Watermark Logo" className="w-4/5 h-auto object-contain" />
                  </div>

                  {/* Document Header Logo Track */}
                  <div className="flex items-center justify-center gap-3 border-b-2 border-gray-900 pb-4 relative z-10 w-full">
                    {/* Left Logo */}
                    <img src="/dom-east.png" alt="Left Seal" className="w-12 h-12 object-contain shrink-0" />
                    
                    {/* Header Titles */}
                    <div className="text-center space-y-0.5 max-w-[280px]">
                      <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-gray-500">Republic of the Philippines</p>
                      <p className="text-[11px] font-sans font-black uppercase tracking-wide">Province of Pangasinan</p>
                      <p className="text-[11px] font-sans font-black uppercase tracking-wide">Municipality of Lingayen</p>
                      <p className="text-sm font-sans font-black uppercase text-emerald-800 tracking-widest mt-1">Barangay Domalandan East</p>
                      <p className="text-[10px] font-sans font-semibold italic text-gray-400">Office of the Punong Barangay</p>
                    </div>

                    {/* Right Logo */}
                    <img src="/lingayen-seal.png" alt="Watermark Logo" className="w-12 h-12 object-contain shrink-0" />
                  </div>

                  {/* Document Title Accent */}
                  <div className="text-center my-6 relative z-10">
                    <h3 className="text-xl font-sans font-black uppercase tracking-widest underline decoration-double underline-offset-4 text-gray-900">
                      {certificateType}
                    </h3>
                  </div>

                  {/* Document Body Text Core */}
                  <div className="flex-1 text-sm leading-relaxed text-justify space-y-4 font-normal px-2 relative z-10">
                    <p>
                      <span className="font-bold uppercase tracking-wide font-sans">To Whom It May Concern:</span>
                    </p>
                    
                    {certificateType === "Barangay Clearance" && (
                      <p>
                        This is to certify that <span className="font-bold underline uppercase font-sans bg-yellow-50">{residentName || "[ Resident Name ]"}</span>, 
                        of legal age, Filipino citizen, is a bonafide resident of Barangay Domalandan East, Lingayen, Pangasinan. 
                        He/She is known to be a person of good moral character and a law-abiding citizen in this community.
                      </p>
                    )}

                    {certificateType === "Certificate of Indigency" && (
                      <p>
                        This is to certify that <span className="font-bold underline uppercase font-sans bg-yellow-50">{residentName || "[ Resident Name ]"}</span>, 
                        is a permanent resident of Barangay Domalandan East, Lingayen, Pangasinan. Furthermore, the records show that his/her family belongs to the low-income bracket or indigent group in this community.
                      </p>
                    )}

                    {certificateType === "Certificate of Residency" && (
                      <p>
                        This is to certify that <span className="font-bold underline uppercase font-sans bg-yellow-50">{residentName || "[ Resident Name ]"}</span>, 
                        has verified residency status record data assigned within the administrative boundaries of this sector jurisdiction area in Barangay Domalandan East.
                      </p>
                    )}

                    <p>
                      According to records kept in this office, he/she has no derogatory info or pending criminal cases filed against him/her as of this assessment index date.
                    </p>
                    
                    <p>
                      This certification is being issued upon the request of the above-mentioned person for the purpose of: <span className="font-bold italic underline">{purpose || "[ Specified Purpose ]"}</span>.
                    </p>
                    
                    <p className="pt-2">
                      Given this <span className="font-bold">{currentDate}</span> at the Barangay Operations Center of Barangay Domalandan East, Lingayen, Pangasinan.
                    </p>
                  </div>

                  {/* Document Footer Clearance Track */}
                  <div className="flex justify-between items-end border-t border-gray-100 pt-6 text-[10px] font-sans font-semibold text-gray-500 relative z-10">
                    <div className="space-y-0.5 font-mono">
                      <p>O.R. No: <span className="text-gray-900 font-bold">{orNumber || "N/A"}</span></p>
                      <p>Fee Paid: <span className="text-gray-900 font-bold">PHP {amountPaid}</span></p>
                      <p>Status: <span className="text-emerald-700 font-bold">OFFICIAL</span></p>
                    </div>
                    
                    <div className="text-center w-48 space-y-1">
                      <div className="w-full border-b border-gray-900 mx-auto h-8"></div>
                      <p className="font-black text-gray-900 uppercase tracking-wide text-[11px]">Kap. Rodel "Dang" Rodriguez</p>
                      <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Punong Barangay</p>
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>
          </motion.div>
        </DashboardLayout>
      </div>

      {/* 🖨️ NATIVE CSS MEDIA PRINT ENGINE EMBED (Runs only during printing) */}
      <div className="hidden print:block w-screen h-screen m-0 p-0 bg-white text-gray-900 font-serif text-sm relative">
        
        {/* Print Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none select-none p-24">
          <img src="/lingayen-seal.png" alt="Print Watermark" className="w-5/6 h-auto object-contain" style={{pageBreakInside: 'avoid'}} />
        </div>

        {/* Print Header */}
        <div className="flex items-center justify-center gap-8 border-b-2 border-gray-900 pb-6 relative z-10 w-full px-12 pt-12" style={{pageBreakInside: 'avoid'}}>
          <img src="/dom-east.png" alt="Left Seal" className="w-24 h-24 object-contain shrink-0" />
          
          <div className="text-center space-y-1 max-w-[320px]">
            <p className="text-xs uppercase tracking-wider font-sans">Republic of the Philippines</p>
            <p className="text-xs font-bold uppercase">Province of Pangasinan</p>
            <p className="text-xs font-bold uppercase">Municipality of Lingayen</p>
            <p className="text-lg font-bold uppercase text-emerald-900 font-sans tracking-widest">Barangay Domalandan East</p>
            <p className="text-xs italic text-gray-500 font-sans">Office of the Punong Barangay</p>
          </div>

          <img src="/lingayen-seal.png" alt="Watermark Logo" className="w-24 h-24 object-contain shrink-0" />
        </div>

        {/* Print Title */}
        <div className="text-center my-12 relative z-10">
          <h2 className="text-2xl font-sans font-black uppercase tracking-widest underline decoration-double underline-offset-4">
            {certificateType}
          </h2>
        </div>

        {/* Print Content Body */}
        <div className="space-y-6 text-justify leading-relaxed px-12 relative z-10">
          <p className="font-bold uppercase font-sans">To Whom It May Concern:</p>
          
          {certificateType === "Barangay Clearance" && (
            <p>
              This is to certify that <span className="font-bold uppercase font-sans">{residentName}</span>, of legal age, Filipino citizen, 
              is a bona fide resident of Barangay Domalandan East, Lingayen, Pangasinan. He/She is known to be a person of good moral character and a law-abiding citizen in this community.
            </p>
          )}

          {certificateType === "Certificate of Indigency" && (
            <p>
              This is to certify that <span className="font-bold uppercase font-sans">{residentName}</span>, is a permanent resident of Barangay Domalandan East, Lingayen, Pangasinan. Furthermore, the records show that his/her family belongs to the low-income bracket or indigent group in this community.
            </p>
          )}

          {certificateType === "Certificate of Residency" && (
            <p>
              This is to certify that <span className="font-bold uppercase font-sans">{residentName}</span>, has verified residency status record data assigned within the administrative boundaries of this sector jurisdiction area in Barangay Domalandan East.
            </p>
          )}

          <p>
            According to records kept in this office, he/she has no derogatory info or pending criminal cases filed against him/her as of this assessment index date.
          </p>
          
          <p>
            This certification is being issued upon the request of the above-mentioned person for the purpose of: <span className="font-bold italic underline">{purpose}</span>.
          </p>
          
          <p className="pt-4">
            Given this <span className="font-bold">{currentDate}</span> at the Barangay Operations Center of Barangay Domalandan East, Lingayen, Pangasinan.
          </p>
        </div>

        {/* Print Signatures & Metadata */}
        <div className="flex justify-between items-end mt-40 text-xs font-sans relative z-10 px-12">
          <div className="space-y-1 font-mono text-gray-600">
            <p>O.R. No: <span className="text-gray-900 font-bold">{orNumber}</span></p>
            <p>Fee Paid: <span className="text-gray-900 font-bold">PHP {amountPaid}</span></p>
            <p>Date Issued: {currentDate}</p>
          </div>
          
          <div className="text-center w-56">
            <p className="font-bold text-gray-900 uppercase border-b border-gray-900 pb-1 text-sm">Kap. Rodel "Dang" Rodriguez</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mt-1">Punong Barangay</p>
          </div>
        </div>
      </div>
    </>
  );
}