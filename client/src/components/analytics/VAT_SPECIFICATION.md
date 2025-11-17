text
# EU VAT Calculator - Complete Technical Specification
**Project:** Amazon E-Commerce Analytics SaaS  
**Version:** 1.0  
**Last Updated:** October 18, 2025  
**Author:** Business Logic Owner

---

## 1. BUSINESS CONTEXT

This VAT calculator serves Amazon FBA/FBM sellers operating across the European Union, UK, Switzerland, and Norway. It must provide accurate profitability calculations by correctly computing VAT obligations based on:

- Seller location
- Buyer location  
- Product storage location (for FBA)
- Product category (standard vs reduced rates)
- Transaction type (B2C vs B2B)
- Distance selling thresholds
- Pan-EU FBA requirements

**Critical Requirement:** All calculations must be accurate to ±0.01% of real-world VAT charges. Incorrect VAT calculations directly impact profit margins by 5-20%.

---

## 2. VAT CALCULATION METHODOLOGY

### 2.1 Core Formula (B2C Sales)

**When price INCLUDES VAT (Gross Price):**
Net Price = Gross Price ÷ (1 + VAT Rate)
VAT Amount = Gross Price - Net Price

text

**Example:**
- Gross Price: €119.00 (customer pays this)
- VAT Rate: 19% (Germany standard)
- Net Price: €119 ÷ 1.19 = €100.00
- VAT Amount: €119 - €100 = €19.00

**When price EXCLUDES VAT (Net Price):**
VAT Amount = Net Price × VAT Rate
Gross Price = Net Price + VAT Amount

text

