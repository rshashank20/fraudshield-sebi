# 🚀 Quick Deployment Guide

## **Option 1: Vercel (Recommended - 2 minutes)**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Deploy to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. **Import** your GitHub repository
4. **Deploy!** (Vercel handles everything)

### **Step 3: Add Environment Variables**
In Vercel dashboard:
1. Go to **Project Settings > Environment Variables**
2. Add these variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ALPHA_VANTAGE_API_KEY=I6BZS96DFA2H2RPH
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

---

## **Option 2: Netlify (Also Easy - 3 minutes)**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Deploy to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Click **"New site from Git"**
3. **Choose GitHub** and select your repository
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
5. **Deploy site**

### **Step 3: Add Environment Variables**
In Netlify dashboard:
1. Go to **Site settings > Environment variables**
2. Add the same variables as above

---

## **Option 3: Manual Upload (5 minutes)**

### **Step 1: Build Locally**
```bash
npm run build
```

### **Step 2: Upload to Any Host**
- Upload the `out` folder to any web host
- Examples: GitHub Pages, Firebase Hosting, AWS S3, etc.

---

## **🎯 Recommended: Vercel**

**Why Vercel?**
- ✅ **Automatic deployments** from GitHub
- ✅ **Built-in environment variables**
- ✅ **Custom domains** (free)
- ✅ **HTTPS** enabled by default
- ✅ **Global CDN** for fast loading
- ✅ **Zero configuration** needed

**Your app will be live at:**
`https://your-project-name.vercel.app`

---

## **🔧 Quick Fix for Build Issues**

If you get build errors, just comment out the problematic API routes:

1. **Rename the `pages/api` folder** to `pages/api-disabled`
2. **Build again**: `npm run build`
3. **Deploy**: Upload the `out` folder

The app will work without the API routes (file upload won't work, but everything else will).

---

## **🎉 Success!**

Once deployed, your FraudShield SEBI app will be live and accessible worldwide!

**Features that will work:**
- ✅ **All pages** (Dashboard, Live Monitor, File Results, Verify)
- ✅ **Firebase integration** (if configured)
- ✅ **Live market data** (if API key is set)
- ✅ **Responsive design**
- ✅ **Professional UI**

**Next Steps:**
1. **Test the live site**
2. **Configure Firebase** (if not done)
3. **Add your API keys**
4. **Share the URL** with stakeholders

**Happy Deploying!** 🚀
