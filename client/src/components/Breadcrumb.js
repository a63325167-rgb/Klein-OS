import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getPageTitle = (path) => {
    const titles = {
      'calculator': 'Calculator',
      'pricing': 'Pricing',
      'login': 'Sign In',
      'register': 'Sign Up',
      'forgot-password': 'Forgot Password',
      'reset-password': 'Reset Password',
      'history': 'History',
      'bulk': 'Bulk Upload',
      'api-keys': 'API Keys',
      'teams': 'Teams',
      'profile': 'Profile'
    };
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  if (pathnames.length === 0) {
    return null; // Don't show breadcrumb on home page
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link 
        to="/" 
        className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="ml-1">Home</span>
      </Link>
      
      {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const title = getPageTitle(path);

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-4 h-4" />
            {isLast ? (
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {title}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
