import Database from 'better-sqlite3';

// Global test database instance
let testDb: Database.Database | null = null;

// Setup before all tests
beforeAll(() => {
  // Create in-memory test database
  testDb = new Database(':memory:');
  
  // Create tables manually with the updated schema
  const createTables = `
    -- Enable foreign key constraints
    PRAGMA foreign_keys = ON;

    -- Users table
    CREATE TABLE users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        display_name TEXT,
        profile_public BOOLEAN DEFAULT FALSE,
        registration_method TEXT CHECK (registration_method IN ('email', 'google', 'github')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User OAuth table
    CREATE TABLE user_oauth (
        oauth_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        provider TEXT CHECK (provider IN ('google', 'github')) NOT NULL,
        provider_user_id TEXT NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(provider, provider_user_id)
    );

    -- Ingredients table with new schema
    CREATE TABLE ingredients (
        ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
        ingredient_key TEXT NOT NULL,
        name TEXT NOT NULL,
        unit TEXT,
        category TEXT CHECK (category IN ('vegetable', 'meat', 'dairy', 'grain', 'spice', 'fruit', 'other')),
        calories_per_unit REAL CHECK (calories_per_unit >= 0),
        language_code TEXT DEFAULT 'en' CHECK (language_code IN ('en', 'zh-CN')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Dishes table
    CREATE TABLE dishes (
        dish_id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        calories INTEGER CHECK (calories >= 0),
        meal TEXT CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'dessert')) NOT NULL,
        special BOOLEAN DEFAULT FALSE,
        url TEXT,
        visibility TEXT CHECK (visibility IN ('private', 'shared', 'public')) DEFAULT 'private',
        prep_time INTEGER,
        cook_time INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Dish shares table
    CREATE TABLE dish_shares (
        share_id INTEGER PRIMARY KEY AUTOINCREMENT,
        dish_id INTEGER NOT NULL,
        shared_by INTEGER NOT NULL,
        shared_with INTEGER NOT NULL,
        shared_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        can_reshare BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
        FOREIGN KEY (shared_by) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (shared_with) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(dish_id, shared_with)
    );

    -- Dish ingredients table
    CREATE TABLE dish_ingredients (
        dish_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL CHECK (quantity > 0),
        PRIMARY KEY (dish_id, ingredient_id),
        FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE
    );

    -- Dish tags table
    CREATE TABLE dish_tags (
        dish_id INTEGER NOT NULL,
        tag TEXT CHECK (tag IN ('drink', 'dessert', 'vegetable', 'meat', 'carbohydrate')) NOT NULL,
        PRIMARY KEY (dish_id, tag),
        FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE
    );

    -- Weekly meal plans table
    CREATE TABLE weekly_meal_plans (
        plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- Daily meal plans table
    CREATE TABLE daily_meal_plans (
        daily_plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
        weekly_plan_id INTEGER NOT NULL,
        day_of_week INTEGER CHECK (day_of_week >= 1 AND day_of_week <= 7) NOT NULL,
        UNIQUE(weekly_plan_id, day_of_week),
        FOREIGN KEY (weekly_plan_id) REFERENCES weekly_meal_plans(plan_id) ON DELETE CASCADE
    );

    -- Meal slots table
    CREATE TABLE meal_slots (
        slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_plan_id INTEGER NOT NULL,
        meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'dessert')) NOT NULL,
        slot_order INTEGER DEFAULT 1,
        UNIQUE(daily_plan_id, meal_type, slot_order),
        FOREIGN KEY (daily_plan_id) REFERENCES daily_meal_plans(daily_plan_id) ON DELETE CASCADE
    );

    -- Meal slot dishes table
    CREATE TABLE meal_slot_dishes (
        slot_id INTEGER NOT NULL,
        dish_id INTEGER NOT NULL,
        serving_size REAL DEFAULT 1.0,
        PRIMARY KEY (slot_id, dish_id),
        FOREIGN KEY (slot_id) REFERENCES meal_slots(slot_id) ON DELETE CASCADE,
        FOREIGN KEY (dish_id) REFERENCES dishes(dish_id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX idx_dishes_owner ON dishes(owner_id);
    CREATE INDEX idx_dishes_meal_type ON dishes(meal);
    CREATE INDEX idx_dishes_visibility ON dishes(visibility);
    CREATE INDEX idx_user_oauth_provider ON user_oauth(provider, provider_user_id);
    CREATE INDEX idx_dish_shares_shared_with ON dish_shares(shared_with);
    CREATE INDEX idx_meal_slots_daily_plan ON meal_slots(daily_plan_id);
    CREATE INDEX idx_ingredients_key ON ingredients(ingredient_key);
    CREATE INDEX idx_ingredients_language ON ingredients(language_code);
    CREATE INDEX idx_ingredients_key_lang ON ingredients(ingredient_key, language_code);
    CREATE UNIQUE INDEX idx_ingredients_name_lang_unique ON ingredients(name, language_code);

    -- Update triggers
    CREATE TRIGGER update_users_updated_at 
        AFTER UPDATE ON users
        FOR EACH ROW
        BEGIN
            UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
        END;

    CREATE TRIGGER update_dishes_updated_at 
        AFTER UPDATE ON dishes
        FOR EACH ROW
        BEGIN
            UPDATE dishes SET updated_at = CURRENT_TIMESTAMP WHERE dish_id = NEW.dish_id;
        END;

    CREATE TRIGGER update_ingredients_updated_at 
        AFTER UPDATE ON ingredients
        FOR EACH ROW
        BEGIN
            UPDATE ingredients SET updated_at = CURRENT_TIMESTAMP WHERE ingredient_id = NEW.ingredient_id;
        END;
  `;

  // Execute all table creation statements
  testDb.exec(createTables);
  
  console.log('✅ Test database initialized');
});

// Cleanup after all tests
afterAll(() => {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
  console.log('🧹 Test database cleaned up');
});

// Reset database before each test
beforeEach(() => {
  if (!testDb) return;
  
  // Clear all data but keep schema
  const tables = [
    'meal_slot_dishes',
    'meal_slots', 
    'daily_meal_plans',
    'weekly_meal_plans',
    'dish_tags',
    'dish_ingredients',
    'dish_shares',
    'dishes',
    'ingredients',
    'user_oauth',
    'users'
  ];
  
  tables.forEach(table => {
    try {
      testDb!.prepare(`DELETE FROM ${table}`).run();
    } catch (error) {
      // Table might not exist, ignore
    }
  });
});

// Export test database for use in tests
export const getTestDatabase = (): Database.Database => {
  if (!testDb) {
    throw new Error('Test database not initialized');
  }
  return testDb;
};