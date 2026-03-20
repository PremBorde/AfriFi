"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("light"); // Default to light

  useEffect(() => {
    // Home is always dark, regardless of stored user preference.
    if (pathname === "/") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      return;
    }

    // Other routes: read from localStorage on mount/route-change.
    // The blocking script in layout.tsx prevents the initial flash.
    const stored = localStorage.getItem("theme");
    const nextTheme: Theme = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, [pathname]);

  const toggleTheme = useCallback(() => {
    // Don't allow theme changes on Home (it must remain dark).
    if (pathname === "/") return;

    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, [pathname, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
