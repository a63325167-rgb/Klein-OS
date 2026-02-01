import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // DEV MODE: Bulletproof auto-login for development
  useEffect(() => {
    const initAuth = async () => {
      // Skip in production
      if (process.env.NODE_ENV === 'production') return;

      console.log('🔧 DEV MODE: Initializing authentication...');

      // Check if we already have a valid token
      const existingToken = localStorage.getItem('token');
      if (existingToken) {
        console.log('✅ DEV MODE: Token exists, verifying...');
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
        
        // Try to verify token is still valid
        try {
          const response = await axios.get('/api/v1/auth/profile');
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            setToken(existingToken);
            console.log('✅ DEV MODE: Existing token valid, logged in as', response.data.user.email);
            toast.success(`🔧 DEV MODE: Logged in as ${response.data.user.email}`);
            return; // Success, exit early
          }
        } catch (error) {
          console.log('⚠️ Token invalid or expired, will login again...');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }

      // No valid token, perform login
      console.log('🔐 DEV MODE: Attempting auto-login...');

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@kleinpaket.com',
            password: 'admin123'
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Auto-login failed:', response.status, errorText);
          
          // Show detailed error message
          const errorMsg = `⚠️ DEV MODE: Backend login failed (${response.status})

Possible causes:
1. Backend not running on port 5002
2. admin@kleinpaket.com user doesn't exist in database
3. Password hash mismatch

Check terminal for backend logs.
Run: npm run dev`;
          
          console.error(errorMsg);
          toast.error(`Auto-login failed (${response.status}). Check console for details.`);
          return;
        }

        const data = await response.json();

        if (data.token && data.user) {
          // Save token
          localStorage.setItem('token', data.token);
          setToken(data.token);
          
          // Update state
          setUser(data.user);
          setIsAuthenticated(true);
          
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          
          console.log('✅ DEV MODE: Successfully logged in as', data.user.email);
          console.log('🎟️ Token:', data.token.substring(0, 20) + '...');
          toast.success(`🔧 DEV MODE: Logged in as ${data.user.email}`);
        } else {
          console.error('❌ Login response missing token or user:', data);
          toast.error('⚠️ Backend returned incomplete data. Check server logs.');
        }

      } catch (error) {
        console.error('❌ DEV MODE Auto-login error:', error.message);
        
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          const errorMsg = `⚠️ Cannot connect to backend

Error: ${error.message}

Make sure backend is running:
Terminal: npm run dev

Backend should be at: http://localhost:5002`;
          
          console.error(errorMsg);
          toast.error('Cannot connect to backend. Check console for details.');
        } else {
          console.error(`⚠️ Unexpected error: ${error.message}`);
          toast.error(`Unexpected error: ${error.message}`);
        }
      }
    };

    initAuth();
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/v1/auth/profile');
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('🔐 MVP LOGIN: Using localStorage-based auth');
      
      // MVP: Simple localStorage-based auth (no backend required)
      const mockUser = {
        id: 'demo-user-123',
        email: email,
        name: email.split('@')[0],
        plan: 'free'
      };
      
      const mockToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    try {
      console.log('📝 MVP REGISTER: Using localStorage-based auth');
      
      // MVP: Simple localStorage-based registration (no backend required)
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        name: name || email.split('@')[0],
        plan: 'free'
      };
      
      const mockToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Register error:', error);
      toast.error('Registration failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const requestPasswordReset = async (email) => {
    try {
      await axios.post('/api/v1/auth/password-reset', { email });
      toast.success('If this email is registered, we\'ve sent a password reset link.');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset request failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await axios.post('/api/v1/auth/password-reset/confirm', {
        token,
        password
      });
      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateProfile = async (name, theme_pref) => {
    try {
      await axios.put('/api/v1/auth/profile', {
        name,
        theme_pref
      });
      
      setUser(prev => ({
        ...prev,
        name: name || prev.name,
        theme_pref: theme_pref || prev.theme_pref
      }));
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

