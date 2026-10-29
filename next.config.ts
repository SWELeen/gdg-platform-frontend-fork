import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const configuredApiProxyTarget = process.env.API_PROXY_TARGET?.trim().replace(/\/+$/, "") || undefined;
const productionApiEnabled = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_USE_API === "true";

if (productionApiEnabled && !configuredApiProxyTarget) {
  throw new Error("API_PROXY_TARGET must be set when the production API is enabled.");
}

const apiProxyTarget = configuredApiProxyTarget ?? "http://localhost:3001";
const apiProxyUrl = new URL(apiProxyTarget);

if (
  apiProxyUrl.username ||
  apiProxyUrl.password ||
  apiProxyUrl.pathname !== "/" ||
  apiProxyUrl.search ||
  apiProxyUrl.hash ||
  (productionApiEnabled && apiProxyUrl.protocol !== "https:")
) {
  throw new Error("API_PROXY_TARGET must be a bare HTTPS origin in production (for example, https://api.example.com).");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
