# Meal Planner Documentation

This directory contains technical documentation for the meal planning application.

## Documents Overview

### 📡 [API Documentation](./api-documentation.md)
Complete reference for all backend REST API endpoints including:
- Dishes management
- Categories management  
- Ingredients and units
- Dish ingredients relationships
- Customization groups
- Request/response examples
- Error handling

### 🗃️ [Database Schema](./database-schema.md)
PostgreSQL database schema documentation covering:
- Table structures and relationships
- JSONB customization system
- Meal planning tables
- Shopping list view
- Sample data flows

### 🧩 [Frontend Components](./frontend-components.md)
React component library documentation including:
- Component props and interfaces
- Usage examples
- Styling conventions
- Type definitions
- Best practices

## Quick Reference

### API Endpoints
```
GET    /api/dishes
POST   /api/dishes
GET    /api/categories
POST   /api/categories
GET    /api/ingredients
POST   /api/ingredients
GET    /api/ingredient-units
POST   /api/ingredient-units
GET    /api/dishes/[dishId]/ingredients
POST   /api/dishes/[dishId]/ingredients
DELETE /api/dishes/[dishId]/ingredients
GET    /api/customization-groups
POST   /api/customization-groups
```

### Key Components
- `DishForm` - Create/edit dishes
- `ViewDish` - Display dish details
- `CategoryForm` - Create categories
- `CategoryList` - Display/select categories
- `IngredientSelector` - Complete ingredient management
- `IngredientSearchAdd` - Add ingredients to dishes
- `IngredientList` - Display dish ingredients

### Test Pages
- `/test` - Dish creation testing
- `/test/categories` - Category management testing
- `/test/ingredients` - Ingredient management testing

## Architecture Overview

The application follows a standard Next.js architecture:

```
app/
├── api/                    # API routes
│   ├── dishes/
│   ├── categories/
│   ├── ingredients/
│   └── ingredient-units/
├── components/             # Reusable React components
├── test/                   # Testing pages
└── page.tsx               # Home page

lib/
└── database.ts            # PostgreSQL connection

types/
├── database.ts            # Core type definitions
└── index.ts               # Extended types

tests/
└── api/                   # Jest API tests
```

## Development Workflow

1. **Database First**: Schema defined in `database/schema.sql`
2. **Types**: TypeScript interfaces match database schema
3. **API**: REST endpoints with proper validation
4. **Components**: Reusable UI components
5. **Testing**: Jest tests for APIs, manual testing pages for UI
6. **Documentation**: Markdown docs for all systems

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, PostgreSQL
- **Database**: PostgreSQL with JSONB for flexible data
- **Testing**: Jest for API testing
- **Documentation**: Markdown files

## Getting Started

1. Set up PostgreSQL database
2. Run `npm install`
3. Initialize database with `database/schema.sql`
4. Start development with `npm run dev`
5. Visit test pages to explore functionality
6. Use this documentation as reference for development