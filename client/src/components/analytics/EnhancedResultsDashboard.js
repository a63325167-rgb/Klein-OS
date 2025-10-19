import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PieChart,
  Lightbulb,
  FileSpreadsheet,
  Target,
  RotateCcw,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  ChevronDown,
  Info
} from 'lucide-react';
import PerformanceCharts from './PerformanceCharts';
import InsightFeed from './InsightFeed';
import BulkUploader from './BulkUploader';
import RecommendationCard from './RecommendationCard';
import {
  analyzePerformanceTier,
  generateInsights,
  generateRecommendations,
  generateChartData
} from '../../utils/businessIntelligence';

const EnhancedResultsDashboard = ({ result, onReset, onReRun }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);
  const [vatBreakdownExpanded, setVatBreakdownExpanded] = useState(false);

  // Generate analytics data
  const performanceTier = useMemo(() => analyzePerformanceTier(result), [result]);
  const insights = useMemo(() => generateInsights(result), [result]);
  const recommendations = useMemo(() => generateRecommendations(result), [result]);
  const chartData = useMemo(() => generateChartData(result), [result]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'charts', label: 'Analytics', icon: PieChart },
    { id: 'insights', label: 'Intelligence', icon: Lightbulb },
    { id: 'bulk', label: 'Bulk Upload', icon: FileSpreadsheet },
    { id: 'recommendations', label: 'Actions', icon: Target }
  ];

  const getMarginColor = (margin) => {
    if (margin >= 20) return 'text-green-400';
    if (margin >= 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-white dark:bg-slate-900 py-4">
      {/* Professional subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-10 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-blue-50 dark:from-blue-950 dark:via-transparent dark:to-blue-950" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
                  Business Intelligence Dashboard
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-slate-600 dark:text-slate-400">
                    Advanced analytics & insights for {result.input.product_name}
                  </p>
                  {result.timestamp && (
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {formatTimestamp(result.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReRun}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Recalculate
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-all"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const dataStr = JSON.stringify(result, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `analysis-${result.input.product_name}-${Date.now()}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>

          {/* Small Package status banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`border-2 rounded-xl p-4 ${
              result.smallPackageCheck.isEligible
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.smallPackageCheck.isEligible ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${
                  result.smallPackageCheck.isEligible ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                }`}>
                  {result.smallPackageCheck.message}
                </p>
                {!result.smallPackageCheck.isEligible && result.smallPackageCheck.failures && (
                  <p className="text-sm text-gray-400 mt-1">
                    Issues: {result.smallPackageCheck.failures.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-lg"
                  >
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">Revenue</div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                      {formatCurrency(result.input.selling_price)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Per unit</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05 }}
                    className={`bg-white dark:bg-slate-800 ${
                      result.totals.profit_margin >= 20
                        ? 'border-green-300 dark:border-green-700'
                        : 'border-yellow-300 dark:border-yellow-700'
                    } border rounded-xl p-6 shadow-lg`}
                  >
                    <div className={`text-sm mb-2 font-medium ${getMarginColor(result.totals.profit_margin)}`}>
                      Profit Margin
                    </div>
                    <div className={`text-3xl font-bold ${getMarginColor(result.totals.profit_margin)} mb-1`}>
                      {result.totals.profit_margin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {performanceTier.tier} performance
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-lg"
                  >
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">ROI</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {result.totals.roi_percent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Return on investment</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-lg"
                  >
                    <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">Net Profit</div>
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatCurrency(result.totals.net_profit)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">After all costs</div>
                  </motion.div>
                </div>

                {/* VAT Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">VAT Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Debug Information - Remove after testing */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-xs">
                        <strong>Debug:</strong> Seller: {result.input.seller_country || result.input.destination_country}, 
                        Buyer: {result.input.buyer_country || result.input.destination_country}, 
                        Storage: {result.input.storage_country}, 
                        Fulfillment: {result.input.fulfillment_method || 'FBA'}, 
                        Type: {result.input.transaction_type || 'B2C'}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Applicable Rate</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {result.vat.rate}% ({result.input.buyer_country || result.input.destination_country} - Standard)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Category</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {result.input.category} (standard rate)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Transaction Type</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {(() => {
                          // Calculate transaction type based on same logic as Rule Applied
                          const sellerCountry = result.input.seller_country || result.input.destination_country;
                          const buyerCountry = result.input.buyer_country || result.input.destination_country;
                          const transactionType = result.input.transaction_type || 'B2C';
                          
                          // Check if domestic sale
                          const isDomestic = sellerCountry === buyerCountry;
                          
                          if (transactionType === 'B2B') {
                            return isDomestic ? 'B2B Domestic' : 'B2B Cross-border';
                          } else {
                            return isDomestic ? 'B2C Domestic' : 'B2C Cross-border';
                          }
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Rule Applied</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {(() => {
                          // Calculate VAT rule based on transaction details
                          const sellerCountry = result.input.seller_country || result.input.destination_country;
                          const buyerCountry = result.input.buyer_country || result.input.destination_country;
                          const storageCountry = result.input.storage_country;
                          const fulfillmentMethod = result.input.fulfillment_method || 'FBA';
                          const transactionType = result.input.transaction_type || 'B2C';
                          const sellingPrice = parseFloat(result.input.selling_price) || 0;
                          const annualVolume = parseInt(result.input.annual_volume) || 500;
                          const annualSales = sellingPrice * annualVolume;
                          
                          // Check if domestic sale
                          const isDomestic = sellerCountry === buyerCountry;
                          
                          // Check if B2B reverse charge
                          const isReverseCharge = transactionType === 'B2B' && !isDomestic;
                          
                          // Check if local sale in storage country (FBA)
                          const isLocalSale = fulfillmentMethod === 'FBA' && 
                                             storageCountry && 
                                             storageCountry === buyerCountry;
                          
                          // Check if distance selling threshold applies
                          const isDistanceSelling = !isDomestic && 
                                                 !isReverseCharge && 
                                                 !isLocalSale && 
                                                 annualSales >= 10000;
                          
                          if (isReverseCharge) {
                            return 'Reverse charge (buyer accounts for VAT)';
                          } else if (isLocalSale) {
                            return `Local sale in ${buyerCountry} (FBA inventory stored in destination country)`;
                          } else if (isDomestic) {
                            return 'Domestic sale (seller and buyer in same country)';
                          } else if (isDistanceSelling) {
                            return 'Destination country VAT (exceeds €10,000 distance selling threshold)';
                          } else {
                            return 'Origin country VAT (below €10,000 distance selling threshold)';
                          }
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">VAT Registration Required</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {(() => {
                          const sellerCountry = result.input.seller_country || result.input.destination_country;
                          const buyerCountry = result.input.buyer_country || result.input.destination_country;
                          const storageCountry = result.input.storage_country;
                          const fulfillmentMethod = result.input.fulfillment_method || 'FBA';
                          const transactionType = result.input.transaction_type || 'B2C';
                          
                          const isDomestic = sellerCountry === buyerCountry;
                          const isReverseCharge = transactionType === 'B2B' && !isDomestic;
                          const isLocalSale = fulfillmentMethod === 'FBA' && storageCountry && storageCountry === buyerCountry;
                          
                          if (isReverseCharge) {
                            return 'No (reverse charge applies)';
                          } else if (isLocalSale) {
                            return `Yes (${storageCountry})`;
                          } else if (isDomestic) {
                            return `Yes (${sellerCountry})`;
                          } else {
                            return `Yes (${buyerCountry})`;
                          }
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">OSS Eligible</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {(() => {
                          const sellerCountry = result.input.seller_country || result.input.destination_country;
                          const buyerCountry = result.input.buyer_country || result.input.destination_country;
                          const storageCountry = result.input.storage_country;
                          const fulfillmentMethod = result.input.fulfillment_method || 'FBA';
                          const transactionType = result.input.transaction_type || 'B2C';
                          
                          const isDomestic = sellerCountry === buyerCountry;
                          const isReverseCharge = transactionType === 'B2B' && !isDomestic;
                          const isLocalSale = fulfillmentMethod === 'FBA' && storageCountry && storageCountry === buyerCountry;
                          
                          if (isDomestic) {
                            return 'No (domestic transaction)';
                          } else if (isReverseCharge) {
                            return 'No (B2B reverse charge)';
                          } else if (isLocalSale) {
                            return 'No (local sale in storage country)';
                          } else {
                            return 'Yes (cross-border B2C sale)';
                          }
                        })()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Dynamic VAT Rule Explanation */}
                  <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-800/30 rounded-lg border border-blue-300 dark:border-blue-600">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-3.5 h-3.5 text-blue-700 dark:text-blue-300" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          Why This VAT Rate Applies
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                          {(() => {
                            // Calculate VAT rule explanation based on transaction details
                            const sellerCountry = result.input.seller_country || result.input.destination_country;
                            const buyerCountry = result.input.buyer_country || result.input.destination_country;
                            const storageCountry = result.input.storage_country;
                            const fulfillmentMethod = result.input.fulfillment_method || 'FBA';
                            const transactionType = result.input.transaction_type || 'B2C';
                            const sellingPrice = parseFloat(result.input.selling_price) || 0;
                            const annualVolume = parseInt(result.input.annual_volume) || 500;
                            const annualSales = sellingPrice * annualVolume;
                            
                            // Check if domestic sale
                            const isDomestic = sellerCountry === buyerCountry;
                            
                            // Check if B2B reverse charge
                            const isReverseCharge = transactionType === 'B2B' && !isDomestic;
                            
                            // Check if local sale in storage country (FBA)
                            const isLocalSale = fulfillmentMethod === 'FBA' && 
                                               storageCountry && 
                                               storageCountry === buyerCountry;
                            
                            // Check if distance selling threshold applies
                            const isDistanceSelling = !isDomestic && 
                                                     !isReverseCharge && 
                                                     !isLocalSale && 
                                                     annualSales >= 10000;
                            
                            if (isReverseCharge) {
                              return `Cross-border B2B sale (${sellerCountry} → ${buyerCountry}). Using 0% VAT because reverse charge applies - the buyer accounts for VAT in their own country.`;
                            } else if (isLocalSale) {
                              return `Local sale in ${buyerCountry}. Using ${buyerCountry} VAT (${result.vat.rate}%) because your FBA inventory is stored in ${buyerCountry} (customer country).`;
                            } else if (isDomestic) {
                              return `Domestic sale in ${sellerCountry}. Using ${sellerCountry} VAT (${result.vat.rate}%) for both seller and buyer in same country.`;
                            } else if (isDistanceSelling) {
                              return `Cross-border sale (${sellerCountry} → ${buyerCountry}). Using ${buyerCountry} VAT (${result.vat.rate}%) because your annual cross-border sales (€${annualSales.toLocaleString()}) exceed the €10,000 distance selling threshold.`;
                            } else {
                              return `Cross-border sale (${sellerCountry} → ${buyerCountry}). Using ${sellerCountry} VAT (${result.vat.rate}%) because your annual cross-border sales (€${annualSales.toLocaleString()}) are below the €10,000 distance selling threshold.`;
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <a 
                      href="#" 
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Learn more about EU VAT rules →
                    </a>
                  </div>
                </motion.div>

                {/* Cost breakdown */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Financial Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Buying Price</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(result.input.buying_price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Amazon Fee ({result.amazonFee.rate}%)</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(result.amazonFee.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Shipping ({result.shipping.type})</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(result.shipping.net || result.shipping.cost)}</span>
                    </div>
                    
                    {/* VAT Breakdown - Expandable EU Methodology */}
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                      <button
                        onClick={() => setVatBreakdownExpanded(!vatBreakdownExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            VAT Breakdown ({result.vat.rate}%)
                          </span>
                          <div className="group relative">
                            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              In EU, you collect VAT from customers but can reclaim VAT paid on business expenses. Net VAT Liability is what you actually remit to tax authorities.
                            </div>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: vatBreakdownExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {vatBreakdownExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 pl-3">
                              {/* Debug Information - Remove after testing */}
                              {process.env.NODE_ENV === 'development' && (
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded text-xs mb-3">
                                  <strong>VAT Debug:</strong><br/>
                                  Output VAT: €{result.vat.outputVAT?.toFixed(2) || 0}<br/>
                                  Input VAT COGS: -€{result.vat.inputVAT_COGS?.toFixed(2) || 0}<br/>
                                  Input VAT Fees: -€{result.vat.inputVAT_AmazonFee?.toFixed(2) || 0}<br/>
                                  Input VAT Shipping: -€{result.vat.inputVAT_Shipping?.toFixed(2) || 0}<br/>
                                  Input VAT Return: -€{result.vat.inputVAT_ReturnBuffer?.toFixed(2) || 0}<br/>
                                  <strong>Net VAT: €{result.vat.netVATLiability?.toFixed(2) || 0}</strong>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Output VAT (collected from customer)</span>
                                <span className="text-sm text-slate-800 dark:text-white font-medium">{formatCurrency(result.vat.outputVAT || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Input VAT (reclaimable on COGS)</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">-{formatCurrency(result.vat.inputVAT_COGS || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Input VAT (reclaimable on Amazon fees)</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">-{formatCurrency(result.vat.inputVAT_AmazonFee || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Input VAT (reclaimable on shipping)</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">-{formatCurrency(result.vat.inputVAT_Shipping || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Input VAT (reclaimable on return buffer)</span>
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium">-{formatCurrency(result.vat.inputVAT_ReturnBuffer || 0)}</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Net VAT Liability (what you pay tax office)</span>
                                <span className="text-sm text-slate-800 dark:text-white font-bold">{formatCurrency(result.vat.netVATLiability || 0)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-slate-600 dark:text-slate-400">Return Buffer</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(result.returnBuffer)}</span>
                    </div>
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center">
                      <span className="text-slate-800 dark:text-white font-bold text-lg">Total Costs</span>
                      <span className="text-slate-800 dark:text-white font-bold text-xl">{formatCurrency(result.totals.total_cost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'charts' && (
              <PerformanceCharts chartData={chartData} result={result} />
            )}

            {/* Intelligence Tab */}
            {activeTab === 'insights' && (
              <InsightFeed insights={insights} performanceTier={performanceTier} />
            )}

            {/* Bulk Upload Tab */}
            {activeTab === 'bulk' && (
              <BulkUploader />
            )}

            {/* Recommendations Tab */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Actionable Recommendations
                </h3>
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => (
                    <RecommendationCard key={index} recommendation={rec} index={index} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer with neon border */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 relative"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-700 to-transparent" />
          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>Powered by AI-driven analytics • Real-time insights • {new Date().getFullYear()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedResultsDashboard;

