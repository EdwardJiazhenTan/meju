"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useDish } from "@/hooks/useDish";

interface DishViewProps {
  dishId: string;
  customizations?: any;
}

export default function DishView({ dishId, customizations }: DishViewProps) {
  const t = useTranslations();
  const { data, loading, error, refetch } = useDish(dishId);

  // Process customizations if provided
  const getDisplayIngredients = () => {
    if (!data?.ingredients) return [];

    if (!customizations?.ingredients) {
      return data.ingredients;
    }

    // Apply customizations to ingredients
    const customizedIngredients = customizations.ingredients
      .filter((ing: any) => !ing.removed)
      .map((customIng: any) => ({
        ...customIng,
        quantity: customIng.quantity,
      }));

    return customizedIngredients;
  };

  const getServingSize = () => {
    return customizations?.serving_size || 1.0;
  };

  const getTotalCalories = () => {
    if (!customizations) return data?.dish?.calories;

    const ingredients = getDisplayIngredients();
    const servingSize = getServingSize();

    return Math.round(
      ingredients.reduce((total: number, ing: any) => {
        const caloriesPerUnit = ing.calories_per_unit || 0;
        return total + caloriesPerUnit * ing.quantity * servingSize;
      }, 0),
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border-border border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border-border border p-6">
          <div className="text-center py-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              {t("dish.errorTitle")}
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("dish.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.dish) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border-border border p-6">
          <div className="text-center py-8">
            <div className="text-muted-foreground text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              {t("dish.notFound")}
            </h2>
            <p className="text-muted-foreground">
              {t("dish.notFoundDescription")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { dish, tags } = data;
  const displayIngredients = getDisplayIngredients();
  const servingSize = getServingSize();
  const totalCalories = getTotalCalories();

  const formatTime = (minutes: number | null) => {
    if (!minutes) return t("dish.notSpecified");
    return `${minutes} ${t("dish.minutes")}`;
  };

  const getMealIcon = (meal: string) => {
    switch (meal) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🌞";
      case "dinner":
        return "🌙";
      case "dessert":
        return "🍰";
      default:
        return "🍽️";
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "text-green-600 bg-green-100 border-green-200";
      case "shared":
        return "text-blue-600 bg-blue-100 border-blue-200";
      case "private":
        return "text-gray-600 bg-gray-100 border-gray-200";
      default:
        return "text-gray-600 bg-gray-100 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card rounded-lg shadow-sm border-border border">
        {/* Header Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getMealIcon(dish.meal)}</span>
                <h1 className="text-3xl font-bold text-card-foreground">
                  {dish.name}
                </h1>
                {dish.special && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                    ⭐ {t("dish.special")}
                  </span>
                )}
              </div>

              {dish.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {dish.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getVisibilityColor(
                    dish.visibility,
                  )}`}
                >
                  {t(`dish.${dish.visibility}`)}
                </span>
                <span className="px-3 py-1 text-sm font-medium rounded-full border bg-purple-100 text-purple-800 border-purple-200">
                  {getMealIcon(dish.meal)} {t(`mealPlan.${dish.meal}`)}
                </span>
              </div>
            </div>

            {dish.url && (
              <a
                href={dish.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>🔗</span>
                {t("dish.viewRecipe")}
              </a>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info & Times */}
            <div className="space-y-6">
              {/* Timing Information */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <span>⏱️</span>
                  {t("dish.timingInfo")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("dish.prepTime")}
                    </div>
                    <div className="font-medium text-card-foreground">
                      {formatTime(dish.prep_time)}
                    </div>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {t("dish.cookTime")}
                    </div>
                    <div className="font-medium text-card-foreground">
                      {formatTime(dish.cook_time)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                    <span>🏷️</span>
                    {t("dish.tags")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full border border-indigo-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Ingredients */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <span>🥘</span>
                {t("dish.ingredients")}
                {customizations && (
                  <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    Customized
                  </span>
                )}
              </h3>

              {servingSize !== 1.0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Serving Size:</strong> {servingSize}x
                  </div>
                </div>
              )}

              {displayIngredients && displayIngredients.length > 0 ? (
                <div className="space-y-3">
                  {displayIngredients.map((ingredient: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-muted rounded-lg p-3"
                    >
                      <span className="font-medium text-card-foreground">
                        {ingredient.name}
                        {customizations &&
                          ingredient.original_quantity !==
                            ingredient.quantity && (
                            <span className="ml-2 text-xs text-orange-600">
                              (was {ingredient.original_quantity})
                            </span>
                          )}
                      </span>
                      <span className="text-muted-foreground">
                        {ingredient.quantity * servingSize}{" "}
                        {ingredient.unit || "units"}
                        {ingredient.calories_per_unit && (
                          <span className="ml-2 text-xs">
                            (
                            {Math.round(
                              ingredient.calories_per_unit *
                                ingredient.quantity *
                                servingSize,
                            )}{" "}
                            cal)
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📝</div>
                  <p>{t("dish.noIngredients")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Calories Display */}
          {totalCalories && totalCalories > 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      {t("dish.totalCalories")}
                      {customizations && (
                        <span className="ml-2 text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          Customized
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {customizations
                        ? "Calculated from customized ingredients"
                        : t("dish.calculatedFromIngredients")}
                      {servingSize !== 1.0 && (
                        <span className="ml-2">• {servingSize}x serving</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {totalCalories}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-300">
                      {t("dish.calories")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div>
                {t("dish.createdOn")}{" "}
                {new Date(dish.created_at).toLocaleDateString()}
              </div>
              {dish.updated_at !== dish.created_at && (
                <div>
                  {t("dish.lastUpdated")}{" "}
                  {new Date(dish.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
