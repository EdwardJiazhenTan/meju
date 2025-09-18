"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Meal Planner
            </Link>
          </div>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>

            {/* Create Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                Create
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isCreateDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Link
                      href="/dishes/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsCreateDropdownOpen(false)}
                    >
                      Create Dish
                    </Link>
                    <Link
                      href="/ingredients/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsCreateDropdownOpen(false)}
                    >
                      Create Ingredient
                    </Link>
                    <Link
                      href="/categories/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsCreateDropdownOpen(false)}
                    >
                      Create Category
                    </Link>
                    <Link
                      href="/units/create"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsCreateDropdownOpen(false)}
                    >
                      Create Unit
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/dishes"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dish Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Backdrop to close dropdown when clicking outside */}
      {isCreateDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsCreateDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
