"use client";

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTranslations } from "next-intl";
import { ApiClient } from "@/lib/api";
import DishView from "./DishView";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
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
      customizations?: string;
    }>;
  };
}

interface MealPlanCalendarProps {
  onMealClick: (day: number, mealType: string) => void;
}

export interface MealPlanCalendarRef {
  refreshMealPlan: () => Promise<void>;
}

const MealPlanCalendar = forwardRef<MealPlanCalendarRef, MealPlanCalendarProps>(
  function MealPlanCalendar({ onMealClick }, ref) {
    const t = useTranslations("mealPlan");
    const [mealPlan, setMealPlan] = useState<MealPlanData>({});
    const [loading, setLoading] = useState(true);
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [selectedDishCustomizations, setSelectedDishCustomizations] =
      useState<any>(null);

    useEffect(() => {
      loadMealPlan();
    }, []);

    const loadMealPlan = async () => {
      try {
        const response = await ApiClient.getMealPlan();

        if (response.success && response.data?.mealPlan) {
          setMealPlan(response.data.mealPlan);
        } else {
        }
      } catch (error) {
        console.error("Error loading meal plan:", error);
      } finally {
        setLoading(false);
      }
    };

    const refreshMealPlan = async () => {
      setLoading(true);
      await loadMealPlan();
    };

    useImperativeHandle(ref, () => ({
      refreshMealPlan,
    }));

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
          className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted hover:border-muted-foreground transition-colors h-[180px] shadow-sm hover:shadow-md flex flex-col"
        >
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-base font-semibold text-foreground capitalize">
              {t(mealType as keyof any)}
            </span>
          </div>

          <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
            {mealDishes.length > 0 ? (
              <div className="flex-1 space-y-2 overflow-y-auto">
                {mealDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-foreground bg-primary/10 px-3 py-2 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors border border-primary/20 hover:border-primary/30 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDishId(dish.dish_id.toString());
                      setSelectedDishCustomizations(
                        dish.customizations
                          ? JSON.parse(dish.customizations)
                          : null,
                      );
                    }}
                  >
                    <div className="font-medium truncate">{dish.dish_name}</div>
                    {dish.serving_size !== 1 && (
                      <div className="text-xs text-foreground opacity-75 mt-1">
                        Serving: {dish.serving_size}x
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-sm text-foreground opacity-60 italic text-center">
                  {t("clickToAdd")}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-foreground">{t("loading")}</div>
        </div>
      );
    }

    return (
      <div className="bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
          {DAY_KEYS.map((dayKey, dayIndex) => (
            <div key={dayKey} className="space-y-5">
              <div className="text-center bg-muted/50 rounded-lg py-3 px-2">
                <h3 className="font-bold text-foreground text-lg">
                  {t(dayKey as keyof any)}
                </h3>
                <div className="text-sm text-foreground opacity-70">
                  Day {dayIndex + 1}
                </div>
              </div>

              <div className="space-y-4">
                {MEALS.map((mealType) => renderMealSlot(dayIndex, mealType))}
              </div>
            </div>
          ))}
        </div>

        {/* Dish View Modal */}
        {selectedDishId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg max-w-5xl max-h-[90vh] overflow-y-auto w-full relative">
              <button
                onClick={() => {
                  setSelectedDishId(null);
                  setSelectedDishCustomizations(null);
                }}
                className="absolute top-4 right-4 z-10 bg-background border border-border rounded-full w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors"
              >
                ✕
              </button>
              <div className="p-2">
                <DishView
                  dishId={selectedDishId}
                  customizations={selectedDishCustomizations}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default MealPlanCalendar;
