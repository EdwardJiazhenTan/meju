'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ViewDish from '@/app/components/ViewDish';
import { Dish } from '@/types';

interface DishWithCategory extends Dish {
  category_name?: string;
}

interface DishViewPageProps {
  showSelectButton?: boolean;
  onSelect?: (dish: DishWithCategory) => void;
}

export default function DishViewPage({ showSelectButton = false, onSelect }: DishViewPageProps) {
  const params = useParams();
  const router = useRouter();
  const dishId = params.dishId as string;

  const [dish, setDish] = useState<DishWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dishId) {
      fetchDish();
    }
  }, [dishId]);

  const fetchDish = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dishes/${dishId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch dish');
      }

      setDish(result.dish);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = () => {
    if (dish && onSelect) {
      onSelect(dish);
    }
  };

  const handleEdit = () => {
    router.push(`/dishes/${dishId}/edit`);
  };

  const handleDelete = async () => {
    if (!dish) return;

    if (!confirm(`Are you sure you want to delete "${dish.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/dishes/${dishId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete dish');
      }

      // Navigate back to dishes page
      router.push('/dishes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete dish');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-500">Loading dish...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Dish not found'}
            <button
              onClick={fetchDish}
              className="ml-4 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href={dish.category_name ? `/dishes/category/${encodeURIComponent(dish.category_name)}` : '/dishes'}
              className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {dish.category_name ? `Back to ${dish.category_name}` : 'Back to Categories'}
            </Link>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h1>
              {dish.category_name && (
                <div className="flex items-center text-gray-600">
                  <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    {dish.category_name}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {showSelectButton && onSelect && (
                <button
                  onClick={handleSelect}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Select Dish
                </button>
              )}

              {!showSelectButton && (
                <>
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dish Details */}
        <div className="mb-8">
          <ViewDish dish={dish} />
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
              <div className="text-gray-900">
                {dish.created_at ? new Date(dish.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Dish ID</div>
              <div className="text-gray-900 font-mono text-sm">{dish.id}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Customizable</div>
              <div className="text-gray-900">
                {dish.is_customizable ? (
                  <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded">
                    Yes
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded">
                    No
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions for Gallery Mode */}
        {!showSelectButton && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dishes/create"
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Similar Dish
              </Link>

              <button
                onClick={() => navigator.share?.({
                  title: dish.name,
                  text: dish.cooking_steps || `Check out this ${dish.name} recipe!`,
                  url: window.location.href
                })}
                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Recipe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
