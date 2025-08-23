import { NextRequest, NextResponse } from "next/server";
import { dishQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

const VALID_MEALS = ["breakfast", "lunch", "dinner", "dessert"] as const;
const VALID_VISIBILITY = ["private", "shared", "public"] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: { dishId: string } },
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 },
      );
    }

    const dishId = parseInt(params.dishId);
    if (isNaN(dishId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID"),
        { status: 400 },
      );
    }

    // Get dish from database
    const dish = dishQueries.getDishById(dishId);
    if (!dish) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Dish not found"),
        { status: 404 },
      );
    }

    if (dish.owner_id !== auth.user.userId && dish.visibility === "private") {
      return NextResponse.json(
        AuthHelper.createErrorResponse(
          "Permission denied to view this dish",
        ),
        { status: 403 },
      );
    }

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish details retrieved successfully", {
        dish,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving dish details:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      {
        status: 500,
      },
    );
  }
}

// Update dish
export async function PUT(
  request: NextRequest,
  { params }: { params: { dishId: string } },
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        {
          status: 401,
        },
      );
    }

    const dishId = parseInt(params.dishId);
    if (isNaN(dishId)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid dish ID"),
        {
          status: 400,
        },
      );
    }

    // Check if dish exists and belongs to current user
    const existingDish = dishQueries.getDishById(dishId);
    if (!existingDish) {
      return NextResponse.json(AuthHelper.createErrorResponse("Dish not found"), {
        status: 404,
      });
    }

    if (existingDish.owner_id !== auth.user.userId) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Can only modify your own dishes"),
        { status: 403 },
      );
    }

    // Parse update data
    const body = await request.json();
    const {
      name,
      description,
      calories,
      meal,
      special,
      url,
      visibility,
      prep_time,
      cook_time,
    } = body;

    // Validate meal type (if provided)
    if (meal && !VALID_MEALS.includes(meal)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid meal type"),
        { status: 400 },
      );
    }

    // Validate visibility (if provided)
    if (visibility && !VALID_VISIBILITY.includes(visibility)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid visibility setting"),
        { status: 400 },
      );
    }

    // Update dish data
    const updateData = {
      name: name || existingDish.name,
      description:
        description !== undefined ? description : existingDish.description,
      calories: calories !== undefined ? calories : existingDish.calories,
      meal: meal || existingDish.meal,
      special: special !== undefined ? special : existingDish.special,
      url: url !== undefined ? url : existingDish.url,
      visibility: visibility || existingDish.visibility,
      prep_time: prep_time !== undefined ? prep_time : existingDish.prep_time,
      cook_time: cook_time !== undefined ? cook_time : existingDish.cook_time,
    };

    dishQueries.updateDish(dishId, updateData);

    // Get updated dish
    const updatedDish = dishQueries.getDishById(dishId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Dish updated successfully", { dish: updatedDish }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json(AuthHelper.createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}

// Delete dish
export async function DELETE(
  request: NextRequest,
  { params }: { params: { dishId: string } },
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(AuthHelper.createErrorResponse("Login required"), {
        status: 401,
      });
    }

    const dishId = parseInt(params.dishId);
    if (isNaN(dishId)) {
      return NextResponse.json(AuthHelper.createErrorResponse("Invalid dish ID"), {
        status: 400,
      });
    }

    // Check if dish exists and belongs to current user
    const dish = dishQueries.getDishById(dishId);
    if (!dish) {
      return NextResponse.json(AuthHelper.createErrorResponse("Dish not found"), {
        status: 404,
      });
    }

    if (dish.owner_id !== auth.user.userId) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Can only delete your own dishes"),
        { status: 403 },
      );
    }

    // Delete dish (foreign key constraints will automatically delete related ingredients, tags, etc.)
    dishQueries.deleteDish(dishId);

    return NextResponse.json(AuthHelper.createSuccessResponse("Dish deleted successfully"), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(AuthHelper.createErrorResponse("Internal server error"), {
      status: 500,
    });
  }
}
