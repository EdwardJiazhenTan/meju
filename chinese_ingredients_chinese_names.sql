-- Chinese Food Ingredients SQL Script (Chinese Names)
-- This script populates the ingredients table with Chinese ingredient names and units

-- First, insert Chinese units
INSERT INTO ingredient_units (name, abbreviation) VALUES
('克', '克'),
('毫升', '毫升'),
('勺', '勺'),
('斤', '斤')
ON CONFLICT (name) DO NOTHING;

-- Chinese ingredients with Chinese names
INSERT INTO ingredients (name, calories_per_unit, default_unit_id, category) VALUES
-- 蛋白质类 (Proteins)
('鸡胸肉', 1.65, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('五花肉', 5.18, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('猪肉馅', 2.63, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('牛肉', 2.54, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('虾仁', 0.99, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('豆腐', 0.76, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('鸡蛋', 68, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('鸭肉', 3.37, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('带鱼', 1.27, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),
('草鱼', 1.13, (SELECT id FROM ingredient_units WHERE name = '克'), 'protein'),

-- 蔬菜类 (Vegetables)
('小白菜', 0.13, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('大白菜', 0.16, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('荷兰豆', 0.42, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('豆芽菜', 0.31, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('芥蓝', 0.22, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('香菇', 0.34, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('木耳', 0.25, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('竹笋', 0.27, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('荸荠', 0.97, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('茄子', 0.25, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('韭菜', 0.30, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('莲藕', 0.74, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('白萝卜', 0.18, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('胡萝卜', 0.41, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('土豆', 0.77, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('冬瓜', 0.11, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('丝瓜', 0.20, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),
('苦瓜', 0.19, (SELECT id FROM ingredient_units WHERE name = '克'), 'vegetable'),

-- 调料类 (Seasonings & Aromatics)
('大蒜', 1.31, (SELECT id FROM ingredient_units WHERE name = '克'), 'aromatic'),
('生姜', 0.80, (SELECT id FROM ingredient_units WHERE name = '克'), 'aromatic'),
('葱', 0.32, (SELECT id FROM ingredient_units WHERE name = '克'), 'aromatic'),
('香菜', 0.23, (SELECT id FROM ingredient_units WHERE name = '克'), 'aromatic'),
('九层塔', 0.22, (SELECT id FROM ingredient_units WHERE name = '克'), 'aromatic'),

-- 调味料类 (Sauces & Condiments)
('生抽', 0.08, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('老抽', 0.06, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('蚝油', 0.09, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('海鲜酱', 2.20, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('豆豉酱', 0.65, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('鱼露', 0.03, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('香油', 8.84, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('辣椒油', 8.99, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('米醋', 0.22, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('料酒', 1.00, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'sauce'),
('郫县豆瓣酱', 1.32, (SELECT id FROM ingredient_units WHERE name = '勺'), 'sauce'),

-- 香料类 (Spices)
('花椒', 2.58, (SELECT id FROM ingredient_units WHERE name = '勺'), 'spice'),
('八角', 3.37, (SELECT id FROM ingredient_units WHERE name = '克'), 'spice'),
('五香粉', 3.49, (SELECT id FROM ingredient_units WHERE name = '勺'), 'spice'),
('白胡椒粉', 2.96, (SELECT id FROM ingredient_units WHERE name = '勺'), 'spice'),
('干辣椒', 2.82, (SELECT id FROM ingredient_units WHERE name = '克'), 'spice'),
('桂皮', 2.47, (SELECT id FROM ingredient_units WHERE name = '克'), 'spice'),
('丁香', 2.74, (SELECT id FROM ingredient_units WHERE name = '克'), 'spice'),

-- 干货类 (Dried Ingredients)
('干香菇', 2.96, (SELECT id FROM ingredient_units WHERE name = '克'), 'dried'),
('干贝', 3.06, (SELECT id FROM ingredient_units WHERE name = '克'), 'dried'),
('腊肠', 3.75, (SELECT id FROM ingredient_units WHERE name = '克'), 'dried'),
('咸菜', 0.19, (SELECT id FROM ingredient_units WHERE name = '克'), 'dried'),

-- 面食米饭类 (Noodles & Rice)
('鸡蛋面', 1.38, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),
('米粉', 3.64, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),
('方便面', 4.36, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),
('大米', 1.30, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),
('糯米', 3.70, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),
('小麦粉', 3.64, (SELECT id FROM ingredient_units WHERE name = '克'), 'grain'),

-- 油脂类 (Oils & Fats)
('花生油', 8.84, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'fat'),
('菜籽油', 8.84, (SELECT id FROM ingredient_units WHERE name = '毫升'), 'fat'),
('猪油', 9.02, (SELECT id FROM ingredient_units WHERE name = '克'), 'fat'),

-- 其他必需品 (Other Essentials)
('玉米淀粉', 3.81, (SELECT id FROM ingredient_units WHERE name = '克'), 'starch'),
('土豆淀粉', 3.57, (SELECT id FROM ingredient_units WHERE name = '克'), 'starch'),
('白糖', 3.87, (SELECT id FROM ingredient_units WHERE name = '克'), 'sweetener'),
('冰糖', 3.94, (SELECT id FROM ingredient_units WHERE name = '克'), 'sweetener'),
('盐', 0, (SELECT id FROM ingredient_units WHERE name = '克'), 'seasoning'),
('味精', 0, (SELECT id FROM ingredient_units WHERE name = '勺'), 'seasoning'),

-- 特色食材 (Specialty Items)
('豆豉', 1.80, (SELECT id FROM ingredient_units WHERE name = '克'), 'fermented'),
('榨菜', 0.19, (SELECT id FROM ingredient_units WHERE name = '克'), 'pickled'),
('泡菜', 0.25, (SELECT id FROM ingredient_units WHERE name = '克'), 'pickled'),
('金华火腿', 3.18, (SELECT id FROM ingredient_units WHERE name = '克'), 'cured'),
('皮蛋', 185, (SELECT id FROM ingredient_units WHERE name = '克'), 'preserved'),
('咸鸭蛋', 190, (SELECT id FROM ingredient_units WHERE name = '克'), 'preserved');

-- 显示插入的食材数量
SELECT '成功插入 ' || COUNT(*) || ' 种中式食材' as result FROM ingredients WHERE category IN (
    'protein', 'vegetable', 'aromatic', 'sauce', 'spice', 'dried',
    'grain', 'fat', 'starch', 'sweetener', 'seasoning', 'fermented',
    'pickled', 'cured', 'preserved'
) AND name ~ '[\\u4e00-\\u9fff]';
