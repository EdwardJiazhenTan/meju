-- 迁移脚本：添加点餐系统功能
-- 运行前请备份数据库

-- 1. 创建订单表
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,  -- 用户名
    order_date DATE NOT NULL,         -- 点餐日期
    meal_type VARCHAR(20) NOT NULL,   -- breakfast/lunch/dinner
    dish_name VARCHAR(100) NOT NULL,  -- 菜品名称
    people_count INTEGER NOT NULL,    -- 人数
    notes TEXT,                       -- 备注
    status VARCHAR(20) DEFAULT 'pending', -- pending/confirmed/completed
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 修改meal_plans表，添加user_name字段
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_orders_user_name ON orders(user_name);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_meal_type ON orders(meal_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_name ON meal_plans(user_name);

-- 4. 插入一些示例数据（可选，用于测试）
INSERT INTO orders (user_name, order_date, meal_type, dish_name, people_count, notes, status) VALUES
('张三', CURRENT_DATE, 'lunch', '宫保鸡丁', 2, '不要太辣', 'pending'),
('李四', CURRENT_DATE, 'dinner', '红烧肉', 3, '多放点糖', 'pending'),
('王五', CURRENT_DATE + INTERVAL '1 day', 'breakfast', '小笼包', 1, '', 'pending');

-- 5. 创建视图，用于统计订单信息
CREATE OR REPLACE VIEW order_statistics AS
SELECT
    user_name,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    SUM(people_count) as total_people_served,
    MIN(order_date) as first_order_date,
    MAX(order_date) as latest_order_date
FROM orders
GROUP BY user_name
ORDER BY total_orders DESC;

-- 完成迁移
SELECT 'Order system migration completed successfully!' as status;
