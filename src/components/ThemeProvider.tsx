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
    const isDark = localStorage.getItem("qf-theme") === "dark";
    setDark(isDark);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("qf-theme", next ? "dark" : "light");
      document.body.style.background = next ? "#0f0f0f" : "#ffffff";
      document.body.style.color = next ? "#e5e5e5" : "#171717";
      return next;
    });
  }, []);

  // Apply theme to body on mount
  useEffect(() => {
    if (mounted) {
      document.body.style.background = dark ? "#0f0f0f" : "#ffffff";
      document.body.style.color = dark ? "#e5e5e5" : "#171717";
    }
  }, [dark, mounted]);

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
