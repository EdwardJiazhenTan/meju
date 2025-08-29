import { CreateDishData } from '../../lib/database';

export const createTestDish = (owner_id: number, overrides: Partial<CreateDishData> = {}): CreateDishData => ({
  owner_id,
  name: 'Test Dish',
  description: 'A test dish for unit testing',
  calories: 300,
  meal: 'dinner',
  special: false,
  url: null,
  visibility: 'private',
  prep_time: 15,
  cook_time: 30,
  ...overrides
});

export const createTestDishChinese = (owner_id: number, overrides: Partial<CreateDishData> = {}): CreateDishData => ({
  owner_id,
  name: '测试菜谱',
  description: '这是一个用于单元测试的菜谱',
  calories: 400,
  meal: 'lunch',
  special: false,
  visibility: 'private',
  prep_time: 20,
  cook_time: 25,
  ...overrides
});

export const createPublicDish = (owner_id: number, overrides: Partial<CreateDishData> = {}): CreateDishData => 
  createTestDish(owner_id, { visibility: 'public', ...overrides });

export const createSharedDish = (owner_id: number, overrides: Partial<CreateDishData> = {}): CreateDishData => 
  createTestDish(owner_id, { visibility: 'shared', ...overrides });

// 常用菜谱模板
export const dishTemplates = {
  breakfast: (owner_id: number) => createTestDish(owner_id, { 
    name: 'Test Breakfast', 
    meal: 'breakfast',
    calories: 250,
    prep_time: 5,
    cook_time: 10
  }),
  lunch: (owner_id: number) => createTestDish(owner_id, { 
    name: 'Test Lunch', 
    meal: 'lunch',
    calories: 400,
    prep_time: 15,
    cook_time: 20
  }),
  dinner: (owner_id: number) => createTestDish(owner_id, { 
    name: 'Test Dinner', 
    meal: 'dinner',
    calories: 600,
    prep_time: 20,
    cook_time: 45
  }),
  dessert: (owner_id: number) => createTestDish(owner_id, { 
    name: 'Test Dessert', 
    meal: 'dessert',
    calories: 200,
    prep_time: 10,
    cook_time: 15
  })
};