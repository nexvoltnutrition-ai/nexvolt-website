import { Logo } from '../../components/Logo';
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, adminData, loading: authLoading, logout } = useAuth();

  // If a non-admin tries to log in here, sign them out and show error
  React.useEffect(() => {
    if (!authLoading && user && !adminData) {
      console.log("[Auth] Login failed: User is not an admin.");
      logout().then(() => {
        setError('Unauthorized: You do not have admin privileges.');
        setLoading(false);
      });
    }
  }, [user, adminData, authLoading, logout]);

  // Show a loading screen while auth context is verifying session to avoid white screen or flashes
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-4 border-black border-l-transparent animate-spin"></div>
      </div>
    );
  }

  // If already logged in and it's an admin, go to admin dashboard
  if (user && adminData) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
         throw signInError;
      }
      
      console.log("[Auth] Login Success");
      
      // Wait for AuthContext to pick up the session. We DO NOT need to check admin_users here 
      // because AuthContext is the SINGLE source of truth for authentication.
      // Doing it here creates duplicate logic and race conditions.
    } catch (e: any) {
      if (e.message === 'Invalid login credentials') {
         setError('Invalid credentials');
      } else {
         setError(e.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-gray-200 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage the platform</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:border-black focus:ring-black outline-none transition-colors"
                  placeholder="admin@nexvolt.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:border-black focus:ring-black outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-black hover:bg-gray-900 font-bold tracking-wide shadow-md transition-all disabled:opacity-70 gap-2"
          >
            {loading ? 'Signing in...' : 'Admin Login'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
