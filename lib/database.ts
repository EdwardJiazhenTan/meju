import Database from "better-sqlite3";
import path from "path";

// Type definitions
export interface User {
  user_id: number;
  username: string | null;
  email: string;
  password_hash: string | null;
  display_name: string | null;
  profile_public: boolean;
  registration_method: "email" | "google" | "github";
  created_at: string;
  updated_at: string;
}

export interface Dish {
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

export interface Ingredient {
  ingredient_id: number;
  ingredient_key: string;
  name: string;
  unit: string | null;
  category:
    | "vegetable"
    | "meat"
    | "dairy"
    | "grain"
    | "spice"
    | "fruit"
    | "other"
    | null;
  calories_per_unit: number | null;
  language_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  username?: string;
  email: string;
  password_hash?: string;
  display_name?: string;
  registration_method: "email" | "google" | "github";
}

export interface UserOAuth {
  oauth_id: number;
  user_id: number;
  provider: "google" | "github";
  provider_user_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOAuthData {
  user_id: number;
  provider: "google" | "github";
  provider_user_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
}

export interface CreateDishData {
  owner_id: number;
  name: string;
  description?: string;
  calories?: number;
  meal: "breakfast" | "lunch" | "dinner" | "dessert";
  special?: boolean;
  url?: string;
  visibility?: "private" | "shared" | "public";
  prep_time?: number;
  cook_time?: number;
}

export interface MealPlanRow {
  plan_id: number;
  daily_plan_id: number | null;
  day_of_week: number | null;
  slot_id: number | null;
  meal_type: "breakfast" | "lunch" | "dinner" | "dessert" | null;
  slot_order: number | null;
  dish_id: number | null;
  dish_name: string | null;
  serving_size: number | null;
}

export interface DishIngredient {
  name: string;
  unit: string | null;
  quantity: number;
}

export interface CreateIngredientData {
  ingredient_key: string;
  name: string;
  unit?: string;
  category?: string;
  calories_per_unit?: number;
  language_code?: string;
}

let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), "meju.db");
    db = new Database(dbPath);

    // Enable foreign key constraints
    db.pragma("foreign_keys = ON");
  }
  return db;
}

