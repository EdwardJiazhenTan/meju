import { NextRequest, NextResponse } from "next/server";
import { dishQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

const VALID_TAGS = ["drink", "dessert", "vegetable", "meat", "carbohydrate"] as const;

// Remove specific tag from dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dishId: string; tag: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const { dishId: dishIdParam, tag } = await params;
    const dishId = parseInt(dishIdParam);

    if (isNaN(dishId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID"),
        { status: 400 }
      );
    }

    // Validate tag
    if (!VALID_TAGS.includes(tag as typeof VALID_TAGS[number])) {
      return NextResponse.json(
        AuthHelper.createErrorResponse(`Invalid tag. Valid tags are: ${VALID_TAGS.join(', ')}`),
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

    // Check if tag exists for this dish
    const existingTags = dishQueries.getDishTags(dishId);
    if (!existingTags.includes(tag)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Tag not found for this dish"),
        { status: 404 }
      );
    }

    // Remove tag from dish
    dishQueries.removeTagFromDish(dishId, tag);

    // Get updated tags
    const updatedTags = dishQueries.getDishTags(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Tag removed from dish successfully", {
        dishId,
        dishName: dish.name,
        removedTag: tag,
        remainingTags: updatedTags,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing tag from dish:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}