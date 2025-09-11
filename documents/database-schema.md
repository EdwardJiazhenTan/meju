# Database Schema

This document describes the PostgreSQL database schema for the meal planning application.

## Tables Overview

The schema supports:
- Dish management with categories
- Ingredient library with units and nutritional data
- Customizable dish options
- Meal planning with JSONB customizations
- Automated shopping list generation

---

## Core Tables

### `categories`
Dish categories for organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique category ID |
| `name` | VARCHAR(50) NOT NULL | Category name |
| `display_order` | INTEGER | Sort order for display |
| `created_at` | TIMESTAMP DEFAULT NOW() | Creation timestamp |

### `dishes`
Base dish information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique dish ID |
| `name` | VARCHAR(100) NOT NULL | Dish name |
| `cooking_steps` | TEXT | Preparation instructions |
| `category_id` | INTEGER | References categories(id) |
| `base_calories` | INTEGER | Base calorie count |
| `preparation_time` | INTEGER | Prep time in minutes |
| `servings` | INTEGER DEFAULT 1 | Default serving size |
| `is_customizable` | BOOLEAN DEFAULT false | Can be customized |
| `created_at` | TIMESTAMP DEFAULT NOW() | Creation timestamp |

### `ingredients`
Ingredient library with nutritional data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique ingredient ID |
| `name` | VARCHAR(50) NOT NULL | Ingredient name |
| `calories_per_unit` | DECIMAL(8,2) | Calories per unit |
| `default_unit_id` | INTEGER | References ingredient_units(id) |
| `category` | VARCHAR(30) | Ingredient category |
| `created_at` | TIMESTAMP DEFAULT NOW() | Creation timestamp |

### `ingredient_units`
Measurement units (grams, ml, cups, etc.).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique unit ID |
| `name` | VARCHAR(20) NOT NULL | Unit name |
| `abbreviation` | VARCHAR(10) | Short form (g, ml, etc.) |

---

## Relationship Tables

### `dish_ingredients`
Default ingredients for dishes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique record ID |
| `dish_id` | INTEGER | References dishes(id) |
| `ingredient_id` | INTEGER | References ingredients(id) |
| `quantity` | DECIMAL(10,2) NOT NULL | Amount needed |
| `unit_id` | INTEGER | References ingredient_units(id) |
| `is_optional` | BOOLEAN DEFAULT false | Optional ingredient |

---

## Customization System

### `customization_groups`
Groups of customizable options for dishes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique group ID |
| `dish_id` | INTEGER | References dishes(id) |
| `name` | VARCHAR(50) NOT NULL | Group name |
| `type` | VARCHAR(20) NOT NULL | 'single', 'multiple', 'quantity' |
| `is_required` | BOOLEAN DEFAULT false | Must be selected |
| `display_order` | INTEGER | Sort order |

### `customization_options`
Individual options within customization groups.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique option ID |
| `group_id` | INTEGER | References customization_groups(id) |
| `ingredient_id` | INTEGER | References ingredients(id) |
| `name` | VARCHAR(50) NOT NULL | Display name |
| `default_quantity` | DECIMAL(10,2) | Default amount |
| `unit_id` | INTEGER | References ingredient_units(id) |
| `display_order` | INTEGER | Sort order |

---

## Meal Planning

### `meal_plans`
Daily meal planning entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique plan ID |
| `date` | DATE NOT NULL | Meal date |
| `meal_name` | VARCHAR(50) | Meal name (breakfast, lunch, etc.) |
| `created_at` | TIMESTAMP DEFAULT NOW() | Creation timestamp |

### `meal_items`
Individual dishes in meal plans with customizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique item ID |
| `meal_plan_id` | INTEGER | References meal_plans(id) |
| `dish_id` | INTEGER | References dishes(id) |
| `customizations` | JSONB | Selected customizations |
| `servings` | DECIMAL(4,2) DEFAULT 1 | Portion size |
| `notes` | TEXT | Additional notes |

---

## Views

### `weekly_shopping_list`
Aggregates ingredients needed for meal planning.

Combines:
- Base dish ingredients
- Selected customization options from JSONB
- Weekly date range filtering
- Quantity summation by ingredient

Returns:
- `ingredient_name`: Ingredient name
- `unit_name`: Unit name
- `unit_abbrev`: Unit abbreviation  
- `total_quantity`: Total amount needed

---

## Key Features

### JSONB Customizations
The `meal_items.customizations` field stores flexible customization data:

```json
{
  "group_1": {
    "option_id": 5,
    "selected": "true",
    "quantity": 150
  },
  "group_2": {
    "option_id": 8,
    "selected": "true",
    "quantity": 100
  }
}
```

### Customization Types
- **single**: Choose one option (radio button)
- **multiple**: Choose many options (checkboxes)  
- **quantity**: Adjust ingredient amounts (slider/input)

### Automatic Shopping Lists
The view automatically calculates total ingredients needed by:
1. Summing base dish ingredients × servings
2. Adding selected customization ingredients × servings
3. Grouping by ingredient and unit
4. Filtering by date range (±7 days from current date)

---

## Sample Data Flow

1. Create categories: "Salads", "Main Course"
2. Create ingredients: "Chicken Breast", "Lettuce", "Tomato"
3. Create units: "grams", "pieces"
4. Create dish: "Chicken Salad" with default ingredients
5. Add customization group: "Extra Vegetables" (multiple choice)
6. Plan meal: Select "Chicken Salad" + customizations
7. Generate shopping list: Aggregate all needed ingredients