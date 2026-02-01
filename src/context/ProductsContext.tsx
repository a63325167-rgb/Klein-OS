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
import { BulkProductResult } from '../types/upload';
import { AnalyticsReport, generateAnalytics } from '../utils/exportAnalytics';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * State shape for products store
 */
interface ProductsState {
  products: BulkProductResult[];
  analytics: AnalyticsReport | null;
  loading: boolean;
  error: string | null;
}

/**
 * Context value interface
 */
interface ProductsContextType {
  // State
  products: BulkProductResult[];
  analytics: AnalyticsReport | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProducts: (products: BulkProductResult[]) => void;
  clearProducts: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Reducer action types
 */
type ProductsAction =
  | { type: 'SET_PRODUCTS'; payload: BulkProductResult[] }
  | { type: 'CLEAR_PRODUCTS' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

// ============================================
// REDUCER FUNCTION
// ============================================

/**
 * Products reducer - handles all state updates
 */
function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
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
    
    case 'CLEAR_PRODUCTS':
      return {
        products: [],
        analytics: null,
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
 * ```tsx
 * <ProductsProvider>
 *   <App />
 * </ProductsProvider>
 * ```
 */
export function ProductsProvider({ children }: { children: any }) {
  // Initial state
  const initialState: ProductsState = {
    products: [],
    analytics: null,
    loading: false,
    error: null
  };
  
  // Create reducer
  const [state, dispatch] = useReducer(productsReducer, initialState);
  
  // Action creators
  const setProducts = (products: BulkProductResult[]) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  };
  
  const clearProducts = () => {
    dispatch({ type: 'CLEAR_PRODUCTS' });
  };
  
  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };
  
  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };
  
  // Context value
  const value: ProductsContextType = {
    // State
    products: state.products,
    analytics: state.analytics,
    loading: state.loading,
    error: state.error,
    
    // Actions
    setProducts,
    clearProducts,
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
 * ```tsx
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
export function useProducts(): ProductsContextType {
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
export function useProductsCount(): number {
  const { products } = useProducts();
  return products.length;
}

/**
 * useProductsAnalytics - Get just the analytics
 */
export function useProductsAnalytics(): AnalyticsReport | null {
  const { analytics } = useProducts();
  return analytics;
}

/**
 * useProductsError - Get just the error state
 */
export function useProductsError(): string | null {
  const { error } = useProducts();
  return error;
}

/**
 * useProductsLoading - Get just the loading state
 */
export function useProductsLoading(): boolean {
  const { loading } = useProducts();
  return loading;
}
