# FraudShield SEBI

A Next.js application for fraud detection and SEBI advisor verification. This application helps investors verify financial advisors and analyze investment tips for potential fraud indicators.

## Features

- **Advisor Verification**: Check if financial advisors are registered with SEBI
- **Tip Analysis**: Analyze investment tips and recommendations for fraud indicators
- **Risk Assessment**: Get detailed risk assessments with confidence scores
- **Regulator Dashboard**: Monitor flags and system performance
- **Firebase Integration**: Real-time data storage and retrieval

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (ready for integration)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fraudshield-sebi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase configuration**
   - Copy `firebaseConfig.example.js` to `firebaseConfig.js`
   - Replace the placeholder values with your actual Firebase web configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id-here"
   };
   ```

4. **Set up Google Gemini API**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env.local` file in the project root:
   ```bash
   # Copy from env.example
   cp env.example .env.local
   ```
   - Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Firebase Setup

### 1. Create a Firebase Project
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

### 4. Set up Firestore Collections
The app will automatically create the following collections:
- `advisors`: SEBI registered advisor information
- `flags`: User submissions and analysis results

### 5. (Optional) Seed Mock Data
If you want to populate the database with mock advisor data:

1. Set up Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Download your service account key from Firebase Console:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `service-account-key.json` in the project root

3. Update the path in `scripts/seed-firestore.js`:
   ```javascript
   const serviceAccount = require('../service-account-key.json');
   ```

4. Run the seed script:
   ```bash
   node scripts/seed-firestore.js
   ```

## Local Development with Firebase Emulator (Optional)

For local development without affecting production data:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**
   ```bash
   firebase init
   ```
   - Select "Firestore" and "Functions"
   - Choose your Firebase project
   - Use default settings

4. **Start the emulator**
   ```bash
   firebase emulators:start
   ```

5. **Update Firebase configuration for emulator**
   In `lib/firebase.js`, add emulator configuration:
   ```javascript
   import { connectFirestoreEmulator } from 'firebase/firestore';
   
   // Add this after initializing Firestore
   if (process.env.NODE_ENV === 'development') {
     connectFirestoreEmulator(db, 'localhost', 8080);
   }
   ```

## Project Structure

```
fraudshield-sebi/
├── pages/
│   ├── api/                 # API routes
│   │   ├── check.ts        # Analysis endpoint
│   │   ├── report.ts       # Report submission
│   │   └── dashboard.ts    # Dashboard data
│   ├── index.tsx           # Landing page
│   ├── verify.tsx          # Verification form
│   ├── result.tsx          # Results display
│   ├── dashboard.tsx       # Regulator dashboard
│   └── _app.tsx           # App wrapper
├── lib/
│   ├── firebase.js         # Firebase configuration
│   └── firestore-models.ts # Data models
├── styles/
│   └── globals.css         # Global styles
├── scripts/
│   └── seed-firestore.js   # Database seeding
├── firebaseConfig.example.js
├── tailwind.config.js
├── next.config.js
└── package.json
```

## API Endpoints

### POST /api/check
Analyzes input text and returns fraud assessment.

**Request Body:**
```json
{
  "inputText": "string",
  "type": "advisor" | "tip" | "link"
}
```

**Response:**
```json
{
  "verdict": "HIGH RISK" | "WATCH" | "LIKELY SAFE",
  "confidence": 85,
  "reasons": ["Reason 1", "Reason 2"],
  "evidence": ["https://example.com"],
  "flagId": "document-id"
}
```

### POST /api/report
Reports a flag to SEBI.

**Request Body:**
```json
{
  "flagId": "string",
  "anonymous": boolean
}
```

### GET /api/dashboard
Returns dashboard KPIs and recent flags.

**Response:**
```json
{
  "kpis": {
    "totalFlags": 100,
    "highRiskFlags": 25,
    "watchFlags": 30,
    "safeFlags": 45,
    "avgConfidence": 78
  },
  "recentFlags": [...]
}
```

## Deployment

### Deploy to Firebase Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy --only hosting
   ```

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

## Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# Google Gemini API (Required for fraud analysis)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (Optional - can also use firebaseConfig.js)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to your `.env.local` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Roadmap

- [ ] LLM integration for advanced fraud detection
- [ ] User authentication and profiles
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Integration with SEBI APIs
