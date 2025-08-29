import { NextRequest, NextResponse } from "next/server";
import { dishQueries, ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get all ingredients for a specific dish
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const { dishId: dishIdParam } = await params;
    const dishId = parseInt(dishIdParam);
    if (isNaN(dishId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID"),
        { status: 400 }
      );
    }

    // Check if dish exists and user has permission to view it
    const dish = dishQueries.getDishById(dishId);
    if (!dish) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish not found"),
        { status: 404 }
      );
    }

    // Check permissions (owner or public dish)
    if (dish.owner_id !== auth.user.userId && dish.visibility === 'private') {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Permission denied to view this dish"),
        { status: 403 }
      );
    }

    // Get dish ingredients
    const ingredients = dishQueries.getDishIngredients(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish ingredients retrieved successfully", {
        dishId,
        dishName: dish.name,
        ingredients,
        totalIngredients: ingredients.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving dish ingredients:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Add ingredient to dish
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const { dishId: dishIdParam } = await params;
    const dishId = parseInt(dishIdParam);
    if (isNaN(dishId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID"),
        { status: 400 }
      );
    }

    // Check if dish exists and belongs to current user
    const dish = dishQueries.getDishById(dishId);
    if (!dish) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish not found"),
        { status: 404 }
      );
    }

    if (dish.owner_id !== auth.user.userId) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Can only modify your own dishes"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { ingredientId, quantity } = body;

    // Validation
    if (!ingredientId || !quantity) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient ID and quantity are required"),
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Quantity must be greater than 0"),
        { status: 400 }
      );
    }

    // Check if ingredient exists
    const ingredient = ingredientQueries.getIngredientById(ingredientId);
    if (!ingredient) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient not found"),
        { status: 404 }
      );
    }

    // Check if ingredient is already in dish
    const existingIngredient = dishQueries.getDishIngredientById(dishId, ingredientId);
    if (existingIngredient) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient already exists in this dish. Use PUT to update quantity."),
        { status: 409 }
      );
    }

    // Add ingredient to dish
    dishQueries.addIngredientToDish(dishId, ingredientId, quantity);

    // Get updated dish ingredients
    const updatedIngredients = dishQueries.getDishIngredients(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Ingredient added to dish successfully", {
        dishId,
        dishName: dish.name,
        addedIngredient: {
          ...ingredient,
          quantity,
        },
        allIngredients: updatedIngredients,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding ingredient to dish:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}