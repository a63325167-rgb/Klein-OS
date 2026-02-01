/**
 * Global Products Context
 * 
 * Provides shared state management for product data across all tabs.
 * Uses React Context API + useReducer for predictable state updates.
 * 
 * Features:
 * - Store products uploaded from Bulk Upload tab
 * - Auto-calculate analytics when products change
 * - Share data across all components (Overview, Analytics, Actions)
 * - Persist state during tab navigation
 * - Error handling and loading states
 */

import React, { createContext, useContext, useReducer } from 'react';

// Note: Since this is JavaScript, we'll handle types at runtime
// If you need the actual analytics generation, import it from your utils
// For now, we'll create a simple version

/**
 * Simple analytics generator
 * Replace this with actual import if you have the utility
 */
const generateAnalytics = (products) => {
  if (!products || products.length === 0) return null;
  
  const totalProducts = products.length;
  const totalMonthlyProfit = products.reduce((sum, p) => sum + (p.totalMonthlyProfit || 0), 0);
  const averageProfitMargin = products.reduce((sum, p) => sum + (p.profitMargin || 0), 0) / totalProducts;
  const averageHealthScore = products.reduce((sum, p) => sum + (p.healthScore || 0), 0) / totalProducts;
  
  const riskDistribution = {
    red: products.filter(p => p.profitabilityRisk === 'red').length,
    yellow: products.filter(p => p.profitabilityRisk === 'yellow').length,
    green: products.filter(p => p.profitabilityRisk === 'green').length
  };
  
  return {
    summary: {
      totalProducts,
      totalMonthlyProfit,
      averageProfitMargin,
      averageHealthScore
    },
    riskDistribution
  };
};

// ============================================
// REDUCER FUNCTION
// ============================================

/**
 * Products reducer - handles all state updates
 */
function productsReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      try {
        // Calculate analytics automatically when products are set
        const analytics = action.payload.length > 0 
          ? generateAnalytics(action.payload)
          : null;
        
        return {
          ...state,
          products: action.payload,
          analytics,
          loading: false,
          error: null
        };
      } catch (error) {
        // If analytics generation fails, still store products but set error
        console.error('Failed to generate analytics:', error);
        return {
          ...state,
          products: action.payload,
          analytics: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to generate analytics'
        };
      }
    
    case 'SET_BULK_PRODUCTS':
      // New action for bulk product uploads
      // Stores entire array without modifying single-product logic
      try {
        const bulkProducts = action.payload;
        
        // Calculate analytics for bulk products
        const analytics = bulkProducts.length > 0 
          ? generateAnalytics(bulkProducts)
          : null;
        
        return {
          ...state,
          bulkProducts,
          bulkAnalytics: analytics,
          loading: false,
          error: null
        };
      } catch (error) {
        console.error('Failed to process bulk products:', error);
        return {
          ...state,
          bulkProducts: action.payload,
          bulkAnalytics: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to process bulk products'
        };
      }
    
    case 'CLEAR_BULK_PRODUCTS':
      // Clear only bulk products, keep single products intact
      return {
        ...state,
        bulkProducts: [],
        bulkAnalytics: null
      };
    
    case 'CLEAR_PRODUCTS':
      return {
        products: [],
        analytics: null,
        loading: false,
        error: null
      };
    
    case 'CLEAR_ALL':
      // Clear both single and bulk products
      return {
        products: [],
        bulkProducts: [],
        analytics: null,
        bulkAnalytics: null,
        loading: false,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
}

// ============================================
// CONTEXT CREATION
// ============================================

/**
 * Products Context - undefined by default to enforce provider usage
 */
const ProductsContext = createContext(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

/**
 * Products Provider Component
 * 
 * Wrap your app with this to enable global product state management.
 * 
 * @example
 * ```jsx
 * <ProductsProvider>
 *   <App />
 * </ProductsProvider>
 * ```
 */
export function ProductsProvider({ children }) {
  // Initial state
  const initialState = {
    products: [],           // Single-product analysis
    bulkProducts: [],       // Bulk upload products
    analytics: null,        // Analytics for single products
    bulkAnalytics: null,    // Analytics for bulk products
    loading: false,
    error: null
  };
  
  // Create reducer
  const [state, dispatch] = useReducer(productsReducer, initialState);
  
  // Action creators for single products
  const setProducts = (products) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };
  
  const clearProducts = () => {
    dispatch({ type: 'CLEAR_PRODUCTS' });
  };
  
  // Action creators for bulk products
  const setBulkProducts = (products) => {
    dispatch({ type: 'SET_BULK_PRODUCTS', payload: products });
  };
  
  const clearBulkProducts = () => {
    dispatch({ type: 'CLEAR_BULK_PRODUCTS' });
  };
  
  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };
  
  // General action creators
  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  // Context value
  const value = {
    // State - Single products
    products: state.products,
    analytics: state.analytics,
    
    // State - Bulk products
    bulkProducts: state.bulkProducts,
    bulkAnalytics: state.bulkAnalytics,
    
    // State - General
    loading: state.loading,
    error: state.error,
    
    // Actions - Single products
    setProducts,
    clearProducts,
    
    // Actions - Bulk products
    setBulkProducts,
    clearBulkProducts,
    clearAll,
    
    // Actions - General
    setError,
    setLoading
  };
  
  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * useProducts Hook
 * 
 * Access products context in any component.
 * Must be used within ProductsProvider.
 * 
 * @throws Error if used outside ProductsProvider
 * 
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { products, analytics, setProducts } = useProducts();
 *   
 *   return (
 *     <div>
 *       <p>Total Products: {products.length}</p>
 *       <p>Avg Health: {analytics?.summary.averageHealthScore}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProducts() {
  const context = useContext(ProductsContext);
  
  if (context === undefined) {
    throw new Error(
      'useProducts must be used within a ProductsProvider. ' +
      'Wrap your app with <ProductsProvider> in your root component.'
    );
  }
  
  return context;
}

// ============================================
// UTILITY HOOKS (OPTIONAL)
// ============================================

/**
 * useProductsCount - Get just the product count
 */
export function useProductsCount() {
  const { products } = useProducts();
  return products.length;
}

/**
 * useProductsAnalytics - Get just the analytics
 */
export function useProductsAnalytics() {
  const { analytics } = useProducts();
  return analytics;
}

/**
 * useProductsError - Get just the error state
 */
export function useProductsError() {
  const { error } = useProducts();
  return error;
}

/**
 * useProductsLoading - Get just the loading state
 */
export function useProductsLoading() {
  const { loading } = useProducts();
  return loading;
}

/**
 * useBulkProducts - Get just the bulk products
 */
export function useBulkProducts() {
  const { bulkProducts } = useProducts();
  return bulkProducts;
}

/**
 * useBulkProductsCount - Get just the bulk product count
 */
export function useBulkProductsCount() {
  const { bulkProducts } = useProducts();
  return bulkProducts.length;
}

/**
 * useBulkProductsAnalytics - Get just the bulk analytics
 */
export function useBulkProductsAnalytics() {
  const { bulkAnalytics } = useProducts();
  return bulkAnalytics;
}
