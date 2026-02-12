import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Drydock - Container Update Monitoring";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "linear-gradient(to bottom right, #0a0a0a, #171717)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 80,
            fontWeight: "bold",
            marginBottom: 24,
            color: "#fafafa",
            gap: 16,
          }}
        >
          <span style={{ color: "#C4FF00", fontSize: 64 }}>&#9875;</span>
          <span>Drydock</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a3a3a3",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Open source container update monitoring
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#737373",
            textAlign: "center",
            maxWidth: 600,
            marginTop: 16,
          }}
        >
          Built in TypeScript with modern tooling
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
