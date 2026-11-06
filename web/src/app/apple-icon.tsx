import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

function Bar({
  width,
  height,
  left,
  top,
}: {
  width: number;
  height: number;
  left: number;
  top: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        background: "#f4f1ea",
      }}
    />
  );
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1c3a57",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 68,
            height: 88,
            display: "flex",
          }}
        >
          <Bar width={27} height={9} left={0} top={0} />
          <Bar width={18} height={79} left={0} top={0} />
          <Bar width={68} height={16} left={0} top={72} />
          <Bar width={8} height={16} left={60} top={64} />
        </div>
      </div>
    ),
    { ...size },
  );
}
