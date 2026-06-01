"use client";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if loading screen has already been shown this session
    const alreadyShown = sessionStorage.getItem("loadingShown");
    if (alreadyShown) {
      setShow(false);
      return;
    }

    // Mark as shown so it won't appear again on page navigation
    sessionStorage.setItem("loadingShown", "true");

    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    const hideTimer = setTimeout(() => setShow(false), 4000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .loading-bar {
          animation: loadingBar 3.5s ease-in-out forwards;
        }
        .loading-fade {
          transition: opacity 0.5s ease;
        }
      `}</style>

      <div
        className="loading-fade fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#155d27]"
        style={{ opacity: fadeOut ? 0 : 1, pointerEvents: fadeOut ? "none" : "auto" }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-yellow-400 bg-white p-1 shadow-xl animate-pulse">
            <img src="/dom-east.png" alt="Brgy Logo" className="h-full w-full object-contain" />
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-white font-black text-lg uppercase tracking-widest">
              Barangay Domalandan East
            </h1>
            <p className="text-green-300 text-xs font-semibold tracking-wider uppercase">
              Management System
            </p>
          </div>

          {/* Loading Bar */}
          <div className="w-56 h-1.5 bg-green-900 rounded-full overflow-hidden">
            <div className="loading-bar h-full bg-yellow-400 rounded-full" />
          </div>

          <p className="text-green-400 text-xs font-semibold tracking-widest uppercase animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    </>
  );
}