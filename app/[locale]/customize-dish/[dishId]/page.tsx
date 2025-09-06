"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/Navbar";
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

interface DishIngredient {
  ingredient_id: number;
  name: string;
  unit: string | null;
  quantity: number;
  calories_per_unit?: number;
}

interface CustomizedIngredient extends DishIngredient {
  customQuantity: number;
  removed: boolean;
}

export default function CustomizeDishPage({
  params,
}: {
  params: Promise<{ dishId: string }>;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations();
  const locale = useLocale();

  const resolvedParams = use(params);
  const [dish, setDish] = useState<Dish | null>(null);
  const [ingredients, setIngredients] = useState<CustomizedIngredient[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [adding, setAdding] = useState(false);
  const [servingSize, setServingSize] = useState(1.0);

  // New ingredient addition state
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState<
    DishIngredient[]
  >([]);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [selectedNewIngredient, setSelectedNewIngredient] =
    useState<DishIngredient | null>(null);
  const [newIngredientQuantity, setNewIngredientQuantity] = useState<number>(1);

  const dayOfWeek = searchParams.get("day");
  const mealType = searchParams.get("meal");

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/`);
    }
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (resolvedParams.dishId) {
      loadDishData();
    }
  }, [resolvedParams.dishId]);

  const loadDishData = async () => {
    setLoadingData(true);
    try {
      const response = await ApiClient.getDish(resolvedParams.dishId);
      if (response.success && response.data) {
        setDish(response.data.dish);
        if (response.data.ingredients) {
          const customizedIngredients = response.data.ingredients.map(
            (ing: DishIngredient) => ({
              ...ing,
              customQuantity: ing.quantity,
              removed: false,
            }),
          );
          setIngredients(customizedIngredients);
        }
      }
    } catch (error) {
      console.error("Error loading dish data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateIngredientQuantity = (
    ingredientId: number,
    newQuantity: number,
  ) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? { ...ing, customQuantity: Math.max(0, newQuantity) }
          : ing,
      ),
    );
  };

  const toggleIngredientRemoval = (ingredientId: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.ingredient_id === ingredientId
          ? {
              ...ing,
              removed: !ing.removed,
              customQuantity: ing.removed ? ing.quantity : 0,
            }
          : ing,
      ),
    );
  };

  const loadAvailableIngredients = async (searchTerm?: string) => {
    try {
      const response = searchTerm
        ? await ApiClient.searchIngredients(searchTerm)
        : await ApiClient.getAllIngredients();

      if (response.success && response.data?.ingredients) {
        // Filter out ingredients that are already in the dish (including non-removed ones)
        const existingIngredientIds = ingredients
          .filter((ing) => !ing.removed)
          .map((ing) => ing.ingredient_id);
        const filtered = response.data.ingredients.filter(
          (ing: DishIngredient) =>
            !existingIngredientIds.includes(ing.ingredient_id),
        );
        setAvailableIngredients(filtered);
      }
    } catch (error) {
      console.error("Error loading ingredients:", error);
    }
  };

  const handleAddNewIngredient = () => {
    if (!selectedNewIngredient || newIngredientQuantity <= 0) return;

    const newCustomizedIngredient: CustomizedIngredient = {
      ...selectedNewIngredient,
      customQuantity: newIngredientQuantity,
      removed: false,
    };

    setIngredients((prev) => [...prev, newCustomizedIngredient]);

    // Reset add ingredient form
    setSelectedNewIngredient(null);
    setNewIngredientQuantity(1);
    setIngredientSearchTerm("");
    setShowAddIngredient(false);

    // Refresh available ingredients to remove the added one
    loadAvailableIngredients();
  };

  const calculateTotalCalories = () => {
    return Math.round(
      ingredients.reduce((total, ing) => {
        if (ing.removed) return total;
        const caloriesPerUnit = ing.calories_per_unit || 0;
        return total + caloriesPerUnit * ing.customQuantity * servingSize;
      }, 0),
    );
  };

  const handleAddToMealPlan = async () => {
    if (!dayOfWeek || !mealType) return;

    setAdding(true);
    try {
      // Check if there are any customizations
      const hasCustomizations =
        ingredients.some(
          (ing) => ing.customQuantity !== ing.quantity || ing.removed,
        ) || servingSize !== 1.0;

      let response;
      if (hasCustomizations) {
        // Prepare customizations data
        const customizations = {
          ingredients: ingredients.map((ing) => ({
            ingredient_id: ing.ingredient_id,
            name: ing.name,
            unit: ing.unit,
            quantity: ing.customQuantity,
            removed: ing.removed,
            calories_per_unit: ing.calories_per_unit,
            original_quantity: ing.quantity,
          })),
          serving_size: servingSize,
        };

        response = await ApiClient.addCustomizedDishToMealPlan(
          parseInt(dayOfWeek),
          mealType,
          dish!.dish_id,
          servingSize,
          customizations,
        );
      } else {
        // No customizations, use regular method
        response = await ApiClient.addDishToMealPlan(
          parseInt(dayOfWeek),
          mealType,
          dish!.dish_id,
          servingSize,
        );
      }

      console.log("Add dish response:", response);
      if (response.success) {
        console.log("Successfully added dish, redirecting to meal plan");
        router.push(`/${locale}/meal-plan`);
      } else {
        console.log("Failed to add dish:", response.message);
      }
    } catch (error) {
      console.error("Error adding customized dish to meal plan:", error);
    } finally {
      setAdding(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Dish Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The dish you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 text-primary hover:text-primary/80 text-sm flex items-center"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            Customize: {dish.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Adjust ingredients to your liking, just like ordering at a
            restaurant
            <br />
            <small className="text-xs opacity-75">
              Note: Customizations apply to this meal plan entry only and won't
              change the original dish.
            </small>
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border">
          {/* Dish Info Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  {dish.name}
                </h2>
                {dish.description && (
                  <p className="text-muted-foreground mt-1">
                    {dish.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                  {dish.prep_time && <span>⏱️ {dish.prep_time}min prep</span>}
                  {dish.cook_time && <span>🔥 {dish.cook_time}min cook</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {calculateTotalCalories()}
                </div>
                <div className="text-sm text-muted-foreground">calories</div>
              </div>
            </div>
          </div>

          {/* Serving Size */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-card-foreground">
                Serving Size:
              </label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setServingSize(Math.max(0.25, servingSize - 0.25))
                  }
                  className="w-8 h-8 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center"
                >
                  −
                </button>
                <span className="px-4 py-1 bg-muted rounded text-card-foreground font-medium min-w-16 text-center">
                  {servingSize}x
                </span>
                <button
                  onClick={() => setServingSize(servingSize + 0.25)}
                  className="w-8 h-8 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Ingredients Customization */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                🥘 Customize Ingredients
              </h3>
              <button
                onClick={() => {
                  setShowAddIngredient(true);
                  loadAvailableIngredients();
                }}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors border border-green-200 text-sm font-medium"
              >
                + Add Ingredient
              </button>
            </div>

            {ingredients.length > 0 ? (
              <div className="space-y-4">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.ingredient_id}
                    className={`p-4 border rounded-lg transition-all ${
                      ingredient.removed
                        ? "border-red-200 bg-red-50 opacity-60"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4
                            className={`font-medium ${ingredient.removed ? "line-through text-red-600" : "text-card-foreground"}`}
                          >
                            {ingredient.name}
                          </h4>
                          <button
                            onClick={() =>
                              toggleIngredientRemoval(ingredient.ingredient_id)
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              ingredient.removed
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {ingredient.removed ? "+ Add Back" : "✕ Remove"}
                          </button>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Original: {ingredient.quantity}{" "}
                          {ingredient.unit || "units"}
                          {ingredient.calories_per_unit && (
                            <span className="ml-2">
                              (
                              {Math.round(
                                ingredient.calories_per_unit *
                                  ingredient.customQuantity *
                                  servingSize,
                              )}{" "}
                              cal)
                            </span>
                          )}
                        </div>
                      </div>

                      {!ingredient.removed && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateIngredientQuantity(
                                ingredient.ingredient_id,
                                ingredient.customQuantity - 0.25,
                              )
                            }
                            className="w-8 h-8 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center"
                            disabled={ingredient.customQuantity <= 0.25}
                          >
                            −
                          </button>
                          <div className="px-3 py-1 bg-muted rounded text-center min-w-20">
                            <input
                              type="number"
                              step="0.25"
                              min="0"
                              value={ingredient.customQuantity}
                              onChange={(e) =>
                                updateIngredientQuantity(
                                  ingredient.ingredient_id,
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="bg-transparent text-center w-full text-card-foreground"
                            />
                          </div>
                          <button
                            onClick={() =>
                              updateIngredientQuantity(
                                ingredient.ingredient_id,
                                ingredient.customQuantity + 0.25,
                              )
                            }
                            className="w-8 h-8 bg-muted hover:bg-muted-foreground/20 rounded-full flex items-center justify-center"
                          >
                            +
                          </button>
                          <span className="text-sm text-muted-foreground ml-2">
                            {ingredient.unit || "units"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📝</div>
                <p>No ingredients found for this dish</p>
              </div>
            )}

            {/* Add New Ingredient Modal */}
            {showAddIngredient && (
              <div className="mt-6 border-t border-border pt-6">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-card-foreground">
                      Add New Ingredient
                    </h4>
                    <button
                      onClick={() => {
                        setShowAddIngredient(false);
                        setSelectedNewIngredient(null);
                        setIngredientSearchTerm("");
                        setNewIngredientQuantity(1);
                      }}
                      className="text-muted-foreground hover:text-card-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ingredient Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={ingredientSearchTerm}
                        onChange={(e) => {
                          setIngredientSearchTerm(e.target.value);
                          if (e.target.value.trim()) {
                            loadAvailableIngredients(e.target.value);
                          } else {
                            loadAvailableIngredients();
                          }
                        }}
                        placeholder="Search for ingredient..."
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-card-foreground"
                      />

                      {ingredientSearchTerm &&
                        availableIngredients.length > 0 &&
                        !selectedNewIngredient && (
                          <div className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {availableIngredients
                              .slice(0, 10)
                              .map((ingredient) => (
                                <div
                                  key={ingredient.ingredient_id}
                                  onClick={() => {
                                    setSelectedNewIngredient(ingredient);
                                    setIngredientSearchTerm(ingredient.name);
                                  }}
                                  className="px-3 py-2 hover:bg-muted cursor-pointer text-card-foreground"
                                >
                                  {ingredient.name}{" "}
                                  {ingredient.unit && `(${ingredient.unit})`}
                                  {ingredient.calories_per_unit && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {ingredient.calories_per_unit} cal/unit
                                    </span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={newIngredientQuantity}
                        onChange={(e) =>
                          setNewIngredientQuantity(
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Quantity"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-card-foreground"
                      />
                      {selectedNewIngredient?.unit && (
                        <div className="text-xs text-muted-foreground mt-1">
                          in {selectedNewIngredient.unit}
                        </div>
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={handleAddNewIngredient}
                      disabled={
                        !selectedNewIngredient || newIngredientQuantity <= 0
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {selectedNewIngredient && (
                    <div className="mt-3 p-3 bg-background rounded border">
                      <div className="text-sm">
                        <strong>Selected:</strong> {selectedNewIngredient.name}
                        {selectedNewIngredient.calories_per_unit && (
                          <span className="ml-2 text-muted-foreground">
                            (
                            {Math.round(
                              selectedNewIngredient.calories_per_unit *
                                newIngredientQuantity,
                            )}{" "}
                            calories)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {dayOfWeek && mealType && (
            <div className="p-6 border-t border-border">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Adding to {mealType} on day {dayOfWeek}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-card-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToMealPlan}
                    disabled={adding}
                    className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {adding
                      ? "Adding..."
                      : `Add to Meal Plan (${calculateTotalCalories()} cal)`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
