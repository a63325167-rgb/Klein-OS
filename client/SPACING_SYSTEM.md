# Spacing System Documentation

**Single Source of Truth for All Padding, Gaps, and Spacing**

Professional B2B SaaS spacing system following 8px base grid. All spacing values are standardized for visual harmony, predictable layouts, and easy maintenance.

---

## Core Principles

1. **Consistency**: Same spacing rules everywhere
2. **Predictability**: Users can anticipate layout patterns
3. **Rhythm**: Spacing follows a mathematical scale (4px increments)
4. **Breathing Room**: Professional spacing prevents cramped layouts
5. **Scalability**: Spacing system works at all screen sizes

---

## Spacing Scale (8px Base Grid)

| Token | Tailwind Class | Pixels | Usage |
|-------|----------------|--------|-------|
| **xs** | `p-1`, `gap-1` | 4px | Tiny elements, badges, tight groups |
| **sm** | `p-2`, `gap-2` | 8px | Small gaps, compact spacing |
| **md** | `p-3`, `gap-3` | 12px | Medium spacing, button groups |
| **base** | `p-4`, `gap-4` | 16px | Standard spacing, form fields |
| **lg** | `p-6`, `gap-6` | 24px | **PRIMARY CARD SPACING** |
| **xl** | `p-8`, `gap-8` | 32px | Extra large, major sections |
| **2xl** | `p-10`, `gap-10` | 40px | Very large, page sections |
| **3xl** | `p-12`, `gap-12` | 48px | Huge, rarely used |

---

## Universal Card Padding Rules

### **PRIMARY RULE: All Cards Use `p-6` (24px)**

```jsx
// ✅ CORRECT - Standard card padding
<Card className="p-6">
  <h3 className="mb-4">Card Title</h3>
  <div className="space-y-4">
    {/* content */}
  </div>
</Card>

// ❌ WRONG - Inconsistent padding
<Card className="p-4">...</Card>  // Too small
<Card className="p-8">...</Card>  // Too large
<Card className="p-2">...</Card>  // Way too small
```

### **Exceptions (Rare)**

- **Nested sections within cards**: May use `p-4` (16px) for internal divisions
- **Compact components** (badges, pills): May use `p-2` or `p-3`
- **Large hero sections**: May use `p-8` or `p-10`

---

## Card Gap Rules (Between Cards)

### **PRIMARY RULE: All Card Grids Use `gap-6` (24px)**

```jsx
// ✅ CORRECT - Standard card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card className="p-6">KPI 1</Card>
  <Card className="p-6">KPI 2</Card>
  <Card className="p-6">KPI 3</Card>
  <Card className="p-6">KPI 4</Card>
</div>

// ❌ WRONG - Inconsistent gaps
<div className="grid gap-2">...</div>  // Too tight
<div className="grid gap-4">...</div>  // Inconsistent
<div className="grid gap-8">...</div>  // Too loose
```

### **Gap Patterns by Context**

| Context | Gap Class | Pixels | Usage |
|---------|-----------|--------|-------|
| **KPI Cards Row** | `gap-6` | 24px | Primary metrics, dashboard cards |
| **Chart Grid** | `gap-6` | 24px | Chart containers, analytics |
| **Scenario Cards** | `gap-6` | 24px | Scenario sliders, calculators |
| **Button Groups** | `gap-3` | 12px | Related buttons, CTAs |
| **Form Fields Row** | `gap-4` | 16px | Horizontal form inputs |
| **Icon + Text** | `gap-2` or `gap-3` | 8-12px | Tight icon-text pairing |

---

## Vertical Spacing (Stacking)

### **PRIMARY RULES**

```jsx
// ✅ CORRECT - Standard vertical stacking
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// ✅ CORRECT - Comfortable stacking
<div className="space-y-6">
  <Card>Section 1</Card>
  <Card>Section 2</Card>
  <Card>Section 3</Card>
</div>

// ❌ WRONG - Random margins
<div>
  <div className="mb-3">Item 1</div>  // Random value
  <div className="mb-7">Item 2</div>  // Random value
  <div className="mb-2">Item 3</div>  // Random value
</div>
```

### **Vertical Spacing Patterns**

