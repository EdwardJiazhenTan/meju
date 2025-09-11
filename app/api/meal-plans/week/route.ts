import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { MealPlan, MealItem } from '@/types/database';

interface WeeklyMealPlan {
  week_start: string;
  days: Record<string, Record<string, MealPlanWithItems>>;
}

interface MealPlanWithItems {
  id: number;
  meal_name: string; // breakfast, lunch, dinner
  date: string;
  created_at: string;
  items: MealItemWithDish[];
}

interface MealItemWithDish {
  id: number; // meal_item.id
  dish_id: number;
  dish_name: string;
  servings: number;
  customizations?: Record<string, any>; // JSONB data
  notes?: string;
  base_calories?: number;
  preparation_time?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');

    if (!startDate) {
      return NextResponse.json(
        { error: 'start date of the week not found' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    const queryText = `
      SELECT 
        mp.id as meal_plan_id,
        mp.date,
        mp.meal_name,
        mp.created_at as meal_plan_created_at,
        mi.id as meal_item_id,
        mi.dish_id,
        mi.servings,
        mi.customizations,
        mi.notes,
        d.name as dish_name,
        d.base_calories,
        d.preparation_time
      FROM meal_plans mp
      LEFT JOIN meal_items mi ON mp.id = mi.meal_plan_id
      LEFT JOIN dishes d ON mi.dish_id = d.id
      WHERE mp.date >= $1 AND mp.date <= $2
      ORDER BY mp.date ASC, mp.meal_name ASC, d.name ASC
    `;

    const result = await query(queryText, [startDate, endDate]);
    const rows = result.rows;


    const weeklyData: WeeklyMealPlan = {
      week_start: startDate,
      days: {}
    };

    rows.forEach((row: any) => {
      const dateStr = row.date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

      if (!weeklyData.days[dateStr]) {
        weeklyData.days[dateStr] = {};
      }

      if (!weeklyData.days[dateStr][row.meal_name]) {
        weeklyData.days[dateStr][row.meal_name] = {
          id: row.meal_plan_id,
          meal_name: row.meal_name,
          date: dateStr,
          created_at: row.meal_plan_created_at,
          items: []
        };
      }

      // Add meal item to the meal's items array (if dish exists)
      if (row.dish_id) {
        const mealItem: MealItemWithDish = {
          id: row.meal_item_id,
          dish_id: row.dish_id,
          dish_name: row.dish_name,
          servings: row.servings,
          customizations: row.customizations,
          notes: row.notes,
          base_calories: row.base_calories,
          preparation_time: row.preparation_time
        };
        
        weeklyData.days[dateStr][row.meal_name].items.push(mealItem);
      }
    });

    return NextResponse.json({
      weeklyMealPlan: weeklyData
    });

  } catch (error) {
    console.error('Error fetching weekly meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly meal plan' },
      { status: 500 }
    );
  }
}
