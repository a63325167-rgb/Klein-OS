# Quick Integration Example

## 🚀 How to Integrate Global State Management

### Step 1: Wrap Your App with ProductsProvider

**Option A: In your main App component**

```javascript
// client/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ✅ Import the ProductsProvider
import { ProductsProvider } from '../src/context/ProductsContext';

// Import your components
import Navbar from './components/Navbar';
import BulkUploadWithContext from './components/BulkUploadWithContext';
import AnalyticsWithContext from './components/AnalyticsWithContext';
import Overview from './components/Overview';
import Actions from './components/Actions';

function App() {
  return (
    // ✅ Wrap everything with ProductsProvider
    <ProductsProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/bulk-upload" element={<BulkUploadWithContext />} />
              <Route path="/analytics" element={<AnalyticsWithContext />} />
              <Route path="/actions" element={<Actions />} />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <Toaster position="top-right" />
        </div>
      </Router>
    </ProductsProvider>
  );
}

export default App;
```

**Option B: In your index.js**

```javascript
// client/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ✅ Import the ProductsProvider
import { ProductsProvider } from '../src/context/ProductsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ Wrap App with ProductsProvider */}
    <ProductsProvider>
      <App />
    </ProductsProvider>
  </React.StrictMode>
);
```

---

### Step 2: Update Your Navigation

**Add Bulk Upload tab to your navigation:**

```javascript
// client/src/components/Navbar.js

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Upload, Zap } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  
  const tabs = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Bulk Upload', path: '/bulk-upload', icon: Upload }, // ✅ NEW TAB
    { name: 'Actions', path: '/actions', icon: Zap }
  ];
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center px-3 py-4 border-b-2 transition-colors
                  ${isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

---

### Step 3: Update Overview Component

**Make Overview read from global state:**

```javascript
// client/src/components/Overview.js

import React from 'react';
import { Package, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { useProducts } from '../../src/context/ProductsContext';

function Overview() {
  // ✅ Read from global state
  const { products, analytics, loading } = useProducts();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Products Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload products in the Bulk Upload tab to get started.
        </p>
        <a
          href="/bulk-upload"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 
            text-white font-medium rounded-lg shadow transition-colors"
        >
          Go to Bulk Upload
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Overview Dashboard
      </h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {products.length}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Profit
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                €{analytics?.summary.totalMonthlyProfit.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Margin
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {analytics?.summary.averageProfitMargin.toFixed(1) || '0.0'}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Health
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {analytics?.summary.averageHealthScore.toFixed(0) || '0'}/100
              </p>
            </div>
            <Activity className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>
      
      {/* Recent Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Products
        </h3>
        <div className="space-y-3">
          {products.slice(0, 5).map((product, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b 
              border-gray-200 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.asin}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600 dark:text-green-400">
                  €{product.profitPerUnit.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {product.profitMargin.toFixed(1)}% margin
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview;
```

---

### Step 4: Test the Integration

**Testing Flow:**

1. **Start your app:**
   ```bash
   cd client
   npm start
   ```

2. **Navigate to Bulk Upload tab**
   - Click "Bulk Upload" in navigation
   - Upload a CSV or Excel file
   - Verify products are parsed and displayed

3. **Switch to Analytics tab**
   - Click "Analytics" in navigation
   - ✅ Verify products are still visible
   - ✅ Verify analytics are calculated
   - ✅ Verify summary cards show correct data

4. **Switch to Overview tab**
   - Click "Overview" in navigation
   - ✅ Verify summary metrics are displayed
   - ✅ Verify recent products list shows data

5. **Clear products**
   - Go back to Bulk Upload tab
   - Click "Clear All" button
   - Switch to Analytics tab
   - ✅ Verify empty state is shown

6. **Upload new file**
   - Upload a different CSV file
   - Switch between tabs
   - ✅ Verify all tabs update with new data

---

## 📋 Complete File Structure

```
project/
├── src/
│   └── context/
│       └── ProductsContext.tsx          ✅ Global state management
│
├── client/
│   └── src/
│       ├── index.js                     ✅ Wrap with ProductsProvider
│       ├── App.js                       ✅ Setup routes
│       │
│       └── components/
│           ├── Navbar.js                ✅ Add Bulk Upload tab
│           ├── BulkUploadWithContext.js ✅ Upload component
│           ├── AnalyticsWithContext.js  ✅ Analytics component
│           ├── Overview.js              ✅ Overview component (updated)
│           └── Actions.js               ✅ Actions component (updated)
│
└── package.json
```

---

## 🎯 Key Points

### ✅ DO:
- Wrap app with `<ProductsProvider>` at the root level
- Use `useProducts()` hook in any component that needs product data
- Call `setProducts()` to update global state
- Call `clearProducts()` to reset state
- Check if `products.length === 0` before rendering data

### ❌ DON'T:
- Don't use `useProducts()` outside of `<ProductsProvider>`
- Don't mutate products array directly (use `setProducts()`)
- Don't forget to handle loading and error states
- Don't store products in local state if using global state

---

## 🐛 Common Issues & Solutions

### Issue 1: "useProducts must be used within a ProductsProvider"

**Solution:** Make sure your component is inside `<ProductsProvider>`:
```javascript
<ProductsProvider>
  <YourComponent />  {/* ✅ Can use useProducts() */}
</ProductsProvider>
```

### Issue 2: Products not persisting between tabs

**Solution:** Verify you're calling `setProducts()` not `setParsedProducts()`:
```javascript
// ❌ Wrong - local state
setParsedProducts(products);

// ✅ Correct - global state
setProducts(products);
```

### Issue 3: Analytics is null

**Solution:** Check if products exist before accessing analytics:
```javascript
if (!products || products.length === 0) {
  return <EmptyState />;
}

// Now safe to use analytics
const totalProfit = analytics?.summary.totalMonthlyProfit || 0;
```

### Issue 4: Import path errors

**Solution:** Adjust import path based on your file structure:
```javascript
// If ProductsContext.tsx is in /src/context/
import { useProducts } from '../../src/context/ProductsContext';

// Or use absolute import (if configured)
import { useProducts } from 'context/ProductsContext';
```

---

## ✅ Checklist

Before going live, verify:

- [ ] ProductsProvider wraps entire app
- [ ] BulkUpload uses `setProducts()` to update global state
- [ ] Analytics reads from `useProducts()` hook
- [ ] Overview reads from `useProducts()` hook
- [ ] Navigation includes Bulk Upload tab
- [ ] Empty states handled in all components
- [ ] Error states handled in all components
- [ ] Loading states handled in all components
- [ ] Products persist when switching tabs
- [ ] Clear button resets all tabs
- [ ] New upload updates all tabs

---

**You're all set! Start by wrapping your app with ProductsProvider and test the data flow.** 🚀
