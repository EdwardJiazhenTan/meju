"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import WeeklyCalendar from "./components/WeeklyCalendar";

export default function Page() {
  const router = useRouter();

  // Get current week's Monday as start date
  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const handleMealPlanSelect = (mealPlan: any) => {
    console.log("Selected meal plan:", mealPlan);
    // Navigate to the full meal planning page
    router.push("/meal-plan");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meal Planner
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Plan your weekly meals and generate shopping lists
          </p>
          <p className="text-sm text-blue-600">
            Click on any meal slot below to start planning, or use the buttons
            to navigate
          </p>
        </div>

        <div className="mb-8">
          <WeeklyCalendar
            startDate={getCurrentWeekStart()}
            onMealPlanSelect={handleMealPlanSelect}
          />
        </div>

        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            <Link
              href="/meal-plan"
              className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Weekly Meal Plan
            </Link>
            <Link
              href="/shopping-list"
              className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Shopping List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
