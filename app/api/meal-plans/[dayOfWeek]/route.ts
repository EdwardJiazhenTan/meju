import { NextRequest, NextResponse } from "next/server";
import { mealPlanQueries, dishQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Add dish to specific day's meal plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dayOfWeek: string }> },
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 },
      );
    }

    const { dayOfWeek: dayOfWeekParam } = await params;
    const dayOfWeek = parseInt(dayOfWeekParam);
    if (isNaN(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid day of week (must be 1-7)"),
        { status: 400 },
      );
    }

    const body = await request.json();
    const { dishId, mealType, servingSize = 1.0, customizations } = body;

    // Validation
    if (!dishId || !mealType) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish ID and meal type are required"),
        { status: 400 },
      );
    }

    const validMealTypes = ["breakfast", "lunch", "dinner", "dessert"];
    if (!validMealTypes.includes(mealType)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid meal type"),
        { status: 400 },
      );
    }

    if (servingSize <= 0) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Serving size must be greater than 0"),
        { status: 400 },
      );
    }

    // Check if dish exists and user has access to it
    const dish = dishQueries.getDishById(dishId);
    if (!dish) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish not found"),
        { status: 404 },
      );
    }

    // Check if user has access to this dish (owns it, it's public, or shared with them)
    const hasAccess = await mealPlanQueries.userHasAccessToDish(
      auth.user.userId,
      dishId,
    );
    if (!hasAccess) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("No access to this dish"),
        { status: 403 },
      );
    }

    // Add dish to meal plan (with or without customizations)
    if (customizations) {
      mealPlanQueries.addCustomizedDishToMealPlan(
        auth.user.userId,
        dayOfWeek,
        mealType,
        dishId,
        servingSize,
        JSON.stringify(customizations),
      );
    } else {
      mealPlanQueries.addDishToMealPlan(
        auth.user.userId,
        dayOfWeek,
        mealType,
        dishId,
        servingSize,
      );
    }

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish added to meal plan successfully", {
        dayOfWeek,
        mealType,
        dish: {
          dish_id: dish.dish_id,
          name: dish.name,
          meal: dish.meal,
        },
        servingSize,
      }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Error adding dish to meal plan:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 },
    );
  }
}
