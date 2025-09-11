'use client';

import { useState, useEffect } from 'react';
import CategoryForm from '../../components/CategoryForm';
import CategoryList from '../../components/CategoryList';
import { Category } from '@/types';

export default function CategoriesTestPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch categories');
      }

      setCategories(result.categories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories(prev => [newCategory, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Test Category Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Category Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <CategoryForm onSubmit={handleCategoryCreated} />
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <CategoryList 
              categories={categories}
              loading={loading}
              error={error}
              onRefresh={fetchCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Category Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Category Details</h3>
            
            {selectedCategory ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-xl font-bold text-purple-600 mb-2">
                    {selectedCategory.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>
                      <p className="text-gray-900">{selectedCategory.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Display Order:</span>
                      <p className="text-gray-900">
                        {selectedCategory.display_order ?? 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <p className="text-gray-900">
                    {selectedCategory.created_at 
                      ? new Date(selectedCategory.created_at).toLocaleString()
                      : 'Unknown'
                    }
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Usage Info</h5>
                  <p className="text-sm text-gray-600">
                    This category can be assigned to dishes during creation. 
                    Use the Category ID ({selectedCategory.id}) when creating dishes 
                    that belong to this category.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a category from the list to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Category Testing Guide
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Create categories like "Salads", "Main Course", "Desserts", etc.</li>
                  <li>Use display_order to control how categories appear in lists</li>
                  <li>Note the Category ID - you'll need it when creating dishes</li>
                  <li>Categories help organize and filter dishes in your meal planning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}