"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
  activeMenu: string;
}

export default function DashboardLayout({ children, activeMenu }: LayoutProps) {
  const router = useRouter();
  
  // 👥 Dynamic User State Management
  const [userName, setUserName] = useState("Admin");
  const [userInitials, setUserInitials] = useState("AD");

  useEffect(() => {
    // Kumuha ng user profile data mula sa localStorage pagkasalang ng client side
    const storedUser = localStorage.getItem("brgy_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // I-adjust mo ito base sa properties ng object mo (e.g., parsedUser.fullName o parsedUser.username)
        const name = parsedUser.fullName || parsedUser.name || parsedUser.username || "Admin";
        setUserName(name);

        // Diskarte para sa dynamic avatar initials (Kukuha ng unang letra ng unang dalawang salita)
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        setUserInitials(initials || "AD");
      } catch (err) {
        console.error("Error parsing user session data from localStorage:", err);
      }
    }
  }, []);

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 3a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2zm10 -4a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2zm0 -8a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2v-2a2 2 0 0 1 2 -2z" />
        </svg>
      ), 
      path: "/dashboard" 
    },
    { 
      name: "Resident Information", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783zm-5.005 11c3.028 0 5.764 1.163 7.747 3.03l.258 .254c1.31 1.378 .112 3.716 -1.82 3.716h-12.36c-1.922 0 -3.123 -2.316 -1.848 -3.7a10.26 10.26 0 0 1 7.75 -3.3l.273 .004z" />
        </svg>
      ), 
      path: "/residents" 
    },
    { 
      name: "Barangay Officials", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M11 2a4 4 0 1 1 -4 4l.005 -.2a4 4 0 0 1 3.995 -3.8zm3.2 11c2.1 0 3.8 1.7 3.8 3.8v1.2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1.2c0 -2.1 1.7 -3.8 3.8 -3.8h4.4z" />
        </svg>
      ), 
      path: "/officials" 
    },
    { 
      name: "4ps Members", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2l2.4 4.9l5.4 .8l-3.9 3.8l.9 5.4l-4.8 -2.5l-4.8 2.5l.9 -5.4l-3.9 -3.8l5.4 -.8z" />
        </svg>
      ), 
      path: "/four-ps" 
    },
    { 
      name: "Certificate Issuance", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M19 2a3 3 0 0 1 3 3v14a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-14a3 3 0 0 1 3 -3zm-5 5h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0 -2zm2 4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2zm0 4h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2z" />
        </svg>
      ), 
      path: "/certificates" 
    },
    { 
      name: "Blotter Records", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M19 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zm-7 5h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0 -2z" />
        </svg>
      ), 
      path: "/blotter" 
    },
    { 
      name: "Accounts", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2a5 5 0 1 1 0 10a5 5 0 0 1 0 -10zm5 12a4 4 0 0 1 4 4v1a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-1a4 4 0 0 1 4 -4z" />
        </svg>
      ), 
      path: "/accounts" 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("brgy_user");
    router.push("/");
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans text-gray-800 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="flex h-full w-64 flex-col bg-[#1e293b] text-slate-300 shadow-xl z-20">
        {/* Sidebar Header */}
        <div className="flex flex-col items-center border-b border-slate-700 p-6 text-center">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-yellow-400 bg-white p-1 shadow-md mb-2">
            <img src="/dom-east.png" alt="Brgy Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Barangay Domalandan East Management System
          </h2>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#334155] text-white shadow-inner border-l-4 border-emerald-500"
                    : "hover:bg-[#334155]/50 hover:text-white"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M12 2a1 1 0 0 1 1 1v8a1 1 0 0 1 -2 0v-8a1 1 0 0 1 1 -1zm5.364 2.636a1 1 0 0 1 0 1.414a7 7 0 1 1 -10.728 0a1 1 0 1 1 1.414 -1.414a9 9 0 1 0 7.9 0a1 1 0 0 1 1.414 0z" />
            </svg>
            Sign Out
          </button>
      <div className="text-center pt-1 border-t border-slate-700/40 select-none">
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Developed by: <span className="text-slate-400 font-black">Mark Vargas</span>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between bg-white px-8 shadow-sm border-b border-gray-100 z-10">
          {/* ✨ GENIUS DYNAMIC USER PROFILE BLOCK */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 uppercase">
              {userInitials}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Welcome, <span className="text-gray-900 font-bold">{userName}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-6 w-8 rounded bg-slate-100 text-xs font-bold text-gray-500 hover:bg-slate-200 transition-colors">-</button>
            <button className="h-6 w-8 rounded bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors">✕</button>
          </div>
        </header>

        {/* CONTENT SPACE */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}