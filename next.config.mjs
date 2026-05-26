/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Include SQLite file in Vercel serverless function bundles
  outputFileTracingIncludes: {
    '/api/**': ['./Db/prisma/dev.db'],
  },
}

export default nextConfig
