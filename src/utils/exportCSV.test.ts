// src/utils/exportCSV.test.ts

import { exportToCSV, exportToCSVBlob } from './exportCSV';
import { BulkProductResult } from '../types/upload';

// Mock DOM APIs for testing
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document methods
document.createElement = jest.fn((tag) => {
  const element: any = {
    tagName: tag.toUpperCase(),
    style: {},
    click: jest.fn(),
    setAttribute: jest.fn(),
  };
  return element;
});

document.body.appendChild = jest.fn();
document.body.removeChild = jest.fn();

// Sample test data
const createSampleProduct = (overrides: Partial<BulkProductResult> = {}): BulkProductResult => ({
  rowIndex: 2,
  asin: 'B08XYZ1234',
  name: 'Wireless Headphones',
  price: 79.99,
  cogs: 25.00,
  velocity: 45,
  returnRate: 5,
  referralFee: 15,
  fbaFee: 8,
  vat: 19,
  shippingCost: 2.00,
  initialOrder: 90,
  initialCash: 5000,
  competitorCount: 8,
  rating: 4.2,
  category: 'Electronics',
  profitPerUnit: 15.39,
  profitMargin: 19.25,
  totalMonthlyProfit: 692.76,
  breakEvenDays: 99,
  cashRunway: 5,
  turnoverDays: 60,
  healthScore: 58,
  profitabilityRisk: 'yellow',
  breakEvenRisk: 'yellow',
  cashFlowRisk: 'yellow',
  competitionRisk: 'green',
  inventoryRisk: 'yellow',
  ...overrides
});

