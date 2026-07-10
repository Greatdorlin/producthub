import { FieldLabel } from "@/components/field-label";
import {
  productCustomFieldName,
  type ProductCustomFieldDefinition,
  type ProductCustomFieldValues,
} from "@/lib/custom-fields";

export function ProductCustomFields({
  definitions,
  values = {},
}: {
  definitions: ProductCustomFieldDefinition[];
  values?: ProductCustomFieldValues;
}) {
  if (!definitions.length) return null;

  return (
    <div className="ld-form-section">
      <div className="ld-field-group">
        <div>
          <div className="ld-kicker">Custom details</div>
          <h4 className="mt-2 text-sm font-semibold text-[var(--ld-color-text)]">Workspace fields</h4>
        </div>

        {definitions.map((definition) => {
          const name = productCustomFieldName(definition.id);
          const value = values[definition.id];

          if (definition.type === "checkbox") {
            return (
              <label key={definition.id} className="ld-check-tile">
                <input
                  type="checkbox"
                  name={name}
                  value="true"
                  required={definition.required}
                  defaultChecked={value === true}
                />
                <span className="ld-check-tile-card">
                  <span className="ld-check-tile-title">{definition.label}</span>
                  <span className="ld-check-tile-copy">{definition.required ? "Required" : "Optional"}</span>
                </span>
              </label>
            );
          }

          if (definition.type === "radio") {
            return (
              <div key={definition.id} className="space-y-2">
                <FieldLabel label={definition.label} required={definition.required} />
                <div className="ld-custom-option-grid">
                  {definition.options.map((option) => (
                    <label key={option} className="ld-segmented-option">
                      <input
                        type="radio"
                        name={name}
                        value={option}
                        required={definition.required}
                        defaultChecked={value === option}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (definition.type === "select") {
            return (
              <label key={definition.id} className="block space-y-2">
                <FieldLabel label={definition.label} required={definition.required} />
                <select name={name} required={definition.required} defaultValue={String(value ?? "")} className="ld-input ld-select">
                  <option value="">Choose an option</option>
                  {definition.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            );
          }

          if (definition.type === "textarea") {
            return (
              <label key={definition.id} className="block space-y-2">
                <FieldLabel label={definition.label} required={definition.required} />
                <textarea name={name} required={definition.required} defaultValue={String(value ?? "")} rows={3} className="ld-input ld-textarea" />
              </label>
            );
          }

          return (
            <label key={definition.id} className="block space-y-2">
              <FieldLabel label={definition.label} required={definition.required} />
              <input
                name={name}
                required={definition.required}
                type={definition.type === "number" ? "number" : "text"}
                step={definition.type === "number" ? "any" : undefined}
                defaultValue={value === undefined ? "" : String(value)}
                className="ld-input"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function ProductCustomFieldSummary({
  definitions,
  values,
}: {
  definitions: ProductCustomFieldDefinition[];
  values: ProductCustomFieldValues;
}) {
  const visibleFields = definitions.filter((definition) => values[definition.id] !== undefined);
  if (!visibleFields.length) return null;

  return (
    <div className="mt-5">
      <div className="ld-kicker">Custom details</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visibleFields.map((definition) => {
          const value = values[definition.id];
          const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);

          return (
            <div key={definition.id} className="ld-meta-pill">
              <div className="ld-meta-title">{definition.label}</div>
              <div className="ld-meta-value whitespace-pre-wrap">{displayValue}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
