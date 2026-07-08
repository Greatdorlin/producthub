"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";

type DateFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  helperText?: string;
};

export function DateField({ name, label, defaultValue, helperText }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className="block space-y-2">
      <span className="ld-label">{label}</span>
      <span className="ld-date-shell">
        <CalendarDays className="ld-date-icon size-4" />
        <input
          ref={inputRef}
          defaultValue={defaultValue}
          name={name}
          type="date"
          className="ld-input ld-date-input"
          onClick={() => inputRef.current?.showPicker?.()}
        />
      </span>
      {helperText ? <span className="ld-note">{helperText}</span> : null}
    </label>
  );
}
