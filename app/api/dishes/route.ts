import { NextRequest, NextResponse } from "next/server";
import { dishQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

const DEFAULT_VISIBILITY = "private" as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
      );
    }

    const dishes = dishQueries.getUserDishes(auth.user.userId);
    return NextResponse.json(
      AuthHelper.createSuccessResponse("Successfully fetched data", { dishes }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      calories,
      meal,
      special,
      url,
      prep_time,
      cook_time,
    } = body;

    if (!name || !meal) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Name and meal is required"),
        { status: 400 },
      );
    }

    const validMeals = ["breakfast", "lunch", "dinner", "dessert"];
    if (!validMeals.includes(meal)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid meal type"),
        { status: 400 },
      );
    }

    // Create dish data
    const dishData = {
      owner_id: auth.user.userId,
      name,
      description: description || null,
      calories: calories || null,
      meal,
      special: special ? 1 : 0,
      url: url || null,
      prep_time: prep_time || null,
      cook_time: cook_time || null,
      visibility: DEFAULT_VISIBILITY, // Default to private
    };

    const result = dishQueries.createDish(dishData);
    const dishId = result.lastInsertRowid as number;
    const newDish = dishQueries.getDishById(dishId);
    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish created successfully", {
        dish: newDish,
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 },
    );
  }
}
