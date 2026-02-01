import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link as LinkIcon, 
  Unlink, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Package,
  DollarSign,
  Activity,
  ExternalLink
} from 'lucide-react';

/**
 * Integrations Page (B8)
 * 
 * Manage Amazon SP-API connection:
 * - Connect/disconnect Amazon account
 * - View sync status
 * - Trigger manual sync
 * - View sync history
 */

const IntegrationsPage = () => {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatus();
    
    // Poll status every 10 seconds during sync
    const interval = setInterval(() => {
      if (status?.latestSync?.status === 'running') {
        fetchStatus();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/amazon/status', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = '/api/amazon/connect';
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Amazon account? This will remove all synced data.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/amazon/disconnect', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
      
      await fetchStatus();
    } catch (err) {
      console.error('Failed to disconnect:', err);
      alert('Failed to disconnect Amazon account');
    }
  };

  const handleSyncNow = async (type = 'full') => {
    setIsSyncing(true);
    
    try {
      const response = await fetch('/api/amazon/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start sync');
      }
      
      // Poll for updated status
      setTimeout(fetchStatus, 2000);
    } catch (err) {
      console.error('Failed to sync:', err);
      alert('Failed to start sync');
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Integrations
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Connect your Amazon Seller account to sync products, orders, and performance data automatically
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Error loading integration status</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Amazon SP-API Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-10 h-10">
                    <path fill="#FF9900" d="M13.5 17.5c-2.7 0-5.4-.7-7.7-2-.3-.2-.3-.6-.1-.8.2-.3.6-.3.8-.1 2.1 1.2 4.5 1.8 7 1.8 2.5 0 4.9-.6 7-1.8.3-.2.6-.1.8.1.2.3.1.6-.1.8-2.3 1.3-5 2-7.7 2z"/>
                    <path fill="#FF9900" d="M20.5 14c-.1 0-.3 0-.4-.1-3.6-2.1-8.1-2.1-11.7 0-.3.2-.6.1-.8-.2-.2-.3-.1-.6.2-.8 3.9-2.3 8.8-2.3 12.7 0 .3.2.4.5.2.8-.1.2-.2.3-.2.3z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Amazon SP-API</h2>
                  <p className="text-orange-100 text-sm">
                    Official Amazon Selling Partner API integration
                  </p>
                </div>
              </div>
              
              {status?.connected && (
                <div className="flex items-center gap-2 bg-green-500 bg-opacity-20 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Connected</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {!status?.connected ? (
              <DisconnectedState onConnect={handleConnect} />
            ) : (
              <ConnectedState 
                seller={status.seller}
                latestSync={status.latestSync}
                recentSyncs={status.recentSyncs}
                onSync={handleSyncNow}
                onDisconnect={handleDisconnect}
                isSyncing={isSyncing}
              />
            )}
          </div>
        </motion.div>

        {/* Info Cards */}
        {!status?.connected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              icon={<Activity className="w-6 h-6" />}
              title="Real-Time Sync"
              description="Automatic synchronization of orders, products, and inventory every 4 hours"
              color="blue"
            />
            <InfoCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Accurate Metrics"
              description="Profit calculations based on actual Amazon fees and settlements"
              color="green"
            />
            <InfoCard
              icon={<Package className="w-6 h-6" />}
              title="Complete Portfolio"
              description="All your FBA products with health scores and risk analysis"
              color="purple"
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Disconnected State Component
 */
const DisconnectedState = ({ onConnect }) => {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <LinkIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        Connect Your Amazon Seller Account
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
        Securely connect your Amazon Seller Central account to automatically sync your products, orders, fees, and inventory. 
        All data is encrypted and stored securely.
      </p>

      <div className="space-y-4 max-w-2xl mx-auto mb-8">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3">What gets synced:</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Products:</strong> All your active FBA listings with ASINs, SKUs, and titles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Orders:</strong> Order history, quantities, and pricing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Fees:</strong> Referral fees, FBA fees, and storage fees from settlements</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span><strong>Inventory:</strong> Available units, inbound shipments, and stock levels</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">🔒 Security & Privacy</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            We use Amazon's official OAuth 2.0 authentication. Your credentials are never stored. 
            All tokens are encrypted. You can revoke access anytime from Amazon Seller Central or here.
          </p>
        </div>
      </div>

      <button
        onClick={onConnect}
        className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-lg transition-colors inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
      >
        <LinkIcon className="w-6 h-6" />
        Connect Amazon Account
      </button>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
        By connecting, you authorize this app to access your Amazon Seller data via the SP-API
      </p>
    </div>
  );
};

/**
 * Connected State Component
 */
const ConnectedState = ({ seller, latestSync, recentSyncs, onSync, onDisconnect, isSyncing }) => {
  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'running': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'failed': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Seller Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
            {seller.sellerName || seller.amazonSellerId}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Seller ID: {seller.amazonSellerId}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Marketplace: {seller.defaultMarketplace}
          </p>
        </div>
        
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <Unlink className="w-4 h-4" />
          Disconnect
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Products"
          value={seller.productCount || 0}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="Last Sync"
          value={formatDate(seller.lastSyncAt)}
          icon={<Clock className="w-5 h-5" />}
          small
        />
        <StatCard
          label="Sync Status"
          value={seller.lastSyncStatus}
          icon={<Activity className="w-5 h-5" />}
          color={seller.lastSyncStatus === 'completed' ? 'green' : 'blue'}
        />
        <StatCard
          label="Auto Sync"
          value={seller.syncEnabled ? 'Enabled' : 'Disabled'}
          icon={<RefreshCw className="w-5 h-5" />}
          color={seller.syncEnabled ? 'green' : 'slate'}
        />
      </div>

      {/* Sync Controls */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
        <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Sync Controls</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSync('full')}
            disabled={isSyncing || latestSync?.status === 'running'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing || latestSync?.status === 'running' ? 'animate-spin' : ''}`} />
            {isSyncing || latestSync?.status === 'running' ? 'Syncing...' : 'Sync All'}
          </button>
          
          <button
            onClick={() => onSync('orders')}
            disabled={isSyncing || latestSync?.status === 'running'}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
          >
            Orders Only
          </button>
          
          <button
            onClick={() => onSync('products')}
            disabled={isSyncing || latestSync?.status === 'running'}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
          >
            Products Only
          </button>
          
          <button
            onClick={() => onSync('finances')}
            disabled={isSyncing || latestSync?.status === 'running'}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition-colors"
          >
            Fees Only
          </button>
        </div>
      </div>

      {/* Latest Sync Status */}
      {latestSync && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white">Latest Sync</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {latestSync.type} sync • Started {formatDate(latestSync.startedAt)}
              </p>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSyncStatusColor(latestSync.status)}`}>
              {latestSync.status}
            </span>
          </div>

          {latestSync.status === 'running' && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Progress</span>
                <span>{latestSync.progress.processed} / {latestSync.progress.total || '?'}</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ 
                    width: latestSync.progress.total > 0 
                      ? `${(latestSync.progress.processed / latestSync.progress.total) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          )}

          {latestSync.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{latestSync.error}</p>
            </div>
          )}

          {latestSync.completedAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completed {formatDate(latestSync.completedAt)} • Duration: {latestSync.durationSeconds}s
            </p>
          )}
        </div>
      )}

      {/* Recent Syncs History */}
      {recentSyncs && recentSyncs.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white mb-3">Recent Syncs</h4>
          <div className="space-y-2">
            {recentSyncs.map((sync) => (
              <div 
                key={sync.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {sync.type} sync
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(sync.completedAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getSyncStatusColor(sync.status)}`}>
                  {sync.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learn More Link */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <a
          href="https://developer-docs.amazon.com/sp-api/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          Learn more about Amazon SP-API
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

/**
 * Info Card Component
 */
const InfoCard = ({ icon, title, description, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colors[color]}`}>
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ label, value, icon, color = 'slate', small = false }) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`text-${color}-600 dark:text-${color}-400`}>{icon}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`font-bold text-slate-800 dark:text-white ${small ? 'text-xs' : 'text-lg'}`}>
        {value}
      </p>
    </div>
  );
};

export default IntegrationsPage;
