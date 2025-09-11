# Meal Planner 🍽️

A Next.js-based family meal planning system with customizable dishes and automatic shopping lists.

## Features

- **Calendar View**: Weekly meal planning with multiple meals per day
- **Dish Customization**: Ingredient substitution and quantity adjustments
- **Auto Shopping Lists**: Weekly ingredient calculation
- **Nutrition Tracking**: Calorie information per dish and meal
- **Cooking Instructions**: Detailed preparation steps

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL (Docker) with JSONB support
- **Query**: Native pg client

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop

### Setup

```bash
# Clone and install
git clone <repository-url>
cd meal-planner
npm install

# Start PostgreSQL
docker run --name meal-planner-db \
  -e POSTGRES_DB=meal_planner \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Initialize database
npm run init-db

# Start development
npm run dev
```

Visit http://localhost:3000

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production

# Database
npm run start-db         # Start database container
npm run stop-db          # Stop database container
npm run init-db          # Initialize database tables
npm run reset-db         # Reset database (clear all data)
```

## Database Schema

### Core Tables
- **categories** - Dish categories (salad, meat, staple, etc.)
- **dishes** - Dish information (name, steps, calories)
- **ingredients** - Ingredient library with units and calories
- **meal_plans** - Date + meal name planning
- **meal_items** - Selected dishes with JSONB customizations

### Key Features
- **JSONB customizations** - Flexible dish modifications
- **automatic shopping list** - Via `weekly_shopping_list` view
- **nutrition calculation** - Base + custom ingredient calories

## Troubleshooting

```bash
# Docker issues
docker ps                # Check containers
docker logs meal-planner-db  # View logs

# Database connection
docker exec -it meal-planner-db psql -U admin -d meal_planner
```

## License

MIT
