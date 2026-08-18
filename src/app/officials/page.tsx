"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
// 🚀 IN-IMPORT ANG FRAMER MOTION PARA SA MGA TRANSITIONS
import { motion, AnimatePresence } from "framer-motion";

export default function OfficialsPage() {
  // 1. Local States for Officials Table Data
  const [officials, setOfficials] = useState<{
    _id?: string;
    fullName: string;
    position: string;
    termStart: string;
    termEnd: string;
    contact?: string;       // 🎯 Added to support database payload sync
    contactNumber?: string; // Kept for frontend state reference
    status: string;
  }[]>([]);

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // 3. Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedOfficialId, setSelectedOfficialId] = useState("");

  // 4. Form State for Official
  const [formData, setFormData] = useState({
    fullName: "",
    position: "Barangay Kagawad",
    termStart: "",
    termEnd: "",
    contactNumber: "",
    status: "Active"
  });

  // ✨ AUTOMATIC DATA SYNC ROUTINE
  const fetchOfficials = async () => {
    try {
      const res = await fetch("/api/officials");
      if (res.ok) {
        const data = await res.json();
        setOfficials(Array.isArray(data) ? data : data.officials || []);
      }
    } catch (err) {
      console.error("Failed to load officials:", err);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  // 5. Connect to Backend API for Saving / Editing Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🎯 PAYLOAD BRIDGE: Connects frontend "contactNumber" state to backend "contact" field
    const payload = {
      fullName: formData.fullName,
      position: formData.position,
      termStart: formData.termStart,
      termEnd: formData.termEnd,
      status: formData.status,
      contact: formData.contactNumber, // 👈 Maps frontend input straight to backend mongoose schema
    };
    
    if (isEditMode) {
      // 📝 PERMANENT EDIT LOGIC VIA BACKEND PUT API
      try {
        const res = await fetch("/api/officials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedOfficialId, ...payload }) // 👈 Uses translated payload mapping
        });

        if (res.ok) {
          fetchOfficials();
          setIsModalOpen(false);
          setIsEditMode(false);
          setFormData({ fullName: "", position: "Barangay Kagawad", termStart: "", termEnd: "", contactNumber: "", status: "Active" });
        } else {
          throw new Error("Failed to update on backend.");
        }
      } catch (err) {
        console.error("Failed updating database entry:", err);
        alert("Could not save changes to the database. Please try again.");
      }
    } else {
      // ➕ ADD LOGIC
      try {
        const res = await fetch("/api/officials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload) // 👈 Uses translated payload mapping
        });

        if (res.ok) {
          fetchOfficials();
          setIsModalOpen(false);
          setFormData({ fullName: "", position: "Barangay Kagawad", termStart: "", termEnd: "", contactNumber: "", status: "Active" });
        }
      } catch (err) {
        console.error("Database connection failed:", err);
      }
    }
  };

  // 🗑️ PERMANENT DELETE ROUTINE
  const handleDelete = async (off: any) => {
    const targetId = off._id;
    const confirmExecution = confirm(`Are you sure you want to remove ${off.fullName} from the roster?`);
    if (!confirmExecution) return;

    if (targetId) {
      try {
        const res = await fetch("/api/officials", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetId })
        });

        if (res.ok) {
          setOfficials((prev) => prev.filter((item) => item._id !== targetId));
        } else {
          throw new Error("Server rejected the deletion rule.");
        }
      } catch (err) {
        console.error("Database deletion failed:", err);
        alert("Failed to delete from database. Please verify backend state.");
      }
    } else {
      setOfficials((prev) => prev.filter((item) => item.fullName !== off.fullName));
    }
  };

  // ✏️ TRIGGER EDIT MODAL WITH POPULATED DATA
  const handleEditTrigger = (off: any) => {
    setSelectedOfficialId(off._id);
    setFormData({
      fullName: off.fullName,
      position: off.position,
      termStart: off.termStart,
      termEnd: off.termEnd,
      contactNumber: off.contact || off.contactNumber || "", // 🎯 Pulls seamlessly from whichever field is loaded
      status: off.status
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 6. Filter and Search Execution Logic
  const filteredOfficials = officials.filter((off) => {
    const currentContact = off.contact || off.contactNumber || "";
    const matchesSearch = (off.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          currentContact.includes(searchQuery);
    const matchesPosition = positionFilter === "All" || off.position === positionFilter;
    const matchesStatus = statusFilter === "All" || off.status === statusFilter;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="Barangay Officials">
      {/* 🚀 PAGE ENTRY ANIMATION */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
            Barangay Officials Roster
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">
            Manage terms, active positions, and official contact designations
          </p>
        </div>

        {/* 🛠️ FILTER TOOLBAR CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsEditMode(false);
                setFormData({ fullName: "", position: "Barangay Kagawad", termStart: "", termEnd: "", contactNumber: "", status: "Active" });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} /> Add Official
            </motion.button>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span>Position</span>
              <select 
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-gray-700 outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All">All Positions</option>
                <option value="Punong Barangay">Punong Barangay</option>
                <option value="Barangay Kagawad">Barangay Kagawad</option>
                <option value="SK Chairman">SK Chairman</option>
                <option value="Chairman">Chairman</option>
                <option value="Secretary">Secretary</option>
                <option value="Treasurer">Treasurer</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span>Status</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-gray-700 outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* 📊 DATA GRID LISTING TABLE */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Term Start</th>
                  <th className="p-4">Term End</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Active Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
                {filteredOfficials.length > 0 ? (
                  filteredOfficials.map((off, index) => (
                    // 🚀 ROW STAGGERED FADE-IN ANIMATION
                    <motion.tr 
                      key={off._id || index} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4 font-bold text-gray-900">{off.fullName}</td>
                      <td className="p-4 text-gray-600">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                          {off.position}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{off.termStart}</td>
                      <td className="p-4 text-gray-500 font-mono">{off.termEnd}</td>
                      <td className="p-4 text-gray-600 font-mono">{off.contact || off.contactNumber || "N/A"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                          off.status === "Active" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${off.status === "Active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {off.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditTrigger(off)}
                            className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 shadow-sm transition-colors"
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(off)}
                            className="rounded bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 shadow-sm transition-colors"
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">
                      No matching records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📑 ANIMATED ADD/EDIT OFFICIAL MODAL PANEL WINDOW */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col"
              >
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-[#1e293b] p-5 text-white">
                  <h3 className="text-sm font-black tracking-wider uppercase">
                    {isEditMode ? "Edit Form: Update Official Details" : "Election Form: Appoint New Official"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {/* Form Input Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Official Full Name</label>
                    <input 
                      type="text" required placeholder="e.g., Juan Dela Cruz"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Designated Position</label>
                    <select 
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer"
                      value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})}
                    >
                      <option>Punong Barangay</option>
                      <option>Barangay Kagawad</option>
                      <option>SK Chairman</option>
                      <option>Secretary</option>
                      <option>Treasurer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Term Start Date</label>
                      <input 
                        type="date" required
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                        value={formData.termStart} onChange={(e) => setFormData({...formData, termStart: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Term End Date</label>
                      <input 
                        type="date" required
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                        value={formData.termEnd} onChange={(e) => setFormData({...formData, termEnd: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Contact Number</label>
                      <input 
                        type="text" required placeholder="09xxxxxxxxx"
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white"
                        value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Governance Status</label>
                      <select 
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer"
                        value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="button" onClick={() => setIsModalOpen(false)}
                      className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      {isEditMode ? "Save Changes" : "Appoint Officer"}
                    </motion.button>
                  </div>
                </form>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}