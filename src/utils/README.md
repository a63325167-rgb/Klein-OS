# Utils - Bulk Upload System

Complete toolkit for parsing, validating, calculating, and exporting product data from CSV/Excel uploads.

---

## 📦 Quick Start - Complete Workflow

```typescript
import { parseUploadFile } from './uploadParser';
import { exportToCSV } from './exportCSV';
import { exportToPDF } from './exportPDF';
import { generateAnalytics } from './exportAnalytics';

// 1. Parse uploaded file
const file = document.getElementById('fileInput').files[0];
const result = await parseUploadFile(file);

console.log(`✅ ${result.rows.length} products parsed`);
console.log(`❌ ${result.errors.length} errors`);
console.log(`⚠️  ${result.warnings.length} warnings`);

// 2. Export results
exportToCSV(result.rows);              // Download CSV
await exportToPDF(result.rows);        // Download PDF
const analytics = generateAnalytics(result.rows); // Get analytics
```

---

## 📦 Quick Start - File Parser (Phase 1)

```typescript
import { parseUploadFile } from './uploadParser';

// Parse uploaded file
const file = document.getElementById('fileInput').files[0];
const result = await parseUploadFile(file);

console.log(`✅ ${result.rows.length} products parsed`);
console.log(`❌ ${result.errors.length} errors`);
console.log(`⚠️  ${result.warnings.length} warnings`);

// Access calculated data
result.rows.forEach(product => {
  console.log(`${product.name}: €${product.profitPerUnit} profit`);
  console.log(`Health: ${product.healthScore}/100`);
});
```

---

## 📦 Quick Start - Bulk Calculations (Phase 1)

```typescript
import { calculateBulkProducts } from './bulkCalculations';
import { UploadRow } from '../types/upload';

// Prepare input data
const products: UploadRow[] = [
  {
    rowIndex: 2,
    asin: 'B08XYZ123',
    name: 'Wireless Headphones',
    price: 79.99,
    cogs: 25.00,
    velocity: 45,
    returnRate: 5,
    referralFee: 15,
    fbaFee: 8,
    vat: 19,
    shippingCost: 2,
    initialOrder: 90,
    initialCash: 5000,
    competitorCount: 8,
    rating: 4.2,
    category: 'Electronics',
  },
];

// Calculate all metrics
const results = calculateBulkProducts(products);

// Access calculated fields
results.forEach(product => {
  console.log(`Product: ${product.name}`);
  console.log(`Profit: €${product.profitPerUnit}`);
  console.log(`Margin: ${product.profitMargin}%`);
  console.log(`Health: ${product.healthScore}/100`);
  console.log(`Risk: ${product.profitabilityRisk}`);
});
```

## 🧮 Calculated Fields

### Financial Metrics
- `profitPerUnit` - Net profit per unit (EUR)
- `profitMargin` - Profit margin percentage (%)
- `totalMonthlyProfit` - Total monthly profit (EUR/month)

### Timing Metrics
- `breakEvenDays` - Days to recoup initial investment
- `cashRunway` - Months of sustainable operation (0-12)
- `turnoverDays` - Days to sell initial inventory

### Health & Risk
- `healthScore` - Overall health score (0-100)
- `profitabilityRisk` - Profit margin risk level
- `breakEvenRisk` - Break-even speed risk level
- `cashFlowRisk` - Cash sustainability risk level
- `competitionRisk` - Competition level risk
- `inventoryRisk` - Turnover speed risk

## 🎯 Risk Level Thresholds

### Profitability Risk
- 🟢 GREEN: > 20% margin
- 🟡 YELLOW: > 10% margin
- 🔴 RED: ≤ 10% margin

### Break-Even Risk
- 🟢 GREEN: < 14 days
- 🟡 YELLOW: < 30 days
- 🔴 RED: ≥ 30 days

### Cash Flow Risk
- 🟢 GREEN: ≥ 6 months
- 🟡 YELLOW: ≥ 3 months
- 🔴 RED: < 3 months

### Competition Risk
- 🟢 GREEN: ≤ 5 competitors
- 🟡 YELLOW: ≤ 15 competitors
- 🔴 RED: > 15 competitors

### Inventory Risk
- 🟢 GREEN: < 21 days turnover
- 🟡 YELLOW: < 45 days turnover
- 🔴 RED: ≥ 45 days turnover

