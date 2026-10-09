import { ImageResponse } from "next/og";
import { API_SERVER_BASE_URL } from "@/lib/api/endpoints";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };
const BRAND = "#f97316";

type Product = {
  name?: string;
  description?: string;
  price?: number | string;
  sale_price?: number | string;
  currency?: string;
  brand_name?: string;
  primary_image_url?: string;
  images?: Array<{ image_url?: string; url?: string }>;
};

type Named = { name?: string; description?: string; logo_url?: string; image_url?: string };

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_SERVER_BASE_URL}${path}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function money(value: number | string | undefined, currency = "TZS") {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${currency} ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function truncate(s: string, n = 90) {
  const t = s.trim();
  return t.length <= n ? t : `${t.slice(0, n).trimEnd()}…`;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Brand rail */}
      <div style={{ width: 14, height: "100%", background: BRAND, display: "flex" }} />
      <div style={{ display: "flex", flex: 1, padding: "48px 56px" }}>{children}</div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: BRAND,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 800,
        }}
      >
        X
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 14 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: "#111827" }}>XERIN</span>
        <span style={{ fontSize: 15, color: "#6b7280" }}>Mart</span>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ display: "flex", marginTop: "auto", fontSize: 18, color: "#9ca3af" }}>
      {siteConfig.url.replace(/^https?:\/\//, "")}
    </div>
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ parts: string[] }> },
) {
  const [kind, slug] = (await params).parts ?? [];
  let title: string = siteConfig.name;
  let subtitle = "Shop online for everyday essentials";
  let image: string | null = null;
  let price: string | null = null;
  let badge: string | null = null;

  if (kind === "product" && slug) {
    const p = await fetchJson<Product>(`/products/${slug}`);
    if (p) {
      title = p.name || title;
      subtitle = truncate(p.description?.replace(/<[^>]*>/g, "") || "Shop this product on Xerin Marketplace.");
      price = money(p.sale_price ?? p.price, p.currency);
      image = p.primary_image_url || p.images?.[0]?.image_url || p.images?.[0]?.url || null;
      badge = p.brand_name || null;
    }
  } else if (kind === "category" && slug) {
    const c = await fetchJson<Named>(`/categories/${slug}`);
    if (c) {
      title = c.name || title;
      subtitle = truncate(c.description || `Shop ${c.name} online on Xerin Marketplace.`);
      image = c.image_url || null;
    }
  } else if (kind === "brand" && slug) {
    const b = await fetchJson<Named>(`/brands/${slug}`);
    if (b) {
      title = b.name || title;
      subtitle = `Shop ${b.name} products on Xerin Marketplace.`;
      image = b.logo_url || null;
    }
  } else if (kind === "store" && slug) {
    const s = await fetchJson<Named>(`/stores/${slug}`);
    if (s) {
      title = s.name || title;
      subtitle = `Shop from ${s.name} on Xerin Marketplace.`;
      image = s.logo_url || null;
    }
  }

  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Header />
          {badge && (
            <span style={{ fontSize: 18, color: BRAND, fontWeight: 700, marginBottom: 8 }}>{badge}</span>
          )}
          <div
            style={{
              fontSize: title.length > 40 ? 46 : 56,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.12,
              maxWidth: image ? 640 : 900,
            }}
          >
            {truncate(title, 80)}
          </div>
          <div style={{ fontSize: 22, color: "#4b5563", marginTop: 14, maxWidth: image ? 620 : 880, lineHeight: 1.35 }}>
            {subtitle}
          </div>
          {price && (
            <div style={{ fontSize: 34, fontWeight: 800, color: BRAND, marginTop: 18 }}>{price}</div>
          )}
          <Footer />
        </div>
        {image && (
          <div
            style={{
              width: 380,
              height: 480,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f9fafb",
              borderRadius: 20,
              overflow: "hidden",
              marginLeft: 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} width={380} height={480} style={{ objectFit: "contain" }} alt="" />
          </div>
        )}
      </Frame>
    ),
    { ...SIZE },
  );
}
