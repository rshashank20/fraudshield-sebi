/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable API routes in production
  // output: 'export', // Only use this for static deployment
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || 'I6BZS96DFA2H2RPH',
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
