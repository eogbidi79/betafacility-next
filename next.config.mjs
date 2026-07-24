/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Allow larger form posts for inline (data URL) photo uploads.
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "horizons-cdn.hostinger.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
  },
  async headers() {
    // Content-Security-Policy. Permits our own bundle + the known third parties
    // (analytics, maps, image CDNs). 'unsafe-inline' is required for Next's
    // hydration/inline scripts and the analytics/JSON-LD snippets; origins are
    // still restricted so unknown external scripts can't load.
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'self' blob:",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.posthog.com https://*.i.posthog.com",
      "connect-src 'self' https://*.posthog.com https://*.i.posthog.com https://api.mapbox.com https://events.mapbox.com https://api.cloudinary.com https://*.google-analytics.com https://region1.google-analytics.com",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
      {
        // Long-cache static images (Cloudflare will also cache these at the edge).
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
