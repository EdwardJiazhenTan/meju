'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';

interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  selectedCategory?: Category | null;
  onSelectCategory?: (category: Category) => void;
}

export default function CategoryList({ 
  categories, 
  loading, 
  error, 
  onRefresh,
  selectedCategory,
  onSelectCategory 
}: CategoryListProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Categories</h3>
        <button
          onClick={onRefresh}
          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>
      
      {loading && (
        <div className="text-center py-4 text-gray-500">Loading categories...</div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No categories created yet. Create your first category!
        </div>
      )}
      
      {!loading && categories.length > 0 && (
        <div className="space-y-2">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className={`border rounded-lg p-3 transition-colors ${
                onSelectCategory 
                  ? `cursor-pointer ${
                      selectedCategory?.id === category.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`
                  : 'border-gray-200'
              }`}
              onClick={() => onSelectCategory?.(category)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-500">ID: {category.id}</p>
                </div>
                {category.display_order !== null && category.display_order !== undefined && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Order: {category.display_order}
                  </span>
                )}
              </div>
              {category.created_at && (
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}