**Example:**
- Net Price: €100.00 (seller's base price)
- VAT Rate: 19%
- VAT Amount: €100 × 0.19 = €19.00
- Gross Price: €100 + €19 = €119.00

### 2.2 Input VAT Reclaim (Cost of Goods Sold)

**Critical:** Sellers can reclaim VAT paid on business expenses (COGS, shipping, etc.)

COGS Gross = €123.00 (what seller paid supplier, including VAT)
COGS Net = €123 ÷ 1.19 = €103.36
Input VAT (reclaimable) = €123 - €103.36 = €19.64

Sale Price Net = €100.00
Output VAT (collected from customer) = €19.00

Net VAT Liability = Output VAT - Input VAT
= €19.00 - €19.64
= -€0.64 (seller receives refund)

text

**For Profitability Calculation:**
True Cost = COGS Net (not COGS Gross)
Net Profit = Sale Price Net - COGS Net - Amazon Fees Net - Other Costs Net

text

**Common Mistake:** Using COGS Gross overstates costs by 15-20%, making profitable products appear unprofitable.

### 2.3 B2B Reverse Charge (Cross-Border)

**When:** EU seller sells to EU buyer in different country, buyer has valid VAT number

VAT Rate = 0% (seller charges no VAT)
Invoice shows: "Reverse charge applies - buyer accounts for VAT"
Buyer pays VAT in their own country

text

**Validation Required:**
- Buyer VAT number must be valid (check format + VIES database)
- Buyer must be in different EU country than seller
- Domestic B2B sales (same country) DO charge VAT normally

### 2.4 Distance Selling Threshold (€10,000)

**When:** Seller sells cross-border within EU (B2C)

**Rule:**
- If annual cross-border sales < €10,000 → Use seller's country VAT rate
- If annual cross-border sales ≥ €10,000 → Use buyer's country VAT rate
- Threshold is cumulative across ALL EU countries
- Does NOT apply to B2B sales

**Example:**
German seller, Books, sold to French buyer
Annual cross-border sales: €8,500

Result: Apply German VAT (7% for books)
Reason: Below €10K threshold

Same seller, next month, total cross-border now €11,200

Result: Apply French VAT (5.5% for books)
Reason: Exceeded €10K threshold, use destination country

text

### 2.5 Pan-EU FBA Logic

**When:** Seller uses Amazon's Pan-European FBA (inventory stored in multiple countries)

**Rule:** VAT is charged based on STORAGE COUNTRY, not seller's country

German seller stores inventory in:

Germany (DE)

Poland (PL)

France (FR)

Sale 1: Item stored in PL, sold to Polish buyer
→ Apply Polish VAT (25%)
→ This is a LOCAL sale in Poland

Sale 2: Item stored in FR, sold to Italian buyer
→ Apply Italian VAT (22%)
→ This is a distance sale (FR → IT)

Sale 3: Item stored in DE, sold to Belgian buyer
→ Apply Belgian VAT (21%)
→ This is a distance sale (DE → BE)

text

**VAT Registration Requirement:**
Seller MUST have VAT registration in:
- Poland (for PL storage)
- France (for FR storage)
- Germany (for DE storage)

Even if using OSS (One-Stop-Shop), storage country registrations are mandatory.

---

## 3. EU VAT RATES DATABASE (2025)

### 3.1 Standard Rates by Country

| Country | Code | Standard Rate | Notes |
|---------|------|---------------|-------|
| Austria | AT | 20% | |
| Belgium | BE | 21% | |
| Bulgaria | BG | 20% | |
| Croatia | HR | 25% | |
| Cyprus | CY | 19% | |
| Czech Republic | CZ | 21% | |
| Denmark | DK | 25% | No reduced rates |
| Estonia | EE | 22% | Changes to 24% on July 1, 2025 |
| Finland | FI | 25.5% | |
| France | FR | 20% | |
| Germany | DE | 19% | |
| Greece | EL | 24% | |
| Hungary | HU | 27% | Highest in EU |
| Ireland | IE | 23% | |
| Italy | IT | 22% | |
| Latvia | LV | 21% | |
| Lithuania | LT | 21% | |
| Luxembourg | LU | 17% | Lowest in EU |
| Malta | MT | 18% | |
| Netherlands | NL | 21% | |
| Poland | PL | 23% | |
| Portugal | PT | 23% | |
| Romania | RO | 19% | Changes to 21% on August 1, 2025 |
| Slovakia | SK | 23% | Increased from 20% in Jan 2025 |
| Slovenia | SI | 22% | |
| Spain | ES | 21% | |
| Sweden | SE | 25% | |
| United Kingdom | UK | 20% | Post-Brexit |
| Switzerland | CH | 8.1% | Not EU |
| Norway | NO | 25% | Not EU |

### 3.2 Reduced Rates (First Reduced Rate)

| Country | Code | Reduced 1 | Applies To |
|---------|------|-----------|------------|
| Austria | AT | 10% | Food, books, medicines |
| Belgium | BE | 6% | Food, books, medicines |
| Bulgaria | BG | 9% | Food, books, medicines |
| Croatia | HR | 5% | Food, books, medicines |
| Cyprus | CY | 5% | Food, books |
| Czech Republic | CZ | 12% | Food, medicines |
| Denmark | DK | — | No reduced rates |
| Estonia | EE | 9% | Books, medicines |
| Finland | FI | 10% | Food, books |
| France | FR | 5.5% | Food, books, medicines |
| Germany | DE | 7% | Food, books, newspapers, cultural events |
| Greece | EL | 6% | Food, books, medicines |
| Hungary | HU | 5% | Food, medicines |
| Ireland | IE | 9% | Food, newspapers |
| Italy | IT | 10% | Food, medicines |
| Latvia | LV | 12% | Food, books |
| Lithuania | LT | 5% | Books, medicines |
| Luxembourg | LU | 8% | Food, medicines |
| Malta | MT | 5% | Food, books |
| Netherlands | NL | 9% | Food, books, medicines |
| Poland | PL | 5% | Food, books |
| Portugal | PT | 6% | Food, books |
| Romania | RO | 5% | Food, books |
| Slovakia | SK | 10% | Food, books |
| Slovenia | SI | 9.5% | Food, books |
| Spain | ES | 10% | Food, books |
| Sweden | SE | 6% | Food, books |
| UK | UK | 5% | Food (some), books, children's items |
| Switzerland | CH | 2.6% | Food, medicines |
| Norway | NO | 15% | Food |

### 3.3 Second Reduced Rates (Where Applicable)

| Country | Code | Reduced 2 | Applies To |
|---------|------|-----------|------------|
| France | FR | 10% | Restaurant services, hotel |
| Italy | IT | 5% | Some social goods |
| Spain | ES | 4% | Basic food (super-reduced) |
| Portugal | PT | 13% | Restaurant services |
| Greece | EL | 13% | Restaurant services |
| Ireland | IE | 13.5% | Fuel, electricity |

---

## 4. CATEGORY-SPECIFIC VAT RATES

### 4.1 Books & Publications

**Print Books:**
- Most EU countries: Reduced rate (7% DE, 5.5% FR, 10% IT, 10% ES, 5% UK, 0% CZ)
- Denmark: 25% (no reduced rates available)

**eBooks & Audiobooks:**
- Same as print books (EU directive harmonized rates in 2018)
- All countries that reduce print books also reduce digital books

**Newspapers & Magazines:**
- Reduced rate in most EU countries
- Often same or lower than book rate

### 4.2 Food & Beverages

**Basic Foodstuffs:**
- Reduced rate across all EU (7% DE, 5.5% FR, 10% IT, 10% ES, 5% UK, etc.)
- Includes: bread, milk, eggs, vegetables, meat, etc.

**Restaurant Services:**
- Varies by country
- Often reduced: 10% FR, 10% IT, 10% ES
- Standard in some: 19% DE

**Alcohol:**
- Standard rate in most countries (20% FR, 19% DE, 22% IT, 23% IE)

**Baby Food:**
- Same as basic food (reduced rate)

### 4.3 Health & Medical

**Prescription Medicines:**
- Reduced or super-reduced in most EU
- Examples: 10% IT, 4% ES, 2.1% FR, 0% UK (exempt)

**OTC Medicines:**
- Reduced rate in most countries
- 7% DE, 5.5% FR, 10% IT

**Medical Equipment (for disabled):**
- Reduced rate: 7% DE, 5.5% FR, 10% IT
- Includes: wheelchairs, hearing aids, prosthetics

**Vitamins & Supplements:**
- Standard rate in most countries (19% DE, 20% FR, 22% IT)
- Not considered medicines

### 4.4 Children & Baby Products

**Baby Food:**
- Reduced (same as food category)

**Baby Clothing:**
- Standard rate in most EU
- Exception: Ireland 0% for children under 11, UK 0% for children

**Diapers:**
- Standard rate in most (19% DE, 20% FR)
- Exception: Ireland 0%

**Toys:**
- Standard rate in ALL EU countries

**Car Seats:**
- Standard rate (19% DE, 21% BE, 22% IT)

### 4.5 Electronics & Technology

**All Electronics:**
- Standard rate (no exceptions)
- Includes: phones, computers, tablets, TVs, cameras

**Software (Downloaded):**
- Standard rate

**SaaS & Digital Services:**
- Standard rate

### 4.6 Clothing & Footwear

**Adult Clothing:**
- Standard rate (exceptions: Ireland 0% for certain items)

**Children's Clothing:**
- Standard rate in most EU
- Exceptions: UK 0%, Ireland 0% (under age 11)

**Shoes:**
- Standard rate

### 4.7 Cultural & Entertainment

**Museum/Theatre/Cinema Tickets:**
- Reduced rate in most EU (7% DE, 5.5% FR, 10% IT)

**Art & Collectibles:**
- Reduced rate in most EU
- Germany: Changed from 19% to 7% in January 2025

**Sports Event Tickets:**
- Reduced rate in some countries

### 4.8 Accommodation & Travel

**Hotel Stays:**
- Reduced rate in most EU (7% DE, 10% FR, 10% IT, 10% ES)

**Airbnb:**
- Same as hotels

**Passenger Transport:**
- Reduced rate across EU

---

## 5. IMPLEMENTATION REQUIREMENTS

### 5.1 File Structure

/lib
/vat
rates.ts - VAT rates database (all countries)
categories.ts - Category → rate type mapping
calculator.ts - Main calculation functions
rules.ts - Distance selling, FBA, B2B logic
validators.ts - VAT number validation
types.ts - TypeScript interfaces
constants.ts - Country codes, thresholds
tests
calculator.test.ts - Unit tests

text

### 5.2 Core Functions

**Function 1: Get VAT Rate**
getVATRate(
country: string,
category: string
): { rate: number; rateType: 'standard' | 'reduced1' | 'reduced2' }

text

**Function 2: Calculate VAT from Gross**
extractNetFromGross(
grossPrice: number,
vatRate: number
): {
netPrice: number;
vatAmount: number;
}

// Example:
// Input: grossPrice = €119, vatRate = 0.19
// Output: { netPrice: €100, vatAmount: €19 }

text

**Function 3: Calculate VAT from Net**
calculateVATFromNet(
netPrice: number,
vatRate: number
): {
vatAmount: number;
grossPrice: number;
}

// Example:
// Input: netPrice = €100, vatRate = 0.19
// Output: { vatAmount: €19, grossPrice: €119 }

text

**Function 4: Profitability with VAT**
calculateProfitability(params: {
salePrice: number; // Price customer pays (gross)
cogs: number; // What seller paid supplier (gross)
amazonFees: number; // Amazon's fees (gross if applicable)
category: string;
sellerCountry: string;
buyerCountry: string;
storageCountry?: string;
isB2B: boolean;
hasValidVATNumber?: boolean;
}): {
revenue_gross: number;
revenue_net: number;
cogs_gross: number;
cogs_net: number;
fees_gross: number;
fees_net: number;
output_vat: number; // VAT collected from customer
input_vat_cogs: number; // Reclaimable VAT on COGS
input_vat_fees: number; // Reclaimable VAT on fees
net_vat_liability: number; // What seller actually pays tax authority
net_profit: number; // True profit after all VAT adjustments
margin_percentage: number;
}

text

### 5.3 Validation Rules

**VAT Number Formats (Regex per Country):**
AT: ATU[0-9]{8}
BE: BE[0-9]{9}​
BG: BG[0-9]{9,10}
DE: DE[0-9]{9}
FR: FR[A-Z0-9]{2}[0-9]{9}
IT: IT[0-9]{11}
... (full list in validators.ts)

text

**Input Validation:**
- Sale price > 0
- COGS ≥ 0
- VAT rate between 0 and 0.30 (30%)
- Country code must be valid ISO 3166-1 alpha-2
- Category must exist in database

---

## 6. USER INTERFACE REQUIREMENTS

### 6.1 Input Form Fields

**Required:**
- Sale Price (€): Number input, 2 decimal places
- Cost of Goods Sold (€): Number input, 2 decimal places
- Product Category: Dropdown (organized by parent categories)
- Seller Country: Dropdown (30 countries)
- Buyer Country: Dropdown (30 countries)

**Optional:**
- Storage Country (for FBA): Dropdown
- Is B2B Transaction: Toggle/Checkbox
- Buyer VAT Number: Text input (conditional on B2B = true)
- Annual Cross-Border Sales (€): Number input (for distance selling)

### 6.2 Output Display

**VAT Breakdown Section:**
VAT Information:
├─ Applicable Rate: 19% (Germany Standard)
├─ Rule Applied: Local Sale (FBA Storage Country)
├─ VAT Country: Germany (DE)
└─ VAT Registration Required: Yes (Germany)

Financial Breakdown:
├─ Sale Price (gross): €119.00
├─ Sale Price (net): €100.00
├─ Output VAT (collected): €19.00
│
├─ COGS (gross): €59.50
├─ COGS (net): €50.00
├─ Input VAT (reclaimable): €9.50
│
├─ Amazon Fees (gross): €17.85
├─ Amazon Fees (net): €15.00
├─ Input VAT (reclaimable): €2.85
│
├─ Net VAT Liability: €6.65
│ (€19.00 output - €9.50 COGS - €2.85 fees)
│
└─ Net Profit: €35.00
(€100 revenue - €50 COGS - €15 fees)
Margin: 35%

text

**Tooltips (Hover/Click):**
- Every line item should have "How is this calculated?" tooltip
- Example: "Output VAT = Sale Price ÷ 1.19 - Sale Price = €19.00"

**Warnings/Alerts:**
- "⚠️ VAT registration required in: Germany, Poland, France"
- "ℹ️ You are €1,200 away from €10,000 distance selling threshold"
- "✓ OSS eligible - consider enrolling to simplify EU reporting"

---

## 7. EDGE CASES & SPECIAL RULES

### 7.1 Rate Changes (Time-Sensitive)

**Estonia: 22% → 24% on July 1, 2025**
if (country === 'EE') {
const changeDate = new Date('2025-07-01');
const today = new Date();
return today >= changeDate ? 0.24 : 0.22;
}

text

**Romania: 19% → 21% on August 1, 2025**
if (country === 'RO') {
const changeDate = new Date('2025-08-01');
const today = new Date();
return today >= changeDate ? 0.21 : 0.19;
}

text

### 7.2 Denmark Exception

Denmark has NO reduced rates. All products are 25% regardless of category.

if (country === 'DK') {
return 0.25; // Always standard rate, ignore category
}

text

### 7.3 Canary Islands (Spain)

**Special case:** Canary Islands use IGIC (7%) not Spanish VAT (21%)

if (buyerCountry === 'ES' && buyerRegion === 'Canary Islands') {
return 0.07; // IGIC rate
}

text

### 7.4 Northern Ireland (UK)

**Post-Brexit special status:** Goods sold to NI may follow EU rules

if (buyerCountry === 'UK' && buyerRegion === 'Northern Ireland') {
// Complex rules - consult with tax advisor
// May need to apply EU VAT rules for goods
}

text

---

## 8. TESTING REQUIREMENTS

### 8.1 Unit Test Coverage

**Must test ALL of these scenarios:**

1. **Basic Gross to Net:**
   - €119 at 19% → €100 net, €19 VAT

2. **Basic Net to Gross:**
   - €100 at 19% → €19 VAT, €119 gross

3. **Profitability (German seller, local sale):**
   - Sale: €119 gross, COGS: €59.50 gross, Fees: €17.85 gross
   - Expected: €35 net profit, 35% margin

4. **Books (reduced rate):**
   - German books at 7%: €10.70 gross → €10 net, €0.70 VAT

5. **Distance selling (below threshold):**
   - DE seller, FR buyer, €8K annual sales
   - Expected: Use DE VAT (7% for books)

6. **Distance selling (above threshold):**
   - DE seller, FR buyer, €12K annual sales
   - Expected: Use FR VAT (5.5% for books)

7. **B2B reverse charge:**
   - DE seller, FR B2B buyer with valid VAT
   - Expected: 0% VAT, reverse charge note

8. **Pan-EU FBA:**
   - DE seller, stored in PL, sold to IT buyer
   - Expected: IT VAT (22%), registration required in PL

9. **Denmark (no reduced rates):**
   - DK seller, books category
   - Expected: 25% (standard rate, no reduction)

10. **Estonia rate change:**
    - Date before July 1, 2025: 22%
    - Date after July 1, 2025: 24%

11. **Input VAT reclaim:**
    - COGS gross €123 → net €103.36, input VAT €19.64
    - Verify profitability uses €103.36, not €123

---

## 9. DOCUMENTATION REQUIREMENTS

### 9.1 Code Comments

Every function must have JSDoc:
/**

Calculates net price from gross price (VAT-inclusive price)

Formula: Net = Gross ÷ (1 + VAT Rate)

@param grossPrice - Price including VAT (what customer pays)

@param vatRate - VAT rate as decimal (0.19 = 19%)

@returns Object with netPrice and vatAmount

@example

extractNetFromGross(119, 0.19)

// Returns: { netPrice: 100, vatAmount: 19 }
*/

text

### 9.2 README in /lib/vat/

Must explain:
- EU VAT rules for Amazon sellers (5 paragraphs max)
- Distance selling threshold
- Pan-EU FBA requirements
- B2B reverse charge
- How to use the calculator functions
- Links to official EU VAT directive

---

## 10. CRITICAL "DO NOT" LIST

❌ **DO NOT** calculate reduced rates as percentages of standard rate (e.g., 0.6 × 19%)
❌ **DO NOT** use COGS gross in profitability calculations (must use COGS net)
❌ **DO NOT** forget to handle rate changes (Estonia, Romania)
❌ **DO NOT** apply reduced rates in Denmark (always 25%)
❌ **DO NOT** fake data - if unknown category/country, return standard rate + warning
❌ **DO NOT** allow VAT calculations without country selection
❌ **DO NOT** assume all health products get reduced rate (only specific medical items)
❌ **DO NOT** group "Health, Books, Baby" together (different rates per country)

---

## 11. PHASED IMPLEMENTATION

**Phase 1 (Week 1):** Rates database + basic calculator (standard rates only)  
**Phase 2 (Week 2):** Category mappings + reduced rates  
**Phase 3 (Week 3):** Input VAT reclaim logic + profitability  
**Phase 4 (Week 4):** Distance selling + FBA rules  
**Phase 5 (Week 5):** B2B reverse charge + VAT validation  
**Phase 6 (Week 6):** UI integration + comprehensive testing

---

**END OF SPECIFICATION**
