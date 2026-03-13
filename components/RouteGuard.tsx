"use client"
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isDark } = useTheme();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, requireAuth, redirectTo]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-black text-zinc-200' : 'bg-white text-zinc-800'} font-sans flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-12 h-12 ${isDark ? 'bg-white' : 'bg-zinc-900'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <span className={`${isDark ? 'text-black' : 'text-white'} font-bold font-serif text-xl`}>Z</span>
          </div>
          <div className={`w-6 h-6 border-2 ${isDark ? 'border-white border-t-transparent' : 'border-zinc-900 border-t-transparent'} rounded-full animate-spin mx-auto mb-3`}></div>
          <p className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Will redirect
  }

  return <>{children}</>;
};
