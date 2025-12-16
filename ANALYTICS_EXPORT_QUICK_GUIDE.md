# Analytics Export - Quick User Guide 🚀

## 📍 **Where to Find It**

**URL:** `http://localhost:3000/admin/b2b/daily-operations`

**Location:** Scroll down to the **"Download Analytics Reports"** section

---

## 🆕 **What's New?**

### **Before:**
- ✅ Click button → Download immediately
- ❌ No date filtering
- ❌ No customization options

### **After:**
- ✅ Click button → **Filter dialog opens**
- ✅ **Optional date filtering**
- ✅ **Choose filter type** (Service Date vs Booking Received Date)
- ✅ **Preview filters** before download
- ✅ Download with custom filters

---

## 📥 **How to Download Analytics**

### **Option 1: Download All Data (No Filters)**

1. Click any export button (e.g., "Customer-wise")
2. In the dialog, click **"Download Excel"** directly
3. ✅ Downloads all data

### **Option 2: Download with Date Filters**

1. Click any export button
2. **Select filter type:**
   - **Booking Received Date** - When order was created
   - **Service Date** - When service is scheduled
3. **Set date range** (optional):
   - From Date: `2025-01-01`
   - To Date: `2025-12-31`
4. **Preview** your filters
5. Click **"Download Excel"**
6. ✅ Downloads filtered data

---

## 🎯 **Filter Examples**

### **Example 1: Q1 2025 Orders**
```
Filter Type: Booking Received Date
From: 2025-01-01
To: 2025-03-31
```
**Result:** All orders received in Q1 2025

---

### **Example 2: Services Scheduled This Month**
```
Filter Type: Service Date
From: 2025-11-01
To: 2025-11-30
```
**Result:** All services scheduled for November 2025

---

### **Example 3: All Orders Since June**
```
Filter Type: Booking Received Date
From: 2025-06-01
To: (leave blank)
```
**Result:** All orders from June 2025 onwards

---

### **Example 4: All Orders Up To March**
```
Filter Type: Service Date
From: (leave blank)
To: 2025-03-31
```
**Result:** All services scheduled up to March 31, 2025

---

## 📊 **Available Exports**

### **1. Customer-wise Analytics** 👥
**What you get:**
- Customer name, contact, email, phone
- Total orders, completed orders, pending orders
- Revenue, profit, collections, outstanding

**Who can download:** All roles (SPOCs see assigned customers only)

---

### **2. SPOC-wise Analytics** 👨‍💼
**What you get:**
- SPOC name and contact
- Assigned customers count
- Orders handled, revenue generated

**Who can download:** Super Admin & Manager only

---

### **3. SP-wise Analytics** 🔧
**What you get:**
- Service provider details
- Orders completed, revenue
- Performance metrics

**Who can download:** All roles

---

### **4. Business Trends** 📈
**What you get:**
- Last 90 days daily breakdown
- Orders, revenue, profit trends

**Who can download:** Super Admin & Manager only

---

## 🎨 **Filter Dialog Preview**

```
┌─────────────────────────────────────────────────┐
│  🔍 Export Filters                              │
│  Apply optional date filters to your export    │
├─────────────────────────────────────────────────┤
│                                                 │
│  Date Filter Type:                              │
│  ┌─────────────────────────────────────────┐   │
│  │ Booking Received Date            ▼     │   │
│  └─────────────────────────────────────────┘   │
│  Filter by when the order was received/created  │
│                                                 │
│  From Date (Optional):                          │
│  ┌─────────────────────────────────────────┐   │
│  │ 2025-01-01                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  To Date (Optional):                            │
│  ┌─────────────────────────────────────────┐   │
│  │ 2025-12-31                              │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 💡 Filter Preview:                      │   │
│  │ Exporting data from 2025-01-01 to       │   │
│  │ 2025-12-31 based on booking received    │   │
│  │ date                                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│              [Cancel]  [📥 Download Excel]      │
└─────────────────────────────────────────────────┘
```

---

## 💡 **Tips & Tricks**

### **Tip 1: Leave Dates Blank for All Data**
Don't need filters? Just click "Download Excel" without setting dates.

### **Tip 2: Use Booking Received Date for Business Reports**
For monthly/quarterly business reports, use "Booking Received Date" to see when orders came in.

### **Tip 3: Use Service Date for Operations**
For operational planning, use "Service Date" to see what's scheduled.

### **Tip 4: Preview Before Download**
Always check the filter preview to ensure you're downloading the right data.

### **Tip 5: One Date is Enough**
You can set just "From" or just "To" date - both are optional!

---

## ❓ **FAQ**

### **Q: What happens if I don't set any dates?**
**A:** You'll download all data (no filtering applied).

### **Q: Can I filter by month?**
**A:** Yes! Set From: 2025-11-01 and To: 2025-11-30 for November 2025.

### **Q: What's the difference between filter types?**
**A:** 
- **Booking Received Date** = When customer placed the order
- **Service Date** = When service is scheduled to happen

### **Q: Can I cancel after opening the dialog?**
**A:** Yes! Click "Cancel" or close the dialog. Your filters won't be saved.

### **Q: Do filters work for all export types?**
**A:** Yes! All four export types support date filtering.

---

## 🚀 **Quick Start**

1. **Login** to admin panel
2. **Navigate** to B2B → Daily Operations
3. **Scroll** to "Download Analytics Reports"
4. **Click** any export button
5. **Set filters** (optional)
6. **Download** Excel file

**That's it!** 🎉

---

## 📞 **Need Help?**

If you encounter any issues:
- Check that dates are in correct format (YYYY-MM-DD)
- Ensure "From" date is before "To" date
- Verify you have required permissions
- Check browser console for errors

---

**Enjoy your enhanced analytics exports!** ✨

