// API client for frontend-backend communication

const API_BASE = '/api';

interface User {
  user_id: number;
  email: string;
  username?: string;
  display_name?: string;
  created_at: string;
}

interface Dish {
  dish_id: number;
  name: string;
  description?: string;
  meal: string;
  calories?: number;
  prep_time?: number;
  cook_time?: number;
}

interface MealPlanData {
  [day: number]: {
    [mealType: string]: Array<{
      dish_id: number;
      dish_name: string;
      serving_size: number;
      slot_id: number;
    }>;
  };
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}

export class ApiClient {
  private static token: string | null = null;

  static setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  static getToken(): string | null {
    if (this.token) return this.token;
    
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
    return this.token;
  }

  static clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }

  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Authentication
  static async login(email: string, password: string) {
    const response = await this.makeRequest<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  static async register(userData: {
    email: string;
    password: string;
    username?: string;
    displayName?: string;
  }) {
    const response = await this.makeRequest<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  static async getCurrentUser() {
    return this.makeRequest<{ user: User }>('/auth/me');
  }

  // Dishes
  static async getUserDishes() {
    return this.makeRequest<{ dishes: Dish[] }>('/dishes');
  }

  static async createDish(dishData: {
    name: string;
    description?: string;
    meal: string;
    calories?: number;
    prep_time?: number;
    cook_time?: number;
  }) {
    return this.makeRequest<{ dish: Dish }>('/dishes', {
      method: 'POST',
      body: JSON.stringify(dishData),
    });
  }

  // Meal Plans
  static async getMealPlan() {
    return this.makeRequest<{ mealPlan: MealPlanData }>('/meal-plans');
  }

  static async addDishToMealPlan(dayOfWeek: number, mealType: string, dishId: number, servingSize: number = 1.0) {
    return this.makeRequest(`/meal-plans/${dayOfWeek}`, {
      method: 'POST',
      body: JSON.stringify({
        dishId,
        mealType,
        servingSize,
      }),
    });
  }

  // Ingredients
  static async getAllIngredients() {
    return this.makeRequest('/ingredients');
  }

  static async searchIngredients(searchTerm: string) {
    return this.makeRequest(`/ingredients?q=${encodeURIComponent(searchTerm)}`);
  }

  static async createIngredient(ingredientData: {
    name: string;
    unit?: string;
    category?: string;
  }) {
    return this.makeRequest('/ingredients', {
      method: 'POST',
      body: JSON.stringify(ingredientData),
    });
  }
}