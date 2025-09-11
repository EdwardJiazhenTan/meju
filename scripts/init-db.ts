// scripts/init-db.ts
import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'meal_planner',
  user: 'admin',
  password: 'password',
});

async function initDatabase() {
  try {
    await client.connect();
    const schema = readFileSync(join(__dirname, '../database/schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

initDatabase();