| Pattern | Class | Pixels | Usage |
|---------|-------|--------|-------|
| **Tight Stack** | `space-y-2` | 8px | Related items, list items |
| **Standard Stack** | `space-y-4` | 16px | Form fields, content blocks |
| **Comfortable Stack** | `space-y-6` | 24px | Cards, major sections |
| **Major Break** | `space-y-8` | 32px | Page sections, tab content |
| **Huge Break** | `space-y-12` | 48px | Major page divisions |

---

## Section Spacing (Within Cards)

### **Card Internal Structure**

```jsx
// ✅ CORRECT - Structured card spacing
<Card className="p-6">
  {/* Header */}
  <h3 className="text-xl font-semibold mb-4">Card Title</h3>
  
  {/* Content sections */}
  <div className="space-y-4">
    <div>Section 1</div>
    <div>Section 2</div>
    <div>Section 3</div>
  </div>
  
  {/* Footer (if needed) */}
  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    Footer content
  </div>
</Card>
```

### **Spacing After Headers**

| Element | Margin Below | Usage |
|---------|--------------|-------|
| **Page Title (H1)** | `mb-6` or `mb-8` | Main page header |
| **Section Header (H2)** | `mb-4` or `mb-6` | Major section divider |
| **Card Title (H3)** | `mb-4` | Card header |
| **Component Header (H4)** | `mb-3` or `mb-4` | Small section header |

---

## Form Spacing

### **Form Field Groups**

```jsx
// ✅ CORRECT - Standard form spacing
<form className="space-y-4">
  <div>
    <label className="block mb-2">Label</label>
    <input className="px-3 py-2" />
  </div>
  
  <div>
    <label className="block mb-2">Label</label>
    <input className="px-3 py-2" />
  </div>
  
  <div className="flex gap-3">
    <button className="px-4 py-2">Cancel</button>
    <button className="px-6 py-3">Submit</button>
  </div>
</form>
```

### **Form Spacing Rules**

| Element | Spacing | Usage |
|---------|---------|-------|
| **Input Padding** | `px-3 py-2` | 12px horizontal, 8px vertical |
| **Label → Input** | `mb-2` | 8px below label |
| **Field Groups** | `space-y-4` | 16px between groups |
| **Button Group** | `gap-3` | 12px between buttons |
| **Standard Button** | `px-4 py-2` | 16px horizontal, 8px vertical |
| **Large Button** | `px-6 py-3` | 24px horizontal, 12px vertical |

---

## Button Spacing

### **Button Padding**

```jsx
// Standard button
<button className="px-4 py-2">Action</button>

// Large button (primary CTA)
<button className="px-6 py-3">Primary Action</button>

// Small button (compact)
<button className="px-3 py-1.5">Small</button>

// Icon button
<button className="p-2">
  <Icon className="w-5 h-5" />
</button>
```

### **Button Groups**

```jsx
// ✅ CORRECT - Button group spacing
<div className="flex gap-3">
  <button className="px-4 py-2">Cancel</button>
  <button className="px-4 py-2">Save</button>
  <button className="px-6 py-3">Submit</button>
</div>

// ❌ WRONG - Inconsistent spacing
<div className="flex gap-1">...</div>  // Too tight
<div className="flex gap-6">...</div>  // Too loose
```

---

## Navigation Spacing

### **Tab Navigation**

```jsx
// ✅ CORRECT - Tab spacing
<div role="tablist" className="flex gap-1 border-b-2">
  <button className="px-6 py-3">Overview</button>
  <button className="px-6 py-3">Analytics</button>
  <button className="px-6 py-3">Actions</button>
</div>

// Sub-tabs (smaller)
<div role="tablist" className="flex gap-1 border-b-2">
  <button className="px-5 py-2.5">Distribution</button>
  <button className="px-5 py-2.5">Comparison</button>
  <button className="px-5 py-2.5">Break-even</button>
</div>
```

---

## Responsive Spacing

### **Desktop First Approach**

Keep `gap-6` and `p-6` consistent across all breakpoints for simplicity and consistency.

```jsx
// ✅ RECOMMENDED - Same spacing everywhere
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card className="p-6">...</Card>
</div>

// ⚠️ OPTIONAL - Slightly tighter on mobile (only if necessary)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  <Card className="p-4 lg:p-6">...</Card>
</div>
```

