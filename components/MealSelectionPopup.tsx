'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';

interface Dish {
  dish_id: number;
  name: string;
  description?: string;
  meal: string;
  calories?: number;
  prep_time?: number;
  cook_time?: number;
}

interface MealSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  mealType: string;
  onDishSelected: () => void;
}

export default function MealSelectionPopup({
  isOpen,
  onClose,
  dayOfWeek,
  mealType,
  onDishSelected
}: MealSelectionPopupProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadDishes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiClient.getUserDishes();
      if (response.success && response.data?.dishes) {
        // Filter dishes by meal type
        const filteredDishes = response.data.dishes.filter((dish: Dish) => 
          dish.meal === mealType
        );
        setDishes(filteredDishes);
      }
    } catch (error) {
      console.error('Error loading dishes:', error);
    } finally {
      setLoading(false);
    }
  }, [mealType]);

  useEffect(() => {
    if (isOpen) {
      loadDishes();
    }
  }, [isOpen, loadDishes]);

  const handleSelectDish = async (dish: Dish) => {
    setAdding(dish.dish_id);
    try {
      const response = await ApiClient.addDishToMealPlan(dayOfWeek, mealType, dish.dish_id, 1.0);
      if (response.success) {
        onDishSelected();
        onClose();
      }
    } catch (error) {
      console.error('Error adding dish to meal plan:', error);
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Select {mealType} for {DAYS[dayOfWeek - 1]}
            </h2>
            <p className="text-sm text-black">
              Choose from your {mealType} dishes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-black hover:text-black text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-black">Loading dishes...</div>
            </div>
          ) : dishes.length > 0 ? (
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div
                  key={dish.dish_id}
                  onClick={() => handleSelectDish(dish)}
                  className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black">{dish.name}</h3>
                      {dish.description && (
                        <p className="text-sm text-black mt-1">{dish.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-black">
                        {dish.calories && <span>{dish.calories} cal</span>}
                        {dish.prep_time && <span>{dish.prep_time}min prep</span>}
                        {dish.cook_time && <span>{dish.cook_time}min cook</span>}
                      </div>
                    </div>
                    {adding === dish.dish_id ? (
                      <div className="text-sm text-blue-600">Adding...</div>
                    ) : (
                      <div className="text-blue-600 font-medium">Select</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-black mb-4">
                No {mealType} dishes found
              </div>
              <p className="text-sm text-black">
                Create some {mealType} dishes first to add them to your meal plan
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}