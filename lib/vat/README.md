# EU VAT Calculator

Professional VAT calculation library for Amazon FBA/FBM sellers operating across the European Union, UK, Switzerland, and Norway.

## Overview

This calculator provides **accurate profitability calculations** by correctly computing VAT obligations for cross-border e-commerce. All calculations meet the ±0.01% accuracy requirement for real-world financial reporting.

## Key Features (Phase 1)

✅ **30 Countries Supported** - All EU27 + UK, Switzerland, Norway  
✅ **Standard Rates Database** - Official rates from EU VAT Directive  
✅ **Time-Sensitive Rates** - Automatic rate changes (Estonia July 2025, Romania August 2025)  
✅ **Gross ↔ Net Conversion** - Extract VAT from customer prices or add VAT to base prices  
✅ **Validation** - Comprehensive input validation with clear error messages  
✅ **European Standards** - 2 decimal places for money, 3 for rates

## Installation

```typescript
import {
  extractNetFromGross,
  calculateVATFromNet,
  getStandardRate,
  COUNTRY_NAMES,
} from './lib/vat';
```

## Quick Start

### Extract Net Price from Gross (Most Common)

When you know what the customer pays (price including VAT):

```typescript
import { extractNetFromGross } from './lib/vat';

// German product: €119 including 19% VAT
const result = extractNetFromGross(119, 0.19);

if (result.success) {
  console.log(result.data.netPrice);   // €100.00
  console.log(result.data.vatAmount);  // €19.00
}
```

### Calculate VAT from Net Price

When you know your base price and need to add VAT:

```typescript
import { calculateVATFromNet } from './lib/vat';

// Base price €100, add 19% German VAT
const result = calculateVATFromNet(100, 0.19);

if (result.success) {
  console.log(result.data.vatAmount);   // €19.00
  console.log(result.data.grossPrice);  // €119.00
}
```

### Country-Specific Calculations

Automatic rate lookup by country code:

```typescript
import { extractNetFromGrossForCountry } from './lib/vat';

// Hungarian product (27% - highest in EU)
const result = extractNetFromGrossForCountry(127, 'HU');

if (result.success) {
  console.log(result.data.netPrice);   // €100.00
  console.log(result.data.vatAmount);  // €27.00
}
```

### Handle Time-Sensitive Rates

Estonia and Romania have scheduled rate changes:

```typescript
import { getStandardRate } from './lib/vat';

// Estonia before July 1, 2025: 22%
const oldRate = getStandardRate('EE', new Date('2025-06-30'));
console.log(oldRate); // 0.22

// Estonia after July 1, 2025: 24%
const newRate = getStandardRate('EE', new Date('2025-07-01'));
console.log(newRate); // 0.24
```

## Understanding EU VAT Rules

### 1. Gross vs Net Pricing

**Gross Price** = Price customer pays (VAT included)  
**Net Price** = Seller's revenue before VAT  
**VAT Amount** = Tax collected for government

Most EU e-commerce shows **gross prices** to customers. The VAT is already included.

### 2. Input VAT Reclaim (Important!)

Sellers can **reclaim VAT** paid on business expenses:

```typescript
// What you paid supplier (including VAT)
const cogsGross = 123.00;

// Extract the net cost (what you actually spent)
const result = extractNetFromGross(cogsGross, 0.19);

// Use result.data.netPrice (€103.36) for profit calculations
// NOT cogsGross (€123) - that overstates costs by 19%!
const netProfit = salePrice - result.data.netPrice - fees;
```

**Common Mistake:** Using gross COGS makes profitable products appear unprofitable by 15-20%.

### 3. Distance Selling Threshold (€10,000)

When selling cross-border within EU:
- **Below €10,000/year** → Use seller's country VAT rate
- **Above €10,000/year** → Use buyer's country VAT rate

This will be implemented in **Phase 4**.

### 4. Pan-EU FBA Requirements

If you store inventory in multiple EU countries via Amazon FBA:
- VAT applies based on **storage country**, not seller's country
- You **must register for VAT** in each storage country
- Even if using OSS (One-Stop-Shop), storage registrations are mandatory

This will be implemented in **Phase 4**.

### 5. B2B Reverse Charge

When selling to a business customer in a different EU country:
- Buyer must have a **valid VAT number**
- Seller charges **0% VAT**
- Buyer pays VAT in their own country
- Invoice must state: "Reverse charge applies"

