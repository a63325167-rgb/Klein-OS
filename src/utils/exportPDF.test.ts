// src/utils/exportPDF.test.ts

import { exportToPDF, exportToPDFBlob } from './exportPDF';
import { BulkProductResult } from '../types/upload';
import { generateAnalytics } from './exportAnalytics';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    output: jest.fn().mockReturnValue(new Blob()),
    getNumberOfPages: jest.fn().mockReturnValue(1),
    getCurrentPageInfo: jest.fn().mockReturnValue({ pageNumber: 1 })
  }));
});

// Mock jspdf-autotable
jest.mock('jspdf-autotable', () => jest.fn());

// Sample test data
const createProduct = (overrides: Partial<BulkProductResult> = {}): BulkProductResult => ({
  rowIndex: 1,
  asin: 'B08TEST123',
  name: 'Test Product',
  price: 50,
  cogs: 20,
  velocity: 30,
  returnRate: 5,
  referralFee: 15,
  fbaFee: 8,
  vat: 19,
  shippingCost: 2,
  initialOrder: 60,
  initialCash: 5000,
  competitorCount: 10,
  rating: 4.0,
  category: 'Electronics',
  profitPerUnit: 10,
  profitMargin: 20,
  totalMonthlyProfit: 300,
  breakEvenDays: 50,
  cashRunway: 6,
  turnoverDays: 60,
  healthScore: 65,
  profitabilityRisk: 'green',
  breakEvenRisk: 'green',
  cashFlowRisk: 'green',
  competitionRisk: 'yellow',
  inventoryRisk: 'green',
  ...overrides
});

