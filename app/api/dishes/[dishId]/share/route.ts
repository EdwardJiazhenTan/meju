import { NextRequest, NextResponse } from "next/server";
import { dishQueries, userQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Share dish with another user
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
        AuthHelper.createErrorResponse("Can only share your own dishes"),
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userEmail, canReshare = false } = body;

    // Validation
    if (!userEmail) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User email is required"),
        { status: 400 }
      );
    }

    // Find user to share with
    const targetUser = userQueries.getUserByEmail(userEmail);
    if (!targetUser) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User not found"),
        { status: 404 }
      );
    }

    // Can't share with yourself
    if (targetUser.user_id === auth.user.userId) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Cannot share dish with yourself"),
        { status: 400 }
      );
    }

    // Check if already shared
    const existingShare = dishQueries.getDishShare(dishId, targetUser.user_id);
    if (existingShare) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish is already shared with this user"),
        { status: 409 }
      );
    }

    // Create share record
    dishQueries.shareDish(dishId, auth.user.userId, targetUser.user_id, canReshare);

    // Update dish visibility to 'shared' if it was private
    if (dish.visibility === 'private') {
      dishQueries.updateDish(dishId, { visibility: 'shared' });
    }

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish shared successfully", {
        dishId,
        dishName: dish.name,
        sharedWith: {
          userId: targetUser.user_id,
          email: targetUser.email,
          displayName: targetUser.display_name,
        },
        canReshare,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sharing dish:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Get sharing information for a dish
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
        AuthHelper.createErrorResponse("Can only view sharing info for your own dishes"),
        { status: 403 }
      );
    }

    // Get sharing information
    const shares = dishQueries.getDishShares(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish sharing info retrieved successfully", {
        dishId,
        dishName: dish.name,
        visibility: dish.visibility,
        shares,
        totalShares: shares.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving dish sharing info:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}