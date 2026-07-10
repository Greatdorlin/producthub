import { Eye, RotateCcw } from "lucide-react";

import { getRoleLabel } from "@/lib/config/industries";
import type { ProductRole } from "@/lib/constants";

type PreviewCandidate = {
  id: string;
  name: string;
  role: ProductRole;
};

type PreviewAccessSwitcherProps = {
  actualUserId: string;
  actualUserName: string;
  actualUserRole: ProductRole;
  effectiveUserId: string;
  effectiveUserName: string;
  effectiveUserRole: ProductRole;
  isPreviewing: boolean;
  candidates: PreviewCandidate[];
  industryTemplate?: string;
  compact?: boolean;
};

export function PreviewAccessSwitcher({
  actualUserId,
  actualUserName,
  actualUserRole,
  effectiveUserId,
  effectiveUserName,
  effectiveUserRole,
  isPreviewing,
  candidates,
  industryTemplate,
  compact = false,
}: PreviewAccessSwitcherProps) {
  if (!candidates.length) {
    return null;
  }

  return (
    <div className={`ld-preview-switcher ${compact ? "is-compact" : ""}`}>
      <div className={`ld-preview-copy ${compact ? "is-compact" : ""}`}>
        <span className="ld-preview-icon">
          <Eye className="size-3.5" />
        </span>
        <div className={`min-w-0 ${compact ? "hidden" : ""}`}>
          <div className="ld-preview-title">
            {isPreviewing ? `Viewing as ${effectiveUserName}` : "View as another role"}
          </div>
          <div className="ld-preview-subtitle">
            {isPreviewing
              ? `${getRoleLabel(effectiveUserRole, industryTemplate)} view`
              : `${actualUserName} · ${getRoleLabel(actualUserRole, industryTemplate)}`}
          </div>
        </div>
      </div>

      <div className="ld-preview-controls">
        <form action="/api/auth/preview" method="post" className="ld-preview-form">
          <select
            name="previewUserId"
            defaultValue={isPreviewing ? effectiveUserId : actualUserId}
            className="ld-input ld-select ld-preview-select"
            aria-label="Preview a different user account"
          >
            <option value={actualUserId}>My account</option>
            {candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name} · {getRoleLabel(candidate.role, industryTemplate)}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="ld-secondary-button inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-semibold"
          >
            {compact ? "Apply" : "Switch view"}
          </button>
        </form>

        {isPreviewing ? (
          <form action="/api/auth/preview/clear" method="post">
            <button
              type="submit"
              className="ld-secondary-button inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold"
            >
              <RotateCcw className="size-4" />
              Back to admin
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
