/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    outputStandalone: true,
  },
  publicRuntimeConfig: {
    API_HOST: process.env.API_HOST || "http://localhost:3001",
  },
};

module.exports = nextConfig;
