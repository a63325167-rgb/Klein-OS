# Layout Grid System Documentation

**Single Source of Truth for Layout Structure, Container Width, and Grid Patterns**

Professional B2B SaaS layout system ensuring consistent alignment, whitespace, and responsive behavior across all screens.

---

## Core Principles

1. **Consistent Container**: All pages use the same max-width and horizontal padding
2. **Aligned Grid**: All content aligns to the same left edge
3. **Vertical Rhythm**: Predictable spacing between sections
4. **Responsive First**: Mobile-friendly layouts that scale gracefully
5. **No Edge Touching**: Content never touches viewport edges

---

## Page Container System

### **Universal Container**

All pages use this container structure:

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>
```

### **Container Specifications**

| Property | Value | Purpose |
|----------|-------|---------|
| **Max Width** | `max-w-7xl` (1280px) | Prevents content from being too wide on large screens |
| **Horizontal Centering** | `mx-auto` | Centers container in viewport |
| **Mobile Padding** | `px-4` (16px) | Comfortable edge spacing on small screens |
| **Tablet Padding** | `sm:px-6` (24px) | More breathing room on medium screens |
| **Desktop Padding** | `lg:px-8` (32px) | Maximum breathing room on large screens |

### **Why This Container?**

- **max-w-7xl (1280px)**: Industry standard for dashboard applications (Stripe, Shopify, Linear)
- **Responsive padding**: Ensures content never touches edges on any device
- **Centered layout**: Professional appearance on ultra-wide monitors
- **Consistent alignment**: All sections start at the same left edge

---

## Grid Patterns

### **KPI Cards Grid (4 Columns)**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card className="p-6">KPI 1</Card>
  <Card className="p-6">KPI 2</Card>
  <Card className="p-6">KPI 3</Card>
  <Card className="p-6">KPI 4</Card>
</div>
```

**Breakpoint Behavior:**
- **Mobile (< 768px)**: 1 column (stacked)
- **Tablet (768px - 1023px)**: 2 columns
- **Desktop (≥ 1024px)**: 4 columns

### **Secondary Metrics Grid (3 Columns)**

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="p-6">Metric 1</Card>
  <Card className="p-6">Metric 2</Card>
  <Card className="p-6">Metric 3</Card>
</div>
```

**Breakpoint Behavior:**
- **Mobile (< 768px)**: 1 column (stacked)
- **Tablet & Desktop (≥ 768px)**: 3 columns

### **Scenario Cards Grid (2 Columns)**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Card className="p-6">Scenario 1</Card>
  <Card className="p-6">Scenario 2</Card>
</div>
```

**Breakpoint Behavior:**
- **Mobile (< 768px)**: 1 column (stacked)
- **Tablet & Desktop (≥ 768px)**: 2 columns

### **Chart Grid (2 Columns)**

```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card className="p-6">Chart 1</Card>
  <Card className="p-6">Chart 2</Card>
</div>
```

**Breakpoint Behavior:**
- **Mobile & Tablet (< 1024px)**: 1 column (stacked)
- **Desktop (≥ 1024px)**: 2 columns

---

## Vertical Spacing System

### **Section Spacing**

Use consistent vertical spacing between major sections:

```jsx
<div className="space-y-8">
  <section>{/* KPI Cards */}</section>
  <section>{/* Secondary Metrics */}</section>
  <section>{/* Scenario Calculator */}</section>
  <section>{/* VAT Information */}</section>
</div>
```

### **Spacing Scale**

| Context | Class | Pixels | Usage |
|---------|-------|--------|-------|
| **Major Sections** | `space-y-8` | 32px | Between KPI cards, scenarios, charts |
| **Content Sections** | `space-y-6` | 24px | Within component groups |
| **List Items** | `space-y-4` | 16px | Action cards, form fields |
| **Tight Groups** | `space-y-2` | 8px | Related items, metadata |
| **Page Breaks** | `space-y-12` or `mt-12` | 48px | Major page divisions |

### **Header Spacing**

| Element | Margin Below | Usage |
|---------|--------------|-------|
| **Page Title** | `mb-8` | Main dashboard header |
| **Section Title** | `mb-6` | Section headers within tabs |
| **Card Title** | `mb-4` | Titles inside cards |
| **Sub-header** | `mb-3` or `mb-4` | Small section headers |

---

## Tab Navigation Spacing

### **Main Tabs**

```jsx
<div role="tablist" className="flex gap-1 mb-8 overflow-x-auto border-b-2 border-slate-200 dark:border-slate-700">
  <button className="px-6 py-3">Overview</button>
  <button className="px-6 py-3">Analytics</button>
  <button className="px-6 py-3">Actions</button>
</div>

{/* Tab content starts here with proper spacing */}
<div className="space-y-8">
  {/* Content */}
</div>
```

