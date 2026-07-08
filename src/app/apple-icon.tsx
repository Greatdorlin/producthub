import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/config/site";

export const size = {
  width: 180,
  height: 180,
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

export default async function AppleIcon() {
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
          background: "#081120",
        }}
      >
        <div
          style={{
            color: "#f7bd55",
            fontSize: 84,
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
