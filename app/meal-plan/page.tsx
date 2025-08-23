'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MealPlanCalendar from '@/components/MealPlanCalendar';
import MealSelectionPopup from '@/components/MealSelectionPopup';

export default function MealPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedMeal, setSelectedMeal] = useState<{
    day: number;
    mealType: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleMealClick = (day: number, mealType: string) => {
    setSelectedMeal({ day, mealType });
  };

  const handleClosePopup = () => {
    setSelectedMeal(null);
  };

  const handleDishSelected = () => {
    // Refresh meal plan data by re-rendering the calendar
    setSelectedMeal(null);
    // The calendar component will automatically refresh its data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Meal Plan</h1>
          <p className="text-black mt-1">
            Plan your meals for the week. Click on any meal slot to add dishes.
          </p>
        </div>

        <MealPlanCalendar onMealClick={handleMealClick} />

        <MealSelectionPopup
          isOpen={selectedMeal !== null}
          onClose={handleClosePopup}
          dayOfWeek={selectedMeal?.day || 1}
          mealType={selectedMeal?.mealType || ''}
          onDishSelected={handleDishSelected}
        />
      </div>
    </div>
  );
}