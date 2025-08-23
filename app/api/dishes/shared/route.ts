import { NextRequest, NextResponse } from "next/server";
import { dishQueries, ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get dishes shared with current user
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get dishes shared with current user
    const sharedDishes = dishQueries.getSharedWithUser(auth.user.userId, limit, offset);

    // Enhance dishes with additional data
    const enhancedDishes = await Promise.all(
      sharedDishes.map(async (dish) => {
        const ingredients = ingredientQueries.getDishIngredients(dish.dish_id);
        const tags = dishQueries.getDishTags(dish.dish_id);
        
        return {
          ...dish,
          ingredients: ingredients.slice(0, 5), // Show first 5 ingredients
          tags,
          ingredientCount: ingredients.length,
        };
      })
    );

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Shared dishes retrieved successfully", {
        dishes: enhancedDishes,
        totalDishes: enhancedDishes.length,
        pagination: { limit, offset },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving shared dishes:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}