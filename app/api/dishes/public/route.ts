import { NextRequest, NextResponse } from "next/server";
import { dishQueries, ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get public dishes for discovery
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
    const searchQuery = url.searchParams.get("q");
    const meal = url.searchParams.get("meal");
    const tag = url.searchParams.get("tag");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get public dishes with filters
    let publicDishes;
    
    if (searchQuery) {
      publicDishes = dishQueries.searchPublicDishes(searchQuery, limit, offset);
    } else if (meal) {
      publicDishes = dishQueries.getPublicDishesByMeal(meal, limit, offset);
    } else if (tag) {
      publicDishes = dishQueries.getPublicDishesByTag(tag, limit, offset);
    } else {
      publicDishes = dishQueries.getPublicDishes(limit, offset);
    }

    // Enhance dishes with additional data
    const enhancedDishes = await Promise.all(
      publicDishes.map(async (dish) => {
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
      AuthHelper.createSuccessResponse("Public dishes retrieved successfully", {
        dishes: enhancedDishes,
        totalDishes: enhancedDishes.length,
        filters: {
          searchQuery,
          meal,
          tag,
          limit,
          offset,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving public dishes:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}