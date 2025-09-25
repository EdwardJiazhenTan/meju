"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center elegant-shadow smooth-transition group-hover:scale-110">
                <span className="font-chinese text-xl text-primary-foreground font-bold">
                  膳
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-english text-xl text-primary tracking-wider">
                  Tekindar
                </span>
                <span className="font-chinese text-sm text-foreground -mt-1">
                  餐厅
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/about"
                className="text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm"
              >
                About
              </Link>
              <Link
                href="/dishes"
                className="text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm"
              >
                Menu
              </Link>
              <Link
                href="/search-order"
                className="text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm"
              >
                Search Order
              </Link>
              <Link
                href="/admin"
                className="text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm"
              >
                Admin Login
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-8 h-8 flex flex-col justify-center items-center space-y-1 group"
            >
              <span
                className={`w-6 h-0.5 bg-foreground smooth-transition ${isOpen ? "rotate-45 translate-y-2" : ""}`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-foreground smooth-transition ${isOpen ? "opacity-0" : ""}`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-foreground smooth-transition ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
              ></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden smooth-transition ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="bg-card/95 backdrop-blur-md border-t border-border/50 px-6 py-4 space-y-4">
            <Link
              href="/about"
              className="block text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm py-2"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/dishes"
              className="block text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm py-2"
              onClick={() => setIsOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/search-order"
              className="block text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm py-2"
              onClick={() => setIsOpen(false)}
            >
              Search Order
            </Link>
            <Link
              href="/admin"
              className="block text-foreground hover:text-primary smooth-transition font-medium tracking-wide uppercase text-sm py-2"
              onClick={() => setIsOpen(false)}
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-20"></div>

      {/* Mobile menu backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
