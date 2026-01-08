import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack treats `web/` as the workspace root even if the repo has
    // other lockfiles in parent directories.
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/waitlist",
        permanent: true, // 308 permanent redirect (better for SEO)
      },
    ];
  },
};

export default nextConfig;
