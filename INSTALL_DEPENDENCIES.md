# Install Required Dependencies

## PDF Export Dependencies

To enable the PDF export feature, you need to install the following packages:

### Installation Command

```bash
cd client
npm install jspdf jspdf-autotable
```

Or if using yarn:

```bash
cd client
yarn add jspdf jspdf-autotable
```

### Package Details

1. **jspdf** (v2.5.1 or higher)
   - Core PDF generation library
   - Client-side PDF creation
   - No server required

2. **jspdf-autotable** (v3.8.0 or higher)
   - Table generation plugin for jsPDF
   - Professional table formatting
   - Auto-pagination support

### Verification

After installation, verify the packages are installed:

```bash
npm list jspdf jspdf-autotable
```

Expected output:
```
├── jspdf@2.5.1
└── jspdf-autotable@3.8.0
```

### Troubleshooting

If you encounter issues:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check Node version:**
   ```bash
   node --version
   ```
   Requires Node.js 14+ for best compatibility

### Alternative: Manual package.json Update

Add to `client/package.json` dependencies:

```json
{
  "dependencies": {
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.0"
  }
}
```

Then run:
```bash
npm install
```

## All New Features Summary

The following features have been implemented and require the dependencies above:

1. ✅ Product Health Score
2. ✅ Cash Flow Timeline
3. ✅ Benchmark Comparisons
4. ✅ Scenario Calculator
5. ✅ Risk Assessment
6. ✅ Order Quantity Calculator
7. ✅ **PDF Export** (requires jspdf packages)

## Next Steps

After installing dependencies:

1. Restart the development server:
   ```bash
   npm start
   ```

2. Test the PDF export feature:
   - Run a product calculation
   - Click "📄 Export Analysis (PDF)" button
   - Verify PDF downloads correctly

3. Check browser console for any errors

## Browser Compatibility

The PDF export feature works in:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

## File Size Impact

Adding these dependencies will increase bundle size by approximately:
- jspdf: ~200 KB (minified)
- jspdf-autotable: ~50 KB (minified)
- **Total: ~250 KB** added to bundle

This is acceptable for the professional PDF export functionality provided.
