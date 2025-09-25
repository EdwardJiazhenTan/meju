import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";
import { Order } from "@/types/database";

interface CreateOrderData {
  user_name: string;
  order_date: string; // YYYY-MM-DD format
  meal_type: string; // breakfast, lunch, dinner
  dish_name: string;
  people_count: number;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderData = await request.json();
    const { user_name, order_date, meal_type, dish_name, people_count, notes } =
      body;

    // Validate required fields
    if (
      !user_name ||
      !order_date ||
      !meal_type ||
      !dish_name ||
      !people_count
    ) {
      return NextResponse.json(
        {
          error:
            "user_name, order_date, meal_type, dish_name, and people_count are required",
        },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(order_date)) {
      return NextResponse.json(
        { error: "order_date must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    // Validate meal_type
    const validMealTypes = ["breakfast", "lunch", "dinner"];
    if (!validMealTypes.includes(meal_type.toLowerCase())) {
      return NextResponse.json(
        { error: "meal_type must be breakfast, lunch, or dinner" },
        { status: 400 },
      );
    }

    // Validate people_count
    if (people_count <= 0) {
      return NextResponse.json(
        { error: "people_count must be greater than 0" },
        { status: 400 },
      );
    }

    // Create new order
    const result = await query(
      `INSERT INTO orders (user_name, order_date, meal_type, dish_name, people_count, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_name,
        order_date,
        meal_type.toLowerCase(),
        dish_name,
        people_count,
        notes || null,
      ],
    );

    const order = result.rows[0];

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_name = searchParams.get("user_name");
    const order_date = searchParams.get("order_date");
    const meal_type = searchParams.get("meal_type");
    const status = searchParams.get("status");

    let queryText = "SELECT * FROM orders WHERE 1=1";
    const params: any[] = [];
    let paramCount = 0;

    if (user_name) {
      paramCount++;
      queryText += ` AND user_name = $${paramCount}`;
      params.push(user_name);
    }

    if (order_date) {
      paramCount++;
      queryText += ` AND order_date = $${paramCount}`;
      params.push(order_date);
    }

    if (meal_type) {
      paramCount++;
      queryText += ` AND meal_type = $${paramCount}`;
      params.push(meal_type.toLowerCase());
    }

    if (status) {
      paramCount++;
      queryText += ` AND status = $${paramCount}`;
      params.push(status.toLowerCase());
    }

    queryText += " ORDER BY order_date ASC, meal_type ASC, created_at ASC";

    const result = await query(queryText, params);
    const orders = result.rows;

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      user_name,
      order_date,
      meal_type,
      dish_name,
      people_count,
      notes,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Check if order exists
    const existingCheck = await query("SELECT id FROM orders WHERE id = $1", [
      id,
    ]);
    if (existingCheck.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (user_name) {
      paramCount++;
      updates.push(`user_name = $${paramCount}`);
      params.push(user_name);
    }

    if (order_date) {
      paramCount++;
      updates.push(`order_date = $${paramCount}`);
      params.push(order_date);
    }

    if (meal_type) {
      paramCount++;
      updates.push(`meal_type = $${paramCount}`);
      params.push(meal_type.toLowerCase());
    }

    if (dish_name) {
      paramCount++;
      updates.push(`dish_name = $${paramCount}`);
      params.push(dish_name);
    }

    if (people_count) {
      paramCount++;
      updates.push(`people_count = $${paramCount}`);
      params.push(people_count);
    }

    if (notes !== undefined) {
      paramCount++;
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
    }

    if (status) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status.toLowerCase());
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    paramCount++;
    params.push(id);

    const result = await query(
      `UPDATE orders SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      params,
    );

    const order = result.rows[0];

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Check if order exists
    const existingCheck = await query("SELECT id FROM orders WHERE id = $1", [
      id,
    ]);
    if (existingCheck.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Delete order
    await query("DELETE FROM orders WHERE id = $1", [parseInt(id)]);

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}
