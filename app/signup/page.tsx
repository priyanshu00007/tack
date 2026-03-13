"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, googleLogin } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Theme helpers
  const bg = isDark ? 'bg-black' : 'bg-gray-50';
  const text = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const textHeading = isDark ? 'text-white' : 'text-zinc-900';
  const textMuted = isDark ? 'text-zinc-500' : 'text-zinc-500';
  const inputBg = isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600' : 'bg-white border-gray-300 text-zinc-900 placeholder-zinc-400';
  const dividerBg = isDark ? 'bg-black' : 'bg-gray-50';
  const dividerBorder = isDark ? 'border-zinc-800' : 'border-gray-200';
  const logoBg = isDark ? 'bg-white' : 'bg-zinc-900';
  const logoText = isDark ? 'text-black' : 'text-white';
  const btnPrimary = isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800';
  const btnSpinner = isDark ? 'border-black border-t-transparent' : 'border-white border-t-transparent';
  const linkText = isDark ? 'text-white' : 'text-zinc-900';
  const labelText = isDark ? 'text-zinc-300' : 'text-zinc-700';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const success = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      if (success) {
        router.push("/");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Signup failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const success = await googleLogin();
      if (success) {
        router.push('/');
      } else {
        setErrors({ general: 'Google signup failed' });
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Google signup failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 0, text: '', color: '' },
      { strength: 1, text: 'Weak', color: 'bg-red-500' },
      { strength: 2, text: 'Fair', color: 'bg-orange-500' },
      { strength: 3, text: 'Good', color: 'bg-yellow-500' },
      { strength: 4, text: 'Strong', color: 'bg-emerald-500' },
      { strength: 5, text: 'Very Strong', color: 'bg-emerald-600' }
    ];

    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={`min-h-screen ${bg} ${text} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${logoBg} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <span className={`${logoText} font-bold font-serif text-2xl`}>Z</span>
          </div>
          <h1 className={`text-3xl font-serif ${textHeading} mb-2`}>Join Zenith</h1>
          <p className={textMuted}>Create your account to master productivity</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2">
              <span>⚠</span>
              {errors.general}
            </div>
          )}

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className={`w-full ${btnPrimary} py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm hover:shadow-md`}
          >
            {isLoading ? (
              <>
                <div className={`w-5 h-5 border-2 ${btnSpinner} rounded-full animate-spin`}></div>
                Signing up...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </>
            )}
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

          {/* Name Field */}
          <div>
            <label className={`block text-sm font-medium ${labelText} mb-2`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${inputBg} border ${errors.name ? 'border-red-500' : ''} pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all`}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className={`block text-sm font-medium ${labelText} mb-2`}>
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
            <label className={`block text-sm font-medium ${labelText} mb-2`}>
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
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${textMuted}`}>Password Strength</span>
                  <span className={`text-xs ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className={`h-1.5 w-full ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className={`block text-sm font-medium ${labelText} mb-2`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full ${inputBg} border ${errors.confirmPassword ? 'border-red-500' : ''} pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 transition-all`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${textMuted} hover:${linkText} transition-colors`}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
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
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className={textMuted}>
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className={`${linkText} hover:underline font-medium`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
