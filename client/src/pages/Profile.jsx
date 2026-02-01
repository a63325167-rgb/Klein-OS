import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'

function Profile() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-gray-400 mt-1">Manage your account settings</p>
        </div>

        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <div className="text-white font-medium mt-1">{user?.email || 'dev@storehero.com'}</div>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Name</label>
              <div className="text-white font-medium mt-1">{user?.name || 'Developer'}</div>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Plan</label>
              <div className="text-white font-medium mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#32808D] bg-opacity-20 text-[#32808D]">
                  {user?.plan?.toUpperCase() || 'PRO'} {user?.demo_mode_flag && '(Demo)'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Member Since</label>
              <div className="text-white font-medium mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#262828] rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Coming Soon</h2>
          <div className="space-y-2 text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-[#32808D]">•</span>
              <span>Change password</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#32808D]">•</span>
              <span>Email notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#32808D]">•</span>
              <span>API access & keys</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#32808D]">•</span>
              <span>Billing settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#32808D]">•</span>
              <span>Team management</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile
