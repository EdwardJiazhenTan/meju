import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_name = searchParams.get("user_name");

    if (!user_name) {
      return NextResponse.json(
        { error: "user_name parameter is required" },
        { status: 400 },
      );
    }

    // Check if user has placed orders before
    const result = await query(
      "SELECT DISTINCT user_name, COUNT(*) as order_count, MAX(created_at) as last_order FROM orders WHERE LOWER(user_name) = LOWER($1) GROUP BY user_name",
      [user_name.trim()]
    );

    const userExists = result.rows.length > 0;
    const userData = userExists ? result.rows[0] : null;

    return NextResponse.json({
      exists: userExists,
      user_data: userData ? {
        user_name: userData.user_name,
        order_count: parseInt(userData.order_count),
        last_order: userData.last_order
      } : null
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      { error: "Failed to check user" },
      { status: 500 },
    );
  }
}
