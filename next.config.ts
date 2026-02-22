import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    // Allow iframe embedding — explicit schemes cover localhost dev + production
    const iframeHeaders = [
      {
        key: "X-Frame-Options",
        value: "ALLOWALL",
      },
      {
        key: "Content-Security-Policy",
        value:
          "frame-ancestors 'self' http://localhost:* http://127.0.0.1:* https://* http://*",
      },
    ];

    return [
      { source: "/embed/:path*", headers: iframeHeaders },
      { source: "/f/:path*", headers: iframeHeaders },
      {
        // Allow API calls from iframed pages
        source: "/api/forms/:path*",
        headers: [{ key: "X-Frame-Options", value: "ALLOWALL" }],
      },
    ];
  },
};

export default nextConfig;
