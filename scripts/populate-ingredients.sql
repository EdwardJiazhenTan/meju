-- Script to populate ingredients table with English and Chinese ingredients with calorie data
-- Run this script to add comprehensive ingredient data to your database

-- First, let's update existing English ingredients with calorie data
UPDATE ingredients SET calories_per_unit = 25 WHERE name = 'tomato' AND language_code = 'en';
UPDATE ingredients SET calories_per_unit = 180 WHERE name = 'chicken breast' AND language_code = 'en';
UPDATE ingredients SET calories_per_unit = 130 WHERE name = 'rice' AND language_code = 'en';

-- Insert comprehensive English ingredients with calories (per 100g unless specified)
INSERT OR REPLACE INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES
-- Vegetables (calories per 100g)
('tomato', 'tomato', 'g', 'vegetable', 18, 'en'),
('carrot', 'carrot', 'g', 'vegetable', 41, 'en'),
('onion', 'onion', 'g', 'vegetable', 40, 'en'),
('garlic', 'garlic', 'g', 'vegetable', 149, 'en'),
('ginger', 'ginger', 'g', 'vegetable', 80, 'en'),
('potato', 'potato', 'g', 'vegetable', 77, 'en'),
('bell_pepper', 'bell pepper', 'g', 'vegetable', 31, 'en'),
('cabbage', 'cabbage', 'g', 'vegetable', 25, 'en'),
('broccoli', 'broccoli', 'g', 'vegetable', 34, 'en'),
('spinach', 'spinach', 'g', 'vegetable', 23, 'en'),
('cucumber', 'cucumber', 'g', 'vegetable', 16, 'en'),
('mushroom', 'mushroom', 'g', 'vegetable', 22, 'en'),

-- Meats (calories per 100g)
('chicken_breast', 'chicken breast', 'g', 'meat', 165, 'en'),
('beef', 'beef', 'g', 'meat', 250, 'en'),
('pork', 'pork', 'g', 'meat', 242, 'en'),
('fish_salmon', 'salmon', 'g', 'meat', 208, 'en'),
('shrimp', 'shrimp', 'g', 'meat', 99, 'en'),
('egg', 'egg', 'piece', 'meat', 78, 'en'),  -- per piece (50g egg)

-- Grains & Starches (calories per 100g)
('rice', 'rice', 'g', 'grain', 130, 'en'),
('noodles', 'noodles', 'g', 'grain', 138, 'en'),
('bread', 'bread', 'slice', 'grain', 265, 'en'),  -- per 100g
('flour', 'flour', 'g', 'grain', 364, 'en'),
('oats', 'oats', 'g', 'grain', 389, 'en'),

-- Dairy (calories per 100g/ml)
('milk', 'milk', 'ml', 'dairy', 42, 'en'),
('cheese', 'cheese', 'g', 'dairy', 113, 'en'),
('yogurt', 'yogurt', 'g', 'dairy', 59, 'en'),
('butter', 'butter', 'g', 'dairy', 717, 'en'),

-- Oils & Fats (calories per 100ml/g)
('olive_oil', 'olive oil', 'ml', 'other', 884, 'en'),
('vegetable_oil', 'vegetable oil', 'ml', 'other', 884, 'en'),

-- Fruits (calories per 100g)
('apple', 'apple', 'g', 'fruit', 52, 'en'),
('banana', 'banana', 'g', 'fruit', 89, 'en'),
('orange', 'orange', 'g', 'fruit', 47, 'en'),
('lemon', 'lemon', 'g', 'fruit', 29, 'en'),

-- Spices & Seasonings (calories per 100g)
('salt', 'salt', 'g', 'spice', 0, 'en'),
('black_pepper', 'black pepper', 'g', 'spice', 251, 'en'),
('soy_sauce', 'soy sauce', 'ml', 'spice', 8, 'en'),  -- per 100ml
('sugar', 'sugar', 'g', 'spice', 387, 'en'),
('honey', 'honey', 'g', 'spice', 304, 'en');

-- Insert corresponding Chinese ingredients with same calories
INSERT OR REPLACE INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES
-- 蔬菜类 (Vegetables)
('tomato', '西红柿', 'g', 'vegetable', 18, 'zh'),
('carrot', '胡萝卜', 'g', 'vegetable', 41, 'zh'),
('onion', '洋葱', 'g', 'vegetable', 40, 'zh'),
('garlic', '大蒜', 'g', 'vegetable', 149, 'zh'),
('ginger', '生姜', 'g', 'vegetable', 80, 'zh'),
('potato', '土豆', 'g', 'vegetable', 77, 'zh'),
('bell_pepper', '彩椒', 'g', 'vegetable', 31, 'zh'),
('cabbage', '白菜', 'g', 'vegetable', 25, 'zh'),
('broccoli', '西兰花', 'g', 'vegetable', 34, 'zh'),
('spinach', '菠菜', 'g', 'vegetable', 23, 'zh'),
('cucumber', '黄瓜', 'g', 'vegetable', 16, 'zh'),
('mushroom', '蘑菇', 'g', 'vegetable', 22, 'zh'),

