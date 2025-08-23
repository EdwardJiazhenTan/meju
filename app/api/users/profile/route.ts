import { NextRequest, NextResponse } from "next/server";
import { userQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get current user profile
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    // Get full user details
    const user = userQueries.getUserById(auth.user.userId);
    if (!user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User not found"),
        { status: 404 }
      );
    }

    // Get user statistics
    const userStats = userQueries.getUserStats(auth.user.userId);

    const profileData = {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        profile_public: user.profile_public,
        registration_method: user.registration_method,
        created_at: user.created_at,
      },
      stats: userStats,
    };

    return NextResponse.json(
      AuthHelper.createSuccessResponse("User profile retrieved successfully", profileData),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, display_name, profile_public } = body;

    // Get current user
    const currentUser = userQueries.getUserById(auth.user.userId);
    if (!currentUser) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User not found"),
        { status: 404 }
      );
    }

    // Check if username is already taken (if provided and different)
    if (username && username !== currentUser.username) {
      const existingUser = userQueries.getUserByUsername(username);
      if (existingUser) {
        return NextResponse.json(
          AuthHelper.createErrorResponse("Username already taken"),
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updateData = {
      username: username !== undefined ? username : currentUser.username,
      display_name: display_name !== undefined ? display_name : currentUser.display_name,
      profile_public: profile_public !== undefined ? profile_public : currentUser.profile_public,
    };

    userQueries.updateUserProfile(auth.user.userId, updateData);

    // Get updated user
    const updatedUser = userQueries.getUserById(auth.user.userId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Profile updated successfully", {
        user: {
          user_id: updatedUser!.user_id,
          username: updatedUser!.username,
          email: updatedUser!.email,
          display_name: updatedUser!.display_name,
          profile_public: updatedUser!.profile_public,
          registration_method: updatedUser!.registration_method,
          created_at: updatedUser!.created_at,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}