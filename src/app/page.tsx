"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Punong Barangay");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("brgy_user");
    if (savedUser) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("brgy_user", JSON.stringify(data.user || { name: username, role }));
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials. Please verify your details.");
      }
    } catch (err) {
      setError("Cannot connect to the server. Please check if your backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white font-sans text-gray-800 selection:bg-green-600 selection:text-white">
      {/* LEFT: Emerald Green Branding Panel - 50% */}
      <div className="relative w-1/2 flex-col items-center justify-center bg-gradient-to-br from-green-700 via-green-600 to-emerald-800 p-8 flex overflow-hidden">
        {/* Watermark Image - Low Opacity sa likod */}
        <img 
          src="/dom-east-1.png" 
          alt="Watermark" 
          className="absolute inset-0 w-full h-full object-cover opacity-[0.35] pointer-events-none"
        />
        
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        {/* 🚀 Swabeng entry animation para sa Logo at Barangay Title */}
        <div className="z-20 flex flex-col items-center text-center animate-fadeInUp relative">
          <div className="mb-6 h-44 w-44 overflow-hidden rounded-full border-4 border-yellow-400 bg-white p-2 shadow-2xl transition-transform hover:scale-105 duration-300">
            <img src="/dom-east.png" alt="Barangay Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-2xl font-black tracking-wider text-white uppercase drop-shadow">
            Barangay Domalandan East
          </h2>
          <p className="text-xs font-semibold tracking-widest text-yellow-300 uppercase mt-1">
            Management Information System
          </p>
        </div>
      </div>

      {/* RIGHT: Clean Admin Login Interface - 50% */}
      <div className="w-1/2 flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-36 flex">
        {/* 📦 Ang buong right box panel ay aangat na rin nang sabay gamit ang v4 configuration natin! */}
        <div className="mx-auto w-full max-w-md animate-fadeInUp">
          <div className="mb-8 flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-green-700 animate-pulse"></div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Admin Access
            </h1>
          </div>

          {/* 🚨 Tiyak na yayanig kapag lumabas ang validation error */}
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-600 animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Your Username / Email
              </label>
              <input
                type="text"
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-2 text-gray-900 font-medium focus:border-green-600 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Admin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Your Password
              </label>
              <input
                type="password"
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b-2 border-gray-200 py-2 text-gray-900 focus:border-green-600 focus:outline-none transition-colors disabled:opacity-50"
                placeholder="Password"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Designation / Role
              </label>
              <select
                disabled={loading}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 cursor-pointer disabled:opacity-50"
              >
                <option>Punong Barangay</option>
                <option>Barangay Secretary</option>
                <option>Barangay Treasurer</option>
                <option>SK Chairman</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer disabled:opacity-50"
                />
                Remember me
              </label>
              <a href="#" className="font-bold text-green-700 hover:underline transition-all duration-150 active:scale-95">
                Resident Portal
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-green-700 py-3 text-center font-bold text-white shadow-md hover:bg-green-800 active:scale-[0.99] disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Verifying Credentials..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <a href="#" className="text-sm font-semibold text-gray-400 hover:text-green-700 hover:underline transition-colors"></a>
          </div>
        </div>
      </div>
    </div>
  );
}