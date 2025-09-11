import { NextRequest } from 'next/server';
import { GET } from '@/app/api/meal-plans/week/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/meal-plans/week', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/meal-plans/week', () => {
    it('should return weekly meal plan structure', async () => {
      const mockRows = [
        {
          meal_plan_id: 1,
          date: new Date('2025-09-08'),
          meal_name: 'breakfast',
          meal_plan_created_at: '2025-09-08T08:00:00Z',
          meal_item_id: 1,
          dish_id: 5,
          servings: 1,
          customizations: null,
          notes: null,
          dish_name: 'Oatmeal',
          base_calories: 300,
          preparation_time: 10,
        },
        {
          meal_plan_id: 1,
          date: new Date('2025-09-08'),
          meal_name: 'breakfast',
          meal_plan_created_at: '2025-09-08T08:00:00Z',
          meal_item_id: 2,
          dish_id: 8,
          servings: 0.5,
          customizations: { fruit: { selected: true } },
          notes: 'with berries',
          dish_name: 'Fruit Salad',
          base_calories: 150,
          preparation_time: 5,
        },
        {
          meal_plan_id: 2,
          date: new Date('2025-09-08'),
          meal_name: 'lunch',
          meal_plan_created_at: '2025-09-08T12:00:00Z',
          meal_item_id: 3,
          dish_id: 10,
          servings: 1,
          customizations: null,
          notes: null,
          dish_name: 'Chicken Sandwich',
          base_calories: 450,
          preparation_time: 15,
        },
        {
          meal_plan_id: 3,
          date: new Date('2025-09-09'),
          meal_name: 'breakfast',
          meal_plan_created_at: '2025-09-09T08:00:00Z',
          meal_item_id: null, // Empty meal plan
          dish_id: null,
          servings: null,
          customizations: null,
          notes: null,
          dish_name: null,
          base_calories: null,
          preparation_time: null,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-09-08');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weeklyMealPlan).toEqual({
        week_start: '2025-09-08',
        days: {
          '2025-09-08': {
            breakfast: {
              id: 1,
              meal_name: 'breakfast',
              date: '2025-09-08',
              created_at: '2025-09-08T08:00:00Z',
              items: [
                {
                  id: 1,
                  dish_id: 5,
                  dish_name: 'Oatmeal',
                  servings: 1,
                  customizations: null,
                  notes: null,
                  base_calories: 300,
                  preparation_time: 10,
                },
                {
                  id: 2,
                  dish_id: 8,
                  dish_name: 'Fruit Salad',
                  servings: 0.5,
                  customizations: { fruit: { selected: true } },
                  notes: 'with berries',
                  base_calories: 150,
                  preparation_time: 5,
                },
              ],
            },
            lunch: {
              id: 2,
              meal_name: 'lunch',
              date: '2025-09-08',
              created_at: '2025-09-08T12:00:00Z',
              items: [
                {
                  id: 3,
                  dish_id: 10,
                  dish_name: 'Chicken Sandwich',
                  servings: 1,
                  customizations: null,
                  notes: null,
                  base_calories: 450,
                  preparation_time: 15,
                },
              ],
            },
          },
          '2025-09-09': {
            breakfast: {
              id: 3,
              meal_name: 'breakfast',
              date: '2025-09-09',
              created_at: '2025-09-09T08:00:00Z',
              items: [],
            },
          },
        },
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE mp.date >= $1 AND mp.date <= $2'),
        ['2025-09-08', '2025-09-14']
      );
    });

    it('should return empty weekly structure for no meal plans', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-09-08');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weeklyMealPlan).toEqual({
        week_start: '2025-09-08',
        days: {},
      });
    });

    it('should return 400 for missing start_date', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans/week');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('start date of the week not found');
    });

    it('should calculate correct end date', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-09-08');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['2025-09-08', '2025-09-14'] // start_date + 6 days
      );
    });

    it('should handle different start dates correctly', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-12-29');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['2025-12-29', '2026-01-04'] // Cross year boundary
      );
    });

    it('should handle meal plans with complex customizations', async () => {
      const complexCustomizations = {
        protein: { option_id: 1, selected: true, quantity: 200 },
        vegetables: { option_id: 3, selected: true, quantity: 150 },
        spice_level: { option_id: 7, selected: true, level: 'medium' },
      };

      const mockRows = [
        {
          meal_plan_id: 1,
          date: new Date('2025-09-08'),
          meal_name: 'dinner',
          meal_plan_created_at: '2025-09-08T18:00:00Z',
          meal_item_id: 1,
          dish_id: 15,
          servings: 2,
          customizations: complexCustomizations,
          notes: 'For family dinner',
          dish_name: 'Custom Stir Fry',
          base_calories: 500,
          preparation_time: 25,
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockRows });

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-09-08');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.weeklyMealPlan.days['2025-09-08'].dinner.items[0].customizations).toEqual(complexCustomizations);
      expect(data.weeklyMealPlan.days['2025-09-08'].dinner.items[0].notes).toBe('For family dinner');
      expect(data.weeklyMealPlan.days['2025-09-08'].dinner.items[0].servings).toBe(2);
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost/api/meal-plans/week?start_date=2025-09-08');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch weekly meal plan');
    });
  });
});