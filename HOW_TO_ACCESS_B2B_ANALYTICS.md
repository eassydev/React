# How to Access B2B Analytics

## 🎯 Quick Access Guide

There are **3 ways** to access the B2B Analytics system:

---

## ✅ **Method 1: Sidebar Navigation (Recommended)**

### **Step 1: Open the Admin Panel**
1. Login to your admin panel
2. You'll see the sidebar on the left

### **Step 2: Navigate to B2B Management**
1. Look for **"B2B Management"** in the sidebar (has a Building icon 🏢)
2. Click on it to expand the menu

### **Step 3: Click on Analytics Dashboard**
1. You'll see **"Analytics Dashboard"** as the **FIRST option** in the dropdown
2. Click on it

**✅ You're now on the B2B Analytics Dashboard!**

**URL:** `/admin/b2b/analytics`

---

## ✅ **Method 2: From Customer List Page**

### **Step 1: Go to Customers Page**
1. In the sidebar, expand **"B2B Management"**
2. Click on **"Customers"**

### **Step 2: Click Analytics Icon**
1. In the customer table, each row has action buttons
2. Look for the **blue chart icon** (📊 BarChart3)
3. Click it to view analytics for that specific customer

**✅ You're now on the Customer Analytics Page!**

**URL:** `/admin/b2b/customers/{customer_id}/analytics`

---

## ✅ **Method 3: Direct URL**

### **Dashboard:**
```
http://localhost:3000/admin/b2b/analytics
```

### **Customer Analytics:**
```
http://localhost:3000/admin/b2b/customers/{CUSTOMER_ID}/analytics
```

Replace `{CUSTOMER_ID}` with the encrypted customer ID from your database.

---

## 📍 Navigation Flow

```
Admin Panel
    ↓
Sidebar → B2B Management (expand)
    ↓
Analytics Dashboard ← Click here for overall dashboard
    OR
Customers → Click chart icon (📊) ← Click here for specific customer
```

---

## 🎨 Visual Guide

### **Sidebar Menu Structure:**

```
📊 Analytics
   ├─ Dashboard
   └─ Detailed Reports

🏢 B2B Management
   ├─ 📊 Analytics Dashboard  ← NEW! Click here
   ├─ Customers
   ├─ Contact Management
   ├─ SPOC Management
   ├─ Orders
   ├─ Quotations
   ├─ Invoices
   ├─ SP Invoices
   ├─ Payment Reminders
   ├─ Service Attachments
   └─ File Lifecycle
```

---

## 🔍 What You'll See

### **On Dashboard Page:**
- **7 Metric Cards:**
  - Total Customers
  - Total Revenue
  - Total Profit
  - Orders Received
  - Outstanding Orders
  - Completed Orders
  - Overdue Payments (with alert if any)

- **Payment Collection Chart:**
  - Pie chart showing Paid/Pending/Overdue/Partial

- **Top Customers Tables:**
  - Top 10 by Revenue
  - Top 10 by Profit
  - Top 10 by Order Count
  - Click any row to view customer analytics

- **Date Range Filter:**
  - Select start and end dates
  - Click "Apply" to filter
  - Click "Clear" to reset

---

### **On Customer Analytics Page:**
- **Customer Info Card:**
  - Company name, contact person, email, phone
  - Credit limit, credit days, status

- **Core Metrics (4 cards):**
  - Orders Received
  - Orders Completed
  - Revenue Generated
  - Profit Generated

- **Financial Health (4 cards):**
  - Average Order Value
  - Outstanding Invoice Amount
  - Profit Margin %
  - Outstanding Orders

- **Relationship Metrics (4 cards):**
  - Customer Tenure
  - Last Order Date
  - Total Lifetime Orders
  - Payment Collection Status

- **Operational Metrics (4 cards):**
  - Order Frequency
  - Avg Fulfillment Time
  - Cancellation Rate
  - Top Service Category

- **Service Mix Cards:**
  - By Category (top 5)
  - By Subcategory (top 5)

- **Performance Trends Chart:**
  - 3 tabs: Revenue & Profit, Orders, Performance
  - Monthly data for last 12 months
  - Interactive line chart

- **Trends Summary (4 cards):**
  - Total Revenue (period)
  - Total Profit (period)
  - Avg Monthly Revenue
  - Revenue Growth Rate

---

## 🎯 Quick Actions

### **From Dashboard:**
1. **View overall business metrics** - Scroll through metric cards
2. **Check payment status** - Look at pie chart
3. **Find top customers** - Check the 3 tables
4. **Navigate to customer** - Click any row in top customers tables
5. **Filter by date** - Use date range picker

### **From Customer Analytics:**
1. **View customer profile** - Top card
2. **Check financial health** - Financial metrics section
3. **Analyze trends** - Scroll to trends chart
4. **Switch chart views** - Click tabs (Revenue/Orders/Performance)
5. **Go back** - Click "← Back to Customers" button
6. **Filter by date** - Use date range picker

---

## 🔐 Permissions

**Who can access:**
- ✅ Super Admin - Full access to all customers
- ✅ Manager - Access to all customers
- ✅ SPOC - Access to assigned customers only

**Authentication:**
- Must be logged in with valid admin token
- Token stored in localStorage as 'token'
- Passed as 'admin-auth-token' header

---

## 🐛 Troubleshooting

### **Problem: Can't see "Analytics Dashboard" in sidebar**
**Solution:**
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache
- Make sure you're on the latest code

### **Problem: "Analytics Dashboard" link doesn't work**
**Solution:**
- Check if backend is running on port 5001
- Check browser console for errors
- Verify you're logged in

### **Problem: Can't see chart icon (📊) in customer list**
**Solution:**
- Refresh the page
- Check if you have customers in the list
- Look for the blue chart icon next to View/Edit icons

### **Problem: Page shows "No data available"**
**Solution:**
- Check if you have B2B orders in the database
- Verify backend is running
- Check browser console for API errors

---

## 📱 Mobile Access

The analytics pages are **fully responsive**!

**On mobile:**
- Sidebar becomes a hamburger menu (☰)
- Metric cards stack vertically
- Charts resize to fit screen
- Tables scroll horizontally if needed

---

## 💡 Pro Tips

1. **Bookmark the dashboard** for quick access
2. **Use date filters** to analyze specific periods
3. **Click on top customers** to drill down into details
4. **Switch chart tabs** to see different metrics
5. **Use the back button** to return to customer list

---

## 🎉 You're All Set!

**Now you can:**
- ✅ Access B2B Analytics Dashboard from sidebar
- ✅ View customer analytics from customer list
- ✅ Navigate between pages easily
- ✅ Filter data by date range
- ✅ Analyze business performance

**Happy analyzing! 📊🚀**

