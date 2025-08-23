import { NextRequest, NextResponse } from "next/server";
import { dishQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

const VALID_TAGS = ["drink", "dessert", "vegetable", "meat", "carbohydrate"] as const;

// Get all tags for a specific dish
export async function GET(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const dishId = parseInt(params.dishId);
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

    // Get dish tags
    const tags = dishQueries.getDishTags(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish tags retrieved successfully", {
        dishId,
        dishName: dish.name,
        tags,
        totalTags: tags.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving dish tags:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Add tag to dish
export async function POST(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const dishId = parseInt(params.dishId);
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
    const { tag } = body;

    // Validation
    if (!tag) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Tag is required"),
        { status: 400 }
      );
    }

    // Validate tag value
    if (!VALID_TAGS.includes(tag)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse(`Invalid tag. Valid tags are: ${VALID_TAGS.join(', ')}`),
        { status: 400 }
      );
    }

    // Check if tag already exists for this dish
    const existingTags = dishQueries.getDishTags(dishId);
    if (existingTags.includes(tag)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Tag already exists for this dish"),
        { status: 409 }
      );
    }

    // Add tag to dish
    dishQueries.addTagToDish(dishId, tag);

    // Get updated tags
    const updatedTags = dishQueries.getDishTags(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Tag added to dish successfully", {
        dishId,
        dishName: dish.name,
        addedTag: tag,
        allTags: updatedTags,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding tag to dish:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}