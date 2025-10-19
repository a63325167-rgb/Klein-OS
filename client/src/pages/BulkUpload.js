import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  X,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

const BulkUpload = () => {
  const { isAuthenticated } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [session, setSession] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  // Demo data for non-authenticated users
  const demoResults = [
    {
      id: 1,
      product_name: "Demo Product 1",
      eligibility: true,
      net_profit: 8.50,
      roi_percent: 42.5,
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      product_name: "Demo Product 2",
      eligibility: false,
      net_profit: 2.30,
      roi_percent: 8.2,
      created_at: "2024-01-15T10:31:00Z"
    },
    {
      id: 3,
      product_name: "Demo Product 3",
      eligibility: true,
      net_profit: 15.75,
      roi_percent: 55.8,
      created_at: "2024-01-15T10:32:00Z"
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError('');

    if (!isAuthenticated) {
      // Demo mode - simulate processing
      setTimeout(() => {
        setSession({
          id: 'demo-session',
          file_meta: { originalName: uploadedFile.name, size: uploadedFile.size },
          total_rows: 3,
          processed_rows: 3,
          errors_summary: [],
          status: 'completed'
        });
        setResults(demoResults);
        setIsProcessing(false);
      }, 2000);
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('/api/v1/bulk/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        pollSessionStatus(data.session_id);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollSessionStatus = async (sessionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/bulk/session/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data);

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            fetchResults(sessionId);
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setError('Processing failed. Please try again.');
          }
        }
      } catch (error) {
        console.error('Failed to poll session status:', error);
      }
    }, 2000);
  };

  const fetchResults = async (sessionId) => {
    try {
      const response = await fetch(`/api/v1/bulk/session/${sessionId}/results`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.calculations);
      }
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  const handleDownload = async () => {
    if (!session) return;

    if (!isAuthenticated) {
      // Demo mode - create CSV
      const csvContent = [
        'Product Name,Eligible,Net Profit,ROI (%),Created At',
        ...results.map(result => 
          `"${result.product_name}",${result.eligibility ? 'Yes' : 'No'},${result.net_profit},${result.roi_percent},"${formatDate(result.created_at)}"`
        ).join('\n')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk_results_${session.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return;
    }

    try {
      const response = await fetch(`/api/v1/bulk/session/${session.id}/download/csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk_results_${session.id}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download results:', error);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setSession(null);
    setResults([]);
    setError('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bulk Upload & Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a CSV or Excel file to analyze multiple products at once
        </p>
      </div>

      {/* Demo mode banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode - Sample Upload
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You can try the bulk upload interface. Upload any CSV/Excel file to see how it works.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!session && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop the file here' : 'Upload your file'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop a CSV or Excel file, or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Supported formats: CSV, XLSX, XLS
            </p>
          </div>

          {uploadedFile && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!uploadedFile || isProcessing}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                uploadedFile && !isProcessing
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {session && session.status === 'processing' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Processing your file...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {session.processed_rows} of {session.total_rows} rows processed
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(session.processed_rows / session.total_rows) * 100}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {session && session.status === 'completed' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analysis Complete
              </h3>
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Results
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {session.total_rows}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {session.processed_rows}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {JSON.parse(session.errors_summary || '[]').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {results.filter(r => r.eligibility).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Eligible</div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analysis Results
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Eligibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Net Profit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ROI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          result.eligibility
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {result.eligibility ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          result.net_profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(result.net_profit)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          result.roi_percent >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {result.roi_percent.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(result.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={resetUpload}
              className="btn-secondary"
            >
              Upload Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;