# Meju

Fullstack restaurant order management system built with Next.js and PostgreSQL.

![Demo Website](assets/demo.png)

## Demo

Live demo: https://www.meju.app/

## Features

- Fullstack order system with admin panel
- Menu management with categories and ingredients
- Real-time order tracking
- Easy deployment with Vercel and Neon
- Completely free to host

## Local Development

```bash
# Clone project
git clone <repository-url>
cd meju
npm install

# Start PostgreSQL database
npm run start-db

# Initialize database
npm run init-db

# Start development server
npm run dev
```

Visit http://localhost:3000

## Production Hosting

### Database Setup (Neon)

1. Create account at [neon.tech](https://neon.tech)
2. Create new PostgreSQL database
3. Install Neon CLI:
   ```bash
   npm install -g neonctl
   ```
4. Copy database connection string from Neon dashboard

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

During deployment, add your Neon database URL as environment variable in Vercel dashboard.

### Migrate Local Data to Cloud

If you need to transfer local database to Neon:

```bash
# Export local data
pg_dump -h localhost -U admin meal_planner > backup.sql

# Import to Neon (replace with your connection string)
psql "postgresql://user:pass@host/db" < backup.sql
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start-db     # Start local PostgreSQL
npm run init-db      # Initialize database tables
```

## Tech Stack

- Next.js 15 + TypeScript
- PostgreSQL with Docker
- Tailwind CSS
- Vercel (hosting)
- Neon (serverless PostgreSQL)
