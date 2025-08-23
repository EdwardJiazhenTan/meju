"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MEALS = ["breakfast", "lunch", "dinner", "dessert"];
const MEAL_ICONS = {
  breakfast: "",
  lunch: "",
  dinner: "",
  dessert: "",
};

interface MealPlanData {
  [day: number]: {
    [mealType: string]: Array<{
      dish_id: number;
      dish_name: string;
      serving_size: number;
      slot_id: number;
    }>;
  };
}

interface MealPlanCalendarProps {
  onMealClick: (day: number, mealType: string) => void;
}

export default function MealPlanCalendar({
  onMealClick,
}: MealPlanCalendarProps) {
  const [mealPlan, setMealPlan] = useState<MealPlanData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    try {
      const response = await ApiClient.getMealPlan();
      if (response.success && response.data?.mealPlan) {
        setMealPlan(response.data.mealPlan);
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealClick = (dayIndex: number, mealType: string) => {
    onMealClick(dayIndex + 1, mealType); // Convert to 1-based indexing for API
  };

  const renderMealSlot = (dayIndex: number, mealType: string) => {
    const dayMeals = mealPlan[dayIndex + 1] || {};
    const mealDishes = dayMeals[mealType] || [];

    return (
      <div
        key={mealType}
        onClick={() => handleMealClick(dayIndex, mealType)}
        className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors min-h-[60px]"
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-black capitalize">
            {mealType}
          </span>
        </div>

        <div className="space-y-1">
          {mealDishes.length > 0 ? (
            mealDishes.map((dish, idx) => (
              <div
                key={idx}
                className="text-xs text-black bg-blue-50 px-2 py-1 rounded"
              >
                {dish.dish_name}
                {dish.serving_size !== 1 && (
                  <span className="text-black ml-1">
                    ({dish.serving_size}x)
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-black italic">Click to add meal</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-black">Loading meal plan...</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="grid grid-cols-7 gap-4">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold text-black">{day}</h3>
              <div className="text-xs text-black">Day {dayIndex + 1}</div>
            </div>

            <div className="space-y-3">
              {MEALS.map((mealType) => renderMealSlot(dayIndex, mealType))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

