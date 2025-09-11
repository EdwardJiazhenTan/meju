'use client';

import { useState } from 'react';
import MealPlanForm from '../../components/MealPlanForm';
import WeeklyCalendar from '../../components/WeeklyCalendar';
import MealItemManager from '../../components/MealItemManager';

interface MealPlan {
  id: number;
  meal_name: string;
  date: string;
  created_at: string;
}

export default function MealPlanTestPage() {
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMealPlanCreated = (mealPlan: MealPlan) => {
    console.log('Meal plan created:', mealPlan);
    setRefreshKey(prev => prev + 1);
  };

  const handleMealPlanSelect = (mealPlan: any) => {
    console.log('Meal plan selected:', mealPlan);
    setSelectedMealPlan(mealPlan);
  };

  const handleItemsChange = (items: any[]) => {
    console.log('Meal items updated:', items);
    setRefreshKey(prev => prev + 1);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(currentWeek);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(currentDate.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Planning Test Page</h1>
          <p className="text-gray-600">Test all meal planning functionality including creating plans, weekly view, and item management.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Create Meal Plan */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <MealPlanForm onSubmit={handleMealPlanCreated} />
            </div>

            {/* Selected Meal Plan Info */}
            {selectedMealPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Selected Meal Plan</h3>
                <div className="text-sm text-blue-800">
                  <div><strong>ID:</strong> {selectedMealPlan.id}</div>
                  <div><strong>Meal:</strong> {selectedMealPlan.meal_name}</div>
                  <div><strong>Date:</strong> {selectedMealPlan.date}</div>
                  <div><strong>Created:</strong> {new Date(selectedMealPlan.created_at).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => setSelectedMealPlan(null)}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Weekly Calendar */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Weekly View</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    ← Previous Week
                  </button>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    Next Week →
                  </button>
                </div>
              </div>

              <WeeklyCalendar
                key={refreshKey}
                startDate={currentWeek}
                onMealPlanSelect={handleMealPlanSelect}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Meal Item Manager */}
        {selectedMealPlan && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Manage Items for {selectedMealPlan.meal_name} on {selectedMealPlan.date}
              </h2>
              <MealItemManager
                mealPlanId={selectedMealPlan.id}
                onItemsChange={handleItemsChange}
              />
            </div>
          </div>
        )}

        {/* Test Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">Testing Instructions</h3>
          <div className="text-sm text-yellow-800 space-y-2">
            <div><strong>1. Create Meal Plans:</strong> Use the form on the left to create meal plans for different dates and meal types.</div>
            <div><strong>2. View Weekly Calendar:</strong> The weekly calendar shows all meal plans for the current week. Navigate between weeks using the arrow buttons.</div>
            <div><strong>3. Select Meal Plans:</strong> Click on any meal plan in the calendar to select it and view its details.</div>
            <div><strong>4. Manage Items:</strong> Once a meal plan is selected, use the bottom section to add or remove dishes from that meal plan.</div>
            <div><strong>5. Test API Endpoints:</strong> Check the browser console for API request/response logs and test error scenarios.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
