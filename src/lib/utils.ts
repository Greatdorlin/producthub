import { format } from "date-fns";

export function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

const currencyLocaleMap: Record<string, string> = {
  NGN: "en-NG",
  USD: "en-US",
};

export function formatCurrencyFromCents(cents: number | null, currency = "NGN") {
  if (cents === null || Number.isNaN(cents)) {
    return "Unset";
  }

  return new Intl.NumberFormat(currencyLocaleMap[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDateLabel(value: Date | null) {
  if (!value) {
    return "No expiry";
  }

  return format(value, "dd MMM yyyy");
}

export function formatDateRangeLabel(start: Date | null, end: Date | null) {
  if (!start && !end) {
    return "Not set";
  }

  if (start && end) {
    return `${format(start, "dd MMM yyyy")} to ${format(end, "dd MMM yyyy")}`;
  }

  if (start) {
    return `From ${format(start, "dd MMM yyyy")}`;
  }

  return `Until ${format(end as Date, "dd MMM yyyy")}`;
}

export function getExpiryTone(expiresAt: Date | null) {
  if (!expiresAt) {
    return "calm";
  }

  const diff = expiresAt.getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return "danger";
  }

  if (days <= 45) {
    return "warning";
  }

  return "calm";
}

export function getDaysToExpiry(expiresAt: Date | null) {
  if (!expiresAt) {
    return null;
  }

  return Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function formatExpiryCountdown(expiresAt: Date | null) {
  const days = getDaysToExpiry(expiresAt);

  if (days === null) {
    return "No expiry set";
  }

  if (days < 0) {
    const elapsed = Math.abs(days);
    return elapsed === 1 ? "Expired 1 day ago" : `Expired ${elapsed} days ago`;
  }

  if (days === 0) {
    return "Expires today";
  }

  if (days === 1) {
    return "1 day left";
  }

  return `${days} days left`;
}
