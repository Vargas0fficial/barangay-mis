"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LayoutProps {
  children: ReactNode;
  activeMenu: string;
}

export default function DashboardLayout({ children, activeMenu }: LayoutProps) {
  const router = useRouter();
  
  const [userName, setUserName] = useState("Admin");
  const [userInitials, setUserInitials] = useState("AD");

  useEffect(() => {
    const storedUser = localStorage.getItem("brgy_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const name = parsedUser.fullName || parsedUser.name || parsedUser.username || "Admin";
        setUserName(name);
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
      <aside className="flex h-full w-64 flex-col bg-[#155d27] text-green-100 shadow-xl z-20">
        
        {/* Sidebar Header */}
        <div className="flex flex-col items-center border-b border-green-700 p-6 text-center">
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
                    ? "text-white"
                    : "hover:bg-[#166534]/70 hover:text-white"
                }`}
              >
                <span className={`transition-colors ${isActive ? "text-white" : "text-green-300"}`}>
                  {item.icon}
                </span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-green-700 space-y-3">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-rose-500/15 hover:bg-rose-500/30 transition-all duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-rose-300 group-hover:text-rose-200 transition-colors">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-rose-200 group-hover:text-white transition-colors">Sign Out</span>
          </button>
          <div className="text-center select-none">
            <p className="text-[10px] font-bold tracking-widest text-green-500 uppercase">
              Developed by: <span className="text-green-300 font-black">Mark Vargas</span>
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="flex h-16 items-center justify-between bg-white px-8 shadow-sm border-b border-gray-100 z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 uppercase">
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