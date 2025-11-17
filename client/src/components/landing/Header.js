import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Menu, 
  X, 
  ArrowUp,
  Target,
  BarChart3,
  Lightbulb,
  Euro,
  Users,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Calculator,
  FileSpreadsheet,
  Award,
  TrendingUp,
  DollarSign,
  Zap
} from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle smooth scroll to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    setIsMobileMenuOpen(false);
  };

  // Handle back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { 
      id: 'features', 
      label: 'Features', 
      icon: BarChart3,
      hasDropdown: true,
      dropdownItems: [
        { id: 'features', label: 'Overview', icon: Globe, description: 'Key features overview' },
        { id: 'demo', label: 'Demo', icon: Calculator, description: 'Live analytics demo' },
        { id: 'testimonials', label: 'Testimonials', icon: Users, description: 'Customer success stories' }
      ]
    },
    { id: 'pricing', label: 'Pricing', icon: Euro },
    { id: 'contact', label: 'Contact', icon: Users }
  ];

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200 dark:border-slate-700' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo - Clickable Home Button */}
            <motion.button
              onClick={() => scrollToSection('hero')}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Amazon Analytics
              </span>
            </motion.button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.hasDropdown ? (
                    <div
                      onMouseEnter={() => setIsFeaturesDropdownOpen(true)}
                      onMouseLeave={() => setIsFeaturesDropdownOpen(false)}
                      className="relative"
                    >
                      <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium focus:outline-none">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {isFeaturesDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50"
                          >
                            {item.dropdownItems.map((dropdownItem, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  scrollToSection(dropdownItem.id);
                                  setIsFeaturesDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                              >
                                <dropdownItem.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <div>
                                  <div className="font-medium text-slate-900 dark:text-white">
                                    {dropdownItem.label}
                                  </div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {dropdownItem.description}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium focus:outline-none"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/calculator"
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium focus:outline-none"
              >
                Calculator
              </Link>
              
              <button
                onClick={() => scrollToSection('demo')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
              >
                Try Demo
              </button>
              
              {/* Theme Toggle - Moved to the right */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none"
                aria-label="Toggle theme"
              >
                <motion.div
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMobileMenuOpen ? 1 : 0,
            height: isMobileMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link
                to="/calculator"
                className="block w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium mb-2"
              >
                Calculator
              </Link>
              
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 font-medium mb-2"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              
              <button
                onClick={() => scrollToSection('demo')}
                className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Demo
              </button>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isScrolled ? 1 : 0,
          scale: isScrolled ? 1 : 0
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </>
  );
};

export default Header;
