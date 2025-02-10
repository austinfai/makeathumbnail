import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Not Found</h2>
        <p className="mt-2 text-gray-600">Could not find the requested resource</p>
      </div>
    </div>
  );
} 