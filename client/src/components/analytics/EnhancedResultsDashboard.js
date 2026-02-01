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
import ActionsPanel from './ActionsPanel';
import ProductHealthScoreCard from './ProductHealthScoreCard';
import RiskAssessmentCard from './RiskAssessmentCard';
import CashFlowTimeline from './CashFlowTimeline';
import BenchmarkComparisons from './BenchmarkComparisons';
import ScenarioCalculator from './ScenarioCalculator';
import ExportPDFButton from './ExportPDFButton';
import ExportCSVButton from './ExportCSVButton';
import { H1, H3, Caption, MetricDisplay, BodySmall } from '../ui/Typography';
import {
  analyzePerformanceTier,
  generateInsights,
  generateRecommendations,
  generateChartData
} from '../../utils/businessIntelligence';
import { generateCashFlowProjection } from '../../utils/cashFlowProjection';

const EnhancedResultsDashboard = ({ result, onReset, onReRun }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsView, setAnalyticsView] = useState('performance');
  const [copied, setCopied] = useState(false);
  const [vatBreakdownExpanded, setVatBreakdownExpanded] = useState(false);

  // Ensure result has all required properties with defaults (wrapped in useMemo for performance)
  const safeResult = useMemo(() => {
    if (!result) return null;
    return {
      ...result,
      input: result.input || {
        product_name: 'Unknown Product',
        selling_price: 0,
        buying_price: 0,
        destination_country: 'Germany',
        category: 'Electronics',
        annual_volume: 500
      },
      totals: result.totals || {
        total_cost: 0,
        net_profit: 0,
        roi_percent: 0,
        profit_margin: 0
      },
      smallPackageCheck: result.smallPackageCheck || {
        isEligible: false,
        message: 'Unable to determine eligibility',
        failures: []
      },
      shipping: result.shipping || { cost: 0 },
      amazonFee: result.amazonFee || { amount: 0 },
      vat: result.vat || {
        rate: 19,
        netVATLiability: 0,
        sellingPriceNet: result.input?.selling_price || 0
      },
      returnBuffer: result.returnBuffer || 0
    };
  }, [result]);

  // ALL HOOKS AT TOP (before any conditional returns)
  // Generate analytics data with safe result
  const performanceTier = useMemo(() => {
    if (!safeResult) {
      return { tier: 'UNKNOWN', emoji: '❓', color: 'gray', description: 'Unable to analyze performance' };
    }
    try {
      return analyzePerformanceTier(safeResult);
    } catch (error) {
      console.error('Error analyzing performance tier:', error);
      return { tier: 'UNKNOWN', emoji: '❓', color: 'gray', description: 'Unable to analyze performance' };
    }
  }, [safeResult]);

  const cashFlowProjection = useMemo(() => {
    try {
      return generateCashFlowProjection(safeResult);
    } catch (error) {
      console.error('Error generating cash flow projection:', error);
      return { months: [] };
    }
  }, [safeResult]);

  const insights = useMemo(() => {
    if (!safeResult) {
      return [];
    }
    try {
      return generateInsights(safeResult);
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }, [safeResult]);

  const recommendations = useMemo(() => {
    if (!safeResult) {
      return [];
    }
    try {
      return generateRecommendations(safeResult);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }, [safeResult]);

  const chartData = useMemo(() => {
    if (!safeResult) {
      return {
        profitDistribution: [],
        revenueVsCost: [],
        costBreakdown: [],
        breakEvenData: []
      };
    }
    try {
      return generateChartData(safeResult);
    } catch (error) {
      console.error('Error generating chart data:', error);
      return {
        profitDistribution: [],
        revenueVsCost: [],
        costBreakdown: [],
        breakEvenData: []
      };
    }
  }, [safeResult]);

  // NOW safe to do early return (all hooks already called)
  if (!result || !safeResult) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
        <p className="text-red-600 dark:text-red-400">Error: No calculation result available</p>
        <button onClick={onReset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Start New Calculation
        </button>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(safeResult, null, 2));
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                <H1>
                  Business Intelligence Dashboard
                </H1>
                <div className="flex items-center gap-3 mt-2">
                  <BodySmall as="p">
                    Advanced analytics & insights for {safeResult.input.product_name}
                  </BodySmall>
                  {safeResult.timestamp && (
                    <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                      <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {formatTimestamp(safeResult.timestamp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <ExportPDFButton result={result} userName="Demo User" />
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
                  link.download = `analysis-${safeResult.input.product_name}-${Date.now()}.json`;
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

          {/* Small Package status removed - moved to Actions tab */}
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          role="tablist"
          className="flex gap-1 mb-8 overflow-x-auto border-b-2 border-slate-200 dark:border-slate-700"
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
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
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Primary KPI Cards - Focus on what matters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="h-40 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-6 shadow-xl flex flex-col justify-center"
                  >
                    <Caption uppercase className="text-green-700 dark:text-green-400 mb-2">Net Profit</Caption>
                    <MetricDisplay size="small" className="text-green-800 dark:text-green-200 mb-1">
                      {formatCurrency(safeResult.totals.net_profit)}
                    </MetricDisplay>
                    <Caption className="text-green-600 dark:text-green-400">After all costs</Caption>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    className={`h-40 bg-gradient-to-br ${
                      safeResult.totals.profit_margin >= 20
                        ? 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-300 dark:border-blue-700'
                        : 'from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700'
                    } border-2 rounded-2xl p-6 shadow-xl flex flex-col justify-center`}
                  >
                    <Caption uppercase className={`mb-2 ${
                      safeResult.totals.profit_margin >= 20
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-yellow-700 dark:text-yellow-400'
                    }`}>
                      Profit Margin
                    </Caption>
                    <MetricDisplay size="small" className={`mb-1 ${
                      safeResult.totals.profit_margin >= 20
                        ? 'text-blue-800 dark:text-blue-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {safeResult.totals.profit_margin.toFixed(1)}%
                    </MetricDisplay>
                    <Caption className={`${
                      safeResult.totals.profit_margin >= 20
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {performanceTier.tier} performance
                    </Caption>
                  </motion.div>
                  
                  {/* Product Health Score Card */}
                  <ProductHealthScoreCard result={result} />
                  
                  {/* Risk Assessment Card */}
                  <RiskAssessmentCard result={result} />
                </div>

                {/* Secondary Metrics - Smaller cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow flex flex-col justify-center"
                  >
                    <Caption uppercase className="mb-1">Revenue</Caption>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {formatCurrency(safeResult.input.selling_price)}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow flex flex-col justify-center"
                  >
                    <Caption uppercase className="mb-1">ROI</Caption>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {safeResult.totals.roi_percent.toFixed(1)}%
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow flex flex-col justify-center"
                  >
                    <Caption uppercase className="mb-1">Total Costs</Caption>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white">
                      {formatCurrency(safeResult.totals.total_cost)}
                    </div>
                  </motion.div>
                </div>

                {/* Scenario Calculator */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <ScenarioCalculator result={result} />
                </motion.div>

                {/* VAT Information Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">VAT Information</h3>
                  </div>
                  
                  <div className="space-y-3">
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Applicable Rate</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {safeResult.vat.rate}% ({safeResult.input.buyer_country || safeResult.input.destination_country} - Standard)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Category</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {safeResult.input.category} (standard rate)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Transaction Type</span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {(() => {
                          // Calculate transaction type based on same logic as Rule Applied
                          const sellerCountry = safeResult.input.seller_country || safeResult.input.destination_country;
                          const buyerCountry = safeResult.input.buyer_country || safeResult.input.destination_country;
                          const transactionType = safeResult.input.transaction_type || 'B2C';
                          
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
                              return `Local sale in ${buyerCountry}. Using ${buyerCountry} VAT (${safeResult.vat.rate}%) because your FBA inventory is stored in ${buyerCountry} (customer country).`;
                            } else if (isDomestic) {
                              return `Domestic sale in ${sellerCountry}. Using ${sellerCountry} VAT (${safeResult.vat.rate}%) for both seller and buyer in same country.`;
                            } else if (isDistanceSelling) {
                              return `Cross-border sale (${sellerCountry} → ${buyerCountry}). Using ${buyerCountry} VAT (${safeResult.vat.rate}%) because your annual cross-border sales (€${annualSales.toLocaleString()}) exceed the €10,000 distance selling threshold.`;
                            } else {
                              return `Cross-border sale (${sellerCountry} → ${buyerCountry}). Using ${sellerCountry} VAT (${safeResult.vat.rate}%) because your annual cross-border sales (€${annualSales.toLocaleString()}) are below the €10,000 distance selling threshold.`;
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

                {/* Cost breakdown - Simplified */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Financial Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Buying Price</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(safeResult.input.buying_price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Amazon Fee ({safeResult.amazonFee.rate || 15}%)</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(safeResult.amazonFee.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Shipping ({safeResult.shipping.type || 'Standard'})</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(safeResult.shipping.net || safeResult.shipping.cost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Net VAT (liability)</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(safeResult.vat.netVATLiability || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Return Buffer</span>
                      <span className="text-slate-800 dark:text-white font-semibold">{formatCurrency(safeResult.returnBuffer)}</span>
                    </div>
                    <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-4 mt-4 flex justify-between items-center">
                      <span className="text-slate-800 dark:text-white font-bold text-lg">Total Costs</span>
                      <span className="text-slate-800 dark:text-white font-bold text-2xl">{formatCurrency(safeResult.totals.total_cost)}</span>
                    </div>
                  </div>
                </div>
                    
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'charts' && (
              <div className="space-y-8">
                <div role="tablist" className="flex gap-1 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto">
                  <button
                    onClick={() => setAnalyticsView('performance')}
                    role="tab"
                    aria-selected={analyticsView === 'performance'}
                    aria-controls="analytics-panel-performance"
                    tabIndex={analyticsView === 'performance' ? 0 : -1}
                    className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      analyticsView === 'performance'
                        ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    Performance Charts
                  </button>
                  <button
                    onClick={() => setAnalyticsView('benchmarks')}
                    role="tab"
                    aria-selected={analyticsView === 'benchmarks'}
                    aria-controls="analytics-panel-benchmarks"
                    tabIndex={analyticsView === 'benchmarks' ? 0 : -1}
                    className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      analyticsView === 'benchmarks'
                        ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    Benchmarks
                  </button>
                  <button
                    onClick={() => setAnalyticsView('cashflow')}
                    role="tab"
                    aria-selected={analyticsView === 'cashflow'}
                    aria-controls="analytics-panel-cashflow"
                    tabIndex={analyticsView === 'cashflow' ? 0 : -1}
                    className={`px-5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap border-b-2 -mb-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      analyticsView === 'cashflow'
                        ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    Cash Flow
                  </button>
                </div>

                <div className="mt-6">
                  <div role="tabpanel" id="analytics-panel-performance" hidden={analyticsView !== 'performance'}>
                    {analyticsView === 'performance' && (
                      <PerformanceCharts chartData={chartData} result={result} />
                    )}
                  </div>

                  <div role="tabpanel" id="analytics-panel-benchmarks" hidden={analyticsView !== 'benchmarks'}>
                    {analyticsView === 'benchmarks' && (
                      <BenchmarkComparisons result={result} />
                    )}
                  </div>

                  <div role="tabpanel" id="analytics-panel-cashflow" hidden={analyticsView !== 'cashflow'}>
                    {analyticsView === 'cashflow' && (
                      <CashFlowTimeline projection={cashFlowProjection} />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions Tab - Math-backed Recommendations */}
            {activeTab === 'recommendations' && (
              <ActionsPanel result={result} />
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

