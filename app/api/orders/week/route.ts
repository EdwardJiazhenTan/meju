import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface WeeklyOrders {
  week_start: string;
  days: Record<string, Record<string, OrderGroup[]>>;
}

interface OrderGroup {
  dish_name: string;
  orders: OrderDetails[];
  total_people: number;
  total_orders: number;
}

interface OrderDetails {
  id: number;
  user_name: string;
  people_count: number;
  notes?: string;
  status: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');

    if (!startDate) {
      return NextResponse.json(
        { error: 'start_date parameter is required' },
        { status: 400 }
      );
    }

    // Calculate end date (6 days after start)
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    // Fetch all orders for the week
    const queryText = `
      SELECT
        id,
        user_name,
        order_date,
        meal_type,
        dish_name,
        people_count,
        notes,
        status,
        created_at
      FROM orders
      WHERE order_date >= $1 AND order_date <= $2
      ORDER BY order_date ASC, meal_type ASC, dish_name ASC, created_at ASC
    `;

    const result = await query(queryText, [startDate, endDate]);
    const orders = result.rows;

    // Group orders by date, meal type, and dish
    const weeklyData: WeeklyOrders = {
      week_start: startDate,
      days: {}
    };

    orders.forEach((order: any) => {
      const dateStr = order.order_date.toISOString().split('T')[0];
      const mealType = order.meal_type;
      const dishName = order.dish_name;

      // Initialize date if not exists
      if (!weeklyData.days[dateStr]) {
        weeklyData.days[dateStr] = {};
      }

      // Initialize meal type if not exists
      if (!weeklyData.days[dateStr][mealType]) {
        weeklyData.days[dateStr][mealType] = [];
      }

      // Find existing dish group or create new one
      let dishGroup = weeklyData.days[dateStr][mealType].find(
        group => group.dish_name === dishName
      );

      if (!dishGroup) {
        dishGroup = {
          dish_name: dishName,
          orders: [],
          total_people: 0,
          total_orders: 0
        };
        weeklyData.days[dateStr][mealType].push(dishGroup);
      }

      // Add order to dish group
      const orderDetails: OrderDetails = {
        id: order.id,
        user_name: order.user_name,
        people_count: order.people_count,
        notes: order.notes,
        status: order.status,
        created_at: order.created_at
      };

      dishGroup.orders.push(orderDetails);
      dishGroup.total_people += order.people_count;
      dishGroup.total_orders += 1;
    });

    return NextResponse.json({
      weeklyOrders: weeklyData
    });

  } catch (error) {
    console.error('Error fetching weekly orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly orders' },
      { status: 500 }
    );
  }
}
