import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'

function DashboardLayout({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // TEMP: Bypass auth for development
  const DEV_MODE = process.env.NODE_ENV === 'development'
  if (!isAuthenticated && !DEV_MODE) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <div className="flex h-screen bg-[#1F2121]">
      {/* Dev Mode Indicator */}
      {DEV_MODE && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-1 text-xs z-50 font-medium">
          🔧 DEV MODE: Pro Access Granted | User: {user?.email || 'Loading...'}
        </div>
      )}
      
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-20' : 'ml-60'
        } ${DEV_MODE ? 'mt-6' : ''}`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
