import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lotus Korean Hotel — Korean business hotel in Bengaluru";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#25313d",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 999,
              background: "#1c3a57",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 20,
                height: 26,
                display: "flex",
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, width: 8, height: 3, background: "#f4f1ea" }} />
              <div style={{ position: "absolute", left: 0, top: 0, width: 5, height: 23, background: "#f4f1ea" }} />
              <div style={{ position: "absolute", left: 0, top: 20, width: 20, height: 5, background: "#f4f1ea" }} />
              <div style={{ position: "absolute", left: 17, top: 17, width: 3, height: 5, background: "#f4f1ea" }} />
            </div>
          </div>
          <div
            style={{
              color: "#e8c4ae",
              fontSize: 22,
              letterSpacing: 6,
              fontWeight: 600,
            }}
          >
            BENGALURU · INDIA
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#fffdf8",
              fontSize: 72,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            Lotus Korean Hotel
          </div>
          <div
            style={{
              marginTop: 22,
              color: "#f4c9b3",
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            Korean comfort for business travel — rooms, dining, airport pickup.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            color: "#fffdf8",
            fontSize: 22,
            opacity: 0.78,
          }}
        >
          <span>Rooms</span>
          <span>·</span>
          <span>Korean dining</span>
          <span>·</span>
          <span>Airport pickup</span>
          <span>·</span>
          <span>Long stay</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
