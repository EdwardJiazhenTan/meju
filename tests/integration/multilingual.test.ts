import { getTestDatabase } from '../setup';
import { createTestUser } from '../factories/userFactory';
import { createTestIngredient, commonIngredients } from '../factories/ingredientFactory';

// 多语言功能集成测试
describe('多语言功能集成测试 (Multilingual Integration Tests)', () => {
  let testUserId: number;

  beforeEach(() => {
    const userData = createTestUser({ 
      email: `multilingual-test-${Math.random().toString(36).substring(7)}@example.com`,
      username: `multilingual-testuser-${Math.random().toString(36).substring(7)}`
    });
    
    const db = getTestDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, display_name, registration_method)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      userData.username || null,
      userData.email,
      userData.password_hash || null,
      userData.display_name || null,
      userData.registration_method,
    );
    testUserId = result.lastInsertRowid as number;
  });

  describe('食材多语言管理 (Ingredient Multilingual Management)', () => {
    test('应该能创建完整的中英文食材库', () => {
      const db = getTestDatabase();
      const createIngredientStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 创建多种食材的中英文对
      const ingredientPairs = [
        { key: 'rice', en: 'rice', zh: '米饭', category: 'grain', calories: 130, en_unit: 'gram', zh_unit: '克' },
        { key: 'chicken', en: 'chicken breast', zh: '鸡胸肉', category: 'meat', calories: 165, en_unit: 'gram', zh_unit: '克' },
        { key: 'tomato', en: 'tomato', zh: '西红柿', category: 'vegetable', calories: 18, en_unit: 'piece', zh_unit: '个' },
        { key: 'soy_sauce', en: 'soy sauce', zh: '生抽', category: 'other', calories: 8, en_unit: 'ml', zh_unit: '毫升' },
        { key: 'onion', en: 'onion', zh: '洋葱', category: 'vegetable', calories: 40, en_unit: 'piece', zh_unit: '个' }
      ];

      ingredientPairs.forEach(pair => {
        // 创建英文版本
        createIngredientStmt.run(pair.key, pair.en, pair.en_unit, pair.category, pair.calories, 'en');
        // 创建中文版本
        createIngredientStmt.run(pair.key, pair.zh, pair.zh_unit, pair.category, pair.calories, 'zh-CN');
      });

      // 验证创建的食材数量
      const countStmt = db.prepare('SELECT COUNT(*) as count FROM ingredients');
      const count = countStmt.get() as { count: number };
      expect(count.count).toBe(10); // 5对食材 × 2语言

      // 验证每种语言的食材数量
      const enCountStmt = db.prepare("SELECT COUNT(*) as count FROM ingredients WHERE language_code = 'en'");
      const zhCountStmt = db.prepare("SELECT COUNT(*) as count FROM ingredients WHERE language_code = 'zh-CN'");
      
      expect((enCountStmt.get() as { count: number }).count).toBe(5);
      expect((zhCountStmt.get() as { count: number }).count).toBe(5);
    });

    test('应该能根据用户语言偏好返回正确的食材', () => {
      const db = getTestDatabase();
      
      // 创建测试食材
      const [english, chinese] = commonIngredients.potato();
      const createStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      createStmt.run(english.ingredient_key, english.name, english.unit, english.category, english.calories_per_unit, english.language_code);
      createStmt.run(chinese.ingredient_key, chinese.name, chinese.unit, chinese.category, chinese.calories_per_unit, chinese.language_code);

      // 模拟用户偏好中文的查询
      const getChineseStmt = db.prepare(`
        SELECT * FROM ingredients 
        WHERE ingredient_key = 'potato' AND language_code = 'zh-CN'
      `);
      const chineseResult = getChineseStmt.get();
      expect((chineseResult as any).name).toBe('土豆');
      expect((chineseResult as any).unit).toBe('个');

      // 模拟用户偏好英文的查询  
      const getEnglishStmt = db.prepare(`
        SELECT * FROM ingredients 
        WHERE ingredient_key = 'potato' AND language_code = 'en'
      `);
      const englishResult = getEnglishStmt.get();
      expect((englishResult as any).name).toBe('potato');
      expect((englishResult as any).unit).toBe('piece');
    });

    test('应该能正确处理部分翻译的情况', () => {
      const db = getTestDatabase();
      const createStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 创建一些完整的翻译
      createStmt.run('complete_item', 'Complete Item', 'gram', 'other', 100, 'en');
      createStmt.run('complete_item', '完整食材', '克', 'other', 100, 'zh-CN');

      // 创建只有英文的食材
      createStmt.run('english_only', 'English Only Item', 'piece', 'other', 50, 'en');

      // 查询完整翻译的食材
      const completeQuery = db.prepare(`
        SELECT * FROM ingredients 
        WHERE ingredient_key = 'complete_item' AND language_code = 'zh-CN'
      `);
      const completeResult = completeQuery.get();
      expect((completeResult as any).name).toBe('完整食材');

      // 查询只有英文的食材，应该回退到英文
      const fallbackQuery = db.prepare(`
        SELECT * FROM ingredients 
        WHERE ingredient_key = 'english_only' AND language_code = 'zh-CN'
        UNION
        SELECT * FROM ingredients 
        WHERE ingredient_key = 'english_only' AND language_code = 'en' AND NOT EXISTS (
          SELECT 1 FROM ingredients WHERE ingredient_key = 'english_only' AND language_code = 'zh-CN'
        )
        LIMIT 1
      `);
      const fallbackResult = fallbackQuery.get();
      expect((fallbackResult as any).name).toBe('English Only Item');
      expect((fallbackResult as any).language_code).toBe('en');
    });

    test('应该能识别缺失的翻译', () => {
      const db = getTestDatabase();
      const createStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 创建混合的翻译状态
      createStmt.run('complete1', 'Complete 1', 'gram', 'other', 100, 'en');
      createStmt.run('complete1', '完整1', '克', 'other', 100, 'zh-CN');
      createStmt.run('complete2', 'Complete 2', 'piece', 'other', 200, 'en'); 
      createStmt.run('complete2', '完整2', '个', 'other', 200, 'zh-CN');
      createStmt.run('incomplete1', 'Incomplete 1', 'ml', 'other', 50, 'en');
      createStmt.run('incomplete2', 'Incomplete 2', 'kg', 'other', 300, 'en');

      // 查找缺失翻译的食材
      const missingTranslationsQuery = db.prepare(`
        SELECT ingredient_key, GROUP_CONCAT(language_code) as languages
        FROM ingredients 
        GROUP BY ingredient_key
        HAVING COUNT(DISTINCT language_code) < 2
      `);
      
      const missingResults = missingTranslationsQuery.all() as { ingredient_key: string; languages: string }[];
      expect(missingResults).toHaveLength(2);
      expect(missingResults.map(r => r.ingredient_key)).toContain('incomplete1');
      expect(missingResults.map(r => r.ingredient_key)).toContain('incomplete2');
    });
  });

  describe('食谱多语言支持 (Recipe Multilingual Support)', () => {
    test('应该能创建包含多语言食材的菜谱', () => {
      const db = getTestDatabase();
      
      // 创建多语言食材
      const createIngredientStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      createIngredientStmt.run('rice', 'rice', 'gram', 'grain', 130, 'en');
      createIngredientStmt.run('rice', '米饭', '克', 'grain', 130, 'zh-CN');
      createIngredientStmt.run('chicken', 'chicken breast', 'gram', 'meat', 165, 'en');
      createIngredientStmt.run('chicken', '鸡胸肉', '克', 'meat', 165, 'zh-CN');

      // 创建菜谱
      const createDishStmt = db.prepare(`
        INSERT INTO dishes (owner_id, name, description, calories, meal, visibility)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const dishResult = createDishStmt.run(testUserId, '鸡肉炒饭', '美味的中式炒饭', 450, 'lunch', 'private');
      const dishId = dishResult.lastInsertRowid as number;

      // 获取食材ID
      const riceId = (db.prepare("SELECT ingredient_id FROM ingredients WHERE ingredient_key = 'rice' AND language_code = 'zh-CN'").get() as any).ingredient_id;
      const chickenId = (db.prepare("SELECT ingredient_id FROM ingredients WHERE ingredient_key = 'chicken' AND language_code = 'zh-CN'").get() as any).ingredient_id;

      // 为菜谱添加食材
      const addIngredientStmt = db.prepare(`
        INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
        VALUES (?, ?, ?)
      `);
      addIngredientStmt.run(dishId, riceId, 200);
      addIngredientStmt.run(dishId, chickenId, 150);

      // 验证菜谱的食材 (中文版本)
      const getChineseIngredientsStmt = db.prepare(`
        SELECT i.name, i.unit, di.quantity
        FROM dish_ingredients di
        JOIN ingredients i ON di.ingredient_id = i.ingredient_id
        WHERE di.dish_id = ? AND i.language_code = 'zh-CN'
        ORDER BY i.name
      `);
      
      const chineseIngredients = getChineseIngredientsStmt.all(dishId);
      expect(chineseIngredients).toHaveLength(2);
      expect((chineseIngredients[0] as any).name).toBe('米饭');
      expect((chineseIngredients[1] as any).name).toBe('鸡胸肉');

      // 验证相同菜谱的英文版本食材
      const getEnglishIngredientsStmt = db.prepare(`
        SELECT i_en.name, i_en.unit, di.quantity
        FROM dish_ingredients di
        JOIN ingredients i_zh ON di.ingredient_id = i_zh.ingredient_id
        JOIN ingredients i_en ON i_zh.ingredient_key = i_en.ingredient_key AND i_en.language_code = 'en'
        WHERE di.dish_id = ? AND i_zh.language_code = 'zh-CN'
        ORDER BY i_en.name
      `);
      
      const englishIngredients = getEnglishIngredientsStmt.all(dishId);
      expect(englishIngredients).toHaveLength(2);
      expect((englishIngredients[0] as any).name).toBe('chicken breast');
      expect((englishIngredients[1] as any).name).toBe('rice');
    });
  });

  describe('搜索功能多语言测试 (Multilingual Search Tests)', () => {
    test('应该能跨语言搜索食材', () => {
      const db = getTestDatabase();
      const createStmt = db.prepare(`
        INSERT INTO ingredients (ingredient_key, name, unit, category, calories_per_unit, language_code)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      // 创建可搜索的食材
      createStmt.run('tomato', 'tomato', 'piece', 'vegetable', 18, 'en');
      createStmt.run('tomato', '西红柿', '个', 'vegetable', 18, 'zh-CN');
      createStmt.run('tomato', '番茄', '个', 'vegetable', 18, 'zh-CN'); // 同义词

      // 英文搜索
      const englishSearchStmt = db.prepare(`
        SELECT * FROM ingredients 
        WHERE LOWER(name) LIKE LOWER(?) AND language_code = 'en'
      `);
      const englishResults = englishSearchStmt.all('%tomato%');
      expect(englishResults).toHaveLength(1);
      expect((englishResults[0] as any).name).toBe('tomato');

      // 中文搜索 - 西红柿
      const chineseSearch1Stmt = db.prepare(`
        SELECT * FROM ingredients 
        WHERE name LIKE ? AND language_code = 'zh-CN'
      `);
      const chineseResults1 = chineseSearch1Stmt.all('%西红柿%');
      expect(chineseResults1).toHaveLength(1);
      expect((chineseResults1[0] as any).name).toBe('西红柿');

      // 中文搜索 - 番茄
      const chineseResults2 = chineseSearch1Stmt.all('%番茄%');
      expect(chineseResults2).toHaveLength(1);
      expect((chineseResults2[0] as any).name).toBe('番茄');
    });
  });
});