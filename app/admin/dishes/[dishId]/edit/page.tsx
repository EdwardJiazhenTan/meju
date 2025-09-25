"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Dish {
  id: number;
  name: string;
  cooking_steps?: string;
  category_id?: number;
  category_name?: string;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
}

interface DishIngredient {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit_id: number;
  unit_name: string;
  unit_abbreviation?: string;
  is_optional: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Ingredient {
  id: number;
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
}

interface Unit {
  id: number;
  name: string;
  abbreviation?: string;
}

export default function EditDishPage() {
  const params = useParams();
  const dishId = params?.dishId as string;

  const [dish, setDish] = useState<Dish | null>(null);
  const [ingredients, setIngredients] = useState<DishIngredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<
    Ingredient[]
  >([]);
  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    cooking_steps: "",
    category_id: "" as number | "",
    base_calories: "" as number | "",
    preparation_time: "" as number | "",
    servings: 1,
    is_customizable: false,
  });

  // New ingredient form
  const [newIngredient, setNewIngredient] = useState({
    ingredient_id: "" as number | "",
    quantity: "" as number | "",
    unit_id: "" as number | "",
    is_optional: false,
  });

  useEffect(() => {
    if (dishId) {
      loadDishData();
      loadCategories();
      loadAvailableIngredients();
      loadAvailableUnits();
    }
  }, [dishId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDishData = async () => {
    try {
      setLoading(true);

      // Load dish details
      const dishResponse = await fetch(`/api/dishes/${dishId}`);
      const dishData = await dishResponse.json();

      if (!dishResponse.ok) {
        throw new Error(dishData.error || "Failed to load dish");
      }

      const dishInfo = dishData.dish;
      setDish(dishInfo);
      setFormData({
        name: dishInfo.name,
        cooking_steps: dishInfo.cooking_steps || "",
        category_id: dishInfo.category_id || "",
        base_calories: dishInfo.base_calories || "",
        preparation_time: dishInfo.preparation_time || "",
        servings: dishInfo.servings,
        is_customizable: dishInfo.is_customizable,
      });

      // Load dish ingredients
      const ingredientsResponse = await fetch(
        `/api/dishes/${dishId}/ingredients`,
      );
      const ingredientsData = await ingredientsResponse.json();

      if (ingredientsResponse.ok) {
        setIngredients(ingredientsData.ingredients || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dish data");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const loadAvailableIngredients = async () => {
    try {
      const response = await fetch("/api/ingredients");
      const data = await response.json();
      if (response.ok) {
        setAvailableIngredients(data.ingredients || []);
      }
    } catch (err) {
      console.error("Failed to load ingredients:", err);
    }
  };

  const loadAvailableUnits = async () => {
    try {
      const response = await fetch("/api/ingredient-units");
      const data = await response.json();
      if (response.ok) {
        setAvailableUnits(data.units || []);
      }
    } catch (err) {
      console.error("Failed to load units:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        cooking_steps: formData.cooking_steps || null,
        category_id: formData.category_id || null,
        base_calories: formData.base_calories || null,
        preparation_time: formData.preparation_time || null,
        servings: formData.servings,
        is_customizable: formData.is_customizable,
      };

      const response = await fetch(`/api/dishes/${dishId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update dish");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update dish");
    } finally {
      setSaving(false);
    }
  };

  const addIngredient = async () => {
    if (
      !newIngredient.ingredient_id ||
      !newIngredient.quantity ||
      !newIngredient.unit_id
    ) {
      setError("Please fill in all ingredient fields");
      return;
    }

    try {
      const response = await fetch(`/api/dishes/${dishId}/ingredients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredient_id: newIngredient.ingredient_id,
          quantity: newIngredient.quantity,
          unit_id: newIngredient.unit_id,
          is_optional: newIngredient.is_optional,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add ingredient");
      }

      // Reload ingredients
      const ingredientsResponse = await fetch(
        `/api/dishes/${dishId}/ingredients`,
      );
      const ingredientsData = await ingredientsResponse.json();
      if (ingredientsResponse.ok) {
        setIngredients(ingredientsData.ingredients || []);
      }

      // Reset form
      setNewIngredient({
        ingredient_id: "",
        quantity: "",
        unit_id: "",
        is_optional: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ingredient");
    }
  };

  const removeIngredient = async (ingredientId: number) => {
    try {
      const response = await fetch(`/api/dishes/${dishId}/ingredients`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredient_id: ingredientId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove ingredient");
      }

      // Remove from local state
      setIngredients(
        ingredients.filter((ing) => ing.ingredient_id !== ingredientId),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove ingredient",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dish data...</p>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Dish not found</p>
          <Link
            href="/admin/dishes"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dishes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Dish</h1>
            <p className="text-gray-600 mt-1">
              Modify dish details and ingredients
            </p>
          </div>
          <Link
            href="/admin/dishes"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Dishes
          </Link>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Dish updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dish Details Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dish Details
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category_id:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cooking Steps
                  </label>
                  <textarea
                    value={formData.cooking_steps}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cooking_steps: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Servings *
                    </label>
                    <input
                      type="number"
                      value={formData.servings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          servings: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Calories
                    </label>
                    <input
                      type="number"
                      value={formData.base_calories}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_calories:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.preparation_time}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preparation_time:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_customizable"
                    checked={formData.is_customizable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_customizable: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_customizable"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Allow customization
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Dish"}
                </button>
              </div>
            </form>
          </div>

          {/* Ingredients Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Ingredients
            </h2>

            {/* Current Ingredients */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Current Ingredients
              </h3>
              {ingredients.length === 0 ? (
                <p className="text-gray-500 italic">No ingredients added yet</p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <span className="font-medium">
                          {ingredient.ingredient_name}
                        </span>
                        <span className="text-gray-600 ml-2">
                          {ingredient.quantity}{" "}
                          {ingredient.unit_abbreviation || ingredient.unit_name}
                        </span>
                        {ingredient.is_optional && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          removeIngredient(ingredient.ingredient_id)
                        }
                        className="text-red-600 hover:text-red-800 ml-2"
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
                  ))}
                </div>
              )}
            </div>

            {/* Add New Ingredient */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add Ingredient
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredient
                  </label>
                  <select
                    value={newIngredient.ingredient_id}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        ingredient_id:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select ingredient</option>
                    {availableIngredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newIngredient.quantity}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          quantity:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <select
                      value={newIngredient.unit_id}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          unit_id:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select unit</option>
                      {availableUnits.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_optional_ingredient"
                    checked={newIngredient.is_optional}
                    onChange={(e) =>
                      setNewIngredient({
                        ...newIngredient,
                        is_optional: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_optional_ingredient"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Optional ingredient
                  </label>
                </div>

                <button
                  onClick={addIngredient}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Ingredient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
