/**
 * Platform Selector Component
 * 
 * Allows user to select platform (Amazon FBA/FBM, Shopify, eBay, None)
 * and displays adaptive input fields based on platform selection
 */

import React, { useState, useEffect } from 'react';

// Platform config - will be passed as prop or imported from service
const platformConfig = {
  amazon: {
    label: 'Amazon',
    subOptions: [
      { value: 'fba', label: 'FBA (Fulfilled by Amazon)' },
      { value: 'fbm', label: 'FBM (Fulfilled by Merchant)' }
    ],
    inputFields: {
      fba: [
        { name: 'product_name', label: 'Product Name', type: 'text', required: true },
        { name: 'sellingPrice', label: 'Selling Price (€)', type: 'number', required: true },
        { name: 'cogs', label: 'Cost of Goods Sold (€)', type: 'number', required: true },
        { name: 'referralFeePercent', label: 'Referral Fee %', type: 'number', required: true, hint: 'Usually 15%' },
        { name: 'fbaFeePerUnit', label: 'FBA Fee (€ per unit)', type: 'number', required: true },
        { name: 'weight', label: 'Weight (kg)', type: 'number', required: true, hint: 'For size tier calculation' },
        { name: 'length', label: 'Length (cm)', type: 'number', required: false },
        { name: 'width', label: 'Width (cm)', type: 'number', required: false },
        { name: 'height', label: 'Height (cm)', type: 'number', required: false },
        { name: 'category', label: 'Product Category', type: 'select', required: true, options: ['Electronics', 'Clothing', 'Books', 'Other'] },
        { name: 'destination_country', label: 'Destination Country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Netherlands', 'Belgium', 'Austria', 'Poland', 'Czech Republic'] }
      ],
      fbm: [
        { name: 'product_name', label: 'Product Name', type: 'text', required: true },
        { name: 'sellingPrice', label: 'Selling Price (€)', type: 'number', required: true },
        { name: 'cogs', label: 'Cost of Goods Sold (€)', type: 'number', required: true },
        { name: 'referralFeePercent', label: 'Referral Fee %', type: 'number', required: true, hint: 'Usually 15%' },
        { name: 'shippingCostPerUnit', label: 'Shipping Cost (€ per unit)', type: 'number', required: true },
        { name: 'category', label: 'Product Category', type: 'select', required: true, options: ['Electronics', 'Clothing', 'Books', 'Other'] },
        { name: 'destination_country', label: 'Destination Country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Netherlands', 'Belgium', 'Austria', 'Poland', 'Czech Republic'] }
      ]
    }
  },
  shopify: {
    label: 'Shopify',
    subOptions: null,
    inputFields: [
      { name: 'product_name', label: 'Product Name', type: 'text', required: true },
      { name: 'sellingPrice', label: 'Selling Price (€)', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold (€)', type: 'number', required: true },
      { name: 'shopifyCommissionPercent', label: 'Shopify Commission %', type: 'number', required: true, hint: 'Usually 2.9%' },
      { name: 'paymentProcessingPercent', label: 'Payment Processing %', type: 'number', required: true, hint: 'Usually 2.9% (Stripe)' },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (€ per unit)', type: 'number', required: true },
      { name: 'destination_country', label: 'Destination Country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Netherlands', 'Belgium', 'Austria', 'Poland', 'Czech Republic'] }
    ]
  },
  ebay: {
    label: 'eBay',
    subOptions: null,
    inputFields: [
      { name: 'product_name', label: 'Product Name', type: 'text', required: true },
      { name: 'sellingPrice', label: 'Selling Price (€)', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold (€)', type: 'number', required: true },
      { name: 'finalValueFeePercent', label: 'Final Value Fee %', type: 'number', required: true, hint: 'Usually 12.9%' },
      { name: 'paymentProcessingPercent', label: 'Payment Processing %', type: 'number', required: true, hint: 'Usually 3.5%' },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (€ per unit)', type: 'number', required: true },
      { name: 'destination_country', label: 'Destination Country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Netherlands', 'Belgium', 'Austria', 'Poland', 'Czech Republic'] }
    ]
  },
  none: {
    label: 'No Platform Fees',
    subOptions: null,
    inputFields: [
      { name: 'product_name', label: 'Product Name', type: 'text', required: true },
      { name: 'sellingPrice', label: 'Selling Price (€)', type: 'number', required: true },
      { name: 'cogs', label: 'Cost of Goods Sold (€)', type: 'number', required: true },
      { name: 'shippingCostPerUnit', label: 'Shipping Cost (€ per unit)', type: 'number', required: true },
      { name: 'destination_country', label: 'Destination Country', type: 'select', required: true, options: ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Netherlands', 'Belgium', 'Austria', 'Poland', 'Czech Republic'] }
    ]
  }
};

export default function PlatformSelector({ onPlatformChange, onInputChange, initialData }) {
  const [selectedPlatform, setSelectedPlatform] = useState(initialData?.platform || 'amazon');
  const [selectedType, setSelectedType] = useState(initialData?.platformType || 'fba');
  const [formData, setFormData] = useState(initialData?.inputData || {});
  const [errors, setErrors] = useState({});

  const platformSpec = platformConfig[selectedPlatform];
  const isAmazon = selectedPlatform === 'amazon';
  const inputFields = isAmazon ? platformSpec.inputFields[selectedType] : platformSpec.inputFields;

  useEffect(() => {
    if (onPlatformChange) {
      onPlatformChange({ platform: selectedPlatform, platformType: selectedType, inputData: formData });
    }
  }, [selectedPlatform, selectedType, formData, onPlatformChange]);

  useEffect(() => {
    if (onInputChange) {
      onInputChange(formData);
    }
  }, [formData, onInputChange]);

  const handlePlatformChange = (e) => {
    const platform = e.target.value;
    setSelectedPlatform(platform);
    const defaultType = platformConfig[platform].subOptions ? 'fba' : null;
    setSelectedType(defaultType);
    setFormData({});
    setErrors({});
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setFormData({});
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    
    // Real-time validation
    const newErrors = {};
    inputFields.forEach(field => {
      if (field.required && (!updatedData[field.name] && updatedData[field.name] !== 0 && updatedData[field.name] !== '0')) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
  };

  return (
    <div className="platform-selector-container">
      <div className="selector-group">
        <label htmlFor="platform-select">Sales Platform</label>
        <select 
          id="platform-select" 
          value={selectedPlatform} 
          onChange={handlePlatformChange} 
          className="select-input"
        >
          {Object.entries(platformConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

      {isAmazon && platformSpec.subOptions && (
        <div className="selector-group">
          <label htmlFor="platform-type-select">Fulfillment Type</label>
          <select 
            id="platform-type-select" 
            value={selectedType} 
            onChange={handleTypeChange} 
            className="select-input"
          >
            {platformSpec.subOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="input-fields-grid">
        {inputFields.map((field) => (
          <div key={field.name} className="input-field-wrapper">
            <label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="required-star">*</span>}
            </label>
            
            {field.type === 'select' ? (
              <select 
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className={`input-field ${errors[field.name] ? 'error' : ''}`}
              >
                <option value="">Select {field.label}</option>
                {field.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input 
                id={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.hint || ''}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className={`input-field ${errors[field.name] ? 'error' : ''}`}
              />
            )}
            
            {field.hint && !errors[field.name] && (
              <small className="hint-text">{field.hint}</small>
            )}
            {errors[field.name] && (
              <small className="error-text">{errors[field.name]}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

