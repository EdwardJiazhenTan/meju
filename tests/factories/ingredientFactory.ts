import { CreateIngredientData } from '../../lib/database';

export const createTestIngredient = (overrides: Partial<CreateIngredientData> = {}): CreateIngredientData => ({
  ingredient_key: 'test_ingredient',
  name: 'Test Ingredient',
  unit: 'gram',
  category: 'other',
  calories_per_unit: 100,
  language_code: 'en',
  ...overrides
});

export const createTestIngredientChinese = (ingredient_key: string = 'test_ingredient', overrides: Partial<CreateIngredientData> = {}): CreateIngredientData => ({
  ingredient_key,
  name: '测试食材',
  unit: '克',
  category: 'other',
  calories_per_unit: 100,
  language_code: 'zh-CN',
  ...overrides
});

export const createIngredientPair = (key: string, englishName: string, chineseName: string, category: string = 'other', calories: number = 50, enUnit: string = 'gram', zhUnit: string = '克') => {
  return [
    createTestIngredient({ 
      ingredient_key: key, 
      name: englishName,
      unit: enUnit,
      category: category as any,
      calories_per_unit: calories 
    }),
    createTestIngredientChinese(key, { 
      name: chineseName,
      unit: zhUnit,
      category: category as any,
      calories_per_unit: calories
    })
  ];
};

// 常用食材对
export const commonIngredients = {
  potato: () => createIngredientPair('potato', 'potato', '土豆', 'vegetable', 77, 'piece', '个'),
  rice: () => createIngredientPair('rice', 'rice', '米饭', 'grain', 130, 'gram', '克'),
  chicken: () => createIngredientPair('chicken_breast', 'chicken breast', '鸡胸肉', 'meat', 165, 'gram', '克'),
  tomato: () => createIngredientPair('tomato', 'tomato', '西红柿', 'vegetable', 18, 'piece', '个')
};