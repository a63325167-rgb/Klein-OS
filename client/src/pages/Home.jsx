import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import ProductForm from '../components/ProductForm';
import ResultsDashboard from '../components/ResultsDashboard';
import { calculateProductAnalysis } from '../utils/smallPackage';
import { AlertCircle, Info } from 'lucide-react';

const Home = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { isAuthenticated } = useAuth();
  const { currentPlan, canMakeCalculation, getRemainingCalculations } = useSubscription();

  const handleCalculation = async (productData) => {
    setIsCalculating(true);
    try {
      // For demo mode, we'll calculate locally without API call
      const result = calculateLocalAnalysis(productData);
      setCalculationResult(result);
    } catch (error) {
      console.error('Calculation error:', error);
      // Handle error (you might want to show a toast notification)
    } finally {
      setIsCalculating(false);
    }
  };

  // Local calculation function for demo mode
  const calculateLocalAnalysis = (productData) => {
    return calculateProductAnalysis(productData);
  };

  const handleReset = () => {
    setCalculationResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Klein OS Calculator
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Comprehensive pricing analysis for your products including Small Package eligibility, shipping costs, 
          VAT calculations, Amazon fees, and detailed profit analysis for European markets.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Form */}
        <div className="order-2 lg:order-1">
          <ProductForm 
            onSubmit={handleCalculation}
            isCalculating={isCalculating}
            canCalculate={true}
          />
        </div>

        {/* Results Dashboard */}
        <div className="order-1 lg:order-2">
          {calculationResult ? (
            <ResultsDashboard 
              result={calculationResult}
              onReset={handleReset}
              onReRun={() => {
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
                handleCalculation(inputData);
              }}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready to Calculate Profit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your product details in the form to get started with comprehensive profit calculations and analytics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Why Choose Klein OS?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Instant Results
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get immediate profit analysis with Small Package eligibility checks and comprehensive profit calculations in seconds.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed ROI analysis, market insights, and risk assessment for informed decisions.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              European Focus
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Specialized for European markets with accurate VAT rates and shipping costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

