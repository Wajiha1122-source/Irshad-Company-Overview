import { createContext, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // FIXED THEME ONLY (NO DARK/LIGHT SWITCH)
  const isDark = true;

  const toggleTheme = () => {
    // disabled intentionally (no theme switching)
    console.log('Theme switching disabled: single theme mode');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
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