## 🛡️ Edge Cases

### Zero Velocity
```typescript
const product = {
  velocity: 0,
  // ... other fields
};

const result = calculateBulkProducts([product])[0];

result.breakEvenDays;      // 999 (not Infinity)
result.turnoverDays;       // 999 (not Infinity)
result.totalMonthlyProfit; // 0
```

### Negative Profit
```typescript
const product = {
  price: 10.00,
  cogs: 15.00, // Higher than price!
  // ... other fields
};

const result = calculateBulkProducts([product])[0];

result.profitPerUnit;      // Negative number
result.profitabilityRisk;  // 'red'
result.cashFlowRisk;       // 'red'
```

### Zero Cash
```typescript
const product = {
  initialCash: 0,
  // ... other fields
};

const result = calculateBulkProducts([product])[0];

result.cashRunway;    // 0
result.cashFlowRisk;  // 'red'
```

---

## 📦 Quick Start - Export Utilities (Phase 2)

### CSV Export
```typescript
import { exportToCSV } from './exportCSV';

// Export all products to CSV
exportToCSV(products); // Downloads: products_export_2024-12-03T12-30-00.csv

// Custom filename
exportToCSV(products, 'my_products.csv');
```

### PDF Export
```typescript
import { exportToPDF } from './exportPDF';

// Export professional PDF report
await exportToPDF(products); // Downloads: products_report_2024-12-03T12-30-00.pdf
```

### Analytics
```typescript
import { generateAnalytics } from './exportAnalytics';

const analytics = generateAnalytics(products);
console.log(analytics.summary.totalMonthlyProfit);
console.log(analytics.topPerformers);
console.log(analytics.alerts);
```

### HTML Report
```typescript
import { downloadHTMLReport } from './generateReport';

downloadHTMLReport(products); // Downloads: report_2024-12-03T12-30-00.html
```

### Batch Export
```typescript
import { exportAll } from './batchExport';

// Export all formats simultaneously
const results = await exportAll(products, ['csv', 'pdf', 'json', 'html']);
```

### Data Transformation
```typescript
import { filterProducts, sortByMetric, getCategoryStats } from './dataTransform';

// Filter high-profit products
const profitable = filterProducts(products, { minProfit: 10 });

// Sort by health score
const sorted = sortByMetric(products, 'healthScore', false);

// Get category statistics
const stats = getCategoryStats(products);
```

---

## 🧪 Testing

Run manual verification:
```bash
node src/utils/verifyCalculations.js
```

Run Jest tests (when configured):
```bash
npm test src/utils/bulkCalculations.test.ts
npm test src/utils/uploadParser.test.ts
npm test src/utils/export.test.ts
```

## 📐 Formula Reference

### Profit Per Unit
```
Revenue After Returns = price × (1 - returnRate/100)
Profit = Revenue - COGS - ReferralFee - FBAFee - VAT - ShippingCost
```

### Health Score
Weighted average (0-100):
- Profitability: 25%
- Break-even: 25%
- Cash flow: 25%
- Competition: 15%
- Inventory: 10%

### Cash Runway
Simulates 12-month cash flow:
1. Start with initialCash - initialInventoryCost
2. Each month: Add (profit × velocity), subtract (velocity × 1.2 × COGS)
3. Return month when cash < 0, or 12 if sustainable

## 🔒 Pure Functions

All functions are **pure**:
- Same input always produces same output
- No side effects
- No external dependencies
- Thread-safe

## 📝 Best Practices

1. **Always validate input** before calling
2. **Handle arrays** - function accepts multiple products
3. **Check for finite values** - all outputs are guaranteed finite
4. **Use TypeScript types** - leverage type safety
5. **Read documentation** - JSDoc comments explain all formulas

## 🚀 Performance

- **Speed:** O(n) time complexity
- **Memory:** O(n) space complexity
- **Batch size:** Tested with 100+ products
- **Pure functions:** Easy to parallelize

## 📞 Support

Questions about calculations? See:
- `PHASE_1.2_CALCULATIONS_COMPLETE.md` - Full verification
- `bulkCalculations.ts` - JSDoc comments
- `bulkCalculations.test.ts` - 10 test examples
