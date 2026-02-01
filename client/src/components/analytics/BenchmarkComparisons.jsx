import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import BenchmarkComparison from './BenchmarkComparison';
import { 
  compareMargin, 
  compareROI, 
  compareFee, 
  compareShipping 
} from '../../utils/benchmarkData';

/**
 * Format currency for display
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value || 0);
};

/**
 * Format percentage for display
 */
const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

/**
 * BenchmarkComparisons Component
 * Displays all benchmark comparisons for a product
 */
const BenchmarkComparisons = ({ result }) => {
  const hasData = !!(result && result.totals);
  
  // Extract data with safety defaults
  const totals = (result && result.totals) || {};
  const input = (result && result.input) || {};
  const amazonFee = (result && result.amazonFee) || { amount: 0 };
  const shipping = (result && result.shipping) || { cost: 0 };
  
  const netProfit = totals.net_profit || 0;
  const margin = totals.profit_margin || 0;
  const roi = totals.roi_percent || 0;
  const revenue = parseFloat(input.selling_price) || 0;
  const category = input.category || 'general';
  const weight = parseFloat(input.weight_kg) || 0;
  const feeAmount = amazonFee.amount || 0;
  const feePercent = revenue > 0 ? (feeAmount / revenue) * 100 : 0;
  const shippingCost = shipping.cost || 0;
  const shippingPercent = revenue > 0 ? (shippingCost / revenue) * 100 : 0;
  
  // Generate comparisons
  const marginComparison = useMemo(() => compareMargin(margin, category), [margin, category]);
  const roiComparison = useMemo(() => compareROI(roi), [roi]);
  const feeComparison = useMemo(() => compareFee(feePercent, 'fba'), [feePercent]);
  const shippingComparison = useMemo(() => compareShipping(shippingCost, weight), [shippingCost, weight]);
  
  if (!hasData) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
        <p>Insufficient data to generate benchmark comparisons.</p>
        <p className="text-xs mt-1">Run a calculation to see how you stack up against the market.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">How Does This Compare?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          See how your product metrics compare to industry benchmarks and similar products.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Net Profit & Margin */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BenchmarkComparison
            label="Profit Margin"
            value={margin}
            valueFormatted={formatPercent}
            comparison={marginComparison}
            additionalInfo={`${formatCurrency(netProfit)} net profit`}
          />
        </motion.div>
        
        {/* ROI */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BenchmarkComparison
            label="Return on Investment (ROI)"
            value={roi}
            valueFormatted={formatPercent}
            comparison={roiComparison}
          />
        </motion.div>
        
        {/* Amazon Fee */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BenchmarkComparison
            label="Amazon Fee"
            value={feePercent}
            valueFormatted={(val) => `${val.toFixed(1)}%`}
            comparison={feeComparison}
            additionalInfo={`${formatCurrency(feeAmount)} (${feePercent.toFixed(0)}% of revenue)`}
            reverseScale={true}
          />
        </motion.div>
        
        {/* Shipping */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <BenchmarkComparison
            label="Shipping Cost"
            value={shippingCost}
            valueFormatted={formatCurrency}
            comparison={shippingComparison}
            additionalInfo={`${shippingPercent.toFixed(1)}% of revenue`}
            reverseScale={true}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default BenchmarkComparisons;
