# 🚀 FraudShield SEBI - Deployment Guide

## Overview
This guide will help you deploy the FraudShield SEBI application to various hosting platforms.

## 🎯 **Recommended: Vercel Deployment**

### **Step 1: Prepare Your Repository**
1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### **Step 2: Deploy to Vercel**
1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Import your repository**
5. **Configure environment variables** (see below)
6. **Click "Deploy"**

### **Step 3: Environment Variables Setup**
In Vercel dashboard, go to **Settings > Environment Variables** and add:

```bash
# Required for AI processing
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Required for live market data
ALPHA_VANTAGE_API_KEY=I6BZS96DFA2H2RPH

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **Step 4: Firebase Configuration**
1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Create a new project** or use existing
3. **Enable Firestore Database**
4. **Get your config** from Project Settings
5. **Add the config** to Vercel environment variables

---

## 🌐 **Alternative: Netlify Deployment**

### **Step 1: Deploy to Netlify**
1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up/Login** with GitHub
3. **Click "New site from Git"**
4. **Choose your repository**
5. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Deploy site**

### **Step 2: Environment Variables**
In Netlify dashboard, go to **Site settings > Environment variables** and add the same variables as above.

---

## 🐳 **Docker Deployment (Advanced)**

### **Step 1: Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **Step 2: Build and Run**
```bash
docker build -t fraudshield-sebi .
docker run -p 3000:3000 fraudshield-sebi
```

---

## 🔧 **Pre-Deployment Checklist**

### **✅ Code Preparation**
- [ ] All files committed to Git
- [ ] Environment variables documented
- [ ] Build process tested locally
- [ ] No sensitive data in code

### **✅ Environment Setup**
- [ ] Firebase project configured
- [ ] API keys obtained
- [ ] Database rules set up
- [ ] CORS settings configured

### **✅ Testing**
- [ ] Application builds successfully
- [ ] All pages load correctly
- [ ] API endpoints work
- [ ] Database connections work

---

## 🚨 **Important Security Notes**

### **Environment Variables**
- **Never commit** `.env.local` to Git
- **Use Vercel/Netlify** environment variable management
- **Rotate API keys** regularly
- **Use different keys** for development/production

### **Firebase Security**
- **Set up Firestore rules**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true; // Configure based on your needs
      }
    }
  }
  ```

### **API Rate Limits**
- **Alpha Vantage**: 5 calls/minute (free tier)
- **OpenAI**: Check your plan limits
- **Google Gemini**: Check your quota

---

## 📊 **Post-Deployment Steps**

### **1. Test Your Deployment**
- [ ] Visit your live URL
- [ ] Test file upload functionality
- [ ] Verify live market data integration
- [ ] Check all navigation links

### **2. Configure Custom Domain (Optional)**
- **Vercel**: Go to Project Settings > Domains
- **Netlify**: Go to Site Settings > Domain Management
- **Add your domain** and configure DNS

### **3. Set Up Monitoring**
- **Vercel Analytics**: Built-in performance monitoring
- **Google Analytics**: Add tracking code
- **Error monitoring**: Consider Sentry or similar

### **4. Database Setup**
- **Create initial data** using seed scripts
- **Set up backup** strategies
- **Monitor usage** and costs

---

## 🔄 **Continuous Deployment**

### **Automatic Deployments**
- **Vercel/Netlify** automatically deploy on Git push
- **Branch deployments** for testing
- **Preview deployments** for pull requests

### **Manual Deployments**
```bash
# Build locally
npm run build

# Test locally
npm run start

# Deploy (if using CLI)
vercel --prod
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
- Check Node.js version (18+ required)
- Verify all dependencies installed
- Check for TypeScript errors

#### **Environment Variables**
- Ensure all required variables are set
- Check variable names match exactly
- Verify API keys are valid

#### **Firebase Issues**
- Check project configuration
- Verify Firestore rules
- Ensure billing is enabled (if required)

#### **API Errors**
- Check rate limits
- Verify API keys
- Check network connectivity

### **Getting Help**
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs

---

## 🎉 **Success!**

Once deployed, your FraudShield SEBI application will be live and accessible to users worldwide!

**Your application will include:**
- ✅ **Live fraud detection** with AI analysis
- ✅ **Real-time market data** integration
- ✅ **Professional dashboard** for regulators
- ✅ **File upload and analysis** capabilities
- ✅ **Responsive design** for all devices

**Next Steps:**
1. **Share the URL** with stakeholders
2. **Set up monitoring** and analytics
3. **Gather user feedback** and iterate
4. **Scale as needed** based on usage

---

## 📞 **Support**

If you encounter any issues during deployment:
1. Check the troubleshooting section above
2. Review the platform-specific documentation
3. Check the application logs for errors
4. Verify all environment variables are correctly set

**Happy Deploying!** 🚀
