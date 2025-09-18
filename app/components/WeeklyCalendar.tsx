"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface MealItem {
  id: number;
  dish_id: number;
  dish_name: string;
  servings: number;
  customizations?: Record<string, any>;
  notes?: string;
  base_calories?: number;
  preparation_time?: number;
}

interface MealPlan {
  id: number;
  meal_name: string;
  date: string;
  created_at: string;
  items: MealItem[];
}

interface WeeklyData {
  week_start: string;
  days: Record<string, Record<string, MealPlan>>;
}

interface WeeklyCalendarProps {
  startDate: string; // YYYY-MM-DD format
  onMealPlanSelect?: (mealPlan: MealPlan) => void;
}

const WeeklyCalendar = forwardRef<
  { refreshData: () => void },
  WeeklyCalendarProps
>(({ startDate, onMealPlanSelect }, ref) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/meal-plans/week?start_date=${startDate}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch weekly meal plan");
      }

      setWeeklyData(result.weeklyMealPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate) {
      fetchWeeklyData();
    }
  }, [startDate]);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refreshData: fetchWeeklyData,
  }));

  // Generate 7 days from start date
  const generateWeekDates = (startDate: string): string[] => {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  const weekDates = generateWeekDates(startDate);
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading weekly meal plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button onClick={fetchWeeklyData} className="ml-4 text-sm underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-orange-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Weekly Meal Plan</h2>
          <span className="text-sm">Week of {startDate}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Meal
              </th>
              {weekDates.map((date, index) => (
                <th
                  key={date}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-32"
                >
                  <div>{dayNames[index]}</div>
                  <div className="text-xs text-gray-400">{date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType) => (
              <tr key={mealType} className="border-t">
                <td className="px-4 py-3 font-medium text-gray-900 capitalize bg-gray-50">
                  {mealType}
                </td>
                {weekDates.map((date) => {
                  const dayData = weeklyData?.days[date];
                  const mealPlan = dayData?.[mealType];

                  return (
                    <td
                      key={`${date}-${mealType}`}
                      className="px-4 py-3 border-l"
                    >
                      <div
                        className="cursor-pointer hover:bg-blue-50 p-2 rounded border-2 border-transparent hover:border-blue-200 transition-colors min-h-[60px]"
                        onClick={() => {
                          if (mealPlan) {
                            onMealPlanSelect?.(mealPlan);
                          } else {
                            // Create a placeholder meal plan for new meals
                            onMealPlanSelect?.({
                              id: 0, // Will be created when needed
                              meal_name: mealType,
                              date: date,
                              created_at: new Date().toISOString(),
                              items: [],
                            });
                          }
                        }}
                      >
                        {mealPlan ? (
                          <>
                            {mealPlan.items.length === 0 ? (
                              <div className="text-gray-400 text-sm italic flex items-center justify-center h-full">
                                <div className="text-center">
                                  <svg
                                    className="w-6 h-6 mx-auto mb-1 text-gray-300"
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
                                  <div>Add dishes</div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                {mealPlan.items.map((item) => (
                                  <div key={item.id} className="text-sm">
                                    <div className="font-medium text-gray-900">
                                      {item.dish_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.servings !== 1 &&
                                        `${item.servings}x • `}
                                      {item.base_calories &&
                                        `${Math.round(item.base_calories * item.servings)} cal`}
                                      {item.preparation_time &&
                                        ` • ${item.preparation_time}min`}
                                    </div>
                                    {item.notes && (
                                      <div className="text-xs text-blue-600 italic">
                                        {item.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-300 text-sm italic flex items-center justify-center h-full">
                            <div className="text-center">
                              <svg
                                className="w-6 h-6 mx-auto mb-1 text-gray-300"
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
                              <div>Plan meal</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Click on any meal slot to plan dishes
          </span>
          <button
            onClick={fetchWeeklyData}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
});

WeeklyCalendar.displayName = "WeeklyCalendar";

export default WeeklyCalendar;
