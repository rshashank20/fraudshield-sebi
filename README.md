# 🛡️ FraudShield SEBI

A comprehensive AI-powered fraud detection platform designed to help investors verify financial advisors and analyze investment tips for potential fraud indicators. Built specifically for the Indian market with SEBI (Securities and Exchange Board of India) compliance.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://xyz-sepia-psi.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7.0-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

## ✨ Features

### 🔍 **Multi-Modal Fraud Detection**
- **📝 Text Analysis** - Analyze investment tips and recommendations using AI
- **👤 Advisor Verification** - Check SEBI registration status
- **🔗 Link Analysis** - Scan URLs for fraud indicators
- **📁 File Upload** - Support for PDF, DOCX, MP3, WAV, MP4 files with content extraction

### 🤖 **AI-Powered Analysis**
- **🧠 Google Gemini AI** - Advanced fraud detection using Large Language Models
- **📊 Risk Scoring** - Confidence levels (0-100%) with detailed reasoning
- **🎯 Verdict System** - HIGH RISK, WATCH, LIKELY SAFE classifications
- **📋 Detailed Reasoning** - Specific fraud indicators and evidence links

### 📊 **Regulator Dashboard**
- **📈 Live Monitoring** - Real-time fraud detection alerts and flag management
- **📊 KPI Cards** - Total flags, high-risk alerts, confidence metrics
- **🔍 Flag Triage** - Complete workflow for reviewing and managing fraud cases
- **📈 Market Correlation** - Real-time market data integration with Alpha Vantage API

### 🚨 **Advanced Analytics**
- **📊 Real-time Charts** - Market correlation visualization using Recharts
- **🔔 Alert System** - Automated fraud notifications and monitoring
- **📈 Performance Metrics** - System effectiveness and accuracy tracking
- **📋 Audit Trail** - Complete action history and regulatory compliance

## 🏗️ Tech Stack

### **Frontend**
- **⚛️ Next.js 14** - React framework with SSR/SSG capabilities
- **🔷 TypeScript** - Type-safe development with full type coverage
- **🎨 TailwindCSS** - Utility-first CSS framework for responsive design
- **📱 Responsive Design** - Mobile-first approach with modern UI/UX

### **Backend & APIs**
- **🔌 Next.js API Routes** - Serverless functions for backend logic
- **🤖 Google Gemini AI** - Advanced fraud analysis and content understanding
- **📊 Alpha Vantage API** - Real-time market data and stock information
- **🔍 OpenAI API** - Audio/video transcription and content extraction

### **Database & Storage**
- **🔥 Firebase Firestore** - Real-time NoSQL database for flags and analytics
- **☁️ Firebase Storage** - Secure file upload and storage handling
- **🔐 Firebase Auth** - User authentication system (ready for integration)

### **Deployment & Hosting**
- **🚀 Vercel** - Production hosting with full API routes support
- **⚡ Edge Network** - Global CDN distribution for optimal performance
- **🔄 Auto Deploy** - GitHub integration with automatic deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rshashank20/fraudshield-sebi.git
   cd fraudshield-sebi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # Required for AI analysis
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional for enhanced features
   OPENAI_API_KEY=your_openai_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   
   # Firebase configuration (or use firebaseConfig.js)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fraudshield-sebi.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=fraudshield-sebi
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fraudshield-sebi.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=90399181617
   NEXT_PUBLIC_FIREBASE_APP_ID=1:90399181617:web:73445bb04303a8c23f7e10
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Firestore
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database

### 3. Get Web App Configuration
1. In your Firebase project, go to "Project Settings"
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the configuration object and paste it into `firebaseConfig.js`

### 4. Firestore Collections
The app automatically creates these collections:
- `flags` - User submissions and analysis results
- `advisors` - SEBI registered advisor information (for future use)

## 📁 Project Structure

```
fraudshield-sebi/
├── 📄 pages/                    # Next.js pages and API routes
│   ├── 🔌 api/                  # API endpoints
│   │   └── analyze.ts          # AI analysis endpoint
│   ├── 🏠 index.tsx            # Landing page
│   ├── ✅ verify.tsx           # Verification form
│   ├── 📊 result.tsx           # Results display
│   ├── 🛠️ dashboard.tsx        # Admin dashboard
│   ├── 📈 regulator.tsx        # Regulator dashboard
│   ├── 📋 results-dashboard.tsx # Results management
│   └── 🔍 dashboard/flag/[id].tsx # Flag details page
├── 🧩 components/              # React components
│   ├── 📁 FileUpload.tsx       # File upload handler
│   └── 📊 regulator/           # Dashboard components
│       ├── Alerts.tsx          # Alert system
│       ├── CorrelationChart.tsx # Market correlation charts
│       ├── KPICards.tsx        # KPI metrics cards
│       └── LiveFeed.tsx        # Real-time feed component
├── 🔧 lib/                     # Utilities and configurations
│   ├── firebase.js            # Firebase configuration
│   └── firestore-models.ts    # TypeScript data models
├── 🎨 styles/                  # Styling
│   └── globals.css            # Global CSS styles
├── 🔧 utils/                   # Helper functions
│   └── alphaVantage.ts        # Market data API integration
├── ⚙️ Configuration files      # Build and deployment configs
│   ├── next.config.js         # Next.js configuration
│   ├── next.config.prod.js    # Production configuration
│   ├── next.config.apphosting.js # Firebase App Hosting config
│   ├── vercel.json            # Vercel deployment configuration
│   ├── firebase.json          # Firebase configuration
│   └── tailwind.config.js     # TailwindCSS configuration
└── 📚 Documentation
    ├── README.md              # This file
    └── env.example            # Environment variables template
```

