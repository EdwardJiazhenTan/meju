import { NextRequest, NextResponse } from "next/server";
import { mealPlanQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get user's weekly meal plan
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    // Get user's meal plan
    const mealPlan = mealPlanQueries.getUserMealPlan(auth.user.userId);

    // Transform data into a more useful structure
    const organizedPlan = mealPlanQueries.organizeMealPlan(mealPlan);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Meal plan retrieved successfully", {
        mealPlan: organizedPlan,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving meal plan:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}