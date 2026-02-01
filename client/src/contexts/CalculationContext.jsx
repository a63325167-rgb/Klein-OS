/**
 * Calculation Context
 * Centralized state management for calculation results
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { calculateProductAnalysis, calculateSensitivityAnalysis, compareScenarios } from '../utils/calculations';
import { validateProductData, hasErrors } from '../utils/validation';

const CalculationContext = createContext();

export const useCalculation = () => {
  const context = useContext(CalculationContext);
  if (!context) {
    throw new Error('useCalculation must be used within a CalculationProvider');
  }
  return context;
};

export const CalculationProvider = ({ children }) => {
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calculation_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    try {
      localStorage.setItem('calculation_history', JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  }, [history]);

  /**
   * Calculate product analysis
   */
  const calculate = useCallback((productData, options = {}) => {
    setIsCalculating(true);
    setError(null);

    try {
      // Validate input
      const validation = validateProductData(productData);
      setValidationErrors(validation);

      if (hasErrors(validation)) {
        throw new Error('Validation failed');
      }

      // Perform calculation
      const result = calculateProductAnalysis(productData, options);

      // Update state
      setCurrentResult(result);

      // Add to history (limit to 50 items)
      setHistory(prev => {
        const newHistory = [result, ...prev].slice(0, 50);
        return newHistory;
      });

      setIsCalculating(false);
      return result;
    } catch (err) {
      setError(err.message);
      setIsCalculating(false);
      throw err;
    }
  }, []);

  /**
   * Perform sensitivity analysis
   */
  const analyzeSensitivity = useCallback((productData, parameter, adjustment) => {
    try {
      return calculateSensitivityAnalysis(productData, parameter, adjustment);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Compare scenarios
   */
  const analyzeScenarios = useCallback((baseProduct, scenarios) => {
    try {
      return compareScenarios(baseProduct, scenarios);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Clear current result
   */
  const clearResult = useCallback(() => {
    setCurrentResult(null);
    setError(null);
    setValidationErrors([]);
  }, []);

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('calculation_history');
  }, []);

  /**
   * Get calculation by ID from history
   */
  const getCalculationById = useCallback((calculationId) => {
    return history.find(calc => calc.calculationId === calculationId);
  }, [history]);

  /**
   * Export current result
   */
  const exportResult = useCallback((format = 'json') => {
    if (!currentResult) return null;

    if (format === 'json') {
      return JSON.stringify(currentResult, null, 2);
    }

    // Add other export formats as needed
    return null;
  }, [currentResult]);

  const value = {
    currentResult,
    history,
    isCalculating,
    error,
    validationErrors,
    calculate,
    analyzeSensitivity,
    analyzeScenarios,
    clearResult,
    clearHistory,
    getCalculationById,
    exportResult
  };

  return (
    <CalculationContext.Provider value={value}>
      {children}
    </CalculationContext.Provider>
  );
};

