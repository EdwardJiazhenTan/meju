'use client';

import { useState, useEffect } from 'react';
import IngredientSelector from '../../components/IngredientSelector';
import { Dish, Ingredient, IngredientUnit } from '@/types';

export default function IngredientsTestPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<IngredientUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms for creating test data
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    calories_per_unit: '',
    default_unit_id: '',
    category: '',
  });
  const [newUnit, setNewUnit] = useState({
    name: '',
    abbreviation: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dishesRes, ingredientsRes, unitsRes] = await Promise.all([
        fetch('/api/dishes'),
        fetch('/api/ingredients'),
        fetch('/api/ingredient-units')
      ]);

      const [dishesData, ingredientsData, unitsData] = await Promise.all([
        dishesRes.json(),
        ingredientsRes.json(),
        unitsRes.json()
      ]);

      setDishes(dishesData.dishes || []);
      setIngredients(ingredientsData.ingredients || []);
      setUnits(unitsData.units || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createIngredient = async () => {
    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newIngredient.name,
          calories_per_unit: newIngredient.calories_per_unit ? parseFloat(newIngredient.calories_per_unit) : undefined,
          default_unit_id: newIngredient.default_unit_id ? parseInt(newIngredient.default_unit_id) : undefined,
          category: newIngredient.category || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewIngredient({ name: '', calories_per_unit: '', default_unit_id: '', category: '' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ingredient');
    }
  };

  const createUnit = async () => {
    try {
      const response = await fetch('/api/ingredient-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUnit.name,
          abbreviation: newUnit.abbreviation || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setNewUnit({ name: '', abbreviation: '' });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create unit');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Test Ingredient Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-sm underline"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-8">
            {/* Quick Setup Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Ingredient */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Create Ingredient</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Calories per unit"
                    value={newIngredient.calories_per_unit}
                    onChange={(e) => setNewIngredient({...newIngredient, calories_per_unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    value={newIngredient.default_unit_id}
                    onChange={(e) => setNewIngredient({...newIngredient, default_unit_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select default unit</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Category (e.g., Protein, Vegetable)"
                    value={newIngredient.category}
                    onChange={(e) => setNewIngredient({...newIngredient, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={createIngredient}
                    disabled={!newIngredient.name}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Create Ingredient
                  </button>
                </div>
              </div>

              {/* Create Unit */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Create Unit</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Unit name (e.g., grams, cups)"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({...newUnit, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Abbreviation (e.g., g, ml)"
                    value={newUnit.abbreviation}
                    onChange={(e) => setNewUnit({...newUnit, abbreviation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={createUnit}
                    disabled={!newUnit.name}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    Create Unit
                  </button>
                </div>
              </div>
            </div>

            {/* Dish Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Select Dish to Manage Ingredients</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dishes.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-gray-500">
                    No dishes available. Create a dish first in the <a href="/test" className="text-blue-600 underline">Dish Test</a> page.
                  </div>
                ) : (
                  dishes.map((dish: any) => (
                    <div
                      key={dish.id}
                      onClick={() => setSelectedDish(dish)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDish?.id === dish.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-medium">{dish.name}</h4>
                      <p className="text-sm text-gray-500">ID: {dish.id}</p>
                      {dish.category_name && (
                        <span className="text-xs bg-purple-100 px-2 py-1 rounded">
                          {dish.category_name}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ingredient Selector */}
            {selectedDish && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Managing Ingredients for: {selectedDish.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">Dish ID: {selectedDish.id}</p>
                
                <IngredientSelector
                  dishId={selectedDish.id}
                  onIngredientsChange={(ingredients) => {
                    console.log('Ingredients updated:', ingredients);
                  }}
                />
              </div>
            )}

            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Available Ingredients ({ingredients.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {ingredients.map((ingredient: any) => (
                    <div key={ingredient.id} className="text-sm">
                      <strong>{ingredient.ingredient_name || ingredient.name}</strong>
                      {ingredient.category && <span className="ml-2 text-gray-500">({ingredient.category})</span>}
                      {ingredient.calories_per_unit && (
                        <span className="ml-2 text-green-600">{ingredient.calories_per_unit} cal/unit</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Available Units ({units.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {units.map((unit) => (
                    <div key={unit.id} className="text-sm">
                      <strong>{unit.name}</strong>
                      {unit.abbreviation && <span className="ml-2 text-gray-500">({unit.abbreviation})</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}