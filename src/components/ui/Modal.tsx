"use client";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string; // e.g. "max-w-lg" (default), "max-w-2xl"
}

/**
 * Shared modal shell used by every CRUD page (Residents, Officials, Blotter, 4Ps, etc).
 * Handles the backdrop, entry/exit animation, and header — pass form contents as children.
 */
export default function Modal({ isOpen, title, onClose, children, maxWidth = "max-w-lg" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className={`w-full ${maxWidth} rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col border border-gray-100 max-h-[90vh]`}
          >
            <div className="flex items-center justify-between bg-[#1e293b] p-5 text-white shrink-0">
              <h3 className="text-sm font-black uppercase tracking-wider">{title}</h3>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
