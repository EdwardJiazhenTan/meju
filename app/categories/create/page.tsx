'use client';

import { useRouter } from 'next/navigation';
import CategoryForm from '@/app/components/CategoryForm';

export default function CreateCategoryPage() {
  const router = useRouter();

  const handleCategoryCreated = (category: any) => {
    // Optionally redirect to categories list
    console.log('Category created:', category);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <CategoryForm onSubmit={handleCategoryCreated} />
      </div>
    </div>
  );
}
