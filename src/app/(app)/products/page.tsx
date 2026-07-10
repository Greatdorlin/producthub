import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { createProductAction } from "@/app/actions";
import { chipClassName, priorityChipTone, statusChipTone } from "@/components/chip";
import { DateField } from "@/components/date-field";
import { DateRangeFields } from "@/components/date-range-fields";
import { FieldLabel } from "@/components/field-label";
import { ProductFormEffects } from "@/components/product-form-effects";
import { ProductFeesField } from "@/components/product-fees-field";
import { ValidatedForm } from "@/components/validated-form";
import { requirePermission } from "@/lib/auth/server";
import { getDefaultCurrency, getFieldLabel, getIndustryPreset, getRoleLabel } from "@/lib/config/industries";
import {
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
  currencyLabels,
  PRODUCT_ACCESS_ROLES,
  PRODUCT_PRIORITY,
  priorityLabels,
  PRODUCT_STATUS,
  ROUTE_OPTIONS,
  statusLabels,
} from "@/lib/constants";
import { getVisibleProducts, getWorkspaceSettings } from "@/lib/data";
import { formatCurrencyFromCents, formatDateLabel, formatDateRangeLabel, formatExpiryCountdown, getExpiryTone } from "@/lib/utils";

const accessDescriptions: Record<(typeof PRODUCT_ACCESS_ROLES)[number], string> = {
  admissions_manager: "Can open the product and update admissions work.",
  marketing_manager: "Can upload and organise campaign assets.",
  partnership_manager: "Can manage partnership-facing details.",
  sales_manager: "Can update sales and pricing details.",
  viewer: "Can open the product without editing it.",
  affiliate: "Can use approved material for promotion.",
};

