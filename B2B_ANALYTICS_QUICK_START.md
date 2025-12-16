# B2B Analytics - Quick Start Guide

## 🚀 Getting Started

### **Prerequisites:**
- ✅ Backend server running on port 5001
- ✅ Frontend dev server ready to start
- ✅ Valid admin authentication token

---

## 📋 Step-by-Step Setup

### **Step 1: Start the Backend**
```bash
cd BackendNew
npm start
# OR
pm2 start ecosystem.config.js
```

**Verify backend is running:**
- Open: http://localhost:5001/admin-api/health
- Should return: `{"status": "ok"}`

---

### **Step 2: Start the Frontend**
```bash
cd React
npm run dev
```

**Frontend should start on:**
- http://localhost:3000

---

### **Step 3: Login to Admin Panel**
1. Navigate to: http://localhost:3000/auth/login
2. Login with your admin credentials
3. Token will be stored in localStorage

---

### **Step 4: Access B2B Analytics**

#### **Option 1: Dashboard**
Navigate to: **http://localhost:3000/admin/b2b/analytics**

**What you'll see:**
- Total customers, revenue, profit
- Outstanding orders
- Payment collection chart
- Top 10 customers tables

#### **Option 2: Customer Analytics**
Navigate to: **http://localhost:3000/admin/b2b/customers/{CUSTOMER_ID}/analytics**

**Replace `{CUSTOMER_ID}` with an actual encrypted customer ID from your database**

**What you'll see:**
- Customer profile
- Core metrics
- Operational metrics
- Service mix
- Monthly trends chart

---

## 🧪 Testing the Features

### **Test 1: Dashboard Loading**
1. Go to `/admin/b2b/analytics`
2. ✅ Should show loading spinner
3. ✅ Should load all metrics
4. ✅ Should display charts and tables

### **Test 2: Date Range Filtering**
1. On dashboard, click date range picker
2. Select start date and end date
3. Click "Apply"
4. ✅ Metrics should update based on date range
5. Click "Clear"
6. ✅ Should reset to all-time data

### **Test 3: Customer Navigation**
1. On dashboard, scroll to "Top Customers" tables
2. Click on any customer row
3. ✅ Should navigate to customer analytics page
4. ✅ Should show customer-specific data

### **Test 4: Trends Chart**
1. On customer analytics page
2. Scroll to "Performance Trends" section
3. ✅ Should show line chart with data
4. Click on different tabs (Revenue & Profit, Orders, Performance)
5. ✅ Chart should switch views

### **Test 5: Operational Metrics**
1. On customer analytics page
2. Find "Operational Metrics" section
3. ✅ Should show:
   - Order frequency
   - Avg fulfillment time
   - Cancellation rate
   - Top service category

### **Test 6: Service Mix**
1. On customer analytics page
2. Find "Service Mix" cards
3. ✅ Should show category breakdown
4. ✅ Should show subcategory breakdown

---

## 🔍 Troubleshooting

### **Problem: Dashboard shows "No data available"**
**Solution:**
- Check if backend is running
- Check browser console for errors
- Verify token in localStorage: `localStorage.getItem('token')`
- Check backend logs for authentication errors

### **Problem: "Authentication required" error**
**Solution:**
- Login again to get fresh token
- Check if token is expired
- Verify backend authentication middleware

### **Problem: Charts not rendering**
**Solution:**
- Check browser console for errors
- Verify Recharts is installed: `npm list recharts`
- Check if data structure matches expected format

### **Problem: Customer analytics page shows 404**
**Solution:**
- Verify customer ID is encrypted (not numeric)
- Check if customer exists in database
- Verify SPOC permissions (if applicable)

### **Problem: Date range filter not working**
**Solution:**
- Check if dates are selected properly
- Verify date format (YYYY-MM-DD)
- Check backend logs for date parsing errors

---

## 🛠️ Development Tips

### **Check API Responses:**
Open browser DevTools → Network tab → Filter by "XHR"
- Look for requests to `/b2b/analytics/dashboard`
- Look for requests to `/b2b/customers/{id}/analytics`
- Look for requests to `/b2b/customers/{id}/trends`

