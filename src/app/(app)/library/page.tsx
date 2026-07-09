import { ExternalLink, Film, ImageIcon, Presentation, ScrollText, Trash2, Upload } from "lucide-react";

import { deleteAssetAction } from "@/app/actions";
import { AssetUploadAccessFields } from "@/components/asset-upload-access-fields";
import { AsyncRedirectForm } from "@/components/async-redirect-form";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { requirePermission } from "@/lib/auth/server";
import { ASSET_KIND, type ProductAccessRole, statusLabels } from "@/lib/constants";
import { getLibraryAssets, getVisibleProducts } from "@/lib/data";
import { getAllowedAssetVisibility } from "@/lib/product-access";
import { formatDateLabel } from "@/lib/utils";

type LibraryPageProps = {
  searchParams: Promise<{ q?: string; error?: string }>;
};

const libraryErrorCopy: Record<string, string> = {
  "asset-invalid": "Choose a product, add a label, and select a valid asset type and access level.",
  "asset-url": "Add either a valid http/https link or upload a file.",
  "asset-not-found": "That asset has already been removed.",
  "asset-visibility": "That asset access level is wider than the selected product allows.",
  "blob-token": "File upload storage is not configured. Use an external link or configure file storage.",
  "not-allowed": "You do not have permission to upload or manage assets.",
  "product-not-found": "That product is no longer available. Choose another product before uploading.",
  "request-failed": "The upload could not be completed. Check your connection and try again.",
  "upload-failed": "The file could not be uploaded. Try again or use an external asset link.",
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const viewer = await requirePermission("assets:view");
  const assets = await getLibraryAssets(viewer);
  const products = await getVisibleProducts(viewer);
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const canManageAssets = viewer.permissions.includes("assets:manage");
  const canShowAssetForm = canManageAssets && products.length > 0;

  const productGroups = products
    .map((product) => {
      const productAssets = assets.filter((asset) => asset.productId === product.id);

      return {
        productId: product.id,
        productName: product.name,
        productStatus: product.status,
        route: product.route,
        ownerTeam: product.ownerTeam,
        assets: productAssets,
      };
    })
    .filter((group) => {
      if (!query) return true;

      const searchableText = [
        group.productName,
        group.route,
        group.ownerTeam,
        ...group.assets.flatMap((asset) => [asset.label, asset.kind, asset.altText ?? ""]),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });

  return (
    <div className="ld-page">
      <section className="ld-page-header">
        <div>
          <div className="ld-page-meta">
            <span className="ld-chip">Shared assets</span>
            <span className="ld-chip">Grouped by product</span>
          </div>
          <h2 className="ld-title mt-4">Asset Library</h2>
          <p className="ld-subtitle mt-3">
            Open each product and see the real files and links already approved for marketing, sales, partnerships, or affiliates.
          </p>
          {query ? <p className="ld-note mt-3">Showing asset results for “{params.q}”.</p> : null}
          {params.error ? (
            <div className="mt-4 rounded-[14px] border border-[rgba(255,122,114,0.22)] bg-[rgba(255,122,114,0.1)] px-4 py-3 text-sm text-[var(--ld-color-danger)]">
              {libraryErrorCopy[params.error] ?? "Check the asset details and make sure you added either a file or a valid link."}
            </div>
          ) : null}
        </div>
      </section>

      <section className={`grid gap-5 ${canShowAssetForm ? "xl:grid-cols-[1fr_0.94fr]" : ""}`}>
        <div className="grid gap-5">
          {productGroups.length ? (
            productGroups.map((group) => (
              <section key={group.productId} className="ld-solid-panel ld-panel">
                <div className="ld-panel-header">
                  <div>
                    <div className="ld-page-meta">
                      <span className="ld-chip">{statusLabels[group.productStatus as keyof typeof statusLabels]}</span>
                      <span className="ld-chip">{group.route}</span>
                      <span className="ld-chip">{group.assets.length} assets</span>
                    </div>
                    <h3 className="ld-panel-title mt-3">{group.productName}</h3>
                    <p className="mt-2 text-sm text-[var(--ld-color-muted)]">{group.ownerTeam}</p>
                  </div>
                </div>

                {group.assets.length ? (
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {group.assets.map((asset) => {
                      const Icon =
                        asset.kind === "image"
                          ? ImageIcon
                          : asset.kind === "video" || asset.kind === "motion"
                            ? Film
                            : asset.kind === "deck"
                              ? Presentation
                              : ScrollText;

                      return (
                        <div key={asset.id} title={asset.altText ?? `${asset.kind} asset for ${group.productName}`} className="ld-item-card group">
                          <div className="ld-item-card-row">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="rounded-[14px] border border-white/10 bg-black/16 p-3 text-[var(--ld-color-primary-strong)]">
                                <Icon className="size-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-base font-semibold text-white">{asset.label}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-black/18 px-2.5 py-1 text-xs text-[var(--ld-color-muted)]">
                                    {asset.kind}
                                  </span>
                                  <span className="rounded-full bg-black/18 px-2.5 py-1 text-xs text-[var(--ld-color-muted)]">
                                    {asset.visibility === "internal" ? "Managers only" : asset.visibility === "team" ? "Team access" : "Affiliate access"}
                                  </span>
                                  <span className="rounded-full bg-black/18 px-2.5 py-1 text-xs text-[var(--ld-color-muted)]">
                                    {formatDateLabel(asset.createdAt)}
                                  </span>
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
                                <ExternalLink className="size-4 text-[var(--ld-color-muted)] transition group-hover:text-white" />
                              </a>

                              {canManageAssets ? (
                                <form action={deleteAssetAction}>
                                  <input type="hidden" name="assetId" value={asset.id} />
                                  <input type="hidden" name="returnTo" value="/library" />
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="ld-empty-state mt-4">
                    No assets attached yet.
                    {canManageAssets ? " Add the first file or link for this product with the add asset form below." : ""}
                  </div>
                )}
              </section>
            ))
          ) : (
            <div className="ld-glass-card ld-panel">
              <div className="ld-empty-state">
                {query
                  ? "No assets matched this search."
                  : products.length
                    ? "No product assets are available yet. Upload the first real asset for a product."
                    : "No products yet. Create a product first, then attach images, videos, motion graphics, decks, or links."}
              </div>
            </div>
          )}
        </div>

        {canShowAssetForm ? (
          <aside className="ld-solid-panel ld-panel self-start xl:sticky xl:top-6">
            <div className="ld-page-meta">
              <span className="ld-chip">
                <Upload className="size-3.5" />
                Add asset
              </span>
            </div>
            <h3 className="ld-panel-title mt-3">Upload or link a real asset</h3>
            <p className="ld-panel-copy mt-2">
              Select the product, then either upload the file directly or paste the real asset link. Both options are supported.
            </p>

            <AsyncRedirectForm action="/api/assets" method="post" encType="multipart/form-data" className="ld-form-grid mt-5">
              <input type="hidden" name="returnTo" value="/library" />

              <div className="ld-form-section">
                <div className="ld-field-group">
                  <AssetUploadAccessFields
                    products={products.map((product) => ({
                      id: product.id,
                      name: product.name,
                      allowedVisibility: getAllowedAssetVisibility(
                        product.assetAccessRoles as ProductAccessRole[],
                      ),
                    }))}
                  />

                  <label className="block space-y-2 ld-required-field">
                    <span className="ld-label-row">
                      <span className="ld-label">Asset label</span>
                      <span className="ld-required-text">Required</span>
                    </span>
                    <input required name="label" className="ld-input" placeholder="Instagram reel, promo flyer, motion graphic" />
                    <span className="ld-required-note">Required</span>
                  </label>

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
                Save asset
              </button>
            </AsyncRedirectForm>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
