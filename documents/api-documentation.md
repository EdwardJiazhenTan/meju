# API Documentation

This document describes all backend API endpoints available in the meal planning application.

## Base URL
All endpoints are prefixed with the application base URL.

## Authentication
Currently no authentication is required for any endpoints.

---

## Dishes API

### GET `/api/dishes`
Fetch all dishes with category information.

**Response:**
```json
{
  "dishes": [
    {
      "id": 1,
      "name": "Chicken Salad",
      "cooking_steps": "Mix ingredients...",
      "category_id": 1,
      "base_calories": 300,
      "preparation_time": 15,
      "servings": 2,
      "is_customizable": true,
      "created_at": "2025-09-11T20:35:07.778Z",
      "category_name": "Salads"
    }
  ]
}
```

### POST `/api/dishes`
Create a new dish.

**Request Body:**
```json
{
  "name": "Chicken Salad",
  "cooking_steps": "Mix ingredients...",
  "category_id": 1,
  "base_calories": 300,
  "preparation_time": 15,
  "servings": 2,
  "is_customizable": true,
  "ingredients": [
    {
      "ingredient_id": 1,
      "quantity": 200,
      "unit_id": 1,
      "is_optional": false
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "dish": {
    "id": 1,
    "name": "Chicken Salad",
    // ... dish properties
  }
}
```

---

## Categories API

### GET `/api/categories`
Fetch all categories ordered by display_order.

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Salads",
      "display_order": 1,
      "created_at": "2025-09-11T20:35:07.778Z"
    }
  ]
}
```

### POST `/api/categories`
Create a new category.

**Request Body:**
```json
{
  "name": "Salads",
  "display_order": 1
}
```

**Response:** `201 Created`
```json
{
  "category": {
    "id": 1,
    "name": "Salads",
    "display_order": 1,
    "created_at": "2025-09-11T20:35:07.778Z"
  }
}
```

---

## Ingredients API

### GET `/api/ingredients`
Fetch ingredients with optional filtering.

**Query Parameters:**
- `search` (optional): Filter by ingredient name
- `category` (optional): Filter by ingredient category

**Response:**
```json
{
  "ingredients": [
    {
      "id": 1,
      "name": "Chicken Breast",
      "calories_per_unit": 165,
      "default_unit_id": 1,
      "category": "Protein",
      "created_at": "2025-09-11T20:35:07.778Z",
      "unit_name": "grams",
      "unit_abbreviation": "g"
    }
  ]
}
```

### POST `/api/ingredients`
Create a new ingredient.

**Request Body:**
```json
{
  "name": "Chicken Breast",
  "calories_per_unit": 165,
  "default_unit_id": 1,
  "category": "Protein"
}
```

**Response:** `201 Created`
```json
{
  "ingredient": {
    "id": 1,
    "name": "Chicken Breast",
    "calories_per_unit": 165,
    "default_unit_id": 1,
    "category": "Protein",
    "created_at": "2025-09-11T20:35:07.778Z"
  }
}
```

---

## Ingredient Units API

### GET `/api/ingredient-units`
Fetch all measurement units.

**Response:**
```json
{
  "units": [
    {
      "id": 1,
      "name": "grams",
      "abbreviation": "g"
    }
  ]
}
```

### POST `/api/ingredient-units`
Create a new measurement unit.

**Request Body:**
```json
{
  "name": "grams",
  "abbreviation": "g"
}
```

**Response:** `201 Created`
```json
{
  "unit": {
    "id": 1,
    "name": "grams",
    "abbreviation": "g"
  }
}
```

---

## Dish Ingredients API

### GET `/api/dishes/[dishId]/ingredients`
Fetch all ingredients for a specific dish.

**Response:**
```json
{
  "ingredients": [
    {
      "id": 1,
      "dish_id": 1,
      "ingredient_id": 1,
      "quantity": 200,
      "unit_id": 1,
      "is_optional": false,
      "ingredient_name": "Chicken Breast",
      "calories_per_unit": 165,
      "ingredient_category": "Protein",
      "unit_name": "grams",
      "unit_abbreviation": "g"
    }
  ]
}
```

### POST `/api/dishes/[dishId]/ingredients`
Add an ingredient to a dish.

**Request Body:**
```json
{
  "ingredient_id": 1,
  "quantity": 200,
  "unit_id": 1,
  "is_optional": false
}
```

**Response:** `201 Created`
```json
{
  "dishIngredient": {
    "id": 1,
    "dish_id": 1,
    "ingredient_id": 1,
    "quantity": 200,
    "unit_id": 1,
    "is_optional": false
  }
}
```

### DELETE `/api/dishes/[dishId]/ingredients?ingredient_id={id}`
Remove an ingredient from a dish.

**Query Parameters:**
- `ingredient_id`: ID of ingredient to remove

**Response:** `200 OK`
```json
{
  "message": "Dish ingredient removed successfully"
}
```

---

## Customization Groups API

### GET `/api/customization-groups`
Fetch customization groups with their options.

**Query Parameters:**
- `dish_id` (optional): Filter by dish ID

**Response:**
```json
{
  "groups": [
    {
      "id": 1,
      "dish_id": 1,
      "name": "Choose Protein",
      "type": "single",
      "is_required": true,
      "display_order": 1,
      "options": [
        {
          "id": 1,
          "ingredient_id": 1,
          "name": "Chicken Breast",
          "default_quantity": 200,
          "unit_id": 1,
          "display_order": 1,
          "ingredient_name": "Chicken Breast",
          "unit_name": "grams",
          "unit_abbreviation": "g"
        }
      ]
    }
  ]
}
```

### POST `/api/customization-groups`
Create a customization group with options.

**Request Body:**
```json
{
  "dish_id": 1,
  "name": "Choose Protein",
  "type": "single",
  "is_required": true,
  "display_order": 1,
  "options": [
    {
      "ingredient_id": 1,
      "name": "Chicken Breast",
      "default_quantity": 200,
      "unit_id": 1,
      "display_order": 1
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "group": {
    "id": 1,
    "dish_id": 1,
    "name": "Choose Protein",
    "type": "single",
    "is_required": true,
    "display_order": 1,
    "options": [...]
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Name is required"
}
```

**404 Not Found:**
```json
{
  "error": "Dish not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create dish"
}
```

---

## Notes

- All POST requests require `Content-Type: application/json`
- Date fields are returned in ISO 8601 format
- Numeric IDs are integers
- Optional fields can be omitted or set to `null`
- Customization group types: `single`, `multiple`, `quantity`