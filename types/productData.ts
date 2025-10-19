export interface ProductData {
  id: string;
  productName: string;
  category: string;           // e.g. "Electronics", "Beauty"
  marketplace: string;        // e.g. "Amazon.de", "Amazon.fr"
  cost: number;               // Supplier or manufacturing cost
  price: number;              // Selling price on Amazon
  weight: number;             // in grams
  dimensions: {               // in cm
    length: number;
    width: number;
    height: number;
  };
  currency: "EUR" | "MAD" | "USD";
  vatRate?: number;           // optional — auto-calculated per marketplace if missing
  shippingMethod?: string;    // e.g. "FBA", "FBM", optional input
  calculated: {               // these are generated internally
    amazonFee: number;
    vat: number;
    shippingCost: number;
    netProfit: number;
    roi: number;
    profitMargin: number;
  };
}

// Alternative: You can also export as a type if preferred
export type ProductDataType = ProductData;