describe('exportPDF', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: Export with single product without errors
  // ============================================
  test('exports PDF with single product without errors', async () => {
    const product = createProduct();
    
    await expect(exportToPDF([product])).resolves.not.toThrow();
  });

  // ============================================
  // TEST 2: Empty array handling
  // ============================================
  test('throws error for empty product array', async () => {
    await expect(exportToPDF([])).rejects.toThrow('No products to export');
  });

  test('throws error for null products', async () => {
    await expect(exportToPDF(null as any)).rejects.toThrow('No products to export');
  });

  test('throws error for undefined products', async () => {
    await expect(exportToPDF(undefined as any)).rejects.toThrow('No products to export');
  });

  // ============================================
  // TEST 3: Mock jsPDF calls
  // ============================================
  test('calls jsPDF with correct structure', async () => {
    const jsPDF = require('jspdf');
    const product = createProduct();
    
    await exportToPDF([product]);
    
    // Verify jsPDF was instantiated
    expect(jsPDF).toHaveBeenCalled();
    
    // Verify the mock instance methods were called
    const mockInstance = jsPDF.mock.results[0].value;
    expect(mockInstance.setFontSize).toHaveBeenCalled();
    expect(mockInstance.setFont).toHaveBeenCalled();
    expect(mockInstance.text).toHaveBeenCalled();
    expect(mockInstance.save).toHaveBeenCalled();
  });

  test('adds multiple pages for large datasets', async () => {
    const jsPDF = require('jspdf');
    const products = Array.from({ length: 50 }, (_, i) => 
      createProduct({ name: `Product ${i}`, asin: `B08TEST${i}` })
    );
    
    await exportToPDF(products);
    
    const mockInstance = jsPDF.mock.results[0].value;
    // Should add pages for: cover, products table, top performers
    expect(mockInstance.addPage).toHaveBeenCalled();
  });

  // ============================================
  // TEST 4: Filename includes timestamp
  // ============================================
  test('uses custom filename when provided', async () => {
    const jsPDF = require('jspdf');
    const product = createProduct();
    const customFilename = 'my-custom-report.pdf';
    
    await exportToPDF([product], customFilename);
    
    const mockInstance = jsPDF.mock.results[0].value;
    expect(mockInstance.save).toHaveBeenCalledWith(customFilename);
  });

  test('generates default filename with timestamp', async () => {
    const jsPDF = require('jspdf');
    const product = createProduct();
    
    await exportToPDF([product]);
    
    const mockInstance = jsPDF.mock.results[0].value;
    const savedFilename = mockInstance.save.mock.calls[0][0];
    
    // Should contain 'products' and have .pdf extension
    expect(savedFilename).toContain('products');
    expect(savedFilename).toMatch(/\.pdf$/);
  });

  // ============================================
  // TEST 5: Summary calculations
  // ============================================
  test('calculates summary metrics correctly', () => {
    const products = [
      createProduct({ profitPerUnit: 10, profitMargin: 20, totalMonthlyProfit: 300, healthScore: 60 }),
      createProduct({ profitPerUnit: 15, profitMargin: 30, totalMonthlyProfit: 450, healthScore: 75 })
    ];
    
    const analytics = generateAnalytics(products);
    
    expect(analytics.summary.totalProducts).toBe(2);
    expect(analytics.summary.totalMonthlyProfit).toBe(750); // 300 + 450
    expect(analytics.summary.averageProfitMargin).toBe(25); // (20 + 30) / 2
    expect(analytics.summary.averageHealthScore).toBe(67.5); // (60 + 75) / 2
  });

  test('handles products with varying metrics', () => {
    const products = [
      createProduct({ profitPerUnit: -5, profitMargin: -10, healthScore: 20 }),
      createProduct({ profitPerUnit: 20, profitMargin: 40, healthScore: 85 }),
      createProduct({ profitPerUnit: 0, profitMargin: 0, healthScore: 50 })
    ];
    
    const analytics = generateAnalytics(products);
    
    expect(analytics.profitability.profitableCount).toBe(1); // Only second product
    expect(analytics.profitability.unprofitableCount).toBe(2); // First and third
    expect(analytics.summary.averageHealthScore).toBe(51.67); // (20 + 85 + 50) / 3
  });

  // ============================================
  // TEST 6: Blob export
  // ============================================
  test('exportToPDFBlob returns a Blob', async () => {
    const product = createProduct();
    
    const blob = await exportToPDFBlob([product]);
    
    expect(blob).toBeInstanceOf(Blob);
  });

  test('exportToPDFBlob throws error for empty array', async () => {
    await expect(exportToPDFBlob([])).rejects.toThrow('No products to export');
  });

  // ============================================
  // TEST 7: Risk indicators
  // ============================================
  test('includes risk indicators in product table', async () => {
    const products = [
      createProduct({ profitabilityRisk: 'red' }),
      createProduct({ profitabilityRisk: 'yellow' }),
      createProduct({ profitabilityRisk: 'green' })
    ];
    
    await expect(exportToPDF(products)).resolves.not.toThrow();
  });

  // ============================================
  // TEST 8: Top performers section
  // ============================================
  test('includes top performers when products exist', async () => {
    const products = [
      createProduct({ name: 'Low Profit', profitPerUnit: 5 }),
      createProduct({ name: 'High Profit', profitPerUnit: 50 }),
      createProduct({ name: 'Medium Profit', profitPerUnit: 20 })
    ];
    
    const analytics = generateAnalytics(products);
    
    expect(analytics.topPerformers.length).toBeGreaterThan(0);
    expect(analytics.topPerformers[0].profitPerUnit).toBe(50); // Highest profit first
  });

  // ============================================
  // TEST 9: Alerts section
  // ============================================
  test('includes alerts when present', async () => {
    const products = [
      createProduct({ profitPerUnit: -10, profitabilityRisk: 'red' }),
      createProduct({ profitPerUnit: -5, profitabilityRisk: 'red' })
    ];
    
    const analytics = generateAnalytics(products);
    
    expect(analytics.alerts.length).toBeGreaterThan(0);
  });

  // ============================================
  // TEST 10: Large dataset handling
  // ============================================
  test('handles large dataset without errors', async () => {
    const products = Array.from({ length: 100 }, (_, i) => 
      createProduct({
        name: `Product ${i}`,
        asin: `B08TEST${String(i).padStart(4, '0')}`,
        profitPerUnit: Math.random() * 50,
        healthScore: Math.floor(Math.random() * 100)
      })
    );
    
    await expect(exportToPDF(products)).resolves.not.toThrow();
  });

  // ============================================
  // TEST 11: Product name truncation
  // ============================================
  test('truncates long product names', async () => {
    const longName = 'This is a very long product name that should be truncated to fit in the PDF table without breaking the layout';
    const product = createProduct({ name: longName });
    
    await expect(exportToPDF([product])).resolves.not.toThrow();
  });

  // ============================================
  // TEST 12: Multiple categories
  // ============================================
  test('handles products from multiple categories', async () => {
    const products = [
      createProduct({ category: 'Electronics' }),
      createProduct({ category: 'Home' }),
      createProduct({ category: 'Sports' }),
      createProduct({ category: 'Books' })
    ];
    
    const analytics = generateAnalytics(products);
    
    expect(Object.keys(analytics.riskDistribution.byCategory).length).toBe(4);
  });
});
