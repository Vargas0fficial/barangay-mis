import { ReactNode } from "react";

type BadgeTone = "emerald" | "rose" | "blue" | "amber" | "slate";

const toneClasses: Record<BadgeTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border border-rose-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  slate: "bg-slate-100 text-slate-700 border border-slate-200",
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  pill?: boolean; // fully rounded (status-style) vs slightly rounded (tag-style)
}

/** Small colored label for statuses like Active/Deceased, Yes/No, case status, etc. */
export default function Badge({ children, tone = "slate", pill = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold ${
        pill ? "rounded-full" : "rounded"
      } ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

/** Convenience helper: pick a tone based on a common Active/Inactive-style status string. */
export function statusTone(status: string): BadgeTone {
  const positive = ["active", "yes", "resolved", "paid", "graduated"];
  const negative = ["deceased", "no", "suspended", "moved out", "inactive"];
  const s = (status || "").toLowerCase();
  if (positive.includes(s)) return "emerald";
  if (negative.includes(s)) return "rose";
  return "slate";
}