## 🔌 API Endpoints

### POST /api/analyze
**AI-powered fraud analysis endpoint**

**Request:**
```json
{
  "text": "BUY $AAPL NOW! Guaranteed 50% returns in 30 days!",
  "type": "tip" | "advisor" | "link" | "file"
}
```

**Response:**
```json
{
  "verdict": "HIGH RISK",
  "confidence": 95,
  "reasons": ["Contains guaranteed return promises", "Uses pressure tactics"],
  "evidence": ["https://www.sebi.gov.in/", "https://www.investor.gov/"],
  "inputText": "BUY $AAPL NOW! Guaranteed 50% returns in 30 days!",
  "inputType": "tip"
}
```

## 🚀 Deployment

### Vercel (Recommended)
The app is currently deployed on Vercel with full API route support:

1. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - Environment variables configured in Vercel dashboard

2. **Manual Deployment**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

3. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required API keys and Firebase configuration

### Firebase Hosting (Alternative)
```bash
npm run build
firebase deploy --only hosting
```

## 🔐 Environment Variables

Create a `.env.local` file for local development:

```env
# AI Services (Required for analysis)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Firebase Configuration (Optional - can use firebaseConfig.js)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fraudshield-sebi.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fraudshield-sebi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fraudshield-sebi.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=90399181617
NEXT_PUBLIC_FIREBASE_APP_ID=1:90399181617:web:73445bb04303a8c23f7e10
```

### Getting API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### OpenAI API (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to your environment variables

#### Alpha Vantage API (Optional)
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get your free API key
3. Add to your environment variables

## 📊 Features in Detail

### 🔍 Fraud Detection Capabilities
- **AI Analysis**: Uses Google Gemini AI for sophisticated fraud detection
- **Multi-format Support**: Handles text, files, URLs, and advisor names
- **Real-time Processing**: Fast analysis with detailed reasoning
- **Confidence Scoring**: 0-100% confidence levels for each analysis

### 📈 Regulator Dashboard
- **Live Monitoring**: Real-time fraud detection alerts
- **Flag Management**: Complete triage workflow for regulators
- **KPI Tracking**: System performance and effectiveness metrics
- **Market Integration**: Real-time stock data correlation

### 🛡️ Security Features
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error management
- **Input Validation**: Secure data processing
- **Environment Security**: Secure API key management

## 🎯 Target Users

### Primary Users
- **👤 Individual Investors** - Verify advisors and analyze investment tips
- **🏛️ SEBI Regulators** - Monitor and manage fraud cases
- **🏦 Financial Institutions** - Internal compliance and due diligence

### Use Cases
- **🔍 Due Diligence** - Before making investment decisions
- **📊 Compliance Monitoring** - Regulatory oversight and reporting
- **🚨 Fraud Prevention** - Early detection and warning systems
- **📈 Market Surveillance** - Real-time monitoring and analysis

## 🔮 Roadmap

### ✅ Phase 1 (Completed)
- Core fraud detection functionality
- Multi-modal input support (text, files, URLs)
- Regulator dashboard with live monitoring
- Vercel deployment with API routes
- Firebase integration for data storage
- AI-powered analysis with Google Gemini

### 🔄 Phase 2 (In Progress)
- Enhanced user interface and experience
- Advanced analytics and reporting
- Performance optimizations
- Additional file format support

### 📋 Phase 3 (Planned)
- User authentication and profiles
- Mobile app development
- Real-time notifications
- Advanced AI model training
- SEBI API integration
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check the documentation
- Review the API endpoints

## 🏆 Acknowledgments

- **Google Gemini AI** for advanced fraud detection capabilities
- **Vercel** for seamless deployment and hosting
- **Firebase** for real-time database and storage
- **Next.js** for the robust React framework
- **TailwindCSS** for beautiful, responsive design

## 📞 Contact

- **Project Maintainer**: [rshashank20](https://github.com/rshashank20)
- **Live Demo**: [https://xyz-sepia-psi.vercel.app](https://xyz-sepia-psi.vercel.app)
- **Repository**: [https://github.com/rshashank20/fraudshield-sebi](https://github.com/rshashank20/fraudshield-sebi)

---

**🛡️ FraudShield SEBI - Protecting Investors Through AI-Powered Fraud Detection**

*Built with ❤️ for the Indian financial market*