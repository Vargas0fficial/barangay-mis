"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
// 🚀 IN-IMPORT ANG FRAMER MOTION AT ANIMATE PRESENCE PARA SA REFRESH AT MODAL LIFTS
import { motion, AnimatePresence } from "framer-motion";

export default function BlotterPage() {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ⚙️ SYSTEM STATE FOR MODE TRACKING
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    complainantName: "",
    respondentName: "",
    incidentType: "Physical Altercation",
    incidentDate: "",
    incidentDetails: "",
    caseStatus: "Active"
  });

  // Fetch blotter records directly from the internal Next.js cluster API layer
  const fetchBlotterRecords = async () => {
    try {
      const res = await fetch("/api/blotter");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (err) {
      console.error("Error fetching blotter records:", err);
    }
  };

  useEffect(() => {
    fetchBlotterRecords();
  }, []);

  // 📝 OPEN MODAL FOR EDIT MODE ROUTINE
  const handleEditClick = (item: any) => {
    setIsEditMode(true);
    setEditingCaseId(item._id || item.caseNumber);
    setFormData({
      complainantName: item.complainant || "",
      respondentName: item.respondent || "",
      incidentType: item.incidentType || "Physical Altercation",
      incidentDate: item.incidentDate || "",
      incidentDetails: item.narrative || "",
      caseStatus: item.status || "Active"
    });
    setIsModalOpen(true);
  };

  // 🗑️ PURGE/DELETE RECORD ROUTINE
  const handleDeleteClick = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this case record?`)) return;

    try {
      const res = await fetch(`/api/blotter/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setCases((prev) => prev.filter((item: any) => item._id !== id));
      } else {
        alert("Failed to delete the record from backend tracks.");
      }
    } catch (err) {
      console.error("Communication dropped during delete request:", err);
    }
  };

  // 📥 SUBMIT HANDLER (COMBINED INSERT & UPDATE LOGIC)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = isEditMode 
      ? `/api/blotter/${editingCaseId}`
      : "/api/blotter";
      
    const method = isEditMode ? "PUT" : "POST";

    const submissionPayload = {
      caseNumber: isEditMode ? undefined : `BLTR-${new Date(formData.incidentDate).getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      complainant: formData.complainantName,
      respondent: formData.respondentName,
      incidentType: formData.incidentType,
      incidentDate: formData.incidentDate,
      location: "Barangay Hall", 
      narrative: formData.incidentDetails,
      status: formData.caseStatus
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionPayload)
      });

      if (res.ok) {
        await fetchBlotterRecords(); 
        closeModalRoutine();
      } else {
        alert("Failed to operationalize form data handling inside the cluster backend.");
      }
    } catch (err) {
      console.error("Server socket dropped validation schema:", err);
    }
  };

  const closeModalRoutine = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCaseId(null);
    setFormData({ complainantName: "", respondentName: "", incidentType: "Physical Altercation", incidentDate: "", incidentDetails: "", caseStatus: "Active" });
  };

  // 🛡️ BULLETPROOF CASE-INSENSITIVE FILTERING ROUTINE
  const filteredCases = cases.filter((item: any) => {
    const search = searchQuery.toLowerCase().trim();
    
    const matchesSearch = !search || 
                          item.complainant?.toLowerCase().includes(search) || 
                          item.respondent?.toLowerCase().includes(search) ||
                          item.caseNumber?.toLowerCase().includes(search);
                          
    const matchesStatus = statusFilter === "All" || 
                          item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="Blotter Records">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
            Barangay Blotter & Incident Registry
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">
            Log community disputes, track arbitration status, and manage peace and order logs
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setIsEditMode(false); setIsModalOpen(true); }}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} /> File Incident Report
            </motion.button>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span>Arbitration Status</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-gray-700 outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All">All Incidents</option>
                <option value="Active">Active / Ongoing</option>
                <option value="Settled">Settled / Closed</option>
                <option value="Referred to Court">Referred to Court</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by Case ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* TABLE DATA GRID */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Complainant (Aggrieved)</th>
                  <th className="p-4">Respondent (Accused)</th>
                  <th className="p-4">Incident Type</th>
                  <th className="p-4">Date Filed</th>
                  <th className="p-4">Detailed Incident Narrative</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
                {filteredCases.length > 0 ? (
                  filteredCases.map((item: any, index) => (
                    <tr key={item._id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-900">{item.caseNumber || "N/A"}</td>
                      <td className="p-4 font-bold text-gray-900">{item.complainant || "N/A"}</td>
                      <td className="p-4 text-gray-700">{item.respondent || "N/A"}</td>
                      <td className="p-4">
                        <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                          {item.incidentType || "General"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 font-mono">{item.incidentDate || "N/A"}</td>
                      <td className="p-4 text-xs text-gray-600 max-w-[220px] truncate font-medium" title={item.narrative}>
                        {item.narrative || <span className="text-gray-300 italic">No narrative logs</span>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                          item.status === "Active"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          <span className={`h-2 w-2 rounded-full ${
                            item.status === "Active" ? "bg-rose-500" : "bg-amber-500"
                          }`} />
                          {item.status || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 shadow-sm transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item._id)}
                            className="rounded bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 shadow-sm transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">
                      No blotter records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL WINDOW FOR SUBMIT/UPDATE WITH ANIMS */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-gray-100 bg-[#1e293b] p-5 text-white">
                  <h3 className="text-sm font-black tracking-wider uppercase">
                    {isEditMode ? `Edit Case Ledger: ${editingCaseId}` : "Arbitration Form: Register Legal Dispute"}
                  </h3>
                  <button onClick={closeModalRoutine} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Complainant Name</label>
                      <input type="text" required className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all" value={formData.complainantName} onChange={(e) => setFormData({...formData, complainantName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Respondent Name</label>
                      <input type="text" required className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all" value={formData.respondentName} onChange={(e) => setFormData({...formData, respondentName: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Incident Classification</label>
                      <select className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer" value={formData.incidentType} onChange={(e) => setFormData({...formData, incidentType: e.target.value})}>
                        <option>Physical Altercation</option>
                        <option>Boundary Dispute</option>
                        <option>Theft / Robbery</option>
                        <option>Oral Defamation</option>
                        <option>Property Damage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Incident Date</label>
                      <input type="date" required className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white" value={formData.incidentDate} onChange={(e) => setFormData({...formData, incidentDate: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Case Settlement Status</label>
                    <select className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer" value={formData.caseStatus} onChange={(e) => setFormData({...formData, caseStatus: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Settled">Settled</option>
                      <option value="Referred to Court">Referred to Court</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Detailed Incident Narrative</label>
                    <textarea rows={3} required className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white resize-none" value={formData.incidentDetails} onChange={(e) => setFormData({...formData, incidentDetails: e.target.value})} />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={closeModalRoutine} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors">
                      {isEditMode ? "Save Structural Updates" : "Log Case File"}
                    </button>
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