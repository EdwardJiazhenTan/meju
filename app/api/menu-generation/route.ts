import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";

interface GenerateMenuRequest {
  user_name: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  period_type: "day" | "week";
}

interface MenuGenerationResult {
  user_name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  generated_meal_plans: any[];
  orders_processed: any[];
  summary: {
    total_orders: number;
    total_meals_generated: number;
    total_people_served: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMenuRequest = await request.json();
    const { user_name, start_date, end_date, period_type } = body;

    // Validate required fields
    if (!user_name || !start_date || !end_date || !period_type) {
      return NextResponse.json(
        {
          error:
            "user_name, start_date, end_date, and period_type are required",
        },
        { status: 400 },
      );
    }

    // Normalize and validate date format
    const normalizeDate = (dateStr: string) => {
      // Extract just the date part (YYYY-MM-DD) if it contains time or timezone info
      const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
      return dateMatch ? dateMatch[1] : dateStr;
    };

    const normalizedStartDate = normalizeDate(start_date);
    const normalizedEndDate = normalizeDate(end_date);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(normalizedStartDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(normalizedEndDate)
    ) {
      return NextResponse.json(
        { error: "Dates must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    // Validate period_type
    if (!["day", "week"].includes(period_type)) {
      return NextResponse.json(
        { error: 'period_type must be "day" or "week"' },
        { status: 400 },
      );
    }

    // Fetch orders for the user within the date range
    const ordersResult = await query(
      `SELECT * FROM orders
       WHERE user_name = $1
       AND order_date >= $2
       AND order_date <= $3
       AND status IN ('pending', 'confirmed')
       ORDER BY order_date ASC, meal_type ASC`,
      [user_name, normalizedStartDate, normalizedEndDate],
    );

    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return NextResponse.json({
        user_name,
        period_type,
        start_date: normalizedStartDate,
        end_date: normalizedEndDate,
        generated_meal_plans: [],
        orders_processed: [],
        summary: {
          total_orders: 0,
          total_meals_generated: 0,
          total_people_served: 0,
        },
      });
    }

    // Group orders by date and meal_type
    const ordersByMeal = orders.reduce((acc: any, order: any) => {
      // Normalize the order date to avoid timezone issues
      const orderDate = new Date(order.order_date).toISOString().split("T")[0];
      const key = `${orderDate}_${order.meal_type}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(order);
      return acc;
    }, {});

    const generatedMealPlans = [];
    let totalPeopleServed = 0;

    // Generate meal plans for each unique date-meal combination
    for (const [key, mealOrders] of Object.entries(ordersByMeal)) {
      const [date, meal_type] = key.split("_");
      const ordersForMeal = mealOrders as any[];

      // Calculate total people for this meal
      const peopleCount = ordersForMeal.reduce(
        (sum: number, order: any) => sum + order.people_count,
        0,
      );
      totalPeopleServed += peopleCount;

      // Check if meal plan already exists
      const existingMealPlan = await query(
        "SELECT id FROM meal_plans WHERE user_name = $1 AND date = $2 AND meal_name = $3",
        [user_name, date, meal_type],
      );

      let mealPlanId;

      if (existingMealPlan.rows.length > 0) {
        // Update existing meal plan
        mealPlanId = existingMealPlan.rows[0].id;
      } else {
        // Create new meal plan
        const newMealPlan = await query(
          `INSERT INTO meal_plans (user_name, date, meal_name)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [user_name, date, meal_type],
        );
        mealPlanId = newMealPlan.rows[0].id;
      }

      // For each order, try to find matching dish and create meal item
      for (const order of ordersForMeal) {
        // Try to find a dish that matches the order's dish name
        const dishResult = await query(
          "SELECT id FROM dishes WHERE LOWER(name) LIKE LOWER($1) LIMIT 1",
          [`%${order.dish_name}%`],
        );

        if (dishResult.rows.length > 0) {
          const dishId = dishResult.rows[0].id;

          // Create meal item
          await query(
            `INSERT INTO meal_items (meal_plan_id, dish_id, servings, notes)
             VALUES ($1, $2, $3, $4)`,
            [
              mealPlanId,
              dishId,
              order.people_count,
              `Generated from order: ${order.dish_name} for ${order.people_count} people${order.notes ? `. Notes: ${order.notes}` : ""}`,
            ],
          );

          // Mark order as completed
          await query("UPDATE orders SET status = $1 WHERE id = $2", [
            "completed",
            order.id,
          ]);
        } else {
          // If no matching dish found, create a note in meal plan
          console.log(
            `Warning: No matching dish found for "${order.dish_name}" in order ${order.id}`,
          );
        }
      }

      generatedMealPlans.push({
        meal_plan_id: mealPlanId,
        date,
        meal_type,
        people_count: peopleCount,
        orders_count: ordersForMeal.length,
        dishes: ordersForMeal.map((order: any) => ({
          dish_name: order.dish_name,
          people_count: order.people_count,
          notes: order.notes,
        })),
      });
    }

    const result: MenuGenerationResult = {
      user_name,
      period_type,
      start_date: normalizedStartDate,
      end_date: normalizedEndDate,
      generated_meal_plans: generatedMealPlans,
      orders_processed: orders,
      summary: {
        total_orders: orders.length,
        total_meals_generated: generatedMealPlans.length,
        total_people_served: totalPeopleServed,
      },
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error generating menu:", error);
    return NextResponse.json(
      { error: "Failed to generate menu" },
      { status: 500 },
    );
  }
}

// Get menu generation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_name = searchParams.get("user_name");
    const date = searchParams.get("date");

    if (!user_name) {
      return NextResponse.json(
        { error: "user_name parameter is required" },
        { status: 400 },
      );
    }

    let queryText = `
      SELECT mp.*,
             COUNT(mi.id) as meal_items_count,
             ARRAY_AGG(
               JSON_BUILD_OBJECT(
                 'dish_id', mi.dish_id,
                 'servings', mi.servings,
                 'notes', mi.notes,
                 'dish_name', d.name
               )
             ) FILTER (WHERE mi.id IS NOT NULL) as meal_items
      FROM meal_plans mp
      LEFT JOIN meal_items mi ON mp.id = mi.meal_plan_id
      LEFT JOIN dishes d ON mi.dish_id = d.id
      WHERE mp.user_name = $1
    `;

    const params = [user_name];
    let paramCount = 1;

    if (date) {
      paramCount++;
      queryText += ` AND mp.date = $${paramCount}`;
      params.push(date);
    }

    queryText += `
      GROUP BY mp.id, mp.user_name, mp.date, mp.meal_name, mp.created_at
      ORDER BY mp.date DESC, mp.meal_name ASC
    `;

    const result = await query(queryText, params);
    const mealPlans = result.rows;

    return NextResponse.json({ meal_plans: mealPlans });
  } catch (error) {
    console.error("Error fetching generated menus:", error);
    return NextResponse.json(
      { error: "Failed to fetch generated menus" },
      { status: 500 },
    );
  }
}
