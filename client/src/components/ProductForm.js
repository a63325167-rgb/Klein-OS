import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, RotateCcw, Info } from 'lucide-react';
import { calculateProductAnalysis, VAT_RATES } from '../utils/simpleCalculator';
import { fetchProductByASIN } from '../services/amazonService';

const ProductForm = ({ onSubmit, isCalculating, canCalculate = true }) => {
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    buying_price: '',
    selling_price: '',
    destination_country: 'Germany',
    length_cm: '',
    width_cm: '',
    height_cm: '',
    weight_kg: '',
    annual_volume: '500',
    fixed_costs: '500',
    // New fields for VAT calculation
    seller_country: 'Germany',
    buyer_country: 'Germany',
    storage_country: 'Germany',
    fulfillment_method: 'FBA',
    transaction_type: 'B2C',
    buyer_vat_number: ''
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [autoVATRate, setAutoVATRate] = useState(19);
  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  
  // ASIN Fetch functionality
  const [asin, setAsin] = useState('');
  const [marketplace, setMarketplace] = useState('de');
  const [loading, setLoading] = useState(false);
  const [asinError, setAsinError] = useState('');

  // Helper functions for category selection
  const getSelectedSubcategories = () => {
    const parent = categoryHierarchy.find(cat => cat.parent === selectedParentCategory);
    return parent ? parent.subcategories : [];
  };

  const getVATRatePreview = (subcategory) => {
    if (!subcategory || !formData.buyer_country) return '';
    
    const countryCode = countries.find(c => c.name === formData.buyer_country)?.code;
    const vatRate = subcategory.vatRates[countryCode] || subcategory.vatRates.DE;
    
    return `(${vatRate}% ${countryCode || 'DE'})`;
  };

  const getFullCategoryPath = () => {
    if (!selectedParentCategory || !selectedSubcategory) return '';
    return `${selectedParentCategory} > ${selectedSubcategory}`;
  };

  const handleParentCategoryChange = (parentCategory) => {
    setSelectedParentCategory(parentCategory);
    setSelectedSubcategory('');
    setFormData(prev => ({ ...prev, category: '' }));
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    const fullPath = `${selectedParentCategory} > ${subcategory}`;
    setFormData(prev => ({ ...prev, category: fullPath }));
  };

  /**
   * Validate ASIN format
   */
  const validateASIN = (asin) => {
    if (!asin || asin.trim().length !== 10) {
      return 'ASIN must be exactly 10 characters';
    }
    if (!asin.startsWith('B')) {
      return 'ASIN must start with "B"';
    }
    if (!/^[A-Z0-9]{10}$/.test(asin)) {
      return 'ASIN must contain only letters and numbers';
    }
    return null;
  };

  /**
   * Fetch Amazon product data by ASIN
   */
  const fetchProduct = async () => {
    // Validate ASIN format
    const validationError = validateASIN(asin);
    if (validationError) {
      setAsinError(validationError);
      return;
    }

    setLoading(true);
    setAsinError('');
    
    try {
      console.log(`[ProductForm] Fetching ASIN: ${asin} from marketplace: ${marketplace}`);
      
      // Call Amazon service
      const productData = await fetchProductByASIN(asin, marketplace);
      
      console.log('[ProductForm] Product data received:', productData);
      
      // Auto-fill form with product data
      setFormData(prev => ({
        ...prev,
        product_name: productData.title || prev.product_name,
        selling_price: productData.price || prev.selling_price,
        length_cm: productData.dimensions?.length || prev.length_cm,
        width_cm: productData.dimensions?.width || prev.width_cm,
        height_cm: productData.dimensions?.height || prev.height_cm,
        weight_kg: productData.weight || prev.weight_kg,
        fulfillment_method: productData.fulfillmentType || prev.fulfillment_method
      }));

      // Try to map category
      const categoryName = productData.category;
      if (categoryName) {
        console.log('[ProductForm] Attempting to map category:', categoryName);
        // Find matching parent category
        const matchingParent = categoryHierarchy.find(cat => 
          categoryName.toLowerCase().includes(cat.parent.toLowerCase()) ||
          cat.subcategories.some(sub => categoryName.toLowerCase().includes(sub.name.toLowerCase()))
        );
        
        if (matchingParent) {
          setSelectedParentCategory(matchingParent.parent);
          // Try to find matching subcategory
          const matchingSub = matchingParent.subcategories.find(sub =>
            categoryName.toLowerCase().includes(sub.name.toLowerCase())
          );
          if (matchingSub) {
            handleSubcategoryChange(matchingSub.name);
          }
        }
      }
      
      setAsinError('');
      
      // Show success message
      const dimensions = productData.dimensions || {};
      const dimensionStr = (dimensions.length || dimensions.width || dimensions.height) 
        ? `${dimensions.length || '?'}×${dimensions.width || '?'}×${dimensions.height || '?'} cm`
        : 'not available';
        
      alert(`✅ Product loaded successfully!\n\nTitle: ${productData.title}\nPrice: ${productData.currency} ${productData.price}\nDimensions: ${dimensionStr}\nWeight: ${productData.weight ? productData.weight + ' kg' : 'not available'}`);
      
    } catch (error) {
      console.error('[ProductForm] Error fetching product:', error);
      
      // Show server error message directly
      const errorMessage = error.message || 'Failed to fetch product. Make sure the backend server is running.';
      setAsinError(errorMessage);
      
      // Keep error visible for 12 seconds
      setTimeout(() => {
        setAsinError('');
      }, 12000);
    } finally {
      setLoading(false);
    }
  };

  // Hierarchical categories with VAT rates by country
  const categoryHierarchy = [
    {
      parent: 'Books & Publications',
      subcategories: [
        { name: 'Print Books', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 0 } },
        { name: 'eBooks', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 0 } },
        { name: 'Audiobooks', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 0 } },
        { name: 'Newspapers', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 0 } }
      ]
    },
    {
      parent: 'Food & Beverages',
      subcategories: [
        { name: 'Basic Food', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Restaurant Services', vatRates: { DE: 19, FR: 10, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Alcohol', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Baby Food', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } }
      ]
    },
    {
      parent: 'Health & Medical',
      subcategories: [
        { name: 'Prescription Medicines', vatRates: { DE: 7, FR: 2.1, IT: 10, ES: 4, UK: 0, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'OTC Medicines', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Medical Equipment', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Vitamins/Supplements', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } }
      ]
    },
    {
      parent: 'Baby & Children',
      subcategories: [
        { name: 'Baby Food', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Baby Clothing', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 0, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Diapers', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 0, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Car Seats', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Toys', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } }
      ]
    },
    {
      parent: 'Electronics',
      subcategories: [
        { name: 'All Electronics', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } }
      ]
    },
    {
      parent: 'Clothing & Footwear',
      subcategories: [
        { name: 'Adult Clothing', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Children\'s Clothing', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 0, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Shoes', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } }
      ]
    },
    {
      parent: 'Cultural & Entertainment',
      subcategories: [
        { name: 'Museum Tickets', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Theatre', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } },
        { name: 'Art & Collectibles', vatRates: { DE: 7, FR: 5.5, IT: 10, ES: 10, UK: 5, NL: 9, BE: 6, AT: 10, PL: 5, CZ: 12 } }
      ]
    },
    // Keep some generic categories for backward compatibility
    {
      parent: 'Other Categories',
      subcategories: [
        { name: 'Beauty', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Jewelry', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Furniture', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Sports & Outdoors', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Toys & Games', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Home & Garden', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Automotive', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Office Supplies', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } },
        { name: 'Other', vatRates: { DE: 19, FR: 20, IT: 22, ES: 21, UK: 20, NL: 21, BE: 21, AT: 20, PL: 23, CZ: 21 } }
      ]
    }
  ];

  const countries = [
    { name: 'Germany', code: 'DE', vat: 19 },
    { name: 'France', code: 'FR', vat: 20 },
    { name: 'Italy', code: 'IT', vat: 22 },
    { name: 'Spain', code: 'ES', vat: 21 },
    { name: 'Netherlands', code: 'NL', vat: 21 },
    { name: 'Belgium', code: 'BE', vat: 21 },
    { name: 'Austria', code: 'AT', vat: 20 },
    { name: 'Sweden', code: 'SE', vat: 25 },
    { name: 'Denmark', code: 'DK', vat: 25 },
    { name: 'Finland', code: 'FI', vat: 25.5 },
    { name: 'Poland', code: 'PL', vat: 23 },
    { name: 'Czech Republic', code: 'CZ', vat: 21 },
    { name: 'Hungary', code: 'HU', vat: 27 },
    { name: 'Portugal', code: 'PT', vat: 23 },
    { name: 'Greece', code: 'EL', vat: 24 },
    { name: 'Slovakia', code: 'SK', vat: 23 },
    { name: 'Slovenia', code: 'SI', vat: 22 },
    { name: 'Croatia', code: 'HR', vat: 25 },
    { name: 'Romania', code: 'RO', vat: 19 },
    { name: 'Bulgaria', code: 'BG', vat: 20 },
    { name: 'Lithuania', code: 'LT', vat: 21 },
    { name: 'Latvia', code: 'LV', vat: 21 },
    { name: 'Estonia', code: 'EE', vat: 22 },
    { name: 'Cyprus', code: 'CY', vat: 19 },
    { name: 'Malta', code: 'MT', vat: 18 },
    { name: 'Luxembourg', code: 'LU', vat: 17 },
    { name: 'Ireland', code: 'IE', vat: 23 },
    { name: 'United Kingdom', code: 'UK', vat: 20 },
    { name: 'Switzerland', code: 'CH', vat: 8.1 },
    { name: 'Norway', code: 'NO', vat: 25 }
  ];

  // Auto-update VAT rate when country changes
  useEffect(() => {
    // For VAT calculation, use buyer country (where VAT is charged)
    const rate = VAT_RATES[formData.buyer_country] || VAT_RATES['Default'] || 19;
    setAutoVATRate(rate);
  }, [formData.buyer_country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Real-time calculations with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const { buying_price, selling_price, category, destination_country, length_cm, width_cm, height_cm, weight_kg, seller_country, buyer_country, storage_country, fulfillment_method, transaction_type, buyer_vat_number } = formData;
      
      // Only calculate if we have all required fields with valid numbers
      if (buying_price && selling_price && category && destination_country && 
          length_cm && width_cm && height_cm && weight_kg && seller_country && buyer_country &&
          !isNaN(buying_price) && !isNaN(selling_price) && 
          !isNaN(length_cm) && !isNaN(width_cm) && !isNaN(height_cm) && !isNaN(weight_kg)) {
        
        try {
          const productData = {
            buying_price: parseFloat(buying_price),
            selling_price: parseFloat(selling_price),
            category,
            destination_country,
            length_cm: parseFloat(length_cm),
            width_cm: parseFloat(width_cm),
            height_cm: parseFloat(height_cm),
            weight_kg: parseFloat(weight_kg),
            product_name: formData.product_name || 'Preview',
            // New VAT calculation fields
            seller_country,
            buyer_country,
            storage_country: fulfillment_method === 'FBA' ? storage_country : seller_country,
            fulfillment_method,
            transaction_type,
            buyer_vat_number
          };
          
          const result = calculateProductAnalysis(productData);
          setPreview(result);
        } catch (error) {
          console.error('Preview calculation error:', error);
          setPreview(null);
        }
      } else {
        setPreview(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [formData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.category || !selectedParentCategory || !selectedSubcategory) {
      newErrors.category = 'Please select both parent category and subcategory';
    }

    if (!formData.buying_price || parseFloat(formData.buying_price) <= 0) {
      newErrors.buying_price = 'Buying price must be greater than 0';
    }

    if (!formData.selling_price || parseFloat(formData.selling_price) <= 0) {
      newErrors.selling_price = 'Selling price must be greater than 0';
    }

    if (!formData.destination_country) {
      newErrors.destination_country = 'Destination country is required';
    }

    if (!formData.length_cm || parseFloat(formData.length_cm) <= 0) {
      newErrors.length_cm = 'Length must be greater than 0';
    }

    if (!formData.width_cm || parseFloat(formData.width_cm) <= 0) {
      newErrors.width_cm = 'Width must be greater than 0';
    }

    if (!formData.height_cm || parseFloat(formData.height_cm) <= 0) {
      newErrors.height_cm = 'Height must be greater than 0';
    }

    if (!formData.weight_kg || parseFloat(formData.weight_kg) <= 0) {
      newErrors.weight_kg = 'Weight must be greater than 0';
    }

    // New field validations
    if (!formData.seller_country) {
      newErrors.seller_country = 'Seller country is required';
    }

    if (!formData.buyer_country) {
      newErrors.buyer_country = 'Buyer country is required';
    }

    if (formData.fulfillment_method === 'FBA' && !formData.storage_country) {
      newErrors.storage_country = 'Storage country is required for FBA';
    }

    if (formData.transaction_type === 'B2B' && !formData.buyer_vat_number.trim()) {
      newErrors.buyer_vat_number = 'Buyer VAT number is required for B2B transactions';
    }

    if (!formData.fixed_costs || parseFloat(formData.fixed_costs) < 0) {
      newErrors.fixed_costs = 'Fixed costs must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    if (!canCalculate) {
      console.log('❌ Cannot calculate (permission denied)');
      return;
    }

    const submitData = {
      ...formData,
      buying_price: parseFloat(formData.buying_price),
      selling_price: parseFloat(formData.selling_price),
      length_cm: parseFloat(formData.length_cm),
      width_cm: parseFloat(formData.width_cm),
      height_cm: parseFloat(formData.height_cm),
      weight_kg: parseFloat(formData.weight_kg),
      annual_volume: parseInt(formData.annual_volume),
      fixed_costs: parseFloat(formData.fixed_costs),
      // New VAT calculation fields
      seller_country: formData.seller_country,
      buyer_country: formData.buyer_country,
      storage_country: formData.storage_country,
      fulfillment_method: formData.fulfillment_method,
      transaction_type: formData.transaction_type,
      buyer_vat_number: formData.buyer_vat_number,
      timestamp: Date.now()
    };

    console.log('✅ Submitting data:', submitData);
    onSubmit(submitData);
  };

  const handleReset = () => {
    setFormData({
      product_name: '',
      category: '',
      buying_price: '',
      selling_price: '',
      destination_country: 'Germany',
      length_cm: '',
      width_cm: '',
      height_cm: '',
      weight_kg: '',
      annual_volume: '500',
      fixed_costs: '500',
      // New fields for VAT calculation
      seller_country: 'Germany',
      buyer_country: 'Germany',
      storage_country: 'Germany',
      fulfillment_method: 'FBA',
      transaction_type: 'B2C',
      buyer_vat_number: ''
    });
    setSelectedParentCategory('');
    setSelectedSubcategory('');
    setErrors({});
    setPreview(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Product Details
        </h2>
        <motion.button
          type="button"
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ASIN Fetch Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Quick Import from Amazon
            </h3>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
            Enter an Amazon ASIN to auto-fill product details (name, price, dimensions, weight)
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={asin}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setAsin(value);
                  
                  // Real-time validation
                  if (value.length > 0) {
                    const validationError = validateASIN(value);
                    if (validationError) {
                      setAsinError(validationError);
                    } else {
                      setAsinError('');
                    }
                  } else {
                    setAsinError('');
                  }
                }}
                maxLength={10}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  asinError 
                    ? 'border-red-500 dark:border-red-600' 
                    : asin.length === 10 && !asinError
                    ? 'border-green-500 dark:border-green-600'
                    : 'border-blue-300 dark:border-blue-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all font-mono`}
                placeholder="e.g., B08N5WRWNW"
                disabled={loading}
              />
            </div>
            <select
              value={marketplace}
              onChange={(e) => setMarketplace(e.target.value)}
              disabled={loading}
              className="px-4 py-2.5 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
            >
              <option value="de">🇩🇪 DE</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="es">🇪🇸 ES</option>
              <option value="it">🇮🇹 IT</option>
              <option value="co.uk">🇬🇧 UK</option>
              <option value="com">🇺🇸 US</option>
            </select>
            <motion.button
              type="button"
              onClick={fetchProduct}
              disabled={loading || !asin || asin.length !== 10 || !!asinError}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                loading || !asin || asin.length !== 10 || !!asinError
                  ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                'Fetch Product'
              )}
            </motion.button>
          </div>
          <AnimatePresence>
            {asinError && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1"
              >
                <span>⚠️</span> {asinError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className={`form-input w-full px-4 py-2.5 rounded-lg border ${
              errors.product_name 
                ? 'border-red-500 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
            placeholder="Enter product name"
          />
          <AnimatePresence>
            {errors.product_name && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.product_name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Hierarchical Category Selector */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Product Category *
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
              (Select parent category first, then subcategory)
            </span>
          </label>
          
          {/* Parent Category Dropdown */}
          <div className="mb-3">
          <select
              value={selectedParentCategory}
              onChange={(e) => handleParentCategoryChange(e.target.value)}
            className={`form-select w-full px-4 py-2.5 rounded-lg border ${
              errors.category 
                ? 'border-red-500 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
          >
              <option value="">Select parent category</option>
              {categoryHierarchy.map(category => (
                <option key={category.parent} value={category.parent}>
                  {category.parent}
                </option>
            ))}
          </select>
          </div>

          {/* Subcategory Dropdown */}
          {selectedParentCategory && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <select
                value={selectedSubcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className={`form-select w-full px-4 py-2.5 rounded-lg border ${
                  errors.category 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              >
                <option value="">Select subcategory</option>
                {getSelectedSubcategories().map(subcategory => (
                  <option key={subcategory.name} value={subcategory.name}>
                {subcategory.name} {getVATRatePreview(subcategory)}
                  </option>
                ))}
              </select>
            </motion.div>
          )}

          {/* VAT Rate Preview */}
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Selected: {getFullCategoryPath()}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                VAT rates vary by country. See destination country dropdown below for applicable rate.
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {errors.category && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Buying Price (€) *
            </label>
            <div className="relative">
              <input
                type="number"
                name="buying_price"
                value={formData.buying_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`form-input w-full px-4 py-2.5 pl-10 rounded-lg border ${
                  errors.buying_price 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
                placeholder="0.00"
              />
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">€</span>
            </div>
            <AnimatePresence>
              {errors.buying_price && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                >
                  {errors.buying_price}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Selling Price (€) *
            </label>
            <div className="relative">
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`form-input w-full px-4 py-2.5 pl-10 rounded-lg border ${
                  errors.selling_price 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
                placeholder="0.00"
              />
              <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">€</span>
            </div>
            <AnimatePresence>
              {errors.selling_price && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                >
                  {errors.selling_price}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Destination Country with Auto-VAT */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Destination Country (Customer Location) *
            </label>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              {formData.destination_country} (VAT: {autoVATRate}%)
            </span>
          </div>
          <select
            name="destination_country"
            value={formData.destination_country}
            onChange={handleChange}
            className={`form-select w-full px-4 py-2.5 rounded-lg border ${
              errors.destination_country 
                ? 'border-red-500 dark:border-red-600' 
                : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
          >
            {countries.map(country => (
              <option key={country.name} value={country.name}>
                {country.name} (VAT: {country.vat}%)
              </option>
            ))}
          </select>
          <AnimatePresence>
            {errors.destination_country && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.destination_country}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Sales Details Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Sales Details
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              VAT Calculation
            </span>
          </h3>

          {/* Fulfillment Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fulfillment Method *
            </label>
            <div className="flex gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="fulfillment_method"
                  value="FBA"
                  checked={formData.fulfillment_method === 'FBA'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">FBA (Fulfilled by Amazon)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="fulfillment_method"
                  value="FBM"
                  checked={formData.fulfillment_method === 'FBM'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">FBM (Fulfilled by Merchant)</span>
              </label>
            </div>
          </div>

          {/* Transaction Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Transaction Type *
            </label>
            <div className="flex gap-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transaction_type"
                  value="B2C"
                  checked={formData.transaction_type === 'B2C'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">B2C (Business to Consumer)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="transaction_type"
                  value="B2B"
                  checked={formData.transaction_type === 'B2B'}
                  onChange={handleChange}
                  className="mr-2 text-blue-600 dark:text-blue-400"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">B2B (Business to Business)</span>
              </label>
            </div>
          </div>

          {/* B2B VAT Number */}
          {formData.transaction_type === 'B2B' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Buyer VAT Number *
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                  (Required for B2B transactions)
                </span>
              </label>
              <input
                type="text"
                name="buyer_vat_number"
                value={formData.buyer_vat_number}
                onChange={handleChange}
                className={`form-input w-full px-4 py-2.5 rounded-lg border ${
                  errors.buyer_vat_number 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
                placeholder="DE123456789 (format varies by country)"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                💡 B2B transactions may qualify for reverse charge VAT (0% VAT)
              </p>
              <AnimatePresence>
                {errors.buyer_vat_number && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                  >
                    {errors.buyer_vat_number}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Country Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seller Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Seller Country *
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                  (Your business location)
                </span>
              </label>
              <select
                name="seller_country"
                value={formData.seller_country}
                onChange={handleChange}
                className={`form-select w-full px-4 py-2.5 rounded-lg border ${
                  errors.seller_country 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              >
                {countries.map(country => (
                  <option key={country.name} value={country.name}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <AnimatePresence>
                {errors.seller_country && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                  >
                    {errors.seller_country}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Buyer Country */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Buyer Country *
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                  (Customer location)
                </span>
              </label>
              <select
                name="buyer_country"
                value={formData.buyer_country}
                onChange={handleChange}
                className={`form-select w-full px-4 py-2.5 rounded-lg border ${
                  errors.buyer_country 
                    ? 'border-red-500 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              >
                {countries.map(country => (
                  <option key={country.name} value={country.name}>
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <AnimatePresence>
                {errors.buyer_country && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                  >
                    {errors.buyer_country}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Storage Country (FBA only) */}
            {formData.fulfillment_method === 'FBA' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Storage Country
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
                    (FBA warehouse location)
                  </span>
                </label>
                <select
                  name="storage_country"
                  value={formData.storage_country}
                  onChange={handleChange}
                  className={`form-select w-full px-4 py-2.5 rounded-lg border ${
                    errors.storage_country 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
                >
                  {countries.map(country => (
                    <option key={country.name} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  💡 Pan-EU FBA: VAT charged based on storage country
                </p>
                <AnimatePresence>
                  {errors.storage_country && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-red-600 dark:text-red-400 text-xs mt-1.5"
                    >
                      {errors.storage_country}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Package Dimensions (cm) *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'length_cm', label: 'Length', placeholder: 'L' },
              { name: 'width_cm', label: 'Width', placeholder: 'W' },
              { name: 'height_cm', label: 'Height', placeholder: 'H' }
            ].map(field => (
              <div key={field.name}>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  className={`form-input w-full px-3 py-2.5 rounded-lg border text-center ${
                    errors[field.name] 
                      ? 'border-red-500 dark:border-red-600' 
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
                  placeholder={field.placeholder}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-center">{field.label}</p>
                <AnimatePresence>
                  {errors[field.name] && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-red-600 dark:text-red-400 text-xs mt-1"
                    >
                      Required
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Weight (kg) *
          </label>
          <div className="relative">
            <input
              type="number"
              name="weight_kg"
              value={formData.weight_kg}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`form-input w-full px-4 py-2.5 pl-10 rounded-lg border ${
                errors.weight_kg 
                  ? 'border-red-500 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              placeholder="0.00"
            />
            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">kg</span>
          </div>
          <AnimatePresence>
            {errors.weight_kg && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.weight_kg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Annual Sales Volume */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Estimated Annual Sales Volume
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
              (for ROI projections)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="annual_volume"
              value={formData.annual_volume}
              onChange={handleChange}
              step="1"
              min="0"
              className={`form-input w-full px-4 py-2.5 pl-14 rounded-lg border ${
                errors.annual_volume 
                  ? 'border-red-500 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              placeholder="500"
            />
            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">units/yr</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            💡 Used to calculate annual savings and ROI projections in recommendations
          </p>
          <AnimatePresence>
            {errors.annual_volume && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.annual_volume}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Costs Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            One-time Setup Costs
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400 font-normal">
              (photography, samples, PPC setup, etc.)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="fixed_costs"
              value={formData.fixed_costs}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`form-input w-full px-4 py-2.5 pl-12 rounded-lg border ${
                errors.fixed_costs 
                  ? 'border-red-500 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all`}
              placeholder="500"
            />
            <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-sm">€</span>
          </div>
          <div className="mt-1.5 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Include: product photography (€200-500), initial samples (€100-300), Amazon Pro account setup, PPC campaign setup, packaging design
            </p>
          </div>
          <AnimatePresence>
            {errors.fixed_costs && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-red-600 dark:text-red-400 text-xs mt-1.5"
              >
                {errors.fixed_costs}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Real-time Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-slate-200 dark:border-slate-700 pt-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Live Preview
                </h3>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-1">Amazon Fee ({preview.amazonFee.rate}%):</span>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      €{preview.amazonFee.amount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-1">Shipping:</span>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      €{preview.shipping.cost.toFixed(2)}
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">({preview.shipping.type})</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-1">
                      Net VAT ({preview.vat.rate}%):
                      <span 
                        className="ml-1 text-xs cursor-help text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" 
                        title="EU VAT Calculation: Output VAT (collected from customer) - Input VAT (reclaimable on costs) = Net VAT Liability (what you pay to tax authority)"
                      >
                        ℹ️
                      </span>
                    </span>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      €{(preview.vat.netVATLiability || preview.vat.amount || 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-xs mb-1">Return Buffer:</span>
                    <div className="font-semibold text-slate-800 dark:text-white">
                      €{preview.returnBuffer.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 text-sm">Net Profit:</span>
                    <span className={`text-lg font-bold ${
                      preview.totals.profit_margin >= 20 ? 'text-green-600 dark:text-green-400' :
                      preview.totals.profit_margin >= 10 ? 'text-blue-600 dark:text-blue-400' :
                      preview.totals.profit_margin >= 5 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      €{preview.totals.net_profit.toFixed(2)} 
                      <span className="text-sm ml-2">({preview.totals.profit_margin.toFixed(1)}%)</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Small Package Eligible:</span>
                  {preview.smallPackageCheck.isEligible ? (
                    <span className="text-sm text-green-600 dark:text-green-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Yes - Save €1.71
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 dark:text-red-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Not Eligible
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={isCalculating || !canCalculate}
            whileHover={{ scale: canCalculate && !isCalculating ? 1.02 : 1 }}
            whileTap={{ scale: canCalculate && !isCalculating ? 0.98 : 1 }}
            className={`w-full flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg ${
              canCalculate && !isCalculating
                ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-blue-500/25'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5 mr-2.5" />
                Get Full Analysis
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProductForm;
