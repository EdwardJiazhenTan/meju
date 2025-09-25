import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";

interface UpdateCategoryData {
  name?: string;
  display_order?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = parseInt(params.categoryId);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT c.*, COUNT(d.id) as dish_count
       FROM categories c
       LEFT JOIN dishes d ON c.id = d.category_id
       WHERE c.id = $1
       GROUP BY c.id, c.name, c.display_order, c.created_at`,
      [categoryId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const category = result.rows[0];

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = parseInt(params.categoryId);
    const body: UpdateCategoryData = await request.json();

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    const { name, display_order } = body;

    // Check if category exists
    const existingResult = await query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates = [];
    const params: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      params.push(name);
    }

    if (display_order !== undefined) {
      paramCount++;
      updates.push(`display_order = $${paramCount}`);
      params.push(display_order);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    paramCount++;
    params.push(categoryId);

    const result = await query(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    const category = result.rows[0];

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const categoryId = parseInt(params.categoryId);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingResult = await query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has dishes
    const dishCheck = await query(
      "SELECT COUNT(*) as dish_count FROM dishes WHERE category_id = $1",
      [categoryId]
    );

    const dishCount = parseInt(dishCheck.rows[0].dish_count);

    if (dishCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It contains ${dishCount} dish${dishCount !== 1 ? 'es' : ''}. Please move or delete the dishes first.`
        },
        { status: 409 }
      );
    }

    // Delete category
    await query("DELETE FROM categories WHERE id = $1", [categoryId]);

    return NextResponse.json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
