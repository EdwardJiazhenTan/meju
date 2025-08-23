import { NextRequest, NextResponse } from "next/server";
import { ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get ingredients grouped by categories
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const categorizedIngredients = ingredientQueries.getIngredientsByCategories();

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Categorized ingredients retrieved successfully", {
        categories: categorizedIngredients,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving categorized ingredients:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}