-- 菜品分类表
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 沙拉、肉食、主食等
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 基础菜品表
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cooking_steps TEXT, -- 制作步骤
    category_id INTEGER REFERENCES categories(id),
    base_calories INTEGER, -- 基础卡路里
    preparation_time INTEGER, -- 分钟
    servings INTEGER DEFAULT 1, -- 默认份数
    is_customizable BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 食材单位表
CREATE TABLE ingredient_units (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- 克、毫升、个、片、根等
    abbreviation VARCHAR(10) -- g, ml, 个, 片, 根
);

-- 食材表
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- 鸡胸肉、生菜、番茄等
    calories_per_unit DECIMAL(8,2), -- 每单位卡路里
    default_unit_id INTEGER REFERENCES ingredient_units(id),
    category VARCHAR(30), -- 蛋白质、蔬菜、主食、调料等
    created_at TIMESTAMP DEFAULT NOW()
);

-- 菜品食材关系表（基础配方）
CREATE TABLE dish_ingredients (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER REFERENCES dishes(id),
    ingredient_id INTEGER REFERENCES ingredients(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_id INTEGER REFERENCES ingredient_units(id),
    is_optional BOOLEAN DEFAULT false -- 是否可选食材
);

-- 定制选项组表
CREATE TABLE customization_groups (
    id SERIAL PRIMARY KEY,
    dish_id INTEGER REFERENCES dishes(id),
    name VARCHAR(50) NOT NULL, -- "选择蛋白质"、"添加蔬菜"等
    type VARCHAR(20) NOT NULL, -- 'single', 'multiple', 'quantity'
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER
);

-- 具体定制选项表（关联到具体食材）
CREATE TABLE customization_options (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES customization_groups(id),
    ingredient_id INTEGER REFERENCES ingredients(id),
    name VARCHAR(50) NOT NULL, -- 显示名称
    default_quantity DECIMAL(10,2), -- 默认数量
    unit_id INTEGER REFERENCES ingredient_units(id),
    display_order INTEGER
);

-- 用户菜单计划表
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    meal_name VARCHAR(50), -- 自由命名：早餐、午餐、晚餐、下午茶等
    created_at TIMESTAMP DEFAULT NOW()
);

-- 菜单项表
CREATE TABLE meal_items (
    id SERIAL PRIMARY KEY,
    meal_plan_id INTEGER REFERENCES meal_plans(id),
    dish_id INTEGER REFERENCES dishes(id),
    customizations JSONB, -- 存储定制的食材调整
    servings DECIMAL(4,2) DEFAULT 1, -- 份数（支持0.5份等）
    notes TEXT
);

-- 采购清单视图（用于统计一周采购需求）
CREATE VIEW weekly_shopping_list AS
WITH meal_ingredients AS (
    -- 基础食材
    SELECT 
        mp.date,
        di.ingredient_id,
        i.name as ingredient_name,
        di.quantity * mi.servings as needed_quantity,
        iu.name as unit_name,
        iu.abbreviation as unit_abbrev
    FROM meal_plans mp
    JOIN meal_items mi ON mp.id = mi.meal_plan_id  
    JOIN dish_ingredients di ON mi.dish_id = di.dish_id
    JOIN ingredients i ON di.ingredient_id = i.id
    JOIN ingredient_units iu ON di.unit_id = iu.id
    
    UNION ALL
    
    -- 定制食材（从JSONB解析）
    SELECT 
        mp.date,
        co.ingredient_id,
        i.name as ingredient_name,
        (customization_data->>'quantity')::DECIMAL * mi.servings as needed_quantity,
        iu.name as unit_name,
        iu.abbreviation as unit_abbrev
    FROM meal_plans mp
    JOIN meal_items mi ON mp.id = mi.meal_plan_id
    CROSS JOIN LATERAL jsonb_each(mi.customizations) AS custom(key, customization_data)
    JOIN customization_options co ON (customization_data->>'option_id')::INTEGER = co.id
    JOIN ingredients i ON co.ingredient_id = i.id
    JOIN ingredient_units iu ON co.unit_id = iu.id
    WHERE customization_data->>'selected' = 'true'
)
SELECT 
    ingredient_name,
    unit_name,
    unit_abbrev,
    SUM(needed_quantity) as total_quantity
FROM meal_ingredients 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    AND date <= CURRENT_DATE + INTERVAL '7 days'
GROUP BY ingredient_name, unit_name, unit_abbrev
ORDER BY ingredient_name;
