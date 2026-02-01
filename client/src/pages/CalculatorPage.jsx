import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { saveToPortfolio } from '../utils/portfolioStorage';
import ProductForm from '../components/ProductForm';
import EnhancedResultsDashboard from '../components/analytics/EnhancedResultsDashboard';
import PlatformSelector from '../components/PlatformSelector';
import ValidationWarnings from '../components/ValidationWarnings';
import { calculateProductAnalysis } from '../utils/simpleCalculator';
import { normalizeCalculationInput } from '../utils/calculationAdapter';
import { validateAllInputs, hasBlockingErrors } from '../utils/inputValidation';
import { Info, Calculator } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../components/PlatformSelector.css';

const CalculatorPage = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [platformData, setPlatformData] = useState(null);
  const [usePlatformMode, setUsePlatformMode] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState([]);
  const { isAuthenticated } = useAuth();
  const { currentPlan } = useSubscription();

  const handleCalculation = async (productData = {}) => {
    setIsCalculating(true);
    console.log('🔍 Calculation started with data:', productData);
    console.log('🔍 Platform mode:', usePlatformMode);
    console.log('🔍 Platform data:', platformData);
    
    // Clear previous warnings
    setValidationWarnings([]);
    
    try {
      // Check if platform mode is enabled and platform data is provided
      let normalizedData = productData;
      if (usePlatformMode && platformData && platformData.platform && platformData.inputData) {
        console.log('🔄 Platform mode enabled, normalizing platform data:', platformData);
        try {
          normalizedData = normalizeCalculationInput(platformData);
          // Merge with any additional product data from form (like annual_volume, fixed_costs)
          normalizedData = {
            ...normalizedData,
            annual_volume: productData.annual_volume || normalizedData.annual_volume || 500,
            fixed_costs: productData.fixed_costs || normalizedData.fixed_costs || 500
          };
          console.log('✅ Normalized data:', normalizedData);
        } catch (adapterError) {
          console.error('❌ Adapter error:', adapterError);
          alert(`Platform data error: ${adapterError.message}`);
          setIsCalculating(false);
          return;
        }
      } else {
        // Use standard form data (backward compatibility)
        console.log('📝 Using standard form data (platform mode disabled or no platform data)');
      }
      
      // Validate inputs before calculation
      const inputWarnings = validateAllInputs(normalizedData);
      
      // Check for blocking errors
      if (hasBlockingErrors(inputWarnings)) {
        console.log('❌ Validation failed with blocking errors');
        setValidationWarnings(inputWarnings);
        toast.error('Please fix validation errors before calculating');
        setIsCalculating(false);
        return;
      }
      
      // Calculate locally first
      const result = calculateLocalAnalysis(normalizedData);
      console.log('✅ Calculation result:', result);
      setCalculationResult(result);
      
      // Validate result (profit margin, ROI, etc.)
      const resultWarnings = validateAllInputs(normalizedData, result);
      setValidationWarnings(resultWarnings);
      
      // Show critical warnings
      const criticalWarnings = resultWarnings.filter(w => w.severity === 'error');
      if (criticalWarnings.length > 0) {
        toast.error(criticalWarnings[0].message);
      }

      // Save to database in background (non-blocking)
      saveCalculationToDatabase(normalizedData, result).catch(err => {
        console.log('Background save failed (non-critical):', err);
      });
      
      // Save to portfolio (local storage)
      try {
        saveToPortfolio(result);
        console.log('✅ Product saved to portfolio');
      } catch (err) {
        console.log('⚠️ Failed to save to portfolio:', err);
      }
    } catch (error) {
      console.error('❌ Calculation error:', error);
      console.error('Error details:', error.message);
      toast.error(`Calculation failed: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Local calculation function for demo mode
  const calculateLocalAnalysis = (productData) => {
    console.log('🧮 Running calculation with:', productData);
    const result = calculateProductAnalysis(productData);
    console.log('📊 Raw calculation result:', result);
    return result;
  };

  // Save calculation to database
  const saveCalculationToDatabase = async (inputData, outputData) => {
    // Retrieve auth token (if user is logged in)
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('⚠️ User not logged in - calculation not saved');
      return;
    }

    try {
      console.log('💾 Saving calculation to database...');
      const response = await axios.post('/api/v1/calculate/analyze', {
        product_name: inputData.product_name || inputData.productName || 'Unnamed Product',
        category: inputData.category || 'General',
        buying_price: parseFloat(inputData.buying_price || inputData.buyingPrice || 0),
        selling_price: parseFloat(inputData.selling_price || inputData.sellingPrice || 0),
        destination_country: inputData.destination_country || inputData.destinationCountry || 'Germany',
        length_cm: parseFloat(inputData.length_cm || inputData.length || 0),
        width_cm: parseFloat(inputData.width_cm || inputData.width || 0),
        height_cm: parseFloat(inputData.height_cm || inputData.height || 0),
        weight_kg: parseFloat(inputData.weight_kg || inputData.weight || 0)
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.calculation_id) {
        console.log('✅ Calculation saved with ID:', response.data.calculation_id);
        toast.success('✅ Calculation saved successfully!');
        return response.data.calculation_id;
      }
    } catch (error) {
      console.error('❌ Failed to save calculation:', error);
      if (error.response?.status === 401) {
        toast.error('⚠️ Please log in to save calculations.');
      } else {
        toast.error('⚠️ Failed to save calculation. Please try again.');
      }
    }
  };

  const handlePlatformChange = (data) => {
    setPlatformData(data);
    console.log('📦 Platform data updated:', data);
  };

  const handleReset = () => {
    setCalculationResult(null);
    setPlatformData(null);
    setUsePlatformMode(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Profitability Analysis</h1>
          <p className="text-gray-400 mt-1">Compare platforms and optimize your margins</p>
        </div>
        
        {/* Calculator Content */}
        <div className="calculator-content">

      {/* Demo mode banner */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                🚀 Demo Mode - Try the Klein OS Calculator!
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Enter your product details below to get comprehensive pricing analysis including Small Package eligibility and profit calculations. No login required for demo!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo mode banner */}
      {currentPlan?.demo_mode && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                🔓 Test Mode: {currentPlan.plan.charAt(0).toUpperCase() + currentPlan.plan.slice(1)} activated without payment for development purposes.
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationWarnings.length > 0 && (
        <div className="mb-6">
          <ValidationWarnings warnings={validationWarnings} />
        </div>
      )}

      {calculationResult ? (
        <div className="mt-6">
          <EnhancedResultsDashboard 
            result={calculationResult}
            onReset={handleReset}
            onReRun={() => {
              console.log('🔄 Recalculate button clicked');
              
              // Re-run with same data
              const inputData = {
                product_name: calculationResult.input?.product_name || '',
                category: calculationResult.input?.category || '',
                buying_price: calculationResult.input?.buying_price || 0,
                selling_price: calculationResult.input?.selling_price || 0,
                destination_country: calculationResult.input?.destination_country || '',
                length_cm: calculationResult.input?.length_cm || 0,
                width_cm: calculationResult.input?.width_cm || 0,
                height_cm: calculationResult.input?.height_cm || 0,
                weight_kg: calculationResult.input?.weight_kg || 0
              };
              
              console.log('📝 Recalculating with data:', inputData);
              
              // Clear result first to force re-render
              setCalculationResult(null);
              
              // Delay to ensure state update
              setTimeout(() => {
                handleCalculation(inputData);
              }, 10);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Platform Selector Toggle */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                  Platform Selection Mode
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Enable to use platform-specific fee calculations (Amazon FBA/FBM, Shopify, eBay, None)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePlatformMode}
                  onChange={(e) => setUsePlatformMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Platform Selector (when enabled) */}
          {usePlatformMode && (
            <div className="mb-6">
              <PlatformSelector
                onPlatformChange={handlePlatformChange}
                onInputChange={(inputData) => {
                  // Update platform data when inputs change
                  if (platformData) {
                    setPlatformData({ ...platformData, inputData });
                  }
                }}
                initialData={platformData}
              />
              {/* Calculate button for platform mode */}
              <div className="mt-4 flex justify-end">
                <motion.button
                  onClick={() => {
                    if (platformData && platformData.inputData) {
                      // Validation will be handled by the adapter
                      handleCalculation({}); // Pass empty object, platform data will be used
                    } else {
                      alert('Please fill in platform data');
                    }
                  }}
                  disabled={isCalculating || !platformData || !platformData.inputData}
                  whileHover={{ scale: (!isCalculating && platformData && platformData.inputData) ? 1.02 : 1 }}
                  whileTap={{ scale: (!isCalculating && platformData && platformData.inputData) ? 0.98 : 1 }}
                  className={`px-6 py-3 rounded-lg font-semibold text-base transition-all shadow-lg flex items-center gap-2 ${
                    platformData && platformData.inputData && !isCalculating
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-blue-500/25'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculate with Platform Data
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Form */}
            <div className="order-2 lg:order-1">
              <ProductForm 
                onSubmit={handleCalculation}
                isCalculating={isCalculating}
                canCalculate={!usePlatformMode} // Disable form submission when platform mode is enabled
              />
            </div>

            {/* Placeholder */}
            <div className="order-1 lg:order-2">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-12 text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-200 dark:border-blue-700">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                  Ready for Advanced Analytics?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  Enter your product details to unlock comprehensive business intelligence with interactive charts, 
                  AI-powered insights, and actionable recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features section - only show when no result */}
      {!calculationResult && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-8">
            Why Choose Our Business Intelligence Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-700">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Real-time Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Interactive charts and visualizations that update dynamically with your data for instant insights.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-700">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Smart recommendations and business intelligence that interprets your data and suggests optimizations.
              </p>
            </div>
            
            <div className="text-center p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-700">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Bulk Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Upload Excel files to analyze multiple products simultaneously with comparative analytics.
              </p>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalculatorPage;
