import { NextRequest, NextResponse } from "next/server";
import { userQueries, mealPlanQueries } from "@/lib/database";
import { AuthHelper } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, displayName } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Email and password are required"),
        { status: 400 }
      );
    }

    if (!AuthHelper.isValidEmail(email)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid email format"),
        { status: 400 }
      );
    }

    const passwordValidation = AuthHelper.isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        AuthHelper.createErrorResponse(passwordValidation.message!),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = userQueries.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("User with this email already exists"),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await AuthHelper.hashPassword(password);

    // Create user
    const userData = {
      username: username || null,
      email,
      password_hash: hashedPassword,
      display_name: displayName || null,
      registration_method: "email" as const,
    };

    const result = userQueries.createUser(userData);
    const userId = result.lastInsertRowid as number;

    // Initialize user's meal plan
    mealPlanQueries.initializeUserMealPlan(userId);

    // Generate JWT token
    const token = AuthHelper.generateToken({
      userId,
      email,
    });

    // Get created user
    const newUser = userQueries.getUserById(userId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse(
        "User registered successfully",
        {
          user: {
            user_id: newUser?.user_id,
            username: newUser?.username,
            email: newUser?.email,
            display_name: newUser?.display_name,
            profile_public: newUser?.profile_public,
            registration_method: newUser?.registration_method,
          },
        },
        token
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}