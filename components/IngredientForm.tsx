'use client';

import React, { useState } from 'react';
import { ApiClient } from '@/lib/api';

interface IngredientFormData {
  name: string;
  unit: string;
  category: "vegetable" | "meat" | "dairy" | "grain" | "spice" | "fruit" | "other" | "";
  calories_per_unit: string;
}

export default function IngredientForm() {
  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    unit: '',
    category: '',
    calories_per_unit: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const categoryOptions = [
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'meat', label: 'Meat' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'grain', label: 'Grain' },
    { value: 'spice', label: 'Spice' },
    { value: 'fruit', label: 'Fruit' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const ingredientData = {
        name: formData.name,
        unit: formData.unit || undefined,
        category: formData.category || undefined,
        calories_per_unit: formData.calories_per_unit ? parseFloat(formData.calories_per_unit) : undefined,
      };

      const response = await ApiClient.createIngredient(ingredientData);
      
      if (response.success) {
        setMessage('Ingredient created successfully!');
        setMessageType('success');
        // Reset form
        setFormData({
          name: '',
          unit: '',
          category: '',
          calories_per_unit: '',
        });
      } else {
        setMessage(response.message || 'Failed to create ingredient');
        setMessageType('error');
      }
    } catch {
      setMessage('An error occurred while creating the ingredient');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg shadow-sm border-border border p-6">
        <h2 className="text-2xl font-bold text-card-foreground mb-6">Create New Ingredient</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ingredient Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
              Ingredient Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Tomato"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-card-foreground mb-2">
              Unit of Measurement
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="e.g., kg, pieces, cups"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-card-foreground mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground"
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calories per Unit */}
          <div>
            <label htmlFor="calories_per_unit" className="block text-sm font-medium text-card-foreground mb-2">
              Calories per Unit
            </label>
            <input
              type="number"
              id="calories_per_unit"
              name="calories_per_unit"
              min="0"
              step="0.1"
              value={formData.calories_per_unit}
              onChange={handleInputChange}
              placeholder="e.g., 150"
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-input text-foreground placeholder-muted-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Calories per unit of measurement (optional)
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Ingredient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}