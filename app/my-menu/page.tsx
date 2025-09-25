"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MealPlan {
  id: number;
  user_name: string;
  date: string;
  meal_name: string;
  meal_items_count: number;
  meal_items: Array<{
    dish_id: number;
    servings: number;
    notes: string;
    dish_name: string;
  }>;
}

export default function MyMenuPage() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [userName, setUserName] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);

  const fetchUserMealPlans = async () => {
    if (!userName.trim()) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("user_name", userName);
      if (selectedDate) {
        params.append("date", selectedDate);
      }

      const response = await fetch(`/api/menu-generation?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setMealPlans(data.meal_plans || []);
      } else {
        console.error("Failed to fetch meal plans:", data.error);
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeText = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "Breakfast";
      case "lunch":
        return "Lunch";
      case "dinner":
        return "Dinner";
      default:
        return mealType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Menu</h1>
          <p className="text-lg text-gray-600">
            View your personalized menu and dining plan
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Query form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">View My Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="selectedDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date (Optional)
              </label>
              <input
                type="date"
                id="selectedDate"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={fetchUserMealPlans}
            disabled={!userName.trim() || loading}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              !userName.trim() || loading
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Loading..." : "View My Menu"}
          </button>
        </div>

        {/* Menu display */}
        {userName && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading...</div>
              </div>
            ) : mealPlans.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="text-center">
                  <div className="text-gray-500 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Menu Available
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {userName} doesn't have a menu generated for{" "}
                    {new Date(selectedDate).toLocaleDateString("en-US")} yet
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/order"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Place an Order First
                    </Link>
                    <p className="text-sm text-gray-500">
                      After placing orders, admin will generate your
                      personalized menu
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {userName}'s Menu
                </h2>

                {mealPlans.map((mealPlan) => (
                  <div
                    key={mealPlan.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold">
                            {new Date(mealPlan.date).toLocaleDateString(
                              "en-US",
                            )}{" "}
                            - {getMealTypeText(mealPlan.meal_name)}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-90">
                            {mealPlan.meal_items_count} dishes
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {mealPlan.meal_items && mealPlan.meal_items.length > 0 ? (
                        <div className="space-y-4">
                          {mealPlan.meal_items.map((item, index) => (
                            <div
                              key={index}
                              className="border-l-4 border-blue-400 pl-4"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">
                                    {item.dish_name}
                                  </h4>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Servings: {item.servings}
                                  </div>
                                  {item.notes && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      Notes: {item.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No specific dish information for this meal
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom navigation */}
        {!userName && (
          <div className="text-center mt-12">
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                View Your Personalized Menu
              </h3>
              <p className="text-gray-600 mb-6">
                Enter your name to view the menu plan specially created for you
              </p>
              <Link
                href="/order"
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Haven't ordered yet? Order now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
