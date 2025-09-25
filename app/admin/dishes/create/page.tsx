'use client';

import { useRouter } from 'next/navigation';
import DishForm from '@/app/components/DishForm';
import Link from 'next/link';

export default function CreateDishPage() {
  const router = useRouter();

  const handleDishCreated = (dish: any) => {
    // Redirect to dishes management page after creation
    router.push('/admin/dishes');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Dish</h1>
            <p className="text-gray-600 mt-1">Add a new dish to your menu</p>
          </div>
          <Link
            href="/admin/dishes"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Dishes
          </Link>
        </div>

        <DishForm onSubmit={handleDishCreated} />
      </div>
    </div>
  );
}
