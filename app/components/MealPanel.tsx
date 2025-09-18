"use client";

import { useState, useEffect } from "react";

interface MealItem {
  id: number;
  dish_id: number;
  dish_name: string;
  servings: number;
  customizations?: Record<string, any>;
  notes?: string;
  base_calories?: number;
  preparation_time?: number;
  category_name?: string;
}

interface MealPlan {
  id: number;
  meal_name: string;
  date: string;
  created_at: string;
}

interface MealPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mealPlan: MealPlan | null;
  onAddDish: () => void;
  onMealChanged?: () => void;
}

export default function MealPanel({
  isOpen,
  onClose,
  mealPlan,
  onAddDish,
  onMealChanged,
}: MealPanelProps) {
  const [mealItems, setMealItems] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mealPlan) {
      fetchMealItems();
    }
  }, [isOpen, mealPlan]);

  const fetchMealItems = async () => {
    if (!mealPlan) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/meal-plans/${mealPlan.id}/items`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch meal items");
      }

      setMealItems(result.mealItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const removeMealItem = async (itemId: number) => {
    if (!mealPlan) return;

    if (!confirm("Are you sure you want to remove this dish from the meal?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/meal-plans/${mealPlan.id}/items?item_id=${itemId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to remove item");
      }

      // Refresh the meal items
      fetchMealItems();
      // Notify parent component that meal changed
      onMealChanged?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalCalories = () => {
    return mealItems.reduce((total, item) => {
      return total + (item.base_calories || 0) * item.servings;
    }, 0);
  };

  const getTotalPrepTime = () => {
    return mealItems.reduce((total, item) => {
      return Math.max(total, item.preparation_time || 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Slide Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {mealPlan?.meal_name}
              </h2>
              <p className="text-sm text-gray-600">
                {mealPlan ? formatDate(mealPlan.date) : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading meal items...</div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              </div>
            ) : (
              <>
                {/* Meal Summary */}
                {mealItems.length > 0 && (
                  <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Meal Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Calories:</span>
                        <div className="font-medium">
                          {getTotalCalories()} cal
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Prep Time:</span>
                        <div className="font-medium">
                          {getTotalPrepTime()} min
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meal Items */}
                <div className="p-6">
                  {mealItems.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="text-gray-500 mb-4">
                        No dishes added to this meal yet
                      </p>
                      <button
                        onClick={onAddDish}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add First Dish
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mealItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {item.dish_name}
                            </h4>
                            <button
                              onClick={() => removeMealItem(item.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {item.servings} serving
                              {item.servings !== 1 ? "s" : ""}
                            </span>
                            {item.base_calories && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                {Math.round(item.base_calories * item.servings)}{" "}
                                cal
                              </span>
                            )}
                            {item.preparation_time && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                {item.preparation_time} min
                              </span>
                            )}
                            {item.category_name && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                {item.category_name}
                              </span>
                            )}
                          </div>

                          {item.notes && (
                            <p className="text-sm text-gray-600 italic">
                              "{item.notes}"
                            </p>
                          )}

                          {item.customizations &&
                            Object.keys(item.customizations).length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                <span className="font-medium">
                                  Customizations:
                                </span>{" "}
                                {JSON.stringify(item.customizations)}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onAddDish}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Dish
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
