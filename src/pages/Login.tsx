import { Logo } from '../components/Logo';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, ArrowRight, Chrome, Lock, User as UserIcon } from 'lucide-react';

export function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const { user, customerData } = useAuth();

  // If already logged in and it's a customer, go to account
  if (user && customerData) {
    return <Navigate to="/account" replace />;
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/account`
        }
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
             data: {
                full_name: name
             }
          }
        });
        if (error) throw error;
        
        if (data.user) {
           setMessage('Account created! You can now log in.');
           setIsSignup(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (e: any) {
      if (e.message === 'Invalid login credentials') {
         setError('Invalid email or password');
      } else {
         setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });
      if (error) throw error;
      setStep('otp');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });
      if (error) throw error;
      
      if (data.user) {
        navigate('/account');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first to reset password');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setMessage('Password reset instructions sent to your email.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-[#eaeaea] rounded-3xl shadow-xl shadow-black/5">
        <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <div className="text-center">
          <h2 className="text-3xl font-black text-[#111111] tracking-tight">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="mt-2 text-[14px] text-[#666666]">{isSignup ? 'Sign up for exclusive benefits' : 'Sign in to your account'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
            {message}
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-[#eaeaea] rounded-xl hover:border-black hover:bg-gray-50 transition-all text-[#111111] font-bold"
          >
            <Chrome className="w-5 h-5 text-gray-700" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eaeaea]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#888888] font-medium tracking-wide text-xs uppercase">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
             {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-[#111111] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border-2 border-[#eaeaea] rounded-xl focus:border-black focus:ring-0 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
             )}
             <div>
               <div className="flex justify-between items-center mb-2">
                 <label htmlFor="email" className="block text-sm font-bold text-[#111111]">
                   Email Address
                 </label>
               </div>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   id="email"
                   name="email"
                   type="email"
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="block w-full pl-12 pr-4 py-3.5 border-2 border-[#eaeaea] rounded-xl focus:border-black focus:ring-0 transition-colors"
                   placeholder="you@example.com"
                 />
               </div>
             </div>

             <div>
               <div className="flex justify-between items-center mb-2">
                 <label htmlFor="password" className="block text-sm font-bold text-[#111111]">
                   Password
                 </label>
                 {!isSignup && (
                    <button 
                       type="button"
                       onClick={handleForgotPassword}
                       className="text-xs font-bold text-[#f47c20] hover:underline"
                    >
                       Forgot Password?
                    </button>
                 )}
               </div>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-gray-400" />
                 </div>
                 <input
                   id="password"
                   name="password"
                   type="password"
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="block w-full pl-12 pr-4 py-3.5 border-2 border-[#eaeaea] rounded-xl focus:border-black focus:ring-0 transition-colors"
                   placeholder="••••••••"
                 />
               </div>
             </div>

             <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-[#111111] hover:bg-black font-bold uppercase tracking-wider text-[13px] shadow-lg shadow-black/10 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 gap-2 mt-2"
              >
                {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Login')}
                {!loading && <ArrowRight className="w-4 h-4" />}
             </button>
          </form>

          <div className="text-center mt-4">
             <button onClick={() => setIsSignup(!isSignup)} className="text-[#111111] text-sm font-bold hover:underline">
               {isSignup ? 'Already have an account? Login' : 'Create Account'}
             </button>
          </div>

          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center pt-2">
              <div className="w-full border-t border-[#eaeaea]" />
            </div>
            <div className="relative flex justify-center text-sm pt-2">
              <span className="px-2 bg-white text-[#888888] font-medium tracking-wide text-xs uppercase">Or</span>
            </div>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-[#111111] mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border-2 border-[#eaeaea] rounded-xl focus:border-black focus:ring-0 transition-colors"
                    placeholder="(555) 000-0000"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 border-2 border-[#111111] rounded-xl text-[#111111] bg-white hover:bg-gray-50 font-bold uppercase tracking-wider text-[13px] transition-all disabled:opacity-50 gap-2"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="otp" className="block text-sm font-bold text-[#111111]">
                    Enter OTP
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setStep('phone')}
                    className="text-xs font-bold text-[#f47c20] hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="block w-full px-4 py-3.5 border-2 border-[#eaeaea] rounded-xl focus:border-black focus:ring-0 transition-colors text-center text-xl tracking-widest font-mono"
                  placeholder="000000"
                />
                <p className="mt-2 text-xs text-[#888888] text-center">We sent a code to {phoneNumber}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 border-2 border-[#111111] rounded-xl text-[#111111] bg-white hover:bg-gray-50 font-bold uppercase tracking-wider text-[13px] transition-all disabled:opacity-50 gap-2"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
