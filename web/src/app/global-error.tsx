"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#fafafa",
          color: "#1d1d1f",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            예기치 않은 오류가 발생했습니다
          </h2>
          <p style={{ marginTop: 12, fontSize: 14, color: "#86868b" }}>
            페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.
          </p>
          {error?.digest && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#86868b" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: "8px 20px",
              borderRadius: 9999,
              background: "#1d1d1f",
              color: "white",
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
