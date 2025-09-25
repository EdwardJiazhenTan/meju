"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DishIngredient {
  id: number;
  ingredient_name: string;
  quantity: number;
  unit_name: string;
  unit_abbreviation?: string;
  is_optional: boolean;
}

interface Dish {
  id: number;
  name: string;
  cooking_steps?: string;
  category_id?: number;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
  category_name?: string;
  ingredients: DishIngredient[];
}

interface Category {
  id: number;
  name: string;
  display_order?: number;
}

interface OrderInfo {
  user_name: string;
  order_date: string;
  people_count: number;
  notes: string;
}

interface OrderItem {
  dish: Dish;
  quantity: number;
}

export default function OrderPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadOrderInfo();
    fetchCategories();
    fetchDishes();
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [selectedCategory]);

  const loadOrderInfo = () => {
    const orderInfoStr = sessionStorage.getItem("orderInfo");
    if (orderInfoStr) {
      try {
        const info: OrderInfo = JSON.parse(orderInfoStr);
        setOrderInfo(info);
      } catch (error) {
        console.error("Error parsing order info:", error);
      }
    } else {
      // Redirect to homepage if no order info
      router.push("/");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/dishes?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setDishes(data.dishes || []);
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatIngredients = (ingredients: DishIngredient[]) => {
    return ingredients
      .map((ing) => {
        const unit = ing.unit_abbreviation || ing.unit_name;
        const quantity =
          ing.quantity % 1 === 0 ? ing.quantity : ing.quantity.toFixed(1);
        const optional = ing.is_optional ? " (optional)" : "";
        return `${ing.ingredient_name} ${quantity}${unit}${optional}`;
      })
      .join(", ");
  };

  const addToOrder = (dish: Dish) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.dish.id === dish.id);
      if (existingItem) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prev, { dish, quantity: 1 }];
      }
    });
  };

  const removeFromOrder = (dishId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const updateQuantity = (dishId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(dishId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity } : item,
      ),
    );
  };

  const submitOrder = async () => {
    if (!orderInfo || orderItems.length === 0) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const orderIds = [];
      // Submit each dish as a separate order (based on existing API structure)
      for (const orderItem of orderItems) {
        for (let i = 0; i < orderItem.quantity; i++) {
          const orderData = {
            user_name: orderInfo.user_name,
            order_date: orderInfo.order_date,
            meal_type: "lunch", // Default or could be selected
            dish_name: orderItem.dish.name,
            people_count: orderInfo.people_count,
            notes: orderInfo.notes,
          };

          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            throw new Error("Failed to submit order");
          }

          const result = await response.json();
          orderIds.push(result.order.id);
        }
      }

      // Store order confirmation data
      sessionStorage.setItem(
        "orderConfirmation",
        JSON.stringify({
          orderIds,
          orderInfo,
          orderItems: orderItems.map((item) => ({
            dishName: item.dish.name,
            quantity: item.quantity,
          })),
        }),
      );

      // Clear order info and redirect to confirmation
      sessionStorage.removeItem("orderInfo");
      router.push("/order-confirmation");
    } catch (error) {
      console.error("Error submitting order:", error);
      setMessage({
        type: "error",
        text: "Failed to submit order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedDishes = categories.reduce(
    (acc, category) => {
      const categoryDishes = dishes.filter(
        (dish) => dish.category_name === category.name,
      );
      if (categoryDishes.length > 0) {
        acc[category.name] = categoryDishes;
      }
      return acc;
    },
    {} as Record<string, Dish[]>,
  );

  // Add uncategorized dishes
  const uncategorizedDishes = dishes.filter((dish) => !dish.category_name);
  if (uncategorizedDishes.length > 0) {
    groupedDishes["Other"] = uncategorizedDishes;
  }

  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Loading order information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/6 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-english text-5xl md:text-6xl text-primary mb-4">
            Create Your Order
          </h1>
          <div className="font-chinese text-2xl md:text-3xl text-foreground mb-8">
            创建您的订单
          </div>
          <div className="w-24 h-px bg-primary mx-auto mb-6"></div>
          <div className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <p className="mb-2">
              Welcome,{" "}
              <span className="text-foreground font-medium">
                {orderInfo.user_name}
              </span>
              !
            </p>
            <p className="text-sm">
              Select your dishes for {orderInfo.people_count}{" "}
              {orderInfo.people_count === 1 ? "person" : "people"} on{" "}
              {new Date(orderInfo.order_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Editable Order Information */}
        <div className="mb-12 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 max-w-2xl mx-auto">
          <h3 className="font-english text-xl text-foreground mb-4 text-center">
            Order Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name
              </label>
              <input
                type="text"
                value={orderInfo.user_name}
                onChange={(e) =>
                  setOrderInfo({ ...orderInfo, user_name: e.target.value })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date
              </label>
              <input
                type="date"
                value={orderInfo.order_date}
                onChange={(e) =>
                  setOrderInfo({ ...orderInfo, order_date: e.target.value })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                People Count
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={orderInfo.people_count}
                onChange={(e) =>
                  setOrderInfo({
                    ...orderInfo,
                    people_count: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes
              </label>
              <input
                type="text"
                value={orderInfo.notes}
                onChange={(e) =>
                  setOrderInfo({ ...orderInfo, notes: e.target.value })
                }
                placeholder="Special requests"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder-muted-foreground"
              />
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-lg border backdrop-blur-sm ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Order Summary - Fixed at top when items exist */}
        {orderItems.length > 0 && (
          <div className="mb-12 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-english text-2xl text-foreground">
                Your Order
              </h3>
              <div className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {orderItems.map((item) => (
                <div
                  key={item.dish.id}
                  className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0"
                >
                  <div className="flex-1">
                    <span className="text-foreground font-medium">
                      {item.dish.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.dish.id, item.quantity - 1)
                      }
                      className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground smooth-transition"
                    >
                      -
                    </button>
                    <span className="text-foreground font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.dish.id, item.quantity + 1)
                      }
                      className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground smooth-transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromOrder(item.dish.id)}
                      className="w-8 h-8 text-red-400 hover:text-red-600 smooth-transition ml-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="w-full btn-elegant py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting Order..." : "Submit Order"}
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-6 py-2 rounded-full smooth-transition font-medium tracking-wide uppercase text-sm ${
                  selectedCategory === ""
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/50"
                }`}
              >
                All Dishes
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-6 py-2 rounded-full smooth-transition font-medium tracking-wide uppercase text-sm ${
                    selectedCategory === category.name
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary border border-border/50 hover:border-primary/50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">
              Loading our finest dishes...
            </p>
          </div>
        ) : Object.keys(groupedDishes).length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-12 border border-border/50 max-w-md mx-auto">
              <h3 className="font-english text-2xl text-foreground mb-4">
                No Dishes Available
              </h3>
              <p className="text-muted-foreground mb-6">
                We are currently updating our menu. Please check back soon.
              </p>
              <Link href="/" className="btn-elegant">
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedDishes).map(
              ([categoryName, categoryDishes]) => (
                <section key={categoryName} className="category-section">
                  {/* Category Header */}
                  <div className="text-center mb-12">
                    <h2 className="font-english text-3xl md:text-4xl text-primary mb-4">
                      {categoryName}
                    </h2>
                    <div className="w-16 h-px bg-primary mx-auto"></div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
                    {categoryDishes.map((dish) => {
                      const orderItem = orderItems.find(
                        (item) => item.dish.id === dish.id,
                      );
                      return (
                        <div key={dish.id} className="dish-item">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-english text-xl md:text-2xl text-foreground font-medium leading-tight">
                                {dish.name}
                              </h3>

                              {/* Dish Meta Info */}
                              <div className="flex items-center gap-4 mt-2 mb-4">
                                {dish.base_calories && (
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {dish.base_calories} Cal
                                  </span>
                                )}
                                {dish.preparation_time && (
                                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                    {dish.preparation_time} Min
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                  Serves {dish.servings}
                                </span>
                                {dish.is_customizable && (
                                  <span className="text-xs text-primary uppercase tracking-wider">
                                    Customizable
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Add to Order Controls */}
                            <div className="ml-6 flex items-center space-x-2 flex-shrink-0">
                              {orderItem ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        dish.id,
                                        orderItem.quantity - 1,
                                      )
                                    }
                                    className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 smooth-transition text-sm font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="text-foreground font-medium w-8 text-center">
                                    {orderItem.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        dish.id,
                                        orderItem.quantity + 1,
                                      )
                                    }
                                    className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/80 smooth-transition text-sm font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToOrder(dish)}
                                  className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-wider font-medium hover:bg-primary/80 smooth-transition"
                                >
                                  Add to Order
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Ingredients */}
                          {dish.ingredients && dish.ingredients.length > 0 && (
                            <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">
                              {formatIngredients(dish.ingredients)}
                            </p>
                          )}

                          {/* Cooking Description */}
                          {dish.cooking_steps && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {dish.cooking_steps}
                            </p>
                          )}

                          {/* Decorative Line */}
                          <div className="mt-6 pt-6 border-t border-border/30">
                            <div className="w-12 h-px bg-primary/30"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ),
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary smooth-transition font-medium flex items-center justify-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
