"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ApiClient } from "@/lib/api";

interface Ingredient {
  ingredient_id: number;
  name: string;
  unit: string | null;
  category: string | null;
  calories_per_unit: number | null;
}

interface DishIngredient {
  ingredient_id: number;
  name: string;
  unit: string | null;
  quantity: number;
}

interface DishFormData {
  name: string;
  description: string;
  meal: "breakfast" | "lunch" | "dinner" | "dessert" | "";
  calories: string;
  prep_time: string;
  cook_time: string;
  special: boolean;
  url: string;
  visibility: "private" | "shared" | "public";
}

export default function DishForm() {
  const t = useTranslations();
  const [formData, setFormData] = useState<DishFormData>({
    name: "",
    description: "",
    meal: "",
    calories: "",
    prep_time: "",
    cook_time: "",
    special: false,
    url: "",
    visibility: "private",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success",
  );
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishIngredients, setDishIngredients] = useState<DishIngredient[]>([]);
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

  // Calculate total calories from ingredients
  const calculateTotalCalories = useCallback(() => {
    let totalCalories = 0;
    dishIngredients.forEach((dishIngredient) => {
      const ingredient = ingredients.find(
        (ing) => ing.ingredient_id === dishIngredient.ingredient_id,
      );
      if (ingredient && ingredient.calories_per_unit) {
        totalCalories += ingredient.calories_per_unit * dishIngredient.quantity;
      }
    });
    return Math.round(totalCalories);
  }, [dishIngredients, ingredients]);

  const mealOptions = [
    { value: "breakfast", label: t("mealPlan.breakfast") },
    { value: "lunch", label: t("mealPlan.lunch") },
    { value: "dinner", label: t("mealPlan.dinner") },
    { value: "dessert", label: t("mealPlan.dessert") },
  ];

  const visibilityOptions = [
    { value: "private", label: t("dish.private") },
    { value: "shared", label: t("dish.shared") },
    { value: "public", label: t("dish.public") },
  ];

  useEffect(() => {
    loadIngredients();
  }, []);

  // Auto-update calories when ingredients change
  useEffect(() => {
    const totalCalories = calculateTotalCalories();
    setFormData((prev) => ({ ...prev, calories: totalCalories.toString() }));
  }, [dishIngredients, ingredients, calculateTotalCalories]);

  const loadIngredients = async () => {
    setIngredientsLoading(true);
    try {
      const response = await ApiClient.getAllIngredients();
      if (response.success && response.data) {
        setIngredients(response.data.ingredients || []);
      }
    } catch (error) {
      console.error("Failed to load ingredients:", error);
    } finally {
      setIngredientsLoading(false);
    }
  };

  const searchIngredients = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      loadIngredients();
      return;
    }

    setIngredientsLoading(true);
    try {
      const response = await ApiClient.searchIngredients(searchTerm);
      if (response.success && response.data) {
        setIngredients(response.data.ingredients || []);
      }
    } catch (error) {
      console.error("Failed to search ingredients:", error);
    } finally {
      setIngredientsLoading(false);
    }
  };

  const handleIngredientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIngredientSearchTerm(value);
    searchIngredients(value);
  };

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setIngredientSearchTerm(ingredient.name);
  };

  const addIngredient = () => {
    if (!selectedIngredient || !ingredientQuantity) return;

    const quantity = parseFloat(ingredientQuantity);
    if (isNaN(quantity) || quantity <= 0) return;

    const existingIndex = dishIngredients.findIndex(
      (ing) => ing.ingredient_id === selectedIngredient.ingredient_id,
    );

    if (existingIndex >= 0) {
      const updated = [...dishIngredients];
      updated[existingIndex].quantity = quantity;
      setDishIngredients(updated);
    } else {
      setDishIngredients([
        ...dishIngredients,
        {
          ingredient_id: selectedIngredient.ingredient_id,
          name: selectedIngredient.name,
          unit: selectedIngredient.unit,
          quantity,
        },
      ]);
    }

    setSelectedIngredient(null);
    setIngredientSearchTerm("");
    setIngredientQuantity("");
  };

  const removeIngredient = (ingredientId: number) => {
    setDishIngredients(
      dishIngredients.filter((ing) => ing.ingredient_id !== ingredientId),
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const dishData = {
        name: formData.name,
        description: formData.description || undefined,
        meal: formData.meal as "breakfast" | "lunch" | "dinner" | "dessert",
        calories: formData.calories ? parseInt(formData.calories) : undefined,
        prep_time: formData.prep_time
          ? parseInt(formData.prep_time)
          : undefined,
        cook_time: formData.cook_time
          ? parseInt(formData.cook_time)
          : undefined,
        special: formData.special,
        url: formData.url || undefined,
        visibility: formData.visibility,
        ingredients: dishIngredients.map(ing => ({
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity
        }))
      };

      const response = await ApiClient.createDish(dishData);

      if (response.success) {
        setMessage("Dish created successfully!");
        setMessageType("success");
        // Reset form
        setFormData({
          name: "",
          description: "",
          meal: "",
          calories: "",
          prep_time: "",
          cook_time: "",
          special: false,
          url: "",
          visibility: "private",
        });
        setDishIngredients([]);
      } else {
        setMessage(response.message || "Failed to create dish");
        setMessageType("error");
      }
    } catch {
      setMessage("An error occurred while creating the dish");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-card rounded-lg shadow-sm border-border border p-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-6">
          {t("dish.createTitle")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information - Full Width */}
          <div className="space-y-6">
            {/* Dish Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                {t("dish.name")} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("dish.namePlaceholder")}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Description - Full Width */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-card-foreground mb-2"
              >
                {t("dish.description")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t("dish.descriptionPlaceholder")}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  {t("dish.mealType")} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {mealOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          meal: option.value as any,
                        }))
                      }
                      className={`p-4 rounded-lg border-2 transition-colors text-center ${
                        formData.meal === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-card-foreground hover:border-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-3">
                  {t("dish.visibility")} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {visibilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibility: option.value as any,
                        }))
                      }
                      className={`p-3 rounded-lg border-2 transition-colors text-center ${
                        formData.visibility === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-card-foreground hover:border-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Additional Information */}
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prep_time"
                      className="block text-sm font-medium text-card-foreground mb-2"
                    >
                      {t("dish.prepTime")}
                    </label>
                    <input
                      type="number"
                      id="prep_time"
                      name="prep_time"
                      min="0"
                      value={formData.prep_time}
                      onChange={handleInputChange}
                      placeholder="15"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cook_time"
                      className="block text-sm font-medium text-card-foreground mb-2"
                    >
                      {t("dish.cookTime")}
                    </label>
                    <input
                      type="number"
                      id="cook_time"
                      name="cook_time"
                      min="0"
                      value={formData.cook_time}
                      onChange={handleInputChange}
                      placeholder="30"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-card-foreground mb-2"
            >
              Recipe URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com/recipe"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Special Dish Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="special"
              name="special"
              checked={formData.special}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label
              htmlFor="special"
              className="ml-2 block text-sm font-medium text-card-foreground"
            >
              Mark as special dish
            </label>
          </div>

          {/* Ingredients Section */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Ingredients
            </label>

            {/* Add Ingredient */}
            <div className="border border-border rounded-md p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={ingredientSearchTerm}
                    onChange={handleIngredientSearch}
                    placeholder={t("dish.searchIngredients")}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
                  />
                  {ingredientSearchTerm &&
                    ingredients.length > 0 &&
                    !selectedIngredient && (
                      <div className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 max-h-40 overflow-y-auto">
                        {ingredients.map((ingredient) => (
                          <div
                            key={ingredient.ingredient_id}
                            onClick={() => handleIngredientSelect(ingredient)}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-card-foreground"
                          >
                            {ingredient.name}{" "}
                            {ingredient.unit && `(${ingredient.unit})`}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={ingredientQuantity}
                  onChange={(e) => setIngredientQuantity(e.target.value)}
                  placeholder={t("dish.quantity")}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-muted-foreground text-card-foreground"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  disabled={!selectedIngredient || !ingredientQuantity}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {/* Current Ingredients List */}
              {dishIngredients.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-card-foreground mb-2">
                    {t("dish.addedIngredients")}:
                  </h4>
                  <div className="space-y-2">
                    {dishIngredients.map((ingredient) => (
                      <div
                        key={ingredient.ingredient_id}
                        className="flex justify-between items-center bg-muted px-3 py-2 rounded"
                      >
                        <span className="text-card-foreground">
                          {ingredient.name}: {ingredient.quantity}{" "}
                          {ingredient.unit || "units"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            removeIngredient(ingredient.ingredient_id)
                          }
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Total Calories Display */}
          {dishIngredients.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Total Calories
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Automatically calculated from ingredients
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {formData.calories || '0'}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-300">
                    calories
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md border ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
