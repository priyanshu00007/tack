"use client"
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Maximize2,
  Activity,
  Zap,
  Target,
  BarChart3,
  Settings,
  User,
  Sun,
  Moon,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface NavItemProps {
  id: string;
  href: string;
  icon: React.ComponentType<any>;
  label: string;
  currentPath: string;
  onClick: () => void;
}

const NavItem = ({ id, href, icon: Icon, label, currentPath, onClick }: NavItemProps) => {
  const router = useRouter();
  
  // Determine if this nav item is active
  const isActive = currentPath === href || 
    (href === '/' && currentPath === '/' && id !== 'analytics' && id !== 'profile' && id !== 'settings');

  return (
    <button
      onClick={() => {
        router.push(href);
        onClick();
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        isActive
          ? 'text-white bg-zinc-900 border-r-2 border-white'
          : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ children, activeTab, onTabChange }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation items that live on the main page as tabs
  const mainPageTabs = [
    { id: 'planner', icon: LayoutGrid, label: 'Day Planner' },
    { id: 'matrix', icon: Maximize2, label: 'Eisenhower Matrix' },
    { id: 'habits', icon: Activity, label: 'Habit Tracker' },
    { id: 'focus', icon: Zap, label: 'Focus Mode' },
    { id: 'goals', icon: Target, label: 'Goals & Vision' },
  ];

  // Navigation items that are separate routes
  const routePages = [
    { id: 'analytics', href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', href: '/profile', icon: User, label: 'Profile' },
    { id: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
      setSidebarOpen(false);
    } else {
      router.push(`/?tab=${tabId}`);
      setSidebarOpen(false);
    }
  };

  const isMainPage = pathname === '/';

  const isTabActive = (tabId: string) => {
    if (isMainPage && activeTab) {
      return activeTab === tabId;
    }
    return false;
  };

  const isRouteActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 w-64 h-screen bg-black border-r border-zinc-900 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold font-serif text-xl">Z</span>
            </div>
            <span className="font-serif text-xl text-white tracking-wide">Zenith</span>
          </button>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
          {mainPageTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isTabActive(tab.id)
                  ? 'text-white bg-zinc-900 border-r-2 border-white'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}

          <div className="mx-4 my-3 border-t border-zinc-900" />

          {routePages.map((page) => (
            <button
              key={page.id}
              onClick={() => {
                router.push(page.href);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isRouteActive(page.href)
                  ? 'text-white bg-zinc-900 border-r-2 border-white'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <page.icon size={18} />
              <span>{page.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-900 space-y-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {user && (
            <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <User size={16} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                   {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    router.push('/settings');
                    setSidebarOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          )}

          <div className="bg-zinc-900/50 p-4 rounded border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Daily Quote</p>
            <p className="text-xs italic text-zinc-300">"Time is what we want most, but what we use worst."</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-black relative">
        <header className="md:hidden h-16 border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 bg-black/90 backdrop-blur z-10">
          <span className="font-serif text-lg text-white">Zenith</span>
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu />
          </button>
        </header>

        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
