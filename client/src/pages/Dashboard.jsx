import DashboardLayout from '../components/layout/DashboardLayout'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's your overview.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/calculator')}
            className="p-6 bg-[#262828] rounded-lg border border-gray-800 hover:border-[#32808D] transition-colors text-left"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-white font-semibold">New Analysis</h3>
            <p className="text-gray-400 text-sm mt-1">Calculate profitability</p>
          </button>
          
          <div className="p-6 bg-[#262828] rounded-lg border border-gray-800 opacity-50">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="text-white font-semibold">Shipping</h3>
            <p className="text-gray-400 text-sm mt-1">Coming soon</p>
          </div>
          
          <div className="p-6 bg-[#262828] rounded-lg border border-gray-800 opacity-50">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-white font-semibold">Reports</h3>
            <p className="text-gray-400 text-sm mt-1">Coming soon</p>
          </div>
        </div>
        
        {/* Coming Soon Section */}
        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Coming Soon</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#1F2121] rounded-lg border border-gray-700">
              <div className="text-2xl">🚚</div>
              <div>
                <h3 className="text-white font-medium">Shipping Intelligence</h3>
                <p className="text-gray-400 text-sm">Compare carrier rates across 50+ routes</p>
              </div>
              <span className="ml-auto text-xs bg-[#32808D] bg-opacity-20 text-[#32808D] px-3 py-1 rounded-full">Next</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-[#1F2121] rounded-lg border border-gray-700 opacity-60">
              <div className="text-2xl">💡</div>
              <div>
                <h3 className="text-white font-medium">AI Recommendations</h3>
                <p className="text-gray-400 text-sm">Get 5 daily actions to save money</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-[#1F2121] rounded-lg border border-gray-700 opacity-60">
              <div className="text-2xl">📊</div>
              <div>
                <h3 className="text-white font-medium">Advanced Analytics</h3>
                <p className="text-gray-400 text-sm">Trend charts & historical comparisons</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            Have a feature request? <a href="mailto:feedback@storehero.com" className="text-[#32808D] hover:underline">Let us know</a>
          </p>
        </div>
        
        {/* AI Recommendations Section */}
        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">💡 AI Recommendations</h2>
          <p className="text-gray-400">
            Complete your first analysis to receive AI-powered recommendations.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
