import Link from "next/link";
import { redirect } from "next/navigation";
import { Archive, ExternalLink, Film, ImageIcon, Link2, Presentation, Trash2, Upload } from "lucide-react";

import {
  deleteAssetAction,
  deleteProductAction,
  updateProductAction,
  updateProductLifecycleAction,
} from "@/app/actions";
import { chipClassName, priorityChipTone, statusChipTone } from "@/components/chip";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { DateField } from "@/components/date-field";
import { DateRangeFields } from "@/components/date-range-fields";
import { ProductFeesField } from "@/components/product-fees-field";
import { ProductSuccessBanner } from "@/components/product-success-banner";
import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { ValidatedForm } from "@/components/validated-form";
import { requirePermission } from "@/lib/auth/server";
import { getDefaultCurrency, getFieldLabel, getIndustryPreset, getRoleLabel } from "@/lib/config/industries";
import {
  assetVisibilityLabels,
  ASSET_KIND,
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
  currencyLabels,
  PRODUCT_ACCESS_ROLES,
  PRODUCT_PRIORITY,
  type ProductAccessRole,
  priorityLabels,
  PRODUCT_STATUS,
  ROUTE_OPTIONS,
  statusLabels,
} from "@/lib/constants";
import { getProductDetail, getWorkspaceSettings } from "@/lib/data";
import { getAllowedAssetVisibility } from "@/lib/product-access";
import { formatCurrencyFromCents, formatDateLabel, formatDateRangeLabel, formatExpiryCountdown, getDaysToExpiry, getExpiryTone } from "@/lib/utils";

const accessDescriptions: Record<(typeof PRODUCT_ACCESS_ROLES)[number], string> = {
  admissions_manager: "Admissions can open and work this product.",
  marketing_manager: "Marketing can upload and manage product assets.",
  partnership_manager: "Partnerships can manage this offer.",
  sales_manager: "Sales can price and update this product.",
  viewer: "View-only users can open this product.",
  affiliate: "Affiliates can access approved promo material.",
};

type ProductDetailPageProps = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ error?: string; created?: string; saved?: string; asset?: string }>;
};

