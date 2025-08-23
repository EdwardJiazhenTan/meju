"use client";

import React, { useState, useEffect } from "react";
import { ApiClient } from "@/lib/api";

interface Ingredient {
  ingredient_id: number;
  name: string;
  unit: string | null;
  category: string | null;
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

  const mealOptions = [
    { value: "breakfast", label: "Breakfast", icon: "" },
    { value: "lunch", label: "Lunch", icon: "" },
    { value: "dinner", label: "Dinner", icon: "" },
    { value: "dessert", label: "Dessert", icon: "" },
  ];

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setIngredientsLoading(true);
    try {
      const response = await ApiClient.getAllIngredients();
      if (response.success && response.data) {
        setIngredients(response.data.ingredients || []);
      }
    } catch (error) {
      console.error('Failed to load ingredients:', error);
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
      console.error('Failed to search ingredients:', error);
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
      ing => ing.ingredient_id === selectedIngredient.ingredient_id
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
        }
      ]);
    }

    setSelectedIngredient(null);
    setIngredientSearchTerm('');
    setIngredientQuantity('');
  };

  const removeIngredient = (ingredientId: number) => {
    setDishIngredients(dishIngredients.filter(ing => ing.ingredient_id !== ingredientId));
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Create New Dish</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dish Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-black mb-2"
            >
              Dish Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Spaghetti Carbonara"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-black mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the dish..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
            />
          </div>

          {/* Meal Type */}
          <div>
            <label
              htmlFor="meal"
              className="block text-sm font-medium text-black mb-2"
            >
              Meal Type *
            </label>
            <select
              id="meal"
              name="meal"
              required
              value={formData.meal}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="">Select meal type</option>
              {mealOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label
              htmlFor="visibility"
              className="block text-sm font-medium text-black mb-2"
            >
              Visibility *
            </label>
            <select
              id="visibility"
              name="visibility"
              required
              value={formData.visibility}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            >
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="public">Public</option>
            </select>
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-black mb-2"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
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
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="special"
              className="ml-2 block text-sm font-medium text-black"
            >
              Mark as special dish
            </label>
          </div>

          {/* Ingredients Section */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Ingredients
            </label>
            
            {/* Add Ingredient */}
            <div className="border border-gray-300 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={ingredientSearchTerm}
                    onChange={handleIngredientSearch}
                    placeholder="Search ingredients..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
                  />
                  {ingredientSearchTerm && ingredients.length > 0 && !selectedIngredient && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                      {ingredients.map((ingredient) => (
                        <div
                          key={ingredient.ingredient_id}
                          onClick={() => handleIngredientSelect(ingredient)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-black"
                        >
                          {ingredient.name} {ingredient.unit && `(${ingredient.unit})`}
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
                  placeholder="Quantity"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
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
                  <h4 className="text-sm font-medium text-black mb-2">Added Ingredients:</h4>
                  <div className="space-y-2">
                    {dishIngredients.map((ingredient) => (
                      <div key={ingredient.ingredient_id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                        <span className="text-black">
                          {ingredient.name}: {ingredient.quantity} {ingredient.unit || 'units'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient.ingredient_id)}
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

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="calories"
                className="block text-sm font-medium text-black mb-2"
              >
                Calories
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                min="0"
                value={formData.calories}
                onChange={handleInputChange}
                placeholder="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
              />
            </div>

            <div>
              <label
                htmlFor="prep_time"
                className="block text-sm font-medium text-black mb-2"
              >
                Prep Time (min)
              </label>
              <input
                type="number"
                id="prep_time"
                name="prep_time"
                min="0"
                value={formData.prep_time}
                onChange={handleInputChange}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
              />
            </div>

            <div>
              <label
                htmlFor="cook_time"
                className="block text-sm font-medium text-black mb-2"
              >
                Cook Time (min)
              </label>
              <input
                type="number"
                id="cook_time"
                name="cook_time"
                min="0"
                value={formData.cook_time}
                onChange={handleInputChange}
                placeholder="30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-700 text-black"
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md ${
                messageType === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
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
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

