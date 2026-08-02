import type { NextConfig } from "next";

// Foundation-level config. Supabase Storage serves book covers, branding
// assets (logo/dark logo/favicon) as public URLs on a *.supabase.co
// subdomain — next/image refuses any external host that isn't explicitly
// allowed, so this wildcard covers every Supabase project without needing
// to hardcode this project's specific ref.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
