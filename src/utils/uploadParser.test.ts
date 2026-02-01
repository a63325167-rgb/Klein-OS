// src/utils/uploadParser.test.ts

import { parseUploadFile } from './uploadParser';

describe('uploadParser', () => {
  // ============================================
  // TEST 1: VALID CSV FILE
  // ============================================
  
  test('parses valid CSV file with all required fields', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Wireless Headphones,79.99,25.00,45
B08ABC5678,USB-C Cable,15.99,5.00,120`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.totalRows).toBe(2);

    // Check first product
    const product1 = result.rows[0];
    expect(product1.asin).toBe('B08XYZ1234');
    expect(product1.name).toBe('Wireless Headphones');
    expect(product1.price).toBe(79.99);
    expect(product1.cogs).toBe(25.00);
    expect(product1.velocity).toBe(45);
    
    // Check defaults applied
    expect(product1.returnRate).toBe(5);
    expect(product1.referralFee).toBe(15);
    expect(product1.fbaFee).toBe(8);
    expect(product1.vat).toBe(19);
    expect(product1.shippingCost).toBe(2);
    expect(product1.initialOrder).toBe(90); // velocity * 2
    expect(product1.initialCash).toBe(5000);
    expect(product1.competitorCount).toBe(0);
    expect(product1.rating).toBe(3.5);
    expect(product1.category).toBe('Uncategorized');

    // Check calculated fields exist
    expect(product1).toHaveProperty('profitPerUnit');
    expect(product1).toHaveProperty('profitMargin');
    expect(product1).toHaveProperty('healthScore');
  });

  // ============================================
  // TEST 2: CSV WITH OPTIONAL FIELDS
  // ============================================
  
  test('parses CSV with optional fields provided', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity,ReturnRate,ReferralFee,FBAFee,VAT,ShippingCost,InitialOrder,InitialCash,CompetitorCount,Rating,Category
B08XYZ1234,Premium Product,100.00,40.00,30,3,12,6,20,3,100,10000,5,4.5,Electronics`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const product = result.rows[0];
    expect(product.returnRate).toBe(3);
    expect(product.referralFee).toBe(12);
    expect(product.fbaFee).toBe(6);
    expect(product.vat).toBe(20);
    expect(product.shippingCost).toBe(3);
    expect(product.initialOrder).toBe(100);
    expect(product.initialCash).toBe(10000);
    expect(product.competitorCount).toBe(5);
    expect(product.rating).toBe(4.5);
    expect(product.category).toBe('Electronics');
  });

  // ============================================
  // TEST 3: INVALID ASIN
  // ============================================
  
  test('rejects row with invalid ASIN (not 10 characters)', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ,Short ASIN,50.00,20.00,30
B08XYZ1234,Valid Product,50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.totalRows).toBe(2);

    // Check error
    const error = result.errors[0];
    expect(error.rowIndex).toBe(2); // First data row
    expect(error.field).toBe('asin');
    expect(error.value).toBe('B08XYZ');
    expect(error.error).toContain('10');
    expect(error.fixable).toBe(false);

    // Check valid row was processed
    expect(result.rows[0].asin).toBe('B08XYZ1234');
  });

  // ============================================
  // TEST 4: MISSING REQUIRED FIELD
  // ============================================
  
  test('rejects row with missing required field (name)', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,,50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);

    const error = result.errors[0];
    expect(error.field).toBe('name');
    expect(error.fixable).toBe(false);
  });

  // ============================================
  // TEST 5: INVALID PRICE
  // ============================================
  
  test('rejects row with invalid price (not a number)', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product Name,invalid,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);

    const error = result.errors[0];
    expect(error.field).toBe('price');
    expect(error.value).toBe('invalid');
    expect(error.fixable).toBe(false);
  });

  // ============================================
  // TEST 6: ZERO VELOCITY
  // ============================================
  
  test('accepts zero velocity with warning', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,New Product,50.00,20.00,0`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);

    // Check warning message
    const velocityWarning = result.warnings.find(w => w.includes('velocity'));
    expect(velocityWarning).toBeDefined();

    // Check product calculations
    const product = result.rows[0];
    expect(product.velocity).toBe(0);
    expect(product.breakEvenDays).toBe(999); // Special case
    expect(product.turnoverDays).toBe(999); // Special case
  });

  // ============================================
  // TEST 7: HIGH COMPETITION WARNING
  // ============================================
  
  test('generates warning for high competition', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity,CompetitorCount
B08XYZ1234,Competitive Product,50.00,20.00,30,35`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.warnings.length).toBeGreaterThan(0);

    const competitionWarning = result.warnings.find(w => w.includes('competition'));
    expect(competitionWarning).toBeDefined();
    expect(competitionWarning).toContain('35');
  });

  // ============================================
  // TEST 8: DUPLICATE ASIN WARNING
  // ============================================
  
  test('generates warning for duplicate ASINs', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product 1,50.00,20.00,30
B08XYZ1234,Product 2,60.00,25.00,40`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(2);
    expect(result.warnings.length).toBeGreaterThan(0);

    const duplicateWarning = result.warnings.find(w => w.includes('Duplicate'));
    expect(duplicateWarning).toBeDefined();
    expect(duplicateWarning).toContain('B08XYZ1234');
  });

  // ============================================
  // TEST 9: EMPTY FILE
  // ============================================
  
  test('throws error for empty file', async () => {
    const csvContent = '';
    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });

    await expect(parseUploadFile(file)).rejects.toThrow('empty');
  });

  // ============================================
  // TEST 10: UNSUPPORTED FORMAT
  // ============================================
  
  test('throws error for unsupported file format', async () => {
    const content = '{"data": "json"}';
    const file = new File([content], 'products.json', { type: 'application/json' });

    await expect(parseUploadFile(file)).rejects.toThrow('Unsupported');
  });

  // ============================================
  // TEST 11: CASE-INSENSITIVE HEADERS
  // ============================================
  
  test('handles case-insensitive column headers', async () => {
    const csvContent = `asin,name,price,cogs,velocity
B08XYZ1234,Product Name,50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].asin).toBe('B08XYZ1234');
  });

  // ============================================
  // TEST 12: MIXED VALID AND INVALID ROWS
  // ============================================
  
  test('processes mixed valid and invalid rows correctly', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Valid Product 1,50.00,20.00,30
B08XYZ,Invalid ASIN,50.00,20.00,30
B08ABC5678,Valid Product 2,60.00,25.00,40
B08DEF9012,,70.00,30.00,50
B08GHI3456,Valid Product 3,80.00,35.00,60`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(3); // 3 valid rows
    expect(result.errors).toHaveLength(2); // 2 invalid rows
    expect(result.totalRows).toBe(5);

    // Check valid products
    expect(result.rows[0].name).toBe('Valid Product 1');
    expect(result.rows[1].name).toBe('Valid Product 2');
    expect(result.rows[2].name).toBe('Valid Product 3');

    // Check errors
    expect(result.errors[0].field).toBe('asin');
    expect(result.errors[1].field).toBe('name');
  });

  // ============================================
  // TEST 13: INVALID OPTIONAL FIELD GETS DEFAULT
  // ============================================
  
  test('applies default when optional field is invalid', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity,ReturnRate,Rating
B08XYZ1234,Product Name,50.00,20.00,30,invalid,invalid`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(0);

    const product = result.rows[0];
    expect(product.returnRate).toBe(5); // Default
    expect(product.rating).toBe(3.5); // Default
  });

  // ============================================
  // TEST 14: WHITESPACE HANDLING
  // ============================================
  
  test('trims whitespace from fields', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
  B08XYZ1234  ,  Product Name  ,50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].asin).toBe('B08XYZ1234');
    expect(result.rows[0].name).toBe('Product Name');
  });

  // ============================================
  // TEST 15: LARGE FILE (PERFORMANCE)
  // ============================================
  
  test('handles large file with 100+ products', async () => {
    let csvContent = 'ASIN,Name,Price,COGS,Velocity\n';
    
    // Generate 100 products
    for (let i = 0; i < 100; i++) {
      const asin = `B08XYZ${String(i).padStart(4, '0')}`;
      csvContent += `${asin},Product ${i},${50 + i},${20 + i},${30 + i}\n`;
    }

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(100);
    expect(result.errors).toHaveLength(0);
    expect(result.totalRows).toBe(100);

    // Verify calculations were performed
    result.rows.forEach(product => {
      expect(product).toHaveProperty('profitPerUnit');
      expect(product).toHaveProperty('healthScore');
      expect(isFinite(product.profitPerUnit)).toBe(true);
    });
  });

  // ============================================
  // TEST 16: ASIN UPPERCASE CONVERSION
  // ============================================
  
  test('converts ASIN to uppercase', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
b08xyz1234,Product Name,50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].asin).toBe('B08XYZ1234'); // Uppercase
  });

  // ============================================
  // TEST 17: NEGATIVE PRICE REJECTION
  // ============================================
  
  test('rejects negative price', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product Name,-50.00,20.00,30`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('price');
  });

  // ============================================
  // TEST 18: NEGATIVE VELOCITY REJECTION
  // ============================================
  
  test('rejects negative velocity', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product Name,50.00,20.00,-10`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].field).toBe('velocity');
  });

  // ============================================
  // TEST 19: EMPTY ROWS SKIPPED
  // ============================================
  
  test('skips empty rows', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product 1,50.00,20.00,30

B08ABC5678,Product 2,60.00,25.00,40`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows).toHaveLength(2);
    expect(result.totalRows).toBe(2); // Empty row not counted
  });

  // ============================================
  // TEST 20: ROW INDEX TRACKING
  // ============================================
  
  test('tracks correct row indices', async () => {
    const csvContent = `ASIN,Name,Price,COGS,Velocity
B08XYZ1234,Product 1,50.00,20.00,30
B08ABC5678,Product 2,60.00,25.00,40`;

    const file = new File([csvContent], 'products.csv', { type: 'text/csv' });
    const result = await parseUploadFile(file);

    expect(result.rows[0].rowIndex).toBe(2); // First data row
    expect(result.rows[1].rowIndex).toBe(3); // Second data row
  });
});
