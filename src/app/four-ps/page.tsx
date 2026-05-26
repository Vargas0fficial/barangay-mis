"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Edit2, Trash2, X, Users } from "lucide-react";
// 🚀 IN-IMPORT ANG FRAMER MOTION PARA SA PREMIUM UI TRANSITIONS, GAR!
import { motion, AnimatePresence } from "framer-motion";

export default function FourPsPage() {
  // 1. Core States for 4Ps Registry
  const [beneficiaries, setBeneficiaries] = useState<{
    _id?: string;
    householdHead: string;
    householdId: string;
    barangay: string;
    dependentsCount: number;
    monthlySubsidy: number;
    status: string; // Active, Graduated, Suspended
  }[]>([]);

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // 3. Modal UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 4. Form State (Ginawang "Zone I" ang default value, gar!)
  const [formData, setFormData] = useState({
    householdHead: "",
    householdId: "",
    barangay: "Zone I",
    dependentsCount: "0",
    monthlySubsidy: "1350",
    status: "Active"
  });

  // 📝 Fetch 4Ps Records from the Backend API
  const fetchBeneficiaries = async () => {
    try {
      const res = await fetch("/api/fourps");
      if (res.ok) {
        const data = await res.json();
        setBeneficiaries(Array.isArray(data) ? data : data.beneficiaries || []);
      }
    } catch (err) {
      console.error("Failed to fetch 4Ps cluster:", err);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  // ➕ Form Submission Handler (POST / PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = selectedIndex !== null ? beneficiaries[selectedIndex] : null;

    const bodyData = {
      householdHead: formData.householdHead,
      householdId: formData.householdId,
      barangay: formData.barangay,
      dependentsCount: parseInt(formData.dependentsCount) || 0,
      monthlySubsidy: parseFloat(formData.monthlySubsidy) || 0,
      status: formData.status
    };

    if (isEditMode && target && target._id) {
      try {
        const res = await fetch("/api/fourps", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: target._id, ...bodyData }),
        });
        if (res.ok) {
          fetchBeneficiaries();
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error("Error updating 4Ps record:", err);
      }
    } else {
      try {
        const res = await fetch("/api/fourps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        if (res.ok) {
          fetchBeneficiaries();
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error("Error creating 4Ps record:", err);
      }
    }

    // Reset Form to Default Zone I
    setFormData({ householdHead: "", householdId: "", barangay: "Zone I", dependentsCount: "0", monthlySubsidy: "1350", status: "Active" });
    setSelectedIndex(null);
    setIsEditMode(false);
  };

  // 🗑️ Delete Handler
  const handleDelete = async (indexToDelete: number, headName: string) => {
    const target = beneficiaries[indexToDelete];
    if (!target || !target._id) return;

    const confirmDeletion = confirm(`Are you sure you want to remove ${headName}'s household from the 4Ps index?`);
    if (!confirmDeletion) return;

    try {
      const res = await fetch("/api/fourps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: target._id }),
      });
      if (res.ok) fetchBeneficiaries();
    } catch (err) {
      console.error("Error deleting 4Ps record:", err);
    }
  };

  // ✏️ Edit Mode Setup
  const handleEditTrigger = (item: any, index: number) => {
    setSelectedIndex(index);
    setFormData({
      householdHead: item.householdHead,
      householdId: item.householdId,
      barangay: item.barangay,
      dependentsCount: item.dependentsCount.toString(),
      monthlySubsidy: item.monthlySubsidy.toString(),
      status: item.status
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 🔍 Filtering System
  const filteredBeneficiaries = beneficiaries.filter((item) => {
    const matchesSearch = item.householdHead.toLowerCase().includes(searchQuery.toLowerCase()) || item.householdId.includes(searchQuery);
    const matchesBarangay = barangayFilter === "All" || item.barangay === barangayFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesBarangay && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="4Ps Members">
      {/* 🚀 SMOOTH WRAPPER FOR PAGE LOAD ENTRY */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        {/* HEADER SECTION */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
            4Ps Program Index Registry
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">Pantawid Pamilyang Pilipino Program monitoring, social subsidy allocations, and verification logs</p>
        </div>

        {/* CONTROLS & FILTERING BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsEditMode(false);
                setSelectedIndex(null);
                setFormData({ householdHead: "", householdId: "", barangay: "Zone I", dependentsCount: "0", monthlySubsidy: "1350", status: "Active" });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
            >
              <Plus size={16} /> Register Household
            </motion.button>

            {/* 📍 FILTER: ZONE I TO VII */}
            <select value={barangayFilter} onChange={(e) => setBarangayFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold text-gray-700 outline-none cursor-pointer">
              <option value="All">All Zones</option>
              <option value="Zone I">Zone I</option>
              <option value="Zone II">Zone II</option>
              <option value="Zone III">Zone III</option>
              <option value="Zone IV">Zone IV</option>
              <option value="Zone V">Zone V</option>
              <option value="Zone VI">Zone VI</option>
              <option value="Zone VII">Zone VII</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold text-gray-700 outline-none cursor-pointer">
              <option value="All">All Status</option>
              <option value="Active">Active Beneficiary</option>
              <option value="Graduated">Graduated (Self-Sufficient)</option>
              <option value="Suspended">Suspended Record</option>
            </select>
          </div>

          <div className="relative">
            <input type="text" placeholder="Search Head or Household ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-72 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-rose-600 focus:bg-white transition-all" />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* DATA MANAGEMENT TABLE */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
                  <th className="p-4">Household ID</th>
                  <th className="p-4">Household Head Name</th>
                  <th className="p-4">Sector/Zone Assignment</th>
                  <th className="p-4 text-center">Dependents</th>
                  <th className="p-4">Est. Monthly Grant</th>
                  <th className="p-4">Registry Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
                {filteredBeneficiaries.length > 0 ? (
                  filteredBeneficiaries.map((item, idx) => (
                    // 🚀 SEQUENTIAL ENTRY ANIMATION PER ROW
                    <motion.tr 
                      key={item._id || idx} 
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4 font-mono text-xs font-bold text-slate-600">{item.householdId}</td>
                      <td className="p-4 font-bold text-gray-900">{item.householdHead}</td>
                      <td className="p-4 text-gray-600">
                        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">{item.barangay}</span>
                      </td>
                      <td className="p-4 text-center text-gray-900 font-bold">{item.dependentsCount}</td>
                      <td className="p-4 font-mono text-emerald-600 font-bold">₱{parseFloat(item.monthlySubsidy.toString()).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold 
                          ${item.status === "Active" ? "bg-emerald-50 text-emerald-700" : 
                            item.status === "Graduated" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                          • {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditTrigger(item, idx)} 
                            className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 shadow-sm transition-colors"
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(idx, item.householdHead)} 
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
                    <td colSpan={7} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">No household program entries located</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INPUT MODAL COMPONENT */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: -15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col border border-gray-100"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between bg-[#1e293b] p-5 text-white">
                  <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> {isEditMode ? "Edit Profile Case Log" : "4Ps Encoding: New Program Entry"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Household ID Number</label>
                      <input type="text" required placeholder="e.g. 015511000-XXXX" value={formData.householdId} onChange={(e) => setFormData({...formData, householdId: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-mono outline-none focus:bg-white focus:border-rose-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Zone Sector</label>
                      <select value={formData.barangay} onChange={(e) => setFormData({...formData, barangay: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold cursor-pointer">
                        <option value="Zone I">Zone I</option>
                        <option value="Zone II">Zone II</option>
                        <option value="Zone III">Zone III</option>
                        <option value="Zone IV">Zone IV</option>
                        <option value="Zone V">Zone V</option>
                        <option value="Zone VI">Zone VI</option>
                        <option value="Zone VII">Zone VII</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Household Head Full Name</label>
                    <input type="text" required placeholder="Last Name, First Name Middle Name" value={formData.householdHead} onChange={(e) => setFormData({...formData, householdHead: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:bg-white focus:border-rose-600 transition-all" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dependents</label>
                      <input type="number" min="0" required value={formData.dependentsCount} onChange={(e) => setFormData({...formData, dependentsCount: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-bold text-center outline-none focus:bg-white focus:border-rose-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Monthly Subsidy (₱)</label>
                      <input type="number" min="0" required value={formData.monthlySubsidy} onChange={(e) => setFormData({...formData, monthlySubsidy: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-mono font-bold text-center text-emerald-700 outline-none focus:bg-white focus:border-rose-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Program Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold cursor-pointer">
                        <option value="Active">Active</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors">Cancel</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
                    >
                      Save Household Record
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