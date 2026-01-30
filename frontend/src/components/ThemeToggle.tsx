'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'stitch';
}

export function ThemeToggle({ className = '', variant = 'stitch' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <button
        className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label="Theme toggle"
        disabled
      >
        <Sun className="w-5 h-5" aria-hidden="true" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const icon = theme === 'light' ? (
    <Sun className="w-5 h-5" aria-hidden="true" />
  ) : theme === 'dark' ? (
    <Moon className="w-5 h-5" aria-hidden="true" />
  ) : (
    <Monitor className="w-5 h-5" aria-hidden="true" />
  );

  if (variant === 'stitch') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label={`Current theme: ${theme}. Click to toggle.`}
        title={`Theme: ${theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}`}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      aria-label={`Current theme: ${theme}. Click to toggle.`}
      title={`Theme: ${theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'}`}
    >
      {icon}
    </button>
  );
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}
