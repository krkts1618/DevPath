import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ACCENT_COLORS = {
  amber: {
    id: 'amber',
    label: 'Warm Amber',
    dark: '#F2A93B',
    darkHover: '#FFC15A',
    darkPressed: '#D98B20',
    darkSubtle: 'rgba(242, 169, 59, 0.14)',
    light: '#C77B16',
    lightHover: '#A9630D',
    lightPressed: '#92550A',
    lightSubtle: 'rgba(199, 123, 22, 0.12)',
    swatch: '#F2A93B',
  },
  cyan: {
    id: 'cyan',
    label: 'Cyber Cyan',
    dark: '#06B6D4',
    darkHover: '#22D3EE',
    darkPressed: '#0891B2',
    darkSubtle: 'rgba(6, 182, 212, 0.14)',
    light: '#0891B2',
    lightHover: '#0E7490',
    lightPressed: '#155E75',
    lightSubtle: 'rgba(8, 145, 178, 0.12)',
    swatch: '#06B6D4',
  },
  emerald: {
    id: 'emerald',
    label: 'Forest Emerald',
    dark: '#10B981',
    darkHover: '#34D399',
    darkPressed: '#059669',
    darkSubtle: 'rgba(16, 185, 129, 0.14)',
    light: '#059669',
    lightHover: '#047857',
    lightPressed: '#065F46',
    lightSubtle: 'rgba(5, 150, 105, 0.12)',
    swatch: '#10B981',
  },
  blue: {
    id: 'blue',
    label: 'Electric Blue',
    dark: '#3B82F6',
    darkHover: '#60A5FA',
    darkPressed: '#2563EB',
    darkSubtle: 'rgba(59, 130, 246, 0.14)',
    light: '#2563EB',
    lightHover: '#1D4ED8',
    lightPressed: '#1E40AF',
    lightSubtle: 'rgba(37, 99, 235, 0.12)',
    swatch: '#3B82F6',
  },
  purple: {
    id: 'purple',
    label: 'Royal Purple',
    dark: '#A855F7',
    darkHover: '#C084FC',
    darkPressed: '#9333EA',
    darkSubtle: 'rgba(168, 85, 247, 0.14)',
    light: '#9333EA',
    lightHover: '#7E22CE',
    lightPressed: '#6B21A8',
    lightSubtle: 'rgba(147, 51, 234, 0.12)',
    swatch: '#A855F7',
  },
  rose: {
    id: 'rose',
    label: 'Sunset Rose',
    dark: '#F43F5E',
    darkHover: '#FB7185',
    darkPressed: '#E11D48',
    darkSubtle: 'rgba(244, 63, 94, 0.14)',
    light: '#E11D48',
    lightHover: '#BE123C',
    lightPressed: '#9F1239',
    lightSubtle: 'rgba(225, 29, 72, 0.12)',
    swatch: '#F43F5E',
  },
};

export function ThemeProvider({ children }) {
  // Theme mode: 'dark' | 'light' | 'system'
  const [theme, setTheme] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryTheme = urlParams.get('theme');
      if (queryTheme === 'light' || queryTheme === 'dark' || queryTheme === 'system') {
        return queryTheme;
      }
    } catch {
      // ignore
    }
    const saved = localStorage.getItem('devpath-theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    // Default to dark as primary reference
    return 'dark';
  });

  // Accent color choice: 'amber' | 'cyan' | 'emerald' | 'blue' | 'purple' | 'rose'
  const [accent, setAccent] = useState(() => {
    const saved = localStorage.getItem('devpath-accent');
    if (saved && ACCENT_COLORS[saved]) return saved;
    return 'amber';
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen for system theme changes if in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  const isDark = effectiveTheme === 'dark';

  // Apply .dark class to root <html> and update CSS accent tokens
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('devpath-theme', theme);
  }, [theme, isDark, effectiveTheme]);

  // Apply accent tokens
  useEffect(() => {
    const root = document.documentElement;
    const conf = ACCENT_COLORS[accent] || ACCENT_COLORS.amber;
    if (isDark) {
      root.style.setProperty('--accent-primary', conf.dark);
      root.style.setProperty('--accent-hover', conf.darkHover);
      root.style.setProperty('--accent-pressed', conf.darkPressed);
      root.style.setProperty('--accent-subtle', conf.darkSubtle);
      root.style.setProperty('--accent-text', '#12151A');
    } else {
      root.style.setProperty('--accent-primary', conf.light);
      root.style.setProperty('--accent-hover', conf.lightHover);
      root.style.setProperty('--accent-pressed', conf.lightPressed);
      root.style.setProperty('--accent-subtle', conf.lightSubtle);
      root.style.setProperty('--accent-text', '#FFFFFF');
    }
    localStorage.setItem('devpath-accent', accent);
  }, [accent, isDark]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        effectiveTheme,
        isDark,
        toggleTheme,
        accent,
        setAccent,
        accentColors: ACCENT_COLORS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
