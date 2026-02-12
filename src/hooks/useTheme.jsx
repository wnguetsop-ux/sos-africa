import { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ThemeContext = createContext(null);

/**
 * Hook pour gérer le thème (dark/light/auto)
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context) return context;
  
  const [theme, setThemeState] = useState('dark');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  
  useEffect(() => {
    const stored = localStorage.getItem('sos_theme');
    if (stored) {
      setThemeState(stored);
    }
  }, []);
  
  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(prefersDark ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setResolvedTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(`theme-${resolvedTheme}`);
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#020617' : '#f8fafc';
    document.body.style.color = resolvedTheme === 'dark' ? '#ffffff' : '#0f172a';
  }, [resolvedTheme]);
  
  const setTheme = useCallback((newTheme) => {
    if (['dark', 'light', 'auto'].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('sos_theme', newTheme);
    }
  }, []);
  
  const isDark = resolvedTheme === 'dark';
  
  const colors = {
    bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
    bgSecondary: isDark ? 'bg-slate-900' : 'bg-white',
    bgCard: isDark ? 'bg-slate-800/50' : 'bg-white',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-400' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400',
  };
  
  return { theme, setTheme, resolvedTheme, isDark, colors };
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('dark');
  const [resolvedTheme, setResolvedTheme] = useState('dark');
  
  useEffect(() => {
    const stored = localStorage.getItem('sos_theme');
    if (stored) {
      setThemeState(stored);
    }
  }, []);
  
  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(prefersDark ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => setResolvedTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);
  
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-light');
    document.documentElement.classList.add(`theme-${resolvedTheme}`);
  }, [resolvedTheme]);
  
  const setTheme = useCallback((newTheme) => {
    if (['dark', 'light', 'auto'].includes(newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('sos_theme', newTheme);
    }
  }, []);
  
  const isDark = resolvedTheme === 'dark';
  
  const colors = {
    bg: isDark ? 'bg-slate-950' : 'bg-slate-50',
    bgSecondary: isDark ? 'bg-slate-900' : 'bg-white',
    bgCard: isDark ? 'bg-slate-800/50' : 'bg-white',
    border: isDark ? 'border-slate-700' : 'border-slate-200',
    text: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-400' : 'text-slate-600',
    textMuted: isDark ? 'text-slate-500' : 'text-slate-400',
  };
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;