"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";
// 🚀 IN-IMPORT ANG FRAMER MOTION AT ANIMATEPRESENCE GAR
import { motion, AnimatePresence } from "framer-motion";

export default function ResidentsPage() {
  // 1. Local States for Residents Table Data
  const [residents, setResidents] = useState<{
    _id?: string;
    firstName: string;
    middleName: string;
    lastName: string;
    contact: string;
    address: string;
    purok: string;
    gender: string;
    civilStatus: string;
    status: string;
    age?: number | string;
    isRegisteredVoter?: string;
  }[]>([]);

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // 3. Modal Visibility State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedResidentIndex, setSelectedResidentIndex] = useState<number | null>(null);
  
  // 🚨 BAGONG STATE: Lalagyan ng pansamantalang babala kapag duplicate ang isinusumite, gar!
  const [modalError, setModalError] = useState("");

  // 4. Form State for Resident Input Block
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    contactNumber: "",
    address: "",
    barangay: "Zone I",
    gender: "Male",
    civilStatus: "Single",
    status: "Active",
    age: "",
    isRegisteredVoter: "No",
  });

  // ✨ AUTOMATIC RESIDENTS FETCH SYNC
  const fetchResidents = async () => {
    try {
      const res = await fetch("/api/residents");
      if (res.ok) {
        const data = await res.json();
        setResidents(Array.isArray(data) ? data : data.residents || []);
      }
    } catch (err) {
      console.error("Failed to sync residents cluster:", err);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // 5. Connect Form Handler for Creating/Updating Profiles
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(""); // Linisin muna ang nakaraang warning alert

    const targetResident = selectedResidentIndex !== null ? residents[selectedResidentIndex] : null;

    const bodyData = {
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      contact: formData.contactNumber,
      address: formData.address,
      purok: formData.barangay,
      gender: formData.gender,
      civilStatus: formData.civilStatus,
      status: formData.status,
      age: formData.age ? Number(formData.age) : "",
      isRegisteredVoter: formData.isRegisteredVoter,
    };

    if (isEditMode && targetResident && targetResident._id) {
      try {
        const res = await fetch("/api/residents", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetResident._id, ...bodyData }),
        });

        if (res.ok) {
          fetchResidents();
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedResidentIndex(null);
        } else {
          const errData = await res.json();
          setModalError(errData.error || "Failed to update resident record in database.");
        }
      } catch (err) {
        console.error("Error updating resident:", err);
      }
    } else {
      try {
        const res = await fetch("/api/residents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        const data = await res.json();

        if (res.ok) {
          fetchResidents();
          setIsModalOpen(false);
          // I-reset lang ang form kapag matagumpay na na-save!
          setFormData({ 
            firstName: "", middleName: "", lastName: "", contactNumber: "", 
            address: "", barangay: "Zone I", gender: "Male", civilStatus: "Single", 
            status: "Active", age: "", isRegisteredVoter: "No"
          });
        } else {
          // 🚨 KUNG DI OK (STATUS 400 MULA SA API ROUTE), ILALABAS ANG WARNING ALERTER
          setModalError(data.error || "Failed to save new resident to database.");
          return; // Hinto rito para hindi mawala ang tina-type ng admin sa input boxes
        }
      } catch (err) {
        console.error("Error creating resident:", err);
      }
    }
  };

  // 🗑️ RESIDENT DELETE ACTION
  const handleDelete = async (indexToDelete: number, fullName: string) => {
    const targetResident = residents[indexToDelete];
    if (!targetResident || !targetResident._id) return;

    const confirmDeletion = confirm(`Are you sure you want to remove ${fullName} from the list of residents?`);
    if (!confirmDeletion) return;

    try {
      const res = await fetch("/api/residents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetResident._id }),
      });

      if (res.ok) {
        fetchResidents();
      } else {
        alert("Failed to delete resident from database.");
      }
    } catch (err) {
      console.error("Error deleting resident:", err);
    }
  };

  // ✏️ RESIDENT EDIT POPULATE TRIGGER
  const handleEditTrigger = (res: any, index: number) => {
    setModalError(""); // Clear errors
    setSelectedResidentIndex(index);
    setFormData({
      firstName: res.firstName,
      middleName: res.middleName || "",
      lastName: res.lastName,
      contactNumber: res.contact,
      address: res.address,
      barangay: res.purok,
      gender: res.gender,
      civilStatus: res.civilStatus,
      status: res.status,
      age: res.age !== undefined ? String(res.age) : "",
      isRegisteredVoter: res.isRegisteredVoter || "No"
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 6. Filter Verification Logic
  const filteredResidents = residents.filter((res) => {
    const fullName = `${res.firstName} ${res.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || res.contact.includes(searchQuery);
    const matchesBarangay = barangayFilter === "All" || res.purok === barangayFilter;
    const matchesStatus = statusFilter === "All" || res.status === statusFilter;
    return matchesSearch && matchesBarangay && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="Resident Information">
      {/* 🚀 PAGE ENTRY ANIMATION CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">Resident Information Directory</h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">Profile logs, community demographic listings, and local residency markers</p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setModalError("");
                setIsEditMode(false);
                setSelectedResidentIndex(null);
                setFormData({ firstName: "", middleName: "", lastName: "", contactNumber: "", address: "", barangay: "Zone I", gender: "Male", civilStatus: "Single", status: "Active", age: "", isRegisteredVoter: "No" });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Plus size={16} /> Add Resident
            </motion.button>

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
              <option value="Active">Active</option>
              <option value="Deceased">Deceased</option>
              <option value="Moved Out">Moved Out</option>
            </select>
          </div>

          <div className="relative">
            <input type="text" placeholder="Search resident name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all" />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Zone / Sector</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Age</th>
                  <th className="p-4">Voter?</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
                {filteredResidents.length > 0 ? (
                  filteredResidents.map((res, idx) => (
                    // 🚀 STAGGERED ROW ANIMATION EFFECT
                    <motion.tr 
                      key={res._id || idx} 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.25) }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-4 font-bold text-gray-900">{`${res.firstName} ${res.middleName ? res.middleName + ' ' : ''}${res.lastName}`}</td>
                      <td className="p-4 font-mono text-gray-600">{res.contact}</td>
                      <td className="p-4 text-gray-500">{res.address}</td>
                      <td className="p-4 text-gray-600"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">{res.purok}</span></td>
                      <td className="p-4 text-gray-500">{res.gender}</td>
                      <td className="p-4 font-bold text-slate-700">{res.age !== undefined && res.age !== "" ? res.age : "N/A"}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${res.isRegisteredVoter === "Yes" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-600"}`}>
                          {res.isRegisteredVoter || "No"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${res.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditTrigger(res, idx)} 
                            className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 shadow-sm transition-colors"
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(idx, `${res.firstName} ${res.lastName}`)} 
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
                    <td colSpan={9} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">No resident files found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL WINDOW BLOCK */}
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
                className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-center justify-between bg-[#1e293b] p-5 text-white">
                  <h3 className="text-sm font-black uppercase tracking-wider">{isEditMode ? "Modifying Resident Profile Logs" : "Census Registry: Encode Resident Record"}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                </div>

                {/* Form Elements */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* 🚨 DYNAMIC DUPLICATE ALERT BANNER WITH SHAKE EFFECT */}
                  {modalError && (
                    <motion.div 
                      initial={{ x: -10 }}
                      animate={{ x: [0, -10, 10, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                      className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-600"
                    >
                      ⚠️ {modalError}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">First Name</label>
                      <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Middle Name</label>
                      <input type="text" value={formData.middleName} onChange={(e) => setFormData({...formData, middleName: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Last Name</label>
                      <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Contact No.</label>
                      <input type="text" required value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-mono outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Age</label>
                      <input type="number" required placeholder="65" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Zone Assignment</label>
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

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Street Address</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all" />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                      <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold cursor-pointer">
                        <option>Male</option><option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Civil Status</label>
                      <select value={formData.civilStatus} onChange={(e) => setFormData({...formData, civilStatus: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold cursor-pointer">
                        <option>Single</option><option>Married</option><option>Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Voter?</label>
                      <select value={formData.isRegisteredVoter} onChange={(e) => setFormData({...formData, isRegisteredVoter: e.target.value})} className="w-full rounded-lg border border-blue-200 bg-blue-50/60 p-2 text-xs font-bold text-blue-700 cursor-pointer outline-none focus:bg-white">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold cursor-pointer">
                        <option value="Active">Active</option><option value="Deceased">Deceased</option><option value="Moved Out">Moved Out</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors">Cancel</button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      {isEditMode ? "Save Changes" : "Commit Record"}
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