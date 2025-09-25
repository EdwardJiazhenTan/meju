"use client";

import { useState, useRef } from "react";
import DishSelectionModal from "./DishSelectionModal";

interface OrderFormData {
  user_name: string;
  order_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  dish_name: string;
  people_count: number;
  notes: string;
}

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  initialData?: Partial<OrderFormData>;
  isSubmitting?: boolean;
}

interface DishWithCategory {
  id: number;
  name: string;
  category_name?: string;
  cooking_steps?: string;
  servings?: number;
  base_calories?: number;
  preparation_time?: number;
}

export default function OrderForm({
  onSubmit,
  initialData = {},
  isSubmitting = false,
}: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    user_name: initialData.user_name || "",
    order_date:
      initialData.order_date || new Date().toISOString().split("T")[0],
    meal_type: initialData.meal_type || "lunch",
    dish_name: initialData.dish_name || "",
    people_count: initialData.people_count || 1,
    notes: initialData.notes || "",
  });

  // Check if data came from homepage modal
  const isPreFilled = !!(
    initialData.user_name &&
    initialData.order_date &&
    initialData.people_count
  );

  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<DishWithCategory | null>(
    null,
  );
  const [showUserConfirmation, setShowUserConfirmation] = useState(false);
  const [existingUserData, setExistingUserData] = useState<{
    user_name: string;
    order_count: number;
    last_order: string;
  } | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const userCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showUserConfirmation) {
      onSubmit(formData);
    } else {
      checkUserAndSubmit();
    }
  };

  const checkUserAndSubmit = async () => {
    if (!formData.user_name.trim()) {
      onSubmit(formData);
      return;
    }

    setIsCheckingUser(true);
    try {
      const response = await fetch(
        `/api/users/check?user_name=${encodeURIComponent(formData.user_name.trim())}`,
      );
      const data = await response.json();

      if (data.exists && data.user_data) {
        setExistingUserData(data.user_data);
        setShowUserConfirmation(true);
      } else {
        onSubmit(formData);
      }
    } catch (error) {
      console.error("Error checking user:", error);
      // If check fails, proceed with submission
      onSubmit(formData);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const confirmExistingUser = () => {
    setShowUserConfirmation(false);
    onSubmit(formData);
  };

  const cancelUserConfirmation = () => {
    setShowUserConfirmation(false);
    setExistingUserData(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleOpenDishSelection = () => {
    setIsDishModalOpen(true);
  };

  const handleCloseDishSelection = () => {
    setIsDishModalOpen(false);
  };

  const handleDishSelect = (dish: DishWithCategory) => {
    setSelectedDish(dish);
    setFormData((prev) => ({
      ...prev,
      dish_name: dish.name,
    }));
    setIsDishModalOpen(false);
  };

  const handleClearDish = () => {
    setSelectedDish(null);
    setFormData((prev) => ({
      ...prev,
      dish_name: "",
    }));
  };

  return (
    <>
      <div className="max-w-md mx-auto bg-card/50 backdrop-blur-sm shadow-md rounded-lg p-6 border border-border/50">
        <h2 className="text-2xl font-bold text-foreground mb-6">Place Order</h2>

        {/* Pre-filled Information Notice */}
        {isPreFilled && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 className="font-medium text-foreground">
                Information Pre-filled
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Your dining information has been automatically filled from your
              previous selection. You can focus on choosing your dishes below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="user_name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Your Name *
            </label>
            <input
              type="text"
              id="user_name"
              name="user_name"
              required
              value={formData.user_name}
              onChange={handleChange}
              readOnly={isPreFilled}
              className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground placeholder-muted-foreground ${
                isPreFilled ? "bg-muted cursor-not-allowed" : "bg-input"
              }`}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label
              htmlFor="order_date"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Date *
            </label>
            <input
              type="date"
              id="order_date"
              name="order_date"
              required
              value={formData.order_date}
              onChange={handleChange}
              readOnly={isPreFilled}
              className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground ${
                isPreFilled ? "bg-muted cursor-not-allowed" : "bg-input"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="meal_type"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Meal Type *
            </label>
            <select
              id="meal_type"
              name="meal_type"
              required
              value={formData.meal_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground bg-input"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="people_count"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Number of People *
            </label>
            <input
              type="number"
              id="people_count"
              name="people_count"
              required
              min="1"
              max="50"
              value={formData.people_count}
              onChange={handleChange}
              readOnly={isPreFilled}
              className={`w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground ${
                isPreFilled ? "bg-muted cursor-not-allowed" : "bg-input"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition resize-none text-foreground placeholder-muted-foreground bg-input"
              placeholder="Special requests or notes"
            />
          </div>

          {/* Dish selection area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Dish *
            </label>

            {selectedDish ? (
              <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {selectedDish.name}
                    </h4>
                    {selectedDish.category_name && (
                      <p className="text-sm text-gray-600">
                        Category: {selectedDish.category_name}
                      </p>
                    )}
                    {selectedDish.cooking_steps && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {selectedDish.cooking_steps}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {selectedDish.servings && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {selectedDish.servings} servings
                        </span>
                      )}
                      {selectedDish.base_calories && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {selectedDish.base_calories} cal
                        </span>
                      )}
                      {selectedDish.preparation_time && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          {selectedDish.preparation_time} min
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearDish}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear selection"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleOpenDishSelection}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Choose Different Dish
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenDishSelection}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-center"
              >
                <div className="flex flex-col items-center">
                  <svg
                    className="w-8 h-8 mb-2"
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
                  <span className="font-medium">Click to Select Dish</span>
                  <span className="text-sm mt-1">
                    Choose from our dish collection
                  </span>
                </div>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedDish || isCheckingUser}
            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
              isSubmitting || !selectedDish || isCheckingUser
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isCheckingUser
              ? "Checking..."
              : isSubmitting
                ? "Submitting..."
                : "Submit Order"}
          </button>

          {!selectedDish && (
            <p className="text-sm text-red-600 text-center">
              Please select a dish before submitting
            </p>
          )}
        </form>
      </div>

      {/* Dish selection modal */}
      <DishSelectionModal
        isOpen={isDishModalOpen}
        onClose={handleCloseDishSelection}
        onSelectDish={handleDishSelect}
      />
      {/* User confirmation modal */}
      {showUserConfirmation && existingUserData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Welcome Back!
              </h3>
              <p className="text-muted-foreground text-sm">
                We found an existing customer with this name
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Name:</span>
                  <span className="text-foreground font-medium">
                    {existingUserData.user_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Previous Orders:
                  </span>
                  <span className="text-foreground font-medium">
                    {existingUserData.order_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Last Order:
                  </span>
                  <span className="text-foreground font-medium text-xs">
                    {new Date(existingUserData.last_order).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground text-sm text-center mb-6">
              Is this you? If not, please try a different name to avoid
              confusion with your order.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelUserConfirmation}
                className="flex-1 px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                Different Name
              </button>
              <button
                onClick={confirmExistingUser}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Yes, That's Me
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
