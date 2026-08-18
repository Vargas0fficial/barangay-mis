"use client";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1";
const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-slate-50 p-2 text-sm font-semibold outline-none focus:bg-white focus:border-emerald-600 transition-all";

interface FieldWrapperProps {
  label: string;
  className?: string;
  children: ReactNode;
}

function FieldWrapper({ label, className = "", children }: FieldWrapperProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
}

/** Standard text/number/date input, styled to match the rest of the system. */
export function TextField({ label, wrapperClassName, className = "", ...rest }: TextFieldProps) {
  return (
    <FieldWrapper label={label} className={wrapperClassName}>
      <input className={`${fieldClass} ${className}`} {...rest} />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  wrapperClassName?: string;
  options: { value: string; label?: string }[];
}

/** Standard dropdown, fed a plain options array instead of hand-written <option> tags. */
export function SelectField({ label, wrapperClassName, className = "", options, ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} className={wrapperClassName}>
      <select className={`${fieldClass} cursor-pointer ${className}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label ?? opt.value}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wrapperClassName?: string;
}

/** Multi-line text field, e.g. for blotter incident narratives. */
export function TextAreaField({ label, wrapperClassName, className = "", ...rest }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} className={wrapperClassName}>
      <textarea className={`${fieldClass} min-h-[90px] resize-y ${className}`} {...rest} />
    </FieldWrapper>
  );
}
