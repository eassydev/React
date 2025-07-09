# Rate Card Advanced Filters - Testing Guide

## 🧪 Frontend Filter UI Testing

### **Test Scenarios**

#### **1. Filter Panel Functionality**
- [ ] **Toggle Filter Panel**: Click "Advanced Filters" button to show/hide filters
- [ ] **Filter Count Badge**: Verify badge shows correct number of active filters
- [ ] **Clear All Filters**: Test "Clear All Filters" button removes all active filters
- [ ] **Responsive Design**: Test filters on mobile, tablet, and desktop

#### **2. Individual Filter Testing**

##### **Category Filter**
- [ ] **Load Options**: Verify categories load from API
- [ ] **Select Category**: Choose a category and verify subcategories update
- [ ] **Clear Category**: Verify subcategory resets when category is cleared
- [ ] **Filter Results**: Verify rate cards filter by selected category

##### **Subcategory Filter**
- [ ] **Dependent Loading**: Verify subcategories load based on selected category
- [ ] **Disabled State**: Verify disabled when no category selected
- [ ] **Filter Results**: Verify rate cards filter by selected subcategory

##### **Provider Filter**
- [ ] **Load Options**: Verify providers load from API
- [ ] **Select Provider**: Choose provider and verify filtering
- [ ] **Display Name**: Verify company name or first name displays correctly

##### **Segment Filter**
- [ ] **Load Options**: Verify segments load from API
- [ ] **Select Segment**: Choose segment and verify filtering
- [ ] **Filter Results**: Verify rate cards filter by selected segment

##### **Price Range Filter**
- [ ] **Min Price**: Enter minimum price and verify filtering
- [ ] **Max Price**: Enter maximum price and verify filtering
- [ ] **Range Validation**: Test invalid ranges (min > max)
- [ ] **Numeric Input**: Verify only numbers accepted

##### **Special Filters**
- [ ] **Recommended Filter**: Test "Recommended Only" and "Not Recommended"
- [ ] **Best Deal Filter**: Test "Best Deals Only" and "Regular Deals"
- [ ] **Combined Filters**: Test multiple special filters together

#### **3. Search Integration**
- [ ] **Search + Filters**: Verify search works with active filters
- [ ] **Search Priority**: Verify search results prioritize rate card names
- [ ] **Debounced Search**: Verify 500ms delay before API call
- [ ] **Clear Search**: Verify search can be cleared independently

#### **4. Filter Chips**
- [ ] **Display Active Filters**: Verify chips show for each active filter
- [ ] **Color Coding**: Verify different colors for different filter types
- [ ] **Remove Individual**: Test X button removes individual filters
- [ ] **Filter Names**: Verify correct names display in chips

#### **5. Performance Testing**
- [ ] **API Calls**: Verify minimal API calls (debounced)
- [ ] **Loading States**: Verify loading indicators during filter option fetch
- [ ] **Error Handling**: Test behavior when filter options fail to load
- [ ] **Large Datasets**: Test with many filter options

#### **6. Data Integration**
- [ ] **Filter Persistence**: Verify filters persist during pagination
- [ ] **URL Parameters**: Test if filters could be bookmarkable (future enhancement)
- [ ] **Export with Filters**: Verify export respects active filters
- [ ] **Pagination Reset**: Verify pagination resets to page 1 when filters change

### **Expected UI Behavior**

#### **Filter Panel States**
```
Collapsed: [Advanced Filters (2)] [Clear All Filters]
Expanded: Full filter grid with all options visible
```

#### **Filter Chips Display**
```
[Search: "cleaning" ×] [Category: Home Services ×] [Price: 100 - 500 ×]
```

#### **Loading States**
```
Filter dropdowns show "Loading..." when fetching options
Disabled state when dependent filters not selected
```

### **API Integration Points**

#### **Filter Options Endpoint**
```
GET /rate-card/filter-options
Response: {
  categories: [{ id, name }],
  subcategories: [{ id, name, category_id }],
  providers: [{ id, name }],
  segments: [{ id, name }]
}
```

#### **Rate Cards with Filters**
```
GET /rate-card?category_id=X&min_price=100&search=cleaning
All filter parameters properly encoded and sent
```

### **Browser Compatibility**
- [ ] **Chrome**: Latest version
- [ ] **Firefox**: Latest version  
- [ ] **Safari**: Latest version
- [ ] **Edge**: Latest version
- [ ] **Mobile Safari**: iOS latest
- [ ] **Chrome Mobile**: Android latest

### **Accessibility Testing**
- [ ] **Keyboard Navigation**: Tab through all filter controls
- [ ] **Screen Reader**: Test with screen reader software
- [ ] **Focus Indicators**: Verify visible focus states
- [ ] **ARIA Labels**: Verify proper labeling for filters

### **Error Scenarios**
- [ ] **Network Failure**: Test behavior when API calls fail
- [ ] **Invalid Data**: Test with malformed filter option responses
- [ ] **Empty Results**: Test when no rate cards match filters
- [ ] **Server Errors**: Test 500 error handling

### **Performance Benchmarks**
- [ ] **Filter Load Time**: < 500ms for filter options
- [ ] **Search Response**: < 300ms for filtered results
- [ ] **UI Responsiveness**: No blocking during filter operations
- [ ] **Memory Usage**: No memory leaks during filter operations

### **Success Criteria**
✅ **All filters work independently and in combination**
✅ **UI is responsive and intuitive**
✅ **Performance meets benchmarks**
✅ **Error handling is graceful**
✅ **Accessibility standards met**
✅ **Cross-browser compatibility confirmed**

### **Known Limitations**
- Attribute-specific filtering not yet implemented (Phase 4)
- URL parameter persistence not implemented (future enhancement)
- Bulk filter operations not available (future enhancement)

### **Next Steps After Testing**
1. Fix any identified issues
2. Implement Phase 4: Enhanced Display Columns
3. Add advanced features like filter presets
4. Implement URL parameter persistence
