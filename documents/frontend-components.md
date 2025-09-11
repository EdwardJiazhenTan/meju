# Frontend Components Documentation

This document describes the React components available for the meal planning application.

## Component Overview

All components are built with TypeScript, Tailwind CSS, and follow React best practices.

---

## Dish Management

### `DishForm`
Form component for creating and editing dishes.

**Props:**
```typescript
interface DishFormProps {
  onSubmit?: (dish: Dish) => void;
}
```

**Features:**
- Form validation (name and servings required)
- Success/error feedback
- Auto-reset after successful submission
- Supports all dish properties including customization flag

**Usage:**
```tsx
<DishForm onSubmit={(dish) => console.log('Created:', dish)} />
```

### `ViewDish`
Display component for showing dish details.

**Props:**
```typescript
interface ViewDishProps {
  dish: Dish & { category_name?: string };
}
```

**Features:**
- Formatted display of all dish properties
- Color-coded status badges
- Cooking steps with proper formatting
- Creation date formatting

**Usage:**
```tsx
<ViewDish dish={selectedDish} />
```

---

## Category Management

### `CategoryForm`
Form component for creating categories.

**Props:**
```typescript
interface CategoryFormProps {
  onSubmit?: (category: Category) => void;
}
```

**Features:**
- Name validation
- Optional display order
- Purple-themed styling
- Success feedback

**Usage:**
```tsx
<CategoryForm onSubmit={(category) => handleCategoryCreated(category)} />
```

### `CategoryList`
List component for displaying and selecting categories.

**Props:**
```typescript
interface CategoryListProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  selectedCategory?: Category | null;
  onSelectCategory?: (category: Category) => void;
}
```

**Features:**
- Clickable category selection
- Loading and error states
- Refresh functionality
- Display order and creation date

**Usage:**
```tsx
<CategoryList 
  categories={categories}
  loading={loading}
  error={error}
  onRefresh={fetchCategories}
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
/>
```

---

## Ingredient Management

### `IngredientSearchAdd`
Component for searching and adding ingredients to dishes.

**Props:**
```typescript
interface IngredientSearchAddProps {
  onAdd: (ingredient: {
    ingredient_id: number;
    quantity: number;
    unit_id: number;
    is_optional: boolean;
  }) => void;
  availableIngredients: Ingredient[];
  availableUnits: IngredientUnit[];
  loading?: boolean;
}
```

**Features:**
- Autocomplete ingredient search
- Dropdown with ingredient categories
- Quantity and unit selection
- Optional ingredient checkbox
- Smart default unit selection

**Usage:**
```tsx
<IngredientSearchAdd
  onAdd={handleAddIngredient}
  availableIngredients={ingredients}
  availableUnits={units}
  loading={addingIngredient}
/>
```

### `IngredientList`
Component for displaying dish ingredients with details.

**Props:**
```typescript
interface IngredientListProps {
  ingredients: DishIngredientWithDetails[];
  onRemove?: (ingredientId: number) => void;
  loading?: boolean;
  title?: string;
}
```

**Features:**
- Ingredient details with quantities and units
- Calorie calculations per ingredient
- Total calorie summary
- Optional/category badges
- Remove functionality

**Usage:**
```tsx
<IngredientList
  ingredients={dishIngredients}
  onRemove={handleRemoveIngredient}
  title="Dish Ingredients"
/>
```

### `IngredientSelector`
Main component combining search and list functionality.

**Props:**
```typescript
interface IngredientSelectorProps {
  dishId?: number | null;
  onIngredientsChange?: (ingredients: DishIngredientWithDetails[]) => void;
}
```

**Features:**
- Complete ingredient management workflow
- API integration for CRUD operations
- Real-time updates
- Error handling and loading states
- Automatic data fetching

**Usage:**
```tsx
<IngredientSelector
  dishId={selectedDish.id}
  onIngredientsChange={(ingredients) => {
    console.log('Updated ingredients:', ingredients);
  }}
/>
```

---

## Page Components

### Test Pages
All test pages follow a similar pattern:

- **`/test/page.tsx`**: Dish creation and management testing
- **`/test/categories/page.tsx`**: Category management testing  
- **`/test/ingredients/page.tsx`**: Ingredient management testing

**Common Features:**
- 3-column layouts (Form | List | Details)
- Real-time updates
- Error handling
- Loading states
- Navigation between sections

---

## Styling Conventions

### Color Themes
- **Dishes**: Blue theme (`bg-blue-600`, `border-blue-500`)
- **Categories**: Purple theme (`bg-purple-600`, `border-purple-500`)
- **Ingredients**: Green theme (`bg-green-600`, `border-green-500`)

### Status Indicators
- **Optional**: Yellow badges (`bg-yellow-100 text-yellow-800`)
- **Categories**: Blue badges (`bg-blue-100 text-blue-800`)
- **Calories**: Green text (`text-green-600`)
- **Servings**: Gray badges (`bg-gray-100`)

### Interactive States
- **Selected**: Colored border + light background
- **Hover**: Darker border color
- **Loading**: Disabled state with opacity
- **Error**: Red background with border

---

## Type Definitions

### Key Interfaces Used
```typescript
// From types/database.ts
interface Dish {
  id: number;
  name: string;
  cooking_steps?: string;
  category_id?: number;
  base_calories?: number;
  preparation_time?: number;
  servings: number;
  is_customizable: boolean;
  created_at: Date;
}

interface Ingredient {
  id: number;
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
  created_at: Date;
}

interface IngredientUnit {
  id: number;
  name: string;
  abbreviation?: string;
}

// Extended for components
interface DishIngredientWithDetails {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional: boolean;
  ingredient_name: string;
  unit_name: string;
  unit_abbreviation: string;
  calories_per_unit?: number;
  ingredient_category?: string;
}
```

---

## Best Practices

### Component Organization
- Keep components small and focused
- Use TypeScript interfaces for all props
- Handle loading and error states consistently
- Provide meaningful default values

### State Management
- Use local state for form data
- Lift state up when shared between components
- Use callbacks for parent communication
- Reset forms after successful operations

### API Integration
- Handle errors gracefully with user feedback
- Show loading states during async operations
- Refresh data after modifications
- Use consistent error message formatting

### Accessibility
- Include proper ARIA labels
- Use semantic HTML elements
- Ensure keyboard navigation works
- Provide clear visual feedback