**Spacing Rules:**
- **Below tabs**: `mb-8` (32px) - Clear separation from content
- **Tab padding**: `px-6 py-3` - Comfortable touch targets
- **Tab gap**: `gap-1` (4px) - Minimal gap for clean appearance

### **Sub-Tabs (Analytics, Charts)**

```jsx
<div role="tablist" className="flex gap-1 border-b-2 border-slate-200 dark:border-slate-700">
  <button className="px-5 py-2.5">Distribution</button>
  <button className="px-5 py-2.5">Comparison</button>
  <button className="px-5 py-2.5">Break-even</button>
</div>

{/* Content with spacing */}
<div className="mt-6">
  {/* Sub-tab content */}
</div>
```

**Spacing Rules:**
- **Below sub-tabs**: `mt-6` (24px) - Comfortable separation
- **Sub-tab padding**: `px-5 py-2.5` - Slightly smaller than main tabs
- **Tab gap**: `gap-1` (4px) - Consistent with main tabs

---

## Responsive Breakpoints

### **Tailwind Breakpoints Used**

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| **Default** | 0px | Mobile-first (< 640px) |
| **sm** | 640px | Small tablets |
| **md** | 768px | Tablets, 2-column layouts |
| **lg** | 1024px | Small desktops, 4-column layouts |
| **xl** | 1280px | Large desktops |

### **Testing Viewports**

Always test at these key sizes:

| Device | Width | Height | Notes |
|--------|-------|--------|-------|
| **iPhone SE** | 375px | 667px | Small mobile |
| **iPhone 12/13** | 390px | 844px | Standard mobile |
| **iPad Mini** | 768px | 1024px | Tablet portrait |
| **iPad Pro** | 1024px | 1366px | Tablet landscape |
| **Laptop** | 1440px | 900px | Standard desktop |
| **Desktop** | 1920px | 1080px | Large desktop |

---

## Mobile Layout Rules

### **Mobile-Specific Considerations**

1. **All grids stack to single column** (`grid-cols-1`)
2. **Horizontal padding reduces** (`px-4` on mobile vs `px-8` on desktop)
3. **Tabs scroll horizontally** (`overflow-x-auto`)
4. **Touch targets minimum 44px** (WCAG AAA standard)
5. **No horizontal scrolling** (except intentional tab strips)

### **Mobile Grid Example**

```jsx
{/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
  <Card>4</Card>
</div>
```

**Result:**
- **375px**: 4 cards stacked vertically with 24px gap
- **768px**: 2x2 grid with 24px gap
- **1024px**: 1x4 row with 24px gap

---

## Alignment Rules

### **Left Alignment**

All content must align to the same left edge:

```jsx
{/* ✅ CORRECT - All content aligns */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="mb-8">Dashboard</h1>
  <div className="grid grid-cols-4 gap-6">
    <Card>1</Card>
    <Card>2</Card>
    <Card>3</Card>
    <Card>4</Card>
  </div>
</div>

{/* ❌ WRONG - Nested padding causes misalignment */}
<div className="max-w-7xl mx-auto px-4">
  <div className="px-4">
    <h1>Dashboard</h1> {/* Indented too far */}
  </div>
  <div className="grid grid-cols-4 gap-6">
    <Card>1</Card> {/* Different alignment */}
  </div>
</div>
```

### **Vertical Alignment**

Use flexbox for vertical centering within cards:

```jsx
<Card className="h-40 flex flex-col justify-center">
  <Caption>Label</Caption>
  <MetricDisplay>€10.01</MetricDisplay>
  <Caption>Description</Caption>
</Card>
```

---

## Common Layout Patterns

### **Dashboard Overview Layout**

```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Header */}
  <header className="mb-8">
    <H1>Business Intelligence Dashboard</H1>
    <BodySmall>Advanced analytics & insights</BodySmall>
  </header>

  {/* Main Tabs */}
  <div role="tablist" className="flex gap-1 mb-8 border-b-2">
    <button>Overview</button>
    <button>Analytics</button>
    <button>Actions</button>
  </div>

  {/* Tab Content */}
  <div className="space-y-8">
    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">KPI 1</Card>
      <Card className="p-6">KPI 2</Card>
      <Card className="p-6">KPI 3</Card>
      <Card className="p-6">KPI 4</Card>
    </div>

    {/* Secondary Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">Metric 1</Card>
      <Card className="p-6">Metric 2</Card>
      <Card className="p-6">Metric 3</Card>
    </div>

    {/* Scenario Calculator */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">Scenario 1</Card>
      <Card className="p-6">Scenario 2</Card>
    </div>
  </div>
</div>
```

### **Analytics Tab Layout**

