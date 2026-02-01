import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Download, AlertCircle, CheckCircle, X, BarChart3, Loader, FileCheck, ArrowLeft } from 'lucide-react';
import { useProducts } from '../contexts/ProductsContext';
import toast from 'react-hot-toast';
import { downloadExcelTemplate, downloadCSVTemplate, getOldTemplateWarning } from '../utils/templateGenerator';
import { parseAndValidateCSV } from '../utils/csvParser';
import AuditProductTable from '../components/AuditProductTable';

const BulkUploadPage = () => {
  const navigate = useNavigate();
  const { products, setProducts, setLoading, setError, loading } = useProducts();
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [hasOldTemplate, setHasOldTemplate] = useState(false);

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setUploadedFile(file);
    setLoading(true);
    setValidationErrors([]);
    setHasOldTemplate(false);
    
    try {
      // Use new CSV parser
      const result = await parseAndValidateCSV(file);
      
      if (result.valid) {
        // Store in global state
        setProducts(result.products);
        
        toast.success(`✅ Successfully imported ${result.rowCount} products`);
        
        // Check for warnings (including old template detection)
        if (result.warnings && result.warnings.length > 0) {
          setValidationErrors(result.warnings);
          
          // Check if old template was detected
          const hasOldTemplateWarning = result.warnings.some(w => 
            w.includes('old template') || w.includes('Old template')
          );
          
          if (hasOldTemplateWarning) {
            setHasOldTemplate(true);
            toast.warning('⚠️ Old template detected. Profit values recalculated.');
          } else {
            toast.warning(`⚠️ ${result.warnings.length} validation warnings`);
          }
        }
      } else {
        // Parsing failed
        setValidationErrors(result.errors || ['Failed to parse file']);
        toast.error('❌ Failed to parse file');
        setError(result.errors ? result.errors.join(', ') : 'Failed to parse file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`❌ Upload failed: ${error.message}`);
      setError(error.message);
      setValidationErrors([error.message]);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setValidationErrors([]);
    setHasOldTemplate(false);
    setProducts([]);
    toast.info('Upload cleared');
  };

  const downloadTemplate = (format = 'excel') => {
    try {
      if (format === 'csv') {
        downloadCSVTemplate();
      } else {
        downloadExcelTemplate();
      }
      toast.success('Template downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1C1C] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bulk Upload</h1>
              <p className="text-gray-400">Upload CSV or Excel files to analyze multiple products at once</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Platform
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? 'border-[#32808D] bg-[#32808D]/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader className="w-12 h-12 text-[#32808D] animate-spin mb-4" />
                <p className="text-lg font-medium">Processing file...</p>
                <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-lg font-medium mb-2">{uploadedFile.name}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {products.length} products uploaded successfully
                </p>
                <button
                  onClick={handleClearFile}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Clear Upload
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-lg font-medium mb-2">Drop your file here or click to browse</p>
                <p className="text-sm text-gray-400 mb-4">Supports CSV, XLS, XLSX files</p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="file-upload"
                  className="px-6 py-3 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium cursor-pointer transition-colors"
                >
                  Select File
                </label>
              </div>
            )}
          </div>

          {/* Download Template */}
          <div className="mt-6 space-y-4">
            {/* Helper Text */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                📥 Download the template, fill in your product data, then upload it here.
              </p>
              <p className="text-xs text-gray-400">
                💡 Tip: Leave 'inventory_purchase_date' blank if you don't track purchase dates. The app will calculate profit, margin, and risk automatically.
              </p>
            </div>
            
            {/* Download Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => downloadTemplate('excel')}
                className="flex items-center gap-2 px-4 py-2 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Download Excel Template
              </button>
              <button
                onClick={() => downloadTemplate('csv')}
                className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Old Template Warning */}
        {hasOldTemplate && (
          <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-500 mb-2">Old Template Detected</h3>
                <p className="text-sm text-orange-200 mb-3">
                  {getOldTemplateWarning()}
                </p>
                <button
                  onClick={() => downloadTemplate('excel')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded text-xs font-medium transition-colors"
                >
                  <Download size={14} />
                  Download New Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && !hasOldTemplate && (
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-500 mb-2">Validation Warnings</h3>
                <ul className="space-y-1 text-sm text-yellow-200">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li className="text-yellow-400 mt-2">
                      ... and {validationErrors.length - 5} more warnings
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Products Preview - Audit Intelligence Hub */}
        {products.length > 0 && (
          <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Audit Intelligence Hub</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {products.length} product{products.length > 1 ? 's' : ''} uploaded • Click any row to expand details
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/analytics/audit-report')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#262828] hover:bg-[#2d3030] rounded-lg text-sm font-medium transition-colors"
                >
                  <FileCheck size={16} />
                  View Audit Report
                </button>
                <button
                  onClick={() => navigate('/analytics-dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#32808D] hover:bg-[#2a6d7a] rounded-lg text-sm font-medium transition-colors"
                >
                  <BarChart3 size={16} />
                  View Analytics
                </button>
              </div>
            </div>

            <AuditProductTable products={products} />
          </div>
        )}

        {/* Instructions */}
        {products.length === 0 && !loading && (
          <div className="bg-[#1F2121] rounded-lg border border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#32808D]" />
              How to Use Bulk Upload
            </h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#32808D] flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>Download the template file to see the required format</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#32808D] flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>Fill in your product data (ASIN, cost, selling price, quantity, category)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#32808D] flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <span>Upload your completed CSV or Excel file</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#32808D] flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <span>Review the validation results and click "View Analytics" to see insights</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadPage;
