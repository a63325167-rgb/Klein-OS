import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

function DemoAccessButton() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (isAuthenticated) {
    return null;
  }

  const handleDemoLogin = async () => {
    if (isLoggingIn || isLoading) return;

    setIsLoggingIn(true);
    
    try {
      const response = await axios.post('/api/v1/auth/demo-login');
      const { token, user } = response.data;
      
      // Store token and set axios default header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Welcome to the demo!');
      
      // Force page reload to trigger auth context update
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error(error.response?.data?.error || 'Demo login failed');
      setIsLoggingIn(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDemoLogin}
      disabled={isLoggingIn || isLoading}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-md bg-[#32808D] text-white text-sm font-medium transition hover:bg-[#3a909f] focus:outline-none focus:ring-2 focus:ring-[#51A5B5] disabled:opacity-70 disabled:cursor-not-allowed"
      title="Quick demo login"
    >
      {isLoggingIn ? (
        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3" />
      )}
      <span className="hidden sm:inline">{isLoggingIn ? 'Loading…' : 'Demo'}</span>
    </button>
  );
}

export default DemoAccessButton;
