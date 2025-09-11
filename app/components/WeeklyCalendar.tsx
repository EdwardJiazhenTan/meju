'use client';

import { useState, useEffect } from 'react';

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

export default function WeeklyCalendar({ startDate, onMealPlanSelect }: WeeklyCalendarProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/meal-plans/week?start_date=${startDate}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch weekly meal plan');
      }

      setWeeklyData(result.weeklyMealPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate) {
      fetchWeeklyData();
    }
  }, [startDate]);

  // Generate 7 days from start date
  const generateWeekDates = (startDate: string): string[] => {
    const dates = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const weekDates = generateWeekDates(startDate);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

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
        <button 
          onClick={fetchWeeklyData}
          className="ml-4 text-sm underline"
        >
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
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Meal</th>
              {weekDates.map((date, index) => (
                <th key={date} className="px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-32">
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
                    <td key={`${date}-${mealType}`} className="px-4 py-3 border-l">
                      {mealPlan ? (
                        <div 
                          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                          onClick={() => onMealPlanSelect?.(mealPlan)}
                        >
                          {mealPlan.items.length === 0 ? (
                            <div className="text-gray-400 text-sm italic">
                              No dishes
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {mealPlan.items.map((item) => (
                                <div key={item.id} className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    {item.dish_name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.servings !== 1 && `${item.servings}x • `}
                                    {item.base_calories && `${Math.round(item.base_calories * item.servings)} cal`}
                                    {item.preparation_time && ` • ${item.preparation_time}min`}
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
                        </div>
                      ) : (
                        <div className="text-gray-300 text-sm italic p-2">
                          No meal planned
                        </div>
                      )}
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
            Click on meals to view details
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
}