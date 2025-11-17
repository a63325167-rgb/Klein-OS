/**
 * Platform Configuration Service
 * 
 * Defines platform-specific fee structures and input field requirements
 * Single source of truth for all platform configurations
 */

const platformConfig = {
  amazon: {
    label: 'Amazon',
    subOptions: [
      { value: 'fba', label: 'FBA (Fulfilled by Amazon)' },
      { value: 'fbm', label: 'FBM (Fulfilled by Merchant)' }
    ],
    inputFields: {
      fba: [
        { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
        { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', required: true },
        { name: 'referralFeePercent', label: 'Referral Fee %', type: 'number', required: true, hint: 'Usually 15%' },
        { name: 'fbaFeePerUnit', label: 'FBA Fee (per unit)', type: 'number', required: true },
        { name: 'weight', label: 'Weight (kg)', type: 'number', required: true, hint: 'For size tier calculation' },
        { name: 'length', label: 'Length (cm)', type: 'number', required: false },
        { name: 'width', label: 'Width (cm)', type: 'number', required: false },
        { name: 'height', label: 'Height (cm)', type: 'number', required: false },
        { name: 'category', label: 'Product Category', type: 'select', required: true, options: ['Electronics', 'Clothing', 'Books', 'Other'] }
      ],
      fbm: [
        { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
        { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', required: true },
        { name: 'referralFeePercent', label: 'Referral Fee %', type: 'number', required: true, hint: 'Usually 15%' },
        { name: 'shippingCostPerUnit', label: 'Shipping Cost (per unit)', type: 'number', required: true },
        { name: 'category', label: 'Product Category', type: 'select', required: true, options: ['Electronics', 'Clothing', 'Books', 'Other'] }
      ]
    },
    feeCalculation: (data) => {
      const referralFee = data.sellingPrice * (data.referralFeePercent / 100);
      if (data.type === 'fba') {
        return { referralFee, fbaFee: data.fbaFeePerUnit, totalFees: referralFee + data.fbaFeePerUnit };
      } else {
        return { referralFee, shippingCost: data.shippingCostPerUnit, totalFees: referralFee + data.shippingCostPerUnit };
      }
    }
  },
  shopify: {
    label: 'Shopify',
    subOptions: null,
    inputFields: [
      { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', required: true },
      { name: 'shopifyCommissionPercent', label: 'Shopify Commission %', type: 'number', required: true, hint: 'Usually 2.9%' },
      { name: 'paymentProcessingPercent', label: 'Payment Processing %', type: 'number', required: true, hint: 'Usually 2.9% (Stripe)' },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (per unit)', type: 'number', required: true }
    ],
    feeCalculation: (data) => {
      const shopifyFee = data.sellingPrice * (data.shopifyCommissionPercent / 100);
      const paymentFee = data.sellingPrice * (data.paymentProcessingPercent / 100);
      return { shopifyFee, paymentFee, shippingCost: data.shippingCostPerUnit, totalFees: shopifyFee + paymentFee + data.shippingCostPerUnit };
    }
  },
  ebay: {
    label: 'eBay',
    subOptions: null,
    inputFields: [
      { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', required: true },
      { name: 'finalValueFeePercent', label: 'Final Value Fee %', type: 'number', required: true, hint: 'Usually 12.9%' },
      { name: 'paymentProcessingPercent', label: 'Payment Processing %', type: 'number', required: true, hint: 'Usually 3.5%' },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (per unit)', type: 'number', required: true }
    ],
    feeCalculation: (data) => {
      const finalValueFee = data.sellingPrice * (data.finalValueFeePercent / 100);
      const paymentFee = data.sellingPrice * (data.paymentProcessingPercent / 100);
      return { finalValueFee, paymentFee, shippingCost: data.shippingCostPerUnit, totalFees: finalValueFee + paymentFee + data.shippingCostPerUnit };
    }
  },
  none: {
    label: 'No Platform Fees',
    subOptions: null,
    inputFields: [
      { name: 'sellingPrice', label: 'Selling Price', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold', type: 'number', required: true },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (per unit)', type: 'number', required: true }
    ],
    feeCalculation: (data) => {
      return { totalFees: data.shippingCostPerUnit || 0 };
    }
  }
};

module.exports = platformConfig;








