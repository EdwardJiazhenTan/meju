"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');

  if (!user) return null;

  const navItems = [
    { href: `/${locale}/meal-plan`, label: t('mealPlan'), icon: "" },
    { href: `/${locale}/create-dish`, label: t('createDish'), icon: "" },
    { href: `/${locale}/ocr`, label: t('ocr'), icon: "" },
  ];

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
          <div className="flex items-center space-x-8">
            <Link href={`/${locale}/meal-plan`} className="text-xl font-bold text-primary">
              Meju
            </Link>

            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              title={t('language')}
            >
              {locale === 'en' ? '中文' : 'EN'}
            </button>
            
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
              title={t('darkMode')}
            >
              {theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'}
            </button>
            
            <span className="text-sm text-foreground">
              {t('hello')}, {user.display_name || user.username || user.email}
            </span>
            <button
              onClick={logout}
              className="text-sm text-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