```jsx
<div className="space-y-8">
  {/* Sub-Tabs */}
  <div role="tablist" className="flex gap-1 border-b-2">
    <button>Performance Charts</button>
    <button>Benchmarks</button>
    <button>Cash Flow</button>
  </div>

  {/* Sub-Tab Content */}
  <div className="mt-6">
    {/* Chart Container */}
    <Card className="p-6">
      <H3 className="mb-4">Distribution</H3>
      <div className="h-64">
        <Chart />
      </div>
    </Card>
  </div>
</div>
```

### **Actions Tab Layout**

```jsx
<div className="space-y-4">
  <Card className="p-6 flex items-start gap-4">
    <Icon className="w-5 h-5" />
    <div className="flex-1">
      <H4 className="mb-2">Recommendation Title</H4>
      <BodySmall className="mb-3">Description</BodySmall>
      <Caption>Annual Savings: €X</Caption>
    </div>
  </Card>

  <Card className="p-6 flex items-start gap-4">
    {/* Repeat pattern */}
  </Card>
</div>
```

---

## Anti-Patterns (Avoid These)

### **❌ Inconsistent Container Width**

```jsx
// ❌ WRONG - Different max-width on different pages
<div className="max-w-5xl mx-auto">Overview</div>
<div className="max-w-7xl mx-auto">Analytics</div>
<div className="max-w-6xl mx-auto">Actions</div>

// ✅ CORRECT - Same max-width everywhere
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* All pages */}
</div>
```

### **❌ Missing Horizontal Padding**

```jsx
// ❌ WRONG - Content touches edges on mobile
<div className="max-w-7xl mx-auto">
  {/* Content */}
</div>

// ✅ CORRECT - Responsive padding
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### **❌ Nested Padding Causing Misalignment**

```jsx
// ❌ WRONG - Double padding causes misalignment
<div className="max-w-7xl mx-auto px-4">
  <div className="px-4">
    <h1>Title</h1> {/* Indented 32px */}
  </div>
  <div className="grid">
    <Card /> {/* Indented 16px */}
  </div>
</div>

// ✅ CORRECT - Single container padding
<div className="max-w-7xl mx-auto px-4">
  <h1>Title</h1> {/* Indented 16px */}
  <div className="grid">
    <Card /> {/* Indented 16px */}
  </div>
</div>
```

### **❌ Random Vertical Spacing**

```jsx
// ❌ WRONG - Inconsistent spacing
<div>
  <section className="mb-3">KPIs</section>
  <section className="mb-7">Scenarios</section>
  <section className="mb-5">Charts</section>
</div>

// ✅ CORRECT - Consistent spacing
<div className="space-y-8">
  <section>KPIs</section>
  <section>Scenarios</section>
  <section>Charts</section>
</div>
```

---

## Visual Verification Checklist

### **Container & Alignment**
- [ ] All pages use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- [ ] All section titles align to the same left edge
- [ ] No content touches viewport edges (padding visible)
- [ ] Content is centered on ultra-wide monitors

### **Grid System**
- [ ] KPI cards use `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- [ ] Secondary metrics use `grid-cols-1 md:grid-cols-3 gap-6`
- [ ] Scenario cards use `grid-cols-1 md:grid-cols-2 gap-6`
- [ ] Charts use `grid-cols-1 lg:grid-cols-2 gap-6`

### **Vertical Spacing**
- [ ] Major sections use `space-y-8` (32px)
- [ ] Content sections use `space-y-6` (24px)
- [ ] List items use `space-y-4` (16px)
- [ ] Page title has `mb-8` below it
- [ ] Main tabs have `mb-8` below them
- [ ] Sub-tabs have `mt-6` below them

### **Mobile Responsiveness**
- [ ] All grids stack to single column on mobile
- [ ] Horizontal padding reduces to `px-4` on mobile
- [ ] Tabs scroll horizontally with `overflow-x-auto`
- [ ] No horizontal scrolling (except tabs)
- [ ] Touch targets are at least 44px tall

### **Breakpoint Testing**
- [ ] Tested at 375px (small mobile)
- [ ] Tested at 768px (tablet)
- [ ] Tested at 1024px (small desktop)
- [ ] Tested at 1440px (large desktop)
- [ ] No weird gaps or overlaps at any size

---

## Maintenance

When adding new pages or components:

1. **Always use the universal container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
2. **Use standard grid patterns**: Refer to Grid Patterns section
3. **Use consistent vertical spacing**: `space-y-8` for major sections
4. **Test at all breakpoints**: 375px, 768px, 1024px, 1440px
5. **Verify alignment**: All content should align to the same left edge

---

**Last Updated**: November 27, 2025  
**Version**: 1.0  
**Status**: Production Standard