### **Check Console Logs:**
Open browser DevTools → Console tab
- Look for error messages
- Check API call logs
- Verify data structures

### **Inspect State:**
Add temporary console.logs in components:
```tsx
console.log('Dashboard data:', data);
console.log('Analytics data:', analyticsData);
console.log('Trends data:', trendsData);
```

---

## 📊 Sample Data Check

### **Verify Backend Data:**
Use Thunder Client or Postman to test APIs directly:

**Test Dashboard API:**
```
GET http://localhost:5001/admin-api/b2b/analytics/dashboard
Headers:
  admin-auth-token: YOUR_TOKEN
```

**Test Customer Analytics API:**
```
GET http://localhost:5001/admin-api/b2b/customers/CUSTOMER_ID/analytics
Headers:
  admin-auth-token: YOUR_TOKEN
```

**Test Trends API:**
```
GET http://localhost:5001/admin-api/b2b/customers/CUSTOMER_ID/trends?months=12
Headers:
  admin-auth-token: YOUR_TOKEN
```

---

## 🎨 Customization

### **Change Colors:**
Edit component files:
- `B2BPaymentCollectionChart.tsx` - Line 18-23 (COLORS object)
- `B2BTrendsChart.tsx` - Line 118-130 (stroke colors)

### **Change Chart Height:**
Edit component files:
- `B2BPaymentCollectionChart.tsx` - Line 91 (height={300})
- `B2BTrendsChart.tsx` - Line 107 (height={350})

### **Change Number of Top Customers:**
Edit `B2BTopCustomersTable.tsx`:
- Backend returns top 10 by default
- To show more/less, modify backend query

### **Change Trends Period:**
Edit `CustomerAnalyticsPage`:
- Line 77: Change `months=12` to desired value
- Or add a dropdown to let users select

---

## 📱 Mobile Testing

### **Test Responsive Design:**
1. Open DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Select different devices:
   - iPhone 12 Pro
   - iPad
   - Desktop
3. ✅ Verify layouts adapt properly
4. ✅ Check charts are readable
5. ✅ Verify tables scroll horizontally if needed

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Test all features with real data
- [ ] Verify SPOC permissions work correctly
- [ ] Test with different user roles
- [ ] Check performance with large datasets
- [ ] Verify date range filtering edge cases
- [ ] Test error handling (network failures, invalid data)
- [ ] Check mobile responsiveness
- [ ] Verify all charts render correctly
- [ ] Test navigation flows
- [ ] Check loading states
- [ ] Verify toast notifications
- [ ] Test with expired tokens
- [ ] Check browser compatibility (Chrome, Firefox, Safari)

---

## 🎯 Quick Links

**Frontend Pages:**
- Dashboard: http://localhost:3000/admin/b2b/analytics
- Customer Analytics: http://localhost:3000/admin/b2b/customers/{id}/analytics

**Backend APIs:**
- Dashboard: http://localhost:5001/admin-api/b2b/analytics/dashboard
- Customer Analytics: http://localhost:5001/admin-api/b2b/customers/{id}/analytics
- Customer Trends: http://localhost:5001/admin-api/b2b/customers/{id}/trends

**Documentation:**
- Backend API Docs: `BackendNew/docs/B2B_CUSTOMER_ANALYTICS_API.md`
- Frontend Implementation: `React/B2B_ANALYTICS_FRONTEND_IMPLEMENTATION.md`
- Testing Guide: `BackendNew/docs/B2B_ANALYTICS_TESTING_GUIDE.md`

---

## 💡 Pro Tips

1. **Use React DevTools** to inspect component state
2. **Use Redux DevTools** if you add state management later
3. **Enable source maps** for easier debugging
4. **Use TypeScript strict mode** for better type safety
5. **Add unit tests** for critical components
6. **Use React Query** for better data fetching (optional enhancement)

---

**Ready to test! Start the servers and explore the analytics! 🚀**

