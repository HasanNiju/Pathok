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
  // pdfjs-dist reads its cmaps/ and standard_fonts/ folders straight off
  // disk at runtime (see src/lib/text-extraction.ts) rather than importing
  // them — Next's build-time file tracing only follows import/require, so
  // without this the deployed function is missing those files and PDF
  // extraction fails in production even though it works locally.
  outputFileTracingIncludes: {
    "/api/books/extract": ["./node_modules/pdfjs-dist/cmaps/**", "./node_modules/pdfjs-dist/standard_fonts/**"],
  },
};

export default nextConfig;
