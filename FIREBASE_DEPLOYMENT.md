# 🔥 Firebase Hosting Deployment Guide

## Overview
This guide will help you deploy the FraudShield SEBI application to Firebase Hosting with Firestore integration.

## 🚀 **Step-by-Step Deployment**

### **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
```

### **Step 2: Login to Firebase**
```bash
firebase login
```
- This will open your browser to authenticate with Google
- Make sure you use the same Google account as your Firebase project

### **Step 3: Initialize Firebase in Your Project**
```bash
firebase init
```

**Select the following options:**
- ✅ **Hosting**: Configure files for Firebase Hosting
- ✅ **Firestore**: Configure security rules and indexes files
- ❌ **Functions**: (Skip for now)
- ❌ **Storage**: (Skip for now)

**Configuration:**
- **Project**: Select your existing Firebase project
- **Public directory**: `out` (this is where Next.js exports to)
- **Single-page app**: `Yes`
- **Overwrite index.html**: `No`
- **Firestore rules file**: `firestore.rules`
- **Firestore indexes file**: `firestore.indexes.json`

### **Step 4: Build the Application**
```bash
npm run build
```

### **Step 5: Deploy to Firebase**
```bash
firebase deploy
```

**Or deploy only hosting:**
```bash
npm run deploy:hosting
```

---

## 🔧 **Environment Variables Setup**

### **For Local Development**
Create `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ALPHA_VANTAGE_API_KEY=I6BZS96DFA2H2RPH
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **For Production (Firebase Functions)**
Since we're using static export, environment variables need to be handled differently:

1. **Create a config file** for production:
```javascript
// config/production.js
export const config = {
  GEMINI_API_KEY: 'your_gemini_api_key_here',
  OPENAI_API_KEY: 'your_openai_api_key_here',
  ALPHA_VANTAGE_API_KEY: 'I6BZS96DFA2H2RPH',
  // Firebase config is already in firebaseConfig.js
}
```

2. **Update API routes** to use the config:
```javascript
// pages/api/process-file.js
import { config } from '../../config/production.js'

// Use config.GEMINI_API_KEY instead of process.env.GEMINI_API_KEY
```

---

## 🗄️ **Firestore Database Setup**

### **Step 1: Enable Firestore**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for now)
6. Select a location (choose closest to your users)

### **Step 2: Deploy Firestore Rules**
```bash
firebase deploy --only firestore
```

### **Step 3: Set Up Collections**
The application will automatically create these collections:
- `flags` - For fraud detection results
- `reports` - For user reports

---

## 🌐 **Custom Domain Setup (Optional)**

### **Step 1: Add Custom Domain**
1. Go to Firebase Console > Hosting
2. Click **Add custom domain**
3. Enter your domain name
4. Follow the verification steps

### **Step 2: Configure DNS**
Add these DNS records:
```
Type: A
Name: @
Value: 151.101.1.195

Type: A  
Name: @
Value: 151.101.65.195

Type: CNAME
Name: www
Value: your-project.web.app
```

---

## 📊 **Monitoring & Analytics**

### **Firebase Analytics**
1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Add tracking code to your app

### **Performance Monitoring**
1. Go to Firebase Console > Performance
2. Enable Performance Monitoring
3. Monitor your app's performance

---

## 🔄 **Continuous Deployment**

### **GitHub Actions (Optional)**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        channelId: live
        projectId: your-project-id
```

---

## 🚨 **Important Notes**

### **API Limitations**
- **Static export** means no server-side API routes
- **Client-side only** API calls
- **CORS issues** may occur with external APIs

### **Firebase Security**
- **Update Firestore rules** for production
- **Enable authentication** if needed
- **Set up proper user permissions**

### **Performance**
- **Static files** are served from CDN
- **Fast loading** times globally
- **Automatic HTTPS** enabled

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### **Firebase CLI Issues**
```bash
# Update Firebase CLI
npm install -g firebase-tools@latest

# Re-login
firebase logout
firebase login
```

#### **Deployment Issues**
```bash
# Check Firebase project
firebase projects:list

# Switch project
firebase use your-project-id

# Check hosting status
firebase hosting:channel:list
```

#### **Environment Variables**
- Make sure all required variables are set
- Check Firebase project configuration
- Verify API keys are valid

---

## 🎉 **Success!**

Once deployed, your application will be available at:
- **Default URL**: `https://your-project-id.web.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

### **What's Deployed:**
- ✅ **Static website** with all pages
- ✅ **Firestore database** with rules
- ✅ **Global CDN** for fast loading
- ✅ **HTTPS** enabled by default
- ✅ **Custom domain** support

### **Next Steps:**
1. **Test all functionality** on the live site
2. **Set up monitoring** and analytics
3. **Configure custom domain** if needed
4. **Update Firestore rules** for production
5. **Set up continuous deployment**

---

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase documentation
3. Check the Firebase Console for errors
4. Verify all environment variables are set

**Happy Deploying!** 🔥🚀
