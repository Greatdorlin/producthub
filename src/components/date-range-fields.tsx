"use client";

import { CalendarRange } from "lucide-react";
import { useRef } from "react";

type DateRangeFieldsProps = {
  startName: string;
  endName: string;
  startLabel: string;
  endLabel: string;
  startDefaultValue?: string;
  endDefaultValue?: string;
  helperText?: string;
};

export function DateRangeFields({
  startName,
  endName,
  startLabel,
  endLabel,
  startDefaultValue,
  endDefaultValue,
  helperText,
}: DateRangeFieldsProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="ld-label">Sales window</div>
      <div className="ld-date-range-grid">
        <label className="block space-y-2">
          <span className="ld-sublabel">{startLabel}</span>
          <span className="ld-date-shell">
            <CalendarRange className="ld-date-icon size-4" />
            <input
              ref={startRef}
              defaultValue={startDefaultValue}
              name={startName}
              type="date"
              className="ld-input ld-date-input"
              onClick={() => startRef.current?.showPicker?.()}
            />
          </span>
        </label>

        <label className="block space-y-2">
          <span className="ld-sublabel">{endLabel}</span>
          <span className="ld-date-shell">
            <CalendarRange className="ld-date-icon size-4" />
            <input
              ref={endRef}
              defaultValue={endDefaultValue}
              name={endName}
              type="date"
              className="ld-input ld-date-input"
              onClick={() => endRef.current?.showPicker?.()}
            />
          </span>
        </label>
      </div>
      {helperText ? <p className="ld-note">{helperText}</p> : null}
    </div>
  );
}
