"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { FieldLabel } from "@/components/field-label";

type FeeItem = {
  label: string;
  amount: string;
};

function buildFeeItem(item?: { label?: string; amountInCents?: number | null }) {
  return {
    label: item?.label ?? "",
    amount:
      typeof item?.amountInCents === "number"
        ? String(item.amountInCents / 100)
        : "",
  } satisfies FeeItem;
}

export function ProductFeesField({
  initialItems,
}: {
  initialItems?: Array<{ label: string; amountInCents: number }>;
}) {
  const [items, setItems] = useState<FeeItem[]>(
    initialItems?.length ? initialItems.map((item) => buildFeeItem(item)) : [buildFeeItem()],
  );

  return (
    <div className="space-y-3">
      <div className="ld-fee-toolbar">
        <div className="min-w-0">
          <FieldLabel
            label="Fee breakdown"
            info="Add separate fee lines only when buyers need to see itemized costs."
          />
        </div>

        <button
          type="button"
          onClick={() => setItems((current) => [...current, buildFeeItem()])}
          className="ld-fee-add-button ld-secondary-button inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold"
        >
          <Plus className="size-4" />
          Add fee
        </button>
      </div>

      <div className="grid gap-3">
        {items.map((item, index) => (
          <div key={index} className="ld-form-split">
            <label className="block space-y-2">
              <FieldLabel label="Fee name" />
              <input
                name="feeLabel"
                value={item.label}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, label: event.target.value } : entry,
                    ),
                  )
                }
                className="ld-input"
                placeholder="Tuition deposit"
              />
            </label>

            <div className="flex items-end gap-2">
              <label className="block flex-1 space-y-2">
                <FieldLabel label="Amount" />
                <input
                  name="feeAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.amount}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, amount: event.target.value } : entry,
                      ),
                    )
                  }
                  className="ld-input"
                  placeholder="250000"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setItems((current) =>
                    current.length > 1 ? current.filter((_, entryIndex) => entryIndex !== index) : [buildFeeItem()],
                  )
                }
                className="ld-secondary-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-0"
                aria-label={`Remove fee ${index + 1}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
