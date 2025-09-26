-- Chinese Food Ingredients SQL Script
-- This script populates the ingredients table with common Chinese cooking ingredients

-- First, ensure we have basic units
INSERT INTO ingredient_units (name, abbreviation) VALUES
('grams', 'g'),
('milliliters', 'ml'),
('pieces', 'pcs'),
('tablespoons', 'tbsp'),
('teaspoons', 'tsp'),
('cups', 'cup'),
('cloves', 'clove'),
('inches', 'inch'),
('bunches', 'bunch'),
('leaves', 'leaf')
ON CONFLICT (name) DO NOTHING;

-- Chinese ingredients with nutritional data and categories
INSERT INTO ingredients (name, calories_per_unit, default_unit_id, category) VALUES
-- Proteins
('Chicken breast', 1.65, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Pork belly', 5.18, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Ground pork', 2.63, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Beef chuck', 2.54, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Shrimp', 0.99, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Tofu', 0.76, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),
('Eggs', 68, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'protein'),
('Duck', 3.37, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'protein'),

-- Vegetables
('Bok choy', 0.13, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Chinese cabbage', 0.16, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Snow peas', 0.42, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Bean sprouts', 0.31, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Chinese broccoli', 0.22, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Shiitake mushrooms', 0.34, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Wood ear mushrooms', 0.25, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Bamboo shoots', 0.27, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Water chestnuts', 0.97, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Chinese eggplant', 0.25, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Chinese chives', 0.30, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Lotus root', 0.74, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),
('Daikon radish', 0.18, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'vegetable'),

-- Aromatics & Seasonings
('Garlic', 4, (SELECT id FROM ingredient_units WHERE name = 'cloves'), 'aromatic'),
('Fresh ginger', 0.80, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'aromatic'),
('Green onions', 0.32, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'aromatic'),
('Cilantro', 0.23, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'aromatic'),
('Thai basil', 0.22, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'aromatic'),

-- Sauces & Condiments
('Soy sauce', 0.08, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Dark soy sauce', 0.06, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Oyster sauce', 0.09, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Hoisin sauce', 2.20, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Black bean sauce', 0.65, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Fish sauce', 0.03, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Sesame oil', 8.84, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Chili oil', 8.99, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Rice vinegar', 0.22, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),
('Chinese cooking wine', 1.00, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'sauce'),

-- Spices & Dried Ingredients
('Sichuan peppercorns', 2.58, (SELECT id FROM ingredient_units WHERE name = 'teaspoons'), 'spice'),
('Star anise', 3.37, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'spice'),
('Five-spice powder', 3.49, (SELECT id FROM ingredient_units WHERE name = 'teaspoons'), 'spice'),
('White pepper', 2.96, (SELECT id FROM ingredient_units WHERE name = 'teaspoons'), 'spice'),
('Dried red chilies', 2.82, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'spice'),
('Dried shiitake', 2.96, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'dried'),
('Dried scallops', 3.06, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'dried'),
('Chinese preserved sausage', 3.75, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'dried'),

-- Noodles & Rice
('Fresh egg noodles', 1.38, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'grain'),
('Rice noodles', 3.64, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'grain'),
('Ramen noodles', 4.36, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'grain'),
('Jasmine rice', 1.30, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'grain'),
('Glutinous rice', 3.70, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'grain'),

-- Oils & Fats
('Peanut oil', 8.84, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'fat'),
('Vegetable oil', 8.84, (SELECT id FROM ingredient_units WHERE name = 'milliliters'), 'fat'),
('Lard', 9.02, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'fat'),

-- Other Essentials
('Cornstarch', 3.81, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'starch'),
('Potato starch', 3.57, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'starch'),
('Sugar', 3.87, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'sweetener'),
('Rock sugar', 3.94, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'sweetener'),
('Salt', 0, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'seasoning'),
('MSG', 0, (SELECT id FROM ingredient_units WHERE name = 'teaspoons'), 'seasoning'),

-- Specialty Items
('Fermented black beans', 1.80, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'fermented'),
('Pickled mustard greens', 0.19, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'pickled'),
('Sichuan pickled vegetables', 0.25, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'pickled'),
('Chinese ham', 3.18, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'cured'),
('Century eggs', 185, (SELECT id FROM ingredient_units WHERE name = 'pieces'), 'preserved'),

-- Fresh herbs commonly used
('Chinese celery', 0.14, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'herb'),
('Chinese parsley', 0.36, (SELECT id FROM ingredient_units WHERE name = 'grams'), 'herb'),
('Mint leaves', 0.70, (SELECT id FROM ingredient_units WHERE name = 'leaves'), 'herb');

-- Display ingredient count
SELECT 'Inserted ' || COUNT(*) || ' Chinese ingredients' as result FROM ingredients WHERE category IN (
    'protein', 'vegetable', 'aromatic', 'sauce', 'spice', 'dried',
    'grain', 'fat', 'starch', 'sweetener', 'seasoning', 'fermented',
    'pickled', 'cured', 'preserved', 'herb'
);
