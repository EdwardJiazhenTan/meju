'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

interface PublicNavbarProps {
  onLogin: () => void;
}

export default function PublicNavbar({ onLogin }: PublicNavbarProps) {
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('nav');

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

  return (
    <nav className="bg-background dark:bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="text-xl font-bold text-primary">
              Meju
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              title="Language"
            >
              {locale === 'en' ? '中文' : 'EN'}
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              title="Theme"
            >
              {theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'}
            </button>

            <button
              onClick={onLogin}
              className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
