-- Migration script to upgrade existing ingredients table
-- Run this script on existing database to add multi-language support and calories

BEGIN TRANSACTION;

-- Create new ingredients table with updated schema
CREATE TABLE ingredients_new (
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

-- Copy existing data to new table (assuming all existing data is English)
INSERT INTO ingredients_new (ingredient_id, ingredient_key, name, unit, category, calories_per_unit, language_code, created_at)
SELECT 
    ingredient_id,
    LOWER(REPLACE(name, ' ', '_')) as ingredient_key,  -- Generate key from name
    name,
    unit,
    category,
    NULL as calories_per_unit,  -- Will need to be populated manually
    'en' as language_code,
    created_at
FROM ingredients;

-- Drop old table and rename new one
DROP TABLE ingredients;
ALTER TABLE ingredients_new RENAME TO ingredients;

-- Create new indexes
CREATE INDEX idx_ingredients_key ON ingredients(ingredient_key);
CREATE INDEX idx_ingredients_language ON ingredients(language_code);
CREATE INDEX idx_ingredients_key_lang ON ingredients(ingredient_key, language_code);
CREATE UNIQUE INDEX idx_ingredients_name_lang_unique ON ingredients(name, language_code);

-- Add trigger for updated_at
CREATE TRIGGER update_ingredients_updated_at 
    AFTER UPDATE ON ingredients
    FOR EACH ROW
    BEGIN
        UPDATE ingredients SET updated_at = CURRENT_TIMESTAMP WHERE ingredient_id = NEW.ingredient_id;
    END;

-- Create FTS tables
CREATE VIRTUAL TABLE ingredients_fts USING fts5(
    ingredient_id UNINDEXED,
    ingredient_key UNINDEXED,
    name,
    language_code UNINDEXED,
    content='ingredients',
    content_rowid='ingredient_id'
);

-- Populate FTS with existing data
INSERT INTO ingredients_fts(ingredient_id, ingredient_key, name, language_code) 
SELECT ingredient_id, ingredient_key, name, language_code FROM ingredients;

-- Create FTS sync triggers
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

-- Insert some sample Chinese translations (optional)
INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES 
    ('potato', '土豆', '个', 'vegetable', 77, 'zh-CN'),
    ('salt', '盐', '克', 'spice', 0, 'zh-CN'),
    ('chicken_breast', '鸡胸肉', '克', 'meat', 165, 'zh-CN'),
    ('rice', '米饭', '克', 'grain', 130, 'zh-CN'),
    ('onion', '洋葱', '个', 'vegetable', 40, 'zh-CN'),
    ('garlic', '蒜', '瓣', 'vegetable', 4, 'zh-CN'),
    ('tomato', '西红柿', '个', 'vegetable', 18, 'zh-CN'),
    ('olive_oil', '橄榄油', '毫升', 'other', 884, 'zh-CN'),
    ('black_pepper', '黑胡椒', '克', 'spice', 251, 'zh-CN'),
    ('milk', '牛奶', '毫升', 'dairy', 42, 'zh-CN');

COMMIT;

-- Post-migration notes:
-- 1. Update calories_per_unit values for existing English ingredients
-- 2. Add more Chinese translations as needed
-- 3. Test FTS search functionality
-- 4. Update application code to use new multi-language functions