### **Mobile Considerations**

- **Keep `p-6` on cards** even on mobile (prevents cramped layouts)
- **Keep `gap-6` between cards** for breathing room
- **Only reduce if absolutely necessary** (< 375px screens)

---

## Common Patterns

### **Dashboard Overview Layout**

```jsx
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
```

### **Analytics Charts Layout**

```jsx
<div className="space-y-6">
  {/* Chart Container */}
  <Card className="p-6">
    <h3 className="text-xl font-semibold mb-4">Chart Title</h3>
    <div className="h-64">
      <Chart />
    </div>
  </Card>
  
  {/* Multiple Charts */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="p-6">
      <h3 className="mb-4">Distribution</h3>
      <Chart />
    </Card>
    <Card className="p-6">
      <h3 className="mb-4">Comparison</h3>
      <Chart />
    </Card>
  </div>
</div>
```

### **Action Recommendations Layout**

```jsx
<div className="space-y-4">
  <Card className="p-6 flex items-start gap-4">
    <Icon className="w-5 h-5" />
    <div className="flex-1">
      <h4 className="font-semibold mb-2">Recommendation Title</h4>
      <p className="text-sm mb-3">Description</p>
      <div className="text-xs">Annual Savings: €X</div>
    </div>
  </Card>
  
  <Card className="p-6 flex items-start gap-4">
    {/* Repeat pattern */}
  </Card>
</div>
```

---

## Anti-Patterns (Avoid These)

### **❌ Random Margins**

```jsx
// ❌ WRONG
<div className="mb-3">Item 1</div>
<div className="mb-7">Item 2</div>
<div className="mb-2">Item 3</div>
<div className="mt-5">Item 4</div>

// ✅ CORRECT
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### **❌ Inconsistent Card Padding**

```jsx
// ❌ WRONG
<Card className="p-2">Card 1</Card>
<Card className="p-4">Card 2</Card>
<Card className="p-8">Card 3</Card>

// ✅ CORRECT
<Card className="p-6">Card 1</Card>
<Card className="p-6">Card 2</Card>
<Card className="p-6">Card 3</Card>
```

### **❌ Mixing Margin and Gap**

```jsx
// ❌ WRONG
<div className="flex">
  <div className="mr-2">Item 1</div>
  <div className="mr-4">Item 2</div>
  <div className="ml-3">Item 3</div>
</div>

// ✅ CORRECT
<div className="flex gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

---

## Quick Reference

### **Most Common Patterns**

| Use Case | Pattern |
|----------|---------|
| **Card Padding** | `p-6` |
| **Card Grid Gap** | `gap-6` |
| **Vertical Card Stack** | `space-y-6` |
| **Form Fields** | `space-y-4` |
| **Button Group** | `gap-3` |
| **Icon + Text** | `gap-2` or `gap-3` |
| **Header Margin** | `mb-4` |
| **Section Break** | `space-y-8` |

### **Standard Card Template**

```jsx
<Card className="p-6">
  <h3 className="text-xl font-semibold mb-4">Title</h3>
  <div className="space-y-4">
    <div>Content 1</div>
    <div>Content 2</div>
    <div>Content 3</div>
  </div>
</Card>
```

---

## Implementation Checklist

- [ ] All cards use `p-6` padding
- [ ] All card grids use `gap-6`
- [ ] All vertical stacks use `space-y-4` or `space-y-6`
- [ ] No random margins (`mb-3`, `mt-7`, etc.)
- [ ] Form fields use `space-y-4`
- [ ] Button groups use `gap-3`
- [ ] Headers use `mb-4` consistently
- [ ] Responsive spacing follows same proportions
- [ ] Light and dark modes have consistent spacing
- [ ] Mobile layouts maintain comfortable breathing room

---

## Maintenance

When adding new components:

1. **Always start with `p-6` for cards**
2. **Always use `gap-6` for card grids**
3. **Use `space-y-4` or `space-y-6` for vertical stacking**
4. **Never use random margin values**
5. **Test at mobile, tablet, and desktop sizes**
6. **Verify spacing in both light and dark modes**

---

**Last Updated**: November 27, 2025  
**Version**: 1.0  
**Status**: Production Standard
