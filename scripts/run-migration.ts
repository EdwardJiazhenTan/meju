import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const pool = new Pool({
  user: process.env.DB_USER || "admin",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "meal_planner",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
});

async function runMigration() {
  try {
    console.log("开始执行数据库迁移...");

    // 读取迁移SQL文件
    const migrationSQL = readFileSync(
      join(__dirname, "migrate-to-order-system.sql"),
      "utf-8",
    );

    // 执行迁移
    const client = await pool.connect();
    try {
      await client.query(migrationSQL);
      console.log("✅ 数据库迁移成功完成！");

      // 验证新表是否创建成功
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'orders'
      `);

      if (result.rows.length > 0) {
        console.log("✅ Orders表创建成功");
      } else {
        console.log("❌ Orders表创建失败");
      }

      // 验证meal_plans表是否已添加user_name字段
      const columnResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'meal_plans'
        AND column_name = 'user_name'
      `);

      if (columnResult.rows.length > 0) {
        console.log("✅ meal_plans表user_name字段添加成功");
      } else {
        console.log("❌ meal_plans表user_name字段添加失败");
      }

      // 检查示例数据
      const ordersCount = await client.query("SELECT COUNT(*) FROM orders");
      console.log(`📊 当前订单数量: ${ordersCount.rows[0].count}`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行迁移
runMigration();
