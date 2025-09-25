"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import WeeklyCalendar from "@/app/components/WeeklyCalendar";
import MealPanel from "@/app/components/MealPanel";
import DishSelectionModal from "@/app/components/DishSelectionModal";
import DishCustomizationModal from "@/app/components/DishCustomizationModal";
import { Dish } from "@/types";

interface MealPlan {
  id: number;
  meal_name: string;
  date: string;
  created_at: string;
  items: any[];
}

interface DishWithCategory extends Dish {
  category_name?: string;
}

export default function MealPlanPage() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(
    null,
  );
  const [isMealPanelOpen, setIsMealPanelOpen] = useState(false);
  const [isDishSelectionOpen, setIsDishSelectionOpen] = useState(false);
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishWithCategory | null>(
    null,
  );
  const weeklyCalendarRef = useRef<{ refreshData: () => void }>(null);

  // Get current week's Monday as start date
  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  // State for week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart());

  // Helper functions for week navigation
  const getWeekStart = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const navigateWeek = (direction: 'previous' | 'next') => {
    const current = new Date(currentWeekStart);
    const daysToAdd = direction === 'next' ? 7 : -7;
    const newDate = new Date(current.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    setCurrentWeekStart(newDate.toISOString().split("T")[0]);
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getCurrentWeekStart());
  };

  const goToNextWeek = () => {
    const current = new Date(getCurrentWeekStart());
    const nextWeek = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    setCurrentWeekStart(nextWeek.toISOString().split("T")[0]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const weekStart = getWeekStart(selectedDate);
      setCurrentWeekStart(weekStart);
    }
  };

  const formatWeekRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleMealPlanSelect = async (mealPlan: MealPlan) => {
    // If meal plan doesn't exist, create it first
    if (!mealPlan.id) {
      try {
        const response = await fetch("/api/meal-plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: mealPlan.date,
            meal_name: mealPlan.meal_name,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // If meal plan already exists, fetch it
          if (response.status === 409) {
            const existingResponse = await fetch(
              `/api/meal-plans?date=${mealPlan.date}&meal_name=${mealPlan.meal_name}`,
            );
            const existingResult = await existingResponse.json();
            if (existingResponse.ok && existingResult.mealPlans.length > 0) {
              setSelectedMealPlan(existingResult.mealPlans[0]);
            } else {
              throw new Error("Failed to fetch existing meal plan");
            }
          } else {
            throw new Error(result.error || "Failed to create meal plan");
          }
        } else {
          setSelectedMealPlan(result.mealPlan);
        }
      } catch (error) {
        console.error("Error handling meal plan:", error);
        alert("Failed to create or fetch meal plan");
        return;
      }
    } else {
      setSelectedMealPlan(mealPlan);
    }

    setIsMealPanelOpen(true);
  };

  const handleCloseMealPanel = () => {
    setIsMealPanelOpen(false);
    setSelectedMealPlan(null);
  };

  const handleAddDish = () => {
    setIsDishSelectionOpen(true);
  };

  const handleDishSelection = (dish: DishWithCategory) => {
    setSelectedDish(dish);
    setIsDishSelectionOpen(false);
    setIsCustomizationOpen(true);
  };

  const handleDishCustomization = async (customization: {
    servings: number;
    notes?: string;
    customizations?: Record<string, any>;
  }) => {
    if (!selectedMealPlan || !selectedDish) return;

    try {
      const response = await fetch(
        `/api/meal-plans/${selectedMealPlan.id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dish_id: selectedDish.id,
            servings: customization.servings,
            notes: customization.notes,
            customizations: customization.customizations,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add dish to meal");
      }

      // Reset selection states
      setSelectedDish(null);
      setIsCustomizationOpen(false);

      // Refresh the weekly calendar to show updated data
      weeklyCalendarRef.current?.refreshData();
    } catch (error) {
      console.error("Error adding dish to meal:", error);
      alert("Failed to add dish to meal");
      throw error; // Re-throw to let the customization modal handle it
    }
  };

  const handleCloseCustomization = () => {
    setIsCustomizationOpen(false);
    setSelectedDish(null);
  };

  const handleCloseDishSelection = () => {
    setIsDishSelectionOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${
          isMealPanelOpen || isDishSelectionOpen || isCustomizationOpen
            ? "blur-sm"
            : ""
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meal Planner
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Plan your weekly meals and generate shopping lists
          </p>
          <p className="text-sm text-blue-600">
            Click on any meal slot below to start planning dishes
          </p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigateWeek('previous')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Week</span>
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatWeekRange(currentWeekStart)}
              </div>
              <div className="text-sm text-gray-500">
                {currentWeekStart === getCurrentWeekStart() ? "This Week" : ""}
              </div>
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>Next Week</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center mt-4 space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={goToThisWeek}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
              >
                This Week
              </button>
              <button
                onClick={goToNextWeek}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Next Week
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="week-picker" className="text-sm text-gray-600">
                Jump to date:
              </label>
              <input
                id="week-picker"
                type="date"
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <WeeklyCalendar
            ref={weeklyCalendarRef}
            startDate={currentWeekStart}
            onMealPlanSelect={handleMealPlanSelect}
          />
        </div>

        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            <div className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg text-center opacity-90">
              Weekly Meal Plan (Active)
            </div>
            <Link
              href="/shopping-list"
              className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Shopping List
            </Link>
          </div>
        </div>
      </div>

      {/* Meal Panel */}
      <MealPanel
        isOpen={isMealPanelOpen}
        onClose={handleCloseMealPanel}
        mealPlan={selectedMealPlan}
        onAddDish={handleAddDish}
        onMealChanged={() => weeklyCalendarRef.current?.refreshData()}
      />

      {/* Dish Selection Modal */}
      <DishSelectionModal
        isOpen={isDishSelectionOpen}
        onClose={handleCloseDishSelection}
        onSelectDish={handleDishSelection}
      />

      {/* Dish Customization Modal */}
      <DishCustomizationModal
        isOpen={isCustomizationOpen}
        onClose={handleCloseCustomization}
        dish={selectedDish}
        onConfirm={handleDishCustomization}
      />
    </div>
  );
}
