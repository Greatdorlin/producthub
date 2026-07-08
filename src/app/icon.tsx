import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/config/site";

export const size = {
  width: 256,
  height: 256,
};

export const contentType = "image/png";

function getBrandInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "PH";
}

export default async function Icon() {
  const initials = getBrandInitials(siteConfig.brandName);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 64,
          background:
            "radial-gradient(circle at 22% 18%, rgba(247, 189, 85, 0.18), transparent 46%), linear-gradient(180deg, #12233a 0%, #081120 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 184,
            width: 184,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 56,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f7bd55",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: 0,
          }}
        >
          {initials}
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
