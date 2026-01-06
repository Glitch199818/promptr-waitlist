import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack treats `web/` as the workspace root even if the repo has
    // other lockfiles in parent directories.
    root: __dirname,
  },
};

export default nextConfig;
