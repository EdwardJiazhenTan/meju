'use client';

import { useState, useEffect } from 'react';
import IngredientSearchAdd from './IngredientSearchAdd';
import IngredientList from './IngredientList';
import { Ingredient, IngredientUnit } from '@/types';

interface DishIngredientWithDetails {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional: boolean;
  ingredient_name: string;
  unit_name: string;
  unit_abbreviation: string;
  calories_per_unit?: number;
  ingredient_category?: string;
}

interface IngredientSelectorProps {
  dishId?: number | null;
  onIngredientsChange?: (ingredients: DishIngredientWithDetails[]) => void;
}

export default function IngredientSelector({ dishId, onIngredientsChange }: IngredientSelectorProps) {
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [availableUnits, setAvailableUnits] = useState<IngredientUnit[]>([]);
  const [dishIngredients, setDishIngredients] = useState<DishIngredientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingIngredient, setAddingIngredient] = useState(false);

  const fetchAvailableData = async () => {
    try {
      const [ingredientsRes, unitsRes] = await Promise.all([
        fetch('/api/ingredients'),
        fetch('/api/ingredient-units')
      ]);

      const [ingredientsData, unitsData] = await Promise.all([
        ingredientsRes.json(),
        unitsRes.json()
      ]);

      if (!ingredientsRes.ok) throw new Error(ingredientsData.error);
      if (!unitsRes.ok) throw new Error(unitsData.error);

      setAvailableIngredients(ingredientsData.ingredients || []);
      setAvailableUnits(unitsData.units || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    }
  };

  const fetchDishIngredients = async () => {
    if (!dishId) return;
    
    try {
      const response = await fetch(`/api/dishes/${dishId}/ingredients`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setDishIngredients(data.ingredients || []);
      onIngredientsChange?.(data.ingredients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dish ingredients');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailableData(),
        fetchDishIngredients()
      ]);
      setLoading(false);
    };

    loadData();
  }, [dishId]);

  const handleAddIngredient = async (ingredientData: {
    ingredient_id: number;
    quantity: number;
    unit_id: number;
    is_optional: boolean;
  }) => {
    if (!dishId) {
      setError('Please create the dish first before adding ingredients');
      return;
    }

    setAddingIngredient(true);
    setError(null);

    try {
      const response = await fetch(`/api/dishes/${dishId}/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ingredientData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Refresh the ingredients list
      await fetchDishIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ingredient');
    } finally {
      setAddingIngredient(false);
    }
  };

  const handleRemoveIngredient = async (ingredientId: number) => {
    if (!dishId) return;

    try {
      const response = await fetch(`/api/dishes/${dishId}/ingredients?ingredient_id=${ingredientId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Refresh the ingredients list
      await fetchDishIngredients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove ingredient');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading ingredient selector...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Manage Dish Ingredients</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!dishId && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Create and save the dish first to add ingredients
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Ingredients */}
        <div>
          <IngredientSearchAdd
            onAdd={handleAddIngredient}
            availableIngredients={availableIngredients}
            availableUnits={availableUnits}
            loading={addingIngredient}
          />
        </div>

        {/* Current Ingredients */}
        <div>
          <IngredientList
            ingredients={dishIngredients}
            onRemove={dishId ? handleRemoveIngredient : undefined}
            title="Dish Ingredients"
          />
        </div>
      </div>

      {/* Quick Actions */}
      {dishId && (
        <div className="flex justify-end">
          <button
            onClick={fetchDishIngredients}
            className="text-sm bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Refresh Ingredients
          </button>
        </div>
      )}
    </div>
  );
}