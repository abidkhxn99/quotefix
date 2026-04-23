"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("qf-theme") === "dark");
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("qf-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "theme-dark" : "theme-light"}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
