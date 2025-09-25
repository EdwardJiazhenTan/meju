"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Dish management, meal planning, and shopping list generation
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to User Interface
            </Link>
          </div>
        </div>

        {/* Main functionality areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Dish Management */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Dish Management
              </h3>
              <p className="text-gray-600 mb-6">
                Create new dishes and modify existing ones
              </p>
              <div className="space-y-3">
                <Link
                  href="/admin/dishes"
                  className="block w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Manage Dishes
                </Link>
                <Link
                  href="/admin/categories"
                  className="block w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Manage Categories
                </Link>
              </div>
            </div>
          </div>

          {/* Weekly/Daily Meal Planning */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Meal Planning
              </h3>
              <p className="text-gray-600 mb-6">
                View and manage weekly and daily meal plans
              </p>
              <Link
                href="/admin/meal-plan"
                className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Meal Plans
              </Link>
            </div>
          </div>

          {/* Shopping List Generation */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow md:col-span-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5-5M7 13l-2.5 5M17 17a2 2 0 11-4 0 2 2 0 014 0zM9 17a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Shopping List Generator
              </h3>
              <p className="text-gray-600 mb-6">
                Generate comprehensive shopping lists based on orders and meal
                plans
              </p>
              <Link
                href="/admin/shopping-list"
                className="inline-block bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Generate Shopping List
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Actions
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admin/dishes"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Manage Dishes
            </Link>
            <Link
              href="/admin/categories"
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/meal-plan"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              View This Week
            </Link>
            <Link
              href="/admin/shopping-list"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Generate Shopping List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
