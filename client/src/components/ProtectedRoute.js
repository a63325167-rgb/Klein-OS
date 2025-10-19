import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Lock, Crown } from 'lucide-react';

const ProtectedRoute = ({ children, requiredPlan = null }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentPlan, hasFeature } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPlan && currentPlan?.plan !== requiredPlan) {
    const planFeatures = {
      premium: ['history', 'bulk_upload', 'advanced_analytics'],
      pro: ['api_access', 'team_collaboration', 'custom_formulas']
    };

    const hasRequiredFeature = planFeatures[requiredPlan]?.some(feature => 
      hasFeature(feature)
    );

    if (!hasRequiredFeature) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {requiredPlan === 'premium' ? 'Premium Feature' : 'Pro Feature'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This feature requires a {requiredPlan === 'premium' ? 'Premium' : 'Pro'} subscription.
              Upgrade your plan to access this functionality.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/pricing"
                className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Plans
              </a>
              <a
                href="/"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

