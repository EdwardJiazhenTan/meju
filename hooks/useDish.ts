import { useState, useEffect, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { 
  DishData, 
  DishDetail,
  DishIngredient,
  ApiResponse, 
  DishApiResponse, 
  IngredientsApiResponse, 
  TagsApiResponse 
} from '@/types/dish';

interface UseDishReturn {
  data: DishData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDish = (dishId: string): UseDishReturn => {
  // State management for the hook
  const [data, setData] = useState<DishData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDishData = useCallback(async () => {
    try {
      // Reset states at start of fetch
      setLoading(true);
      setError(null);
      
      // Step 1: Validate dishId parameter
      const dishIdNum = parseInt(dishId);
      if (isNaN(dishIdNum) || dishIdNum <= 0) {
        throw new Error('Invalid dish ID provided');
      }
      
      // Step 2: Make parallel API calls for performance using ApiClient
      // This fetches all dish-related data simultaneously with proper authentication
      const [dishResult, ingredientsResult, tagsResult] = await Promise.all([
        ApiClient.getDishById(dishIdNum),
        ApiClient.getDishIngredients(dishIdNum),
        ApiClient.getDishTags(dishIdNum),
      ]);
      
      // Step 3: Handle primary dish response first (most critical)
      if (!dishResult.success) {
        throw new Error(dishResult.message || 'Failed to load dish information');
      }
      
      if (!dishResult.data?.dish) {
        throw new Error('Invalid dish data received');
      }
      
      const dish: DishDetail = dishResult.data.dish;
      
      // Step 4: Handle ingredients response (non-critical)
      let ingredients: DishIngredient[] = [];
      if (ingredientsResult.success && ingredientsResult.data?.ingredients) {
        ingredients = ingredientsResult.data.ingredients;
      }
      
      // Step 5: Handle tags response (non-critical)
      let tags: string[] = [];
      if (tagsResult.success && tagsResult.data?.tags) {
        tags = tagsResult.data.tags;
      }
      
      // Combine all data into final structure
      const combinedData: DishData = {
        dish,
        ingredients,
        tags,
      };
      
      // Update state with successful data
      setData(combinedData);
      
    } catch (err) {
      // Handle any errors that occurred during the process
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setData(null); // Clear any stale data
    } finally {
      // Always set loading to false, regardless of success or failure
      setLoading(false);
    }
  }, [dishId]);

  // Refetch function for manual refreshing (useful for error recovery)
  const refetch = () => {
    fetchDishData();
  };

  // Effect hook to trigger data fetching when dishId changes
  useEffect(() => {
    // Only fetch if we have a valid dishId
    if (dishId) {
      fetchDishData();
    } else {
      // Handle case where dishId is empty or invalid
      setError('No dish ID provided');
      setLoading(false);
    }
  }, [dishId, fetchDishData]); // Re-run when dishId or fetchDishData changes

  // Return the hook's public interface
  return { 
    data, 
    loading, 
    error, 
    refetch 
  };
};