function AssetIcon({ kind }: { kind: (typeof ASSET_KIND)[number] }) {
  switch (kind) {
    case "video":
    case "motion":
      return <Film className="size-4" />;
    case "deck":
      return <Presentation className="size-4" />;
    case "document":
      return <Link2 className="size-4" />;
    default:
      return <ImageIcon className="size-4" />;
  }
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const viewer = await requirePermission("products:view");
  const { productId } = await params;
  const [details, workspaceSettings] = await Promise.all([
    getProductDetail(productId, viewer),
    getWorkspaceSettings(),
  ]);
  const pageState = await searchParams;

  if (!details) {
    redirect("/products?error=not-found");
  }

  const { product, assets } = details;
  const canEdit = viewer.permissions.includes("products:edit");
  const canManageAssets = viewer.permissions.includes("assets:manage");
  const canManageLifecycle = viewer.permissions.includes("products:publish");
  const canDeleteProducts = viewer.permissions.includes("products:delete");
  const allowedAssetVisibility = getAllowedAssetVisibility(product.assetAccessRoles as ProductAccessRole[]);
  const industryPreset = getIndustryPreset(workspaceSettings.industryTemplate);
  const categoryOptions = Array.from(new Set([
    product.category,
    ...(industryPreset.productDefaults.categories.length ? industryPreset.productDefaults.categories : [...CATEGORY_OPTIONS]),
  ]));
  const routeOptions = Array.from(new Set([
    product.route,
    ...(industryPreset.productDefaults.routes.length ? industryPreset.productDefaults.routes : [...ROUTE_OPTIONS]),
  ]));
  const defaultCurrency = getDefaultCurrency(workspaceSettings.industryTemplate);
  const currencyOptions = Array.from(new Set([product.currency, defaultCurrency, ...CURRENCY_OPTIONS]));
  const expiryDays = getDaysToExpiry(product.expiresAt);
  const editError =
    pageState.error === "invalid-sales-period"
      ? "Sales start must be before sales end."
      : pageState.error === "price-permission"
        ? "You do not have permission to change pricing."
        : pageState.error
          ? "Check the required fields or your pricing permission."
          : null;
  const assetError =
    pageState.error === "asset-invalid" || pageState.error === "asset-label"
      ? "Check the asset details before saving."
      : pageState.error === "asset-not-found"
        ? "That asset has already been removed."
      : pageState.error === "not-allowed"
        ? "You do not have permission to upload or manage assets."
      : pageState.error === "asset-visibility"
      ? "That sharing level is wider than this product allows."
      : pageState.error === "asset-url"
        ? "Add a real file or a real asset link before saving."
        : pageState.error === "blob-token"
          ? "Asset storage is not configured."
          : pageState.error === "upload-failed"
            ? "The file could not be uploaded. Try again or use an external asset link."
            : pageState.error === "request-failed"
              ? "The upload could not be completed. Check your connection and try again."
          : null;
  const lifecycleChoices = [
    product.status !== "active" ? { label: "Move live", value: "active" } : null,
    product.status !== "draft" ? { label: "Move to draft", value: "draft" } : null,
    product.status !== "archived" ? { label: "Archive", value: "archived" } : null,
  ].filter((item): item is { label: string; value: (typeof PRODUCT_STATUS)[number] } => Boolean(item));

  return (
    <div className="ld-page">
      {pageState.created ? <ProductSuccessBanner mode="created" /> : null}
      {!pageState.created && pageState.saved ? <ProductSuccessBanner mode="saved" /> : null}
      {!pageState.created && !pageState.saved && pageState.asset ? <ProductSuccessBanner mode="asset" /> : null}

      <section className="ld-glass-vibrant ld-hero">
        <div className="ld-hero-grid">
          <div>
            <div className="ld-page-meta">
              <span className={chipClassName("route")}>{product.route}</span>
              <span className={chipClassName(statusChipTone(product.status))}>{statusLabels[product.status]}</span>
              <span className={chipClassName(priorityChipTone(product.priority))}>{priorityLabels[product.priority]}</span>
              <span className={chipClassName("category")}>{product.category}</span>
            </div>
            <h2 className="ld-title mt-4">{product.name}</h2>
            <p className="ld-subtitle mt-3">{product.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {product.accessRoles.map((role) => (
                <span key={role} className={chipClassName("access", "text-xs normal-case")}>
                  {getRoleLabel(role, workspaceSettings.industryTemplate)}
                </span>
              ))}
            </div>

            {canManageLifecycle ? (
              <div className="ld-detail-actions mt-5">
                {lifecycleChoices.map((choice) => (
                  <form key={choice.value} action={updateProductLifecycleAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="status" value={choice.value} />
                    <button
                      type="submit"
                      className="ld-secondary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      <Archive className="size-4" />
                      {choice.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}

            {(canManageLifecycle || canDeleteProducts) && expiryDays !== null && expiryDays < 0 ? (
              <div className="ld-expired-banner mt-5">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">This product has expired.</div>
                  <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                    Archive it to remove it from active use, or delete it if it should leave the hub completely.
                  </div>
                </div>

                <div className="ld-expired-actions">
                  {product.status !== "archived" ? (
                    <form action={updateProductLifecycleAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <input type="hidden" name="status" value="archived" />
                      <button
                        type="submit"
                        className="ld-secondary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                      >
                        <Archive className="size-4" />
                        Archive now
                      </button>
                    </form>
                  ) : null}

                  {canDeleteProducts ? (
                    <form action={deleteProductAction}>
                      <input type="hidden" name="productId" value={product.id} />
                      <ConfirmSubmitButton
                        className="ld-danger-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                        confirmMessage={`Delete ${product.name}? This will also remove its attached assets.`}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

            <div className="ld-mini-stat-grid">
            <div className="ld-hero-card">
              <div className="ld-stat-label">Priority</div>
              <div className="mt-3 text-lg font-semibold text-white">
                {priorityLabels[product.priority]}
              </div>
            </div>
            <div className="ld-hero-card">
              <div className="ld-stat-label">Price</div>
              <div className="mt-3 text-lg font-semibold text-white">
                {formatCurrencyFromCents(product.priceInCents, product.currency)}
              </div>
            </div>
            <div className="ld-hero-card">
              <div className="ld-stat-label">Owning team</div>
              <div className="mt-3 text-lg font-semibold text-white">{product.ownerTeam}</div>
            </div>
            <div className="ld-hero-card">
              <div className="ld-stat-label">{getFieldLabel("audience", workspaceSettings.industryTemplate)}</div>
              <div className="mt-3 text-base font-semibold text-white">{product.audience}</div>
            </div>
              <div className="ld-hero-card">
                <div className="ld-stat-label">Expiry</div>
                <div
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  getExpiryTone(product.expiresAt) === "danger"
                    ? "tone-danger"
                    : getExpiryTone(product.expiresAt) === "warning"
                      ? "tone-warning"
                      : "tone-calm"
                }`}
                >
                  {formatDateLabel(product.expiresAt)}
                </div>
                <div className="mt-2 text-sm text-[var(--ld-color-muted)]">
                  {formatExpiryCountdown(product.expiresAt)}
                </div>
              </div>
            </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="grid gap-5">
          <div className="ld-solid-panel ld-panel">
            <div className="ld-kicker">{getFieldLabel("pitch", workspaceSettings.industryTemplate)}</div>
            <h3 className="ld-panel-title mt-2">How this product should be sold</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--ld-color-text)]">{product.pitch}</p>
          </div>

          <div className="ld-glass-card ld-panel">
            <div className="ld-panel-header">
              <div>
                <div className="ld-kicker">Sales planning</div>
                <h3 className="ld-panel-title mt-2">Capacity and demand</h3>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="ld-meta-pill">
                <div className="ld-meta-title">Fee lines</div>
                <div className="ld-meta-value">{product.feeItems.length ? `${product.feeItems.length} added` : "Not set"}</div>
              </div>
              <div className="ld-meta-pill">
                <div className="ld-meta-title">{getFieldLabel("slotsAvailable", workspaceSettings.industryTemplate)}</div>
                <div className="ld-meta-value">{product.slotsAvailable ?? "Not set"}</div>
              </div>
              <div className="ld-meta-pill">
                <div className="ld-meta-title">{getFieldLabel("expectedSales", workspaceSettings.industryTemplate)}</div>
                <div className="ld-meta-value">{product.expectedSales ?? "Not set"}</div>
              </div>
              <div className="ld-meta-pill">
                <div className="ld-meta-title">Sales window</div>
                <div className="ld-meta-value">{formatDateRangeLabel(product.salesStartsAt, product.salesEndsAt)}</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="ld-kicker">Fee breakdown</div>
              {product.feeItems.length ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {product.feeItems.map((fee) => (
                    <div key={`${fee.label}-${fee.amountInCents}`} className="ld-meta-pill">
                      <div className="ld-meta-title">{fee.label}</div>
                      <div className="ld-meta-value">{formatCurrencyFromCents(fee.amountInCents, product.currency)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--ld-color-muted)]">No fee breakdown added yet.</p>
              )}
            </div>

            <div className="mt-5">
              <div className="ld-kicker">Notes</div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--ld-color-text)]">
                {product.notes || "No notes added yet."}
              </p>
            </div>
          </div>
        </div>

        {canEdit ? (
          <div className="ld-solid-panel ld-panel">
            <div className="ld-kicker">Edit product</div>
            <h3 className="ld-panel-title mt-2">Update details</h3>
            <p className="ld-panel-copy mt-2">
              Keep the summary, pricing, access, and sales plan current in one place.
            </p>

            {editError ? (
              <div className="mt-4 rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
                {editError}
              </div>
            ) : null}

            <ValidatedForm action={updateProductAction} className="ld-form-grid mt-5" requiredGroups={["accessRoles", "assetAccessRoles"]}>
              <input type="hidden" name="productId" value={product.id} />

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <label className="block space-y-2 ld-required-field">
                    <span className="ld-label-row">
                      <span className="ld-label">Product name</span>
                      <span className="ld-required-text">Required</span>
                    </span>
                    <input defaultValue={product.name} required name="name" className="ld-input" />
                    <span className="ld-required-note">Required</span>
                  </label>

                  <div className="ld-form-split">
                    <label className="block space-y-2">
                      <span className="ld-label">Category</span>
                      <select name="category" defaultValue={product.category} className="ld-input ld-select">
                        {categoryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="ld-label">{getFieldLabel("route", workspaceSettings.industryTemplate)}</span>
                      <select name="route" defaultValue={product.route} className="ld-input ld-select">
                        {routeOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-2 ld-required-field">
                    <span className="ld-label-row">
                      <span className="ld-label">Short summary</span>
                      <span className="ld-required-text">Required</span>
                    </span>
                    <textarea defaultValue={product.summary} required name="summary" rows={3} className="ld-input ld-textarea" />
                    <span className="ld-required-note">Required</span>
                  </label>

                  <label className="block space-y-2 ld-required-field">
                    <span className="ld-label-row">
                      <span className="ld-label">{getFieldLabel("pitch", workspaceSettings.industryTemplate)}</span>
                      <span className="ld-required-text">Required</span>
                    </span>
                    <textarea defaultValue={product.pitch} required name="pitch" rows={3} className="ld-input ld-textarea" />
                    <span className="ld-required-note">Required</span>
                  </label>
                </div>
              </div>

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <div className="ld-form-split">
                    <label className="block space-y-2 ld-required-field">
                      <span className="ld-label-row">
                        <span className="ld-label">{getFieldLabel("audience", workspaceSettings.industryTemplate)}</span>
                        <span className="ld-required-text">Required</span>
                      </span>
                      <input defaultValue={product.audience} required name="audience" className="ld-input" placeholder="For example: families, students, or corporate travellers" />
                      <span className="ld-required-note">Required</span>
                    </label>
                    <label className="block space-y-2 ld-required-field">
                      <span className="ld-label-row">
                        <span className="ld-label">Owning team</span>
                        <span className="ld-required-text">Required</span>
                      </span>
                      <input defaultValue={product.ownerTeam} required name="ownerTeam" className="ld-input" />
                      <span className="ld-required-note">Required</span>
                    </label>
                  </div>

                  <div className="space-y-2" data-required-group="accessRoles">
                    <div className="ld-label-row">
                      <span className="ld-label">Who should have access to this product?</span>
                      <span className="ld-required-text">Choose at least one</span>
                    </div>
                    <div className="ld-check-grid">
                      {PRODUCT_ACCESS_ROLES.map((role) => (
                        <label key={role} className="ld-check-tile">
                          <input
                            type="checkbox"
                            name="accessRoles"
                            value={role}
                            defaultChecked={product.accessRoles.includes(role)}
                          />
                          <span className="ld-check-tile-card">
                            <span className="ld-check-tile-title">{getRoleLabel(role, workspaceSettings.industryTemplate)}</span>
                            <span className="ld-check-tile-copy">{accessDescriptions[role]}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="ld-note">Choose 1, 2, or all groups that should be able to open this product.</p>
                    <p className="ld-group-required-note">Select at least one access group.</p>
                  </div>

                  <div className="ld-form-split">
                    <label className="block space-y-2">
                      <span className="ld-label">Status</span>
                      <select name="status" defaultValue={product.status} className="ld-input ld-select">
                        {PRODUCT_STATUS.map((item) => (
                          <option key={item} value={item}>
                            {statusLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="ld-label">Priority</span>
                      <select name="priority" defaultValue={product.priority} className="ld-input ld-select">
                        {PRODUCT_PRIORITY.map((item) => (
                          <option key={item} value={item}>
                            {priorityLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-2" data-required-group="assetAccessRoles">
                    <div className="ld-label-row">
                      <span className="ld-label">Who can see assets for this product?</span>
                      <span className="ld-required-text">Choose at least one</span>
                    </div>
                    <div className="ld-check-grid">
                      {PRODUCT_ACCESS_ROLES.map((role) => (
                        <label key={role} className="ld-check-tile">
                          <input
                            type="checkbox"
                            name="assetAccessRoles"
                            value={role}
                            defaultChecked={product.assetAccessRoles.includes(role)}
                          />
                          <span className="ld-check-tile-card">
                            <span className="ld-check-tile-title">{getRoleLabel(role, workspaceSettings.industryTemplate)}</span>
                            <span className="ld-check-tile-copy">
                              {role === "affiliate"
                                ? "Lets affiliates use approved promo material."
                                : role === "viewer"
                                  ? "Lets view-only users open shared files."
                                  : `Lets ${getRoleLabel(role, workspaceSettings.industryTemplate).toLowerCase()} open and use approved assets.`}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="ld-note">Choose 1, 2, or all groups that should be able to open product assets in the library.</p>
                    <p className="ld-group-required-note">Select at least one asset access group.</p>
                  </div>
                </div>
              </div>

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <div className="space-y-2">
                    <span className="ld-label">Currency</span>
                    <div className="ld-segmented">
                      {currencyOptions.map((currency) => (
                        <label key={currency} className="ld-segmented-option">
                          <input type="radio" name="currency" value={currency} defaultChecked={product.currency === currency} />
                          <span>{currencyLabels[currency as keyof typeof currencyLabels] ?? currency}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ld-mini-stat-grid">
                    <label className="block space-y-2">
                      <span className="ld-label">Headline price</span>
                      <input
                        defaultValue={product.priceInCents ? String(product.priceInCents / 100) : ""}
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="ld-input"
                      />
                    </label>
                    <DateField
                      name="expiresAt"
                      label="Expiry date"
                      defaultValue={product.expiresAt ? new Date(product.expiresAt).toISOString().slice(0, 10) : ""}
                      helperText="Choose the day this offer should stop showing as current."
                    />
                    <label className="block space-y-2">
                      <span className="ld-label">{getFieldLabel("slotsAvailable", workspaceSettings.industryTemplate)}</span>
                      <input
                        defaultValue={product.slotsAvailable ?? ""}
                        name="slotsAvailable"
                        type="number"
                        min="0"
                        step="1"
                        className="ld-input"
                        placeholder="For example: 30 places or visa slots"
                      />
                      <span className="ld-note">Use this for the number of places you can actually sell.</span>
                    </label>
                    <label className="block space-y-2">
                      <span className="ld-label">{getFieldLabel("expectedSales", workspaceSettings.industryTemplate)}</span>
                      <input
                        defaultValue={product.expectedSales ?? ""}
                        name="expectedSales"
                        type="number"
                        min="0"
                        step="1"
                        className="ld-input"
                        placeholder="For example: 18 expected sales"
                      />
                      <span className="ld-note">Add the number you expect to sell during the sales window below.</span>
                    </label>
                  </div>

                  <DateRangeFields
                    startName="salesStartsAt"
                    endName="salesEndsAt"
                    startLabel="Sales start"
                    endLabel="Sales end"
                    startDefaultValue={product.salesStartsAt ? new Date(product.salesStartsAt).toISOString().slice(0, 10) : ""}
                    endDefaultValue={product.salesEndsAt ? new Date(product.salesEndsAt).toISOString().slice(0, 10) : ""}
                    helperText="Set the period you want the expected sales number to cover."
                  />

                  <ProductFeesField initialItems={product.feeItems} />

                  <label className="block space-y-2">
                    <span className="ld-label">Notes</span>
                    <textarea defaultValue={product.notes} name="notes" rows={4} className="ld-input ld-textarea" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
              >
                Save product changes
              </button>
            </ValidatedForm>

            {canDeleteProducts ? (
              <div className="ld-danger-zone mt-5">
                <div>
                  <div className="text-sm font-semibold text-white">Delete this product</div>
                  <p className="mt-1 text-sm text-[var(--ld-color-muted)]">
                    This removes the product and every asset attached to it.
                  </p>
                </div>

                <form action={deleteProductAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <ConfirmSubmitButton
                    className="ld-danger-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                    confirmMessage={`Delete ${product.name}? This will also remove its attached assets.`}
                  >
                    <Trash2 className="size-4" />
                    Delete product
                  </ConfirmSubmitButton>
                </form>
              </div>
            ) : null}
          </div>
        ) : null}

        {!canEdit && (canManageLifecycle || canDeleteProducts) ? (
          <div className="ld-solid-panel ld-panel">
            <div className="ld-kicker">Product control</div>
            <h3 className="ld-panel-title mt-2">Archive or remove</h3>
            <p className="ld-panel-copy mt-2">
              Use these controls when the product should leave the live catalogue or be removed fully.
            </p>

            {canManageLifecycle ? (
              <div className="ld-detail-actions mt-5">
                {lifecycleChoices.map((choice) => (
                  <form key={choice.value} action={updateProductLifecycleAction}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="status" value={choice.value} />
                    <button
                      type="submit"
                      className="ld-secondary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                    >
                      <Archive className="size-4" />
                      {choice.label}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}

            {canDeleteProducts ? (
            <div className="ld-danger-zone mt-5">
              <div>
                <div className="text-sm font-semibold text-white">Delete this product</div>
                <p className="mt-1 text-sm text-[var(--ld-color-muted)]">
                  This removes the product and every asset attached to it.
                </p>
              </div>

              <form action={deleteProductAction}>
                <input type="hidden" name="productId" value={product.id} />
                <ConfirmSubmitButton
                  className="ld-danger-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
                  confirmMessage={`Delete ${product.name}? This will also remove its attached assets.`}
                >
                  <Trash2 className="size-4" />
                  Delete product
                </ConfirmSubmitButton>
              </form>
            </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="ld-glass-card ld-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Promotion kit</div>
              <h3 className="ld-panel-title mt-2">Attached assets</h3>
            </div>
            <Link href="/library" className="ld-secondary-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              Open library
              <ExternalLink className="size-4" />
            </Link>
          </div>

          <div className="ld-card-list mt-5">
            {assets.length ? (
              assets.map((asset) => (
                <div key={asset.id} className="ld-item-card">
                  <div className="ld-item-card-row">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-[14px] border border-white/10 bg-black/16 p-3 text-[var(--ld-color-primary-strong)]">
                        <AssetIcon kind={asset.kind} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white">{asset.label}</div>
                        <div className="mt-1 text-sm text-[var(--ld-color-muted)]">
                          {asset.kind} · {assetVisibilityLabels[asset.visibility]} · uploaded by {asset.createdBy ?? "Unknown"}
                        </div>
                      </div>
                    </div>

                    <div className="ld-item-card-actions">
                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ld-secondary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                      >
                        Open
                        <ExternalLink className="size-4" />
                      </a>

                      {canManageAssets ? (
                        <form action={deleteAssetAction}>
                          <input type="hidden" name="assetId" value={asset.id} />
                          <input type="hidden" name="returnTo" value={`/products/${product.id}`} />
                          <ConfirmSubmitButton
                            className="ld-danger-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                            confirmMessage={`Delete ${asset.label}?`}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </ConfirmSubmitButton>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ld-empty-state">No assets are attached to this product yet.</div>
            )}
          </div>
        </div>

        {canManageAssets ? (
          <div className="ld-solid-panel ld-panel">
            <div className="ld-page-meta">
              <span className={chipClassName("accent")}>
                <Upload className="size-3.5" />
                Attach asset
              </span>
            </div>
            <h3 className="ld-panel-title mt-3">Add product assets</h3>
            <p className="ld-panel-copy mt-2">
              Upload the real asset file or paste the real link, then choose who should be able to use it.
            </p>

            {assetError ? (
              <div className="mt-4 rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
                {assetError}
              </div>
            ) : null}

            <AsyncRedirectForm
              action={`/api/products/${product.id}/assets`}
              method="post"
              encType="multipart/form-data"
              className="ld-form-grid mt-5"
            >
              <div className="ld-form-section">
                <div className="ld-field-group">
                  <label className="block space-y-2 ld-required-field">
                    <span className="ld-label-row">
                      <span className="ld-label">Asset label</span>
                      <span className="ld-required-text">Required</span>
                    </span>
                    <input required name="label" className="ld-input" />
                    <span className="ld-required-note">Required</span>
                  </label>

                  <div className="ld-form-split">
                    <label className="block space-y-2">
                      <span className="ld-label">Kind</span>
                      <select name="kind" className="ld-input ld-select">
                        {ASSET_KIND.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <span className="ld-label">Who can use this asset?</span>
                      <select name="visibility" className="ld-input ld-select">
                        {allowedAssetVisibility.map((item) => (
                          <option key={item} value={item}>
                            {assetVisibilityLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="ld-label">External asset link</span>
                    <input name="externalUrl" type="url" placeholder="https://real-asset-link..." className="ld-input" />
                  </label>

                  <label className="block space-y-2">
                    <span className="ld-label">Upload file</span>
                    <input name="file" type="file" className="ld-input" />
                  </label>

                  <label className="block space-y-2">
                    <span className="ld-label">Description</span>
                    <textarea name="altText" rows={3} className="ld-input ld-textarea" />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
              >
                Attach asset
              </button>
            </AsyncRedirectForm>
          </div>
        ) : null}
      </section>
    </div>
  );
}
