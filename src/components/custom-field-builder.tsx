"use client";

import { ArrowDown, ArrowUp, CheckSquare2, ListChecks, Plus, Trash2, Type } from "lucide-react";
import { useRef, useState } from "react";

import { FieldLabel } from "@/components/field-label";
import {
  PRODUCT_CUSTOM_FIELD_TYPES,
  type ProductCustomFieldDefinition,
  type ProductCustomFieldType,
} from "@/lib/custom-fields";

const fieldTypeLabels: Record<ProductCustomFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  number: "Number",
  checkbox: "Checkbox",
  select: "Dropdown",
  radio: "Radio buttons",
};

function FieldTypeIcon({ type }: { type: ProductCustomFieldType }) {
  if (type === "checkbox") return <CheckSquare2 className="size-4" />;
  if (type === "select" || type === "radio") return <ListChecks className="size-4" />;
  return <Type className="size-4" />;
}

export function CustomFieldBuilder({
  initialDefinitions,
}: {
  initialDefinitions: ProductCustomFieldDefinition[];
}) {
  const [definitions, setDefinitions] = useState(initialDefinitions);
  const sequence = useRef(initialDefinitions.length);

  function updateDefinition(id: string, updates: Partial<ProductCustomFieldDefinition>) {
    setDefinitions((current) =>
      current.map((definition) => (definition.id === id ? { ...definition, ...updates } : definition)),
    );
  }

  function addDefinition() {
    sequence.current += 1;
    setDefinitions((current) => [
      ...current,
      {
        id: `field_${Date.now().toString(36)}_${sequence.current}`,
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  }

  function moveDefinition(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= definitions.length) return;

    setDefinitions((current) => {
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }

  return (
    <div className="ld-custom-field-builder">
      <input type="hidden" name="productFieldDefinitions" value={JSON.stringify(definitions)} />

      <div className="ld-brand-section-heading">
        <div>
          <span className="ld-kicker">Product fields</span>
          <h3 className="ld-panel-title mt-2">Custom details</h3>
        </div>
        <button
          type="button"
          className="ld-secondary-button inline-flex min-h-10 items-center gap-2 px-3 text-sm font-semibold"
          onClick={addDefinition}
          disabled={definitions.length >= 20}
        >
          <Plus className="size-4" />
          Add field
        </button>
      </div>

      {definitions.length ? (
        <div className="mt-5 grid gap-3">
          {definitions.map((definition, index) => {
            const choiceField = definition.type === "select" || definition.type === "radio";
            const choicesValid = !choiceField || definition.options.length >= 2;

            return (
              <div key={definition.id} className="ld-custom-field-card">
                <div className="ld-custom-field-card-header">
                  <span className="ld-custom-field-type-icon">
                    <FieldTypeIcon type={definition.type} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ld-color-text)]">
                    {definition.label || `Untitled field ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="ld-icon-button"
                      onClick={() => moveDefinition(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${definition.label || "field"} up`}
                      title="Move up"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="ld-icon-button"
                      onClick={() => moveDefinition(index, 1)}
                      disabled={index === definitions.length - 1}
                      aria-label={`Move ${definition.label || "field"} down`}
                      title="Move down"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="ld-icon-button is-danger"
                      onClick={() => setDefinitions((current) => current.filter((item) => item.id !== definition.id))}
                      aria-label={`Remove ${definition.label || "field"}`}
                      title="Remove field"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
                  <label className="grid gap-2">
                    <FieldLabel label="Field label" required />
                    <input
                      className="ld-input"
                      value={definition.label}
                      required
                      maxLength={80}
                      placeholder="For example: Contract term"
                      onChange={(event) => updateDefinition(definition.id, { label: event.target.value })}
                    />
                  </label>

                  <label className="grid gap-2">
                    <FieldLabel label="Field type" required />
                    <select
                      className="ld-input ld-select"
                      value={definition.type}
                      onChange={(event) =>
                        updateDefinition(definition.id, {
                          type: event.target.value as ProductCustomFieldType,
                        })
                      }
                    >
                      {PRODUCT_CUSTOM_FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {fieldTypeLabels[type]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {choiceField ? (
                  <div className="mt-3">
                    <label className="grid gap-2">
                      <FieldLabel label="Choices" required info="Separate each option with a comma." />
                      <input
                        className={`ld-input ${choicesValid ? "" : "is-invalid"}`}
                        value={definition.options.join(", ")}
                        required
                        aria-invalid={!choicesValid}
                        placeholder="Standard, Premium, Enterprise"
                        onChange={(event) =>
                          updateDefinition(definition.id, {
                            options: event.target.value
                              .split(",")
                              .map((option) => option.trim())
                              .filter(Boolean)
                              .slice(0, 20),
                          })
                        }
                      />
                    </label>
                    {!choicesValid ? <p className="ld-inline-error mt-2">Add at least two choices.</p> : null}
                    {definition.options.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {definition.options.map((option, optionIndex) => (
                          <span key={`${option}-${optionIndex}`} className="ld-option-preview-chip">{option}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <label className="ld-custom-required-toggle mt-4">
                  <input
                    type="checkbox"
                    checked={definition.required}
                    onChange={(event) => updateDefinition(definition.id, { required: event.target.checked })}
                  />
                  <span aria-hidden />
                  Required when creating a product
                </label>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ld-custom-field-empty mt-5">
          <span className="ld-custom-field-type-icon"><Plus className="size-4" /></span>
          <div>
            <div className="text-sm font-semibold text-[var(--ld-color-text)]">No custom fields yet</div>
            <div className="mt-1 text-xs text-[var(--ld-color-muted)]">Add only the details your products need.</div>
          </div>
        </div>
      )}
    </div>
  );
}
