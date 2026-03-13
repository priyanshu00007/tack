"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'zenith-dark' | 'zenith-light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('zenith-dark');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage only after hydration
    const savedTheme = localStorage.getItem('zenith_theme') as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(systemPrefersDark ? 'zenith-dark' : 'zenith-light');
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    // Apply theme to document
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'zenith-dark', 'zenith-light');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    try {
      localStorage.setItem('zenith_theme', theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.includes('dark') ? '#000000' : '#ffffff');
    }
  }, [theme, isHydrated]);

  const toggleTheme = () => {
    setThemeState(currentTheme => {
      switch (currentTheme) {
        case 'zenith-dark':
          return 'zenith-light';
        case 'zenith-light':
          return 'zenith-dark';
        case 'dark':
          return 'light';
        case 'light':
          return 'dark';
        default:
          return 'zenith-dark';
      }
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const isDark = theme.includes('dark');

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    setTheme,
    isDark
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme configuration
export const themes = {
  'zenith-dark': {
    name: 'Zenith Dark',
    colors: {
      background: 'bg-black',
      surface: 'bg-zinc-900',
      border: 'border-zinc-800',
      text: 'text-white',
      textSecondary: 'text-zinc-500',
      accent: 'bg-white',
      accentText: 'text-black'
    }
  },
  'zenith-light': {
    name: 'Zenith Light',
    colors: {
      background: 'bg-white',
      surface: 'bg-zinc-50',
      border: 'border-zinc-200',
      text: 'text-black',
      textSecondary: 'text-zinc-600',
      accent: 'bg-black',
      accentText: 'text-white'
    }
  },
  'dark': {
    name: 'Dark Mode',
    colors: {
      background: 'bg-gray-900',
      surface: 'bg-gray-800',
      border: 'border-gray-700',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      accent: 'bg-blue-600',
      accentText: 'text-white'
    }
  },
  'light': {
    name: 'Light Mode',
    colors: {
      background: 'bg-gray-50',
      surface: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      accent: 'bg-blue-600',
      accentText: 'text-white'
    }
  }
};
