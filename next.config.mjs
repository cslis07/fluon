/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // JSON datasets are imported directly by the API routes, so no file-tracing
  // config is needed; keep the raw harvest cache out of the build.
  outputFileTracingExcludes: {
    "*": ["./data/raw/**"],
  },
};

export default nextConfig;
