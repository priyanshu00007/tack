"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin, loginAsGuest } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Theme helpers
  const bg = isDark ? 'bg-black' : 'bg-gray-50';
  const text = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const textHeading = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600' : 'bg-white border-gray-300 text-zinc-900 placeholder-zinc-400';
  const cardBg = isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200 shadow-sm';
  const dividerBg = isDark ? 'bg-black' : 'bg-gray-50';
  const dividerBorder = isDark ? 'border-zinc-800' : 'border-gray-200';
  const logoBg = isDark ? 'bg-white' : 'bg-zinc-900';
  const logoText = isDark ? 'text-black' : 'text-white';
  const btnPrimary = isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800';
  const btnSpinner = isDark ? 'border-black border-t-transparent' : 'border-white border-t-transparent';
  const linkText = isDark ? 'text-white' : 'text-zinc-900';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        router.push('/');
      } else {
        setErrors({ general: 'Invalid email or password' });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Login failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const success = await googleLogin();
      if (success) {
        router.push('/');
      } else {
        setErrors({ general: 'Google login failed' });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Google login failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest('Guest User');
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${logoBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <span className={`${logoText} font-bold font-serif text-2xl`}>Z</span>
          </div>
          <h1 className={`text-3xl font-serif ${textHeading} mb-2`}>Welcome Back</h1>
          <p className={textMuted}>Sign in to your Zenith account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              {errors.general}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={`w-full ${btnPrimary} py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow-md`}
          >
            {isLoading ? (
              <>
                <div className={`w-5 h-5 border-2 ${btnSpinner} rounded-full animate-spin`}></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          {/* Guest Mode Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className={`w-full border ${dividerBorder} ${isDark ? 'text-zinc-300 hover:bg-zinc-900' : 'text-zinc-700 hover:bg-gray-100'} py-3 rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            <UserPlus size={18} />
            Continue as Guest (No Login)
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${dividerBorder}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-3 ${dividerBg} ${textMuted}`}>Or continue with email</span>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'} mb-2`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full ${inputBg} border ${errors.email ? 'border-red-500' : ''} pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'} mb-2`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full ${inputBg} border ${errors.password ? 'border-red-500' : ''} pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${linkText} transition-colors`}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${btnPrimary} py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md`}
          >
            {isLoading ? (
              <>
                <div className={`w-5 h-5 border-2 ${btnSpinner} rounded-full animate-spin`}></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className={textMuted}>
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className={`${linkText} hover:underline font-medium`}
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Demo Account Info */}
        <div className={`mt-6 p-4 ${cardBg} border rounded-xl`}>
          <p className={`text-xs ${textMuted} mb-2 font-medium`}>💡 Demo Account:</p>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Email: demo@zenith.com</p>
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
