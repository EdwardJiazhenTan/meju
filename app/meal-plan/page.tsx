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
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
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

        <div className="mb-8">
          <WeeklyCalendar
            ref={weeklyCalendarRef}
            startDate={getCurrentWeekStart()}
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
