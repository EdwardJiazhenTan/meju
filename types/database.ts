export interface Category {
  id: number;
  name: string;
  display_order?: number;
  created_at: Date;
}

export interface Dish {
  id: number;
  name: string;
  cooking_steps?: string;
  category_id?: number;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
  created_at: Date;
}

export interface IngredientUnit {
  id: number;
  name: string;
  abbreviation?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
  created_at: Date;
}

export interface DishIngredient {
  id: number;
  dish_id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional: boolean;
}

export interface CustomizationGroup {
  id: number;
  dish_id: number;
  name: string;
  type: "single" | "multiple" | "quantity";
  is_required: boolean;
  display_order?: number;
}

export interface CustomizationOption {
  id: number;
  group_id: number;
  ingredient_id: number;
  name: string;
  default_quantity?: number;
  unit_id?: number;
  display_order?: number;
}

export interface Order {
  id: number;
  user_name: string;
  order_date: Date;
  meal_type: string;
  dish_name: string;
  people_count: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
  created_at: Date;
}

export interface MealPlan {
  id: number;
  user_name?: string;
  date: Date;
  meal_name?: string;
  created_at: Date;
}

export interface MealItem {
  id: number;
  meal_plan_id: number;
  dish_id: number;
  customizations?: Record<string, any>;
  servings: number;
  notes?: string;
}

export interface WeeklyShoppingListItem {
  ingredient_name: string;
  unit_name: string;
  unit_abbrev: string;
  total_quantity: number;
}