-- 肉类 (Meats)
('chicken_breast', '鸡胸肉', 'g', 'meat', 165, 'zh'),
('beef', '牛肉', 'g', 'meat', 250, 'zh'),
('pork', '猪肉', 'g', 'meat', 242, 'zh'),
('fish_salmon', '三文鱼', 'g', 'meat', 208, 'zh'),
('shrimp', '虾', 'g', 'meat', 99, 'zh'),
('egg', '鸡蛋', '个', 'meat', 78, 'zh'),

-- 谷物类 (Grains)
('rice', '大米', 'g', 'grain', 130, 'zh'),
('noodles', '面条', 'g', 'grain', 138, 'zh'),
('bread', '面包', '片', 'grain', 265, 'zh'),
('flour', '面粉', 'g', 'grain', 364, 'zh'),
('oats', '燕麦', 'g', 'grain', 389, 'zh'),

-- 乳制品 (Dairy)
('milk', '牛奶', 'ml', 'dairy', 42, 'zh'),
('cheese', '奶酪', 'g', 'dairy', 113, 'zh'),
('yogurt', '酸奶', 'g', 'dairy', 59, 'zh'),
('butter', '黄油', 'g', 'dairy', 717, 'zh'),

-- 油脂类 (Oils & Fats)
('olive_oil', '橄榄油', 'ml', 'other', 884, 'zh'),
('vegetable_oil', '植物油', 'ml', 'other', 884, 'zh'),

-- 水果类 (Fruits)
('apple', '苹果', 'g', 'fruit', 52, 'zh'),
('banana', '香蕉', 'g', 'fruit', 89, 'zh'),
('orange', '橙子', 'g', 'fruit', 47, 'zh'),
('lemon', '柠檬', 'g', 'fruit', 29, 'zh'),

-- 调料类 (Spices & Seasonings)
('salt', '盐', 'g', 'spice', 0, 'zh'),
('black_pepper', '黑胡椒', 'g', 'spice', 251, 'zh'),
('soy_sauce', '生抽', 'ml', 'spice', 8, 'zh'),
('sugar', '糖', 'g', 'spice', 387, 'zh'),
('honey', '蜂蜜', 'g', 'spice', 304, 'zh');

-- Add some Chinese-specific ingredients
INSERT OR REPLACE INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES
-- Chinese-specific ingredients (English)
('bok_choy', 'bok choy', 'g', 'vegetable', 13, 'en'),
('chinese_cabbage', 'chinese cabbage', 'g', 'vegetable', 16, 'en'),
('tofu', 'tofu', 'g', 'meat', 76, 'en'),
('sesame_oil', 'sesame oil', 'ml', 'other', 884, 'en'),
('green_onion', 'green onion', 'g', 'vegetable', 32, 'en'),
('chinese_broccoli', 'chinese broccoli', 'g', 'vegetable', 26, 'en'),

-- Chinese-specific ingredients (Chinese)
('bok_choy', '小白菜', 'g', 'vegetable', 13, 'zh'),
('chinese_cabbage', '大白菜', 'g', 'vegetable', 16, 'zh'),
('tofu', '豆腐', 'g', 'meat', 76, 'zh'),
('sesame_oil', '香油', 'ml', 'other', 884, 'zh'),
('green_onion', '葱', 'g', 'vegetable', 32, 'zh'),
('chinese_broccoli', '芥兰', 'g', 'vegetable', 26, 'zh');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_key_lang ON ingredients(ingredient_key, language_code);
CREATE INDEX IF NOT EXISTS idx_ingredients_name_lang ON ingredients(name, language_code);

-- Verify the data
SELECT 'English ingredients:' as info;
SELECT COUNT(*) as count FROM ingredients WHERE language_code = 'en';

SELECT 'Chinese ingredients:' as info;
SELECT COUNT(*) as count FROM ingredients WHERE language_code = 'zh';

SELECT 'Sample ingredients by key:' as info;
SELECT ingredient_key, name, calories_per_unit, language_code 
FROM ingredients 
WHERE ingredient_key IN ('tomato', 'chicken_breast', 'rice') 
ORDER BY ingredient_key, language_code;