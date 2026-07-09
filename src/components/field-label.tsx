import { Info } from "lucide-react";

type FieldLabelProps = {
  label: string;
  required?: boolean;
  info?: string;
  className?: string;
};

export function FieldLabel({ label, required = false, info, className = "" }: FieldLabelProps) {
  return (
    <span className={`ld-label-row ${className}`}>
      <span className="ld-label-inline">
        <span className="ld-label">{label}</span>
        {info ? (
          <span className="ld-info-tip">
            <button type="button" className="ld-info-trigger" aria-label={`${label} help`}>
              <Info className="size-3.5" />
            </button>
            <span className="ld-info-bubble" role="tooltip">
              {info}
            </span>
          </span>
        ) : null}
      </span>
      <span className={required ? "ld-field-state ld-field-state-required" : "ld-field-state ld-field-state-optional"}>
        {required ? "Required" : "Optional"}
      </span>
    </span>
  );
}
