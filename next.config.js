const path = require("path");

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  generateEtags: true,

  images: {
    dangerouslyAllowLocalIP: true,
    qualities: [75, 90],

    remotePatterns: [
      // Local FastAPI uploads
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/uploads/**",
      },

      // Localhost FastAPI uploads
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },

      // Unsplash mock product/category images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },

      // Optional: Unsplash source domain if you ever use it
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },

      // Production Xerin API uploads
      {
        protocol: "https",
        hostname: "api.xerinmarketplace.com",
        pathname: "/uploads/**",
      },
    ],
  },

  // Fix Turbopack workspace root warning
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Fix:
  // Blocked cross-origin request to Next.js dev resource /_next/webpack-hmr
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.1.142",
    "6a5b-197-250-96-203.ngrok-free.app",
  ],

  async headers() {
    const csp = [
      "default-src 'self'",

      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",

      "style-src 'self' 'unsafe-inline'",

      // Allow:
      // - Local images
      // - data URLs
      // - blob URLs
      // - HTTPS images
      // - FastAPI uploads
      // - Unsplash mock images
      `img-src 'self' data: blob: https: ${apiBaseUrl} https://images.unsplash.com https://source.unsplash.com`,

      "font-src 'self' data:",

      // Frontend API calls
      `connect-src 'self' ${apiBaseUrl} https:`,

      "frame-src 'self' blob:",

      "object-src 'none'",

      "base-uri 'self'",

      "form-action 'self'",

      "manifest-src 'self'",

      "worker-src 'self' blob:",
    ].join("; ");

    return [
      {
        source: "/:path*",

        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },

          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },

          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },

          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },

          {
            key: "Content-Security-Policy",
            value: csp,
          },

          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;