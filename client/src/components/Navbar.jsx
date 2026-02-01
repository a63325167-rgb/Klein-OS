import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  Settings, 
  History, 
  Upload, 
  Key, 
  Users, 
  Crown,
  Menu,
  X,
  Calculator
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentPlan, hasFeature } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const getPlanBadge = () => {
    if (!currentPlan) return null;

    const planColors = {
      free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      premium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      pro: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    const planIcons = {
      free: null,
      premium: <Crown className="w-3 h-3" />,
      pro: <Crown className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${planColors[currentPlan.plan]}`}>
        {planIcons[currentPlan.plan]}
        {currentPlan.plan.charAt(0).toUpperCase() + currentPlan.plan.slice(1)}
        {currentPlan.demo_mode && ' (Demo)'}
      </span>
    );
  };

  const getNavigationItems = () => {
    const items = [
      { name: 'Calculator', href: '/calculator', public: true, icon: Calculator },
      { name: 'Pricing', href: '/pricing', public: true, icon: null },
    ];

    if (isAuthenticated) {
      items.push(
        { 
          name: 'History', 
          href: '/history', 
          public: false, 
          icon: History,
          requiresPlan: 'premium'
        },
        { 
          name: 'Bulk Upload', 
          href: '/bulk', 
          public: false, 
          icon: Upload,
          requiresPlan: 'premium'
        },
        { 
          name: 'API Keys', 
          href: '/api-keys', 
          public: false, 
          icon: Key,
          requiresPlan: 'pro'
        },
        { 
          name: 'Teams', 
          href: '/teams', 
          public: false, 
          icon: Users,
          requiresPlan: 'pro'
        }
      );
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/calculator" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Pricing Analysis
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const hasAccess = !item.requiresPlan || hasFeature(item.requiresPlan);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    hasAccess
                      ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                      : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                  title={!hasAccess ? `Requires ${item.requiresPlan} plan` : ''}
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {item.name}
                  {item.requiresPlan && !hasAccess && (
                    <Crown className="w-3 h-3 ml-1 text-yellow-500" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme toggle, Auth, Profile */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Plan badge */}
                {getPlanBadge()}

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {navigationItems.map((item) => {
                const hasAccess = !item.requiresPlan || hasFeature(item.requiresPlan);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      hasAccess
                        ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    title={!hasAccess ? `Requires ${item.requiresPlan} plan` : ''}
                  >
                    {Icon && <Icon className="w-5 h-5 mr-3" />}
                    {item.name}
                    {item.requiresPlan && !hasAccess && (
                      <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

