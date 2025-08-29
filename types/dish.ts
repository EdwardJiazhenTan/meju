export interface DishDetail {
  dish_id: number;
  owner_id: number;
  name: string;
  description: string | null;
  calories: number | null;
  meal: "breakfast" | "lunch" | "dinner" | "dessert";
  special: boolean;
  url: string | null;
  visibility: "private" | "shared" | "public";
  prep_time: number | null;
  cook_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface DishIngredient {
  name: string;
  unit: string | null;
  quantity: number;
}

export interface DishData {
  dish: DishDetail;
  ingredients: DishIngredient[];
  tags: string[];
}

// API Response types for better type safety
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DishApiResponse {
  dish: DishDetail;
}

export interface IngredientsApiResponse {
  dishId: number;
  dishName: string;
  ingredients: DishIngredient[];
  totalIngredients: number;
}

export interface TagsApiResponse {
  dishId: number;
  dishName: string;
  tags: string[];
  totalTags: number;
}