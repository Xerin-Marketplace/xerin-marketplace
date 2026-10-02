const path = require("path");

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const backendBaseUrl =
  process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
const apiCspSource = /^https?:\/\//.test(apiBaseUrl)
  ? new URL(apiBaseUrl).origin
  : "";

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
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "8000",
      pathname: "/uploads/**",
    },
    {
      protocol: "http",
      hostname: "localhost",
      port: "8000",
      pathname: "/uploads/**",
    },

    // Production API product/category images
    {
      protocol: "https",
      hostname: "api.xerinmarketplace.com",
      pathname: "/api/v1/uploads/**",
    },

    // Keep this too if some backend URLs are returned without /api/v1
    {
      protocol: "https",
      hostname: "api.xerinmarketplace.com",
      pathname: "/uploads/**",
    },

    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },

    {
        protocol: 'http',
        hostname: '169.58.54.110',
        port: '8000',
        pathname: '/api/v1/uploads/**', 
      },

    {
        protocol: 'http',
        hostname: '169.58.54.110',
        port: '8000',
        pathname: '/uploads/**',
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
    "e12a-41-207-244-106.ngrok-free.app",
    "backendtest.adam.com",
    "169.58.54.110",
    "10.68.43.235",
    "10.68.43.234",
  ],

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendBaseUrl}/api/v1/:path*`,
      },
      {
        source: "/backend-uploads/:path*",
        destination: `${backendBaseUrl}/uploads/:path*`,
      },
    ];
  },

  async headers() {
    const csp = [
      "default-src 'self'",

      // accounts.google.com: GIS script for "Continue with Google".
      // intentchat.com: AI sales-agent widget embed script.
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://*.intentchat.com https://intentchat.com",

      "style-src 'self' 'unsafe-inline'",

      // Allow:
      // - Local images
      // - data URLs
      // - blob URLs
      // - HTTPS images
      // - FastAPI uploads
      // - Unsplash mock images
      `img-src 'self' data: blob: https: ${apiCspSource} https://images.unsplash.com https://source.unsplash.com`,

      "font-src 'self' data:",

      // Frontend API calls + Google sign-in endpoints.
      `connect-src 'self' ${apiCspSource} https:`,

      // Google One Tap / sign-in prompt iframe + IntentChat chat window.
      "frame-src 'self' blob: https://accounts.google.com https://*.intentchat.com https://intentchat.com",

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
            value: "camera=(), microphone=(), geolocation=(self)",
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
