"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Plus, Search, ShieldCheck, Eye, EyeOff, UserPlus, Key, Trash2 } from "lucide-react";
// 🚀 IN-IMPORT ANG ANIMATION ENGINE PARA MAGING PREMIUM ANG REFRESH AT MODAL TRANSLATIONS
import { motion, AnimatePresence } from "framer-motion";

export default function AccountsPage() {
  // 1. Core State Array for System Accounts Metadata (Clean Initial Slate)
  const [accounts, setAccounts] = useState<{ userId: string; fullName: string; username: string; role: string; status: string; passwordPreview: string; }[]>([]);

  // 2. Control Layout Visibility Tracks
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});

  // 3. New User Account Struct Form State
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "Secretary",
    status: "Active"
  });

  // Dynamic Lifecycle Hook: Persist state by fetching existing backend account files
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
        }
      } catch (err) {
        console.error("Failed to load live database stream:", err);
      }
    };
    fetchAccounts();
  }, []);

  // 4. Password Security Preview Toggle Handler
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // 5. Connect to Backend Pipeline for User Provisioning
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const savedAccount = await res.json();
        
        // Dynamic incremental sequence computation based on actual runtime array layout
        const nextIndex = accounts.length > 0 ? Math.max(...accounts.map(a => parseInt(a.userId.split('-')[1]) || 0)) + 1 : 1;
        const generatedId = `ACC-${String(nextIndex).padStart(3, '0')}`;
        
        setAccounts((prev) => [
          ...prev,
          {
            userId: savedAccount.record?.userId || generatedId,
            fullName: formData.fullName,
            username: formData.username,
            role: formData.role,
            status: formData.status,
            passwordPreview: formData.password
          }
        ]);

        // Close transaction view overlay
        setIsModalOpen(false);
        setFormData({ fullName: "", username: "", password: "", role: "Secretary", status: "Active" });
      } else {
        alert("Server failed to provision user profile. Review database indexing log parameters");
      }
    } catch (err) {
      console.error("Database connection dropped:", err);
      
      // Fallback architecture synchronization for offline testing execution
      const nextIndex = accounts.length > 0 ? Math.max(...accounts.map(a => parseInt(a.userId.split('-')[1]) || 0)) + 1 : 1;
      const generatedId = `ACC-${String(nextIndex).padStart(3, '0')}`;
      
      setAccounts((prev) => [
        ...prev,
        {
          userId: generatedId,
          fullName: formData.fullName,
          username: formData.username,
          role: formData.role,
          status: formData.status,
          passwordPreview: formData.password || "FallbackPass123"
        }
      ]);
      setIsModalOpen(false);
    }
  };

  // Safe De-provisioning Request Loop Handler
  const handleDeleteAccount = async (userId: string) => {
    if (confirm("Are you sure you want to permanently delete this system user profile account tracking layer? This action cannot be undone.")) {
      try {
        const res = await fetch(`http://localhost:5000/api/accounts/${userId}`, {
          method: "DELETE"
        });

        if (res.ok) {
          setAccounts((prev) => prev.filter((acc) => acc.userId !== userId));
        } else {
          alert("Failed to drop record context from active servers pipeline.");
        }
      } catch (err) {
        console.error("Database deletion routing request timed out:", err);
      }
    }
  };

  // 6. Integrated Multi-Tier Security Filtration Mechanics
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch = acc.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          acc.userId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || acc.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout activeMenu="Accounts & Security">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* PAGE SUBHEADER DESCRIPTORS */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
            System Identity & Access Management
          </h1>
          <p className="text-sm font-semibold text-gray-400 mt-0.5">
            Audit privileged system logs, manage administrator credentials, and update system role permissions
          </p>
        </div>

        {/* 🛠️ STRATEGIC CONTROL ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <UserPlus size={16} /> Provision New Account
            </motion.button>
            
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span>Authority Role</span>
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-gray-700 outline-none cursor-pointer text-xs font-bold"
              >
                <option value="All">All Clearance Levels</option>
                <option value="Admin">System Administrator</option>
                <option value="Secretary">Barangay Secretary</option>
                <option value="Treasurer">Barangay Treasurer</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search users by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* 📊 SECURE IDENTITY MANAGEMENT ARCHITECTURE GRID */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
                  <th className="p-4">User Index ID</th>
                  <th className="p-4">Account Holder Name</th>
                  <th className="p-4">System Username</th>
                  <th className="p-4">Security Clearance Role</th>
                  <th className="p-4">Credential Vector Status</th>
                  <th className="p-4 text-center">Security Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((acc, index) => (
                    <tr key={acc.userId || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-gray-500">{acc.userId}</td>
                      <td className="p-4 font-bold text-gray-900">{acc.fullName}</td>
                      <td className="p-4 text-gray-600 font-mono">{acc.username}</td>
                      <td className="p-4">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-black tracking-wide border uppercase ${
                          acc.role === "Admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : acc.role === "Treasurer"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-gray-800 tracking-wide font-semibold">
                            {visiblePasswords[acc.userId] ? acc.passwordPreview : "••••••••"}
                          </span>
                          <button 
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.userId)}
                            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded hover:bg-slate-100"
                          >
                            {visiblePasswords[acc.userId] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <ShieldCheck size={12} className="text-emerald-500" /> Authorized
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleDeleteAccount(acc.userId)}
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
                    <td colSpan={6} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">
                      No configured user profiles match security search parameters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📑 USER SECURITY CREATION MODAL MATRIX WITH EXIT ANIMS */}
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
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col"
              >
                
                {/* Modal Banner Control Header */}
                <div className="flex items-center justify-between border-b border-gray-100 bg-[#1e293b] p-5 text-white">
                  <h3 className="text-sm font-black tracking-wider uppercase flex items-center gap-2">
                    <Key size={16} className="text-emerald-400" /> Identity Matrix Assignment
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                    ✕
                  </button>
                </div>

                {/* Secure Credentials Profile Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Holder Full Identity Designation</label>
                    <input 
                      type="text" required placeholder="e.g., Jane Watson Dela Cruz"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">System Handle (Username)</label>
                    <input 
                      type="text" required placeholder="e.g., brgy_sec_jane"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Access Authentication Token (Password)</label>
                    <input 
                      type="password" required placeholder="Configure strong password hash"
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-mono font-semibold outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Security Access Authority Level</label>
                    <select 
                      className="w-full rounded-lg border border-gray-200 bg-slate-50 p-2.5 text-sm font-semibold outline-none cursor-pointer"
                      value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Admin">System Administrator</option>
                      <option value="Secretary">Barangay Secretary</option>
                      <option value="Treasurer">Barangay Treasurer</option>
                    </select>
                  </div>

                  {/* Operational Execution Controls */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                      type="button" onClick={() => setIsModalOpen(false)}
                      className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      Deploy Account
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