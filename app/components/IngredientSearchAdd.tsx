'use client';

import { useState, useEffect } from 'react';
import { Ingredient, IngredientUnit } from '@/types';

interface IngredientSearchAddProps {
  onAdd: (ingredient: {
    ingredient_id: number;
    quantity: number;
    unit_id: number;
    is_optional: boolean;
  }) => void;
  availableIngredients: Ingredient[];
  availableUnits: IngredientUnit[];
  loading?: boolean;
}

export default function IngredientSearchAdd({
  onAdd,
  availableIngredients,
  availableUnits,
  loading = false
}: IngredientSearchAddProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [isOptional, setIsOptional] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedIngredient && selectedIngredient.default_unit_id) {
      setSelectedUnitId(selectedIngredient.default_unit_id);
    }
  }, [selectedIngredient]);

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setSearchTerm(ingredient.name);
    setShowDropdown(false);
    if (ingredient.default_unit_id) {
      setSelectedUnitId(ingredient.default_unit_id);
    }
  };

  const handleAdd = () => {
    if (!selectedIngredient || !selectedUnitId || !quantity) return;

    onAdd({
      ingredient_id: selectedIngredient.id,
      quantity,
      unit_id: selectedUnitId,
      is_optional: isOptional,
    });

    // Reset form
    setSearchTerm('');
    setSelectedIngredient(null);
    setQuantity(100);
    setSelectedUnitId(null);
    setIsOptional(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-medium mb-4">Add Ingredient</h4>
      
      <div className="space-y-4">
        {/* Ingredient Search */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">
            Search Ingredient
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
              if (!e.target.value) {
                setSelectedIngredient(null);
              }
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type to search ingredients..."
          />
          
          {showDropdown && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredIngredients.length > 0 ? (
                filteredIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => handleIngredientSelect(ingredient)}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="font-medium">{ingredient.name}</div>
                    {ingredient.category && (
                      <div className="text-xs text-gray-500">{ingredient.category}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-500">No ingredients found</div>
              )}
            </div>
          )}
        </div>

        {selectedIngredient && (
          <>
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit
              </label>
              <select
                value={selectedUnitId || ''}
                onChange={(e) => setSelectedUnitId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select unit</option>
                {availableUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Checkbox */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Optional ingredient</span>
              </label>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={!selectedIngredient || !selectedUnitId || !quantity || loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Ingredient'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}