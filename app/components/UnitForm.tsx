'use client';

import { useState } from 'react';
import { IngredientUnit } from '@/types';

interface UnitFormProps {
  onSubmit?: (unit: IngredientUnit) => void;
}

interface CreateUnitData {
  name: string;
  abbreviation: string;
  unit_type?: string;
}

export default function UnitForm({ onSubmit }: UnitFormProps) {
  const [formData, setFormData] = useState<CreateUnitData>({
    name: '',
    abbreviation: '',
    unit_type: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/ingredient-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create unit');
      }

      setSuccess(true);
      onSubmit?.(result.unit);

      // Reset form
      setFormData({
        name: '',
        abbreviation: '',
        unit_type: '',
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateUnitData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const commonUnitTypes = [
    'weight',
    'volume',
    'count',
    'length',
    'temperature'
  ];

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Unit</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Unit created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Unit Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Grams, Cups, Pieces"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Abbreviation *
          </label>
          <input
            type="text"
            value={formData.abbreviation}
            onChange={(e) => handleInputChange('abbreviation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., g, cup, pcs"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Unit Type
          </label>
          <select
            value={formData.unit_type || ''}
            onChange={(e) => handleInputChange('unit_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select unit type</option>
            {commonUnitTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Optional: categorize the type of measurement
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Common Examples:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>Weight:</strong> Grams (g), Kilograms (kg), Ounces (oz)</div>
            <div><strong>Volume:</strong> Milliliters (ml), Cups (cup), Tablespoons (tbsp)</div>
            <div><strong>Count:</strong> Pieces (pcs), Items (item), Cloves (clove)</div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Unit'}
        </button>
      </form>
    </div>
  );
}
