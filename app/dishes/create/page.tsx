'use client';

import { useRouter } from 'next/navigation';
import DishForm from '@/app/components/DishForm';

export default function CreateDishPage() {
  const router = useRouter();

  const handleDishCreated = (dish: any) => {
    // Optionally redirect to view the created dish or dishes list
    router.push('/dishes');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <DishForm onSubmit={handleDishCreated} />
      </div>
    </div>
  );
}
