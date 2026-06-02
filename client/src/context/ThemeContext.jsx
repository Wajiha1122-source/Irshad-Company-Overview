import { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // FIXED THEME ONLY (NO DARK/LIGHT SWITCH)
  const isDark = true;

  const toggleTheme = () => {
    // disabled intentionally (single theme mode)
    console.log('Theme switching disabled: single theme mode');
  };

  // ✅ IMPORTANT FIX: stable reference (prevents re-renders)
  const value = useMemo(() => ({
    isDark,
    toggleTheme,
  }), []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};