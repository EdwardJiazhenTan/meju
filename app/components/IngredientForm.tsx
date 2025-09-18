"use client";

import { useState, useEffect } from "react";
import { Ingredient, IngredientUnit } from "@/types";

interface IngredientFormProps {
  onSubmit?: (ingredient: Ingredient) => void;
}

interface CreateIngredientData {
  name: string;
  category?: string;
  default_unit_id?: number;
  calories_per_unit?: number;
}

export default function IngredientForm({ onSubmit }: IngredientFormProps) {
  const [formData, setFormData] = useState<CreateIngredientData>({
    name: "",
    category: "",
    default_unit_id: undefined,
    calories_per_unit: undefined,
  });

  const [availableUnits, setAvailableUnits] = useState<IngredientUnit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units");
      const result = await response.json();
      if (response.ok) {
        setAvailableUnits(result.units || []);
      }
    } catch (err) {
      console.error("Failed to fetch units:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create ingredient");
      }

      setSuccess(true);
      onSubmit?.(result.ingredient);

      // Reset form
      setFormData({
        name: "",
        category: "",
        default_unit_id: undefined,
        calories_per_unit: undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateIngredientData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Ingredient</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Ingredient created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Ingredient Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Chicken Breast, Tomatoes, Rice"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={formData.category || ""}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Protein, Vegetables, Grains"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Default Unit</label>
          <select
            value={formData.default_unit_id || ""}
            onChange={(e) =>
              handleInputChange(
                "default_unit_id",
                e.target.value ? parseInt(e.target.value) : undefined,
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select default unit</option>
            {availableUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.abbreviation})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Calories per Unit
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.calories_per_unit || ""}
            onChange={(e) =>
              handleInputChange(
                "calories_per_unit",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 150 calories per 100g"
          />
          <p className="text-xs text-gray-500 mt-1">
            Calories per default unit (e.g., per 100g, per piece, per cup)
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating..." : "Create Ingredient"}
        </button>
      </form>
    </div>
  );
}
