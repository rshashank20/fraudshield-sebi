/** @type {import('next').NextConfig} */
const nextConfig = {
  // No output: 'export' for App Hosting (needs API routes)
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
