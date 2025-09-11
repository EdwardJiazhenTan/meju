'use client';

interface DishIngredientWithDetails {
  id: number;
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional: boolean;
  ingredient_name: string;
  unit_name: string;
  unit_abbreviation: string;
  calories_per_unit?: number;
  ingredient_category?: string;
}

interface IngredientListProps {
  ingredients: DishIngredientWithDetails[];
  onRemove?: (ingredientId: number) => void;
  loading?: boolean;
  title?: string;
}

export default function IngredientList({
  ingredients,
  onRemove,
  loading = false,
  title = "Ingredients"
}: IngredientListProps) {
  const calculateTotalCalories = () => {
    return ingredients.reduce((total, ingredient) => {
      if (ingredient.calories_per_unit) {
        return total + (ingredient.calories_per_unit * ingredient.quantity);
      }
      return total;
    }, 0);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">{title}</h4>
        <span className="text-sm text-gray-500">
          {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {loading && (
        <div className="text-center py-4 text-gray-500">Loading ingredients...</div>
      )}
      
      {!loading && ingredients.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No ingredients added yet
        </div>
      )}
      
      {!loading && ingredients.length > 0 && (
        <>
          <div className="space-y-2 mb-4">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{ingredient.ingredient_name}</span>
                    {ingredient.is_optional && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                    {ingredient.ingredient_category && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {ingredient.ingredient_category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {ingredient.quantity} {ingredient.unit_abbreviation || ingredient.unit_name}
                    {ingredient.calories_per_unit && (
                      <span className="ml-2">
                        (~{Math.round(ingredient.calories_per_unit * ingredient.quantity)} cal)
                      </span>
                    )}
                  </div>
                </div>
                
                {onRemove && (
                  <button
                    onClick={() => onRemove(ingredient.ingredient_id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove ingredient"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Total Calories */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Estimated Total Calories:</span>
              <span className="font-medium text-green-600">
                {Math.round(calculateTotalCalories())} cal
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Based on ingredient calorie data where available
            </p>
          </div>
        </>
      )}
    </div>
  );
}