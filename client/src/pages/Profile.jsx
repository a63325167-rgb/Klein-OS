import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Calendar, Crown, Settings, Moon, Sun } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const { currentPlan, updatePlan, cancelSubscription } = useSubscription();
  const { theme, toggleTheme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'Demo User',
    theme_pref: theme
  });
  const [isSaving, setIsSaving] = useState(false);

  // Demo data for non-authenticated users
  const demoUser = {
    name: 'Demo User',
    email: 'demo@smallPackage.com',
    created_at: '2024-01-01T00:00:00Z',
    theme_pref: theme
  };

  const demoPlan = {
    plan: 'pro',
    demo_mode: true,
    plan_expiry: '2024-12-31T23:59:59Z'
  };

  const displayUser = isAuthenticated ? user : demoUser;
  const displayPlan = isAuthenticated ? currentPlan : demoPlan;

  useEffect(() => {
    setFormData({
      name: displayUser?.name || 'Demo User',
      theme_pref: displayUser?.theme_pref || theme
    });
  }, [displayUser, theme]);

  const handleSave = async () => {
    setIsSaving(true);
    
    if (isAuthenticated) {
      const result = await updateProfile(formData.name, formData.theme_pref);
      setIsSaving(false);
      
      if (result.success) {
        setIsEditing(false);
      }
    } else {
      // Demo mode - just simulate saving
      setTimeout(() => {
        setIsSaving(false);
        setIsEditing(false);
        // Update theme if changed
        if (formData.theme_pref !== theme) {
          toggleTheme();
        }
      }, 1000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: displayUser?.name || 'Demo User',
      theme_pref: displayUser?.theme_pref || theme
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanColor = (plan) => {
    const colors = {
      free: 'text-gray-600 dark:text-gray-400',
      premium: 'text-yellow-600 dark:text-yellow-400',
      pro: 'text-purple-600 dark:text-purple-400'
    };
    return colors[plan] || colors.free;
  };

  const getPlanIcon = (plan) => {
    if (plan === 'pro' || plan === 'premium') {
      return <Crown className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Demo mode banner for non-authenticated users */}
      {!isAuthenticated && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0">ℹ️</div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode - Sample Profile
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                You're viewing a sample profile with Pro plan features. Sign in to manage your actual profile.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Personal Information
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme Preference
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={formData.theme_pref === 'light'}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme_pref: e.target.value }))}
                        className="mr-2"
                      />
                      <Sun className="w-4 h-4 mr-1" />
                      Light
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={formData.theme_pref === 'dark'}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme_pref: e.target.value }))}
                        className="mr-2"
                      />
                      <Moon className="w-4 h-4 mr-1" />
                      Dark
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</p>
                    <p className="text-lg text-gray-900 dark:text-white">{displayUser?.name || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                    <p className="text-lg text-gray-900 dark:text-white">{displayUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-gray-400 mr-3" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Theme</p>
                    <p className="text-lg text-gray-900 dark:text-white capitalize">
                      {displayUser?.theme_pref || theme}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Account Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {formatDate(displayUser?.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-5 h-5 text-gray-400 mr-3 flex items-center justify-center">
                  {getPlanIcon(currentPlan?.plan)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Plan</p>
                  <p className={`text-lg font-semibold ${getPlanColor(displayPlan?.plan)}`}>
                    {displayPlan?.plan?.charAt(0).toUpperCase() + displayPlan?.plan?.slice(1) || 'Free'}
                    {displayPlan?.demo_mode && ' (Demo)'}
                  </p>
                </div>
              </div>

              {displayPlan?.plan !== 'free' && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {displayPlan?.demo_mode ? 'Demo Expires' : 'Plan Expires'}
                    </p>
                    <p className="text-lg text-gray-900 dark:text-white">
                      {formatDate(displayPlan?.plan_expiry)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Plan
            </h3>
            
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                displayPlan?.plan === 'free'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  : displayPlan?.plan === 'premium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
              }`}>
                {getPlanIcon(displayPlan?.plan)}
                <span className="ml-1">
                  {displayPlan?.plan?.charAt(0).toUpperCase() + displayPlan?.plan?.slice(1) || 'Free'}
                </span>
              </div>
              
              {displayPlan?.demo_mode && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                  Demo Mode Active
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <a
                href="/pricing"
                className="w-full btn-primary text-center block"
              >
                Change Plan
              </a>
              
              {displayPlan?.plan !== 'free' && displayPlan?.demo_mode && (
                <button
                  onClick={cancelSubscription}
                  className="w-full btn-secondary"
                >
                  Cancel Demo
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full btn-secondary flex items-center justify-center"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Switch to Dark
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 mr-2" />
                    Switch to Light
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Support
            </h3>
            
            <div className="space-y-3 text-sm">
              <a
                href="mailto:support@smallPackage.com"
                className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Help Center
              </a>
              <a
                href="/privacy"
                className="block text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

