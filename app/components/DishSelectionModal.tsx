"use client";

import { useState, useEffect } from "react";
import { Category, Dish } from "@/types";

interface DishWithCategory extends Dish {
  category_name?: string;
}

interface CategoryWithCount extends Category {
  dish_count: number;
}

interface DishSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish: (dish: DishWithCategory) => void;
}

export default function DishSelectionModal({
  isOpen,
  onClose,
  onSelectDish,
}: DishSelectionModalProps) {
  const [currentView, setCurrentView] = useState<"categories" | "dishes">(
    "categories",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [dishes, setDishes] = useState<DishWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setCurrentView("categories");
      setSelectedCategory("");
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      setCategories(result.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async (categoryName: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/dishes?category=${encodeURIComponent(categoryName)}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch dishes");
      }

      setDishes(result.dishes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentView("dishes");
    fetchDishes(categoryName);
  };

  const handleDishSelect = (dish: DishWithCategory) => {
    onSelectDish(dish);
  };

  const handleBackToCategories = () => {
    setCurrentView("categories");
    setSelectedCategory("");
    setSearchTerm("");
  };

  const filteredDishes = dishes.filter((dish) => {
    return (
      dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dish.cooking_steps?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {currentView === "dishes" && (
              <button
                onClick={handleBackToCategories}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentView === "categories"
                  ? "Select Category"
                  : `${selectedCategory} Dishes`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {currentView === "categories"
                  ? "Choose a category to browse dishes"
                  : "Select a dish to add to your meal"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : currentView === "categories" ? (
            // Categories View
            <div>
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    No categories available
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {category.dish_count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.dish_count === 1 ? "dish" : "dishes"}
                          </div>
                        </div>
                      </div>

                      <h3 className="font-medium text-gray-900 mb-1">
                        {category.name}
                      </h3>

                      <div className="flex items-center text-sm text-blue-600">
                        <span>Browse dishes</span>
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Dishes View
            <div>
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {filteredDishes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    {dishes.length === 0
                      ? `No dishes in "${selectedCategory}" category yet`
                      : "No dishes match your search"}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDishes.map((dish) => (
                    <button
                      key={dish.id}
                      onClick={() => handleDishSelect(dish)}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {dish.name}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {dish.servings} serving
                          {dish.servings !== 1 ? "s" : ""}
                        </span>
                        {dish.base_calories && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {dish.base_calories} cal
                          </span>
                        )}
                        {dish.preparation_time && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            {dish.preparation_time} min
                          </span>
                        )}
                      </div>

                      {dish.cooking_steps && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {dish.cooking_steps}
                        </p>
                      )}

                      <div className="flex items-center text-sm text-blue-600">
                        <span>Select dish</span>
                        <svg
                          className="w-4 h-4 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
