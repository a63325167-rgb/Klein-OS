import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const [currentResponse, usageResponse, plansResponse] = await Promise.all([
          axios.get('/api/v1/subscriptions/current'),
          axios.get('/api/v1/subscriptions/usage'),
          axios.get('/api/v1/subscriptions/plans')
        ]);

        setCurrentPlan(currentResponse.data);
        setUsage(usageResponse.data);
        setPlans(plansResponse.data.plans);
      } catch (error) {
        console.error('Failed to fetch subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [isAuthenticated]);

  const updatePlan = async (planId) => {
    try {
      const response = await axios.put('/api/v1/subscriptions/update', {
        plan: planId
      });

      setCurrentPlan(response.data);
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update plan';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await axios.delete('/api/v1/subscriptions/cancel');
      setCurrentPlan(response.data);
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cancel subscription';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const hasFeature = (feature) => {
    if (!currentPlan) return false;

    const planFeatures = {
      free: ['basic_calculation', 'simple_shipping'],
      premium: ['basic_calculation', 'simple_shipping', 'unlimited_calculations', 'history', 'bulk_upload', 'advanced_analytics'],
      pro: ['basic_calculation', 'simple_shipping', 'unlimited_calculations', 'history', 'bulk_upload', 'advanced_analytics', 'api_access', 'team_collaboration', 'custom_formulas']
    };

    return planFeatures[currentPlan.plan]?.includes(feature) || false;
  };

  const canMakeCalculation = () => {
    if (!currentPlan || !usage) return false;
    
    if (currentPlan.plan === 'free') {
      return usage.remaining_calculations > 0;
    }
    
    return true; // Premium and Pro have unlimited calculations
  };

  const getRemainingCalculations = () => {
    if (!usage) return 0;
    return usage.remaining_calculations || 0;
  };

  const value = {
    currentPlan,
    usage,
    plans,
    isLoading,
    updatePlan,
    cancelSubscription,
    hasFeature,
    canMakeCalculation,
    getRemainingCalculations
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

