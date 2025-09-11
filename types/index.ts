export * from './database';

// Extended types for UI components
export interface DishWithIngredients extends Dish {
  ingredients: (DishIngredient & {
    ingredient: Ingredient;
    unit: IngredientUnit;
  })[];
  category?: Category;
}

export interface DishWithCustomizations extends Dish {
  customization_groups: (CustomizationGroup & {
    options: (CustomizationOption & {
      ingredient: Ingredient;
      unit?: IngredientUnit;
    })[];
  })[];
}

export interface MealPlanWithItems extends MealPlan {
  items: (MealItem & {
    dish: Dish;
  })[];
}

export interface WeeklyMealPlan {
  [date: string]: MealPlanWithItems[];
}

// Form types
export interface CreateDishData {
  name: string;
  cooking_steps?: string;
  category_id?: number;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
  ingredients: {
    ingredient_id: number;
    quantity: number;
    unit_id: number;
    is_optional: boolean;
  }[];
}

export interface CreateMealPlanData {
  date: string;
  meal_name: string;
  dish_id: number;
  customizations?: Record<string, any>;
  servings: number;
  notes?: string;
}

import type { 
  Category, 
  Dish, 
  IngredientUnit, 
  Ingredient, 
  DishIngredient, 
  CustomizationGroup, 
  CustomizationOption, 
  MealPlan, 
  MealItem, 
  WeeklyShoppingListItem 
} from './database';