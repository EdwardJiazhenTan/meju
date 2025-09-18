import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ShoppingListItem {
  ingredient_id: number;
  ingredient_name: string;
  total_quantity: number;
  unit_id: number;
  unit_name: string;
  unit_abbreviation: string;
  category?: string;
  dishes: string[]; // List of dish names that use this ingredient
}

interface ShoppingListResponse {
  week_start: string;
  week_end: string;
  total_items: number;
  shopping_list: ShoppingListItem[];
  summary_by_category: Record<string, number>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');

    if (!startDate) {
      return NextResponse.json(
        { error: 'start_date parameter is required (YYYY-MM-DD format)' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Calculate end date (6 days after start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    // Get all ingredients from dishes in meal plans for the week
    const result = await query(
      `SELECT
        i.id as ingredient_id,
        i.name as ingredient_name,
        i.category as ingredient_category,
        di.quantity as dish_quantity,
        di.unit_id,
        iu.name as unit_name,
        iu.abbreviation as unit_abbreviation,
        mi.servings,
        d.name as dish_name,
        mp.date as meal_date,
        mp.meal_name
       FROM meal_plans mp
       JOIN meal_items mi ON mp.id = mi.meal_plan_id
       JOIN dishes d ON mi.dish_id = d.id
       JOIN dish_ingredients di ON d.id = di.dish_id
       JOIN ingredients i ON di.ingredient_id = i.id
       JOIN ingredient_units iu ON di.unit_id = iu.id
       WHERE mp.date >= $1 AND mp.date <= $2
       ORDER BY i.category ASC, i.name ASC`,
      [startDate, endDate]
    );

    const ingredientData = result.rows;

    if (ingredientData.length === 0) {
      return NextResponse.json({
        week_start: startDate,
        week_end: endDate,
        total_items: 0,
        shopping_list: [],
        summary_by_category: {},
      });
    }

    // Aggregate ingredients by ingredient_id and unit_id
    const aggregatedIngredients = new Map<string, ShoppingListItem>();

    ingredientData.forEach((row) => {
      const key = `${row.ingredient_id}-${row.unit_id}`;
      const totalQuantity = row.dish_quantity * row.servings;

      if (aggregatedIngredients.has(key)) {
        const existing = aggregatedIngredients.get(key)!;
        existing.total_quantity += totalQuantity;
        if (!existing.dishes.includes(row.dish_name)) {
          existing.dishes.push(row.dish_name);
        }
      } else {
        aggregatedIngredients.set(key, {
          ingredient_id: row.ingredient_id,
          ingredient_name: row.ingredient_name,
          total_quantity: totalQuantity,
          unit_id: row.unit_id,
          unit_name: row.unit_name,
          unit_abbreviation: row.unit_abbreviation,
          category: row.ingredient_category,
          dishes: [row.dish_name],
        });
      }
    });

    // Convert to array and sort
    const shoppingList = Array.from(aggregatedIngredients.values())
      .sort((a, b) => {
        // Sort by category first, then by ingredient name
        if (a.category !== b.category) {
          return (a.category || '').localeCompare(b.category || '');
        }
        return a.ingredient_name.localeCompare(b.ingredient_name);
      });

    // Create summary by category
    const summaryByCategory = shoppingList.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response: ShoppingListResponse = {
      week_start: startDate,
      week_end: endDate,
      total_items: shoppingList.length,
      shopping_list: shoppingList,
      summary_by_category: summaryByCategory,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { start_date, export_format = 'json' } = body;

    if (!start_date) {
      return NextResponse.json(
        { error: 'start_date is required' },
        { status: 400 }
      );
    }

    // Get the shopping list data using the same logic as GET
    const response = await fetch(`${request.nextUrl.origin}/api/shopping-list?start_date=${start_date}`);
    const shoppingListData = await response.json();

    if (!response.ok) {
      return NextResponse.json(shoppingListData, { status: response.status });
    }

    // Format for different export types
    let exportData;
    let contentType;
    let filename;

    switch (export_format) {
      case 'json':
        exportData = JSON.stringify(shoppingListData, null, 2);
        contentType = 'application/json';
        filename = `shopping-list-${start_date}.json`;
        break;

      case 'text':
        const textList = shoppingListData.shopping_list
          .map((item: ShoppingListItem) =>
            `• ${item.total_quantity} ${item.unit_abbreviation} ${item.ingredient_name} (for ${item.dishes.join(', ')})`
          )
          .join('\n');
        exportData = `Shopping List for Week of ${start_date}\n\n${textList}`;
        contentType = 'text/plain';
        filename = `shopping-list-${start_date}.txt`;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export format. Supported: json, text' },
          { status: 400 }
        );
    }

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to export shopping list' },
      { status: 500 }
    );
  }
}
