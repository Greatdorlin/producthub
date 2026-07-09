"use client";

import { useState } from "react";

import { FieldLabel } from "@/components/field-label";
import { assetVisibilityLabels, type ProductVisibility } from "@/lib/constants";

type AssetUploadAccessFieldsProps = {
  products: Array<{
    id: string;
    name: string;
    allowedVisibility: ProductVisibility[];
  }>;
};

export function AssetUploadAccessFields({
  products,
}: AssetUploadAccessFieldsProps) {
  const [productId, setProductId] = useState("");
  const [visibility, setVisibility] = useState<ProductVisibility>("internal");

  const selectedProduct = products.find((product) => product.id === productId);
  const allowedVisibility = selectedProduct?.allowedVisibility ?? [];
  const selectedVisibility =
    selectedProduct && allowedVisibility.includes(visibility)
      ? visibility
      : (allowedVisibility[0] ?? "internal");

  return (
    <>
      <label className="block space-y-2">
        <FieldLabel label="Product" required info="Pick the product this file or link belongs to." />
        <select
          name="productId"
          className="ld-input ld-select"
          required
          value={productId}
          onChange={(event) => {
            const nextProductId = event.target.value;
            const nextProduct = products.find((product) => product.id === nextProductId);
            const nextAllowedVisibility = nextProduct?.allowedVisibility ?? [];

            setProductId(nextProductId);
            setVisibility(
              nextAllowedVisibility.includes(visibility)
                ? visibility
                : (nextAllowedVisibility[0] ?? "internal"),
            );
          }}
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <FieldLabel label="Who can use this asset?" info="Sharing options update automatically based on the product you pick." />
        <select
          name="visibility"
          className="ld-input ld-select"
          value={selectedProduct ? selectedVisibility : ""}
          onChange={(event) => {
            setVisibility(event.target.value as ProductVisibility);
          }}
          disabled={!selectedProduct}
        >
          {!selectedProduct ? (
            <option value="">Choose a product first</option>
          ) : (
            allowedVisibility.map((item) => (
              <option key={item} value={item}>
                {assetVisibilityLabels[item]}
              </option>
            ))
          )}
        </select>
      </label>
    </>
  );
}
