import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { ProductsProvider } from './contexts/ProductsContext';
import Navbar from './components/Navbar';
import RouteTransition from './components/RouteTransition';
import Breadcrumb from './components/Breadcrumb';
import LandingPage from './pages/LandingPage';
import CalculatorPage from './pages/CalculatorPage';
import PortfolioPage from './pages/PortfolioPage';
import Dashboard from './pages/Dashboard';
import Shipping from './pages/Shipping';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import History from './pages/History';
import BulkUpload from './pages/BulkUpload';
import BulkUploadWithContext from './components/BulkUploadWithContext';
import BulkUploadPage from './pages/BulkUploadPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import AuditReportPage from './pages/AuditReportPage';
import ApiKeys from './pages/ApiKeys';
import Teams from './pages/Teams';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import DemoAccessButton from './components/DemoAccessButton';
import './index.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Pricing Analysis
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ProductsProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Routes>
                {/* Landing page without navbar */}
                <Route path="/" element={
                  <RouteTransition>
                    <LandingPage />
                  </RouteTransition>
                } />
                
                {/* Dashboard routes - no Navbar (DashboardLayout handles it) */}
                <Route path="/dashboard" element={
                  <RouteTransition>
                    <Dashboard />
                  </RouteTransition>
                } />
                
                <Route path="/calculator" element={
                  <RouteTransition>
                    <CalculatorPage />
                  </RouteTransition>
                } />
                
                <Route path="/portfolio" element={
                  <RouteTransition>
                    <PortfolioPage />
                  </RouteTransition>
                } />
                
                <Route path="/shipping" element={
                  <RouteTransition>
                    <Shipping />
                  </RouteTransition>
                } />
                
                <Route path="/bulk-upload" element={
                  <RouteTransition>
                    <BulkUploadPage />
                  </RouteTransition>
                } />
                
                <Route path="/analytics-dashboard" element={
                  <RouteTransition>
                    <AnalyticsDashboardPage />
                  </RouteTransition>
                } />
                
                <Route path="/analytics/audit-report" element={
                  <RouteTransition>
                    <AuditReportPage />
                  </RouteTransition>
                } />
                
                <Route path="/settings" element={
                  <RouteTransition>
                    <Settings />
                  </RouteTransition>
                } />
                
                {/* All other pages with navbar */}
                <Route path="/*" element={
                  <div>
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">
                      <Breadcrumb />
                      <Routes>
                        <Route path="/login" element={
                          <RouteTransition>
                            <Login />
                          </RouteTransition>
                        } />
                        <Route path="/register" element={
                          <RouteTransition>
                            <Register />
                          </RouteTransition>
                        } />
                        <Route path="/forgot-password" element={
                          <RouteTransition>
                            <ForgotPassword />
                          </RouteTransition>
                        } />
                        <Route path="/reset-password" element={
                          <RouteTransition>
                            <ResetPassword />
                          </RouteTransition>
                        } />
                        <Route path="/pricing" element={
                          <RouteTransition>
                            <Pricing />
                          </RouteTransition>
                        } />
                        
                        {/* Protected Routes */}
                        <Route path="/history" element={
                          <RouteTransition>
                            <ProtectedRoute requiredPlan="premium">
                              <History />
                            </ProtectedRoute>
                          </RouteTransition>
                        } />
                        <Route path="/bulk" element={
                          <RouteTransition>
                            <ProtectedRoute requiredPlan="premium">
                              <BulkUploadWithContext />
                            </ProtectedRoute>
                          </RouteTransition>
                        } />
                        <Route path="/api-keys" element={
                          <RouteTransition>
                            <ProtectedRoute requiredPlan="pro">
                              <ApiKeys />
                            </ProtectedRoute>
                          </RouteTransition>
                        } />
                        <Route path="/teams" element={
                          <RouteTransition>
                            <ProtectedRoute requiredPlan="pro">
                              <Teams />
                            </ProtectedRoute>
                          </RouteTransition>
                        } />
                        <Route path="/profile" element={
                          <RouteTransition>
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          </RouteTransition>
                        } />
                        
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                  </div>
                } />
              </Routes>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  },
                }}
              />
              <DemoAccessButton />
            </div>
          </Router>
        </ProductsProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

