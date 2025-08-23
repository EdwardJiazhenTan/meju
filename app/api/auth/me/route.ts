import { NextRequest, NextResponse } from "next/server";
import { userQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Unauthorized"),
        { status: 401 }
      );
    }

    // Get full user details
    const user = userQueries.getUserById(authResult.user.userId);
    if (!user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      AuthHelper.createSuccessResponse("User details retrieved", {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          display_name: user.display_name,
          profile_public: user.profile_public,
          registration_method: user.registration_method,
          created_at: user.created_at,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user details error:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}