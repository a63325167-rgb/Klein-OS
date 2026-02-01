# Upload Types - Quick Reference

## 📦 Import

```typescript
import { 
  UploadRow, 
  BulkProductResult, 
  ParseError, 
  ParseResult, 
  RiskLevel 
} from './upload';
```

## 🔄 Data Flow

```
CSV/Excel File
    ↓
[Parser] → ParseResult { rows, errors, warnings }
    ↓
[Calculator] → BulkProductResult[]
    ↓
[UI Components] → Display tables, charts, dashboards
```

## 📝 Quick Examples

### Creating an UploadRow
```typescript
const row: UploadRow = {
  // Required
  rowIndex: 2,
  asin: 'B08XYZ1234',
  name: 'Product Name',
  price: 79.99,
  cogs: 25.00,
  velocity: 45,
  
  // Optional (with defaults)
  returnRate: 5,
  referralFee: 15,
  fbaFee: 8,
  vat: 19,
  shippingCost: 2,
  initialOrder: 90,
  initialCash: 5000,
  competitorCount: 12,
  rating: 4.2,
  category: 'Electronics',
};
```

### Creating a BulkProductResult
```typescript
const result: BulkProductResult = {
  ...uploadRow, // Spread all UploadRow fields
  
  // Add calculated fields
  profitPerUnit: 20.5,
  profitMargin: 25.6,
  totalMonthlyProfit: 922.5,
  breakEvenDays: 10,
  cashRunway: 6,
  turnoverDays: 60,
  healthScore: 78,
  profitabilityRisk: 'green',
  breakEvenRisk: 'green',
  cashFlowRisk: 'yellow',
  competitionRisk: 'yellow',
  inventoryRisk: 'green',
};
```

### Creating a ParseError
```typescript
const error: ParseError = {
  rowIndex: 3,
  field: 'price',
  value: 'invalid',
  error: 'Price must be a number >= €0.01',
  fixable: false,
};
```

### Creating a ParseResult
```typescript
const parseResult: ParseResult = {
  rows: [row1, row2, row3],
  errors: [error1, error2],
  warnings: ['Zero velocity detected on row 5'],
  totalRows: 5,
};
```

## 🎨 Risk Level Colors

```typescript
const riskColors: Record<RiskLevel, string> = {
  'green': '#10b981',  // Healthy
  'yellow': '#f59e0b', // Warning
  'red': '#ef4444',    // Danger
};
```

## 📊 Default Values Reference

| Field | Default Value |
|-------|--------------|
| returnRate | 5% |
| referralFee | 15% |
| fbaFee | 8% |
| vat | 19% |
| shippingCost | €2.00 |
| initialOrder | velocity × 2 |
| initialCash | €5,000 |
| competitorCount | 0 |
| rating | 3.5 |
| category | "Uncategorized" |

## 🔒 Schema Lock

**This schema is FROZEN. No modifications allowed.**

For questions or schema change requests, contact the project lead.
