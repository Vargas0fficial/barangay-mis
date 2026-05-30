"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, ShieldAlert, CheckCircle2, UserCheck, Activity, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";

interface SystemStats {
  totalResidents: number;
  activeOfficials: number;
  fourPsMembers: number;
  totalHouseholds: number;
}

interface BlotterStats {
  totalCases: number;
  activeCases: number;
  settledCases: number;
  referredCases: number;
}

interface DemographicsStats {
  voters: number;
  seniorCitizens: number;
  minors: number;
}

interface ActivityLog {
  id: string;
  action: string;
  target: string;
  time: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SystemStats>({ totalResidents: 0, activeOfficials: 0, fourPsMembers: 0, totalHouseholds: 0 });
  const [blotter, setBlotter] = useState<BlotterStats>({ totalCases: 0, activeCases: 0, settledCases: 0, referredCases: 0 });
  const [demographics, setDemographics] = useState<DemographicsStats>({ voters: 0, seniorCitizens: 0, minors: 0 });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats"); 
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.blotter) setBlotter(data.blotter);
        if (data.demographics) setDemographics(data.demographics);
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error("Communication dropped with internal data streams:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ FIXED: Chart data now always uses actual API data only — no more wrong fallback calculations
  const chartData = [
    { name: "Registered Voters", value: demographics.voters, color: "#3b82f6" },
    { name: "Senior Citizens", value: demographics.seniorCitizens, color: "#f59e0b" },
    { name: "Minors", value: demographics.minors, color: "#10b981" },
  ];

  const totalDemographics = chartData.reduce((sum, entry) => sum + entry.value, 0);

  const containerVariants = {
    show: { transition: { staggerChildren: 0.05 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        
        {/* 1. HEADER CONTROL LAYER */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
              Barangay Operations Intelligence Control
            </h1>
            <p className="text-sm font-semibold text-gray-400 mt-0.5">
              Real-time analytics matrix, demographic clusters, and comprehensive audit trails
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Sync System Tracks
          </motion.button>
        </div>

        {/* 2. PRIMARY SYSTEM CARDS */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Card 1: Total Residents */}
          <motion.div variants={cardVariants as any} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Residents</p>
                <h3 className="mt-1 font-mono text-3xl font-black text-slate-900">{isLoading ? "..." : stats.totalResidents}</h3>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-slate-600 border border-slate-100"><Users size={22} /></div>
            </div>
            <p className="mt-3 text-[11px] font-bold text-gray-400">Estimated House Units: <span className="text-slate-700">{stats.totalHouseholds}</span></p>
          </motion.div>

          {/* Card 2: Active Officials */}
          <motion.div variants={cardVariants as any} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Officials</p>
                <h3 className="mt-1 font-mono text-3xl font-black text-emerald-700">{isLoading ? "..." : stats.activeOfficials}</h3>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100"><UserCheck size={22} /></div>
            </div>
            <p className="mt-3 text-[11px] font-bold text-emerald-500">Currently deployed on duty</p>
          </motion.div>

          {/* Card 3: Active Blotters */}
          <motion.div variants={cardVariants as any} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Active Blotters</p>
                <h3 className="mt-1 font-mono text-3xl font-black text-rose-700">{isLoading ? "..." : blotter.activeCases}</h3>
              </div>
              <div className="rounded-xl bg-rose-50 p-3 text-rose-600 border border-rose-100"><ShieldAlert size={22} /></div>
            </div>
            <p className="mt-3 text-[11px] font-bold text-rose-500">Total reported logs: {blotter.totalCases}</p>
          </motion.div>

          {/* Card 4: 4Ps Beneficiaries */}
         <motion.div variants={cardVariants as any} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">4Ps Beneficiaries</p>
                <h3 className="mt-1 font-mono text-3xl font-black text-indigo-700">{isLoading ? "..." : stats.fourPsMembers}</h3>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 border border-indigo-100"><CheckCircle2 size={22} /></div>
            </div>
            <p className="mt-3 text-[11px] font-bold text-indigo-500">Social welfare monitored</p>
          </motion.div>
        </motion.div>

        {/* 3. SECONDARY WORKSPACE */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* PIE/DOUGHNUT GRAPH PANEL */}
          <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase text-slate-900">Demographic Distribution Analytics</h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Statistical breakdown of sector clusters inside the residential dataset</p>
            </div>

            <div className="flex-1 w-full h-full min-h-[240px] relative mt-4 flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <RefreshCw size={18} className="animate-spin text-indigo-600" />
                  Decoding Core Intel...
                </div>
              ) : totalDemographics === 0 ? (
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Data Decoded Yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }: any) => {
                        if (active && payload && payload.length) {
                          const target = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                              <p className="uppercase tracking-wide text-slate-400">{target.name}</p>
                              <p className="text-sm font-black mt-1 text-sky-400">
                                {Number(target.value).toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">{target.name}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="48%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      animationDuration={800}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          name={entry.name}
                          className="outline-none focus:outline-none" 
                        />
                      ))}
                    </Pie>
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      height={32} 
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => <span className="text-xs font-bold text-slate-600 tracking-wide px-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* QUICK EXTRA BREAKDOWN */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-center mt-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Settled Disputes</span>
                <p className="font-mono text-xl font-bold text-emerald-600 mt-0.5">{blotter.settledCases}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Court Escalations</span>
                <p className="font-mono text-xl font-bold text-amber-600 mt-0.5">{blotter.referredCases}</p>
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY LOGS PANEL */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-slate-800" />
              <div>
                <h3 className="text-sm font-black tracking-wider uppercase text-slate-900">System Audit Trail</h3>
                <p className="text-[11px] font-semibold text-gray-400">Latest structural operations logged</p>
              </div>
            </div>

            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto max-h-[280px] pr-1">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : logs.length > 0 ? (
                logs.map((log, idx) => (
                  <motion.div 
                    key={log.id || idx}
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-bold text-gray-800 tracking-tight">{log.action}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-semibold text-gray-400">
                      <span className="truncate max-w-[120px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{log.target}</span>
                      <span className="font-mono">{log.time}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No internal activity logs tracked</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </motion.div>
    </DashboardLayout>
  );
}