type ProductsPageProps = {
  searchParams: Promise<{ error?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const viewer = await requirePermission("products:view");
  const [allProducts, workspaceSettings] = await Promise.all([
    getVisibleProducts(viewer),
    getWorkspaceSettings(),
  ]);
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const canEdit = viewer.permissions.includes("products:edit");
  const industryPreset = getIndustryPreset(workspaceSettings.industryTemplate);
  const categoryOptions = industryPreset.productDefaults.categories.length
    ? industryPreset.productDefaults.categories
    : [...CATEGORY_OPTIONS];
  const routeOptions = industryPreset.productDefaults.routes.length
    ? industryPreset.productDefaults.routes
    : [...ROUTE_OPTIONS];
  const defaultCurrency = getDefaultCurrency(workspaceSettings.industryTemplate);
  const currencyOptions = Array.from(new Set([defaultCurrency, ...CURRENCY_OPTIONS]));
  const liveCount = allProducts.filter((product) => product.status === "active").length;
  const draftCount = allProducts.filter((product) => product.status === "draft").length;
  const affiliateReadyCount = allProducts.filter((product) => product.accessRoles.includes("affiliate")).length;
  const formError =
    params.error === "invalid-sales-period"
      ? "Sales start must be before sales end."
      : params.error === "price-permission"
        ? "You do not have permission to change pricing."
        : params.error === "not-found"
          ? "That product is no longer available."
          : params.error === "invalid-status"
            ? "Choose a valid product status."
        : params.error
          ? "Check the required fields before creating the product."
          : null;
  const products = query
    ? allProducts.filter((product) =>
        [
          product.name,
          product.category,
          product.route,
          product.summary,
          product.ownerTeam,
          product.audience,
          priorityLabels[product.priority as keyof typeof priorityLabels],
          ...product.feeItems.map((fee) => fee.label),
          ...product.accessRoles.map((role) => getRoleLabel(role, workspaceSettings.industryTemplate)),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
    : allProducts;

  return (
    <div className="ld-page">
      <ProductFormEffects focusTargetId="create-product-name" />

      <section className="ld-page-header">
        <div>
          <h2 className="ld-title">Products</h2>
          <p className="ld-subtitle mt-2">Offers, pricing, access, and assets.</p>
          {query ? <p className="ld-note mt-3">Showing results for “{params.q}”.</p> : null}
          {formError ? (
            <div className="mt-4 rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
              {formError}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="ld-stat-card ld-stat-card-premium">
          <div className="ld-stat-label">Visible products</div>
          <div className="ld-stat-value">{products.length}</div>
          <div className="ld-stat-detail">In this view</div>
        </div>
        <div className="ld-stat-card ld-stat-card-premium">
          <div className="ld-stat-label">Live right now</div>
          <div className="ld-stat-value">{liveCount}</div>
          <div className="ld-stat-detail text-[var(--ld-color-success)]">Ready to share</div>
        </div>
        <div className="ld-stat-card ld-stat-card-premium">
          <div className="ld-stat-label">Needs attention</div>
          <div className="ld-stat-value">{draftCount}</div>
          <div className="ld-stat-detail">{affiliateReadyCount} affiliate-ready</div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="ld-glass-card ld-panel">
          <div className="ld-panel-header">
            <div>
              <div className="ld-kicker">Visible products</div>
              <h3 className="ld-panel-title mt-2">Catalogue list</h3>
            </div>
            <div className={chipClassName("count")}>{products.length} records</div>
          </div>

          <div className="ld-card-list mt-5">
            {products.length ? (
              products.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="ld-item-card ld-product-card">
                <div className="ld-product-card-main min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className={chipClassName("route")}>{product.route}</span>
                    <span className={chipClassName(statusChipTone(product.status))}>{statusLabels[product.status]}</span>
                    <span className={chipClassName(priorityChipTone(product.priority))}>{priorityLabels[product.priority]}</span>
                    {product.category.toLowerCase() !== product.route.toLowerCase() ? (
                      <span className={chipClassName("category")}>{product.category}</span>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-[1.55rem] font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 max-w-2xl line-clamp-3 text-sm leading-6 text-[var(--ld-color-muted)]">
                      {product.summary}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.accessRoles.map((role) => (
                      <span key={role} className={chipClassName("access", "text-xs normal-case")}>
                        {getRoleLabel(role, workspaceSettings.industryTemplate)}
                      </span>
                    ))}
                    {product.feeItems.length ? (
                      <span className={chipClassName("count", "text-xs normal-case")}>
                        {product.feeItems.length} fee line{product.feeItems.length > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </div>

                  <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ld-color-primary-strong)]">
                    Open product
                    <ArrowRight className="size-4" />
                  </div>
                </div>

                <div className="ld-product-meta-grid">
                  <div className="ld-meta-pill">
                    <div className="ld-meta-title">Price</div>
                    <div className="ld-meta-value">
                      {formatCurrencyFromCents(product.priceInCents, product.currency)}
                    </div>
                  </div>
                  <div className="ld-meta-pill">
                    <div className="ld-meta-title">Team</div>
                    <div className="ld-meta-value">{product.ownerTeam}</div>
                  </div>
                  <div className="ld-meta-pill">
                    <div className="ld-meta-title">{getFieldLabel("slotsAvailable", workspaceSettings.industryTemplate)}</div>
                    <div className="ld-meta-value">{product.slotsAvailable ?? "Not set"}</div>
                  </div>
                  <div className="ld-meta-pill">
                    <div className="ld-meta-title">{getFieldLabel("expectedSales", workspaceSettings.industryTemplate)}</div>
                    <div className="ld-meta-value">
                      {product.expectedSales
                        ? `${product.expectedSales}${product.salesStartsAt || product.salesEndsAt ? ` · ${formatDateRangeLabel(product.salesStartsAt, product.salesEndsAt)}` : ""}`
                        : "Not set"}
                    </div>
                  </div>
                  <div className="ld-meta-pill lg:col-span-2">
                    <div className="ld-meta-title">Expiry</div>
                    <div
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
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
                </Link>
              ))
            ) : (
              <div className="ld-empty-state">
                {query ? "No products matched this search." : canEdit ? "No products yet. Create your first real product with the form beside this list." : "No products are available yet."}
              </div>
            )}
          </div>
        </div>

        {canEdit ? (
          <aside id="create-product" className="ld-solid-panel ld-panel self-start xl:sticky xl:top-6">
            <div className="ld-panel-header">
              <div>
                <div className="ld-page-meta">
                  <span className={chipClassName("accent")}>
                    <Plus className="size-3.5" />
                    Add product
                  </span>
                </div>
                <h3 className="ld-panel-title mt-3">Create a product</h3>
                <p className="ld-panel-copy mt-2">
                  Start with the essentials. Add promo assets inside the product once the record is ready.
                </p>
              </div>
            </div>

            <ValidatedForm action={createProductAction} className="ld-form-grid mt-5" requiredGroups={["accessRoles", "assetAccessRoles"]}>
              <div className="ld-form-section">
                <div className="ld-field-group">
                  <label className="block space-y-2 ld-required-field">
                    <FieldLabel label="Product name" required info="Use the buyer-facing name people will search for." />
                    <input id="create-product-name" required name="name" className="ld-input" placeholder="Corporate travel retainer" />
                    <span className="ld-required-note">Required</span>
                  </label>

                  <div className="ld-form-split">
                    <label className="block space-y-2">
                      <FieldLabel label="Category" />
                      <select name="category" className="ld-input ld-select">
                        {categoryOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block space-y-2">
                      <FieldLabel label={getFieldLabel("route", workspaceSettings.industryTemplate)} />
                      <select name="route" className="ld-input ld-select">
                        {routeOptions.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block space-y-2 ld-required-field">
                    <FieldLabel label="Short summary" required info="One or two lines shown on product cards." />
                    <textarea required name="summary" rows={3} className="ld-input ld-textarea" />
                    <span className="ld-required-note">Required</span>
                  </label>

                  <label className="block space-y-2 ld-required-field">
                    <FieldLabel label={getFieldLabel("pitch", workspaceSettings.industryTemplate)} required info="The sales-ready explanation for this product." />
                    <textarea required name="pitch" rows={3} className="ld-input ld-textarea" />
                    <span className="ld-required-note">Required</span>
                  </label>
                </div>
              </div>

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <div className="ld-form-split">
                    <label className="block space-y-2 ld-required-field">
                      <FieldLabel label={getFieldLabel("audience", workspaceSettings.industryTemplate)} required info="Who this product is for." />
                      <input required name="audience" className="ld-input" placeholder="For example: corporate clients who need travel support" />
                      <span className="ld-required-note">Required</span>
                    </label>

                    <label className="block space-y-2 ld-required-field">
                      <FieldLabel label="Owning team" required info="The team responsible for keeping this product current." />
                      <input required name="ownerTeam" className="ld-input" placeholder="Travel Desk" />
                      <span className="ld-required-note">Required</span>
                    </label>
                  </div>

                  <div className="space-y-2" data-required-group="accessRoles">
                    <FieldLabel label="Who should have access?" required info="Choose at least one group that can open this product." />
                    <div className="ld-check-grid">
                      {PRODUCT_ACCESS_ROLES.map((role) => (
                        <label key={role} className="ld-check-tile">
                          <input
                            type="checkbox"
                            name="accessRoles"
                            value={role}
                            defaultChecked={!["affiliate", "marketing_manager"].includes(role)}
                          />
                          <span className="ld-check-tile-card">
                            <span className="ld-check-tile-title">{getRoleLabel(role, workspaceSettings.industryTemplate)}</span>
                            <span className="ld-check-tile-copy">{accessDescriptions[role]}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="ld-group-required-note">Select at least one access group.</p>
                  </div>

                  <div className="ld-form-split ld-form-split-tight">
                    <label className="block space-y-2">
                      <FieldLabel label="Status" />
                      <select name="status" className="ld-input ld-select">
                        {PRODUCT_STATUS.map((item) => (
                          <option key={item} value={item}>
                            {statusLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2">
                      <FieldLabel label="Priority" />
                      <select name="priority" className="ld-input ld-select" defaultValue="normal">
                        {PRODUCT_PRIORITY.map((item) => (
                          <option key={item} value={item}>
                            {priorityLabels[item]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="space-y-2" data-required-group="assetAccessRoles">
                    <FieldLabel label="Who can see assets?" required info="Choose at least one group that can use this product's files." />
                    <div className="ld-check-grid">
                      {PRODUCT_ACCESS_ROLES.map((role) => (
                        <label key={role} className="ld-check-tile">
                          <input
                            type="checkbox"
                            name="assetAccessRoles"
                            value={role}
                            defaultChecked={role === "marketing_manager" || role === "sales_manager"}
                          />
                          <span className="ld-check-tile-card">
                            <span className="ld-check-tile-title">{getRoleLabel(role, workspaceSettings.industryTemplate)}</span>
                            <span className="ld-check-tile-copy">
                              {role === "affiliate"
                                ? "Lets affiliates download approved promo material."
                                : role === "viewer"
                                  ? "Lets view-only users open shared files."
                                  : `Lets ${getRoleLabel(role, workspaceSettings.industryTemplate).toLowerCase()} open and use approved assets.`}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="ld-group-required-note">Select at least one asset access group.</p>
                  </div>
                </div>
              </div>

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <div className="space-y-2">
                    <FieldLabel label="Currency" />
                    <div className="ld-segmented">
                      {currencyOptions.map((currency) => (
                        <label key={currency} className="ld-segmented-option">
                          <input type="radio" name="currency" value={currency} defaultChecked={currency === defaultCurrency} />
                          <span>{currencyLabels[currency as keyof typeof currencyLabels] ?? currency}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="ld-mini-stat-grid">
                    <label className="block space-y-2">
                      <FieldLabel label="Headline price" info="Optional main price shown first on the product." />
                      <input name="price" type="number" step="0.01" min="0" className="ld-input" />
                    </label>
                    <DateField
                      name="expiresAt"
                      label="Expiry date"
                      helperText="Choose the day this offer should stop showing as current."
                    />
                    <label className="block space-y-2">
                      <FieldLabel label={getFieldLabel("slotsAvailable", workspaceSettings.industryTemplate)} info="Optional capacity or quantity available." />
                      <input name="slotsAvailable" type="number" min="0" step="1" className="ld-input" placeholder="For example: 30 places or visa slots" />
                    </label>
                    <label className="block space-y-2">
                      <FieldLabel label={getFieldLabel("expectedSales", workspaceSettings.industryTemplate)} info="Optional target for the sales window." />
                      <input name="expectedSales" type="number" min="0" step="1" className="ld-input" placeholder="For example: 18 expected sales" />
                    </label>
                  </div>

                  <DateRangeFields
                    startName="salesStartsAt"
                    endName="salesEndsAt"
                    startLabel="Sales start"
                    endLabel="Sales end"
                    helperText="Set the period you want the expected sales number to cover."
                  />

                  <ProductFeesField />
                </div>
              </div>

              <div className="ld-form-section">
                <label className="block space-y-2">
                  <FieldLabel label="Notes" />
                  <textarea name="notes" rows={4} className="ld-input ld-textarea" />
                </label>
              </div>

              <button
                type="submit"
                className="ld-glass-button inline-flex w-full items-center justify-center rounded-[16px] px-4 py-3 text-sm font-semibold transition hover:brightness-110"
              >
                Create product
              </button>
            </ValidatedForm>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
