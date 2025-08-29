import { getTestDatabase } from '../setup';

export const clearAllTables = () => {
  const db = getTestDatabase();
  const tables = [
    'meal_slot_dishes',
    'meal_slots', 
    'daily_meal_plans',
    'weekly_meal_plans',
    'dish_tags',
    'dish_ingredients',
    'dish_shares',
    'dishes',
    'ingredients',
    'user_oauth',
    'users'
  ];
  
  tables.forEach(table => {
    try {
      db.prepare(`DELETE FROM ${table}`).run();
    } catch (error) {
      // Table might not exist, ignore
    }
  });
};

export const getTableCount = (tableName: string): number => {
  const db = getTestDatabase();
  const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
  return result.count;
};

export const seedTestData = () => {
  const db = getTestDatabase();
  
  // Insert basic test data that many tests might need
  const basicIngredients = [
    "INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES ('salt', 'salt', 'gram', 'spice', 0, 'en')",
    "INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES ('salt', '盐', '克', 'spice', 0, 'zh-CN')",
    "INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES ('water', 'water', 'ml', 'other', 0, 'en')",
    "INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code) VALUES ('water', '水', '毫升', 'other', 0, 'zh-CN')"
  ];
  
  basicIngredients.forEach(sql => {
    try {
      db.prepare(sql).run();
    } catch (error) {
      // Might already exist, ignore
    }
  });
};

export const executeRawSQL = (sql: string) => {
  const db = getTestDatabase();
  return db.prepare(sql).run();
};

export const queryRawSQL = (sql: string) => {
  const db = getTestDatabase();
  return db.prepare(sql).all();
};

// JWT token helpers for API testing
export const createMockJWT = (payload: any = { userId: 1 }): string => {
  // In a real implementation, this would use jsonwebtoken
  // For testing, we can use a simple mock
  return `mock-jwt-${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
};

export const parseMockJWT = (token: string): any => {
  if (!token.startsWith('mock-jwt-')) {
    throw new Error('Invalid mock JWT token');
  }
  const payload = token.replace('mock-jwt-', '');
  return JSON.parse(Buffer.from(payload, 'base64').toString());
};

// Helper to wait for async operations
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to generate random test data
export const randomString = (length: number = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const randomEmail = (): string => {
  return `test-${randomString()}@example.com`;
};

// Database assertion helpers
export const expectTableToHaveRows = (tableName: string, expectedCount: number) => {
  const actualCount = getTableCount(tableName);
  expect(actualCount).toBe(expectedCount);
};

export const expectIngredientToExist = (ingredient_key: string, language_code: string = 'en') => {
  const db = getTestDatabase();
  const result = db.prepare(
    'SELECT * FROM ingredients WHERE ingredient_key = ? AND language_code = ?'
  ).get(ingredient_key, language_code);
  expect(result).toBeTruthy();
  return result;
};

export const expectUserToExist = (email: string) => {
  const db = getTestDatabase();
  const result = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  expect(result).toBeTruthy();
  return result;
};