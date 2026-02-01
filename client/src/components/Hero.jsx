import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>
      </div>

      {/* Floating Dots Animation */}
      <motion.div
        className="absolute top-20 left-[10%] w-2 h-2 bg-blue-500 rounded-full"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-[15%] w-3 h-3 bg-blue-400 rounded-full"
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute bottom-40 left-[20%] w-2.5 h-2.5 bg-blue-300 rounded-full"
        animate={{
          y: [0, -50, 0],
          x: [0, 40, 0],
          opacity: [0.25, 0.55, 0.25]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Header/Nav - Sticky */}
      <motion.nav
        className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-white">Klein </span>
                <span className="text-blue-500">OS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/calculator" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Calculator
              </Link>
              <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Docs
              </a>
              <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Enterprise
              </a>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <Link
                to="/register"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-102 hover:shadow-lg hover:shadow-blue-500/50"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-400 hover:text-white"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-3">
                <Link to="/" className="block text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/calculator" className="block text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Calculator
                </Link>
                <a href="#faq" className="block text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Docs
                </a>
                <a href="#pricing" className="block text-sm font-medium text-gray-300 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                  Enterprise
                </a>
                <Link to="/register" className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Copy */}
          <div className="text-left">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Financial Analytics for E-Commerce
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Amazon, eBay & Shopify profit calculator. Stop guessing.
            </motion.p>

            <motion.p
              className="text-sm text-gray-400 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Trusted by online sellers managing €100K+ in annual revenue
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link
                to="/calculator"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg font-semibold rounded-lg transition-all hover:scale-102 hover:shadow-lg hover:shadow-blue-500/50"
                style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
              >
                Start Free Calculator
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 text-base sm:text-lg font-semibold rounded-lg transition-all group"
              >
                <Play className="mr-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Watch 2min Demo
              </a>
            </motion.div>
          </div>

          {/* Right Column - Dashboard Mockup (Hidden on mobile) */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 p-6">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xs text-gray-500">Dashboard Preview</div>
              </div>

              {/* Chart Preview */}
              <div className="space-y-4">
                <div className="h-40 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg flex items-end justify-around p-4 overflow-hidden">
                  {[60, 80, 95, 70, 85].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-12 bg-blue-500 rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1.5, delay: 1.5 + i * 0.1, ease: "easeOut" }}
                    />
                  ))}
                </div>

                {/* Data Table Preview */}
                <div className="space-y-2">
                  {[450, 320, 580].map((value, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center justify-between bg-gray-900/50 rounded p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 2 + i * 0.1 }}
                    >
                      <div className="text-sm text-gray-400">SKU-00{i + 1}</div>
                      <motion.div
                        className="text-sm font-semibold text-green-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 2.2 + i * 0.1 }}
                      >
                        €{value}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </section>
  );
};

export default Hero;
