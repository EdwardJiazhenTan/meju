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
    name TEXT UNIQUE NOT NULL,
    unit TEXT,
    category TEXT CHECK (category IN ('vegetable', 'meat', 'dairy', 'grain', 'spice', 'fruit', 'other')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Insert sample data for testing

-- Sample ingredients
INSERT INTO ingredients (name, unit, category) VALUES 
    ('potato', 'piece', 'vegetable'),
    ('salt', 'gram', 'spice'),
    ('chicken breast', 'gram', 'meat'),
    ('rice', 'gram', 'grain'),
    ('onion', 'piece', 'vegetable'),
    ('garlic', 'clove', 'vegetable'),
    ('tomato', 'piece', 'vegetable'),
    ('olive oil', 'ml', 'other'),
    ('black pepper', 'gram', 'spice'),
    ('milk', 'ml', 'dairy');

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
