import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "96px",
          backgroundColor: "#111827",
          color: "#F9FAFB",
          fontFamily: "'Inter', 'Arial', sans-serif",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 800, letterSpacing: "0.04em" }}>{SITE.name}</div>
        <div style={{ fontSize: 44, lineHeight: 1.2, maxWidth: "70%" }}>{SITE.description}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {SITE.domain}
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}
