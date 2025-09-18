"use client";

import { useState } from "react";
import { Dish } from "@/types";

interface DishWithCategory extends Dish {
  category_name?: string;
}

interface DishCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: DishWithCategory | null;
  onConfirm: (customization: {
    servings: number;
    notes?: string;
    customizations?: Record<string, any>;
  }) => void;
}

export default function DishCustomizationModal({
  isOpen,
  onClose,
  dish,
  onConfirm,
}: DishCustomizationModalProps) {
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState("");
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await onConfirm({
        servings,
        notes: notes.trim() || undefined,
        customizations:
          Object.keys(customizations).length > 0 ? customizations : undefined,
      });

      // Reset form
      setServings(1);
      setNotes("");
      setCustomizations({});
      onClose();
    } catch (error) {
      console.error("Error adding dish to meal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalCalories = () => {
    if (!dish?.base_calories) return 0;
    return Math.round(dish.base_calories * servings);
  };

  const calculateTotalPrepTime = () => {
    return dish?.preparation_time || 0;
  };

  if (!isOpen || !dish) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Customize Dish
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Adjust servings and add notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Dish Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">{dish.name}</h3>
            <div className="flex flex-wrap gap-2">
              {dish.category_name && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {dish.category_name}
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {dish.servings} default serving{dish.servings !== 1 ? "s" : ""}
              </span>
              {dish.base_calories && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {dish.base_calories} cal per serving
                </span>
              )}
              {dish.preparation_time && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  {dish.preparation_time} min prep
                </span>
              )}
            </div>
          </div>

          {/* Servings */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Servings
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={servings <= 1}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>

              <input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) =>
                  setServings(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-20 text-center border border-gray-300 rounded-md py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => setServings(Math.min(20, servings + 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={servings >= 20}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Updated Totals */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Total for {servings} serving{servings !== 1 ? "s" : ""}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Calories:</span>
                <div className="font-medium text-blue-900">
                  {calculateTotalCalories()} cal
                </div>
              </div>
              <div>
                <span className="text-blue-700">Prep Time:</span>
                <div className="font-medium text-blue-900">
                  {calculateTotalPrepTime()} min
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or modifications..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {notes.length}/500 characters
            </div>
          </div>

          {/* Future Customizations Placeholder */}
          {dish.is_customizable && (
            <div className="mb-6 p-4 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center text-gray-500">
                <svg
                  className="w-8 h-8 mx-auto mb-2 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
                <p className="text-sm">Dish customizations coming soon!</p>
                <p className="text-xs">This dish supports customizations</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add to Meal"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
