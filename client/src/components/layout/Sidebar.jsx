import { NavLink } from 'react-router-dom'
import { Home, BarChart3, Upload, Truck, Settings, User, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function Sidebar({ isCollapsed, onToggle }) {
  const { user, logout } = useAuth()
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/calculator', icon: BarChart3, label: 'Analyze' },
    { path: '/bulk-upload', icon: Upload, label: 'Bulk Upload' },
    { path: '/shipping', icon: Truck, label: 'Shipping' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ]
  
  return (
    <aside
      className={`bg-[#1F2121] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`p-6 border-b border-gray-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="transition-opacity duration-200">
            <h1 className="text-xl font-bold text-white">StoreHero</h1>
            <p className="text-xs text-gray-400 mt-1">Seller Analytics</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-[#262828] text-gray-300 flex items-center justify-center hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-[#262828] text-[#32808D] border-l-2 border-[#32808D]'
                : 'text-gray-300 hover:bg-[#262828] hover:text-white'
              }
            `}
          >
            <Icon size={20} />
            <span className={`truncate transition-opacity duration-200 ${isCollapsed ? 'opacity-0 invisible w-0' : 'opacity-100'}`}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
      
      {/* User section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#262828]">
          <div className="w-8 h-8 rounded-full bg-[#32808D] flex items-center justify-center text-white text-sm font-medium">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100'}`}>
            <p className="text-sm font-medium text-white truncate">
              {user?.email || 'User'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-300 hover:bg-[#262828] hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100'}`}>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
