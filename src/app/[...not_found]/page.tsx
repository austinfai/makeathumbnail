'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundCatchAll() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404 - Not Found</h1>
        <p className="mt-4 text-lg text-gray-600">Redirecting to home page...</p>
      </div>
    </div>
  );
} 