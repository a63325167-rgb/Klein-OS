import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Check, Crown, Star, Zap } from 'lucide-react';

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const { currentPlan, updatePlan, isLoading } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (planId) => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsUpgrading(true);
    await updatePlan(planId);
    setIsUpgrading(false);
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      description: 'Perfect for getting started',
      features: [
        'Basic profit calculation',
        'Simple shipping cost',
        '3 calculations per day',
        'Basic eligibility check',
        'Email support'
      ],
      limitations: [
        'Limited to 3 calculations per day',
        'No advanced analytics',
        'No bulk uploads',
        'No history tracking'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'secondary',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      currency: 'EUR',
      interval: 'month',
      description: 'For serious sellers',
      features: [
        'Everything in Free',
        'Unlimited calculations',
        'Advanced analytics & insights',
        'Bulk Analysis & Export (CSV/XLSX/PDF)',
        'Historical Tracking',
        'Advanced shipping options',
        'Detailed profit analysis',
        'Priority email support'
      ],
      limitations: [],
      buttonText: currentPlan?.plan === 'free' ? 'Upgrade to Premium' : 'Current Plan',
      buttonVariant: currentPlan?.plan === 'premium' ? 'current' : 'primary',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      currency: 'EUR',
      interval: 'month',
      description: 'For teams and businesses',
      features: [
        'Everything in Premium',
        'API Access with API keys',
        'Custom formulas',
        'Multi-store analysis',
        'Team Collaboration',
        'Priority support',
        'Advanced reporting',
        'Webhook integrations'
      ],
      limitations: [],
      buttonText: currentPlan?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      buttonVariant: currentPlan?.plan === 'pro' ? 'current' : 'primary',
      popular: false
    }
  ];

  const getButtonClasses = (plan, variant) => {
    const baseClasses = 'w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center';
    
    switch (variant) {
      case 'current':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-default`;
      case 'primary':
        return `${baseClasses} bg-primary-600 hover:bg-primary-700 text-white`;
      case 'secondary':
        return `${baseClasses} bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Start with our free plan and upgrade as your business grows. 
          All plans include our core Small Package eligibility checking.
        </p>
      </div>

      {/* Demo mode banner */}
      {isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You can upgrade to Premium or Pro without payment for testing purposes. 
                This feature is only available in development mode.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              plan.popular
                ? 'border-primary-500 dark:border-primary-400 scale-105'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {plan.id === 'pro' && <Crown className="w-6 h-6 text-purple-600 mr-2" />}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : `€${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What's included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              {plan.limitations.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Limitations:
                  </h4>
                  <ul className="space-y-2">
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isUpgrading || isLoading || plan.buttonVariant === 'current'}
                className={getButtonClasses(plan, plan.buttonVariant)}
              >
                {isUpgrading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What happens to my data when I upgrade?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All your calculation history and data is preserved when you upgrade. Nothing is lost.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Is there a free trial?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! Start with our free plan and upgrade when you need more features. No credit card required.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What payment methods do you accept?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              In demo mode, no payment is required. In production, we accept all major credit cards and PayPal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

