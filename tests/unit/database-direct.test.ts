import { getTestDatabase } from '../setup';
import { createTestUser, createTestUserChinese } from '../factories/userFactory';
import { createTestIngredient, createTestIngredientChinese, commonIngredients } from '../factories/ingredientFactory';
import { createTestDish, createPublicDish } from '../factories/dishFactory';

// Direct database test queries (simplified versions of lib/database.ts functions)
const testQueries = {
  // User operations
  createUser: (userData: any) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, registration_method)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(
      userData.username || null,
      userData.email,
      userData.password_hash || null,
      userData.display_name || null,
      userData.registration_method,
    );
  },

  getUserByEmail: (email: string) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  },

  // Ingredient operations
  createIngredient: (ingredientData: any) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      ingredientData.ingredient_key,
      ingredientData.name,
      ingredientData.unit || null,
      ingredientData.category || null,
      ingredientData.calories_per_unit || null,
      ingredientData.language_code || 'en'
    );
  },

  getIngredientsByLanguage: (languageCode: string = 'en') => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ingredients 
      WHERE language_code = ?
      ORDER BY name
    `);
    return stmt.all(languageCode);
  },

  getIngredientByKey: (ingredientKey: string, languageCode: string = 'en') => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      SELECT * FROM ingredients 
      WHERE ingredient_key = ? AND language_code = ?
      UNION
      SELECT * FROM ingredients 
      WHERE ingredient_key = ? AND language_code = 'en' AND NOT EXISTS (
        SELECT 1 FROM ingredients WHERE ingredient_key = ? AND language_code = ?
      )
      LIMIT 1
    `);
    return stmt.get(ingredientKey, languageCode, ingredientKey, ingredientKey, languageCode);
  },

  getAllIngredientKeys: () => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      SELECT ingredient_key, GROUP_CONCAT(language_code) as languages
      FROM ingredients 
      GROUP BY ingredient_key
      ORDER BY ingredient_key
    `);
    const results = stmt.all() as { ingredient_key: string; languages: string }[];
    return results.map(row => ({
      ingredient_key: row.ingredient_key,
      languages: row.languages.split(',')
    }));
  },

  searchIngredients: (searchTerm: string) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE LOWER(name) LIKE LOWER(?) ORDER BY name");
    return stmt.all(`%${searchTerm}%`);
  },

  getIngredientsByCategory: (category: string) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT * FROM ingredients WHERE category = ? ORDER BY name");
    return stmt.all(category);
  },

  // Dish operations
  createDish: (dishData: any) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      INSERT INTO dishes (owner_id, name, description, calories, meal, special, url, visibility, prep_time, cook_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      dishData.owner_id,
      dishData.name,
      dishData.description || null,
      dishData.calories || null,
      dishData.meal,
      dishData.special ? 1 : 0,
      dishData.url || null,
      dishData.visibility || "private",
      dishData.prep_time || null,
      dishData.cook_time || null,
    );
  },

  getUserDishes: (userId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT * FROM dishes WHERE owner_id = ?");
    return stmt.all(userId);
  },

  getDishById: (dishId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT * FROM dishes WHERE dish_id = ?");
    return stmt.get(dishId);
  },

  getPublicDishes: (limit = 20, offset = 0) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      SELECT d.*, u.display_name as owner_name 
      FROM dishes d 
      JOIN users u ON d.owner_id = u.user_id 
      WHERE d.visibility = 'public'
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset);
  },

  updateDish: (dishId: number, updateData: any) => {
    const db = getTestDatabase();
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData).map(value => 
      typeof value === 'boolean' ? (value ? 1 : 0) : value
    );
    
    const stmt = db.prepare(`
      UPDATE dishes 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE dish_id = ?
    `);
    return stmt.run(...values, dishId);
  },

  deleteDish: (dishId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare("DELETE FROM dishes WHERE dish_id = ?");
    return stmt.run(dishId);
  },

  // Dish-Ingredient operations
  addIngredientToDish: (dishId: number, ingredientId: number, quantity: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
      VALUES (?, ?, ?)
    `);
    return stmt.run(dishId, ingredientId, quantity);
  },

  getDishIngredients: (dishId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      SELECT i.name, i.unit, di.quantity
      FROM dish_ingredients di
      JOIN ingredients i ON di.ingredient_id = i.ingredient_id
      WHERE di.dish_id = ?
    `);
    return stmt.all(dishId);
  },

  updateDishIngredientQuantity: (dishId: number, ingredientId: number, quantity: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare(`
      UPDATE dish_ingredients 
      SET quantity = ?
      WHERE dish_id = ? AND ingredient_id = ?
    `);
    return stmt.run(quantity, dishId, ingredientId);
  },

  getDishIngredientById: (dishId: number, ingredientId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare("SELECT quantity FROM dish_ingredients WHERE dish_id = ? AND ingredient_id = ?");
    return stmt.get(dishId, ingredientId);
  },

  removeIngredientFromDish: (dishId: number, ingredientId: number) => {
    const db = getTestDatabase();
    const stmt = db.prepare("DELETE FROM dish_ingredients WHERE dish_id = ? AND ingredient_id = ?");
    return stmt.run(dishId, ingredientId);
  }
};

describe('直接数据库查询功能测试 (Direct Database Query Tests)', () => {
  describe('用户操作 (User Operations)', () => {
    test('应该成功创建用户', () => {
      const userData = createTestUser();
      const result = testQueries.createUser(userData);
      
      expect(result.lastInsertRowid).toBeTruthy();
      expect(result.changes).toBe(1);
    });

    test('应该能根据邮箱查找用户', () => {
      const userData = createTestUser({ email: 'unique@test.com' });
      testQueries.createUser(userData);
      
      const user = testQueries.getUserByEmail('unique@test.com');
      expect(user).toBeTruthy();
      expect((user as any).email).toBe('unique@test.com');
      expect((user as any).username).toBe('testuser');
    });

    test('应该能创建中文用户', () => {
      const userData = createTestUserChinese();
      const result = testQueries.createUser(userData);
      
      expect(result.changes).toBe(1);
      
      const user = testQueries.getUserByEmail('test-zh@example.com');
      expect((user as any).display_name).toBe('测试用户');
    });
  });

  describe('食材操作 (Ingredient Operations)', () => {
    test('应该能创建英文食材', () => {
      const ingredientData = createTestIngredient();
      const result = testQueries.createIngredient(ingredientData);
      
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeTruthy();
    });

    test('应该能创建中英文食材对', () => {
      const [englishIngredient, chineseIngredient] = commonIngredients.potato();
      
      const enResult = testQueries.createIngredient(englishIngredient);
      const zhResult = testQueries.createIngredient(chineseIngredient);
      
      expect(enResult.changes).toBe(1);
      expect(zhResult.changes).toBe(1);
    });

    test('应该能根据语言获取食材', () => {
      // 创建英文和中文食材
      const [englishIngredient, chineseIngredient] = commonIngredients.rice();
      testQueries.createIngredient(englishIngredient);
      testQueries.createIngredient(chineseIngredient);
      
      const englishIngredients = testQueries.getIngredientsByLanguage('en');
      const chineseIngredients = testQueries.getIngredientsByLanguage('zh-CN');
      
      expect(englishIngredients.length).toBeGreaterThan(0);
      expect(chineseIngredients.length).toBeGreaterThan(0);
      expect((englishIngredients[0] as any).language_code).toBe('en');
      expect((chineseIngredients[0] as any).language_code).toBe('zh-CN');
    });

    test('应该能根据ingredient_key获取食材', () => {
      const [englishIngredient, chineseIngredient] = commonIngredients.chicken();
      testQueries.createIngredient(englishIngredient);
      testQueries.createIngredient(chineseIngredient);
      
      // 测试获取中文版本
      const chineseResult = testQueries.getIngredientByKey('chicken_breast', 'zh-CN');
      expect(chineseResult).toBeTruthy();
      expect((chineseResult as any).name).toBe('鸡胸肉');
      expect((chineseResult as any).ingredient_key).toBe('chicken_breast');
      
      // 测试获取英文版本
      const englishResult = testQueries.getIngredientByKey('chicken_breast', 'en');
      expect(englishResult).toBeTruthy();
      expect((englishResult as any).name).toBe('chicken breast');
      expect((englishResult as any).ingredient_key).toBe('chicken_breast');
    });

    test('应该在缺少翻译时回退到英文', () => {
      // 只创建英文版本
      const englishOnly = createTestIngredient({ 
        ingredient_key: 'english_only',
        name: 'English Only Ingredient' 
      });
      testQueries.createIngredient(englishOnly);
      
      // 请求中文但应该返回英文版本
      const result = testQueries.getIngredientByKey('english_only', 'zh-CN');
      expect(result).toBeTruthy();
      expect((result as any).name).toBe('English Only Ingredient');
      expect((result as any).language_code).toBe('en');
    });

    test('应该能获取所有食材keys及其语言', () => {
      // 创建多个食材对
      const [en1, zh1] = commonIngredients.potato();
      const [en2, zh2] = commonIngredients.tomato();
      
      testQueries.createIngredient(en1);
      testQueries.createIngredient(zh1);
      testQueries.createIngredient(en2);
      // 故意不创建tomato的中文版
      
      const keys = testQueries.getAllIngredientKeys();
      const potatoKey = keys.find(k => k.ingredient_key === 'potato');
      const tomatoKey = keys.find(k => k.ingredient_key === 'tomato');
      
      expect(potatoKey!.languages).toContain('en');
      expect(potatoKey!.languages).toContain('zh-CN');
      expect(tomatoKey!.languages).toContain('en');
      expect(tomatoKey!.languages).not.toContain('zh-CN');
    });

    test('应该能搜索食材', () => {
      const searchableIngredient = createTestIngredient({
        ingredient_key: 'unique_search_ingredient',
        name: 'Unique Search Ingredient'
      });
      testQueries.createIngredient(searchableIngredient);

      const searchResults = testQueries.searchIngredients('Unique Search');
      expect(searchResults.length).toBeGreaterThan(0);
      expect((searchResults[0] as any).name).toContain('Unique Search');
    });

    test('应该能按分类过滤食材', () => {
      const vegetableIngredient = createTestIngredient({
        ingredient_key: 'test_vegetable',
        name: 'Test Vegetable',
        category: 'vegetable'
      });
      const meatIngredient = createTestIngredient({
        ingredient_key: 'test_meat', 
        name: 'Test Meat',
        category: 'meat'
      });

      testQueries.createIngredient(vegetableIngredient);
      testQueries.createIngredient(meatIngredient);

      const vegetables = testQueries.getIngredientsByCategory('vegetable');
      const meat = testQueries.getIngredientsByCategory('meat');

      expect(vegetables.every((ing: any) => ing.category === 'vegetable')).toBe(true);
      expect(meat.every((ing: any) => ing.category === 'meat')).toBe(true);
    });
  });

  describe('菜谱操作 (Dish Operations)', () => {
    let testUserId: number;

    beforeEach(() => {
      const userData = createTestUser({ 
        email: `dish-test-${Math.random().toString(36).substring(7)}@example.com`,
        username: `dish-testuser-${Math.random().toString(36).substring(7)}`
      });
      const result = testQueries.createUser(userData);
      testUserId = result.lastInsertRowid as number;
    });

    test('应该能创建菜谱', () => {
      const dishData = createTestDish(testUserId);
      const result = testQueries.createDish(dishData);
      
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeTruthy();
    });

    test('应该能获取用户的菜谱', () => {
      // 创建多个菜谱
      testQueries.createDish(createTestDish(testUserId, { name: 'Dish 1' }));
      testQueries.createDish(createTestDish(testUserId, { name: 'Dish 2' }));
      
      const dishes = testQueries.getUserDishes(testUserId);
      expect(dishes).toHaveLength(2);
      expect((dishes[0] as any).owner_id).toBe(testUserId);
    });

    test('应该能获取公共菜谱', () => {
      // 创建公共和私人菜谱
      testQueries.createDish(createPublicDish(testUserId, { name: 'Public Dish' }));
      testQueries.createDish(createTestDish(testUserId, { name: 'Private Dish' }));
      
      const publicDishes = testQueries.getPublicDishes();
      expect(publicDishes.length).toBeGreaterThan(0);
      expect((publicDishes[0] as any).visibility).toBe('public');
    });

    test('应该能更新菜谱', () => {
      const dishData = createTestDish(testUserId);
      const createResult = testQueries.createDish(dishData);
      const dishId = createResult.lastInsertRowid as number;
      
      const updateResult = testQueries.updateDish(dishId, {
        name: 'Updated Dish Name',
        calories: 500
      });
      
      expect(updateResult.changes).toBe(1);
      
      const updatedDish = testQueries.getDishById(dishId);
      expect((updatedDish as any).name).toBe('Updated Dish Name');
      expect((updatedDish as any).calories).toBe(500);
    });

    test('应该能删除菜谱', () => {
      const dishData = createTestDish(testUserId);
      const createResult = testQueries.createDish(dishData);
      const dishId = createResult.lastInsertRowid as number;
      
      const deleteResult = testQueries.deleteDish(dishId);
      expect(deleteResult.changes).toBe(1);
      
      const deletedDish = testQueries.getDishById(dishId);
      expect(deletedDish).toBeUndefined();
    });
  });

  describe('食材-菜谱关系操作', () => {
    let testUserId: number;
    let testDishId: number; 
    let testIngredientId: number;

    beforeEach(() => {
      // 创建测试用户
      const userData = createTestUser({ 
        email: `relation-test-${Math.random().toString(36).substring(7)}@example.com`,
        username: `relation-testuser-${Math.random().toString(36).substring(7)}`
      });
      const userResult = testQueries.createUser(userData);
      testUserId = userResult.lastInsertRowid as number;

      // 创建测试菜谱
      const dishData = createTestDish(testUserId);
      const dishResult = testQueries.createDish(dishData);
      testDishId = dishResult.lastInsertRowid as number;

      // 创建测试食材
      const ingredientData = createTestIngredient();
      const ingredientResult = testQueries.createIngredient(ingredientData);
      testIngredientId = ingredientResult.lastInsertRowid as number;
    });

    test('应该能为菜谱添加食材', () => {
      const result = testQueries.addIngredientToDish(testDishId, testIngredientId, 100);
      expect(result.changes).toBe(1);
      
      const dishIngredients = testQueries.getDishIngredients(testDishId);
      expect(dishIngredients).toHaveLength(1);
      expect((dishIngredients[0] as any).quantity).toBe(100);
    });

    test('应该能更新菜谱中食材的用量', () => {
      // 先添加食材
      testQueries.addIngredientToDish(testDishId, testIngredientId, 100);
      
      // 更新用量
      const updateResult = testQueries.updateDishIngredientQuantity(testDishId, testIngredientId, 200);
      expect(updateResult.changes).toBe(1);
      
      const dishIngredient = testQueries.getDishIngredientById(testDishId, testIngredientId);
      expect((dishIngredient as any).quantity).toBe(200);
    });

    test('应该能从菜谱中移除食材', () => {
      // 先添加食材
      testQueries.addIngredientToDish(testDishId, testIngredientId, 100);
      
      // 移除食材
      const removeResult = testQueries.removeIngredientFromDish(testDishId, testIngredientId);
      expect(removeResult.changes).toBe(1);
      
      const dishIngredients = testQueries.getDishIngredients(testDishId);
      expect(dishIngredients).toHaveLength(0);
    });
  });
});