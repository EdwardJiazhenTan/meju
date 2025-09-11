import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '@/app/api/meal-plans/[planId]/items/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/meal-plans/[planId]/items', () => {
  const params = { planId: '1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/meal-plans/[planId]/items', () => {
    it('should add meal item successfully', async () => {
      const mockMealItem = {
        id: 1,
        meal_plan_id: 1,
        dish_id: 5,
        servings: 1.5,
        customizations: null,
        notes: 'extra spicy',
      };

      // Mock meal plan exists check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock dish exists check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] });
      // Mock meal item creation
      mockQuery.mockResolvedValueOnce({ rows: [mockMealItem] });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'POST',
        body: JSON.stringify({
          dish_id: 5,
          servings: 1.5,
          notes: 'extra spicy',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.mealItem).toEqual(mockMealItem);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should handle customizations correctly', async () => {
      const customizations = {
        protein: { option_id: 1, selected: true, quantity: 200 },
        vegetables: { option_id: 2, selected: true, quantity: 100 },
      };

      // Mock checks
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // meal plan exists
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 5 }] }); // dish exists
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // creation

      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'POST',
        body: JSON.stringify({
          dish_id: 5,
          servings: 1,
          customizations,
        }),
      });

      const response = await POST(request, { params });

      expect(response.status).toBe(201);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO meal_items'),
        [1, 5, 1, JSON.stringify(customizations), undefined]
      );
    });

    it('should return 400 for missing dish_id', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'POST',
        body: JSON.stringify({
          servings: 1,
        }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('dish_id is required');
    });

    it('should return 404 for non-existent meal plan', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] }); // meal plan not found

      const request = new NextRequest('http://localhost/api/meal-plans/999/items', {
        method: 'POST',
        body: JSON.stringify({
          dish_id: 5,
        }),
      });

      const response = await POST(request, { params: { planId: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal plan not found');
    });

    it('should return 404 for non-existent dish', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // meal plan exists
      mockQuery.mockResolvedValueOnce({ rows: [] }); // dish not found

      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'POST',
        body: JSON.stringify({
          dish_id: 999,
        }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Dish not found');
    });
  });

  describe('GET /api/meal-plans/[planId]/items', () => {
    it('should fetch meal items with dish details', async () => {
      const mockMealItems = [
        {
          id: 1,
          meal_plan_id: 1,
          dish_id: 5,
          servings: 1.5,
          customizations: null,
          notes: 'extra spicy',
          dish_name: 'Chicken Curry',
          base_calories: 400,
          preparation_time: 30,
          category_id: 2,
          category_name: 'Main Course',
        },
        {
          id: 2,
          meal_plan_id: 1,
          dish_id: 8,
          servings: 1,
          customizations: { vegetables: { selected: true } },
          notes: null,
          dish_name: 'Rice',
          base_calories: 200,
          preparation_time: 15,
          category_id: 3,
          category_name: 'Sides',
        },
      ];

      // Mock meal plan exists check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock meal items fetch
      mockQuery.mockResolvedValueOnce({ rows: mockMealItems });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mealItems).toEqual(mockMealItems);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('JOIN dishes d ON mi.dish_id = d.id'),
        [1]
      );
    });

    it('should return 404 for non-existent meal plan', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/999/items');
      const response = await GET(request, { params: { planId: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal plan not found');
    });
  });

  describe('PUT /api/meal-plans/[planId]/items', () => {
    it('should update meal item successfully', async () => {
      const mockUpdatedItem = {
        id: 1,
        meal_plan_id: 1,
        dish_id: 5,
        servings: 2,
        customizations: { spice_level: 'hot' },
        notes: 'updated notes',
      };

      // Mock existence check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock update
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedItem] });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          servings: 2,
          customizations: { spice_level: 'hot' },
          notes: 'updated notes',
        }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mealItem).toEqual(mockUpdatedItem);
    });

    it('should return 404 for non-existent meal item', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items', {
        method: 'PUT',
        body: JSON.stringify({
          id: 999,
          servings: 2,
        }),
      });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal item not found');
    });
  });

  describe('DELETE /api/meal-plans/[planId]/items', () => {
    it('should delete meal item successfully', async () => {
      // Mock existence check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock delete
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items?item_id=1');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Meal item removed successfully');
      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM meal_items WHERE id = $1', [1]);
    });

    it('should return 400 for missing item_id', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans/1/items');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('item_id parameter is required');
    });

    it('should return 404 for non-existent meal item', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans/1/items?item_id=999');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal item not found');
    });
  });
});