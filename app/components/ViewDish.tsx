
import { Dish } from '@/types';

interface ViewDishProps {
  dish: Dish & { category_name?: string };
}

export default function ViewDish({ dish }: ViewDishProps) {
  const {
    name,
    cooking_steps,
    category_id,
    base_calories,
    preparation_time,
    servings,
    is_customizable,
  } = dish;

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{name}</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
            {servings} serving{servings !== 1 ? 's' : ''}
          </span>
          {base_calories && (
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
              {base_calories} calories
            </span>
          )}
          {preparation_time && (
            <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
              {preparation_time} min
            </span>
          )}
          {dish.category_name && (
            <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
              {dish.category_name}
            </span>
          )}
          {is_customizable && (
            <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
              Customizable
            </span>
          )}
        </div>
      </div>

      {cooking_steps && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Cooking Steps</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{cooking_steps}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
        {category_id && (
          <div>
            <span className="font-medium">Category ID:</span> {category_id}
          </div>
        )}
        <div>
          <span className="font-medium">Created:</span>{' '}
          {dish.created_at ? new Date(dish.created_at).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}

