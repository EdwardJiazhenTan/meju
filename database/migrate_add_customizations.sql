-- Migration: Add customizations column to meal_slot_dishes table
-- This allows storing ingredient customizations for each meal plan entry

-- Add customizations column to meal_slot_dishes
ALTER TABLE meal_slot_dishes ADD COLUMN customizations TEXT;

-- The customizations column will store JSON data with the following structure:
-- {
--   "ingredients": [
--     {
--       "ingredient_id": 1,
--       "name": "chicken breast",
--       "unit": "gram",
--       "quantity": 200,
--       "removed": false,
--       "calories_per_unit": 165,
--       "original_quantity": 150
--     }
--   ],
--   "serving_size": 1.5
-- }
