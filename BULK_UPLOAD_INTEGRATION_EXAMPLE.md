# 📘 Bulk Upload Preview Table - Integration Example

This guide shows how to integrate the `BulkUploadPreviewTable` component into your Bulk Upload page.

---

## 🎯 Complete Integration Example

### Step 1: Update BulkUploadPage.jsx

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import { parseAndValidateCSV, getInventoryDateInfoMessage } from '../utils/csvParser';
import BulkUploadPreviewTable from '../components/BulkUploadPreviewTable';
import toast from 'react-hot-toast';

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const { bulkProducts, setBulkProducts, clearBulkProducts, setLoading, loading } = useProducts();
  
  const [dragActive, setDragActive] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================

  const handleFileUpload = async (file) => {
    if (!file) return;

    setLoading(true);
    setValidationWarnings([]);

    try {
      // Parse and validate CSV
      const result = await parseAndValidateCSV(file);

      if (result.valid) {
        // Store products in context
        setBulkProducts(result.products);
        
        // Show success message
        toast.success(`✅ Successfully imported ${result.rowCount} products`);

        // Show warnings if any rows failed
        if (result.warnings && result.warnings.length > 0) {
          setValidationWarnings(result.warnings);
          toast.warning(`⚠️ ${result.warnings.length} rows had errors`);
        }
      } else {
        // Show error messages
        toast.error('❌ Failed to parse file');
        setValidationWarnings(result.errors);
      }
    } catch (error) {
      toast.error(`❌ Upload failed: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // ============================================
  // NAVIGATION HANDLERS
  // ============================================

  const handleClear = () => {
    clearBulkProducts();
    setValidationWarnings([]);
    toast.success('Products cleared');
  };

  const handleViewAnalytics = () => {
    navigate('/calculator');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bulk Product Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a CSV or Excel file to analyze multiple products at once
          </p>
        </div>

        {/* Upload Area (only show if no products) */}
        {bulkProducts.length === 0 && (
          <div className="mb-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Drop your file here or click to browse
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Supports CSV, XLSX, XLS files (max 10MB)
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                Select File
              </label>
            </div>

            {/* Info Message */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {getInventoryDateInfoMessage()}
              </p>
            </div>
          </div>
        )}

        {/* Validation Warnings */}
        {validationWarnings.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Validation Warnings ({validationWarnings.length})
                </h4>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  {validationWarnings.slice(0, 5).map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                  {validationWarnings.length > 5 && (
                    <li className="font-semibold">
                      ... and {validationWarnings.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Preview Table */}
        <BulkUploadPreviewTable
          products={bulkProducts}
          onClear={handleClear}
          onViewAnalytics={handleViewAnalytics}
        />

        {/* Instructions (only show if no products) */}
        {bulkProducts.length === 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 CSV File Requirements
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Required Columns:
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <strong>ASIN</strong> - Amazon product identifier (e.g., B00ABCDEF9)</li>
                  <li>• <strong>Cost</strong> - Your purchase cost in EUR</li>
                  <li>• <strong>Selling Price</strong> - Your selling price in EUR</li>
                  <li>• <strong>Quantity</strong> - Number of units in stock</li>
                  <li>• <strong>Categories</strong> - Product categories (semicolon-separated)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Optional Columns:
                </h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• <strong>Inventory Purchase Date</strong> - When you purchased inventory (YYYY-MM-DD)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🎯 Key Integration Points

### 1. Import the Component
```javascript
import BulkUploadPreviewTable from '../components/BulkUploadPreviewTable';
```

### 2. Use ProductsContext
```javascript
const { bulkProducts, setBulkProducts, clearBulkProducts } = useProducts();
```

### 3. Parse CSV and Store
```javascript
const result = await parseAndValidateCSV(file);
if (result.valid) {
  setBulkProducts(result.products);
}
```

### 4. Render the Table
```javascript
<BulkUploadPreviewTable
  products={bulkProducts}
  onClear={handleClear}
  onViewAnalytics={handleViewAnalytics}
/>
```

---

## 🎨 Conditional Rendering

### Show Upload Area When Empty
```javascript
{bulkProducts.length === 0 && (
  <div className="upload-area">
    {/* File upload UI */}
  </div>
)}
```

### Show Table When Products Exist
```javascript
<BulkUploadPreviewTable
  products={bulkProducts}
  onClear={handleClear}
  onViewAnalytics={handleViewAnalytics}
/>
```

The table component handles its own empty state, so it's safe to always render it.

---

## 🔔 Toast Notifications

### Success
```javascript
toast.success(`✅ Successfully imported ${result.rowCount} products`);
```

### Warning
```javascript
toast.warning(`⚠️ ${result.warnings.length} rows had errors`);
```

### Error
```javascript
toast.error('❌ Failed to parse file');
```

---

## ⚠️ Validation Warnings Display

```javascript
{validationWarnings.length > 0 && (
  <div className="warning-box">
    <h4>Validation Warnings ({validationWarnings.length})</h4>
    <ul>
      {validationWarnings.slice(0, 5).map((warning, index) => (
        <li key={index}>• {warning}</li>
      ))}
      {validationWarnings.length > 5 && (
        <li>... and {validationWarnings.length - 5} more</li>
      )}
    </ul>
  </div>
)}
```

---

## 🧪 Testing the Integration

### 1. Test File Upload
```bash
# Create a test CSV file
echo "ASIN,Cost,Selling Price,Quantity,Categories,Inventory Purchase Date
B00EXAMPLE1,15.50,49.99,100,Electronics;Accessories,2024-10-15
B00EXAMPLE2,25.00,79.99,50,Home & Kitchen,2024-11-01" > test.csv

# Upload the file through the UI
```

### 2. Verify Table Display
- ✅ Table shows 2 products
- ✅ Net Profit calculated correctly
- ✅ Margin % displayed
- ✅ Days in Stock calculated

### 3. Test Sorting
- Click "Net Profit" header
- Verify products sort by profit

### 4. Test Clear
- Click "Clear Products"
- Confirm in modal
- Verify table shows empty state

### 5. Test Navigation
- Click "View Full Analytics"
- Verify navigation to /calculator
- Verify products still in context

---

## 📊 Complete Data Flow

```
User selects CSV file
    ↓
handleFileUpload(file)
    ↓
parseAndValidateCSV(file)
    ↓
result.valid === true
    ↓
setBulkProducts(result.products)
    ↓
ProductsContext updates bulkProducts
    ↓
BulkUploadPreviewTable re-renders
    ↓
Table displays products with calculations
    ↓
User clicks "View Full Analytics"
    ↓
handleViewAnalytics()
    ↓
navigate('/calculator')
    ↓
Products available via useProducts() ✅
```

---

## ✅ Integration Checklist

- [ ] Import BulkUploadPreviewTable component
- [ ] Import useProducts hook
- [ ] Import parseAndValidateCSV function
- [ ] Add file upload UI
- [ ] Add handleFileUpload function
- [ ] Add handleClear function
- [ ] Add handleViewAnalytics function
- [ ] Render BulkUploadPreviewTable
- [ ] Pass products prop
- [ ] Pass onClear prop
- [ ] Pass onViewAnalytics prop
- [ ] Add validation warnings display
- [ ] Add toast notifications
- [ ] Test file upload
- [ ] Test table display
- [ ] Test sorting
- [ ] Test clear action
- [ ] Test navigation

---

**The integration is straightforward and follows React best practices!** 🚀
