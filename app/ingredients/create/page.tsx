'use client';

import { useRouter } from 'next/navigation';
import IngredientForm from '@/app/components/IngredientForm';

export default function CreateIngredientPage() {
  const router = useRouter();

  const handleIngredientCreated = (ingredient: any) => {
    // Optionally redirect to ingredients list
    console.log('Ingredient created:', ingredient);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <IngredientForm onSubmit={handleIngredientCreated} />
      </div>
    </div>
  );
}
