import { NextRequest, NextResponse } from "next/server";
import { dishQueries, ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Update ingredient quantity in dish
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string; ingredientId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const { dishId: dishIdParam, ingredientId: ingredientIdParam } = await params;
    const dishId = parseInt(dishIdParam);
    const ingredientId = parseInt(ingredientIdParam);

    if (isNaN(dishId) || isNaN(ingredientId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID or ingredient ID"),
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

    // Check if ingredient exists in dish
    const existingIngredient = dishQueries.getDishIngredientById(dishId, ingredientId);
    if (!existingIngredient) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient not found in this dish"),
        { status: 404 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    // Validation
    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Quantity must be greater than 0"),
        { status: 400 }
      );
    }

    // Update ingredient quantity
    dishQueries.updateDishIngredientQuantity(dishId, ingredientId, quantity);

    // Get updated ingredient details
    const ingredient = ingredientQueries.getIngredientById(ingredientId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Ingredient quantity updated successfully", {
        dishId,
        dishName: dish.name,
        updatedIngredient: {
          ...ingredient,
          quantity,
          previousQuantity: existingIngredient.quantity,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating dish ingredient:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Remove ingredient from dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string; ingredientId: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const { dishId: dishIdParam, ingredientId: ingredientIdParam } = await params;
    const dishId = parseInt(dishIdParam);
    const ingredientId = parseInt(ingredientIdParam);

    if (isNaN(dishId) || isNaN(ingredientId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID or ingredient ID"),
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

    // Check if ingredient exists in dish
    const existingIngredient = dishQueries.getDishIngredientById(dishId, ingredientId);
    if (!existingIngredient) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient not found in this dish"),
        { status: 404 }
      );
    }

    // Remove ingredient from dish
    dishQueries.removeIngredientFromDish(dishId, ingredientId);

    // Get ingredient details for response
    const ingredient = ingredientQueries.getIngredientById(ingredientId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Ingredient removed from dish successfully", {
        dishId,
        dishName: dish.name,
        removedIngredient: {
          ...ingredient,
          previousQuantity: existingIngredient.quantity,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing dish ingredient:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}