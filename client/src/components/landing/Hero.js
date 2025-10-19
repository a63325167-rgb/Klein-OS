import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  TrendingUp, 
  Euro, 
  Target, 
  BarChart3,
  CheckCircle,
  Award,
  Globe
} from 'lucide-react';

const Hero = () => {
  const [kpiValues, setKpiValues] = useState({
    margin: 0,
    roi: 0,
    netProfit: 0,
    vatSavings: 0
  });

  // Animate KPI counters on mount
  useEffect(() => {
    const animateCounters = () => {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;
      
      let step = 0;
      const interval = setInterval(() => {
        const progress = step / steps;
        
        setKpiValues({
          margin: Math.round(28.4 * progress * 10) / 10,
          roi: Math.round(38.9 * progress * 10) / 10,
          netProfit: Math.round(236.50 * progress * 10) / 10,
          vatSavings: Math.round(4.17 * progress * 10) / 10
        });
        
        step++;
        if (step > steps) {
          clearInterval(interval);
        }
      }, stepDuration);
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium mb-8"
            >
              <Award className="w-4 h-4 mr-2" />
              Trusted by 1M+ Amazon Sellers
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight"
            >
              Make Every Amazon Sourcing
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Decision Profitable
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl leading-relaxed"
            >
              The only analytics platform that calculates true EU profitability—VAT, fees, break-even, and AI insights across 30 countries.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/calculator"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Target className="w-5 h-5 mr-2" />
                Try the Free Calculator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="inline-flex items-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-semibold rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Play className="w-5 h-5 mr-2" />
                Watch 2-Min Demo
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-12 text-sm text-slate-600 dark:text-slate-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>ISO-27001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>30 EU Countries</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Animated Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            {/* Dashboard Container */}
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              
              {/* Dashboard Header */}
              <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-2">Analytics Dashboard</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Live Preview</div>
                </div>
              </div>

              {/* KPI Cards Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  {/* Profit Margin Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">Profit Margin</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                      {kpiValues.margin}%
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Excellent</div>
                  </motion.div>

                  {/* ROI Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">ROI</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {kpiValues.roi}%
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Outstanding</div>
                  </motion.div>

                  {/* Net Profit Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Euro className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Net Profit</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                      €{kpiValues.netProfit}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">Per Unit</div>
                  </motion.div>

                  {/* VAT Savings Card */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">VAT Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                      €{kpiValues.vatSavings}
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Per Unit</div>
                  </motion.div>
                </div>

                {/* Mini Chart Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Cost Distribution</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Live Analysis</span>
                  </div>
                  
                  {/* Simple Bar Chart Representation */}
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
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-5 h-5 text-white" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <TrendingUp className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
