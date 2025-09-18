'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ShoppingListItem {
  ingredient_id: number;
  ingredient_name: string;
  total_quantity: number;
  unit_id: number;
  unit_name: string;
  unit_abbreviation: string;
  category?: string;
  dishes: string[];
}

interface ShoppingListData {
  week_start: string;
  week_end: string;
  total_items: number;
  shopping_list: ShoppingListItem[];
  summary_by_category: Record<string, number>;
}

export default function ShoppingListPage() {
  const [shoppingListData, setShoppingListData] = useState<ShoppingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Get current week's Monday as default
  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  useEffect(() => {
    const currentWeek = getCurrentWeekStart();
    setSelectedWeek(currentWeek);
    fetchShoppingList(currentWeek);
  }, []);

  const fetchShoppingList = async (startDate: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/shopping-list?start_date=${startDate}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch shopping list');
      }

      setShoppingListData(result);
      setCheckedItems(new Set()); // Reset checked items when fetching new list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleWeekChange = (newStartDate: string) => {
    setSelectedWeek(newStartDate);
    fetchShoppingList(newStartDate);
  };

  const toggleItemCheck = (ingredientId: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(ingredientId)) {
      newCheckedItems.delete(ingredientId);
    } else {
      newCheckedItems.add(ingredientId);
    }
    setCheckedItems(newCheckedItems);
  };

  const exportShoppingList = async (format: 'json' | 'text') => {
    try {
      const response = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: selectedWeek,
          export_format: format,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to export shopping list');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${selectedWeek}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export shopping list');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeekOptions = () => {
    const options = [];
    const today = new Date();

    // Generate options for current week and next 4 weeks
    for (let i = 0; i < 5; i++) {
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) + (i * 7);
      weekStart.setDate(diff);

      const startDateStr = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);

      options.push({
        value: startDateStr,
        label: `${formatDate(startDateStr)} - ${formatDate(endDate.toISOString().split('T')[0])}`,
        isCurrent: i === 0
      });
    }

    return options;
  };

  const groupedItems = shoppingListData?.shopping_list.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>) || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/meal-plan"
              className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Meal Plan
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping List</h1>

          {/* Week Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Week
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => handleWeekChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {getWeekOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.isCurrent ? '(Current Week)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Buttons */}
            {shoppingListData && shoppingListData.shopping_list.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => exportShoppingList('json')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportShoppingList('text')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Export Text
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Generating shopping list...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => fetchShoppingList(selectedWeek)}
              className="ml-4 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Shopping List Content */}
        {shoppingListData && !loading && (
          <>
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {shoppingListData.total_items}
                  </div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {checkedItems.size}
                  </div>
                  <div className="text-sm text-gray-600">Items Checked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {Object.keys(groupedItems).length}
                  </div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </div>

            {/* Shopping List Items */}
            {shoppingListData.shopping_list.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Items in Shopping List</h3>
                <p className="text-gray-500 mb-4">
                  No meal plans found for this week, or no dishes have ingredients.
                </p>
                <Link
                  href="/meal-plan"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Plan Some Meals
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                      <p className="text-sm text-gray-600">
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <div
                          key={`${item.ingredient_id}-${item.unit_id}`}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            checkedItems.has(item.ingredient_id) ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={checkedItems.has(item.ingredient_id)}
                              onChange={() => toggleItemCheck(item.ingredient_id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-lg font-medium ${
                                  checkedItems.has(item.ingredient_id) ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                  {item.total_quantity} {item.unit_abbreviation} {item.ingredient_name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Used in: {item.dishes.join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
