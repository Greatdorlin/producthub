import { FieldLabel } from "@/components/field-label";
import { currencyOptions } from "@/lib/currencies";

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
  info = "Used for this product's price and fees.",
}: CurrencyFieldProps) {
  const hasDefaultOption = currencyOptions.some((currency) => currency.code === defaultValue);

  return (
    <label className="block space-y-2">
      <FieldLabel label={label} required info={info} />
      <select
        name={name}
        className="ld-input ld-select"
        defaultValue={defaultValue}
        required
      >
        {!hasDefaultOption ? <option value={defaultValue}>{defaultValue}</option> : null}
        {currencyOptions.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}
          </option>
        ))}
      </select>
    </label>
  );
}
