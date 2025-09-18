'use client';

import { useRouter } from 'next/navigation';
import UnitForm from '@/app/components/UnitForm';

export default function CreateUnitPage() {
  const router = useRouter();

  const handleUnitCreated = (unit: any) => {
    // Optionally redirect to units list
    console.log('Unit created:', unit);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <UnitForm onSubmit={handleUnitCreated} />
      </div>
    </div>
  );
}
