'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Navbar from '@/components/Navbar';
import MealPlanCalendar, { MealPlanCalendarRef } from '@/components/MealPlanCalendar';
import MealSelectionPopup from '@/components/MealSelectionPopup';

export default function MealPlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [selectedMeal, setSelectedMeal] = useState<{
    day: number;
    mealType: string;
  } | null>(null);
  const mealPlanRef = useRef<MealPlanCalendarRef>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/`);
    }
  }, [user, loading, router, locale]);

  const handleMealClick = (day: number, mealType: string) => {
    setSelectedMeal({ day, mealType });
  };

  const handleClosePopup = () => {
    setSelectedMeal(null);
  };

  const handleDishSelected = async () => {
    // Refresh meal plan data
    if (mealPlanRef.current) {
      await mealPlanRef.current.refreshMealPlan();
    }
    setSelectedMeal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className={`max-w-7xl mx-auto py-6 px-4 transition-all duration-300 ${selectedMeal ? 'mr-96' : ''}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">{t('mealPlan.title')}</h1>
          <p className="text-foreground mt-1">
            {t('mealPlan.description')}
          </p>
        </div>

        <MealPlanCalendar ref={mealPlanRef} onMealClick={handleMealClick} />

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