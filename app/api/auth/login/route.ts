import { NextRequest, NextResponse } from "next/server";
import { userQueries } from "@/lib/database";
import { AuthHelper } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    // Find user
    const user = userQueries.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid email or password"),
        { status: 401 }
      );
    }

    // Check if user registered with email (has password)
    if (user.registration_method !== "email" || !user.password_hash) {
      return NextResponse.json(
        AuthHelper.createErrorResponse(
          `This account was created with ${user.registration_method}. Please use ${user.registration_method} to sign in.`
        ),
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await AuthHelper.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid email or password"),
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = AuthHelper.generateToken({
      userId: user.user_id,
      email: user.email,
    });

    return NextResponse.json(
      AuthHelper.createSuccessResponse(
        "Login successful",
        {
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            display_name: user.display_name,
            profile_public: user.profile_public,
            registration_method: user.registration_method,
          },
        },
        token
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}