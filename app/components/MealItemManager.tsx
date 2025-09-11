'use client';

import { useState, useEffect } from 'react';
import { Dish } from '@/types';

interface MealItem {
  id: number;
  dish_id: number;
  dish_name: string;
  servings: number;
  customizations?: Record<string, any>;
  notes?: string;
  base_calories?: number;
  preparation_time?: number;
  category_name?: string;
}

interface MealItemManagerProps {
  mealPlanId: number | null;
  onItemsChange?: (items: MealItem[]) => void;
}

export default function MealItemManager({ mealPlanId, onItemsChange }: MealItemManagerProps) {
  const [items, setItems] = useState<MealItem[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    dish_id: '',
    servings: '1',
    notes: '',
  });

  const fetchMealItems = async () => {
    if (!mealPlanId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/meal-plans/${mealPlanId}/items`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch meal items');
      }

      setItems(result.mealItems || []);
      onItemsChange?.(result.mealItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await fetch('/api/dishes');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dishes');
      }

      setDishes(result.dishes || []);
    } catch (err) {
      console.error('Error fetching dishes:', err);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  useEffect(() => {
    fetchMealItems();
  }, [mealPlanId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealPlanId || !newItem.dish_id) return;

    setAddingItem(true);
    setError(null);

    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dish_id: parseInt(newItem.dish_id),
          servings: parseFloat(newItem.servings),
          notes: newItem.notes || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add meal item');
      }

      // Reset form and refresh items
      setNewItem({ dish_id: '', servings: '1', notes: '' });
      await fetchMealItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!mealPlanId) return;

    try {
      const response = await fetch(`/api/meal-plans/${mealPlanId}/items?item_id=${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove meal item');
      }

      await fetchMealItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!mealPlanId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a meal plan to manage items
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Manage Meal Items</h3>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Add Dish to Meal</h4>
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <select
                value={newItem.dish_id}
                onChange={(e) => setNewItem({ ...newItem, dish_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select dish</option>
                {dishes.map((dish: any) => (
                  <option key={dish.id} value={dish.id}>
                    {dish.name} {dish.category_name && `(${dish.category_name})`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={newItem.servings}
                onChange={(e) => setNewItem({ ...newItem, servings: e.target.value })}
                placeholder="Servings"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <div>
              <input
                type="text"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                placeholder="Notes (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={addingItem || !newItem.dish_id}
            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingItem ? 'Adding...' : 'Add Dish'}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div>
        <h4 className="font-medium mb-3">Current Items</h4>
        
        {loading && (
          <div className="text-center py-4 text-gray-500">Loading items...</div>
        )}
        
        {!loading && items.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No items in this meal plan yet
          </div>
        )}
        
        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.dish_name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.servings !== 1 && `${item.servings} servings • `}
                    {item.base_calories && `${Math.round(item.base_calories * item.servings)} cal • `}
                    {item.preparation_time && `${item.preparation_time} min prep`}
                    {item.category_name && (
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {item.category_name}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="text-sm text-blue-600 italic mt-1">
                      {item.notes}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchMealItems}
          className="text-sm text-orange-600 hover:text-orange-700 underline"
        >
          Refresh Items
        </button>
      </div>
    </div>
  );
}