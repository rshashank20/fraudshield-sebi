# Alpha Vantage API Integration - Complete Setup Guide

## 🎯 Overview
Your Alpha Vantage API key (`I6BZS96DFA2H2RPH`) has been successfully integrated into the Regulator Dashboard! The system now provides real-time market data with automatic fallback to simulated data.

## ✅ What's Been Implemented

### 1. **Real-time Market Data**
- **Live stock prices** from Alpha Vantage API
- **Intraday data** (60-minute intervals)
- **Last 24 hours** of price history
- **Automatic caching** (5-minute TTL)

### 2. **Smart Fallback System**
- **Primary**: Real Alpha Vantage data
- **Fallback**: Simulated data if API fails
- **Seamless transition** between modes
- **Visual indicators** showing data source

### 3. **Rate Limiting & Performance**
- **5 calls per minute** (Alpha Vantage free tier limit)
- **Intelligent queuing** to prevent rate limit errors
- **Server-side API routes** to avoid CORS issues
- **Client-side caching** for optimal performance

## 🚀 How to Use

### 1. **Start the Application**
```bash
npm run dev
```

### 2. **Access the Regulator Dashboard**
Navigate to: `http://localhost:3002/regulator`

### 3. **Test Live Data Integration**
1. Click **"Generate Mock Data"** to create sample flags
2. Click on any **ticker symbol** in the KPI cards or live feed
3. Watch the **Correlation Chart** update with real market data
4. Look for the **"Live Data"** badge in the chart header

## 📊 Features

### **Real-time Correlation Analysis**
- **Message Volume** (from fraud detection flags)
- **Stock Price** (from Alpha Vantage API)
- **Dual-axis chart** showing correlation
- **Interactive tooltips** with detailed information

### **API Status Indicators**
- **Green "Live Data"** badge = Real Alpha Vantage data
- **Yellow "Simulated"** badge = Fallback data
- **Automatic switching** based on API availability

### **Smart Data Processing**
- **Time alignment** between message volume and price data
- **Missing data handling** with intelligent interpolation
- **Error recovery** with graceful degradation

## 🔧 Technical Implementation

### **API Route: `/api/market-data`**
```typescript
// GET /api/market-data?ticker=AAPL
// Returns: { ticker, data, apiConfigured, timestamp }

// GET /api/market-data?ticker=AAPL&action=quote
// Returns: { price, change, changePercent }
```

### **Rate Limiting**
```typescript
// Built-in rate limiter
class RateLimiter {
  private maxCalls = 5        // Alpha Vantage free tier
  private windowMs = 60000    // 1 minute window
}
```

### **Caching Strategy**
```typescript
// 5-minute cache for optimal performance
const CACHE_TTL = 5 * 60 * 1000
```

## 📈 Supported Tickers

The system works with any valid stock ticker symbol:
- **US Stocks**: AAPL, GOOGL, MSFT, TSLA, AMZN, META, NVDA, NFLX
- **Crypto**: BTC, ETH (if supported by Alpha Vantage)
- **International**: Any ticker available in Alpha Vantage database

## 🛠️ Configuration

### **Environment Variables**
Your API key is already configured in the system. The integration uses:
```bash
ALPHA_VANTAGE_API_KEY=I6BZS96DFA2H2RPH
```

### **API Endpoints Used**
- **Intraday Data**: `TIME_SERIES_INTRADAY`
- **Interval**: 60 minutes
- **Output Size**: Compact (last 100 data points)

## 🔍 Monitoring & Debugging

### **Console Logs**
The system provides detailed logging:
```bash
# Successful API call
✅ Fetching real-time data for AAPL...
✅ Successfully fetched 24 data points for AAPL

# Rate limiting
⚠️ Rate limit reached. Waiting 45000ms...

# Fallback to simulated data
🔄 Falling back to simulated data: API Error
```

### **Browser Network Tab**
Monitor API calls in the browser:
- **API Route**: `/api/market-data?ticker=AAPL`
- **Response Time**: Usually 1-3 seconds
- **Cache Headers**: 5-minute TTL

## 🚨 Error Handling

### **Common Scenarios**
1. **Rate Limit Exceeded**: Automatic retry with exponential backoff
2. **API Key Invalid**: Falls back to simulated data
3. **Network Error**: Graceful degradation to cached/simulated data
4. **Invalid Ticker**: Returns error message, falls back to simulation

### **Fallback Behavior**
- **Primary**: Alpha Vantage real-time data
- **Secondary**: Cached data (if available)
- **Tertiary**: Simulated data with seeded random walk

## 📊 Data Quality

### **Real-time Accuracy**
- **Market Hours**: Live data during trading hours
- **After Hours**: Last available price
- **Weekends**: Last Friday's closing price
- **Holidays**: Last trading day's data

### **Data Validation**
- **Price Range**: Validates reasonable price ranges
- **Volume Data**: Includes trading volume information
- **Timestamp Alignment**: Ensures proper time series alignment

## 🔄 Updates & Maintenance

### **Automatic Updates**
- **Real-time**: Chart updates when new flags arrive
- **Cached Data**: Refreshes every 5 minutes
- **API Calls**: Only when new ticker is selected

### **Manual Refresh**
- **Page Reload**: Refreshes all data
- **Ticker Selection**: Triggers new API call
- **Mock Data**: Generates fresh sample data

## 🎯 Next Steps

### **Immediate Actions**
1. **Test the Integration**: Generate mock data and select tickers
2. **Monitor Performance**: Check console logs for API calls
3. **Verify Data Quality**: Compare real vs simulated data

### **Future Enhancements**
1. **Additional APIs**: Yahoo Finance, Polygon.io for redundancy
2. **More Intervals**: 15-minute, 1-minute data
3. **Historical Data**: Longer time ranges
4. **Alerts**: Price movement notifications
5. **Portfolio Tracking**: Multiple tickers simultaneously

## 🆘 Troubleshooting

### **No Live Data Showing**
1. Check browser console for errors
2. Verify API key is correct
3. Check rate limit status
4. Try a different ticker symbol

### **Slow Performance**
1. Check network connection
2. Monitor API response times
3. Clear browser cache
4. Check for rate limiting

### **API Errors**
1. Verify Alpha Vantage API key is valid
2. Check API quota usage
3. Try again after rate limit resets
4. Contact Alpha Vantage support if needed

## 📞 Support

### **Alpha Vantage Support**
- **Documentation**: https://www.alphavantage.co/documentation/
- **API Status**: https://www.alphavantage.co/status/
- **Support**: https://www.alphavantage.co/support/

### **System Logs**
Check browser console and server logs for detailed error information.

---

## 🎉 Success!

Your Regulator Dashboard now has **live market data integration**! The system will automatically use real Alpha Vantage data when available and gracefully fall back to simulated data when needed. This provides a robust, production-ready solution for real-time fraud detection and market surveillance.

**Happy monitoring!** 📊🚀
