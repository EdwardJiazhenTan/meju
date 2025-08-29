-- The original SQLite Test Database Setup Script
-- Run this to create your local test database

-- Enable foreign key constraints in SQLite
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
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
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

-- Ingredients table
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

-- Weekly meal plans table (one per user)
CREATE TABLE weekly_meal_plans (
    plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Daily meal plans table (7 per user)
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

-- Create indexes for better performance
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

-- Trigger to automatically update updated_at timestamp
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

CREATE TRIGGER update_weekly_meal_plans_updated_at 
    AFTER UPDATE ON weekly_meal_plans
    FOR EACH ROW
    BEGIN
        UPDATE weekly_meal_plans SET updated_at = CURRENT_TIMESTAMP WHERE plan_id = NEW.plan_id;
    END;

CREATE TRIGGER update_ingredients_updated_at 
    AFTER UPDATE ON ingredients
    FOR EACH ROW
    BEGIN
        UPDATE ingredients SET updated_at = CURRENT_TIMESTAMP WHERE ingredient_id = NEW.ingredient_id;
    END;

-- Insert sample data for testing

-- Sample ingredients (English and Chinese)
INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES 
    ('potato', 'potato', 'piece', 'vegetable', 77, 'en'),
    ('potato', '土豆', '个', 'vegetable', 77, 'zh-CN'),
    ('salt', 'salt', 'gram', 'spice', 0, 'en'),
    ('salt', '盐', '克', 'spice', 0, 'zh-CN'),
    ('chicken_breast', 'chicken breast', 'gram', 'meat', 165, 'en'),
    ('chicken_breast', '鸡胸肉', '克', 'meat', 165, 'zh-CN'),
    ('rice', 'rice', 'gram', 'grain', 130, 'en'),
    ('rice', '米饭', '克', 'grain', 130, 'zh-CN'),
    ('onion', 'onion', 'piece', 'vegetable', 40, 'en'),
    ('onion', '洋葱', '个', 'vegetable', 40, 'zh-CN'),
    ('garlic', 'garlic', 'clove', 'vegetable', 4, 'en'),
    ('garlic', '蒜', '瓣', 'vegetable', 4, 'zh-CN'),
    ('tomato', 'tomato', 'piece', 'vegetable', 18, 'en'),
    ('tomato', '西红柿', '个', 'vegetable', 18, 'zh-CN'),
    ('olive_oil', 'olive oil', 'ml', 'other', 884, 'en'),
    ('olive_oil', '橄榄油', '毫升', 'other', 884, 'zh-CN'),
    ('black_pepper', 'black pepper', 'gram', 'spice', 251, 'en'),
    ('black_pepper', '黑胡椒', '克', 'spice', 251, 'zh-CN'),
    ('milk', 'milk', 'ml', 'dairy', 42, 'en'),
    ('milk', '牛奶', '毫升', 'dairy', 42, 'zh-CN');

-- Sample user (email registration)
INSERT INTO users (username, email, password_hash, display_name, registration_method) VALUES 
    ('testuser', 'test@example.com', '$2b$10$hashedpassword', 'Test User', 'email');

-- Create default weekly meal plan for the user
INSERT INTO weekly_meal_plans (user_id) VALUES (1);

-- Create 7 daily meal plans (Monday to Sunday)
INSERT INTO daily_meal_plans (weekly_plan_id, day_of_week) VALUES 
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);

-- Sample dish
INSERT INTO dishes (owner_id, name, description, calories, meal, visibility, prep_time, cook_time) VALUES 
    (1, 'Grilled Chicken with Rice', 'Healthy protein-rich meal', 450, 'lunch', 'private', 15, 25);

-- Sample dish ingredients
INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity) VALUES 
    (1, 3, 200), -- 200g chicken breast
    (1, 4, 150), -- 150g rice
    (1, 2, 5),   -- 5g salt
    (1, 8, 10);  -- 10ml olive oil

-- Sample dish tags
INSERT INTO dish_tags (dish_id, tag) VALUES 
    (1, 'meat'),
    (1, 'carbohydrate');

-- Sample meal slot (Monday lunch)
INSERT INTO meal_slots (daily_plan_id, meal_type, slot_order) VALUES (1, 'lunch', 1);

-- Assign dish to meal slot
INSERT INTO meal_slot_dishes (slot_id, dish_id, serving_size) VALUES (1, 1, 1.0);

-- Full-text search tables for fuzzy search
CREATE VIRTUAL TABLE ingredients_fts USING fts5(
    ingredient_id UNINDEXED,
    ingredient_key UNINDEXED,
    name,
    language_code UNINDEXED,
    content='ingredients',
    content_rowid='ingredient_id'
);

CREATE VIRTUAL TABLE dishes_fts USING fts5(
    dish_id UNINDEXED,
    name,
    description,
    content='dishes',
    content_rowid='dish_id'
);

-- FTS sync triggers for ingredients
CREATE TRIGGER ingredients_fts_insert AFTER INSERT ON ingredients BEGIN
    INSERT INTO ingredients_fts(ingredient_id, ingredient_key, name, language_code) 
    VALUES (new.ingredient_id, new.ingredient_key, new.name, new.language_code);
END;

CREATE TRIGGER ingredients_fts_delete AFTER DELETE ON ingredients BEGIN
    DELETE FROM ingredients_fts WHERE ingredient_id = old.ingredient_id;
END;

CREATE TRIGGER ingredients_fts_update AFTER UPDATE ON ingredients BEGIN
    DELETE FROM ingredients_fts WHERE ingredient_id = old.ingredient_id;
    INSERT INTO ingredients_fts(ingredient_id, ingredient_key, name, language_code) 
    VALUES (new.ingredient_id, new.ingredient_key, new.name, new.language_code);
END;

-- FTS sync triggers for dishes
CREATE TRIGGER dishes_fts_insert AFTER INSERT ON dishes BEGIN
    INSERT INTO dishes_fts(dish_id, name, description) 
    VALUES (new.dish_id, new.name, new.description);
END;

CREATE TRIGGER dishes_fts_delete AFTER DELETE ON dishes BEGIN
    DELETE FROM dishes_fts WHERE dish_id = old.dish_id;
END;

CREATE TRIGGER dishes_fts_update AFTER UPDATE ON dishes BEGIN
    DELETE FROM dishes_fts WHERE dish_id = old.dish_id;
    INSERT INTO dishes_fts(dish_id, name, description) 
    VALUES (new.dish_id, new.name, new.description);
END;
