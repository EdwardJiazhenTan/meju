import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";
import { MealPlan } from "@/types/database";

interface CreateMealPlanData {
  user_name?: string; // optional user name
  date: string; // YYYY-MM-DD format
  meal_name: string; // breakfast, lunch, dinner, etc.
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMealPlanData = await request.json();
    const { user_name, date, meal_name } = body;

    // Validate required fields
    if (!date || !meal_name) {
      return NextResponse.json(
        { error: "Date and meal_name are required" },
        { status: 400 },
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Date must be in YYYY-MM-DD format" },
        { status: 400 },
      );
    }

    // Check if meal plan already exists for this date, meal, and user
    let existingCheck;
    if (user_name) {
      existingCheck = await query(
        "SELECT id FROM meal_plans WHERE user_name = $1 AND date = $2 AND meal_name = $3",
        [user_name, date, meal_name],
      );
    } else {
      existingCheck = await query(
        "SELECT id FROM meal_plans WHERE user_name IS NULL AND date = $1 AND meal_name = $2",
        [date, meal_name],
      );
    }

    if (existingCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "Meal plan already exists for this date and meal" },
        { status: 409 },
      );
    }

    // Create new meal plan
    const result = await query(
      `INSERT INTO meal_plans (user_name, date, meal_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [user_name || null, date, meal_name],
    );

    const mealPlan = result.rows[0];

    return NextResponse.json({ mealPlan }, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to create meal plan" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_name = searchParams.get("user_name");
    const date = searchParams.get("date");
    const meal_name = searchParams.get("meal_name");

    let queryText = "SELECT * FROM meal_plans WHERE 1=1";
    const params: any[] = [];
    let paramCount = 0;

    if (user_name) {
      paramCount++;
      queryText += ` AND user_name = $${paramCount}`;
      params.push(user_name);
    }

    if (date) {
      paramCount++;
      queryText += ` AND date = $${paramCount}`;
      params.push(date);
    }

    if (meal_name) {
      paramCount++;
      queryText += ` AND meal_name = $${paramCount}`;
      params.push(meal_name);
    }

    queryText += " ORDER BY date ASC, meal_name ASC";

    const result = await query(queryText, params);
    const mealPlans = result.rows;

    return NextResponse.json({ mealPlans });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch meal plans" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, meal_name } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Meal plan ID is required" },
        { status: 400 },
      );
    }

    // Check if meal plan exists
    const existingCheck = await query(
      "SELECT id FROM meal_plans WHERE id = $1",
      [id],
    );
    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 },
      );
    }

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 0;

    if (date) {
      paramCount++;
      updates.push(`date = $${paramCount}`);
      params.push(date);
    }

    if (meal_name) {
      paramCount++;
      updates.push(`meal_name = $${paramCount}`);
      params.push(meal_name);
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
      `UPDATE meal_plans SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      params,
    );

    const mealPlan = result.rows[0];

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Failed to update meal plan" },
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
        { error: "Meal plan ID is required" },
        { status: 400 },
      );
    }

    // Check if meal plan exists
    const existingCheck = await query(
      "SELECT id FROM meal_plans WHERE id = $1",
      [id],
    );
    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 },
      );
    }

    // Delete meal plan (this will cascade to meal_items if you have foreign key constraints)
    await query("DELETE FROM meal_plans WHERE id = $1", [parseInt(id)]);

    return NextResponse.json({ message: "Meal plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting meal plan:", error);
    return NextResponse.json(
      { error: "Failed to delete meal plan" },
      { status: 500 },
    );
  }
}
