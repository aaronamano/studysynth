import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  },
};

export default nextConfig;
