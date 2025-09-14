#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), 'env.example')

if (!fs.existsSync(envPath)) {
  console.log('Creating .env.local file...')
  
  if (fs.existsSync(envExamplePath)) {
    // Copy from env.example
    const envExample = fs.readFileSync(envExamplePath, 'utf8')
    fs.writeFileSync(envPath, envExample)
    console.log('✅ .env.local created from env.example')
  } else {
    // Create basic .env.local
    const basicEnv = `# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Configuration for audio/video transcription
OPENAI_API_KEY=your_openai_api_key_here

# Alpha Vantage API for live market data
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
`
    fs.writeFileSync(envPath, basicEnv)
    console.log('✅ .env.local created with basic configuration')
  }
} else {
  console.log('✅ .env.local already exists')
}

// Check if Alpha Vantage API key is configured
const envContent = fs.readFileSync(envPath, 'utf8')
const hasAlphaVantageKey = envContent.includes('ALPHA_VANTAGE_API_KEY=') && 
                          !envContent.includes('ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here')

if (hasAlphaVantageKey) {
  console.log('✅ Alpha Vantage API key is configured')
  console.log('🚀 Live market data integration is ready!')
} else {
  console.log('⚠️  Alpha Vantage API key not configured')
  console.log('📝 Please add your API key to .env.local:')
  console.log('   ALPHA_VANTAGE_API_KEY=your_actual_api_key_here')
  console.log('')
  console.log('🔗 Get your free API key at: https://www.alphavantage.co/support/#api-key')
}

console.log('')
console.log('🎯 Next steps:')
console.log('1. Add your API keys to .env.local')
console.log('2. Run: npm run dev')
console.log('3. Visit: http://localhost:3002/regulator')
console.log('4. Click "Generate Mock Data" to test the dashboard')
