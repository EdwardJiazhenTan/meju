# Meju

A multilingual meal planning application built with Next.js that helps users create, manage, and share dishes while planning weekly meals.

## Features

- **Multilingual Support**: English and Chinese localization
- **Dish Management**: Create, edit, and share dishes with ingredients and nutritional info
- **Weekly Meal Planning**: Visual calendar interface for planning meals across the week
- **OCR Integration**: Extract text from images using Tesseract.js
- **User Authentication**: Email and OAuth (Google, GitHub) registration
- **Ingredient Database**: Comprehensive ingredient library with nutritional data
- **Dark Mode**: Theme switching capability

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, TypeScript
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: SQLite with Better SQLite3
- **Internationalization**: next-intl
- **OCR**: Tesseract.js
- **Testing**: Jest with integration and unit tests

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   node scripts/update-database.mjs
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to access the application.

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint

## Database

The application uses SQLite with a comprehensive schema supporting:
- Users and OAuth authentication
- Dishes with ingredients and nutritional information
- Weekly meal planning with daily slots
- Dish sharing and visibility controls
- Full-text search capabilities

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request