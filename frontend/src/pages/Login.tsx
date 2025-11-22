import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password too short';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      // After successful login, go to the chat interface
      navigate('/chat');
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      
      {/* LEFT SIDE: Brand/Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 items-center justify-center overflow-hidden p-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-700" />
        </div>

        {/* Content */}
          <div className="relative z-10 max-w-md text-white">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-8 shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
            Welcome to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-100">
              RAGFusion
            </span>
          </h1>

          <p className="text-lg text-blue-50 leading-relaxed mb-8">
            Chat with your documents using Retrieval-Augmented Generation — fast, private, and contextual.
          </p>

          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-blue-50">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Secure & Private
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-50">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              Fast & Reliable
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Sign in
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Error Banner */}
            {errors.general && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
                  </div>
                  <p className="text-sm text-red-800 dark:text-red-400 flex-1">
                    {errors.general}
                  </p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    block w-full rounded-xl border bg-white dark:bg-slate-800/50 
                    pl-11 pr-4 py-3 text-sm shadow-sm
                    text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.email 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'
                    }
                  `}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    block w-full rounded-xl border bg-white dark:bg-slate-800/50 
                    pl-11 pr-12 py-3 text-sm shadow-sm
                    text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                    focus:outline-none focus:ring-2 transition-all
                    ${errors.password 
                      ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 dark:focus:border-blue-500'
                    }
                  `}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-600 dark:bg-red-400" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 bg-white dark:bg-slate-800"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-500 dark:text-slate-400">
                  New to our platform?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-500">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-400">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-slate-700 dark:hover:text-slate-400">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};