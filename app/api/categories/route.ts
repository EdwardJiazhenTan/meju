import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";
import { Category } from "@/types";

interface CreateCategoryData {
  name: string;
  display_order?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCategoryData = await request.json();

    const { name, display_order } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO categories (name, display_order)
       VALUES ($1, $2)
       RETURNING *`,
      [name, display_order],
    );

    const category = result.rows[0];

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result = await query(
      `SELECT c.*, COUNT(d.id) as dish_count
       FROM categories c
       LEFT JOIN dishes d ON c.id = d.category_id
       GROUP BY c.id, c.name, c.display_order, c.created_at
       ORDER BY c.display_order ASC, c.name ASC`,
    );

    const categories = result.rows;

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
