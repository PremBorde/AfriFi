"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === "light" ? "Enable dark theme" : "Enable light theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex cursor-pointer items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--surface-strong)] p-2.5 text-[var(--text-muted)] shadow-sm transition-all hover:border-[var(--accent-blue)] hover:text-[var(--text-primary)]"
      aria-label={nextThemeLabel}
      aria-pressed={theme === "dark"}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
