import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE } from '@/app/api/meal-plans/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/meal-plans', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/meal-plans', () => {
    it('should create a meal plan successfully', async () => {
      const mockMealPlan = {
        id: 1,
        date: '2025-09-08',
        meal_name: 'breakfast',
        created_at: '2025-09-08T08:00:00Z',
      };

      // Mock duplicate check (no existing meal plan)
      mockQuery.mockResolvedValueOnce({ rows: [] });
      // Mock meal plan creation
      mockQuery.mockResolvedValueOnce({ rows: [mockMealPlan] });

      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify({
          date: '2025-09-08',
          meal_name: 'breakfast',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.mealPlan).toEqual(mockMealPlan);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify({
          date: '2025-09-08',
          // missing meal_name
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Date and meal_name are required');
    });

    it('should return 400 for invalid date format', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify({
          date: '2025/09/08', // Invalid format
          meal_name: 'breakfast',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Date must be in YYYY-MM-DD format');
    });

    it('should return 409 for duplicate meal plan', async () => {
      // Mock duplicate check (existing meal plan found)
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'POST',
        body: JSON.stringify({
          date: '2025-09-08',
          meal_name: 'breakfast',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Meal plan already exists for this date and meal');
    });
  });

  describe('GET /api/meal-plans', () => {
    it('should fetch all meal plans', async () => {
      const mockMealPlans = [
        {
          id: 1,
          date: '2025-09-08',
          meal_name: 'breakfast',
          created_at: '2025-09-08T08:00:00Z',
        },
        {
          id: 2,
          date: '2025-09-08',
          meal_name: 'lunch',
          created_at: '2025-09-08T12:00:00Z',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockMealPlans });

      const request = new NextRequest('http://localhost/api/meal-plans');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mealPlans).toEqual(mockMealPlans);
    });

    it('should filter by date', async () => {
      const mockMealPlans = [
        {
          id: 1,
          date: '2025-09-08',
          meal_name: 'breakfast',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockMealPlans });

      const request = new NextRequest('http://localhost/api/meal-plans?date=2025-09-08');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND date = $1'),
        ['2025-09-08']
      );
    });

    it('should filter by meal_name', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans?meal_name=breakfast');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND meal_name = $1'),
        ['breakfast']
      );
    });
  });

  describe('PUT /api/meal-plans', () => {
    it('should update a meal plan successfully', async () => {
      const mockUpdatedMealPlan = {
        id: 1,
        date: '2025-09-09',
        meal_name: 'lunch',
        created_at: '2025-09-08T08:00:00Z',
      };

      // Mock existence check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock update
      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedMealPlan] });

      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          date: '2025-09-09',
          meal_name: 'lunch',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mealPlan).toEqual(mockUpdatedMealPlan);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 404 for non-existent meal plan', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans', {
        method: 'PUT',
        body: JSON.stringify({
          id: 999,
          date: '2025-09-09',
        }),
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal plan not found');
    });
  });

  describe('DELETE /api/meal-plans', () => {
    it('should delete a meal plan successfully', async () => {
      // Mock existence check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock delete
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans?id=1');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Meal plan deleted successfully');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 400 for missing ID', async () => {
      const request = new NextRequest('http://localhost/api/meal-plans');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Meal plan ID is required');
    });

    it('should return 404 for non-existent meal plan', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/meal-plans?id=999');
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Meal plan not found');
    });
  });
});