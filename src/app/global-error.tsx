"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0 }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 400 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>Something went wrong</h1>
            <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, color: "#666" }}>
              An unexpected error occurred. Please try again · if the problem continues, contact Xerin Marketplace support.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 20,
                minHeight: 44,
                padding: "0 24px",
                borderRadius: 10,
                border: "none",
                background: "#c2410c",
                color: "#fff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
