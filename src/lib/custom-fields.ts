import { z } from "zod";

export const PRODUCT_CUSTOM_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "checkbox",
  "select",
  "radio",
] as const;

export type ProductCustomFieldType = (typeof PRODUCT_CUSTOM_FIELD_TYPES)[number];

export type ProductCustomFieldDefinition = {
  id: string;
  label: string;
  type: ProductCustomFieldType;
  required: boolean;
  options: string[];
};

export type ProductCustomFieldValue = string | number | boolean;
export type ProductCustomFieldValues = Record<string, ProductCustomFieldValue>;

const productCustomFieldDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_-]{2,40}$/),
  label: z.string().trim().min(1).max(80),
  type: z.enum(PRODUCT_CUSTOM_FIELD_TYPES),
  required: z.boolean(),
  options: z.array(z.string().trim().min(1).max(80)).max(20),
});

const productCustomFieldDefinitionsSchema = z
  .array(productCustomFieldDefinitionSchema)
  .max(20)
  .superRefine((definitions, context) => {
    const ids = new Set<string>();

    definitions.forEach((definition, index) => {
      if (ids.has(definition.id)) {
        context.addIssue({
          code: "custom",
          message: "Field identifiers must be unique.",
          path: [index, "id"],
        });
      }
      ids.add(definition.id);

      const uniqueOptionCount = new Set(definition.options.map((option) => option.trim())).size;
      if (["select", "radio"].includes(definition.type) && uniqueOptionCount < 2) {
        context.addIssue({
          code: "custom",
          message: "Choice fields need at least two options.",
          path: [index, "options"],
        });
      }
    });
  });

function tidyDefinitions(definitions: ProductCustomFieldDefinition[]) {
  return definitions.map((definition) => ({
    ...definition,
    label: definition.label.trim(),
    options: Array.from(new Set(definition.options.map((option) => option.trim()).filter(Boolean))),
  }));
}

export function parseProductFieldDefinitionsInput(value: FormDataEntryValue | null) {
  try {
    const parsedJson = JSON.parse(String(value ?? "[]"));
    const result = productCustomFieldDefinitionsSchema.safeParse(parsedJson);
    return result.success ? tidyDefinitions(result.data) : null;
  } catch {
    return null;
  }
}

export function normalizeProductFieldDefinitions(value: unknown): ProductCustomFieldDefinition[] {
  const result = productCustomFieldDefinitionsSchema.safeParse(value);
  return result.success ? tidyDefinitions(result.data) : [];
}

export function productCustomFieldName(id: string) {
  return `customField__${id}`;
}

export function readProductCustomFieldValues(
  formData: FormData,
  definitions: ProductCustomFieldDefinition[],
) {
  const values: ProductCustomFieldValues = {};
  let isValid = true;

  for (const definition of definitions) {
    const rawValue = formData.get(productCustomFieldName(definition.id));

    if (definition.type === "checkbox") {
      const checked = rawValue === "true" || rawValue === "on";
      values[definition.id] = checked;
      if (definition.required && !checked) isValid = false;
      continue;
    }

    const value = String(rawValue ?? "").trim();
    if (!value) {
      if (definition.required) isValid = false;
      continue;
    }

    if (definition.type === "number") {
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        isValid = false;
      } else {
        values[definition.id] = numericValue;
      }
      continue;
    }

    if (["select", "radio"].includes(definition.type) && !definition.options.includes(value)) {
      isValid = false;
      continue;
    }

    values[definition.id] = value;
  }

  return { values, isValid };
}
