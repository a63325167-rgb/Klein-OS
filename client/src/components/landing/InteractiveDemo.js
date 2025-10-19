import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  TrendingUp, 
  Euro, 
  Target, 
  BarChart3,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

const InteractiveDemo = () => {
  const [formData, setFormData] = useState({
    category: 'Electronics',
    sellingPrice: '99.99',
    buyingPrice: '45.00',
    country: 'Germany'
  });

  const [kpiResults, setKpiResults] = useState({
    margin: 0,
    roi: 0,
    netProfit: 0,
    vatSavings: 0
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Demo categories with realistic data
  const categories = [
    { name: 'Electronics', vatRate: 19, amazonFee: 15 },
    { name: 'Books', vatRate: 7, amazonFee: 15 },
    { name: 'Baby Food', vatRate: 7, amazonFee: 15 },
    { name: 'Clothing', vatRate: 19, amazonFee: 17 }
  ];

  const countries = [
    { name: 'Germany', vatRate: 19, flag: '🇩🇪' },
    { name: 'France', vatRate: 20, flag: '🇫🇷' },
    { name: 'Italy', vatRate: 22, flag: '🇮🇹' },
    { name: 'Spain', vatRate: 21, flag: '🇪🇸' }
  ];

  // Calculate KPIs based on form data
  useEffect(() => {
    const calculateKPIs = () => {
      setIsCalculating(true);
      
      setTimeout(() => {
        const sellingPrice = parseFloat(formData.sellingPrice);
        const buyingPrice = parseFloat(formData.buyingPrice);
        const selectedCategory = categories.find(cat => cat.name === formData.category);
        const selectedCountry = countries.find(country => country.name === formData.country);
        
        if (sellingPrice && buyingPrice && selectedCategory && selectedCountry) {
          // Calculate Amazon fee
          const amazonFee = (sellingPrice * selectedCategory.amazonFee) / 100;
          
          // Calculate VAT
          const vatRate = selectedCountry.vatRate / 100;
          const sellingPriceNet = sellingPrice / (1 + vatRate);
          const outputVAT = sellingPrice - sellingPriceNet;
          
          // Calculate input VAT on COGS
          const buyingPriceNet = buyingPrice / (1 + vatRate);
          const inputVAT = buyingPrice - buyingPriceNet;
          
          // Calculate shipping (estimated)
          const shipping = 5.50;
          
          // Calculate total costs
          const totalCosts = buyingPriceNet + (amazonFee / (1 + vatRate)) + (shipping / (1 + vatRate)) + (outputVAT - inputVAT);
          
          // Calculate KPIs
          const netProfit = sellingPriceNet - totalCosts;
          const margin = (netProfit / sellingPriceNet) * 100;
          const roi = (netProfit / buyingPriceNet) * 100;
          const vatSavings = inputVAT;
          
          setKpiResults({
            margin: Math.round(margin * 10) / 10,
            roi: Math.round(roi * 10) / 10,
            netProfit: Math.round(netProfit * 100) / 100,
            vatSavings: Math.round(vatSavings * 100) / 100
          });
        }
        
        setIsCalculating(false);
      }, 1000);
    };

    calculateKPIs();
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPerformanceColor = (margin) => {
    if (margin >= 25) return 'text-green-600 dark:text-green-400';
    if (margin >= 15) return 'text-blue-600 dark:text-blue-400';
    if (margin >= 5) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceLabel = (margin) => {
    if (margin >= 25) return 'Excellent';
    if (margin >= 15) return 'Good';
    if (margin >= 5) return 'Fair';
    return 'Poor';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-green-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-6">
            <Calculator className="w-4 h-4 mr-2" />
            Interactive Demo
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Try Our Calculator
            <span className="block text-blue-600 dark:text-blue-400">
              Live Preview
            </span>
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Enter your product details and see real-time profitability analysis with EU VAT calculations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Demo Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Product Details
            </h3>
            
            <div className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name} ({category.vatRate}% VAT, {category.amazonFee}% Fee)
                    </option>
                  ))}
                </select>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Selling Price (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="99.99"
                  />
                </div>
              </div>

              {/* Buying Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cost of Goods (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={formData.buyingPrice}
                    onChange={(e) => handleInputChange('buyingPrice', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="45.00"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Destination Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.flag} {country.name} ({country.vatRate}% VAT)
                    </option>
                  ))}
                </select>
              </div>

              {/* CTA Button */}
              <Link
                to="/calculator"
                className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Get Full Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Live Results Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                Live Results
              </h3>
              {isCalculating && (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Calculating...
                </div>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              
              {/* Profit Margin */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Margin</span>
                </div>
                <div className={`text-2xl font-bold ${getPerformanceColor(kpiResults.margin)}`}>
                  {kpiResults.margin}%
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {getPerformanceLabel(kpiResults.margin)}
                </div>
              </motion.div>

              {/* ROI */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">ROI</span>
                </div>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                  {kpiResults.roi}%
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {kpiResults.roi >= 25 ? 'Excellent' : kpiResults.roi >= 15 ? 'Good' : 'Fair'}
                </div>
              </motion.div>

              {/* Net Profit */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <Euro className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Net Profit</span>
                </div>
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  €{kpiResults.netProfit}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">Per Unit</div>
              </motion.div>

              {/* VAT Savings */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">VAT Savings</span>
                </div>
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  €{kpiResults.vatSavings}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Per Unit</div>
              </motion.div>
            </div>

            {/* Mini Chart Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost Breakdown</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Live Analysis</span>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="flex items-end gap-2 h-16">
                <div className="flex-1 bg-blue-500 rounded-t" style={{ height: '60%' }}></div>
                <div className="flex-1 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
                <div className="flex-1 bg-amber-500 rounded-t" style={{ height: '40%' }}></div>
                <div className="flex-1 bg-purple-500 rounded-t" style={{ height: '30%' }}></div>
              </div>
              
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span>COGS</span>
                <span>Profit</span>
                <span>Fees</span>
                <span>VAT</span>
              </div>
            </motion.div>

            {/* Bottom CTA */}
            <div className="mt-6 text-center">
              <Link
                to="/calculator"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Full Analysis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
