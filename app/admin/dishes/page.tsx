"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Dish {
  id: number;
  name: string;
  cooking_steps?: string;
  category_id?: number;
  category_name?: string;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states (only delete modal)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDishes();
    loadCategories();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dishes");
      const data = await response.json();

      if (response.ok) {
        setDishes(data.dishes || []);
      } else {
        setError(data.error || "Failed to load dishes");
      }
    } catch (err) {
      setError("Failed to load dishes");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleEditDish = (dish: Dish) => {
    // Navigate to edit page
    window.location.href = `/admin/dishes/${dish.id}/edit`;
  };

  const handleDeleteDish = (dish: Dish) => {
    setSelectedDish(dish);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDish) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dishes/${selectedDish.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadDishes();
        closeModals();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete dish");
      }
    } catch (err) {
      setError("Failed to delete dish");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setSelectedDish(null);
    setError(null);
  };

  // Filter dishes based on search and category
  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "" || dish.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDishes = filteredDishes.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dish Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and delete dishes
            </p>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/admin/dishes/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>Create Dish</span>
            </Link>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search dishes
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredDishes.length} of {dishes.length} dishes
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Dishes Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading dishes...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dish
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDishes.map((dish) => (
                      <tr key={dish.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {dish.name}
                            </div>
                            {dish.cooking_steps && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {dish.cooking_steps}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {dish.category_name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div>Serves {dish.servings}</div>
                            {dish.base_calories && (
                              <div>{dish.base_calories} cal</div>
                            )}
                            {dish.preparation_time && (
                              <div>{dish.preparation_time} min</div>
                            )}
                            {dish.is_customizable && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                Customizable
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditDish(dish)}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDish(dish)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {startIndex + 1} to{" "}
                      {Math.min(
                        startIndex + itemsPerPage,
                        filteredDishes.length,
                      )}{" "}
                      of {filteredDishes.length} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 border rounded text-sm ${
                            currentPage === i + 1
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Dish
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <strong>"{selectedDish.name}"</strong>?
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
