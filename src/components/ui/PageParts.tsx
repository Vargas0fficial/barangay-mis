"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

/** Page title + subtitle, used at the top of every module. */
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-gray-950 uppercase">{title}</h1>
      <p className="text-sm font-semibold text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );
}

/** White toolbar card that holds the "Add" button, filters, and search — same shell everywhere. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-64 rounded-lg border border-gray-200 bg-slate-50 p-2 pl-4 pr-10 text-sm font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
      />
      <Search size={16} className="absolute right-3 top-3 text-gray-400" />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-200 bg-slate-50 p-2 text-xs font-bold text-gray-700 outline-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
    >
      <Plus size={16} /> {label}
    </motion.button>
  );
}

/** White rounded card that wraps every data table. */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">{children}</table>
      </div>
    </div>
  );
}

export function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead>
      <tr className="bg-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-200">
        {columns.map((col) => (
          <th key={col} className="p-4">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </td>
    </tr>
  );
}

/** The little edit/delete icon-button pair used in every table's Actions column. */
export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onEdit}
        className="rounded bg-amber-50 p-1.5 text-amber-600 hover:bg-amber-100 shadow-sm transition-colors"
      >
        <Edit2 size={14} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="rounded bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-100 shadow-sm transition-colors"
      >
        <Trash2 size={14} />
      </motion.button>
    </div>
  );
}

/** Shake-in warning banner for duplicate/validation errors inside a modal form. */
export function FormErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ x: -10 }}
      animate={{ x: [0, -10, 10, -10, 10, 0] }}
      transition={{ duration: 0.4 }}
      className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-600"
    >
      ⚠️ {message}
    </motion.div>
  );
}

export function ModalFooter({
  isEditMode,
  onCancel,
  submitLabel = "Commit Record",
  savingLabel = "Save Changes",
}: {
  isEditMode: boolean;
  onCancel: () => void;
  submitLabel?: string;
  savingLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-slate-200 transition-colors"
      >
        Cancel
      </button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
      >
        {isEditMode ? savingLabel : submitLabel}
      </motion.button>
    </div>
  );
}
