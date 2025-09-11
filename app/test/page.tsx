'use client';

import { useState, useEffect } from 'react';
import DishForm from '../components/DishForm';
import ViewDish from '../components/ViewDish';
import { Dish } from '@/types';

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  const fetchDishes = async () => {
    try {
      const response = await fetch('/api/dishes');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dishes');
      }

      setDishes(result.dishes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleDishCreated = (newDish: Dish) => {
    setDishes(prev => [newDish, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Test Dish Creation</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Dish Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <DishForm onSubmit={handleDishCreated} />
          </div>

          {/* Dishes List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Existing Dishes</h2>
            
            {loading && (
              <div className="text-center py-4">Loading dishes...</div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {!loading && !error && dishes.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No dishes created yet. Create your first dish!
              </div>
            )}
            
            {!loading && dishes.length > 0 && (
              <div className="space-y-3">
                {dishes.map((dish: any) => (
                  <div 
                    key={dish.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedDish?.id === dish.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDish(dish)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-sm">{dish.name}</h3>
                      <span className="text-xs text-gray-500">
                        {dish.servings} serving{dish.servings !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 text-xs">
                      {dish.base_calories && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {dish.base_calories} cal
                        </span>
                      )}
                      {dish.preparation_time && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {dish.preparation_time} min
                        </span>
                      )}
                      {dish.is_customizable && (
                        <span className="bg-green-100 px-2 py-0.5 rounded">
                          Customizable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={fetchDishes}
              className="mt-4 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh List
            </button>
          </div>

          {/* Dish Detail View */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Dish Details</h2>
            
            {selectedDish ? (
              <ViewDish dish={selectedDish} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a dish from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}