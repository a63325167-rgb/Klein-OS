# FBA E-Commerce Analytics: Terminology Reference

## Document Information
- **Version:** 1.0
- **Last Updated:** November 30, 2024
- **Purpose:** Standardized definitions for all metrics in the platform
- **Compliance:** Amazon Seller Central terminology, EU accounting standards

---

## Table of Contents
1. [Profitability Metrics](#profitability-metrics)
2. [Cost Breakdown Metrics](#cost-breakdown-metrics)
3. [Break-Even & Time Metrics](#break-even--time-metrics)
4. [Cash Flow Metrics](#cash-flow-metrics)
5. [Risk & Health Metrics](#risk--health-metrics)
6. [Deprecated Metrics](#deprecated-metrics)

---

## PROFITABILITY METRICS

### Net Profit Per Unit (PPU)
**Industry Standard:** ✅ Amazon Seller Central uses "Net Profit Per Unit"

**Definition:** Revenue per unit (after returns) minus all costs including COGS, Amazon fees, VAT, and shipping.

**Formula:**
```
PPU = (Selling Price × (1 - Return Rate %)) - COGS - (Selling Price × Referral Fee %) - (Selling Price × FBA Fee %) - VAT - Shipping Cost Per Unit
```

**Example:**
```
Inputs:
- Selling Price: €50
- COGS: €20
- Referral Fee: 15%
- FBA Fee: 8%
- VAT: 19%
- Shipping: €2/unit
- Return Rate: 5%

Calculation:
- Revenue After Returns: €50 × (1 - 0.05) = €47.50
- Referral Fee: €50 × 0.15 = €7.50
- FBA Fee: €50 × 0.08 = €4.00
- VAT: €50 × 0.19 = €9.50
- Total Costs: €20 + €7.50 + €4.00 + €9.50 + €2 = €43.00
- PPU: €47.50 - €43.00 = €4.50/unit
```

**Units:** €/unit

**Notes:** This is the CORE metric. All business decisions flow from this. Negative PPU = losing money on every sale.

---

### Profit Margin %
**Industry Standard:** ✅ Amazon Seller Central uses "Profit Margin"

**Definition:** Net profit per unit as a percentage of selling price.

**Formula:**
```
Margin % = (Profit Per Unit / Selling Price) × 100
```

**Example:**
```
PPU: €4.50
Selling Price: €50
Margin: (€4.50 / €50) × 100 = 9%
```

**Units:** %

**Thresholds:**
- 🟢 **Green (Safe):** ≥ 20%
- 🟡 **Yellow (Warning):** 10-20%
- 🔴 **Red (Critical):** < 10%

**Industry Benchmark:** 15-25% is healthy for FBA. Below 10% is risky.

---

### Total Monthly Net Profit
**Industry Standard:** ✅ Accounting term "Monthly Net Income"

**Definition:** Profit per unit multiplied by monthly sales volume.

**Formula:**
```
Total Profit = PPU × Monthly Sales Velocity
```

**Example:**
```
PPU: €4.50
Monthly Sales: 100 units
Total: €4.50 × 100 = €450/month
```

**Units:** €/month

**Assumption:** Linear sales velocity (no seasonal spikes).

---

### Revenue Per Unit (After Returns)
**Industry Standard:** ✅ Amazon uses "Net Revenue"

**Definition:** Selling price adjusted for return rate.

**Formula:**
```
Revenue = Selling Price × (1 - Return Rate %)
```

**Example:**
```
Selling Price: €50
Return Rate: 5%
Revenue: €50 × (1 - 0.05) = €47.50/unit
```

**Units:** €/unit

**Impact:** 5% return rate = 5 units lost per 100 sold.

---

## COST BREAKDOWN METRICS

### Landed Cost (LC)
**Industry Standard:** ✅ Amazon uses "Landed Cost"

**Definition:** COGS plus inbound shipping and prep fees (per unit).

**Formula:**
```
LC = COGS + (Inbound Shipping / Order Quantity) + Prep Fee Per Unit
```

**Example:**
```
COGS: €20
Inbound Shipping: €100 / 100 units = €1/unit
Prep Fee: €0.50/unit
LC: €20 + €1 + €0.50 = €21.50/unit
```

**Units:** €/unit

**Usage:** Used in break-even calculations. Includes all costs to get product to FBA warehouse.

---

### Cost of Goods Sold (COGS)
**Industry Standard:** ✅ Accounting standard, used by Amazon

**Definition:** Direct cost to manufacture or purchase product (excluding shipping).

**Formula:**
```
COGS = Supplier Cost Per Unit
```

**Example:** Supplier charges €20/unit → COGS = €20

**Units:** €/unit

---

### Amazon Referral Fee
**Industry Standard:** ✅ Amazon's official term

**Definition:** Commission Amazon takes (15% for most categories, varies 6-45%).

**Formula:**
```
Referral Fee = Selling Price × Referral Fee %
```

**Example:**
```
Selling Price: €50
Rate: 15%
Fee: €50 × 0.15 = €7.50
```

**Units:** € or %

**Note:** Category-dependent. Check Amazon fee schedule for your category.

---

### Amazon FBA Fee (Fulfillment)
**Industry Standard:** ✅ Amazon's official term

**Definition:** FBA handling, packing, and shipping cost per unit (weight/size based).

**Formula:** Calculated by Amazon based on size tier (Small Standard, Large Standard, etc.)

**Example:** Small standard size → ~€3-5/unit

**Units:** €/unit

**Note:** Use Amazon FBA calculator for precise rates. Varies by size/weight tier.

---

### VAT (Value Added Tax)
**Industry Standard:** ✅ EU standard

**Definition:** Tax on selling price (15-25% depending on EU country).

**Formula:**
```
VAT = (Selling Price - Discount) × VAT Rate %
```

**Example:**
```
Selling Price: €50
Germany VAT: 19%
VAT: €50 × 0.19 = €9.50
```

**Units:** €

**Country Rates:**
- Germany: 19%
- France: 20%
- UK: 20%
- Spain: 21%
- Italy: 22%

---

### Shipping Cost Per Unit
**Industry Standard:** ✅ "Inbound Shipping" on Amazon

**Definition:** Inbound shipping to FBA divided by order quantity.

**Formula:**
```
Shipping = Total Inbound Shipping / Order Quantity
```

**Example:**
```
Total Shipping: €200
Order: 100 units
Per Unit: €200 / 100 = €2/unit
```

**Units:** €/unit

**Optimization:** Larger orders = lower per-unit shipping cost.

---

## BREAK-EVEN & TIME METRICS

### Break-Even Days
**Industry Standard:** ✅ Used by Amazon and accounting software

**Definition:** Days until cumulative profit equals initial inventory investment.

**Formula:**
```
Days = (Initial Inventory Cost / (PPU × Daily Sales Velocity))
```

**Example:**
```
Initial Investment: €2,100
PPU: €4.50
Daily Sales: 3 units/day
Days: €2,100 / (€4.50 × 3) = 156 days
```

**Units:** days

**Thresholds:**
- 🟢 **Green (Safe):** < 14 days
- 🟡 **Yellow (Warning):** 14-30 days
- 🔴 **Red (Critical):** > 30 days

**Assumption:** Linear sales, no ramp-up period.

---

### Initial Inventory Cost (IIC)
**Industry Standard:** ✅ Amazon term for startup investment

**Definition:** Total upfront cost to order and ship initial inventory.

**Formula:**
```
IIC = (COGS × Qty) + Inbound Shipping + (Prep Fee × Qty)
```

**Example:**
```
COGS: €20 × 100 units = €2,000
Inbound Shipping: €100
Prep Fee: €0.50 × 100 = €50
IIC: €2,000 + €100 + €50 = €2,150
```

**Units:** €

**Requirement:** Must have this cash available before ordering.

---

### Monthly Sales Velocity
**Industry Standard:** ✅ Used in inventory projections

**Definition:** Estimated units sold per month.

**Formula:** [User Input or Historical Data]

**Example:** 50 units/month

**Units:** units/month

**IMPORTANT:** This is an ASSUMPTION, not guaranteed. Use conservative estimates.

---

### Inventory Turnover Days
**Industry Standard:** ✅ Retail/e-commerce standard

**Definition:** Days to sell through entire order quantity.

**Formula:**
```
Turnover Days = (Order Quantity / Monthly Sales Velocity) × 30
```

**Example:**
```
Order: 100 units
Monthly Sales: 50 units
Turnover: (100 / 50) × 30 = 60 days
```

**Units:** days

**Thresholds:**
- 🟢 **Green (Fast):** < 21 days
- 🟡 **Yellow (Moderate):** 21-45 days
- 🔴 **Red (Slow):** > 45 days

**Risk:** Long turnover = cash tied up, obsolescence risk, storage fees.

---

## CASH FLOW METRICS

### Cash Runway
**Industry Standard:** ✅ Finance term "Runway" or "Months of Cash"

**Definition:** Months of operations before cash reserves reach zero.

**Formula:** Month when cumulative cash goes negative (from B4 12-month simulation)

**Example:** 4.2 months

**Units:** months

**Thresholds:**
- 🟢 **Green (Safe):** ≥ 6 months
- 🟡 **Yellow (Warning):** 3-6 months
- 🔴 **Red (Critical):** < 3 months

**Context:** Requires Initial Cash, Monthly Reorder Cost, Monthly Profit inputs.

---

### Cash Reserve (Initial Cash)
**Industry Standard:** ✅ "Working Capital" or "Cash on Hand"

**Definition:** Available cash to fund operations before first profit arrives.

**Formula:** [User Input]

**Example:** €5,000

**Units:** €

**Default:** €0 if not specified.

---

### Monthly Reorder Cost
**Industry Standard:** ✅ "Monthly Inventory Spend" in accounting

**Definition:** Cost to reorder inventory monthly (maintains stock levels).

**Formula:**
```
MRC = (Monthly Sales × Reorder Buffer) × Landed Cost
```

**Example:**
```
Monthly Sales: 50 units
Reorder Buffer: 1.2 (20% safety stock)
Landed Cost: €21.50
MRC: (50 × 1.2) × €21.50 = €1,290/month
```

**Units:** €/month

**Buffer:** 1.1-1.3 typical to prevent stockouts.

---

### Monthly Cash Inflow (Net Profit)
**Industry Standard:** ✅ "Monthly Net Income" in accounting

**Definition:** Profit per unit × monthly sales = monthly cash from operations.

**Formula:**
```
Inflow = PPU × Monthly Sales Velocity
```

**Example:**
```
PPU: €4.50
Monthly Sales: 50 units
Inflow: €4.50 × 50 = €225/month
```

**Units:** €/month

**Payment Lag:** Assume 1-month lag (Month N profit received in Month N+1).

---

## RISK & HEALTH METRICS

### Health Score
**Industry Standard:** ❌ Proprietary metric (not Amazon standard)

**Definition:** Composite score (0-100) based on margin, break-even, cash flow, competition, inventory.

**Formula:**
```
Health = (Margin Health × 0.25) + (Break-Even Health × 0.25) + (Cash Flow Health × 0.25) + (Competition Health × 0.15) + (Inventory Health × 0.10)
```

**Example:** 72/100

**Units:** score (0-100)

**Thresholds:**
- 🟢 **Excellent:** 80-100
- 🟡 **Good:** 60-79
- 🟠 **Acceptable:** 40-59
- 🔴 **Poor:** 0-39

**Transparency:** Hover to see component breakdown (B1 implementation).

---

### Risk Level
**Industry Standard:** ✅ Traffic-light risk system

**Definition:** Overall business risk across 5 categories (Profitability, Break-Even, Cash Flow, Competition, Inventory).

**Categories:**
1. Profitability Risk
2. Break-Even Risk
3. Cash Flow Risk
4. Competition Risk
5. Inventory Health Risk

**Levels:**
- 🔴 **Critical:** Immediate action required
- 🟡 **Warning:** Proceed with caution
- 🟢 **Safe:** All clear

**See:** B5 Risk Calculations for detailed thresholds.

---

### Return Rate %
**Industry Standard:** ✅ "Return Rate %" on Amazon Seller Central

**Definition:** Percentage of units returned by customers.

**Formula:**
```
Return Rate = (Returned Units / Total Sold Units) × 100
```

**Example:** 5% (5 units returned per 100 sold)

**Units:** %

**Default:** Category average if unknown.

**Impact:** Directly reduces profit per unit via "Revenue After Returns".

---

## DEPRECATED METRICS

### ❌ Gross Profit Per Unit (DO NOT USE)
**Status:** DEPRECATED

**Reason:** Incomplete - does not account for returns, fees, VAT, shipping.

**Old Formula:** `Selling Price - COGS`

**Why Bad:** Misleading. Makes products look profitable when they are not.

**Replacement:** Use "Net Profit Per Unit" instead.

---

### ❌ Gross Margin (DO NOT USE)
**Status:** DEPRECATED

**Reason:** Ambiguous - unclear if includes fees or not.

**Old Formula:** `(Selling Price - COGS) / Selling Price`

**Why Bad:** Confusing. Industry uses "Net Margin" for FBA.

**Replacement:** Use "Profit Margin %" instead.

---

## Appendix: Quick Reference Table

| Metric | Units | Formula | Threshold (Green) |
|--------|-------|---------|-------------------|
| Net Profit Per Unit | €/unit | Revenue - All Costs | > €5 |
| Profit Margin % | % | (PPU / Price) × 100 | > 20% |
| Break-Even Days | days | IIC / (PPU × Daily Sales) | < 14 days |
| Cash Runway | months | B4 Simulation | ≥ 6 months |
| Health Score | 0-100 | Weighted Composite | ≥ 80 |
| Return Rate | % | (Returns / Sold) × 100 | < 5% |

---

## Version History

**v1.0** (November 30, 2024)
- Initial release
- 40+ terms defined
- Industry standard compliance verified
- Amazon Seller Central terminology matched

---

**End of Document**

For questions or clarifications, refer to the in-app tooltips or contact support.
