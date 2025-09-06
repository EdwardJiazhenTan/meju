"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ApiClient } from "@/lib/api";

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
  onCustomize: (dish: Dish, dayOfWeek: number, mealType: string) => void;
}

export default function MealSelectionPopup({
  isOpen,
  onClose,
  dayOfWeek,
  mealType,
  onDishSelected,
  onCustomize,
}: MealSelectionPopupProps) {
  const t = useTranslations("mealPlan");
  const tCommon = useTranslations("common");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<number | null>(null);

  const DAY_KEYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const loadDishes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApiClient.getUserDishes();
      if (response.success && response.data?.dishes) {
        // Filter dishes by meal type
        const filteredDishes = response.data.dishes.filter(
          (dish: Dish) => dish.meal === mealType,
        );
        setDishes(filteredDishes);
      }
    } catch (error) {
      console.error("Error loading dishes:", error);
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
      console.log("Adding dish to meal plan:", {
        dishId: dish.dish_id,
        dayOfWeek,
        mealType,
      });
      const response = await ApiClient.addDishToMealPlan(
        dayOfWeek,
        mealType,
        dish.dish_id,
        1.0,
      );
      console.log("Add dish response:", response);
      if (response.success) {
        console.log("Successfully added dish, calling callbacks");
        onDishSelected();
        onClose();
      } else {
        console.log("Failed to add dish:", response.message);
      }
    } catch (error) {
      console.error("Error adding dish to meal plan:", error);
    } finally {
      setAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-md z-50">
      <div className="bg-card h-full w-full flex flex-col animate-slide-right shadow-2xl border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {t("selectFor")} {t(mealType as keyof any)} {t("for")}{" "}
              {t(DAY_KEYS[dayOfWeek - 1] as keyof any)}
            </h2>
            <p className="text-sm text-card-foreground">
              {t("chooseFrom")} {t(mealType as keyof any)} {t("dishes")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-card-foreground hover:text-card-foreground text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-card-foreground">{tCommon("loading")}</div>
            </div>
          ) : dishes.length > 0 ? (
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div
                  key={dish.dish_id}
                  className="p-4 border border-border rounded-lg hover:bg-muted hover:border-muted-foreground transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-card-foreground">
                        {dish.name}
                      </h3>
                      {dish.description && (
                        <p className="text-sm text-card-foreground mt-1">
                          {dish.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-card-foreground">
                        {dish.calories && <span>{dish.calories} cal</span>}
                        {dish.prep_time && (
                          <span>{dish.prep_time}min prep</span>
                        )}
                        {dish.cook_time && (
                          <span>{dish.cook_time}min cook</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {adding === dish.dish_id ? (
                        <div className="text-sm text-blue-600">
                          {t("adding")}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              onCustomize(dish, dayOfWeek, mealType)
                            }
                            className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors border border-orange-200"
                          >
                            Customize
                          </button>
                          <button
                            onClick={() => handleSelectDish(dish)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors border border-blue-200"
                          >
                            {t("select")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-card-foreground mb-4">
                {t("noDishesFound")} {t(mealType as keyof any)}
              </div>
              <p className="text-sm text-card-foreground">
                {t("createDishesFirst")} {t(mealType as keyof any)}{" "}
                {t("dishesToAdd")}
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-right {
          animation: slide-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
