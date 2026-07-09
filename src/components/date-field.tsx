"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";

import { FieldLabel } from "@/components/field-label";

type DateFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  helperText?: string;
  required?: boolean;
};

export function DateField({ name, label, defaultValue, helperText, required = false }: DateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label className="block space-y-2">
      <FieldLabel label={label} required={required} info={helperText} />
      <span className="ld-date-shell">
        <CalendarDays className="ld-date-icon size-4" />
        <input
          ref={inputRef}
          defaultValue={defaultValue}
          name={name}
          type="date"
          required={required}
          className="ld-input ld-date-input"
          onClick={() => inputRef.current?.showPicker?.()}
        />
      </span>
    </label>
  );
}
