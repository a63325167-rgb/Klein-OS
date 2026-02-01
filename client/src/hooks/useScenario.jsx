/**
 * useScenario Hook (B3)
 * 
 * Manages scenario state and provides real-time recalculation
 * for "What If" analysis with debouncing.
 */

import { useState, useCallback, useEffect } from 'react';
import { recalculateScenario, validateScenarioAdjustments } from '../utils/scenarioCalculations';

/**
 * Custom hook for scenario management
 * 
 * @param {object} baselineProduct - Original product data from calculation
 * @returns {object} Scenario state and control functions
 */
export function useScenario(baselineProduct) {
  // Baseline values (never change)
  const [baseline] = useState(() => {
    if (!baselineProduct) return null;
    
    return {
      cogs: parseFloat(baselineProduct.buying_price) || 0,
      sellingPrice: parseFloat(baselineProduct.selling_price) || 0,
      returnRate: parseFloat(baselineProduct.return_rate) || 0,
      monthlyVolume: parseInt(baselineProduct.monthly_volume) || parseInt(baselineProduct.annual_volume) / 12 || 100
    };
  });

  // Current adjusted values (change with sliders)
  const [adjusted, setAdjusted] = useState(baseline);

  // Scenario results (recalculated when adjusted changes)
  const [scenarioData, setScenarioData] = useState(null);

  // Validation state
  const [validation, setValidation] = useState({ isValid: true, errors: [], warnings: [] });

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState(null);

  /**
   * Update a single adjustment value
   * Debounced to prevent excessive recalculations
   */
  const updateAdjustment = useCallback((key, value) => {
    setAdjusted(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Update multiple adjustments at once
   */
  const updateAdjustments = useCallback((updates) => {
    setAdjusted(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Reset all adjustments to baseline
   */
  const resetToBaseline = useCallback(() => {
    setAdjusted(baseline);
    setScenarioData(null);
    setValidation({ isValid: true, errors: [], warnings: [] });
  }, [baseline]);

  /**
   * Reset a single adjustment to baseline
   */
  const resetAdjustment = useCallback((key) => {
    if (baseline && baseline[key] !== undefined) {
      setAdjusted(prev => ({
        ...prev,
        [key]: baseline[key]
      }));
    }
  }, [baseline]);

  /**
   * Recalculate scenario with debouncing
   * Waits 300ms after last change before recalculating
   */
  useEffect(() => {
    if (!baselineProduct || !adjusted || !baseline) {
      return;
    }

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      // Validate adjustments
      const validationResult = validateScenarioAdjustments(adjusted, baseline);
      setValidation(validationResult);

      // Only recalculate if valid
      if (validationResult.isValid) {
        const result = recalculateScenario(baselineProduct, adjusted);
        setScenarioData(result);
      } else {
        setScenarioData(null);
      }
    }, 300); // 300ms debounce

    setDebounceTimer(timer);

    // Cleanup
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [adjusted, baselineProduct, baseline]);

  // Check if any adjustment has been made
  const isAdjusted = scenarioData?.isAdjusted || false;

  // Get individual adjustment status
  const getAdjustmentStatus = useCallback((key) => {
    if (!baseline || !adjusted) return { isAdjusted: false, percent: 0 };

    const baseValue = baseline[key];
    const adjValue = adjusted[key];

    if (baseValue === adjValue) {
      return { isAdjusted: false, percent: 0 };
    }

    let percent = 0;
    if (key === 'quantityAdjustPercent') {
      percent = baseValue !== 0 ? (adjValue / baseValue) * 100 : 100;
    } else {
      percent = baseValue !== 0 ? ((adjValue - baseValue) / baseValue) * 100 : 0;
    }

    return {
      isAdjusted: true,
      percent,
      delta: adjValue - baseValue
    };
  }, [baseline, adjusted]);

  return {
    // State
    baseline,
    adjusted,
    scenarioData,
    validation,
    isAdjusted,

    // Actions
    updateAdjustment,
    updateAdjustments,
    resetToBaseline,
    resetAdjustment,
    getAdjustmentStatus
  };
}

export default useScenario;
