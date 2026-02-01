# Bulk Upload - Quick Integration Guide

## 🚀 How to Add Bulk Upload Tab to Your App

### Step 1: Import the Component

In your main navigation file (e.g., `App.js` or `Navbar.js`):

```javascript
import BulkUpload from './components/BulkUpload';
import { Upload } from 'lucide-react';
```

### Step 2: Add to Navigation Tabs

```javascript
const tabs = [
  { 
    name: 'Overview', 
    path: '/overview', 
    component: Overview,
    icon: Home 
  },
  { 
    name: 'Analytics', 
    path: '/analytics', 
    component: Analytics,
    icon: BarChart3 
  },
  { 
    name: 'Bulk Upload',     // NEW TAB
    path: '/bulk-upload', 
    component: BulkUpload,
    icon: Upload 
  },
  { 
    name: 'Actions', 
    path: '/actions', 
    component: Actions,
    icon: Zap 
  }
];
```

### Step 3: Add Route (if using React Router)

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/overview" element={<Overview />} />
  <Route path="/analytics" element={<Analytics />} />
  <Route path="/bulk-upload" element={<BulkUpload />} />  {/* NEW ROUTE */}
  <Route path="/actions" element={<Actions />} />
</Routes>
```

### Step 4: Test with Sample Data

Create a test CSV file (`test-products.csv`):

```csv
ASIN,Name,Price,COGS,Velocity,Category
B08TEST1,Wireless Headphones,79.99,25.00,120,Electronics
B08TEST2,Yoga Mat,29.99,12.00,85,Sports
B08TEST3,Coffee Maker,149.99,60.00,45,Home
B08TEST4,Running Shoes,89.99,35.00,95,Sports
B08TEST5,Desk Lamp,39.99,15.00,110,Home
```

---

## 🔧 Optional: Connect to Backend Parser

If you have a backend parser (Phase 1), replace the built-in parser:

### In `BulkUpload.js`, update the `parseUploadFile` function:

```javascript
const parseUploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/bulk-upload/parse', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to parse file on server');
  }
  
  const data = await response.json();
  return data.products; // BulkProductResult[]
};
```

---

## 🎨 Customization Options

### Change Page Size Options

```javascript
<select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
  <option value={10}>10</option>
  <option value={25}>25</option>
  <option value={50}>50</option>
  <option value={100}>100</option>  {/* Add more options */}
</select>
```

### Add More Summary Cards

```javascript
{/* Card 5: Profitable Products */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
    Profitable Products
  </p>
  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
    {parsedProducts.filter(p => p.profitPerUnit > 0).length}
  </p>
</div>
```

### Customize Export Button Colors

```javascript
<button
  onClick={handleExportCSV}
  className="flex items-center justify-center px-6 py-3 
    bg-indigo-600 hover:bg-indigo-700  {/* Change color */}
    text-white font-medium rounded-lg shadow transition-colors"
>
  <Download className="w-5 h-5 mr-2" />
  Download CSV
</button>
```

---

## 📱 Mobile Optimization

The component is already responsive, but you can enhance it:

### Hide columns on mobile

```javascript
<th className="px-4 py-3 text-left hidden md:table-cell">
  {/* This column only shows on medium+ screens */}
  Category
</th>
```

### Stack export buttons on mobile

```javascript
<div className="flex flex-col md:flex-row gap-4">
  <button>Download CSV</button>
  <button>Download PDF</button>
  <button>Download JSON</button>
  <button>Copy Summary</button>
</div>
```

---

## 🧪 Testing Checklist

After integration, test these scenarios:

- [ ] Navigate to Bulk Upload tab
- [ ] Drag-and-drop a CSV file
- [ ] Click to select an Excel file
- [ ] Try uploading an invalid file type (.txt)
- [ ] View preview table (first 5 rows)
- [ ] Check summary metrics are calculated
- [ ] Sort by different columns
- [ ] Change page size
- [ ] Navigate between pages
- [ ] Export to CSV
- [ ] Export to JSON
- [ ] Copy summary to clipboard
- [ ] Clear file and upload new one
- [ ] Test on mobile device
- [ ] Test in dark mode

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'xlsx'"

**Solution:**
```bash
cd client
npm install xlsx
```

### Issue: "Cannot find module 'react-hot-toast'"

**Solution:**
```bash
cd client
npm install react-hot-toast
```

Then add to your `App.js`:
```javascript
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      {/* Your app content */}
    </>
  );
}
```

### Issue: "lucide-react icons not showing"

**Solution:**
```bash
cd client
npm install lucide-react
```

### Issue: Parsing errors with Excel files

**Solution:** Ensure the Excel file has headers in the first row and data starts from row 2.

### Issue: Dark mode not working

**Solution:** Ensure your app has dark mode configured in Tailwind:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ... rest of config
}
```

---

## 📚 Related Documentation

- **Phase 1:** File parsing and calculation logic
- **Phase 2.1:** CSV Export Engine (`/src/utils/exportCSV.ts`)
- **Phase 2.2:** PDF Export Engine (`/src/utils/exportPDF.ts`)
- **Phase 2.3:** Analytics Export Engine (`/src/utils/exportAnalytics.ts`)

---

## ✅ You're All Set!

The Bulk Upload component is ready to use. Simply:

1. Import it
2. Add to navigation
3. Test with sample data
4. Customize as needed

**Happy coding!** 🚀
