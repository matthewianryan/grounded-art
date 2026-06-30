import { ImageResponse } from "next/og";

export const alt = "Grounded Art | Cape Town's living atlas of art";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build time so the route works with the static export.
export const dynamic = "force-static";

// The share card mirrors the wordmark: off-white ground, ink text, a short rust rule.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f8f8f4",
          color: "#16130e",
          padding: "80px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#6e6452" }}>
          CAPE TOWN
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, fontWeight: 700, lineHeight: 1.05 }}>
            Where the city&apos;s art lives.
          </div>
          <div style={{ width: 160, height: 8, backgroundColor: "#a24b2c", marginTop: 36 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 34 }}>
          <span style={{ fontWeight: 700 }}>Grounded Art</span>
          <span style={{ color: "#6e6452" }}>grounded-art.co.za</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
