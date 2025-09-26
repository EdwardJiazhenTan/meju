"use client";

import { useState, useEffect } from "react";
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

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchDishes();
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [selectedCategory]);

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
        const numQuantity = Number(ing.quantity) || 0;
        const quantity =
          numQuantity % 1 === 0 ? numQuantity : numQuantity.toFixed(1);
        const optional = ing.is_optional ? " (optional)" : "";
        return `${ing.ingredient_name} ${quantity}${unit}${optional}`;
      })
      .join(", ");
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
            Our Menu
          </h1>
          <div className="font-chinese text-2xl md:text-3xl text-foreground mb-8">
            我们的菜单
          </div>
          <div className="w-24 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Carefully curated dishes crafted with the finest ingredients and
            traditional techniques
          </p>
        </div>

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
                    {categoryDishes.map((dish) => (
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

                          {/* Order Button */}
                          <Link
                            href={`/order?dish=${encodeURIComponent(dish.name)}`}
                            className="ml-6 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs uppercase tracking-wider font-medium hover:bg-primary/90 smooth-transition flex-shrink-0"
                          >
                            Order
                          </Link>
                        </div>

                        {/* Ingredients */}
                        {dish.ingredients && dish.ingredients.length > 0 && (
                          <p className="text-muted-foreground text-sm leading-relaxed italic mb-4">
                            {formatIngredients(dish.ingredients)}
                          </p>
                        )}

                        {/* Decorative Line */}
                        <div className="mt-6 pt-6 border-t border-border/30">
                          <div className="w-12 h-px bg-primary/30"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ),
            )}
          </div>
        )}

        {/* Bottom Action */}
        {!loading && Object.keys(groupedDishes).length > 0 && (
          <div className="text-center mt-20 pt-16 border-t border-border/30">
            <div className="mb-8">
              <div className="font-chinese text-2xl text-foreground mb-2">
                开始您的用餐体验
              </div>
              <p className="text-muted-foreground">
                Ready to begin your culinary journey?
              </p>
            </div>
            <Link href="/order" className="btn-elegant text-lg px-8 py-4">
              Start Your Order
            </Link>
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
