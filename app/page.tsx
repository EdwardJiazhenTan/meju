import Link from 'next/link';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Meal Planner
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Plan your weekly meals and generate shopping lists
        </p>
        <div className="space-y-4">
          <Link 
            href="/test"
            className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Dish Creation
          </Link>
          <Link 
            href="/test/categories"
            className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Categories
          </Link>
          <Link 
            href="/test/ingredients"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Ingredients
          </Link>
          <Link 
            href="/meal-plan"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Weekly Meal Plan
          </Link>
          <Link 
            href="/shopping-list"
            className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Shopping List
          </Link>
        </div>
      </div>
    </div>
  );
};

