"use client";

import { useState, useEffect } from "react";
import { CreateDishData } from "@/types";

interface DishFormProps {
  onSubmit?: (dish: unknown) => void;
}

interface Ingredient {
  id: number;
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
  unit_name?: string;
  unit_abbreviation?: string;
}

interface IngredientUnit {
  id: number;
  name: string;
  abbreviation?: string;
}

interface Category {
  id: number;
  name: string;
  display_order?: number;
}

interface DishIngredientForm {
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional: boolean;
  ingredient?: Ingredient;
  unit?: IngredientUnit;
}

interface CreateIngredientData {
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
}

interface CreateUnitData {
  name: string;
  abbreviation?: string;
}

export default function DishForm({ onSubmit }: DishFormProps) {
  const [formData, setFormData] = useState<CreateDishData>({
    name: "",
    cooking_steps: "",
    category_id: undefined,
    base_calories: undefined,
    preparation_time: undefined,
    servings: 1,
    is_customizable: false,
    ingredients: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Data for dropdowns
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<IngredientUnit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Modal states
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // New ingredient/unit forms
  const [newIngredient, setNewIngredient] = useState<CreateIngredientData>({
    name: "",
    calories_per_unit: undefined,
    default_unit_id: undefined,
    category: "",
  });
  const [newUnit, setNewUnit] = useState<CreateUnitData>({
    name: "",
    abbreviation: "",
  });

  // Modal submission states
  const [creatingIngredient, setCreatingIngredient] = useState(false);
  const [creatingUnit, setCreatingUnit] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadUnits();
    loadIngredients();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch("/api/ingredient-units");
      const data = await response.json();
      if (response.ok) {
        setUnits(data.units || []);
      }
    } catch (error) {
      console.error("Error loading units:", error);
    }
  };

  const loadIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      const data = await response.json();
      if (response.ok) {
        setIngredients(data.ingredients || []);
      }
    } catch (error) {
      console.error("Error loading ingredients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/dishes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create dish");
      }

      setSuccess(true);
      onSubmit?.(result.dish);

      // Reset form
      setFormData({
        name: "",
        cooking_steps: "",
        category_id: undefined,
        base_calories: undefined,
        preparation_time: undefined,
        servings: 1,
        is_customizable: false,
        ingredients: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateDishData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addIngredient = () => {
    const newIngredient: DishIngredientForm = {
      ingredient_id: 0,
      quantity: 1,
      unit_id: 0,
      is_optional: false,
    };

    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient],
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const updateIngredient = (
    index: number,
    field: keyof DishIngredientForm,
    value: unknown,
  ) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) =>
        i === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));
  };

  const createNewIngredient = async () => {
    if (!newIngredient.name.trim()) return;

    setCreatingIngredient(true);
    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newIngredient),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create ingredient");
      }

      // Refresh ingredients list
      await loadIngredients();

      // Reset form and close modal
      setNewIngredient({
        name: "",
        calories_per_unit: undefined,
        default_unit_id: undefined,
        category: "",
      });
      setShowIngredientModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create ingredient",
      );
    } finally {
      setCreatingIngredient(false);
    }
  };

  const createNewUnit = async () => {
    if (!newUnit.name.trim()) return;

    setCreatingUnit(true);
    try {
      const response = await fetch("/api/ingredient-units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUnit),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create unit");
      }

      // Refresh units list
      await loadUnits();

      // Reset form and close modal
      setNewUnit({
        name: "",
        abbreviation: "",
      });
      setShowUnitModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create unit");
    } finally {
      setCreatingUnit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Dish</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Dish created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter dish name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category_id || ""}
                onChange={(e) =>
                  handleInputChange(
                    "category_id",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Servings *
              </label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) =>
                  handleInputChange("servings", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Number of servings"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Base Calories
              </label>
              <input
                type="number"
                min="0"
                value={formData.base_calories || ""}
                onChange={(e) =>
                  handleInputChange(
                    "base_calories",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Calories per serving"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.preparation_time || ""}
                onChange={(e) =>
                  handleInputChange(
                    "preparation_time",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prep time in minutes"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_customizable}
                  onChange={(e) =>
                    handleInputChange("is_customizable", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  Allow customizations
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Cooking Steps */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Cooking Instructions</h3>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cooking Steps
            </label>
            <textarea
              value={formData.cooking_steps || ""}
              onChange={(e) =>
                handleInputChange("cooking_steps", e.target.value)
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter step-by-step cooking instructions..."
            />
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Ingredients</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowIngredientModal(true)}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                + New Ingredient
              </button>
              <button
                type="button"
                onClick={() => setShowUnitModal(true)}
                className="bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                + New Unit
              </button>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Ingredient
              </button>
            </div>
          </div>

          {formData.ingredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No ingredients added yet. Click &ldquo;Add Ingredient&rdquo; to
              start.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Ingredient *
                      </label>
                      <div className="relative">
                        <select
                          value={ingredient.ingredient_id || ""}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              "ingredient_id",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Select ingredient</option>
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "quantity",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="0.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Unit *
                      </label>
                      <select
                        value={ingredient.unit_id || ""}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            "unit_id",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                            {unit.abbreviation && ` (${unit.abbreviation})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={ingredient.is_optional}
                          onChange={(e) =>
                            updateIngredient(
                              index,
                              "is_optional",
                              e.target.checked,
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm">Optional</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remove ingredient"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Dish"}
          </button>
        </div>
      </form>

      {/* New Ingredient Modal */}
      {showIngredientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Ingredient</h3>
              <button
                type="button"
                onClick={() => setShowIngredientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ingredient name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={newIngredient.category || ""}
                  onChange={(e) =>
                    setNewIngredient((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Vegetables, Meat, Dairy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Calories per Unit
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newIngredient.calories_per_unit || ""}
                    onChange={(e) =>
                      setNewIngredient((prev) => ({
                        ...prev,
                        calories_per_unit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Unit
                  </label>
                  <select
                    value={newIngredient.default_unit_id || ""}
                    onChange={(e) =>
                      setNewIngredient((prev) => ({
                        ...prev,
                        default_unit_id: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                        {unit.abbreviation && ` (${unit.abbreviation})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowIngredientModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createNewIngredient}
                disabled={creatingIngredient || !newIngredient.name.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingIngredient ? "Creating..." : "Create Ingredient"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Unit</h3>
              <button
                type="button"
                onClick={() => setShowUnitModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit Name *
                </label>
                <input
                  type="text"
                  value={newUnit.name}
                  onChange={(e) =>
                    setNewUnit((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., cup, tablespoon, gram"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Abbreviation
                </label>
                <input
                  type="text"
                  value={newUnit.abbreviation || ""}
                  onChange={(e) =>
                    setNewUnit((prev) => ({
                      ...prev,
                      abbreviation: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., c, tbsp, g"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setShowUnitModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createNewUnit}
                disabled={creatingUnit || !newUnit.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingUnit ? "Creating..." : "Create Unit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
