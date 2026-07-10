import type { PRODUCT_PRIORITY, PRODUCT_STATUS } from "@/lib/constants";

type ProductStatus = (typeof PRODUCT_STATUS)[number];
type ProductPriority = (typeof PRODUCT_PRIORITY)[number];

export type ChipTone =
  | "neutral"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "route"
  | "category"
  | "count"
  | "access"
  | "asset"
  | "status-active"
  | "status-sold-out"
  | "status-draft"
  | "status-archived"
  | "priority-low"
  | "priority-normal"
  | "priority-high"
  | "priority-urgent";

export function chipClassName(tone: ChipTone = "neutral", className = "") {
  return ["ld-chip", `ld-chip-${tone}`, className].filter(Boolean).join(" ");
}

export function statusChipTone(status: ProductStatus): ChipTone {
  switch (status) {
    case "active":
      return "status-active";
    case "sold_out":
      return "status-sold-out";
    case "archived":
      return "status-archived";
    case "draft":
    default:
      return "status-draft";
  }
}

export function priorityChipTone(priority: ProductPriority): ChipTone {
  switch (priority) {
    case "low":
      return "priority-low";
    case "high":
      return "priority-high";
    case "urgent":
      return "priority-urgent";
    case "normal":
    default:
      return "priority-normal";
  }
}