describe('exportCSV', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: Export single BulkProductResult with all fields populated
  // ============================================
  test('exports single product with all 30 fields', () => {
    const product = createSampleProduct();
    const csv = exportToCSV([product]);

    // Should contain header row
    expect(csv).toContain('rowIndex,asin,name,price,cogs');
    
    // Should contain data row
    expect(csv).toContain('B08XYZ1234');
    expect(csv).toContain('Wireless Headphones');
    
    // Should have exactly 2 lines (header + 1 data row)
    const lines = csv.split('\n');
    expect(lines.length).toBe(2);
  });

  // ============================================
  // TEST 2: Verify CSV header row is correct and in exact order
  // ============================================
  test('header row contains all 30 fields in exact order', () => {
    const product = createSampleProduct();
    const csv = exportToCSV([product]);
    
    const lines = csv.split('\n');
    const header = lines[0];
    
    const expectedHeaders = [
      'rowIndex', 'asin', 'name', 'price', 'cogs', 'velocity',
      'returnRate', 'referralFee', 'fbaFee', 'vat', 'shippingCost',
      'initialOrder', 'initialCash', 'competitorCount', 'rating', 'category',
      'profitPerUnit', 'profitMargin', 'totalMonthlyProfit',
      'breakEvenDays', 'cashRunway', 'turnoverDays', 'healthScore',
      'profitabilityRisk', 'breakEvenRisk', 'cashFlowRisk',
      'competitionRisk', 'inventoryRisk'
    ];
    
    expect(header).toBe(expectedHeaders.join(','));
  });

  // ============================================
  // TEST 3: Escape commas/quotes/newlines correctly
  // ============================================
  test('escapes special characters in CSV fields', () => {
    const product = createSampleProduct({
      name: 'Product with, comma',
      category: 'Category with "quotes"'
    });
    
    const csv = exportToCSV([product]);
    
    // Comma should be wrapped in quotes
    expect(csv).toContain('"Product with, comma"');
    
    // Quotes should be doubled and wrapped
    expect(csv).toContain('"Category with ""quotes"""');
  });

  test('escapes newlines in product names', () => {
    const product = createSampleProduct({
      name: 'Product\nwith\nnewlines'
    });
    
    const csv = exportToCSV([product]);
    
    // Newlines should be wrapped in quotes
    expect(csv).toContain('"Product\nwith\nnewlines"');
  });

  // ============================================
  // TEST 4: Handle null/undefined values as empty strings
  // ============================================
  test('handles null/undefined values as empty strings', () => {
    const product = createSampleProduct({
      category: undefined as any,
      rating: null as any
    });
    
    const csv = exportToCSV([product]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    
    // Should contain empty fields (consecutive commas)
    expect(dataRow).toContain(',,'); // Empty category field
  });

  // ============================================
  // TEST 5: Format currency correctly (€X.XX)
  // ============================================
  test('formats currency fields as €X.XX', () => {
    const product = createSampleProduct({
      price: 79.99,
      cogs: 25.00,
      profitPerUnit: 15.39,
      shippingCost: 2.50,
      totalMonthlyProfit: 692.76
    });
    
    const csv = exportToCSV([product]);
    
    // Check currency formatting
    expect(csv).toContain('€79.99');
    expect(csv).toContain('€25.00');
    expect(csv).toContain('€15.39');
    expect(csv).toContain('€2.50');
    expect(csv).toContain('€692.76');
  });

  test('formats percentages as decimals', () => {
    const product = createSampleProduct({
      returnRate: 5,      // 5% -> 0.0500
      referralFee: 15,    // 15% -> 0.1500
      profitMargin: 19.25 // 19.25% -> 0.1925
    });
    
    const csv = exportToCSV([product]);
    
    // Check percentage formatting (as decimals)
    expect(csv).toContain('0.0500'); // returnRate
    expect(csv).toContain('0.1500'); // referralFee
    expect(csv).toContain('0.1925'); // profitMargin
  });

  // ============================================
  // TEST 6: Empty array returns header + empty rows
  // ============================================
  test('throws error for empty product array', () => {
    expect(() => exportToCSV([])).toThrow('No products to export');
  });

  // ============================================
  // TEST 7: Large array (100+ products) exports without error
  // ============================================
  test('exports large array of 100+ products without error', () => {
    const products: BulkProductResult[] = [];
    
    for (let i = 0; i < 150; i++) {
      products.push(createSampleProduct({
        rowIndex: i + 2,
        asin: `B08XYZ${String(i).padStart(4, '0')}`,
        name: `Product ${i}`
      }));
    }
    
    const csv = exportToCSV(products);
    
    // Should have 151 lines (1 header + 150 data rows)
    const lines = csv.split('\n');
    expect(lines.length).toBe(151);
    
    // Should contain first and last product
    expect(csv).toContain('B08XYZ0000');
    expect(csv).toContain('B08XYZ0149');
  });

  // ============================================
  // TEST 8: Filename includes timestamp
  // ============================================
  test('generates filename with timestamp when no filename provided', () => {
    const product = createSampleProduct();
    const beforeTime = Date.now();
    
    exportToCSV([product]);
    
    const afterTime = Date.now();
    
    // Check that createElement was called to create download link
    expect(document.createElement).toHaveBeenCalledWith('a');
    
    // The download should have been triggered
    const mockLink: any = (document.createElement as jest.Mock).mock.results[0].value;
    expect(mockLink.click).toHaveBeenCalled();
    
    // Filename should be in format: products-{timestamp}.csv
    expect(mockLink.download).toMatch(/^products-\d+\.csv$/);
    
    // Extract timestamp from filename
    const match = mockLink.download.match(/products-(\d+)\.csv/);
    expect(match).not.toBeNull();
    
    if (match) {
      const timestamp = parseInt(match[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    }
  });

  test('uses custom filename when provided', () => {
    const product = createSampleProduct();
    
    exportToCSV([product], 'my-custom-export.csv');
    
    const mockLink: any = (document.createElement as jest.Mock).mock.results[0].value;
    expect(mockLink.download).toBe('my-custom-export.csv');
  });

  // ============================================
  // TEST 9: Risk fields exported as strings
  // ============================================
  test('exports risk fields as red/yellow/green strings', () => {
    const product = createSampleProduct({
      profitabilityRisk: 'red',
      breakEvenRisk: 'yellow',
      cashFlowRisk: 'green',
      competitionRisk: 'red',
      inventoryRisk: 'yellow'
    });
    
    const csv = exportToCSV([product]);
    
    // Check risk values are present
    expect(csv).toContain('red');
    expect(csv).toContain('yellow');
    expect(csv).toContain('green');
  });

  // ============================================
  // TEST 10: Blob export function
  // ============================================
  test('exportToCSVBlob returns valid Blob', () => {
    const product = createSampleProduct();
    const blob = exportToCSVBlob([product]);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8;');
  });

  test('exportToCSVBlob throws error for empty array', () => {
    expect(() => exportToCSVBlob([])).toThrow('No products to export');
  });

  // ============================================
  // TEST 11: UTF-8 BOM is included
  // ============================================
  test('includes UTF-8 BOM for Excel compatibility', async () => {
    const product = createSampleProduct();
    const blob = exportToCSVBlob([product]);
    
    const text = await blob.text();
    
    // Check for UTF-8 BOM (U+FEFF)
    expect(text.charCodeAt(0)).toBe(0xFEFF);
  });

  // ============================================
  // TEST 12: All numeric fields are properly formatted
  // ============================================
  test('formats all numeric fields correctly', () => {
    const product = createSampleProduct({
      rowIndex: 5,
      velocity: 100,
      initialOrder: 200,
      competitorCount: 15,
      rating: 4.7,
      breakEvenDays: 45,
      cashRunway: 8,
      turnoverDays: 30,
      healthScore: 85
    });
    
    const csv = exportToCSV([product]);
    const lines = csv.split('\n');
    const dataRow = lines[1];
    
    // Check numeric values are present
    expect(dataRow).toContain('5,'); // rowIndex
    expect(dataRow).toContain(',100,'); // velocity
    expect(dataRow).toContain(',200,'); // initialOrder
    expect(dataRow).toContain(',15,'); // competitorCount
    expect(dataRow).toContain(',4.7,'); // rating
    expect(dataRow).toContain(',45,'); // breakEvenDays
    expect(dataRow).toContain(',8,'); // cashRunway
    expect(dataRow).toContain(',30,'); // turnoverDays
    expect(dataRow).toContain(',85,'); // healthScore
  });
});
