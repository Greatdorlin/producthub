"use client";

import { useId } from "react";

import { FieldLabel } from "@/components/field-label";
import { CURRENCY_CODES } from "@/lib/currencies";

type CurrencyFieldProps = {
  name?: string;
  label?: string;
  defaultValue: string;
  info?: string;
};

export function CurrencyField({
  name = "currency",
  label = "Currency",
  defaultValue,
  info = "Enter any three-letter currency code.",
}: CurrencyFieldProps) {
  const listId = useId();

  return (
    <label className="block space-y-2">
      <FieldLabel label={label} required info={info} />
      <input
        name={name}
        className="ld-input uppercase"
        defaultValue={defaultValue}
        list={listId}
        required
        minLength={3}
        maxLength={3}
        pattern="[A-Za-z]{3}"
        autoComplete="off"
        placeholder="USD"
        onInput={(event) => {
          event.currentTarget.value = event.currentTarget.value.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase();
        }}
      />
      <datalist id={listId}>
        {CURRENCY_CODES.map((currency) => (
          <option key={currency} value={currency} />
        ))}
      </datalist>
    </label>
  );
}
