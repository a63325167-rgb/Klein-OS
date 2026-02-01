import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

function Settings() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Customize your experience</p>
        </div>

        {/* Appearance Settings */}
        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Theme</label>
                <p className="text-gray-400 text-sm mt-1">Choose your preferred color scheme</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-[#32808D] text-white hover:bg-[#3a909f] transition-colors"
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between opacity-50">
              <div>
                <label className="text-white font-medium">Email Notifications</label>
                <p className="text-gray-400 text-sm mt-1">Receive updates about your calculations</p>
              </div>
              <div className="text-gray-500 text-sm">Coming soon</div>
            </div>
            
            <div className="flex items-center justify-between opacity-50">
              <div>
                <label className="text-white font-medium">Price Alerts</label>
                <p className="text-gray-400 text-sm mt-1">Get notified when shipping rates change</p>
              </div>
              <div className="text-gray-500 text-sm">Coming soon</div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Current Plan</label>
              <div className="text-white font-medium mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#32808D] bg-opacity-20 text-[#32808D]">
                  {user?.plan?.toUpperCase() || 'PRO'}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                🚀 More settings coming soon: API keys, webhooks, data export, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900 bg-opacity-10 rounded-lg border border-red-800 p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Delete Account</label>
                <p className="text-gray-400 text-sm mt-1">Permanently delete your account and all data</p>
              </div>
              <button
                disabled
                className="px-4 py-2 rounded-lg bg-red-600 text-white opacity-50 cursor-not-allowed"
              >
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Settings