// User operations
export const userQueries = {
  // Create user
  createUser: (userData: CreateUserData): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, registration_method)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      userData.username || null,
      userData.email,
      userData.password_hash || null,
      userData.display_name || null,
      userData.registration_method,
    );
  },

  // Get user by email
  getUserByEmail: (email: string): User | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email) as User | undefined;
  },

  // Get user by ID
  getUserById: (userId: number): User | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE user_id = ?");
    return stmt.get(userId) as User | undefined;
  },

  // Get user by OAuth provider
  getUserByOAuth: (provider: "google" | "github", providerUserId: string): User | undefined => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT u.* FROM users u
      JOIN user_oauth uo ON u.user_id = uo.user_id
      WHERE uo.provider = ? AND uo.provider_user_id = ?
    `);
    return stmt.get(provider, providerUserId) as User | undefined;
  },

  // Create OAuth record
  createOAuth: (oauthData: CreateOAuthData): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO user_oauth (user_id, provider, provider_user_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      oauthData.user_id,
      oauthData.provider,
      oauthData.provider_user_id,
      oauthData.access_token || null,
      oauthData.refresh_token || null,
      oauthData.expires_at || null
    );
  },

  // Update OAuth tokens
  updateOAuthTokens: (userId: number, provider: "google" | "github", accessToken?: string, refreshToken?: string, expiresAt?: string): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE user_oauth 
      SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND provider = ?
    `);
    return stmt.run(accessToken || null, refreshToken || null, expiresAt || null, userId, provider);
  },

  // Get user by username
  getUserByUsername: (username: string): User | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username) as User | undefined;
  },

  // Update user profile
  updateUserProfile: (userId: number, updateData: { username?: string; display_name?: string; profile_public?: boolean }): Database.RunResult => {
    const db = getDatabase();
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData).map(value => 
      typeof value === 'boolean' ? (value ? 1 : 0) : value
    );
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ?
    `);
    return stmt.run(...values, userId);
  },

  // Get user statistics
  getUserStats: (userId: number): { totalDishes: number; publicDishes: number; sharedDishes: number; dishesSharedWithMe: number } => {
    const db = getDatabase();
    
    const totalDishes = db.prepare("SELECT COUNT(*) as count FROM dishes WHERE owner_id = ?").get(userId) as { count: number };
    const publicDishes = db.prepare("SELECT COUNT(*) as count FROM dishes WHERE owner_id = ? AND visibility = 'public'").get(userId) as { count: number };
    const sharedDishes = db.prepare("SELECT COUNT(*) as count FROM dishes WHERE owner_id = ? AND visibility = 'shared'").get(userId) as { count: number };
    const dishesSharedWithMe = db.prepare("SELECT COUNT(*) as count FROM dish_shares WHERE shared_with = ?").get(userId) as { count: number };
    
    return {
      totalDishes: totalDishes.count,
      publicDishes: publicDishes.count,
      sharedDishes: sharedDishes.count,
      dishesSharedWithMe: dishesSharedWithMe.count,
    };
  },
};

// Dish operations
export const dishQueries = {
  // Create dish
  createDish: (dishData: CreateDishData): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO dishes (owner_id, name, description, calories, meal, special, url, visibility, prep_time, cook_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      dishData.owner_id,
      dishData.name,
      dishData.description || null,
      dishData.calories || null,
      dishData.meal,
      dishData.special ? 1 : 0,
      dishData.url || null,
      dishData.visibility || "private",
      dishData.prep_time || null,
      dishData.cook_time || null,
    );
  },

  // Get user's dishes
  getUserDishes: (userId: number): Dish[] => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM dishes WHERE owner_id = ?");
    return stmt.all(userId) as Dish[];
  },

  // Get dish by ID
  getDishById: (dishId: number): Dish | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM dishes WHERE dish_id = ?");
    return stmt.get(dishId) as Dish | undefined;
  },

  // Get public dishes for discovery
  getPublicDishes: (limit = 20, offset = 0): Array<Dish & { owner_name: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT d.*, u.display_name as owner_name 
      FROM dishes d 
      JOIN users u ON d.owner_id = u.user_id 
      WHERE d.visibility = 'public'
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as Array<Dish & { owner_name: string }>;
  },

  // Search public dishes
  searchPublicDishes: (searchTerm: string, limit = 20, offset = 0): Array<Dish & { owner_name: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT d.*, u.display_name as owner_name 
      FROM dishes d 
      JOIN users u ON d.owner_id = u.user_id 
      WHERE d.visibility = 'public' AND (
        LOWER(d.name) LIKE LOWER(?) OR 
        LOWER(d.description) LIKE LOWER(?)
      )
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const searchPattern = `%${searchTerm}%`;
    return stmt.all(searchPattern, searchPattern, limit, offset) as Array<Dish & { owner_name: string }>;
  },

  // Get public dishes by meal type
  getPublicDishesByMeal: (meal: string, limit = 20, offset = 0): Array<Dish & { owner_name: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT d.*, u.display_name as owner_name 
      FROM dishes d 
      JOIN users u ON d.owner_id = u.user_id 
      WHERE d.visibility = 'public' AND d.meal = ?
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(meal, limit, offset) as Array<Dish & { owner_name: string }>;
  },

  // Get public dishes by tag
  getPublicDishesByTag: (tag: string, limit = 20, offset = 0): Array<Dish & { owner_name: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT DISTINCT d.*, u.display_name as owner_name 
      FROM dishes d 
      JOIN users u ON d.owner_id = u.user_id 
      JOIN dish_tags dt ON d.dish_id = dt.dish_id
      WHERE d.visibility = 'public' AND dt.tag = ?
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(tag, limit, offset) as Array<Dish & { owner_name: string }>;
  },

  // Share dish with user
  shareDish: (dishId: number, sharedBy: number, sharedWith: number, canReshare: boolean): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO dish_shares (dish_id, shared_by, shared_with, can_reshare)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(dishId, sharedBy, sharedWith, canReshare ? 1 : 0);
  },

  // Get dish share info
  getDishShare: (dishId: number, userId: number): { share_id: number; can_reshare: boolean; shared_date: string } | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM dish_shares WHERE dish_id = ? AND shared_with = ?");
    return stmt.get(dishId, userId) as { share_id: number; can_reshare: boolean; shared_date: string } | undefined;
  },

  // Get all shares for a dish
  getDishShares: (dishId: number): Array<{ share_id: number; email: string; display_name: string; username: string; can_reshare: boolean; shared_date: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ds.*, u.email, u.display_name, u.username
      FROM dish_shares ds
      JOIN users u ON ds.shared_with = u.user_id
      WHERE ds.dish_id = ?
      ORDER BY ds.shared_date DESC
    `);
    return stmt.all(dishId) as Array<{ share_id: number; email: string; display_name: string; username: string; can_reshare: boolean; shared_date: string }>;
  },

  // Get dishes shared with user
  getSharedWithUser: (userId: number, limit = 20, offset = 0): Array<Dish & { owner_name: string; shared_date: string }> => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT d.*, u.display_name as owner_name, ds.shared_date, ds.can_reshare
      FROM dishes d
      JOIN users u ON d.owner_id = u.user_id
      JOIN dish_shares ds ON d.dish_id = ds.dish_id
      WHERE ds.shared_with = ?
      ORDER BY ds.shared_date DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset) as Array<Dish & { owner_name: string; shared_date: string }>;
  },

  // Update dish
  updateDish: (dishId: number, updateData: Partial<CreateDishData>): Database.RunResult => {
    const db = getDatabase();
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData).map(value => 
      typeof value === 'boolean' ? (value ? 1 : 0) : value
    );
    
    const stmt = db.prepare(`
      UPDATE dishes 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE dish_id = ?
    `);
    return stmt.run(...values, dishId);
  },

  // Delete dish
  deleteDish: (dishId: number): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM dishes WHERE dish_id = ?");
    return stmt.run(dishId);
  },

  // Get dish tags
  getDishTags: (dishId: number): string[] => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT tag FROM dish_tags WHERE dish_id = ? ORDER BY tag");
    const results = stmt.all(dishId) as { tag: string }[];
    return results.map(row => row.tag);
  },

  // Add tag to dish
  addTagToDish: (dishId: number, tag: string): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare("INSERT INTO dish_tags (dish_id, tag) VALUES (?, ?)");
    return stmt.run(dishId, tag);
  },

  // Remove tag from dish
  removeTagFromDish: (dishId: number, tag: string): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM dish_tags WHERE dish_id = ? AND tag = ?");
    return stmt.run(dishId, tag);
  },

  // Get dish ingredients
  getDishIngredients: (dishId: number): DishIngredient[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT i.name, i.unit, di.quantity
      FROM dish_ingredients di
      JOIN ingredients i ON di.ingredient_id = i.ingredient_id
      WHERE di.dish_id = ?
    `);
    return stmt.all(dishId) as DishIngredient[];
  },

  // Get specific dish ingredient relationship
  getDishIngredientById: (dishId: number, ingredientId: number): { quantity: number } | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT quantity FROM dish_ingredients WHERE dish_id = ? AND ingredient_id = ?");
    return stmt.get(dishId, ingredientId) as { quantity: number } | undefined;
  },

  // Add ingredient to dish
  addIngredientToDish: (dishId: number, ingredientId: number, quantity: number): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
      VALUES (?, ?, ?)
    `);
    return stmt.run(dishId, ingredientId, quantity);
  },

  // Update ingredient quantity in dish
  updateDishIngredientQuantity: (dishId: number, ingredientId: number, quantity: number): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE dish_ingredients 
      SET quantity = ?
      WHERE dish_id = ? AND ingredient_id = ?
    `);
    return stmt.run(quantity, dishId, ingredientId);
  },

  // Remove ingredient from dish
  removeIngredientFromDish: (dishId: number, ingredientId: number): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM dish_ingredients WHERE dish_id = ? AND ingredient_id = ?");
    return stmt.run(dishId, ingredientId);
  },
};

// Meal planning operations
export const mealPlanQueries = {
  // Initialize user's meal plan (called after user registration)
  initializeUserMealPlan: (userId: number): number => {
    const db = getDatabase();

    // Create weekly meal plan
    const weeklyStmt = db.prepare(
      "INSERT INTO weekly_meal_plans (user_id) VALUES (?)",
    );
    const weeklyResult = weeklyStmt.run(userId);
    const weeklyPlanId = weeklyResult.lastInsertRowid as number;

    // Create 7 daily meal plans
    const dailyStmt = db.prepare(
      "INSERT INTO daily_meal_plans (weekly_plan_id, day_of_week) VALUES (?, ?)",
    );
    for (let day = 1; day <= 7; day++) {
      dailyStmt.run(weeklyPlanId, day);
    }

    return weeklyPlanId;
  },

  // Get user's weekly meal plan
  getUserMealPlan: (userId: number): MealPlanRow[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        wmp.plan_id,
        dmp.daily_plan_id,
        dmp.day_of_week,
        ms.slot_id,
        ms.meal_type,
        ms.slot_order,
        d.dish_id,
        d.name as dish_name,
        msd.serving_size
      FROM weekly_meal_plans wmp
      LEFT JOIN daily_meal_plans dmp ON wmp.plan_id = dmp.weekly_plan_id
      LEFT JOIN meal_slots ms ON dmp.daily_plan_id = ms.daily_plan_id
      LEFT JOIN meal_slot_dishes msd ON ms.slot_id = msd.slot_id
      LEFT JOIN dishes d ON msd.dish_id = d.dish_id
      WHERE wmp.user_id = ?
      ORDER BY dmp.day_of_week, ms.meal_type, ms.slot_order
    `);
    return stmt.all(userId) as MealPlanRow[];
  },

  // Organize meal plan data into a structured format
  organizeMealPlan: (mealPlanRows: MealPlanRow[]): Record<number, Record<string, Array<{ dish_id: number; dish_name: string; serving_size: number; slot_id: number }>>> => {
    const organized: Record<number, Record<string, Array<{ dish_id: number; dish_name: string; serving_size: number; slot_id: number }>>> = {};
    
    // Initialize all days
    for (let day = 1; day <= 7; day++) {
      organized[day] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        dessert: [],
      };
    }
    
    // Populate with actual data
    mealPlanRows.forEach(row => {
      if (row.day_of_week && row.meal_type && row.dish_id) {
        organized[row.day_of_week][row.meal_type].push({
          dish_id: row.dish_id,
          dish_name: row.dish_name,
          serving_size: row.serving_size,
          slot_id: row.slot_id,
        });
      }
    });
    
    return organized;
  },

  // Check if user has access to dish (owns it, it's public, or shared with them)
  userHasAccessToDish: async (userId: number, dishId: number): Promise<boolean> => {
    const db = getDatabase();
    
    // Check if user owns the dish
    const ownedDish = db.prepare("SELECT dish_id FROM dishes WHERE dish_id = ? AND owner_id = ?").get(dishId, userId);
    if (ownedDish) return true;
    
    // Check if dish is public
    const publicDish = db.prepare("SELECT dish_id FROM dishes WHERE dish_id = ? AND visibility = 'public'").get(dishId);
    if (publicDish) return true;
    
    // Check if dish is shared with user
    const sharedDish = db.prepare("SELECT dish_id FROM dish_shares WHERE dish_id = ? AND shared_with = ?").get(dishId, userId);
    if (sharedDish) return true;
    
    return false;
  },

  // Add dish to meal plan
  addDishToMealPlan: (userId: number, dayOfWeek: number, mealType: string, dishId: number, servingSize: number): Database.RunResult => {
    const db = getDatabase();
    
    // Get user's daily plan for the specific day
    const dailyPlan = db.prepare(`
      SELECT dmp.daily_plan_id 
      FROM weekly_meal_plans wmp
      JOIN daily_meal_plans dmp ON wmp.plan_id = dmp.weekly_plan_id
      WHERE wmp.user_id = ? AND dmp.day_of_week = ?
    `).get(userId, dayOfWeek) as { daily_plan_id: number } | undefined;
    
    if (!dailyPlan) {
      throw new Error("Daily meal plan not found");
    }
    
    // Create or get meal slot
    let mealSlot = db.prepare(`
      SELECT slot_id FROM meal_slots 
      WHERE daily_plan_id = ? AND meal_type = ? AND slot_order = 1
    `).get(dailyPlan.daily_plan_id, mealType) as { slot_id: number } | undefined;
    
    if (!mealSlot) {
      // Create meal slot
      const slotResult = db.prepare(`
        INSERT INTO meal_slots (daily_plan_id, meal_type, slot_order)
        VALUES (?, ?, 1)
      `).run(dailyPlan.daily_plan_id, mealType);
      
      const slotId = slotResult.lastInsertRowid as number;
      mealSlot = { slot_id: slotId };
    }
    
    // Add dish to meal slot
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO meal_slot_dishes (slot_id, dish_id, serving_size)
      VALUES (?, ?, ?)
    `);
    return stmt.run(mealSlot.slot_id, dishId, servingSize);
  },
};

// Ingredient operations
export const ingredientQueries = {
  // Get all ingredients
  getAllIngredients: (): Ingredient[] => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients ORDER BY name");
    return stmt.all() as Ingredient[];
  },

  // Get ingredient by ID
  getIngredientById: (ingredientId: number): Ingredient | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE ingredient_id = ?");
    return stmt.get(ingredientId) as Ingredient | undefined;
  },

  // Get ingredient by name
  getIngredientByName: (name: string): Ingredient | undefined => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE LOWER(name) = LOWER(?)");
    return stmt.get(name) as Ingredient | undefined;
  },

  // Search ingredients by name
  searchIngredients: (searchTerm: string): Ingredient[] => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE LOWER(name) LIKE LOWER(?) ORDER BY name");
    return stmt.all(`%${searchTerm}%`) as Ingredient[];
  },

  // Get ingredients by category
  getIngredientsByCategory: (category: string): Ingredient[] => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE category = ? ORDER BY name");
    return stmt.all(category) as Ingredient[];
  },

  // Get ingredients grouped by categories
  getIngredientsByCategories: (): Record<string, Ingredient[]> => {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients ORDER BY category, name");
    const allIngredients = stmt.all() as Ingredient[];
    
    const categorized: Record<string, Ingredient[]> = {};
    allIngredients.forEach(ingredient => {
      const category = ingredient.category || 'other';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(ingredient);
    });
    
    return categorized;
  },

  // Create new ingredient
  createIngredient: (ingredientData: CreateIngredientData): Database.RunResult => {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      ingredientData.ingredient_key,
      ingredientData.name,
      ingredientData.unit || null,
      ingredientData.category || null,
      ingredientData.calories_per_unit || null,
      ingredientData.language_code || 'en'
    );
  },

  // Get ingredients by language with fallback to English
  getIngredientsByLanguage: (languageCode: string = 'en'): Ingredient[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ingredients 
      WHERE language_code = ?
      ORDER BY name
    `);
    return stmt.all(languageCode) as Ingredient[];
  },

  // Get ingredient by key and language (with English fallback)
  getIngredientByKey: (ingredientKey: string, languageCode: string = 'en'): Ingredient | undefined => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ingredients 
      WHERE ingredient_key = ? AND language_code = ?
      UNION
      SELECT * FROM ingredients 
      WHERE ingredient_key = ? AND language_code = 'en' AND NOT EXISTS (
        SELECT 1 FROM ingredients WHERE ingredient_key = ? AND language_code = ?
      )
      LIMIT 1
    `);
    return stmt.get(ingredientKey, languageCode, ingredientKey, ingredientKey, languageCode) as Ingredient | undefined;
  },

  // Search ingredients across languages with fuzzy matching
  searchIngredientsWithFTS: (searchTerm: string, languageCode: string = 'en'): Ingredient[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT i.* FROM ingredients i
      JOIN ingredients_fts fts ON i.ingredient_id = fts.ingredient_id
      WHERE ingredients_fts MATCH ? AND (i.language_code = ? OR i.language_code = 'en')
      ORDER BY 
        CASE WHEN i.language_code = ? THEN 0 ELSE 1 END,
        rank
    `);
    return stmt.all(searchTerm, languageCode, languageCode) as Ingredient[];
  },

  // Get all ingredient keys (for finding missing translations)
  getAllIngredientKeys: (): { ingredient_key: string; languages: string[] }[] => {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ingredient_key, GROUP_CONCAT(language_code) as languages
      FROM ingredients 
      GROUP BY ingredient_key
      ORDER BY ingredient_key
    `);
    const results = stmt.all() as { ingredient_key: string; languages: string }[];
    return results.map(row => ({
      ingredient_key: row.ingredient_key,
      languages: row.languages.split(',')
    }));
  },
};

export default getDatabase;