This will be implemented in **Phase 5**.

## API Reference

### Core Functions

#### `extractNetFromGross(grossPrice, vatRate)`

Extract net price from VAT-inclusive price.

**Parameters:**
- `grossPrice: number` - Price including VAT (what customer pays)
- `vatRate: number` - VAT rate as decimal (0.19 = 19%)

**Returns:** `{ success: true, data: { netPrice, vatAmount, vatRate } }` or error

---

#### `calculateVATFromNet(netPrice, vatRate)`

Calculate VAT from VAT-exclusive price.

**Parameters:**
- `netPrice: number` - Price excluding VAT (base price)
- `vatRate: number` - VAT rate as decimal (0.19 = 19%)

**Returns:** `{ success: true, data: { vatAmount, grossPrice, vatRate } }` or error

---

#### `getStandardRate(country, calculationDate?)`

Get standard VAT rate for a country.

**Parameters:**
- `country: CountryCode` - ISO 3166-1 alpha-2 code ('DE', 'FR', 'UK', etc.)
- `calculationDate?: Date` - Date for calculation (defaults to today)

**Returns:** `number` - VAT rate as decimal

**Throws:** Error if country code unknown

---

### Convenience Functions

#### `extractNetFromGrossForCountry(grossPrice, country, date?)`

Combines rate lookup + extraction in one call.

#### `calculateVATFromNetForCountry(netPrice, country, date?)`

Combines rate lookup + calculation in one call.

#### `getVATRateForCountry(country, date?)`

Safe wrapper that returns `{ success, data/error }` instead of throwing.

## Error Handling

All functions return **error objects** instead of throwing:

```typescript
const result = extractNetFromGross(-100, 0.19);

if (!result.success) {
  console.error(result.error.code);    // 'NEGATIVE_PRICE'
  console.error(result.error.message); // 'Price cannot be negative'
  console.error(result.error.field);   // 'price'
}
```

### Error Codes

- `INVALID_PRICE_TYPE` - Price is not a number
- `NEGATIVE_PRICE` - Price is negative
- `INVALID_RATE_TYPE` - VAT rate is not a number
- `RATE_OUT_OF_RANGE` - VAT rate outside 0-30%
- `UNKNOWN_COUNTRY` - Country code not recognized

## Country Coverage

### EU Member States (27)
Austria (AT), Belgium (BE), Bulgaria (BG), Croatia (HR), Cyprus (CY), Czech Republic (CZ), Denmark (DK), Estonia (EE), Finland (FI), France (FR), Germany (DE), Greece (EL), Hungary (HU), Ireland (IE), Italy (IT), Latvia (LV), Lithuania (LT), Luxembourg (LU), Malta (MT), Netherlands (NL), Poland (PL), Portugal (PT), Romania (RO), Slovakia (SK), Slovenia (SI), Spain (ES), Sweden (SE)

### Non-EU Countries (3)
United Kingdom (UK), Switzerland (CH), Norway (NO)

## Special Cases

### Denmark - No Reduced Rates
Denmark applies **25%** to all products, regardless of category. No reduced rates exist.

### Estonia - Rate Change July 1, 2025
Standard rate increases from **22% → 24%**.

### Romania - Rate Change August 1, 2025
Standard rate increases from **19% → 21%**.

### Hungary - Highest EU Rate
**27%** standard rate (highest in EU).

### Luxembourg - Lowest EU Rate
**17%** standard rate (lowest in EU).

## Coming in Future Phases

**Phase 2:** Category-specific reduced rates (books, food, medicines)  
**Phase 3:** Input VAT reclaim + full profitability calculations  
**Phase 4:** Distance selling threshold + Pan-EU FBA rules  
**Phase 5:** B2B reverse charge + VAT number validation  
**Phase 6:** UI integration + comprehensive testing

## Official References

- [EU VAT Directive 2006/112/EC](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02006L0112-20220701)
- [European Commission - VAT Rates](https://taxation-customs.ec.europa.eu/taxation-1/value-added-tax-vat_en)
- [OSS (One-Stop-Shop) Scheme](https://taxation-customs.ec.europa.eu/business/vat/what-is-vat/oss-and-ioss_en)

## License

This calculator is part of the Klein Amazon Analytics SaaS platform.

---

**Version:** 1.0 (Phase 1 Complete)  
**Last Updated:** October 18, 2025

