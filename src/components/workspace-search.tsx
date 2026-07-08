"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

const searchableRoutes = new Set(["/products", "/library"]);
const routeLabels: Record<string, string> = {
  "/products": "Products",
  "/library": "Assets",
};

export function WorkspaceSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("q") ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  const targetPath = searchableRoutes.has(pathname) ? pathname : "/products";
  const targetLabel = routeLabels[targetPath] ?? "Products";
  const placeholder =
    targetPath === "/library"
      ? "Search assets, files, and product names"
      : "Search products, routes, and teams";

  function runSearch() {
    const params = new URLSearchParams();
    const normalized = inputRef.current?.value.trim() ?? "";

    if (normalized) {
      params.set("q", normalized);
    }

    router.push(params.size ? `${targetPath}?${params.toString()}` : targetPath);
  }

  function clearSearch() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    router.push(targetPath);
  }

  return (
    <div className="ld-glass-input ld-search-shell rounded-full px-4 py-2 lg:min-w-[420px]">
      <span className="ld-search-leading">
        <Search className="size-4 shrink-0 text-[var(--ld-color-primary-strong)]" />
        <span className="ld-search-scope hidden sm:inline-flex">{targetLabel}</span>
      </span>
      <input
        key={`${pathname}:${searchValue}`}
        ref={inputRef}
        defaultValue={searchValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
          }
        }}
        placeholder={placeholder}
        aria-label="Search products or assets"
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ld-color-text)] outline-none placeholder:text-[var(--ld-color-muted)]"
      />
      <button
        type="button"
        onClick={runSearch}
        className="ld-search-action inline-flex h-10 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/6 px-3 text-xs font-semibold text-[var(--ld-color-text)] transition hover:border-white/18 hover:bg-white/10"
        aria-label="Run search"
      >
        <span className="hidden sm:inline">Search</span>
        <ArrowUpRight className="size-4" />
      </button>
      {searchValue ? (
        <button
          type="button"
          onClick={clearSearch}
          className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[var(--ld-color-muted)] transition hover:border-white/18 hover:text-white"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
